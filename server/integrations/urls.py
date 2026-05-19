from django.urls import path

from . import views

urlpatterns = [
    path('api-keys/', views.api_keys_list_create, name='integrations-api-keys'),
    path('api-keys/<int:key_id>/', views.api_keys_revoke, name='integrations-api-keys-revoke'),
    path('webhooks/', views.webhooks_list_create, name='integrations-webhooks'),
    path('webhooks/event-types/', views.webhook_event_types, name='integrations-webhook-events'),
    path('webhooks/<int:hook_id>/', views.webhooks_detail, name='integrations-webhooks-detail'),
    path('webhooks/<int:hook_id>/test/', views.webhooks_test, name='integrations-webhooks-test'),
    path('v1/projects/', views.v1_list_projects, name='integrations-v1-projects'),
    path('v1/projects/create/', views.v1_create_project, name='integrations-v1-projects-create'),
    path('v1/clients/', views.v1_list_clients, name='integrations-v1-clients'),
    path('v1/clients/create/', views.v1_create_client, name='integrations-v1-clients-create'),
]
