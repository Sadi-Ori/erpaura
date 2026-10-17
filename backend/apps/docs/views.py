from rest_framework import generics, filters
from .models import DocCategory, DocArticle
from .serializers import DocCategorySerializer, DocArticleDetailSerializer, DocArticleSummarySerializer


class DocCategoryListAPIView(generics.ListAPIView):
    queryset = DocCategory.objects.all().order_by('order', 'name')
    serializer_class = DocCategorySerializer


class DocArticleListAPIView(generics.ListAPIView):
    serializer_class = DocArticleSummarySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'summary', 'content']

    def get_queryset(self):
        queryset = DocArticle.objects.filter(is_published=True).select_related('category')
        cat = self.request.query_params.get('category')
        if cat:
            queryset = queryset.filter(category__slug=cat)
        return queryset


class DocArticleDetailAPIView(generics.RetrieveAPIView):
    queryset = DocArticle.objects.filter(is_published=True)
    serializer_class = DocArticleDetailSerializer
    lookup_field = 'slug'
