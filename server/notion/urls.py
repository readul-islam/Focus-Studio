from django.urls import path

from . import views

urlpatterns = [
    path('connect/', views.notion_connect, name='notion-connect'),
    path('callback/', views.notion_callback, name='notion-callback'),
    path('disconnect/', views.notion_disconnect, name='notion-disconnect'),
    path('status/', views.notion_status, name='notion-status'),
    path('databases/', views.notion_databases, name='notion-databases'),
]
