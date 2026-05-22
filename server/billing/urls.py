from django.urls import path
from . import views

urlpatterns = [
    path('status/', views.billing_status, name='billing-status'),
    path('plans/', views.billing_plans, name='billing-plans'),
    path('activate/', views.activate_plan, name='billing-activate'),
    path('checkout/', views.create_checkout, name='billing-checkout'),
    path('portal/', views.create_portal, name='billing-portal'),
    path('verify-session/', views.verify_session, name='billing-verify-session'),
    path('webhook/', views.stripe_webhook, name='billing-webhook'),
]
