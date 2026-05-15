from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContractorDocumentViewSet,
    ContractorProcurementViewSet,
    ContractorMessageViewSet,
    contractor_dashboard,
    ContractorLoginView,
    add_contractor,
    add_existing_contractor,
    studio_contractors,
    contractor_active_projects,
    generate_contractor_credentials,
    copy_contractor_credentials,
    fetch_contractor_credentials_email_html,
    share_procurement_with_contractor,
    bulk_share_procurement_with_contractor,
    share_document_with_contractor,
    bulk_share_document_with_contractor,
    contractor_view,
    project_contractors,
    remove_shared_procurement,
    remove_shared_document,
    contractor_profile,
    regenerate_access_code,
    project_by_access_token,
    authenticate_with_access_code,
)

router = DefaultRouter()
router.register(r'documents', ContractorDocumentViewSet, basename='contractor-documents')
router.register(r'procurements', ContractorProcurementViewSet, basename='contractor-procurements')
router.register(r'messages', ContractorMessageViewSet, basename='contractor-messages')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', contractor_dashboard, name='contractor-dashboard'),
    path('login/', ContractorLoginView.as_view(), name='contractor-login'),
    path('add/', add_contractor, name='contractor-add'),
    path('add-existing/', add_existing_contractor, name='contractor-add-existing'),
    path('studio-contractors/', studio_contractors, name='contractor-studio-list'),
    path('active-projects/', contractor_active_projects, name='contractor-active-projects'),
    path('generate-contractor-login/', generate_contractor_credentials, name='generate-contractor-credentials'),
    path('copy-contractor-credentials/', copy_contractor_credentials, name='copy-contractor-credentials'),
    path('fetch-contractor-email-html/', fetch_contractor_credentials_email_html, name='fetch-contractor-email-html'),
    # Shared items
    path('share-procurement/', share_procurement_with_contractor, name='contractor-share-procurement'),
    path('bulk-share-procurements/', bulk_share_procurement_with_contractor, name='contractor-bulk-share-procurements'),
    path('share-document/', share_document_with_contractor, name='contractor-share-document'),
    path('bulk-share-documents/', bulk_share_document_with_contractor, name='contractor-bulk-share-documents'),
    path('remove-shared-procurement/', remove_shared_procurement, name='contractor-remove-shared-procurement'),
    path('remove-shared-document/', remove_shared_document, name='contractor-remove-shared-document'),
    path('view/<int:contractor_id>/', contractor_view, name='contractor-view'),
    path('project/<int:project_id>/contractors/', project_contractors, name='contractor-project-list'),
    # Profile Management (Phase 3)
    path('contractor/<int:contractor_id>/', contractor_profile, name='contractor-profile'),
    path('contractor/<int:contractor_id>/regenerate-code/', regenerate_access_code, name='contractor-regenerate-code'),
    # QR Code Access (Phase 2)
    path('project/<uuid:access_token>/', project_by_access_token, name='project-by-access-token'),
    path('project/<uuid:access_token>/auth/', authenticate_with_access_code, name='authenticate-with-access-code'),
]
