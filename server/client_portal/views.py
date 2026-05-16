from rest_framework import viewsets, status
from django.http import HttpResponse
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Sum
from django.conf import settings
from techstyles.resend_utils import send_client_portal_welcome_email
from techstyles.email_branding import email_header_inner_html
from documents.models import Document
from documents.serializers import DocumentSerializer
from projects.models import Procurement, Project
from finance.models import Invoice
from .serializers import ClientProcurementSerializer, ClientInvoiceSerializer, ClientLoginSerializer, ClientProjectSerializer
from crm.models import Client
from .models import ClientProject
from rest_framework.views import APIView

class ClientDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for client access to documents.
    Only allows reading documents with client_access=True.
    """
    queryset = Document.objects.filter(client_access=True)
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def root_documents(self, request):
        """
        Get root documents (no parent) shared with client for a project.
        """
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        queryset = self.get_queryset().filter(
            parent__isnull=True, 
            project_id=project_id
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def folder_content(self, request, pk=None):
        """
        Get shared content of a specific folder.
        """
        folder = self.get_object()
        children = folder.children.filter(client_access=True)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

class ClientProcurementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for client access to procurements.
    Allows listing and updating approval status.
    """
    queryset = Procurement.objects.filter(client_access=True)
    serializer_class = ClientProcurementSerializer
    http_method_names = ['get', 'patch']
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(project_id=project_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ClientInvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for client access to invoices.
    Returns invoices where at least one associated procurement has inv_sent=True.
    """
    serializer_class = ClientInvoiceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Invoice.objects.all()

    def list(self, request, *args, **kwargs):
        project_id = request.query_params.get('project_id')
        if not project_id:
             return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = self.get_queryset().filter(
            project_id=project_id, 
            procurement__inv_sent=True
        ).distinct()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def client_dashboard(request):
    """
    Get dashboard metrics for a client portal project.
    """
    project_id = request.query_params.get('project_id')
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    # Calculate Totals from Invoices
    total_paid = round(Invoice.objects.filter(project_id=project_id, status='PD').aggregate(total=Sum('total_amount'))['total'] or 0.0, 2)
    total_due = round(Invoice.objects.filter(project_id=project_id, status__in=['SNT', 'OVD']).aggregate(total=Sum('total_amount'))['total'] or 0.0, 2)

    # Calculate Action Items (Procurements needing approval)
    # Status None or 'RVW' (Review) imply pending client action if client_access is True
    # Assuming 'RVW' or None means pending.
    action_items_count = Procurement.objects.filter(
        project_id=project_id, 
        client_access=True
    ).exclude(client_approval__in=['APR', 'REJ']).exclude(client_approval__isnull=True).count()

    response_data = {
        'project_id': project.id,
        'project_name': project.project_name,
        'project_address': project.delivery_address_line_1,  # Mapped to delivery_address_line_1
        'project_picture': request.build_absolute_uri(project.project_banner.url) if project.project_banner else None,
        'total_paid_invoice': total_paid,
        'total_due_invoice': total_due,
        'action_items': action_items_count
    }

    return Response(response_data)

class ClientLoginView(APIView):
    """
    Client portal login endpoint.
    Returns JWT tokens and accessible projects.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ClientLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        client = serializer.validated_data['client']
        projects = serializer.validated_data['projects']
        
        return Response({
            'client': {
                'id': client.id,
                'name': client.name,
                'surname': client.surname,
                'email': client.email,
                'phone': client.phone,
            },
            'projects': ClientProjectSerializer(
                ClientProject.objects.filter(client=client),
                many=True
            ).data
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_client_credentials(request):
    """
    Generate client portal login credentials.
    Sets password to email address and links client to project.
    """
    project_id = request.data.get('project_id')
    client_id = request.data.get('client_id')
    
    if not project_id or not client_id:
        return Response(
            {'error': 'project_id and client_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        client = Client.objects.get(id=client_id, contact_type='CL')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Client not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not client.email:
        return Response(
            {'error': 'Client must have an email address'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set password to email address
    client.set_password(client.email)
    client.is_active = True
    client.save()
    
    # Link client to project (create if doesn't exist)
    client_project, created = ClientProject.objects.get_or_create(
        client=client,
        project=project
    )
    
    # Send welcome email with login credentials
    login_url = f"{settings.CLIENT_PORTAL_URL}/login"
    
    subject = f"Welcome to {project.project_name} Client Portal"
    
    message = f"""
Hello {client.name},

Your client portal access has been set up for the project: {project.project_name}

You can now log in to view project updates, documents, invoices, and procurement details.

Login Credentials:
Email: {client.email}
Password: {client.email}

Login URL: {login_url}

For security, we recommend changing your password after your first login.

Best regards,
The Focuspilot Team
    """
    
    # Check if HTML content is provided in the request
    html_message = request.data.get('html_content')
    
    # Fallback to generating it if not provided
    if not html_message:
        html_message = _get_welcome_email_html(project, client, login_url)
    
    studio_name = request.user.studio.name if request.user.studio else 'Focuspilot'
    try:
        send_client_portal_welcome_email(client.email, studio_name, html_message, message)
    except Exception as e:
        print(f"Error sending welcome email to {client.email}: {str(e)}")
    
    return Response({
        'message': 'Client portal credentials generated successfully',
        'client': {
            'id': client.id,
            'name': client.name,
            'email': client.email,
        },
        'project': {
            'id': project.id,
            'name': project.project_name,
        },
        'credentials': {
            'email': client.email,
            'password': client.email,
            'note': 'Password is set to email address'
        },
        'access_created': created
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def copy_client_credentials(request):
    """
    Generate client portal login credentials and return the login URL.
    Sets password to email address and links client to project.
    """
    project_id = request.data.get('project_id')
    client_id = request.data.get('client_id')
    
    if not project_id or not client_id:
        return Response(
            {'error': 'project_id and client_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        client = Client.objects.get(id=client_id, contact_type='CL')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Client not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not client.email:
        return Response(
            {'error': 'Client must have an email address'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set password to email address
    client.set_password(client.email)
    client.is_active = True
    client.save()
    
    # Link client to project (create if doesn't exist)
    client_project, created = ClientProject.objects.get_or_create(
        client=client,
        project=project
    )
    
    login_url = f"{settings.CLIENT_PORTAL_URL}/login"
    
    return Response({
        'message': 'Client portal credentials generated successfully',
        'login_url': login_url,
        'client': {
            'id': client.id,
            'name': client.name,
            'email': client.email,
        },
        'project': {
            'id': project.id,
            'name': project.project_name,
        },
        'credentials': {
            'email': client.email,
            'password': client.email,
            'note': 'Password is set to email address'
        },
        'access_created': created
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def room_totals(request):
    """
    Calculate total amount for each room in a project.
    Returns room name and total cost based on procurement quantities and unit prices.
    """
    project_id = request.query_params.get('project_id')
    if not project_id:
        return Response({'error': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get all procurements for the project with room information
    procurements = Procurement.objects.filter(
        project_id=project_id,
        room__isnull=False,
        client_access=True
    ).exclude(
        client_approval='REJ'
    ).select_related('room', 'product')

    # Calculate totals by room
    room_data = {}
    for procurement in procurements:
        room_name = procurement.room.name
        product = procurement.product
        quantity = procurement.quantity or 0.0
        
        # Calculate unit price based on trade/regular price
        if product:
            unit_price = product.tader_price if product.tader_price else (product.regular_price or 0.0)
            item_total = quantity * unit_price
        else:
            item_total = 0.0
        
        # Add to room total
        if room_name in room_data:
            room_data[room_name]['total'] += item_total
            room_data[room_name]['item_count'] += 1
        else:
            room_data[room_name] = {
                'room_name': room_name,
                'room_id': procurement.room.id,
                'total': item_total,
                'item_count': 1
            }

    # Round totals and convert to list
    for room in room_data.values():
        room['total'] = round(room['total'], 2)

    # Convert to list and sort by room name
    room_totals_list = sorted(room_data.values(), key=lambda x: x['room_name'])

    # Calculate grand total
    grand_total = round(sum(room['total'] for room in room_totals_list), 2)

    response_data = {
        'project_id': project.id,
        'project_name': project.project_name,
        'rooms': room_totals_list,
        'grand_total': grand_total
    }

    return Response(response_data)

def _get_welcome_email_html(project, client, login_url):
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Client Portal Access</title>
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
                Hello {client.name}
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.5;">
                Your client portal is ready. View project updates, documents, invoices, and procurement details.
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
                      {client.email}
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
                      {client.email}
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fetch_client_credentials_email_html(request):
    """
    Fetch the generated HTML for the client credentials welcome email.
    """
    project_id = request.data.get('project_id')
    client_id = request.data.get('client_id')
    
    if not project_id or not client_id:
        return Response(
            {'error': 'project_id and client_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        client = Client.objects.get(id=client_id, contact_type='CL')
    except Client.DoesNotExist:
        return Response(
            {'error': 'Client not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )
        
    login_url = f"{settings.CLIENT_PORTAL_URL}/login"
    
    html_content = _get_welcome_email_html(project, client, login_url)
    
    return HttpResponse(html_content, content_type='text/html')
