from django.contrib import admin
from .models import Category, Product, PricingPlan


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'category', 'price', 'compare_at_price', 'stock_quantity', 'is_featured', 'is_active')
    list_filter = ('category', 'is_featured', 'is_active')
    search_fields = ('name', 'sku', 'short_description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'stock_quantity', 'is_featured', 'is_active')


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'monthly_price', 'yearly_price', 'badge', 'is_popular', 'order', 'is_active')
    list_editable = ('monthly_price', 'yearly_price', 'is_popular', 'is_active', 'order')
    prepopulated_fields = {'slug': ('name',)}
