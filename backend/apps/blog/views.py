from rest_framework import generics, filters
from .models import BlogCategory, BlogPost
from .serializers import BlogCategorySerializer, BlogPostSerializer


class BlogCategoryListAPIView(generics.ListAPIView):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer


class BlogPostListAPIView(generics.ListAPIView):
    serializer_class = BlogPostSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'excerpt', 'content']

    def get_queryset(self):
        queryset = BlogPost.objects.filter(is_published=True).select_related('category')
        cat = self.request.query_params.get('category')
        if cat:
            queryset = queryset.filter(category__slug=cat)
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        return queryset


class BlogPostDetailAPIView(generics.RetrieveAPIView):
    queryset = BlogPost.objects.filter(is_published=True)
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
