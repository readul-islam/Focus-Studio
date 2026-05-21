import logging

import openai
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from collaboration.file_utils import (
    IMAGE_EXTENSIONS,
    MAX_ATTACHMENT_BYTES,
    extension_from_name,
)
from users.permissions import DesignViewPermission, check_role_permission
from .models import DesignSession, DesignMessage
from .serializers import (
    DesignSessionSerializer,
    DesignSessionCreateSerializer,
    DesignMessageSerializer,
    DesignAssetSerializer,
)
from . import ai

logger = logging.getLogger(__name__)


def _require_studio(user):
    if not getattr(user, 'studio_id', None):
        return None
    return user.studio


def _validate_sketch_files(files):
    """Return list of valid image uploads or raise via Response."""
    valid = []
    for f in files:
        if f.size > MAX_ATTACHMENT_BYTES:
            return None, f'File {f.name} exceeds 25MB limit.'
        ext = extension_from_name(f.name)
        if ext not in IMAGE_EXTENSIONS and not (f.content_type or '').startswith('image/'):
            return None, f'File {f.name} is not a supported image.'
        valid.append(f)
    return valid, None


class DesignSessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, DesignViewPermission]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        studio = _require_studio(self.request.user)
        if not studio:
            return DesignSession.objects.none()
        return DesignSession.objects.filter(
            studio=studio,
            user=self.request.user,
        ).prefetch_related('messages')

    def get_serializer_class(self):
        if self.action == 'create':
            return DesignSessionCreateSerializer
        return DesignSessionSerializer

    def perform_create(self, serializer):
        serializer.save(
            studio=self.request.user.studio,
            user=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        session = self.get_object()
        msgs = session.messages.select_related('asset').all()
        serializer = DesignMessageSerializer(msgs, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def design_chat(request):
    """Text follow-up in an existing design session."""
    if not check_role_permission(request.user, 'design.view'):
        return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
    if not check_role_permission(request.user, 'design.edit'):
        return Response({'error': 'You do not have permission to use Design chat.'}, status=status.HTTP_403_FORBIDDEN)

    studio = _require_studio(request.user)
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    session_id = request.data.get('session_id')
    message = (request.data.get('message') or '').strip()
    if not session_id or not message:
        return Response({'error': 'session_id and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

    session = get_object_or_404(
        DesignSession,
        id=session_id,
        studio=studio,
        user=request.user,
    )

    DesignMessage.objects.create(session=session, role='user', content=message)

    history = [
        {'role': m.role, 'content': m.content}
        for m in session.messages.order_by('created_at')
    ]

    try:
        reply = ai.chat_followup(history, message, session.design_type)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception:
        logger.exception('design_chat failed')
        return Response({'error': 'AI service unavailable. Try again later.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    DesignMessage.objects.create(session=session, role='assistant', content=reply)
    session.save(update_fields=['updated_at'])

    return Response({'reply': reply})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def design_generate(request):
    """Generate a design image from prompt + optional sketches."""
    if not check_role_permission(request.user, 'design.edit'):
        return Response({'error': 'You do not have permission to generate designs.'}, status=status.HTTP_403_FORBIDDEN)

    studio = _require_studio(request.user)
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    session_id = request.data.get('session_id')
    prompt = (request.data.get('prompt') or '').strip()
    design_type = request.data.get('design_type', 'interior')
    if design_type not in ('interior', 'exterior'):
        design_type = 'interior'

    if not session_id:
        return Response({'error': 'session_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    session = get_object_or_404(
        DesignSession,
        id=session_id,
        studio=studio,
        user=request.user,
    )

    files = request.FILES.getlist('files') or request.FILES.getlist('files[]')
    if not prompt and not files:
        return Response({'error': 'Provide a prompt or upload at least one sketch.'}, status=status.HTTP_400_BAD_REQUEST)

    valid_files, err = _validate_sketch_files(files)
    if err:
        return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
    files = valid_files or []

    user_content = prompt or 'Generate a design from the uploaded sketch.'
    DesignMessage.objects.create(session=session, role='user', content=user_content)

    try:
        if files:
            brief = ai.analyze_sketches(files, prompt, design_type)
        else:
            brief = prompt

        image_prompt = ai.build_image_prompt(brief, design_type, prompt)
        image_bytes = ai.generate_design_image(image_prompt)

        sketch_for_save = files[0] if files else None
        if sketch_for_save:
            sketch_for_save.seek(0)

        asset, assistant_text = ai.save_generated_image(
            session,
            image_bytes,
            image_prompt,
            sketch_file=sketch_for_save,
        )
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except openai.APIError as e:
        logger.exception('design_generate OpenAI error')
        msg = getattr(e, 'message', None) or str(e)
        return Response({'error': f'Image generation failed: {msg}'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception:
        logger.exception('design_generate failed')
        return Response({'error': 'Image generation failed. Please try again.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    session.design_type = design_type
    session.save(update_fields=['design_type', 'updated_at'])

    asset_data = DesignAssetSerializer(asset, context={'request': request}).data

    return Response({
        'reply': assistant_text,
        'asset_id': asset.id,
        'image_url': asset_data.get('image_url'),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def design_asset_detail(request, asset_id):
    """Return asset metadata for share/download flows."""
    if not check_role_permission(request.user, 'design.view'):
        return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    studio = _require_studio(request.user)
    if not studio:
        return Response({'error': 'No studio found.'}, status=status.HTTP_400_BAD_REQUEST)

    from .models import DesignAsset
    asset = get_object_or_404(
        DesignAsset,
        id=asset_id,
        session__studio=studio,
        session__user=request.user,
    )
    return Response(DesignAssetSerializer(asset, context={'request': request}).data)
