import uuid
from decimal import Decimal
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Coupon, Cart, CartItem, Order, OrderItem, Invoice, Quotation, QuotationItem, POSTransaction
from .serializers import (
    CouponSerializer, CartSerializer, OrderSerializer, InvoiceSerializer,
    QuotationSerializer, QuotationItemSerializer, POSTransactionSerializer
)
from apps.products.models import Product, PricingPlan


class CartDetailAPIView(APIView):
    def get(self, request):
        session_id = request.headers.get('X-Cart-Session') or request.query_params.get('session_id')
        if not session_id:
            session_id = str(uuid.uuid4())
        
        cart, _ = Cart.objects.get_or_create(session_id=session_id)
        serializer = CartSerializer(cart)
        return Response({
            'cart': serializer.data,
            'session_id': session_id,
        })


class CartAddItemAPIView(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            session_id = str(uuid.uuid4())
            
        cart, _ = Cart.objects.get_or_create(session_id=session_id)
        product_id = request.data.get('product_id')
        plan_id = request.data.get('plan_id')
        quantity = int(request.data.get('quantity', 1))
        billing_cycle = request.data.get('billing_cycle', 'monthly')

        if plan_id:
            plan = PricingPlan.objects.get(id=plan_id)
            item, created = CartItem.objects.get_or_create(
                cart=cart, plan=plan, billing_cycle=billing_cycle,
                defaults={'quantity': quantity}
            )
            if not created:
                item.quantity += quantity
                item.save()
        elif product_id:
            product = Product.objects.get(id=product_id)
            item, created = CartItem.objects.get_or_create(
                cart=cart, product=product,
                defaults={'quantity': quantity}
            )
            if not created:
                item.quantity += quantity
                item.save()
        else:
            return Response({'error': 'Specify product_id or plan_id'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'cart': CartSerializer(cart).data,
            'session_id': session_id
        })


class CartRemoveItemAPIView(APIView):
    def post(self, request, item_id):
        session_id = request.data.get('session_id')
        try:
            item = CartItem.objects.get(id=item_id, cart__session_id=session_id)
            cart = item.cart
            item.delete()
            return Response({'success': True, 'cart': CartSerializer(cart).data})
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND)


class ApplyCouponAPIView(APIView):
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart = Cart.objects.get(session_id=session_id)
            coupon = Coupon.objects.get(code=code)
            if not coupon.is_valid():
                return Response({'error': 'Coupon is expired or inactive'}, status=status.HTTP_400_BAD_REQUEST)
            
            cart.coupon = coupon
            cart.save()
            return Response({
                'success': True,
                'message': f"Coupon '{code}' applied successfully!",
                'cart': CartSerializer(cart).data
            })
        except Coupon.DoesNotExist:
            return Response({'error': f"Coupon '{code}' is invalid"}, status=status.HTTP_404_NOT_FOUND)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)


class CheckoutAPIView(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        data = request.data

        cart = Cart.objects.filter(session_id=session_id).first() if session_id else None
        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = cart.subtotal
        discount = cart.discount_amount
        tax = round((subtotal - discount) * Decimal('0.05'), 2)
        total = round(subtotal - discount + tax, 2)

        order_no = f"AURA-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(
            order_number=order_no,
            customer_name=data.get('customer_name', 'Valued Enterprise Client'),
            customer_email=data.get('customer_email', 'client@auraerp.io'),
            customer_phone=data.get('customer_phone', ''),
            company_name=data.get('company_name', ''),
            billing_address=data.get('billing_address', '123 Cloud St'),
            subtotal=subtotal,
            discount_amount=discount,
            tax_amount=tax,
            total_amount=total,
            payment_method=data.get('payment_method', 'credit_card'),
            status='paid',
        )

        for item in cart.items.all():
            item_name = item.plan.name if item.plan else item.product.name
            OrderItem.objects.create(
                order=order,
                product=item.product,
                plan=item.plan,
                item_name=item_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
            )

        inv_no = f"INV-{uuid.uuid4().hex[:6].upper()}"
        invoice = Invoice.objects.create(
            invoice_number=inv_no,
            order=order,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_company=order.company_name,
            subtotal=subtotal,
            tax=tax,
            total=total,
            status='paid',
        )

        # Clear cart
        cart.items.all().delete()
        cart.coupon = None
        cart.save()

        return Response({
            'success': True,
            'message': 'Order successfully created and processed!',
            'order': OrderSerializer(order).data,
            'invoice': InvoiceSerializer(invoice).data,
        }, status=status.HTTP_201_CREATED)


class InvoiceListAPIView(generics.ListAPIView):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer


class InvoiceDetailAPIView(generics.RetrieveAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    lookup_field = 'invoice_number'


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().select_related('customer').prefetch_related('items')
    serializer_class = QuotationSerializer
    filterset_fields = ['status', 'customer']
    search_fields = ['quote_number', 'customer__name']


class POSTransactionViewSet(viewsets.ModelViewSet):
    queryset = POSTransaction.objects.all()
    serializer_class = POSTransactionSerializer
    filterset_fields = ['payment_method']
    search_fields = ['receipt_number', 'customer_name']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    filterset_fields = ['status']
    search_fields = ['invoice_number', 'customer_name']

