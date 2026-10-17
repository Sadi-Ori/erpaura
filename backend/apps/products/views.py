from rest_framework import generics, filters
from .models import Category, Product, PricingPlan
from .serializers import CategorySerializer, ProductSerializer, PricingPlanSerializer


class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all().order_by('order', 'name')
    serializer_class = CategorySerializer


class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_description', 'sku']
    ordering_fields = ['price', 'created_at', 'name']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        return queryset


class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'


class PricingPlanListAPIView(generics.ListAPIView):
    queryset = PricingPlan.objects.filter(is_active=True).order_by('order')
    serializer_class = PricingPlanSerializer
