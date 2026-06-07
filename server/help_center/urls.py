from django.urls import path

from .views import (
    article_feedback_summary,
    submit_article_feedback,
    support_chat,
    support_conversation,
    support_conversation_clear,
)

urlpatterns = [
    path('feedback/', submit_article_feedback, name='help-feedback'),
    path('feedback/<str:category>/<str:article_slug>/summary/', article_feedback_summary, name='help-feedback-summary'),
    path('support/conversation/', support_conversation, name='help-support-conversation'),
    path('support/chat/', support_chat, name='help-support-chat'),
    path('support/conversation/clear/', support_conversation_clear, name='help-support-conversation-clear'),
]
