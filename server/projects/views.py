from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Phase, Room, Project, Procurement
from .serializers import PhaseSerializer, RoomSerializer, ProjectSerializer, ProcurementSerializer, ProjectGetSerializer, ProcurementGetSerializer, StudioPhaseSerializer, ProjectOverviewSerializer, UserProjectPhasesSerializer, PhaseWithTasksSerializer
from users.models import User
from users.permissions import ProjectsViewPermission
from task.models import Task
from finance.models import PurchaseOrder, Invoice
from xero.utils import update_xero_statuses
from documents.models import Document
from django.db.models import Sum
from django.utils import timezone
from itertools import chain
from operator import attrgetter
import datetime
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from rest_framework import serializers as drf_serializers
from techstyles.mixins import StudioScopedMixin
from techstyles.email_branding import email_brand_row_html

class PhaseViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Phase.objects.all()
    serializer_class = PhaseSerializer
    permission_classes = [IsAuthenticated, ProjectsViewPermission]


class RoomViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated, ProjectsViewPermission]
   

def _get_project_proposal_email_html(project, studio_name, accept_url):
    client = project.client
    client_name = (client.name or client.company_name or 'Client') if client else 'Client'
    project_name = project.project_name or 'Project Proposal'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>{project_name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              {email_brand_row_html(align='center')}
              <h1 style="margin: 16px 0 0; color: #ffffff; font-size: 26px; font-weight: 600;">{studio_name}</h1>
              <p style="margin: 8px 0 0; color: #d1d5db; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">Project Proposal</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">{project_name}</h2>
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Dear {client_name},
              </p>
              <p style="margin: 16px 0 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                We are pleased to present our proposal for <strong style="color: #111827;">{project_name}</strong>.
                Please review the details and accept the proposal using the button below.
              </p>
            </td>
          </tr>

          <!-- Project Info -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb; width: 40%;">Project</td>
                  <td style="padding: 14px 20px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e5e7eb;">{project_name}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Type</td>
                  <td style="padding: 14px 20px; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">{project.get_project_type_display() if project.project_type else '—'}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px;">Location</td>
                  <td style="padding: 14px 20px; color: #111827; font-size: 14px;">{project.location or '—'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accept Button -->
          <tr>
            <td style="padding: 0 32px 40px; text-align: center;">
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                By clicking the button below you confirm acceptance of this proposal.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: #111827;">
                    <a href="{accept_url}"
                       target="_blank"
                       style="display: block; padding: 14px 40px; background-color: #111827; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.02em; white-space: nowrap; -webkit-text-size-adjust: none; mso-padding-alt: 0; text-align: center;">
                      <!--[if mso]><i style="letter-spacing: 40px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
                      Accept Proposal
                      <!--[if mso]><i style="letter-spacing: 40px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

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


class _ProjectCreateSerializer(ProjectSerializer):
    template_id = drf_serializers.IntegerField(
        required=False,
        allow_null=True,
        write_only=True,
        help_text=(
            'Optional ID of a ProjectTemplate. When provided, the project is automatically '
            'seeded with the template\'s phases and default tasks. If omitted or invalid, '
            'the project is created with no phases and no tasks.'
        ),
    )


@extend_schema_view(
    create=extend_schema(
        request=_ProjectCreateSerializer,
        description=(
            'Create a new project. Optionally supply `template_id` to seed the project '
            'with phases and default tasks from a saved ProjectTemplate.\n\n'
            '**Address fields** — each of the three project addresses is stored as structured '
            'fields rather than a single string:\n\n'
            '**Delivery address:** `delivery_address_line_1`, `delivery_address_line_2`, '
            '`delivery_city`, `delivery_county`, `delivery_postcode`, `delivery_country`\n\n'
            '**Billing address:** `billing_address_line_1`, `billing_address_line_2`, '
            '`billing_city`, `billing_county`, `billing_postcode`, `billing_country`\n\n'
            '**Logistics address:** `logistics_address_line_1`, `logistics_address_line_2`, '
            '`logistics_city`, `logistics_county`, `logistics_postcode`, `logistics_country`'
        ),
    ),
    update=extend_schema(
        description=(
            'Full update of a project. See `create` for address field structure.'
        ),
    ),
    partial_update=extend_schema(
        description=(
            'Partial update of a project. See `create` for address field structure.'
        ),
    ),
)
class ProjectViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, ProjectsViewPermission]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectGetSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        """
        Creates a project and, if a template_id is supplied in the request body,
        automatically seeds it with the phases and default tasks from that template.

        Each phase in the template becomes a real Phase linked to the project.
        Each default task under a phase becomes a real Task linked to both
        the project and the newly created phase.

        If template_id is omitted or does not exist, the project is created
        with no phases and no tasks.
        """
        from users.models import ProjectTemplate
        project = serializer.save()
        try:
            from notion.outbound import push_project_to_notion
            push_project_to_notion(project, self.request.user)
        except Exception:
            pass
        try:
            from integrations.events import EVENT_PROJECT_CREATED, emit_studio_event
            emit_studio_event(
                self.request.user.studio,
                EVENT_PROJECT_CREATED,
                {
                    'id': project.id,
                    'project_name': project.project_name,
                    'project_status': project.project_status,
                },
            )
        except Exception:
            pass
        template_id = self.request.data.get('template_id')
        if not template_id:
            return
        try:
            template = ProjectTemplate.objects.prefetch_related(
                'phases__default_tasks'
            ).get(id=template_id)
        except ProjectTemplate.DoesNotExist:
            return
        studio = self.request.user.studio
        for phase_tmpl in template.phases.all():
            phase = Phase.objects.create(
                name=phase_tmpl.name,
                studio=studio,
                created_by=self.request.user,
            )
            project.phases.add(phase)
            for task_tmpl in phase_tmpl.default_tasks.all():
                Task.objects.create(
                    title=task_tmpl.title,
                    project=project,
                    phase=phase,
                    studio=studio,
                    created_by=self.request.user,
                )

    @action(detail=True, methods=['post'], url_path='send-proposal')
    def send_proposal(self, request, pk=None):
        from .models import ProjectProposalToken
        from techstyles.resend_utils import send_project_proposal_email

        project = self.get_object()

        if not project.client:
            return Response({'error': 'Project has no client assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        if not project.client.email:
            return Response({'error': 'Client has no email address.'}, status=status.HTTP_400_BAD_REQUEST)

        token = ProjectProposalToken.objects.create(project=project)
        accept_url = f"{settings.FRONTEND_URL}/proposal/accept/{token.token}/"

        studio_name = project.studio.name if project.studio else 'Focuspilot'
        html_content = _get_project_proposal_email_html(project, studio_name, accept_url)
        plain_body = (
            f"Dear {project.client.name or 'Client'},\n\n"
            f"We are pleased to present our proposal for {project.project_name}.\n\n"
            f"To accept this proposal, visit:\n{accept_url}\n\n"
            f"Best regards,\n{studio_name}"
        )

        try:
            send_project_proposal_email(project.client.email, studio_name, project.project_name, html_content, plain_body)
        except Exception as e:
            token.delete()
            return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Proposal sent successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
def accept_project_proposal(request, token):
    from .models import ProjectProposalToken
    try:
        proposal_token = ProjectProposalToken.objects.select_related('project').get(token=token)
    except ProjectProposalToken.DoesNotExist:
        return Response({'error': 'Invalid or expired link.'}, status=status.HTTP_404_NOT_FOUND)

    if not proposal_token.is_valid():
        return Response({'error': 'This proposal link has already been used or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    project = proposal_token.project
    project.project_status = 'WON'
    project.save(update_fields=['project_status'])

    proposal_token.accepted = True
    proposal_token.save(update_fields=['accepted'])

    return Response({'detail': 'Proposal accepted. The project has been marked as won.'}, status=status.HTTP_200_OK)


def _procurement_change_email_html(procurement, studio_name, client_name, old_qty, old_price, new_qty, new_price, qty_changed, price_changed):
    project = procurement.project
    project_name = project.project_name if project else '—'
    product_name = procurement.product.name if procurement.product else '—'
    currency = (project.currency or '£') if project else '£'

    unit_label = procurement.get_unit_type_display() or ''
    if unit_label == 'm^^2':
        unit_label = 'm²'

    change_rows = ''
    if qty_changed:
        change_rows += f"""
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb; width: 40%;">Quantity</td>
                  <td style="padding: 14px 20px; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; text-decoration: line-through;">{old_qty} {unit_label}</span>
                    &nbsp;&rarr;&nbsp;
                    <span style="color: #111827; font-weight: 600;">{new_qty} {unit_label}</span>
                  </td>
                </tr>"""
    if price_changed:
        old_p = f"{currency} {float(old_price):,.2f}" if old_price is not None else '—'
        new_p = f"{currency} {float(new_price):,.2f}" if new_price is not None else '—'
        change_rows += f"""
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; width: 40%;">Unit Price (inc. VAT)</td>
                  <td style="padding: 14px 20px; font-size: 14px;">
                    <span style="color: #6b7280; text-decoration: line-through;">{old_p}</span>
                    &nbsp;&rarr;&nbsp;
                    <span style="color: #111827; font-weight: 600;">{new_p}</span>
                  </td>
                </tr>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Procurement Item Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              {email_brand_row_html(align='center')}
              <h1 style="margin: 16px 0 0; color: #ffffff; font-size: 26px; font-weight: 600;">{studio_name}</h1>
              <p style="margin: 8px 0 0; color: #d1d5db; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">Procurement Update</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 20px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">{product_name}</h2>
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Dear {client_name},
              </p>
              <p style="margin: 16px 0 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                We wanted to let you know that an item you previously approved on project <strong style="color: #111827;">{project_name}</strong> has been updated. Please review the changes below.
              </p>
            </td>
          </tr>

          <!-- Change Summary -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb; width: 40%;">Project</td>
                  <td style="padding: 14px 20px; color: #111827; font-size: 14px; font-weight: 500; border-bottom: 1px solid #e5e7eb;">{project_name}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 20px; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Item</td>
                  <td style="padding: 14px 20px; color: #111827; font-size: 14px; border-bottom: 1px solid #e5e7eb;">{product_name}</td>
                </tr>
                {change_rows}
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding: 0 32px 40px;">

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                &copy; 2025 Focuspilot. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _send_procurement_change_email(procurement, old_qty, old_price, new_qty, new_price, qty_changed, price_changed):
    from techstyles.resend_utils import send_procurement_change_email

    project = procurement.project
    client = project.client if project else None
    if not client or not client.email:
        return

    studio_name = (procurement.studio.name if procurement.studio else None) or 'Focuspilot'
    client_name = client.name or client.company_name or 'Client'
    product_name = procurement.product.name if procurement.product else '—'

    html_message = _procurement_change_email_html(
        procurement, studio_name, client_name,
        old_qty, old_price, new_qty, new_price,
        qty_changed, price_changed,
    )

    changed_fields = []
    if qty_changed:
        changed_fields.append(f"Quantity: {old_qty} -> {new_qty}")
    if price_changed:
        changed_fields.append(f"Unit Price: {old_price} -> {new_price}")
    plain_message = (
        f"Dear {client_name},\n\n"
        f"An item you approved on project '{project.project_name}' has been updated.\n\n"
        f"Item: {product_name}\n"
        + "\n".join(changed_fields) +
        f"{studio_name}"
    )

    send_procurement_change_email(client.email, studio_name, html_message, plain_message)


def _send_bulk_procurement_change_email(procurement_changes):
    """Send a single email summarising changes across multiple procurement lines.

    procurement_changes: list of
        (procurement, old_qty, old_price, new_qty, new_price, qty_changed, price_changed)
    All entries are expected to belong to the same project / client.
    """
    from techstyles.resend_utils import send_bulk_procurement_change_email

    if not procurement_changes:
        return

    first_proc = procurement_changes[0][0]
    project = first_proc.project
    client = project.client if project else None
    if not client or not client.email:
        return

    studio_name = (first_proc.studio.name if first_proc.studio else None) or 'Focuspilot'
    client_name = client.name or client.company_name or 'Client'
    project_name = project.project_name if project else '—'
    currency = (project.currency or '£') if project else '£'

    item_cards = ''
    plain_lines = []

    for procurement, old_qty, old_price, new_qty, new_price, qty_changed, price_changed in procurement_changes:
        product_name = procurement.product.name if procurement.product else '—'
        unit_label = procurement.get_unit_type_display() or ''
        if unit_label == 'm^^2':
            unit_label = 'm²'

        change_detail_rows = ''

        if qty_changed:
            change_detail_rows += f"""
                  <tr>
                    <td style="padding: 10px 16px; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb; width: 40%; white-space: nowrap;">Quantity</td>
                    <td style="padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #9ca3af; text-decoration: line-through;">{old_qty} {unit_label}</span>
                      &nbsp;&rarr;&nbsp;
                      <span style="color: #111827; font-weight: 600;">{new_qty} {unit_label}</span>
                    </td>
                  </tr>"""
            plain_lines.append(f"  Quantity: {old_qty} {unit_label} -> {new_qty} {unit_label}")

        if price_changed:
            old_p = f"{currency} {float(old_price):,.2f}" if old_price is not None else '—'
            new_p = f"{currency} {float(new_price):,.2f}" if new_price is not None else '—'
            change_detail_rows += f"""
                  <tr>
                    <td style="padding: 10px 16px; color: #6b7280; font-size: 13px; width: 40%; white-space: nowrap;">Unit Price (inc. VAT)</td>
                    <td style="padding: 10px 16px; font-size: 13px;">
                      <span style="color: #9ca3af; text-decoration: line-through;">{old_p}</span>
                      &nbsp;&rarr;&nbsp;
                      <span style="color: #111827; font-weight: 600;">{new_p}</span>
                    </td>
                  </tr>"""
            plain_lines.append(f"  Unit Price: {old_price} -> {new_price}")

        plain_lines.insert(-len(plain_lines) if plain_lines else 0, f"\n{product_name}")

        item_cards += f"""
          <tr>
            <td style="padding: 0 32px 16px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #111827; border-radius: 8px 8px 0 0;">
                    <span style="color: #ffffff; font-size: 14px; font-weight: 600;">{product_name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb;">
                      {change_detail_rows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>"""

    # Rebuild plain_lines properly (they were inserted out of order above)
    plain_lines = []
    for procurement, old_qty, old_price, new_qty, new_price, qty_changed, price_changed in procurement_changes:
        product_name = procurement.product.name if procurement.product else '—'
        unit_label = procurement.get_unit_type_display() or ''
        if unit_label == 'm^^2':
            unit_label = 'm²'
        plain_lines.append(f"\n{product_name}")
        if qty_changed:
            plain_lines.append(f"  Quantity: {old_qty} {unit_label} -> {new_qty} {unit_label}")
        if price_changed:
            plain_lines.append(f"  Unit Price: {old_price} -> {new_price}")

    html_message = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Procurement Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 32px; text-align: center; background-color: #111827;">
              {email_brand_row_html(align='center')}
              <h1 style="margin: 16px 0 0; color: #ffffff; font-size: 26px; font-weight: 600;">{studio_name}</h1>
              <p style="margin: 8px 0 0; color: #d1d5db; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;">Procurement Update</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Dear {client_name},
              </p>
              <p style="margin: 16px 0 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                We wanted to let you know that items you previously approved on project <strong style="color: #111827;">{project_name}</strong> have been updated. Please review the changes below.
              </p>
            </td>
          </tr>

          <!-- Item cards -->
          {item_cards}

          <!-- Note -->
          <tr>
            <td style="padding: 8px 32px 40px;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
                &copy; 2025 Focuspilot. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    plain_message = (
        f"Dear {client_name},\n\n"
        f"Items you approved on project '{project_name}' have been updated.\n\n"
        + "\n".join(plain_lines) +
        "\n\nIf you have any questions, please contact your project manager.\n\n"
        f"{studio_name}"
    )

    send_bulk_procurement_change_email(client.email, studio_name, html_message, plain_message)


class ProcurementViewSet(StudioScopedMixin, viewsets.ModelViewSet):
    queryset = Procurement.objects.all()
    serializer_class = ProcurementSerializer
    permission_classes = [IsAuthenticated, ProjectsViewPermission]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProcurementGetSerializer
        return ProcurementSerializer

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        if project and project.procurement_client_access:
            serializer.save(client_access=True)
        else:
            serializer.save()

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)

        # Capture values before saving to detect changes on approved items
        old_quantity = instance.quantity
        old_unit_price = instance.unit_price
        is_client_approved = instance.client_approval == 'APR'

        if new_status == 'IA' and instance.status != 'IA':
            from django.utils import timezone as tz
            serializer.save(
                internally_approved_by=self.request.user,
                internally_approved_at=tz.now(),
            )
        else:
            serializer.save()

        if is_client_approved:
            updated = serializer.instance
            qty_changed = updated.quantity != old_quantity
            price_changed = updated.unit_price != old_unit_price
            if qty_changed or price_changed:
                try:
                    _send_procurement_change_email(
                        updated,
                        old_quantity, old_unit_price,
                        updated.quantity, updated.unit_price,
                        qty_changed, price_changed,
                    )
                except Exception as e:
                    print(f"Error sending procurement change email: {str(e)}")

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    def bulk_delete(self, request):
        """
        Bulk delete procurements.
        Payload: {"ids": [1, 2, 3]}
        """
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No IDs provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        procurements = Procurement.objects.filter(id__in=ids, studio=self.request.user.studio)
        count = procurements.count()
        procurements.delete()
        
        return Response(
            {'message': f'{count} procurements deleted successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['get'], url_path='comments')
    def comments(self, request, pk=None):
        """
        Get all comments for a specific procurement.
        """
        procurement = self.get_object()
        comments = procurement.comments.all()
        from comment.serializers import CommentGetSerializer
        serializer = CommentGetSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_studio_projects(request):
    """
    Get all projects assigned to the authenticated user.
    """
    user = User.objects.get(id=request.user.id)
    projects = Project.objects.filter(studio=user.studio)
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_user_projects(request):
    """
    Get all projects assigned to the authenticated user.
    """
    projects = Project.objects.filter(assignees=request.user)
    serializer = ProjectGetSerializer(projects, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_project_procurements(request):
    """
    Get all procurements for a specific project.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    procurements = (
        Procurement.objects.filter(project_id=project_id)
        .select_related(
            'product',
            'product__supplier',
            'catalog_product',
            'catalog_product__supplier',
            'supplier_order_line',
            'room',
            'po',
            'invoice',
        )
        .prefetch_related('product__images', 'catalog_product__images', 'comments')
    )

    # Sync PO and Invoice statuses from Xero before returning
    po_ids = procurements.exclude(po=None).values_list('po_id', flat=True).distinct()
    inv_ids = procurements.exclude(invoice=None).values_list('invoice_id', flat=True).distinct()
    purchase_orders = PurchaseOrder.objects.filter(id__in=po_ids)
    invoices = Invoice.objects.filter(id__in=inv_ids)
    update_xero_statuses(purchase_orders)
    update_xero_statuses(invoices)

    serializer = ProcurementGetSerializer(procurements, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_studio_delivery_dates(request):
    """
    Get all delivery ETA dates across the studio.
    Returns a list of procurements with ETA set, ordered by ETA.
    """
    user = request.user
    if not user.studio:
        return Response({'error': 'User is not part of a studio'}, status=status.HTTP_400_BAD_REQUEST)

    procurements = Procurement.objects.filter(
        studio=user.studio,
        ETA__isnull=False
    ).order_by('ETA')

    data = []
    for procurement in procurements:
        data.append({
            'id': procurement.id,
            'ETA': procurement.ETA,
            'project_name': procurement.project.project_name if procurement.project else None,
            'product_name': procurement.product.name if procurement.product else 'Unknown Product'
        })

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_project_delivery_dates(request):
    """
    Get all delivery ETA dates for a specific project.
    Query Parameters:
        - project_id: The ID of the project (required)
    Returns a list of procurements with ETA set, ordered by ETA.
    """
    project_id = request.query_params.get('project_id')
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    procurements = Procurement.objects.filter(
        project_id=project_id,
        ETA__isnull=False
    ).order_by('ETA')

    data = []
    for procurement in procurements:
        data.append({
            'id': procurement.id,
            'ETA': procurement.ETA,
            'product_name': procurement.product.name if procurement.product else 'Unknown Product'
        })

    return Response(data, status=status.HTTP_200_OK)

@extend_schema(
    parameters=[
        OpenApiParameter(name='project_id', description='The ID of the project', required=True, type=int),
    ],
    responses={200: ProjectOverviewSerializer}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_project_overview(request):
    """
    Get project overview metrics: Budget Utilization, Tasks Complete, POs Delayed.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    # 1. Budget Utilization
    # Using 'total_budget' field based on model inspection
    total_budget = project.total_budget or 0.0
    
    # Sum total_amount of all POs for this project
    # Exclude Draft? User said "total PO created", so maybe include all or just sent?
    # Usually utilization implies committed spend, so maybe all created POs.
    total_po_amount = PurchaseOrder.objects.filter(project=project).aggregate(
        total=Sum('total_amount')
    )['total'] or 0.0
    
    # Calculate percentage
    budget_utilization_percentage = 0
    if total_budget > 0:
        budget_utilization_percentage = (float(total_po_amount) / float(total_budget)) * 100

    # 2. Tasks Complete
    # Get all tasks for project
    tasks = Task.objects.filter(project=project, assignees=request.user)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(status='D').count()
    in_progress_tasks = tasks.filter(status='IP').count()
    remaining_tasks = total_tasks - completed_tasks
    
    # 3. POs Delayed & Procurement Status
    today = timezone.now().date()
    pos_delayed_count = PurchaseOrder.objects.filter(
        project=project,
        due_date__lt=today
    ).exclude(status='PD').count()

    # Procurement Status: "POs need approval" -> status='SNT'? 
    # Or maybe 'DFT' means needs internal approval, 'SNT' means sent to supplier?
    # User prompt image says "8 POs need approval". Usually approval is internal step.
    # Assuming 'DFT' or specific status. Let's stick with 'SNT' or 'APR'?
    # Actually, usually 'Draft' -> 'Approved' -> 'Sent'. 
    # If "need approval", maybe they are 'DFT'? But user said "POs Delayed from purchase orders model" in previous prompt.
    # Let's count 'DFT' as needing approval for now, or maybe 'SNT' if approval means client approval?
    # I'll use 'DFT' for "needs approval" as a safe bet for internal workflow, or wait, 'action required' implies attention.
    # Let's count POs with status 'DFT' (Draft) as "Need Approval".
    
    pos_needing_approval = PurchaseOrder.objects.filter(project=project, status='DFT').count()

    # 4. Latest Files
    latest_files = Document.objects.filter(project=project).order_by('-updated_at')[:5]
    latest_files_data = [{'id': f.id, 'name': f.name, 'url': f.file.url if f.file else f.link_url, 'type': f.type} for f in latest_files]

    # 5. Recent Activity
    # Aggregate Task and PO updates
    # We can fetch recent combined list
    recent_tasks = tasks.order_by('-updated_at')[:5]
    recent_pos = PurchaseOrder.objects.filter(project=project).order_by('-updated_at')[:5]
    
    # Combine and sort
    # Handle case where updated_at might be None
    def get_sort_date(item):
        date_val = item.updated_at or item.created_at
        if date_val:
            return date_val
        # Fallback for when both are None
        return datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)

    combined_activity = sorted(
        chain(recent_tasks, recent_pos),
        key=get_sort_date,
        reverse=True
    )[:5]

    recent_activity_data = []
    for item in combined_activity:
        if isinstance(item, Task):
            type_str = 'Task'
            name = item.title
        elif isinstance(item, PurchaseOrder):
            type_str = 'Purchase Order'
            name = f"PO-{item.id}"
        else:
            type_str = 'Unknown'
            name = 'Unknown'
            
        recent_activity_data.append({
            'type': type_str,
            'name': name,
            'updated_at': item.updated_at or item.created_at
        })

    data = {
        'budget_utilization': {
            'total_budget': total_budget,
            'total_po_amount': total_po_amount,
            'percentage': round(budget_utilization_percentage, 2)
        },
        'tasks': {
            'total': total_tasks,
            'completed': completed_tasks,
            'in_progress': in_progress_tasks,
            'remaining': remaining_tasks,
            'completion_percentage': round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
        },
        'pos_delayed': {
            'count': pos_delayed_count
        },
        'procurement_status': {
            'pos_needing_approval': pos_needing_approval,
            'action_required': pos_needing_approval > 0 # Simple boolean flag
        },
        'latest_files': latest_files_data,
        'recent_activity': recent_activity_data
    }

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_project_rooms(request):
    """
    Get all rooms for a specific project.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    rooms = project.rooms.all()
    serializer = RoomSerializer(rooms, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_project_phases(request):
    """
    Get all phases for a specific project.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    phases = project.phases.all().order_by('start_date')
    serializer = PhaseSerializer(phases, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def seed_project_default_phases(request):
    """
    Add standard phases to a project that has none (e.g. created via Notion sync).
    Query: project_id (required)
    """
    from .phase_defaults import seed_default_phases_for_project

    project_id = request.query_params.get('project_id')
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    created = seed_default_phases_for_project(
        project, request.user.studio, user=request.user
    )
    phases = project.phases.all().order_by('start_date')
    serializer = PhaseSerializer(phases, many=True)
    return Response(
        {
            'created_count': len(created),
            'phases': serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_default_phases(request):
    """
    Get default phases template for projects.
    Returns a list of default phases that can be added to a project.
    """
    default_phases = [
        {
            'name': 'Feasibility & Briefing',
            'description': 'Initial discovery and research phase',
            'progress': 0
        },
        {
            'name': 'Concept Design',
            'description': 'Conceptual design development',
            'progress': 0
        },
        {
            'name': 'Design Development',
            'description': 'Detailed design development',
            'progress': 0
        },
        {
            'name': 'Technical Drawings',
            'description': 'Technical drawings and documentation',
            'progress': 0
        },
        {
            'name': 'Procurement',
            'description': 'Procurement and sourcing',
            'progress': 0
        },
        {
            'name': 'Site / Implementation',
            'description': 'On-site implementation and installation',
            'progress': 0
        }
    ]
    
    return Response(default_phases, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_studio_phases(request):
    """
    Get all phases assigned to the authenticated user's studio.
    """
    user = User.objects.get(id=request.user.id)
    phases = Phase.objects.filter(studio=user.studio, project__isnull=False).distinct().order_by('start_date')
    serializer = StudioPhaseSerializer(phases, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_studio_members_phases(request):
    """
    Get all members of the user's studio and their assigned projects' phases.
    """
    user = request.user
    if not user.studio:
        return Response({'error': 'User is not part of a studio'}, status=status.HTTP_400_BAD_REQUEST)
        
    members = User.objects.filter(studio=user.studio)
    serializer = UserProjectPhasesSerializer(members, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def get_project_phases_tasks(request):
    """
    Get all phases for a specific project with their connected tasks.
    Query Parameters:
        - project_id: The ID of the project (required)
    """
    project_id = request.query_params.get('project_id')
    
    if not project_id:
        return Response(
            {'error': 'project_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    phases = project.phases.all().order_by('start_date')
    serializer = PhaseWithTasksSerializer(phases, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def client_access(request):
    """
    Update procurement_client_access for a specific project.
    Payload: {"project_id": 1, "client_access": true/false}
    """
    project_id = request.data.get('project_id')
    client_access = request.data.get('client_access')
    
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if client_access is None:
         return Response({'error': 'client_access boolean value is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        project = Project.objects.filter(id=project_id).first()
        if not project:
             return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        project.procurement_client_access = client_access
        project.save()
        
        # If enabling access, update all existing procurements for this project
        if client_access:
            Procurement.objects.filter(project=project).update(client_access=True)
        
        return Response({
            'message': f'Client access updated to {client_access}',
            'procurement_client_access': project.procurement_client_access
        }, status=status.HTTP_200_OK)
    except Exception as e:
         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def client_messages(request):
    """Studio ↔ client two-way messaging for a project."""
    from client_portal.models import ClientProject, ClientProjectMessage
    from client_portal.serializers import ClientProjectMessageSerializer
    from crm.models import Client

    project_id = request.query_params.get('project_id') or request.data.get('project_id')
    client_id = request.query_params.get('client_id') or request.data.get('client_id')
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        if not client_id:
            return Response({'error': 'client_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        messages = ClientProjectMessage.objects.filter(
            project=project, client_id=client_id
        ).order_by('created_at')
        ClientProjectMessage.objects.filter(
            project=project, client_id=client_id, sender_type='client', is_read=False
        ).update(is_read=True)
        return Response(ClientProjectMessageSerializer(messages, many=True).data)

    content = (request.data.get('content') or '').strip()
    sender_type = request.data.get('sender_type', 'studio')
    if not client_id or not content:
        return Response({'error': 'client_id and content are required'}, status=status.HTTP_400_BAD_REQUEST)
    if sender_type != 'studio':
        return Response({'error': 'Studio users must send with sender_type=studio'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        client = Client.objects.get(id=client_id, studio=request.user.studio, contact_type='CL')
    except Client.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)

    if not ClientProject.objects.filter(client=client, project=project).exists():
        return Response({'error': 'Client does not have portal access to this project'}, status=status.HTTP_400_BAD_REQUEST)

    message = ClientProjectMessage.objects.create(
        project=project,
        client=client,
        studio=request.user.studio,
        content=content,
        sender_type='studio',
    )
    return Response(ClientProjectMessageSerializer(message).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, ProjectsViewPermission])
def export_procurement_schedule(request):
    """Export FF&E schedule with product specifications (CSV or printable HTML)."""
    from django.http import HttpResponse
    from .export_utils import procurement_export_rows, render_procurement_csv, render_procurement_spec_html

    project_id = request.query_params.get('project_id')
    export_format = (request.query_params.get('format') or 'csv').lower()
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id, studio=request.user.studio)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    procurements = (
        Procurement.objects.filter(project=project)
        .select_related('product', 'product__supplier', 'catalog_product', 'catalog_product__supplier', 'room')
        .order_by('room__name', 'id')
    )
    rows = procurement_export_rows(procurements)

    if export_format == 'html':
        html = render_procurement_spec_html(project_name=project.project_name or f'Project {project.id}', rows=rows)
        return HttpResponse(html, content_type='text/html')

    csv_content = render_procurement_csv(rows)
    response = HttpResponse(csv_content, content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="ffe-schedule-{project.id}.csv"'
    return response
