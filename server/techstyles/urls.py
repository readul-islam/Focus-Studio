"""
URL configuration for techstyles project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path('admin/', admin.site.urls),
    path('crm/', include('crm.urls')),
    path('finance/', include('finance.urls')),
    path('projects/', include('projects.urls')),
    path('reports/', include('reports.urls')),
    path('task/', include('task.urls')),
    path('time_tracker/', include('time_tracker.urls')),
    path('user/', include('users.urls')),
    path('library/', include('library.urls')),
    path('xero/', include('xero.urls')),
    path('documents/', include('documents.urls')),
    path('gmail/', include('gmail.urls')),
    path('comment/', include('comment.urls')),
    path('client_portal/', include('client_portal.urls')),
    path('contractor_portal/', include('contractor_portal.urls')),
    path('clipper/', include('clipper.urls')),
    path('meetings/', include('meetings.urls')),
    path('notifications/', include('notifications.urls')),
    path('changelog/', include('changelog.urls')),
    path('help/', include('help_center.urls')),
    path('billing/', include('billing.urls')),
    path('integrations/', include('integrations.urls')),
    path('notion/', include('notion.urls')),
    path('collaboration/', include('collaboration.urls')),
    path('public_profiles/', include('public_profiles.urls')),
]
# Public studio pages: landing /studio/{slug} → GET /public_profiles/public/{slug}/
