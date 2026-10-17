from django.contrib import admin
from .models import DocCategory, DocArticle


class DocArticleInline(admin.TabularInline):
    model = DocArticle
    extra = 1
    fields = ('title', 'slug', 'order', 'is_published')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(DocCategory)
class DocCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [DocArticleInline]


@admin.register(DocArticle)
class DocArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'version', 'order', 'is_published', 'updated_at')
    list_filter = ('category', 'is_published', 'version')
    search_fields = ('title', 'summary', 'content')
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ('order', 'is_published')
