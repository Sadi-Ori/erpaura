from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartDetailAPIView,
    CartAddItemAPIView,
    CartRemoveItemAPIView,
    ApplyCouponAPIView,
    CheckoutAPIView,
    InvoiceListAPIView,
    InvoiceDetailAPIView,
    QuotationViewSet,
    POSTransactionViewSet,
    POSRegisterViewSet,
    POSStatsAPIView,
    InvoiceViewSet,
    OrderViewSet,
    SalesStatsAPIView,
)

app_name = 'sales'

router = DefaultRouter()
router.register(r'quotes', QuotationViewSet, basename='quotation')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'pos', POSTransactionViewSet, basename='pos-transaction')
router.register(r'pos-registers', POSRegisterViewSet, basename='pos-register')
router.register(r'invoices-manage', InvoiceViewSet, basename='invoice-manage')

urlpatterns = [
    path('stats/', SalesStatsAPIView.as_view(), name='sales-stats'),
    path('pos-stats/', POSStatsAPIView.as_view(), name='pos-stats'),
    path('cart/', CartDetailAPIView.as_view(), name='cart-detail'),
    path('cart/add/', CartAddItemAPIView.as_view(), name='cart-add'),
    path('cart/remove/<int:item_id>/', CartRemoveItemAPIView.as_view(), name='cart-remove'),
    path('cart/apply-coupon/', ApplyCouponAPIView.as_view(), name='apply-coupon'),
    path('checkout/', CheckoutAPIView.as_view(), name='checkout'),
    path('invoices/', InvoiceListAPIView.as_view(), name='invoice-list'),
    path('invoices/<str:invoice_number>/', InvoiceDetailAPIView.as_view(), name='invoice-detail'),
    path('', include(router.urls)),
]
