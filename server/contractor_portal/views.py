from rest_framework import viewsets, status
from django.http import HttpResponse
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum, Q
from django.conf import settings
from techstyles.resend_utils import (
    send_contractor_portal_welcome_email,
    send_contractor_invite_email,
    send_contractor_notification_email,
)
from techstyles.email_branding import email_brand_row_html, email_header_inner_html
from django.contrib.auth.hashers import make_password
from drf_spectacular.utils import (
    extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes, inline_serializer,
)
from rest_framework import serializers as drf_serializers
from documents.models import Document
from documents.serializers import DocumentSerializer
from projects.models import Procurement, Project
from finance.models import Invoice
from .serializers import (
    ContractorProcurementSerializer,
    ContractorDocumentSerializer,
    ContractorInvoiceSerializer,
    ContractorLoginSerializer,
    ContractorProjectSerializer,
    ContractorSharedProcurementSerializer,
    ContractorSharedDocumentSerializer,
    ContractorViewSerializer,
    ContractorProfileSerializer,
    ContractorMessageSerializer,
)
from .models import ContractorProject, ContractorSharedProcurement, ContractorSharedDocument, ContractorMessage, ContractorProfile
from crm.models import Client
from rest_framework.views import APIView
from .authentication import ContractorJWTAuthentication


def _studio_contractor(contractor_id, studio):
    """Return CN contractor in this studio, or None."""
    if not studio:
        return None
    return Client.objects.filter(id=contractor_id, contact_type='CN', studio=studio).first()


def _contractor_on_project(contractor, project_id):
    return ContractorProject.objects.filter(contractor=contractor, project_id=project_id).exists()


