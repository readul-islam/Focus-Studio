from django.urls import path

from .views import submit_article_feedback, article_feedback_summary

urlpatterns = [
    path('feedback/', submit_article_feedback, name='help-feedback'),
    path('feedback/<str:category>/<str:article_slug>/summary/', article_feedback_summary, name='help-feedback-summary'),
]
