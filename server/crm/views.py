from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from .models import Client, ClientNote, Lead, Proposal, ProposalLineItem
from .serializers import ClientSerializer, ClientNoteSerializer, LeadSerializer, ProposalSerializer, ProposalLineItemSerializer
from .pagination import StandardResultsSetPagination
from users.models import User
from users.permissions import ClientsViewPermission
from django.db.models import Q
from django.conf import settings
from techstyles.resend_utils import send_proposal_email
from techstyles.mixins import StudioScopedMixin


@extend_schema(tags=['Clients'])
class ClientViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    """
    CRUD endpoints for Clients (contacts, suppliers, contractors).

    Each client can have multiple timestamped notes managed via the `/notes/` sub-endpoints.
    Notes are returned as `client_notes` in every `ClientSerializer` response.
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated, ClientsViewPermission]

    @extend_schema(
        summary="List all clients",
        description="Returns all clients. Use the standard filters or search on the `studio-contacts` endpoint for pagination and filtering.",
        responses={200: ClientSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve a client",
        description="Returns the full client detail including all associated notes (`client_notes`).",
        responses={200: ClientSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Create a client",
        description=(
            "Creates a new client record. `contact_type` must be one of `CL` (Client), "
            "`SP` (Supplier), or `CN` (Contractor).\n\n"
            "**Supplier-only fields** — the following fields may only be set when `contact_type` is `SP`. "
            "Passing them for any other contact type returns a 400 validation error:\n\n"
            "- `trade_login_url` — URL of the supplier's trade portal login page.\n"
            "- `supplier_user_id` — Username / user ID for the trade portal.\n"
            "- `supplier_password` — Password for the trade portal (stored as plain text)."
        ),
        request=ClientSerializer,
        responses={201: ClientSerializer},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Update a client (full)",
        description=(
            "Full update of a client record. "
            "`trade_login_url`, `supplier_user_id`, and `supplier_password` "
            "can only be set when `contact_type` is `SP`."
        ),
        request=ClientSerializer,
        responses={200: ClientSerializer},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partially update a client",
        description=(
            "Partial update of a client record. "
            "`trade_login_url`, `supplier_user_id`, and `supplier_password` "
            "can only be set when `contact_type` is `SP`."
        ),
        request=ClientSerializer,
        responses={200: ClientSerializer},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete a client",
        responses={204: None},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="Add a note to a client",
        description=(
            "Creates a new note on the client. The note is timestamped automatically "
            "and the creating user is recorded. Returns the full updated client including all notes."
        ),
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'note': {'type': 'string', 'description': 'The note text to add.'},
                },
                'required': ['note'],
            }
        },
        responses={201: ClientSerializer, 400: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='notes', permission_classes=[IsAuthenticated])
    def add_note(self, request, pk=None):
        client = self.get_object()
        note_text = request.data.get('note', '').strip()
        if not note_text:
            return Response({'error': 'note is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ClientNote.objects.create(client=client, note=note_text, created_by=request.user)
        return Response(ClientSerializer(client).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Edit a note on a client",
        description=(
            "Updates the text of an existing note by its ID. `updated_at` is refreshed automatically. "
            "Returns the full updated client including all notes."
        ),
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'note': {'type': 'string', 'description': 'The updated note text.'},
                },
                'required': ['note'],
            }
        },
        responses={200: ClientSerializer, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['patch'], url_path='notes/(?P<note_pk>[^/.]+)', permission_classes=[IsAuthenticated])
    def edit_note(self, request, pk=None, note_pk=None):
        client = self.get_object()
        try:
            note = client.client_notes.get(pk=note_pk)
        except ClientNote.DoesNotExist:
            return Response({'error': 'Note not found.'}, status=status.HTTP_404_NOT_FOUND)
        note_text = request.data.get('note', '').strip()
        if not note_text:
            return Response({'error': 'note is required.'}, status=status.HTTP_400_BAD_REQUEST)
        note.note = note_text
        note.save(update_fields=['note', 'updated_at'])
        return Response(ClientSerializer(client).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Delete a note from a client",
        description="Permanently removes a note by its ID. Returns the full updated client including remaining notes.",
        responses={200: ClientSerializer, 404: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['delete'], url_path='notes/(?P<note_pk>[^/.]+)/delete', permission_classes=[IsAuthenticated])
    def delete_note(self, request, pk=None, note_pk=None):
        client = self.get_object()
        try:
            note = client.client_notes.get(pk=note_pk)
        except ClientNote.DoesNotExist:
            return Response({'error': 'Note not found.'}, status=status.HTTP_404_NOT_FOUND)
        note.delete()
        return Response(ClientSerializer(client).data, status=status.HTTP_200_OK)


@extend_schema(tags=['Leads'])
class LeadViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    filterset_fields = ['stage', 'owner', 'studio']
    permission_classes = [IsAuthenticated, ClientsViewPermission]

    @extend_schema(
        summary="Create a project from a lead",
        description=(
            "Creates a new Project using the lead's data and marks the lead as `project_created=True`. "
            "Pass `client` (ID) to associate the project with a client. "
            "Any field included in the request body overrides the value inferred from the lead."
        ),
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'client_email': {'type': 'string', 'format': 'email', 'description': 'Email of an existing client to link to the project'},
                    'project_name': {'type': 'string', 'description': 'Overrides the lead title'},
                    'project_type': {'type': 'string', 'description': 'RS | CM | HS (defaults to lead type mapping)'},
                    'location': {'type': 'string'},
                    'start_date': {'type': 'string', 'format': 'date'},
                    'total_budget': {'type': 'number'},
                },
            }
        },
        responses={201: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=['post'], url_path='create-project', permission_classes=[IsAuthenticated])
    def create_project(self, request, pk=None):
        from projects.models import Project
        from projects.serializers import ProjectSerializer, ProjectGetSerializer

        lead = self.get_object()

        if lead.project_created:
            return Response(
                {
                    'error': 'A project has already been created from this lead.',
                    'project_id': lead.project_id,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        PROJECT_TYPE_MAP = {'residential': 'RS', 'commercial': 'CM', 'hospitality': 'HS'}
        lead_type_raw = (lead.project_type or lead.lead_type or '').lower()
        inferred_project_type = PROJECT_TYPE_MAP.get(lead_type_raw, 'RS')

        client_id = None
        client_email = request.data.get('client_email')
        if client_email:
            # try:
            client = Client.objects.get(email=client_email)
            client_id = client.id
            # except Client.DoesNotExist:
            #     return Response(
            #         {'error': f'No client found with email "{client_email}" in this studio.'},
            #         status=status.HTTP_400_BAD_REQUEST,
            #     )

        project_data = {
            'project_name': request.data.get('project_name') or lead.title,
            'project_type': request.data.get('project_type', inferred_project_type),
            'location': request.data.get('location') or lead.location,
            'start_date': request.data.get('start_date') or lead.project_start_date,
            'total_budget': request.data.get('total_budget') or (
                float(lead.final_value) if lead.final_value else None
            ),
            'studio': lead.studio_id,
            'client': client_id,
        }
        project_data = {k: v for k, v in project_data.items() if v is not None}

        serializer = ProjectSerializer(data=project_data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        project = serializer.save(created_by=request.user)
        project.assignees.add(request.user)

        lead.project_created = True
        lead.project = project
        lead.save(update_fields=['project_created', 'project'])

        return Response(ProjectGetSerializer(project).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Bulk delete leads",
        description="Delete multiple leads by providing a list of IDs.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'ids': {
                        'type': 'array',
                        'items': {'type': 'integer'}
                    }
                },
                'required': ['ids']
            }
        },
        responses={204: None, 400: OpenApiTypes.OBJECT}
    )
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not ids:
             return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        leads = Lead.objects.filter(id__in=ids, studio=self.request.user.studio)
        deleted_count, _ = leads.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated, ClientsViewPermission])
def get_studio_clients(request):
    """
    Get all clients for the authenticated user's studio.
    """
    user = User.objects.get(id=request.user.id)
    if not user.studio:
        return Response(
            {'error': 'User is not associated with any studio'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    clients = Client.objects.filter(studio=user.studio, contact_type='CL')
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, ClientsViewPermission])
def get_studio_suppliers(request):
    """
    Get all suppliers for the authenticated user's studio.
    """
    user = User.objects.get(id=request.user.id)
    if not user.studio:
        return Response(
            {'error': 'User is not associated with any studio'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    clients = Client.objects.filter(studio=user.studio, contact_type='SP')
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ClientsViewPermission])
def get_studio_contacts(request):
    """
    Get all suppliers for the authenticated user's studio.
    """
    user = User.objects.get(id=request.user.id)
    if not user.studio:
        return Response(
            {'error': 'User is not associated with any studio'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    clients = Client.objects.filter(studio=user.studio).order_by('-created_at')
    
    # Filter by contact_type
    contact_type = request.query_params.get('contact_type', None)
    if contact_type:
        clients = clients.filter(contact_type=contact_type)
        
    # Search functionality
    search_query = request.query_params.get('search', None)
    if search_query:
        clients = clients.filter(
            Q(name__icontains=search_query) |
            Q(surname__icontains=search_query) |
            Q(company_name__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(phone__icontains=search_query)
        )
        
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(clients, request)
    if page is not None:
        serializer = ClientSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    serializer = ClientSerializer(clients, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


def _get_proposal_email_html(proposal, studio_name):
    client_name = proposal.client.name or proposal.client.company_name or 'Client'

    # Build line items rows
    line_items_html = ''
    for item in proposal.line_items.all():
        line_items_html += f"""
          <tr>
            <td style="padding: 12px 16px; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">{item.description}</td>
            <td style="padding: 12px 16px; color: #374151; font-size: 14px; text-align: center; border-bottom: 1px solid #e5e7eb;">{item.quantity}</td>
            <td style="padding: 12px 16px; color: #374151; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">{proposal.currency} {item.rate}</td>
            <td style="padding: 12px 16px; color: #111827; font-size: 14px; font-weight: 500; text-align: right; border-bottom: 1px solid #e5e7eb;">{proposal.currency} {item.amount}</td>
          </tr>"""

    cover_message_html = ''
    if proposal.cover_message:
        cover_message_html = f"""
          <tr>
            <td style="padding: 0 32px 28px;">
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">{proposal.cover_message}</p>
            </td>
          </tr>"""

    valid_until_html = ''
    if proposal.valid_until:
        valid_until_html = f'<p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">Valid until {proposal.valid_until.strftime("%d %B %Y")}</p>'

    payment_schedule_labels = {
        '50_50': '50/50 Split', 'three_payments': 'Three Payments',
        'per_phase': 'Per Phase', 'monthly': 'Monthly',
    }
    payment_label = payment_schedule_labels.get(proposal.payment_schedule, proposal.payment_schedule)

    scope_html = ''
    if proposal.scope_description:
        scope_html = f"""
          <tr>
            <td style="padding: 0 32px 28px;">
              <p style="margin: 0 0 10px; color: #111827; font-size: 15px; font-weight: 600;">Scope of Work</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; white-space: pre-line;">{proposal.scope_description}</p>
            </td>
          </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>{proposal.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">{studio_name}</h1>
              <p style="margin: 8px 0 0; color: #d1d5db; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">Proposal</p>
            </td>
          </tr>

          <!-- Title & Greeting -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <h2 style="margin: 0 0 6px; color: #111827; font-size: 20px; font-weight: 600;">{proposal.title}</h2>
              {valid_until_html}
              <p style="margin: 20px 0 0; color: #6b7280; font-size: 15px; line-height: 1.5;">
                Dear {client_name},
              </p>
            </td>
          </tr>

          <!-- Cover Message -->
          {cover_message_html}

          <!-- Line Items Table -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-align: left; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb;">Description</th>
                    <th style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb;">Qty</th>
                    <th style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-align: right; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb;">Rate</th>
                    <th style="padding: 12px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-align: right; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {line_items_html}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Subtotal</td>
                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">{proposal.currency} {proposal.subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Tax ({proposal.tax_rate}%)</td>
                  <td style="padding: 14px 20px; color: #374151; font-size: 14px; text-align: right; border-bottom: 1px solid #e5e7eb;">{proposal.currency} {proposal.tax_amount}</td>
                </tr>
                <tr style="background-color: #111827;">
                  <td style="padding: 16px 20px; color: #ffffff; font-size: 15px; font-weight: 600;">Total</td>
                  <td style="padding: 16px 20px; color: #ffffff; font-size: 15px; font-weight: 600; text-align: right;">{proposal.currency} {proposal.total}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Schedule -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px;">
                <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Payment Schedule</p>
                <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 500;">{payment_label}</p>
              </div>
            </td>
          </tr>

          <!-- Scope of Work -->
          {scope_html}

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                © 2025 {studio_name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


@extend_schema(tags=['Proposals'])
class ProposalViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    """
    CRUD endpoints for Proposals.

    Proposals move through a 4-step wizard on the frontend:
    1. Client & Details (title, client, currency, valid_until, cover_message)
    2. Scope of Work (scope_description, terms_and_conditions, terms_type)
    3. Pricing (line_items, tax_rate, payment_schedule)
    4. Review & Send (completeness checklist, send action)

    Filter query params: `status`, `client`
    """
    queryset = Proposal.objects.prefetch_related('line_items').select_related('client', 'studio', 'created_by')
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated, ClientsViewPermission]

    def get_queryset(self):
        # StudioScopedMixin already filters by studio — additional optional filters below
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @extend_schema(
        summary="List proposals",
        description="Returns all proposals for the authenticated user. Filterable by `studio`, `status` (DFT/SNT/ACC/DCL), and `client`.",
        parameters=[
            OpenApiParameter('studio', OpenApiTypes.INT, OpenApiParameter.QUERY, description='Filter by studio ID'),
            OpenApiParameter('status', OpenApiTypes.STR, OpenApiParameter.QUERY, description='Filter by status: DFT, SNT, ACC, DCL'),
            OpenApiParameter('client', OpenApiTypes.INT, OpenApiParameter.QUERY, description='Filter by client ID'),
        ],
        responses={200: ProposalSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create a proposal",
        description=(
            "Create a new proposal. Line items can be included in the same request. "
            "Subtotal, tax_amount, and total are computed automatically from line items and tax_rate."
        ),
        request=ProposalSerializer,
        responses={201: ProposalSerializer},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve a proposal",
        description="Returns the full proposal detail including line items and the `completeness` checklist used by the Review & Send step.",
        responses={200: ProposalSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update a proposal (full)",
        description="Full update. If `line_items` is provided, existing line items are replaced. Totals are recalculated automatically.",
        request=ProposalSerializer,
        responses={200: ProposalSerializer},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partially update a proposal",
        description="Partial update. If `line_items` is provided, existing line items are replaced. Totals are recalculated automatically.",
        request=ProposalSerializer,
        responses={200: ProposalSerializer},
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete a proposal",
        responses={204: None},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary="Bulk delete proposals",
        description="Delete multiple proposals by providing a list of IDs.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'ids': {
                        'type': 'array',
                        'items': {'type': 'integer'}
                    }
                },
                'required': ['ids']
            }
        },
        responses={204: None, 400: OpenApiTypes.OBJECT}
    )
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        proposals = Proposal.objects.filter(id__in=ids, studio=self.request.user.studio)
        proposals.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Send proposal to client via email",
        description=(
            "Sends the proposal to the client's email address via Resend using a branded HTML email template. "
            "On success the proposal status is updated to `SNT`."
        ),
        request=None,
        responses={
            200: ProposalSerializer,
            400: OpenApiTypes.OBJECT,
            500: OpenApiTypes.OBJECT,
        },
    )
    @action(detail=True, methods=['post'], url_path='send')
    def send(self, request, pk=None):
        proposal = self.get_object()

        if not proposal.client:
            return Response({'error': 'Proposal has no client assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        if not proposal.client.email:
            return Response({'error': 'Client has no email address.'}, status=status.HTTP_400_BAD_REQUEST)

        studio_name = proposal.studio.name if proposal.studio else 'Focuspilot'
        html_content = _get_proposal_email_html(proposal, studio_name)

        plain_body = (
            f"Dear {proposal.client.name or 'Client'},\n\n"
            f"Please find your proposal: {proposal.title}\n\n"
        )
        for item in proposal.line_items.all():
            plain_body += f"  - {item.description}: {proposal.currency} {item.amount}\n"
        plain_body += (
            f"\nSubtotal: {proposal.currency} {proposal.subtotal}\n"
            f"Tax ({proposal.tax_rate}%): {proposal.currency} {proposal.tax_amount}\n"
            f"Total: {proposal.currency} {proposal.total}\n"
            f"Valid until: {proposal.valid_until or 'N/A'}\n\n"
            f"Best regards,\n{studio_name}"
        )

        try:
            send_proposal_email(proposal.client.email, studio_name, proposal.title, html_content, plain_body)
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        proposal.status = 'SNT'
        proposal.save(update_fields=['status'])

        return Response(ProposalSerializer(proposal).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update a single line item on a proposal",
        description=(
            "Partially update one line item by its ID. The proposal totals (subtotal, tax_amount, total) "
            "are recalculated automatically after the update."
        ),
        request=ProposalLineItemSerializer,
        responses={
            200: ProposalSerializer,
            404: OpenApiTypes.OBJECT,
        },
    )
    @action(detail=True, methods=['patch'], url_path='line-items/(?P<item_pk>[^/.]+)')
    def update_line_item(self, request, pk=None, item_pk=None):
        proposal = self.get_object()
        try:
            item = proposal.line_items.get(pk=item_pk)
        except ProposalLineItem.DoesNotExist:
            return Response({'error': 'Line item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProposalLineItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        proposal.recalculate_totals()
        proposal.save(update_fields=['subtotal', 'tax_amount', 'total'])

        return Response(ProposalSerializer(proposal).data, status=status.HTTP_200_OK)