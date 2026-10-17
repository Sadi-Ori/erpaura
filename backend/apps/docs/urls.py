from django.urls import path
from .views import (
    DocCategoryListAPIView,
    DocArticleListAPIView,
    DocArticleDetailAPIView,
)

app_name = 'docs'

urlpatterns = [
    path('categories/', DocCategoryListAPIView.as_view(), name='category-list'),
    path('articles/', DocArticleListAPIView.as_view(), name='article-list'),
    path('articles/<slug:slug>/', DocArticleDetailAPIView.as_view(), name='article-detail'),
]
