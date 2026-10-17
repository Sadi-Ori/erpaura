from django.urls import path
from .views import (
    BlogCategoryListAPIView,
    BlogPostListAPIView,
    BlogPostDetailAPIView,
)

app_name = 'blog'

urlpatterns = [
    path('categories/', BlogCategoryListAPIView.as_view(), name='category-list'),
    path('posts/', BlogPostListAPIView.as_view(), name='post-list'),
    path('posts/<slug:slug>/', BlogPostDetailAPIView.as_view(), name='post-detail'),
]
