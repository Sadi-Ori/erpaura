from rest_framework import serializers
from .models import DocCategory, DocArticle


class DocArticleSummarySerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = DocArticle
        fields = ['id', 'title', 'slug', 'summary', 'category_slug', 'order', 'version', 'updated_at']


class DocCategorySerializer(serializers.ModelSerializer):
    articles = DocArticleSummarySerializer(many=True, read_only=True)

    class Meta:
        model = DocCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'articles']


class DocArticleDetailSerializer(serializers.ModelSerializer):
    category = DocCategorySerializer(read_only=True)

    class Meta:
        model = DocArticle
        fields = '__all__'
