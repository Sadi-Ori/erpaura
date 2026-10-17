from django.urls import path
from .views import (
    CategoryListAPIView,
    ProductListAPIView,
    ProductDetailAPIView,
    PricingPlanListAPIView,
)

app_name = 'products'

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('items/', ProductListAPIView.as_view(), name='product-list'),
    path('items/<slug:slug>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('plans/', PricingPlanListAPIView.as_view(), name='pricing-plan-list'),
]
