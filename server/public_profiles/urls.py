from django.urls import path
from . import views

urlpatterns = [
    path('public/<slug:slug>/', views.public_studio_by_slug, name='public-studio-profile'),
    path('me/', views.manage_profile, name='manage-public-profile'),
    path('me/publish/', views.publish_profile, name='publish-public-profile'),
    path('me/slug/check/', views.check_slug, name='check-public-slug'),
    path('me/portfolio/', views.portfolio_items, name='portfolio-items'),
    path('me/portfolio/<int:item_id>/', views.portfolio_item_detail, name='portfolio-item-detail'),
    path('me/reviews/', views.reviews_list, name='public-reviews'),
    path('me/reviews/<int:review_id>/', views.review_detail, name='public-review-detail'),
    path('me/project-candidates/', views.project_candidates, name='portfolio-project-candidates'),
    path('me/import-projects/', views.import_projects, name='portfolio-import-projects'),
]
