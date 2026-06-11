import io
import uuid

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from techstyles.mixins import StudioScopedMixin
from users.permissions import PresentationsViewPermission, check_role_permission
from .models import Presentation, PresentationSlide, PresentationPin, PresentationComment
from .serializers import (
    PresentationListSerializer,
    PresentationDetailSerializer,
    PresentationCreateSerializer,
    PresentationSlideSerializer,
    PresentationPinSerializer,
    PresentationCommentSerializer,
    SlideReorderSerializer,
    PublishPresentationSerializer,
    PublicPresentationSerializer,
)
from .templates import list_presentation_templates


class PresentationViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, PresentationsViewPermission]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        qs = Presentation.objects.filter(studio=self.request.user.studio).select_related(
            'project', 'created_by'
        ).prefetch_related('slides')
        project_id = self.request.query_params.get('project_id')
        if project_id:
            qs = qs.filter(project_id=project_id)
        q = self.request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(title__icontains=q)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return PresentationCreateSerializer
        if self.action == 'retrieve':
            return PresentationDetailSerializer
        return PresentationListSerializer

    def perform_create(self, serializer):
        serializer.save(
            studio=self.request.user.studio,
            created_by=self.request.user,
        )

    @action(detail=False, methods=['get'], url_path='templates')
    def templates(self, request):
        """List built-in presentation deck templates for the create dialog."""
        return Response(list_presentation_templates())

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        original = self.get_object()
        copy = Presentation.objects.create(
            studio=original.studio,
            project=original.project,
            title=f'{original.title} (Copy)',
            created_by=request.user,
            show_product_pricing=original.show_product_pricing,
            show_supplier_info=original.show_supplier_info,
        )
        for slide in original.slides.all():
            new_slide = PresentationSlide.objects.create(
                presentation=copy,
                order=slide.order,
                title=slide.title,
                background_color=slide.background_color,
                background_src=slide.background_src,
                canvas_data=slide.canvas_data,
            )
            if slide.background_image:
                new_slide.background_image = slide.background_image
                new_slide.save(update_fields=['background_image'])
            for pin in slide.pins.all():
                PresentationPin.objects.create(
                    slide=new_slide,
                    pin_type=pin.pin_type,
                    product=pin.product,
                    design_asset=pin.design_asset,
                    x=pin.x,
                    y=pin.y,
                    label=pin.label,
                    show_pricing=pin.show_pricing,
                )
        serializer = PresentationDetailSerializer(copy, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post', 'patch'])
    def publish(self, request, pk=None):
        if not check_role_permission(request.user, 'presentations.share'):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        presentation = self.get_object()
        ser = PublishPresentationSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        for field, value in ser.validated_data.items():
            setattr(presentation, field, value)
        if ser.validated_data.get('web_published') and not presentation.public_token:
            presentation.public_token = uuid.uuid4()
        presentation.save()
        return Response(PresentationListSerializer(presentation, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def export_pdf(self, request, pk=None):
        """Placeholder PDF export — returns slide count metadata for client-side export."""
        presentation = self.get_object()
        slides = presentation.slides.all()
        return Response({
            'presentation_id': presentation.id,
            'title': presentation.title,
            'slide_count': slides.count(),
            'message': 'Use client-side export for PDF generation.',
        })


class PresentationSlideViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, PresentationsViewPermission]
    serializer_class = PresentationSlideSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        studio = getattr(self.request.user, 'studio', None)
        if not studio:
            return PresentationSlide.objects.none()
        qs = PresentationSlide.objects.filter(
            presentation__studio=studio
        ).prefetch_related('pins', 'comments')
        presentation_id = self.request.query_params.get('presentation_id')
        if presentation_id:
            qs = qs.filter(presentation_id=presentation_id)
        return qs

    def perform_create(self, serializer):
        presentation_id = self.request.data.get('presentation')
        presentation = get_object_or_404(
            Presentation, id=presentation_id, studio=self.request.user.studio
        )
        max_order = presentation.slides.order_by('-order').values_list('order', flat=True).first()
        order = (max_order + 1) if max_order is not None else 0
        serializer.save(order=order)

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        ser = SlideReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        slide_ids = ser.validated_data['slide_ids']
        slides = list(
            PresentationSlide.objects.filter(
                id__in=slide_ids,
                presentation__studio=request.user.studio,
            )
        )
        if len(slides) != len(slide_ids):
            return Response({'error': 'Invalid slide ids.'}, status=status.HTTP_400_BAD_REQUEST)
        slide_map = {s.id: s for s in slides}
        for idx, slide_id in enumerate(slide_ids):
            slide_map[slide_id].order = idx
            slide_map[slide_id].save(update_fields=['order'])
        return Response({'success': True})


class PresentationPinViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, PresentationsViewPermission]
    serializer_class = PresentationPinSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        studio = getattr(self.request.user, 'studio', None)
        if not studio:
            return PresentationPin.objects.none()
        qs = PresentationPin.objects.filter(
            slide__presentation__studio=studio
        ).select_related('product', 'design_asset', 'slide')
        slide_id = self.request.query_params.get('slide_id')
        presentation_id = self.request.query_params.get('presentation_id')
        if slide_id:
            qs = qs.filter(slide_id=slide_id)
        if presentation_id:
            qs = qs.filter(slide__presentation_id=presentation_id)
        return qs


class PresentationCommentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, PresentationsViewPermission]
    serializer_class = PresentationCommentSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_queryset(self):
        studio = getattr(self.request.user, 'studio', None)
        if not studio:
            return PresentationComment.objects.none()
        qs = PresentationComment.objects.filter(
            slide__presentation__studio=studio
        )
        slide_id = self.request.query_params.get('slide_id')
        if slide_id:
            qs = qs.filter(slide_id=slide_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, author_type='studio')


@api_view(['GET'])
@permission_classes([AllowAny])
def public_presentation(request, token):
    try:
        presentation = Presentation.objects.prefetch_related(
            'slides__pins', 'slides__comments'
        ).get(public_token=token, web_published=True)
    except Presentation.DoesNotExist:
        return Response({'error': 'Presentation not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = PublicPresentationSerializer(presentation, context={'request': request})
    return Response(serializer.data)
