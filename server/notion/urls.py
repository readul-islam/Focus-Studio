from django.urls import path

from . import views

urlpatterns = [
    path('connect/', views.notion_connect, name='notion-connect'),
    path('callback/', views.notion_callback, name='notion-callback'),
    path('disconnect/', views.notion_disconnect, name='notion-disconnect'),
    path('status/', views.notion_status, name='notion-status'),
    path('databases/', views.notion_databases, name='notion-databases'),
    path(
        'databases/<str:database_id>/schema/',
        views.notion_database_schema,
        name='notion-database-schema',
    ),
    path('mapping/', views.notion_project_mapping, name='notion-project-mapping'),
    path('mapping/sync/', views.notion_project_sync, name='notion-project-sync'),
]
