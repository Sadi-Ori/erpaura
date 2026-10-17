from django.contrib import admin
from .models import Coupon, Cart, CartItem, Order, OrderItem, Invoice


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'fixed_discount', 'is_active', 'times_used', 'valid_until')
    list_editable = ('is_active',)
    search_fields = ('code',)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'subtotal', 'discount_amount', 'total', 'created_at')
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_email', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_number', 'customer_name', 'customer_email')
    inlines = [OrderItemInline]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer_name', 'total', 'status', 'issue_date', 'due_date')
    list_filter = ('status', 'issue_date')
    search_fields = ('invoice_number', 'customer_name', 'customer_email')