def _validate_share_targets(request, contractor_id, document_ids, project_id=None):
    """
    Ensure the studio user can share these documents with this contractor.
    Returns (contractor, documents_qs, error_response).
    """
    studio = getattr(request.user, 'studio', None)
    if not studio:
        return None, None, Response(
            {'error': 'Your account is not linked to a studio.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    contractor = _studio_contractor(contractor_id, studio)
    if not contractor:
        return None, None, Response(
            {'error': 'Contractor not found. Must be a contact with type CN in your studio.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if project_id is not None:
        try:
            project = Project.objects.get(id=project_id, studio=studio)
        except Project.DoesNotExist:
            return None, None, Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        if not _contractor_on_project(contractor, project.id):
            return None, None, Response(
                {'error': 'This contractor is not linked to the project.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    documents = Document.objects.filter(id__in=document_ids, studio=studio)
    if project_id is not None:
        documents = documents.filter(project_id=project_id)

    found_ids = set(documents.values_list('id', flat=True))
    missing = [did for did in document_ids if did not in found_ids]
    if missing:
        return None, None, Response(
            {'error': 'One or more documents were not found for this project.', 'not_found': missing},
            status=status.HTTP_404_NOT_FOUND,
        )

    for doc in documents:
        if doc.project_id and not _contractor_on_project(contractor, doc.project_id):
            return None, None, Response(
                {'error': f'Contractor is not linked to the project for "{doc.name}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    return contractor, documents, None


def _sync_document_contractor_access(document_id):
    """Clear contractor_access when no shares remain for this document."""
    still_shared = ContractorSharedDocument.objects.filter(document_id=document_id).exists()
    if not still_shared:
        Document.objects.filter(id=document_id, contractor_access=True).update(contractor_access=False)


@extend_schema_view(
    list=extend_schema(
        tags=['Contractor Portal - Documents'],
        summary='List all shared documents',
        description='Returns all documents with client_access=True accessible in the contractor portal.',
        responses={200: DocumentSerializer(many=True)},
    ),
    retrieve=extend_schema(
        tags=['Contractor Portal - Documents'],
        summary='Retrieve a shared document',
        description='Returns a single shared document by its ID.',
        responses={200: DocumentSerializer},
    ),
)
class ContractorDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for contractor access to documents.
    Scoped to documents explicitly shared with the requesting contractor.
    """
    queryset = Document.objects.all()
    serializer_class = ContractorDocumentSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        contractor_id = self.request.query_params.get('contractor_id')
        if contractor_id:
            ctx['viewed_at_map'] = dict(
                ContractorSharedDocument.objects.filter(contractor_id=contractor_id)
                .values_list('document_id', 'viewed_at')
            )
        return ctx

    def _get_contractor(self, request):
        contractor_id = request.query_params.get('contractor_id')
        if not contractor_id:
            return None, Response({'error': 'contractor_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            return Client.objects.get(id=contractor_id, contact_type='CN'), None
        except Client.DoesNotExist:
            return None, Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        tags=['Contractor Portal - Documents'],
        summary='List root documents for a project',
        description='Returns top-level documents (no parent folder) shared with contractors for a given project.',
        parameters=[
            OpenApiParameter(name='project_id', description='ID of the project', required=True, type=int),
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        responses={200: DocumentSerializer(many=True)},
    )
    @action(detail=False, methods=['get'])
    def root_documents(self, request):
        """
        Get root documents (no parent) shared with this specific contractor for a project.
        A root node is included if it is directly shared with the contractor OR if any of
        its descendants are, so folders without direct sharing are still navigable.
        """
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        contractor, err = self._get_contractor(request)
        if err:
            return err

        # Build a parent map for all documents in this project (in memory)
        all_docs = Document.objects.filter(project_id=project_id).values('id', 'parent_id')
        parent_map = {d['id']: d['parent_id'] for d in all_docs}

        # IDs of documents shared with THIS contractor for this project
        shared_ids = set(
            ContractorSharedDocument.objects.filter(
                contractor=contractor,
                document__project_id=project_id,
            ).values_list('document_id', flat=True)
        )

        # Walk each shared doc up the tree to find its root ancestor
        root_ids = set()
        for doc_id in shared_ids:
            current_id = doc_id
            while parent_map.get(current_id) is not None:
                current_id = parent_map[current_id]
            root_ids.add(current_id)

        queryset = Document.objects.filter(id__in=root_ids)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Contractor Portal - Documents'],
        summary='Mark a document as viewed',
        description='Records the timestamp when this contractor first viewed the document. Has no effect if already marked.',
        parameters=[
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        responses={200: ContractorSharedDocumentSerializer},
    )
    @action(detail=True, methods=['post'], url_path='mark_viewed')
    def mark_viewed(self, request, pk=None):
        contractor, err = self._get_contractor(request)
        if err:
            return err

        try:
            share = ContractorSharedDocument.objects.get(document_id=pk, contractor=contractor)
        except ContractorSharedDocument.DoesNotExist:
            return Response({'error': 'Document not shared with this contractor.'}, status=status.HTTP_404_NOT_FOUND)

        if share.viewed_at is None:
            from django.utils import timezone
            share.viewed_at = timezone.now()
            share.save(update_fields=['viewed_at'])

        serializer = ContractorSharedDocumentSerializer(share, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Contractor Portal - Documents'],
        summary='List contents of a folder',
        description='Returns all shared child documents/files inside a specific folder.',
        parameters=[
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        responses={200: DocumentSerializer(many=True)},
    )
    @action(detail=True, methods=['get'])
    def folder_content(self, request, pk=None):
        """
        Get shared content of a specific folder for this contractor.
        """
        contractor, err = self._get_contractor(request)
        if err:
            return err

        try:
            folder = Document.objects.get(pk=pk)
        except Document.DoesNotExist:
            return Response({'error': 'Folder not found.'}, status=status.HTTP_404_NOT_FOUND)

        shared_child_ids = ContractorSharedDocument.objects.filter(
            contractor=contractor,
            document__parent=folder,
        ).values_list('document_id', flat=True)
        children = folder.children.filter(id__in=shared_child_ids)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)


@extend_schema_view(
    retrieve=extend_schema(
        tags=['Contractor Portal - Procurements'],
        summary='Retrieve a shared procurement item',
        description='Returns a single procurement item accessible to the contractor portal.',
        parameters=[
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        responses={200: ContractorProcurementSerializer},
    ),
    partial_update=extend_schema(
        tags=['Contractor Portal - Procurements'],
        summary='Update procurement approval status',
        description='Allows a contractor to update the client_approval field (e.g. APR or REJ) on a procurement.',
        parameters=[
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        request=ContractorProcurementSerializer,
        responses={200: ContractorProcurementSerializer},
    ),
)
class ContractorProcurementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contractor access to procurements.
    Allows listing and updating approval status.
    """
    serializer_class = ContractorProcurementSerializer
    http_method_names = ['get', 'patch', 'post']
    permission_classes = [AllowAny]

    def get_queryset(self):
        contractor_id = self.request.query_params.get('contractor_id')
        if not contractor_id:
            return Procurement.objects.none()
        shared_ids = ContractorSharedProcurement.objects.filter(
            contractor_id=contractor_id,
        ).values_list('procurement_id', flat=True)
        return Procurement.objects.filter(id__in=shared_ids)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        contractor_id = self.request.query_params.get('contractor_id')
        if contractor_id:
            ctx['viewed_at_map'] = dict(
                ContractorSharedProcurement.objects.filter(contractor_id=contractor_id)
                .values_list('procurement_id', 'viewed_at')
            )
        return ctx

    @extend_schema(
        tags=['Contractor Portal - Procurements'],
        summary='List shared procurement items for a project',
        description='Returns procurement items shared with this contractor for the given project.',
        parameters=[
            OpenApiParameter(name='project_id', description='ID of the project', required=True, type=int),
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        responses={200: ContractorProcurementSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        project_id = request.query_params.get('project_id')
        contractor_id = request.query_params.get('contractor_id')
        if not project_id or not contractor_id:
            return Response({'error': 'project_id and contractor_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset().filter(project_id=project_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Contractor Portal - Procurements'],
        summary='Mark a procurement as viewed',
        description='Records the timestamp when this contractor first viewed the procurement. Has no effect if already marked.',
        parameters=[
            OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
        ],
        responses={200: ContractorSharedProcurementSerializer},
    )
    @action(detail=True, methods=['post'], url_path='mark_viewed')
    def mark_viewed(self, request, pk=None):
        contractor_id = request.query_params.get('contractor_id')
        if not contractor_id:
            return Response({'error': 'contractor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            share = ContractorSharedProcurement.objects.get(procurement_id=pk, contractor_id=contractor_id)
        except ContractorSharedProcurement.DoesNotExist:
            return Response({'error': 'Procurement not shared with this contractor.'}, status=status.HTTP_404_NOT_FOUND)

        if share.viewed_at is None:
            from django.utils import timezone
            share.viewed_at = timezone.now()
            share.save(update_fields=['viewed_at'])

        serializer = ContractorSharedProcurementSerializer(share, context={'request': request})
        return Response(serializer.data)


@extend_schema(
    tags=['Contractor Portal - Dashboard'],
    summary='Get project dashboard metrics',
    description=(
        'Returns summary statistics for a project in the contractor portal: '
        'project details, total paid/due invoice amounts, and pending action items count.'
    ),
    parameters=[
        OpenApiParameter(name='project_id', description='ID of the project', required=True, type=int),
    ],
    responses={
        200: inline_serializer(
            name='ContractorDashboardResponse',
            fields={
                'project_id': drf_serializers.IntegerField(),
                'project_name': drf_serializers.CharField(),
                'project_address': drf_serializers.CharField(),
                'project_picture': drf_serializers.URLField(allow_null=True),
                'total_paid_invoice': drf_serializers.FloatField(),
                'total_due_invoice': drf_serializers.FloatField(),
                'action_items': drf_serializers.IntegerField(),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_dashboard(request):
    """
    Get dashboard metrics for a contractor portal project.
    """
    project_id = request.query_params.get('project_id')
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    total_paid = round(
        Invoice.objects.filter(project_id=project_id, status='PD')
        .aggregate(total=Sum('total_amount'))['total'] or 0.0,
        2,
    )
    total_due = round(
        Invoice.objects.filter(project_id=project_id, status__in=['SNT', 'OVD'])
        .aggregate(total=Sum('total_amount'))['total'] or 0.0,
        2,
    )

    contractor_id = request.query_params.get('contractor_id')
    shared_procurement_ids = ContractorSharedProcurement.objects.filter(
        contractor_id=contractor_id,
        procurement__project_id=project_id,
    ).values_list('procurement_id', flat=True) if contractor_id else []

    action_items_count = Procurement.objects.filter(
        id__in=shared_procurement_ids,
    ).exclude(client_approval__in=['APR', 'REJ']).exclude(client_approval__isnull=True).count()

    response_data = {
        'project_id': project.id,
        'project_name': project.project_name,
        'project_address': project.delivery_address_line_1,
        'project_picture': request.build_absolute_uri(project.project_banner.url) if project.project_banner else None,
        'total_paid_invoice': total_paid,
        'total_due_invoice': total_due,
        'action_items': action_items_count,
    }

    return Response(response_data)


def _generate_access_code(surname, studio_id):
    """
    Generate a 6-character access code for a contractor.
    Format: First 4 chars of surname (uppercase) + '-' + 2-digit sequence (e.g. FLET-01)
    """
    # Get first 4 chars of surname, pad with X if too short
    surname_part = (surname[:4] if surname else 'XXXX').upper().ljust(4, 'X')

    # Find the next sequence number for this surname prefix in this studio
    existing_codes = ContractorProfile.objects.filter(
        contractor__contact_type='CN',
        contractor__studio_id=studio_id,
        access_code__startswith=surname_part,
    ).values_list('access_code', flat=True)

    # Extract sequence numbers
    sequence_numbers = []
    for code in existing_codes:
        if code and '-' in code:
            try:
                seq = int(code.split('-')[1])
                sequence_numbers.append(seq)
            except (ValueError, IndexError):
                pass

    # Get next sequence number
    next_seq = max(sequence_numbers, default=0) + 1

    return f"{surname_part}-{next_seq:02d}"


def _project_portal_url(project):
    base = settings.CONTRACTOR_PORTAL_URL.rstrip('/')
    return f"{base}/project/{project.access_token}"


def _get_contractor_invite_plain_message(project, contractor, access_code, portal_url, studio_name, trade=''):
    login_url = f"{settings.CONTRACTOR_PORTAL_URL.rstrip('/')}/login"
    trade_line = f"\nTrade: {trade}\n" if trade else ''
    return f"""Hello {contractor.name},

You've been added to the contractor portal for: {project.project_name}

Studio: {studio_name}
{trade_line}
Your personal access code: {access_code}

On site — scan the project QR code, or open:
{portal_url}

Enter your access code when prompted.

You can also sign in at {login_url}
Email: {contractor.email}
Password: {access_code}

Best regards,
{studio_name}
"""


def _get_contractor_invite_email_html(project, contractor, access_code, portal_url, studio_name, trade=''):
    trade_block = ''
    if trade:
        trade_block = f"""
              <p style="margin: 0 0 4px; color: #6b7280; font-size: 13px;">
                Trade: <strong style="color: #374151;">{trade}</strong>
              </p>"""

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contractor Portal Access</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); overflow: hidden;">
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              {email_header_inner_html(title=studio_name, subtitle=project.project_name, align='center')}
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 22px; font-weight: 600;">
                Hello {contractor.name}
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.5;">
                You've been invited to the contractor portal for this project. Use your personal access code below.
              </p>
              {trade_block}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;text-align:center;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Your access code
                </p>
                <p style="margin: 0; color: #111827; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">
                  {access_code}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 14px; line-height: 1.5;">
                On site, scan the project QR code or open the link below, then enter your access code.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 6px; background-color: #111827;">
                          <a href="{portal_url}" style="display: block; padding: 14px 40px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                            Open project portal
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; word-break: break-all; text-align: center;">
                {portal_url}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                © Focuspilot · {studio_name}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


@extend_schema(
    tags=['Contractor Portal - Management'],
    summary='Add contractor to project',
    description=(
        'Creates a new contractor (contact_type=CN), links them to a project, '
        'auto-generates a 6-char access code, sets password to access_code, '
        'and optionally sends an invite email via Resend.'
    ),
    request=inline_serializer(
        name='AddContractorRequest',
        fields={
            'project_id': drf_serializers.IntegerField(required=True),
            'name': drf_serializers.CharField(required=True),
            'surname': drf_serializers.CharField(required=True),
            'company_name': drf_serializers.CharField(required=False),
            'email': drf_serializers.EmailField(required=True),
            'phone': drf_serializers.CharField(required=False),
            'trade': drf_serializers.CharField(required=False),
        },
    ),
    responses={
        201: inline_serializer(
            name='AddContractorResponse',
            fields={
                'id': drf_serializers.IntegerField(),
                'name': drf_serializers.CharField(),
                'surname': drf_serializers.CharField(),
                'company_name': drf_serializers.CharField(),
                'email': drf_serializers.EmailField(),
                'phone': drf_serializers.CharField(),
                'trade': drf_serializers.CharField(),
                'access_code': drf_serializers.CharField(),
                'project_id': drf_serializers.IntegerField(),
                'project_name': drf_serializers.CharField(),
                'portal_url': drf_serializers.CharField(),
                'invite_sent': drf_serializers.BooleanField(),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_contractor(request):
    """
    Add a new contractor to a project.
    Creates the contractor, generates access code, and links to project.
    """
    # Validate required fields
    project_id = request.data.get('project_id')
    name = request.data.get('name')
    surname = request.data.get('surname')
    email = request.data.get('email')

    if not all([project_id, name, surname, email]):
        return Response(
            {'error': 'project_id, name, surname, and email are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Verify project exists
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get studio from request user
    studio = request.user.studio
    if not studio:
        return Response({'error': 'User studio not found'}, status=status.HTTP_400_BAD_REQUEST)

    # Prevent duplicate email
    if Client.objects.filter(email=email, contact_type='CN', studio=studio).exists():
        return Response(
            {'error': 'A contractor with this email already exists in your studio.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Generate access code
    access_code = _generate_access_code(surname, studio.id)

    # Create contractor
    contractor = Client.objects.create(
        contact_type='CN',
        name=name,
        surname=surname,
        company_name=request.data.get('company_name', ''),
        email=email,
        phone=request.data.get('phone', ''),
        password=make_password(access_code),
        is_active=True,
        studio=studio,
        created_by=request.user,
    )

    # Store contractor-specific fields in ContractorProfile
    ContractorProfile.objects.create(
        contractor=contractor,
        access_code=access_code,
        trade=request.data.get('trade', ''),
    )

    # Link contractor to project
    ContractorProject.objects.create(
        contractor=contractor,
        project=project,
    )

    trade = request.data.get('trade', '')
    studio_name = studio.name if studio else 'Focuspilot'
    portal_url = _project_portal_url(project)
    invite_sent = False

    plain_message = _get_contractor_invite_plain_message(
        project, contractor, access_code, portal_url, studio_name, trade=trade,
    )
    html_message = _get_contractor_invite_email_html(
        project, contractor, access_code, portal_url, studio_name, trade=trade,
    )

    try:
        send_contractor_invite_email(
            contractor.email,
            project.project_name or 'Project',
            studio_name,
            html_message,
            plain_message,
        )
        invite_sent = True
    except Exception as e:
        print(f"Error sending contractor invite to {contractor.email}: {str(e)}")

    return Response({
        'id': contractor.id,
        'name': contractor.name,
        'surname': contractor.surname,
        'company_name': contractor.company_name,
        'email': contractor.email,
        'phone': contractor.phone,
        'trade': trade,
        'access_code': access_code,
        'project_id': project.id,
        'project_name': project.project_name,
        'portal_url': portal_url,
        'invite_sent': invite_sent,
    }, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Contractor Portal - Auth'],
    summary='Contractor portal login',
    description=(
        'Authenticates a contractor (contact_type=CN) with email and password. '
        'Returns contractor profile and the list of accessible projects.'
    ),
    request=ContractorLoginSerializer,
    responses={
        200: inline_serializer(
            name='ContractorLoginResponse',
            fields={
                'contractor': inline_serializer(
                    name='ContractorInfo',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'name': drf_serializers.CharField(),
                        'surname': drf_serializers.CharField(),
                        'email': drf_serializers.EmailField(),
                        'phone': drf_serializers.CharField(),
                    },
                ),
                'projects': ContractorProjectSerializer(many=True),
            },
        ),
        400: OpenApiTypes.OBJECT,
    },
)
class ContractorLoginView(APIView):
    """
    Contractor portal login endpoint.
    Returns JWT tokens and accessible projects.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContractorLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        contractor = serializer.validated_data['contractor']

        return Response({
            'access': serializer.validated_data['access'],
            'refresh': serializer.validated_data['refresh'],
            'contractor': {
                'id': contractor.id,
                'name': contractor.name,
                'surname': contractor.surname,
                'email': contractor.email,
                'phone': contractor.phone,
            },
            'projects': ContractorProjectSerializer(
                ContractorProject.objects.filter(contractor=contractor),
                many=True,
            ).data,
        }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Contractor Portal - Auth'],
    summary='Generate contractor portal credentials',
    description=(
        'Sets the contractor password to their email address, activates their account, '
        'links them to the project, and sends a welcome email with login details.'
    ),
    request=inline_serializer(
        name='GenerateContractorCredentialsRequest',
        fields={
            'project_id': drf_serializers.IntegerField(),
            'contractor_id': drf_serializers.IntegerField(),
            'html_content': drf_serializers.CharField(required=False, help_text='Optional custom HTML for the welcome email'),
        },
    ),
    responses={
        200: inline_serializer(
            name='GenerateContractorCredentialsResponse',
            fields={
                'message': drf_serializers.CharField(),
                'contractor': inline_serializer(
                    name='ContractorBasic',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'name': drf_serializers.CharField(),
                        'email': drf_serializers.EmailField(),
                    },
                ),
                'project': inline_serializer(
                    name='ProjectBasic',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'name': drf_serializers.CharField(),
                    },
                ),
                'credentials': inline_serializer(
                    name='ContractorCredentials',
                    fields={
                        'email': drf_serializers.EmailField(),
                        'password': drf_serializers.CharField(),
                        'note': drf_serializers.CharField(),
                    },
                ),
                'access_created': drf_serializers.BooleanField(),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_contractor_credentials(request):
    """
    Generate contractor portal login credentials.
    Sets password to email address and links contractor to project.
    """
    project_id = request.data.get('project_id')
    contractor_id = request.data.get('contractor_id')

    if not project_id or not contractor_id:
        return Response(
            {'error': 'project_id and contractor_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    if not contractor.email:
        return Response(
            {'error': 'Contractor must have an email address'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    contractor.set_password(contractor.email)
    contractor.is_active = True
    contractor.save()

    contractor_project, created = ContractorProject.objects.get_or_create(
        contractor=contractor,
        project=project,
    )

    login_url = f"{settings.CONTRACTOR_PORTAL_URL}/login"

    message = f"""
Hello {contractor.name},

Your contractor portal access has been set up for the project: {project.project_name}

You can now log in to view project updates, documents, invoices, and procurement details.

Login Credentials:
Email: {contractor.email}
Password: {contractor.email}

Login URL: {login_url}

For security, we recommend changing your password after your first login.

Best regards,
The Focuspilot Team
    """

    html_message = request.data.get('html_content')

    if not html_message:
        html_message = _get_welcome_email_html(project, contractor, login_url)

    studio_name = request.user.studio.name if request.user.studio else 'Focuspilot'
    try:
        send_contractor_portal_welcome_email(contractor.email, studio_name, html_message, message)
    except Exception as e:
        print(f"Error sending welcome email to {contractor.email}: {str(e)}")

    return Response({
        'message': 'Contractor portal credentials generated successfully',
        'contractor': {
            'id': contractor.id,
            'name': contractor.name,
            'email': contractor.email,
        },
        'project': {
            'id': project.id,
            'name': project.project_name,
        },
        'credentials': {
            'email': contractor.email,
            'password': contractor.email,
            'note': 'Password is set to email address',
        },
        'access_created': created,
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Contractor Portal - Auth'],
    summary='Copy contractor portal login URL',
    description=(
        'Sets the contractor password to their email address, activates their account, '
        'links them to the project, and returns the login URL (no email sent).'
    ),
    request=inline_serializer(
        name='CopyContractorCredentialsRequest',
        fields={
            'project_id': drf_serializers.IntegerField(),
            'contractor_id': drf_serializers.IntegerField(),
        },
    ),
    responses={
        200: inline_serializer(
            name='CopyContractorCredentialsResponse',
            fields={
                'message': drf_serializers.CharField(),
                'login_url': drf_serializers.URLField(),
                'contractor': inline_serializer(
                    name='ContractorBasicCopy',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'name': drf_serializers.CharField(),
                        'email': drf_serializers.EmailField(),
                    },
                ),
                'project': inline_serializer(
                    name='ProjectBasicCopy',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'name': drf_serializers.CharField(),
                    },
                ),
                'credentials': inline_serializer(
                    name='ContractorCredentialsCopy',
                    fields={
                        'email': drf_serializers.EmailField(),
                        'password': drf_serializers.CharField(),
                        'note': drf_serializers.CharField(),
                    },
                ),
                'access_created': drf_serializers.BooleanField(),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def copy_contractor_credentials(request):
    """
    Generate contractor portal login credentials and return the login URL.
    """
    project_id = request.data.get('project_id')
    contractor_id = request.data.get('contractor_id')

    if not project_id or not contractor_id:
        return Response(
            {'error': 'project_id and contractor_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    if not contractor.email:
        return Response(
            {'error': 'Contractor must have an email address'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    contractor.set_password(contractor.email)
    contractor.is_active = True
    contractor.save()

    contractor_project, created = ContractorProject.objects.get_or_create(
        contractor=contractor,
        project=project,
    )

    login_url = f"{settings.CONTRACTOR_PORTAL_URL}/login"

    return Response({
        'message': 'Contractor portal credentials generated successfully',
        'login_url': login_url,
        'contractor': {
            'id': contractor.id,
            'name': contractor.name,
            'email': contractor.email,
        },
        'project': {
            'id': project.id,
            'name': project.project_name,
        },
        'credentials': {
            'email': contractor.email,
            'password': contractor.email,
            'note': 'Password is set to email address',
        },
        'access_created': created,
    }, status=status.HTTP_200_OK)


def _get_welcome_email_html(project, contractor, login_url):
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Contractor Portal Access</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); overflow: hidden;">

          <!-- Header Section -->
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              {email_header_inner_html(title='Welcome to Focuspilot', subtitle=project.project_name, align='center')}
            </td>
          </tr>

          <!-- Greeting Section -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 22px; font-weight: 600;">
                Hello {contractor.name}
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.5;">
                Your contractor portal is ready. View project updates, documents, invoices, and procurement details.
              </p>
            </td>
          </tr>

          <!-- Credentials Card -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
                <p style="margin: 0 0 20px; color: #374151; font-size: 14px; font-weight: 600;">
                  Login Credentials
                </p>

                <!-- Email Field -->
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;">
                    Email
                  </p>
                  <div style="background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <p style="margin: 0; color: #111827; font-size: 15px; word-break: break-all;">
                      {contractor.email}
                    </p>
                  </div>
                </div>

                <!-- Password Field -->
                <div>
                  <p style="margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;">
                    Password
                  </p>
                  <div style="background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;">
                    <p style="margin: 0; color: #111827; font-size: 15px; word-break: break-all;">
                      {contractor.email}
                    </p>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-top: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 6px; background-color: #111827;">
                          <a href="{login_url}" style="display: block; padding: 14px 40px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; white-space: nowrap; -webkit-text-size-adjust: none;">
                            Access Portal
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                © 2025 Focuspilot. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """


@extend_schema(
    tags=['Contractor Portal - Auth'],
    summary='Preview welcome email HTML',
    description='Returns the raw HTML of the contractor welcome email for a given project and contractor.',
    request=inline_serializer(
        name='FetchContractorEmailHtmlRequest',
        fields={
            'project_id': drf_serializers.IntegerField(),
            'contractor_id': drf_serializers.IntegerField(),
        },
    ),
    responses={200: OpenApiTypes.STR, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_contractor_credentials_email_html(request):
    """
    Fetch the generated HTML for the contractor credentials welcome email.
    """
    project_id = request.data.get('project_id')
    contractor_id = request.data.get('contractor_id')

    if not project_id or not contractor_id:
        return Response(
            {'error': 'project_id and contractor_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    login_url = f"{settings.CONTRACTOR_PORTAL_URL}/login"
    html_content = _get_welcome_email_html(project, contractor, login_url)

    return HttpResponse(html_content, content_type='text/html')


# ---------------------------------------------------------------------------
# Contractor Shared Items endpoints
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Share a procurement with a contractor',
    description=(
        'Links a procurement item to a contractor (CN contact type). '
        'Returns the shared record. If already shared, returns existing record with HTTP 200.'
    ),
    request=inline_serializer(
        name='ShareProcurementRequest',
        fields={
            'contractor_id': drf_serializers.IntegerField(help_text='ID of a Client with contact_type=CN'),
            'procurement_id': drf_serializers.IntegerField(),
        },
    ),
    responses={
        201: ContractorSharedProcurementSerializer,
        200: ContractorSharedProcurementSerializer,
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_procurement_with_contractor(request):
    """
    Share a procurement item with a contractor (CN contact type).

    Body:
        contractor_id (int): ID of a Client with contact_type='CN'.
        procurement_id (int): ID of the Procurement to share.

    Returns the created ContractorSharedProcurement record.
    """
    contractor_id = request.data.get('contractor_id')
    procurement_id = request.data.get('procurement_id')

    if not contractor_id or not procurement_id:
        return Response(
            {'error': 'contractor_id and procurement_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Contractor not found. Must be a contact with type CN.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        procurement = Procurement.objects.get(id=procurement_id)
    except Procurement.DoesNotExist:
        return Response({'error': 'Procurement not found'}, status=status.HTTP_404_NOT_FOUND)

    shared, created = ContractorSharedProcurement.objects.get_or_create(
        contractor=contractor,
        procurement=procurement,
    )

    if created:
        procurement.contractor_access = True
        procurement.save(update_fields=['contractor_access'])
        _send_procurement_notification_email(contractor, [procurement])

    serializer = ContractorSharedProcurementSerializer(shared, context={'request': request})
    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Share multiple procurements with a contractor',
    description=(
        'Links multiple procurement items to a contractor (CN contact type) in a single request. '
        'Already-shared procurements are skipped (idempotent). '
        'Returns the list of shared records along with a count of newly created vs already existing.'
    ),
    request=inline_serializer(
        name='BulkShareProcurementRequest',
        fields={
            'contractor_id': drf_serializers.IntegerField(help_text='ID of a Client with contact_type=CN'),
            'procurement_ids': drf_serializers.ListField(
                child=drf_serializers.IntegerField(),
                help_text='List of Procurement IDs to share',
            ),
        },
    ),
    responses={
        200: inline_serializer(
            name='BulkShareProcurementResponse',
            fields={
                'created': drf_serializers.IntegerField(help_text='Number of newly shared procurements'),
                'already_shared': drf_serializers.IntegerField(help_text='Number already shared (skipped)'),
                'not_found': drf_serializers.ListField(child=drf_serializers.IntegerField(), help_text='IDs that were not found'),
                'shared_procurements': ContractorSharedProcurementSerializer(many=True),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_share_procurement_with_contractor(request):
    """
    Share multiple procurement items with a contractor in one request.

    Body:
        contractor_id (int): ID of a Client with contact_type='CN'.
        procurement_ids (list[int]): IDs of the Procurements to share.
    """
    contractor_id = request.data.get('contractor_id')
    procurement_ids = request.data.get('procurement_ids', [])

    if not contractor_id:
        return Response({'error': 'contractor_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not procurement_ids or not isinstance(procurement_ids, list):
        return Response({'error': 'procurement_ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Contractor not found. Must be a contact with type CN.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    existing_procurements = Procurement.objects.filter(id__in=procurement_ids)
    found_ids = set(existing_procurements.values_list('id', flat=True))
    not_found_ids = [pid for pid in procurement_ids if pid not in found_ids]

    created_count = 0
    already_shared_count = 0
    shared_records = []

    newly_shared_procurement_ids = []
    for procurement in existing_procurements:
        shared, created = ContractorSharedProcurement.objects.get_or_create(
            contractor=contractor,
            procurement=procurement,
        )
        shared_records.append(shared)
        if created:
            created_count += 1
            newly_shared_procurement_ids.append(procurement.id)
        else:
            already_shared_count += 1

    if newly_shared_procurement_ids:
        Procurement.objects.filter(id__in=newly_shared_procurement_ids).update(contractor_access=True)
        newly_shared_procurements = [s.procurement for s in shared_records if s.procurement_id in set(newly_shared_procurement_ids)]
        _send_procurement_notification_email(contractor, newly_shared_procurements)

    serializer = ContractorSharedProcurementSerializer(shared_records, many=True, context={'request': request})
    return Response({
        'created': created_count,
        'already_shared': already_shared_count,
        'not_found': not_found_ids,
        'shared_procurements': serializer.data,
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='List project files available to share',
    description=(
        'Returns all files and links in a project (including inside folders) for the '
        'studio share-files dialog. Folders are omitted.'
    ),
    parameters=[
        OpenApiParameter(name='project_id', description='Project ID', required=True, type=int, location=OpenApiParameter.PATH),
    ],
    responses={200: DocumentSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_shareable_documents(request, project_id):
    """Flat list of FILE/LINK documents in a project for the share dialog."""
    studio = getattr(request.user, 'studio', None)
    if not studio:
        return Response({'error': 'Your account is not linked to a studio.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        Project.objects.get(id=project_id, studio=studio)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    queryset = Document.objects.filter(
        project_id=project_id,
        studio=studio,
        type__in=('FILE', 'LINK'),
    ).order_by('name')
    serializer = DocumentSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Share a document with a contractor',
    description=(
        'Links a document/drawing to a contractor (CN contact type). '
        'Returns the shared record. If already shared, returns existing record with HTTP 200.'
    ),
    request=inline_serializer(
        name='ShareDocumentRequest',
        fields={
            'contractor_id': drf_serializers.IntegerField(help_text='ID of a Client with contact_type=CN'),
            'document_id': drf_serializers.IntegerField(),
        },
    ),
    responses={
        201: ContractorSharedDocumentSerializer,
        200: ContractorSharedDocumentSerializer,
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_document_with_contractor(request):
    """
    Share a document/drawing with a contractor (CN contact type).

    Body:
        contractor_id (int): ID of a Client with contact_type='CN'.
        document_id (int): ID of the Document to share.

    Returns the created ContractorSharedDocument record.
    """
    contractor_id = request.data.get('contractor_id')
    document_id = request.data.get('document_id')
    project_id = request.data.get('project_id')

    if not contractor_id or not document_id:
        return Response(
            {'error': 'contractor_id and document_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    contractor, documents, err = _validate_share_targets(
        request, contractor_id, [int(document_id)], project_id=project_id,
    )
    if err:
        return err
    document = documents.first()

    shared, created = ContractorSharedDocument.objects.get_or_create(
        contractor=contractor,
        document=document,
    )

    if created:
        document.contractor_access = True
        document.save(update_fields=['contractor_access'])
        _send_document_notification_email(contractor, [document])

    serializer = ContractorSharedDocumentSerializer(shared, context={'request': request})
    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Share multiple documents with a contractor',
    description=(
        'Links multiple documents/drawings to a contractor (CN contact type) in a single request. '
        'Already-shared documents are skipped (idempotent). '
        'Returns the list of shared records along with a count of newly created vs already existing.'
    ),
    request=inline_serializer(
        name='BulkShareDocumentRequest',
        fields={
            'contractor_id': drf_serializers.IntegerField(help_text='ID of a Client with contact_type=CN'),
            'document_ids': drf_serializers.ListField(
                child=drf_serializers.IntegerField(),
                help_text='List of Document IDs to share',
            ),
        },
    ),
    responses={
        200: inline_serializer(
            name='BulkShareDocumentResponse',
            fields={
                'created': drf_serializers.IntegerField(help_text='Number of newly shared documents'),
                'already_shared': drf_serializers.IntegerField(help_text='Number already shared (skipped)'),
                'not_found': drf_serializers.ListField(child=drf_serializers.IntegerField(), help_text='IDs that were not found'),
                'shared_documents': ContractorSharedDocumentSerializer(many=True),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_share_document_with_contractor(request):
    """
    Share multiple documents with a contractor in one request.

    Body:
        contractor_id (int): ID of a Client with contact_type='CN'.
        document_ids (list[int]): IDs of the Documents to share.
    """
    contractor_id = request.data.get('contractor_id')
    document_ids = request.data.get('document_ids', [])
    project_id = request.data.get('project_id')

    if not contractor_id:
        return Response({'error': 'contractor_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not document_ids or not isinstance(document_ids, list):
        return Response({'error': 'document_ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        document_ids = [int(d) for d in document_ids]
    except (TypeError, ValueError):
        return Response({'error': 'document_ids must be integers'}, status=status.HTTP_400_BAD_REQUEST)

    contractor, existing_documents, err = _validate_share_targets(
        request, contractor_id, document_ids, project_id=project_id,
    )
    if err:
        return err

    not_found_ids = []

    created_count = 0
    already_shared_count = 0
    shared_records = []

    newly_shared_document_ids = []
    for document in existing_documents:
        shared, created = ContractorSharedDocument.objects.get_or_create(
            contractor=contractor,
            document=document,
        )
        shared_records.append(shared)
        if created:
            created_count += 1
            newly_shared_document_ids.append(document.id)
        else:
            already_shared_count += 1

    if newly_shared_document_ids:
        Document.objects.filter(id__in=newly_shared_document_ids).update(contractor_access=True)
        newly_shared_documents = [s.document for s in shared_records if s.document_id in set(newly_shared_document_ids)]
        _send_document_notification_email(contractor, newly_shared_documents)

    serializer = ContractorSharedDocumentSerializer(shared_records, many=True, context={'request': request})
    return Response({
        'created': created_count,
        'already_shared': already_shared_count,
        'not_found': not_found_ids,
        'shared_documents': serializer.data,
    }, status=status.HTTP_200_OK)


def _send_procurement_notification_email(contractor, procurements):
    """Send an email to the contractor when one or more procurements are shared."""
    if not contractor.email:
        return
    portal_url = f"{settings.CONTRACTOR_PORTAL_URL}/login"
    is_bulk = len(procurements) > 1
    if is_bulk:
        subject = f"New procurement items have been shared with you"
        item_lines = "\n".join(
            f"  - {p.product.name if p.product else 'Item'} (Project: {p.project.project_name if p.project else 'N/A'})"
            for p in procurements
        )
        message = (
            f"Hello {contractor.name},\n\n"
            f"The following procurement items have been shared with you:\n\n"
            f"{item_lines}\n\n"
            f"Log in to your contractor portal to view the details:\n{portal_url}\n\n"
            f"Best regards,\nThe Focuspilot Team"
        )
        item_rows = "".join(
            f"<div style=\"margin-bottom: 16px;\">"
            f"<p style=\"margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;\">Item</p>"
            f"<div style=\"background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;\">"
            f"<p style=\"margin: 0; color: #111827; font-size: 15px; word-break: break-all;\">"
            f"{p.product.name if p.product else 'Item'}"
            f" &mdash; <span style=\"color: #6b7280;\">{p.project.project_name if p.project else 'N/A'}</span></p>"
            f"</div></div>"
            for p in procurements
        )
        body_content = (
            f"<p style=\"margin: 0 0 16px; color: #6b7280; font-size: 15px; line-height: 1.5;\">"
            f"The following procurement items have been shared with you:</p>"
            f"<div style=\"background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;\">"
            f"<p style=\"margin: 0 0 20px; color: #374151; font-size: 14px; font-weight: 600;\">Procurement Items</p>"
            f"{item_rows}"
            f"</div>"
        )
    else:
        p = procurements[0]
        product_name = p.product.name if p.product else 'Item'
        project_name = p.project.project_name if p.project else 'N/A'
        subject = f"New procurement item shared: {product_name}"
        message = (
            f"Hello {contractor.name},\n\n"
            f"A procurement item has been shared with you:\n\n"
            f"  Item: {product_name}\n"
            f"  Project: {project_name}\n\n"
            f"Log in to your contractor portal to view the details:\n{portal_url}\n\n"
            f"Best regards,\nThe Focuspilot Team"
        )
        body_content = (
            f"<p style=\"margin: 0 0 16px; color: #6b7280; font-size: 15px; line-height: 1.5;\">A procurement item has been shared with you.</p>"
            f"<div style=\"background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;\">"
            f"<p style=\"margin: 0 0 20px; color: #374151; font-size: 14px; font-weight: 600;\">Procurement Item</p>"
            f"<div style=\"margin-bottom: 16px;\">"
            f"<p style=\"margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;\">Item</p>"
            f"<div style=\"background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;\">"
            f"<p style=\"margin: 0; color: #111827; font-size: 15px; word-break: break-all;\">{product_name}</p>"
            f"</div></div>"
            f"<div>"
            f"<p style=\"margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;\">Project</p>"
            f"<div style=\"background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;\">"
            f"<p style=\"margin: 0; color: #111827; font-size: 15px; word-break: break-all;\">{project_name}</p>"
            f"</div></div>"
            f"</div>"
        )
    html_message = _notification_email_html(contractor, body_content, portal_url)
    try:
        send_contractor_notification_email(contractor.email, subject, html_message, message)
    except Exception as e:
        print(f"Error sending procurement notification email to {contractor.email}: {str(e)}")


def _send_document_notification_email(contractor, documents):
    """Send an email to the contractor when one or more documents are shared."""
    if not contractor.email:
        return
    portal_url = f"{settings.CONTRACTOR_PORTAL_URL}/login"
    is_bulk = len(documents) > 1
    if is_bulk:
        subject = f"New documents have been shared with you"
        item_lines = "\n".join(
            f"  - {d.name} (Project: {d.project.project_name if d.project else 'N/A'})"
            for d in documents
        )
        message = (
            f"Hello {contractor.name},\n\n"
            f"The following documents have been shared with you:\n\n"
            f"{item_lines}\n\n"
            f"Log in to your contractor portal to view the details:\n{portal_url}\n\n"
            f"Best regards,\nThe Focuspilot Team"
        )
        item_rows = "".join(
            f"<div style=\"margin-bottom: 16px;\">"
            f"<p style=\"margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;\">Document</p>"
            f"<div style=\"background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;\">"
            f"<p style=\"margin: 0; color: #111827; font-size: 15px; word-break: break-all;\">"
            f"{d.name}"
            f" &mdash; <span style=\"color: #6b7280;\">{d.project.project_name if d.project else 'N/A'}</span></p>"
            f"</div></div>"
            for d in documents
        )
        body_content = (
            f"<p style=\"margin: 0 0 16px; color: #6b7280; font-size: 15px; line-height: 1.5;\">"
            f"The following documents have been shared with you:</p>"
            f"<div style=\"background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;\">"
            f"<p style=\"margin: 0 0 20px; color: #374151; font-size: 14px; font-weight: 600;\">Documents</p>"
            f"{item_rows}"
            f"</div>"
        )
    else:
        d = documents[0]
        doc_name = d.name
        project_name = d.project.project_name if d.project else 'N/A'
        subject = f"New document shared: {doc_name}"
        message = (
            f"Hello {contractor.name},\n\n"
            f"A document has been shared with you:\n\n"
            f"  Document: {doc_name}\n"
            f"  Project: {project_name}\n\n"
            f"Log in to your contractor portal to view the details:\n{portal_url}\n\n"
            f"Best regards,\nThe Focuspilot Team"
        )
        body_content = (
            f"<p style=\"margin: 0 0 16px; color: #6b7280; font-size: 15px; line-height: 1.5;\">A document has been shared with you.</p>"
            f"<div style=\"background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;\">"
            f"<p style=\"margin: 0 0 20px; color: #374151; font-size: 14px; font-weight: 600;\">Document</p>"
            f"<div style=\"margin-bottom: 16px;\">"
            f"<p style=\"margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;\">Name</p>"
            f"<div style=\"background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;\">"
            f"<p style=\"margin: 0; color: #111827; font-size: 15px; word-break: break-all;\">{doc_name}</p>"
            f"</div></div>"
            f"<div>"
            f"<p style=\"margin: 0 0 6px; color: #6b7280; font-size: 12px; font-weight: 500;\">Project</p>"
            f"<div style=\"background: #ffffff; padding: 12px 14px; border: 1px solid #d1d5db; border-radius: 6px;\">"
            f"<p style=\"margin: 0; color: #111827; font-size: 15px; word-break: break-all;\">{project_name}</p>"
            f"</div></div>"
            f"</div>"
        )
    html_message = _notification_email_html(contractor, body_content, portal_url)
    try:
        send_contractor_notification_email(contractor.email, subject, html_message, message)
    except Exception as e:
        print(f"Error sending document notification email to {contractor.email}: {str(e)}")


def _notification_email_html(contractor, body_content, portal_url):
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Contractor Portal Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); overflow: hidden;">

          <!-- Header Section -->
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              {email_brand_row_html(align='center')}
            </td>
          </tr>

          <!-- Greeting Section -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h2 style="margin: 0 0 8px; color: #111827; font-size: 22px; font-weight: 600;">
                Hello {contractor.name}
              </h2>
              {body_content}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding-top: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 6px; background-color: #111827;">
                          <a href="{portal_url}" style="display: block; padding: 14px 40px; background-color: #111827; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; white-space: nowrap; -webkit-text-size-adjust: none;">
                            Access Portal
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                © 2025 Focuspilot. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    """


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Contractor detail panel',
    description=(
        'Returns the full contractor panel view including contractor profile, '
        'all shared procurement items, shared documents, and summary counts. '
        'Optionally filter by project_id.'
    ),
    parameters=[
        OpenApiParameter(name='project_id', description='Filter shared items by project', required=False, type=int),
    ],
    responses={200: ContractorViewSerializer, 404: OpenApiTypes.OBJECT},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contractor_view(request, contractor_id):
    """
    Return the full contractor panel view: contractor info, shared procurements
    and shared documents (optionally filtered by project_id).

    Query params:
        project_id (optional): filter shared items to a specific project.
    """
    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Contractor not found. Must be a contact with type CN.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    serializer = ContractorViewSerializer(contractor, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='List all contractors for a project',
    description=(
        'Returns all contractors linked to a project with their shared procurements and documents '
        'filtered to that project. Each contractor entry includes summary counts (items, drawings, '
        'confirmed drawings) for the collapsed card view, plus the full shared item lists for the '
        'expanded view.'
    ),
    responses={200: ContractorViewSerializer(many=True), 404: OpenApiTypes.OBJECT},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_contractors(request, project_id):
    """
    Return all contractors linked to a project, with their shared items scoped to that project.
    """
    try:
        Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    contractors = Client.objects.filter(
        Q(contractor_portal_projects__project_id=project_id) |
        Q(shared_procurements__procurement__project_id=project_id),
        contact_type='CN',
    ).select_related('contractor_profile').distinct()

    serializer = ContractorViewSerializer(
        contractors,
        many=True,
        context={'request': request, 'project_id': str(project_id)},
    )
    return Response(serializer.data)


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Remove a shared procurement',
    description='Unlinks a procurement from a contractor. The procurement itself is not deleted.',
    request=inline_serializer(
        name='RemoveSharedProcurementRequest',
        fields={
            'contractor_id': drf_serializers.IntegerField(),
            'procurement_id': drf_serializers.IntegerField(),
        },
    ),
    responses={
        200: inline_serializer(
            name='RemoveSharedProcurementResponse',
            fields={'message': drf_serializers.CharField()},
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_shared_procurement(request):
    """
    Remove a procurement from a contractor's shared items.

    Body:
        contractor_id (int)
        procurement_id (int)
    """
    contractor_id = request.data.get('contractor_id')
    procurement_id = request.data.get('procurement_id')

    if not contractor_id or not procurement_id:
        return Response(
            {'error': 'contractor_id and procurement_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    deleted, _ = ContractorSharedProcurement.objects.filter(
        contractor_id=contractor_id,
        procurement_id=procurement_id,
    ).delete()

    if not deleted:
        return Response({'error': 'Shared procurement not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'message': 'Procurement removed from contractor shared items'})


@extend_schema(
    tags=['Contractor Portal - Shared Items'],
    summary='Remove a shared document',
    description='Unlinks a document from a contractor. The document itself is not deleted.',
    request=inline_serializer(
        name='RemoveSharedDocumentRequest',
        fields={
            'contractor_id': drf_serializers.IntegerField(),
            'document_id': drf_serializers.IntegerField(),
        },
    ),
    responses={
        200: inline_serializer(
            name='RemoveSharedDocumentResponse',
            fields={'message': drf_serializers.CharField()},
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_shared_document(request):
    """
    Remove a document from a contractor's shared items.

    Body:
        contractor_id (int)
        document_id (int)
    """
    contractor_id = request.data.get('contractor_id')
    document_id = request.data.get('document_id')

    if not contractor_id or not document_id:
        return Response(
            {'error': 'contractor_id and document_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    studio = getattr(request.user, 'studio', None)
    if not studio:
        return Response({'error': 'Your account is not linked to a studio.'}, status=status.HTTP_400_BAD_REQUEST)

    if not _studio_contractor(contractor_id, studio):
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)

    deleted, _ = ContractorSharedDocument.objects.filter(
        contractor_id=contractor_id,
        document_id=document_id,
        document__studio=studio,
    ).delete()

    if not deleted:
        return Response({'error': 'Shared document not found'}, status=status.HTTP_404_NOT_FOUND)

    _sync_document_contractor_access(int(document_id))

    return Response({'message': 'Document removed from contractor shared items'})


# ---------------------------------------------------------------------------
# Add Existing Contractor + Studio Contractor List
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Contractor Portal - Management'],
    summary='List studio contractors',
    description=(
        'Returns all contractors (contact_type=CN) in the authenticated user\'s studio. '
        'Pass ?exclude_project_id=<id> to omit contractors already linked to that project.'
    ),
    parameters=[
        OpenApiParameter(name='exclude_project_id', description='Exclude contractors already on this project', required=False, type=int),
    ],
    responses={200: ContractorProfileSerializer(many=True)},
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def studio_contractors(request):
    """
    List all CN contractors in the studio.
    Optional: exclude_project_id filters out contractors already linked to that project.
    """
    studio = request.user.studio
    if not studio:
        return Response({'error': 'User is not part of a studio'}, status=status.HTTP_400_BAD_REQUEST)

    contractors = Client.objects.filter(contact_type='CN', studio=studio)

    exclude_project_id = request.query_params.get('exclude_project_id')
    if exclude_project_id:
        already_linked = ContractorProject.objects.filter(
            project_id=exclude_project_id
        ).values_list('contractor_id', flat=True)
        contractors = contractors.exclude(id__in=already_linked)

    serializer = ContractorProfileSerializer(contractors, many=True, context={'request': request})
    return Response(serializer.data)


@extend_schema(
    tags=['Contractor Portal - Management'],
    summary='Add existing contractor to project',
    description=(
        'Links an existing CRM contractor (contact_type=CN) to a project. '
        'Idempotent — returns 200 if already linked, 201 if newly added.'
    ),
    request=inline_serializer(
        name='AddExistingContractorRequest',
        fields={
            'project_id': drf_serializers.IntegerField(required=True),
            'contractor_id': drf_serializers.IntegerField(required=True),
        },
    ),
    responses={
        201: ContractorProfileSerializer,
        200: ContractorProfileSerializer,
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_existing_contractor(request):
    """
    Link an existing contractor to a project.
    """
    project_id = request.data.get('project_id')
    contractor_id = request.data.get('contractor_id')

    if not project_id or not contractor_id:
        return Response(
            {'error': 'project_id and contractor_id are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Contractor not found. Must be a contact with type CN.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    _, created = ContractorProject.objects.get_or_create(
        contractor=contractor,
        project=project,
    )

    serializer = ContractorProfileSerializer(contractor, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Contractor Profile CRUD endpoints (Phase 3)
# ---------------------------------------------------------------------------

@extend_schema(
    methods=['GET'],
    tags=['Contractor Portal - Profile Management'],
    summary='Get contractor profile',
    description=(
        'Returns the full contractor profile including all fields: '
        'personal info, insurance, certifications, emergency contacts, and shared item counts. '
        'Requires studio authentication.'
    ),
    responses={200: ContractorProfileSerializer, 404: OpenApiTypes.OBJECT},
)
@extend_schema(
    methods=['PATCH'],
    tags=['Contractor Portal - Profile Management'],
    summary='Update contractor profile',
    description=(
        'Updates contractor profile fields. '
        'Accepts: name, surname, company_name, email, phone, trade, insurance_expiry, '
        'emergency_contact_name, emergency_contact_phone, notes. '
        'Requires studio authentication.'
    ),
    request=ContractorProfileSerializer,
    responses={200: ContractorProfileSerializer, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
)
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def contractor_profile(request, contractor_id):
    """
    Get or update contractor profile.
    GET: Returns full contractor profile.
    PATCH: Updates contractor profile fields.
    Requires studio authentication.
    """
    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Contractor not found. Must be a contact with type CN.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == 'GET':
        serializer = ContractorProfileSerializer(contractor, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PATCH':
        # Only allow updating specific fields
        allowed_fields = [
            'name', 'surname', 'company_name', 'email', 'phone', 'trade',
            'insurance_expiry', 'emergency_contact_name', 'emergency_contact_phone', 'notes'
        ]

        # Filter out non-allowed fields
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = ContractorProfileSerializer(contractor, data=update_data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


@extend_schema(
    tags=['Contractor Portal - Profile Management'],
    summary='Regenerate contractor access code',
    description=(
        'Generates a new 6-character access code for the contractor (XXXX-NN format), '
        'updates the contractor\'s access_code field, and sets their password to the new code. '
        'Requires studio authentication.'
    ),
    responses={
        200: inline_serializer(
            name='RegenerateAccessCodeResponse',
            fields={'access_code': drf_serializers.CharField()},
        ),
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_access_code(request, contractor_id):
    """
    Regenerate the contractor's access code.
    Generates a new code, updates access_code field, and sets password to new code.
    Requires studio authentication.
    """
    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Contractor not found. Must be a contact with type CN.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Generate new access code
    new_access_code = _generate_access_code(contractor.surname or 'XXXX', contractor.studio_id)

    # Update ContractorProfile and password
    profile, _ = ContractorProfile.objects.get_or_create(contractor=contractor)
    profile.access_code = new_access_code
    profile.save(update_fields=['access_code'])
    contractor.password = make_password(new_access_code)
    contractor.save(update_fields=['password'])

    return Response({'access_code': new_access_code})


# ---------------------------------------------------------------------------
# QR Code Access endpoints (Phase 2)
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Contractor Portal - QR Access'],
    summary='Get project info by QR access token',
    description=(
        'Public endpoint (no auth required) that returns basic project information '
        'when given a project access_token from a QR code. '
        'Returns project name, studio name, and whether an access code is required.'
    ),
    responses={
        200: inline_serializer(
            name='ProjectAccessTokenResponse',
            fields={
                'project_name': drf_serializers.CharField(),
                'studio_name': drf_serializers.CharField(),
                'requires_code': drf_serializers.BooleanField(),
            },
        ),
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['GET'])
@permission_classes([AllowAny])
def project_by_access_token(request, access_token):
    """
    Public endpoint to get project info by access token (from QR code).
    No authentication required.
    """
    try:
        project = Project.objects.select_related('studio').get(access_token=access_token)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'project_name': project.project_name,
        'studio_name': project.studio.name if project.studio else 'Unknown Studio',
        'requires_code': True,  # Always require access code for contractor authentication
    })


@extend_schema(
    tags=['Contractor Portal - QR Access'],
    summary='Authenticate contractor with access code',
    description=(
        'Public endpoint (no auth required) that authenticates a contractor '
        'using their personal access code for a specific project. '
        'Returns JWT tokens scoped to that contractor.'
    ),
    request=inline_serializer(
        name='ProjectAccessCodeAuthRequest',
        fields={
            'access_code': drf_serializers.CharField(help_text='6-char contractor access code (e.g. FLET-01)'),
        },
    ),
    responses={
        200: inline_serializer(
            name='ProjectAccessCodeAuthResponse',
            fields={
                'access': drf_serializers.CharField(help_text='JWT access token'),
                'refresh': drf_serializers.CharField(help_text='JWT refresh token'),
                'contractor': inline_serializer(
                    name='ContractorAuthInfo',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'name': drf_serializers.CharField(),
                        'surname': drf_serializers.CharField(),
                        'email': drf_serializers.EmailField(),
                        'company_name': drf_serializers.CharField(),
                        'trade': drf_serializers.CharField(),
                    },
                ),
                'project': inline_serializer(
                    name='ProjectAuthInfo',
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'project_name': drf_serializers.CharField(),
                    },
                ),
            },
        ),
        400: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def authenticate_with_access_code(request, access_token):
    """
    Authenticate a contractor using their access code for a project (QR flow).
    Returns JWT tokens scoped to the contractor.
    """
    from django.utils import timezone  # noqa
    access_code = request.data.get('access_code')

    if not access_code:
        return Response({'error': 'access_code is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Get the project
    try:
        project = Project.objects.get(access_token=access_token)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    # Find contractor with matching access code linked to this project
    try:
        profile = ContractorProfile.objects.select_related('contractor').get(
            access_code=access_code,
            contractor__contact_type='CN',
            contractor__contractor_portal_projects__project=project,
            contractor__is_active=True,
        )
        contractor = profile.contractor
    except ContractorProfile.DoesNotExist:
        return Response(
            {'error': 'Invalid access code for this project'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Update last login
    contractor.last_login = timezone.now()
    contractor.save(update_fields=['last_login'])

    # Generate JWT tokens
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken()
    refresh['contractor_id'] = contractor.id
    refresh['email'] = contractor.email
    refresh['type'] = 'contractor'
    refresh['project_id'] = project.id

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'contractor': {
            'id': contractor.id,
            'name': contractor.name,
            'surname': contractor.surname,
            'email': contractor.email,
            'company_name': contractor.company_name,
            'trade': profile.trade,
        },
        'project': {
            'id': project.id,
            'project_name': project.project_name,
        },
    })


# ---------------------------------------------------------------------------
# Contractor Messages (Phase 5)
# ---------------------------------------------------------------------------

@extend_schema_view(
    list=extend_schema(
        tags=['Contractor Portal - Messages'],
        summary='List messages for a project',
        description='Returns all messages between contractor and studio for the specified project.',
        parameters=[
            OpenApiParameter(name='project_id', description='ID of the project', required=True, type=int),
        ],
        responses={200: ContractorMessageSerializer(many=True)},
    ),
    create=extend_schema(
        tags=['Contractor Portal - Messages'],
        summary='Send a message',
        description='Contractor sends a message to the studio for their project.',
        request=inline_serializer(
            name='SendMessageRequest',
            fields={
                'content': drf_serializers.CharField(help_text='Message content'),
                'project_id': drf_serializers.IntegerField(help_text='Project ID'),
            },
        ),
        responses={201: ContractorMessageSerializer},
    ),
)
class ContractorMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contractor messages.
    List: Get all messages for a project
    Create: Send a new message from contractor
    """
    serializer_class = ContractorMessageSerializer
    authentication_classes = [ContractorJWTAuthentication]
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post']

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if not project_id:
            return ContractorMessage.objects.none()

        return ContractorMessage.objects.filter(project_id=project_id).select_related(
            'project', 'contractor'
        ).order_by('created_at')

    def create(self, request, *args, **kwargs):
        """
        Create a new message (from contractor or studio).
        """
        project_id = request.data.get('project_id')
        content = request.data.get('content')
        sender_type = request.data.get('sender_type', 'contractor')

        if not project_id or not content:
            return Response(
                {'error': 'project_id and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if sender_type not in ['contractor', 'studio']:
            return Response(
                {'error': 'sender_type must be "contractor" or "studio"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get the contractor from the project
        # For now, we'll get the first contractor linked to this project
        contractor_project = ContractorProject.objects.filter(project=project).first()
        if not contractor_project:
            return Response(
                {'error': 'No contractor found for this project'},
                status=status.HTTP_404_NOT_FOUND
            )

        message = ContractorMessage.objects.create(
            project=project,
            contractor=contractor_project.contractor,
            content=content,
            sender_type=sender_type,
        )

        serializer = self.get_serializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        tags=['Contractor Portal - Messages'],
        summary='Get unread message count',
        description='Returns the count of unread messages for the contractor.',
        parameters=[
            OpenApiParameter(name='project_id', description='ID of the project', required=True, type=int),
        ],
        responses={
            200: inline_serializer(
                name='UnreadCountResponse',
                fields={'count': drf_serializers.IntegerField()},
            ),
        },
    )
    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """
        Get count of unread messages sent by studio (not read by contractor).
        """
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        count = ContractorMessage.objects.filter(
            project_id=project_id,
            sender_type='studio',
            is_read=False,
        ).count()

        return Response({'count': count})


# ---------------------------------------------------------------------------
# Contractor active projects
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Contractor Portal - Projects'],
    summary='List active projects for a contractor',
    description=(
        'Returns all active (project_status=AC) projects linked to the authenticated contractor. '
        'Each entry includes the project id, name, and location.'
    ),
    parameters=[
        OpenApiParameter(name='contractor_id', description='ID of the contractor', required=True, type=int),
    ],
    responses={
        200: inline_serializer(
            name='ContractorActiveProjectsResponse',
            fields={
                'projects': inline_serializer(
                    name='ContractorActiveProject',
                    many=True,
                    fields={
                        'id': drf_serializers.IntegerField(),
                        'project_name': drf_serializers.CharField(),
                        'location': drf_serializers.CharField(allow_null=True),
                    },
                ),
            },
        ),
        400: OpenApiTypes.OBJECT,
        404: OpenApiTypes.OBJECT,
    },
)
@api_view(['GET'])
@permission_classes([AllowAny])
def contractor_active_projects(request):
    """
    Returns all active projects linked to a contractor.
    Authenticated via contractor JWT or contractor_id query param.
    """
    contractor_id = request.query_params.get('contractor_id')
    if not contractor_id:
        return Response({'error': 'contractor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contractor = Client.objects.get(id=contractor_id, contact_type='CN')
    except Client.DoesNotExist:
        return Response({'error': 'Contractor not found'}, status=status.HTTP_404_NOT_FOUND)

    projects = Project.objects.filter(
        contractor_access_grants__contractor=contractor,
        project_status='AC',
    ).values('id', 'project_name', 'location')

    return Response({'projects': list(projects)})
