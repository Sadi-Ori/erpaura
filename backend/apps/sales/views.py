import uuid
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Coupon, Cart, CartItem, Order, OrderItem, Invoice, Quotation, QuotationItem, POSTransaction, POSRegister
from .serializers import (
    CouponSerializer, CartSerializer, OrderSerializer, InvoiceSerializer,
    QuotationSerializer, QuotationItemSerializer, POSTransactionSerializer, POSRegisterSerializer
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
        try:
            item = CartItem.objects.get(id=item_id)
            cart = item.cart
            item.delete()
            return Response({
                'success': True,
                'cart': CartSerializer(cart).data
            })
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)


class ApplyCouponAPIView(APIView):
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        session_id = request.data.get('session_id')
        
        try:
            coupon = Coupon.objects.get(code=code)
            if not coupon.is_valid():
                return Response({'error': 'Coupon is expired or inactive'}, status=status.HTTP_400_BAD_REQUEST)
                
            cart, _ = Cart.objects.get_or_create(session_id=session_id)
            cart.coupon = coupon
            cart.save()
            
            return Response({
                'success': True,
                'message': f'Coupon {code} applied successfully!',
                'cart': CartSerializer(cart).data
            })
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)


class CheckoutAPIView(APIView):
    def post(self, request):
        session_id = request.data.get('session_id')
        cart = Cart.objects.filter(session_id=session_id).first()
        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        customer_name = request.data.get('customer_name')
        customer_email = request.data.get('customer_email')
        billing_address = request.data.get('billing_address')
        payment_method = request.data.get('payment_method', 'credit_card')
        company_name = request.data.get('company_name', '')

        if not customer_name or not customer_email:
            return Response({'error': 'Name and Email are required'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = cart.subtotal
        discount = cart.discount_amount
        tax = round((subtotal - discount) * Decimal('0.10'), 2)
        total = (subtotal - discount) + tax

        order_no = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(
            order_number=order_no,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=request.data.get('customer_phone', ''),
            company_name=company_name,
            billing_address=billing_address or 'Online Direct',
            subtotal=subtotal,
            discount_amount=discount,
            tax_amount=tax,
            total_amount=total,
            payment_method=payment_method,
            status='paid',
        )

        for ci in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=ci.product,
                plan=ci.plan,
                item_name=ci.product.name if ci.product else (ci.plan.name if ci.plan else 'Service Item'),
                quantity=ci.quantity,
                unit_price=ci.unit_price,
                total_price=ci.total_price,
            )

        inv_no = f"INV-{uuid.uuid4().hex[:6].upper()}"
        today_date = timezone.now().date()
        invoice = Invoice.objects.create(
            invoice_number=inv_no,
            order=order,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_company=order.company_name,
            issue_date=today_date,
            due_date=today_date + timedelta(days=30),
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


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items')
    serializer_class = OrderSerializer
    filterset_fields = ['status', 'payment_method']
    search_fields = ['order_number', 'customer_name', 'customer_email', 'company_name']


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().select_related('customer').prefetch_related('items')
    serializer_class = QuotationSerializer
    filterset_fields = ['status', 'customer']
    search_fields = ['quote_number', 'customer__name']

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        q = self.get_object()
        q.status = 'accepted'
        q.save()
        return Response({
            'message': f'Quotation {q.quote_number} marked as accepted by customer.',
            'quotation': QuotationSerializer(q).data
        })

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        q = self.get_object()
        q.status = 'declined'
        q.save()
        return Response({
            'message': f'Quotation {q.quote_number} marked as declined.',
            'quotation': QuotationSerializer(q).data
        })

    @action(detail=True, methods=['post'])
    def convert_to_order(self, request, pk=None):
        q = self.get_object()
        q.status = 'converted'
        q.save()

        order_no = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(
            order_number=order_no,
            customer_name=q.customer.name,
            customer_email=q.customer.email,
            customer_phone=q.customer.phone,
            company_name=q.customer.company,
            billing_address=q.customer.address or 'Standard Commercial Account',
            subtotal=q.subtotal,
            tax_amount=q.tax,
            total_amount=q.total,
            payment_method='net_30_invoice',
            status='paid',
            notes=f"Converted from Quotation #{q.quote_number}"
        )

        for item in q.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                item_name=item.item_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
            )

        inv_no = f"INV-{uuid.uuid4().hex[:6].upper()}"
        today_date = timezone.now().date()
        invoice = Invoice.objects.create(
            invoice_number=inv_no,
            order=order,
            customer_name=order.customer_name,
            customer_email=order.customer_email,
            customer_company=order.company_name,
            issue_date=today_date,
            due_date=today_date + timedelta(days=30),
            subtotal=order.subtotal,
            tax=order.tax_amount,
            total=order.total_amount,
            status='paid',
        )

        return Response({
            'message': f'Quotation #{q.quote_number} converted into Order #{order.order_number} and Invoice #{invoice.invoice_number}!',
            'order': OrderSerializer(order).data,
            'invoice': InvoiceSerializer(invoice).data,
        })


class POSRegisterViewSet(viewsets.ModelViewSet):
    queryset = POSRegister.objects.all()
    serializer_class = POSRegisterSerializer

    @action(detail=True, methods=['post'])
    def close_shift(self, request, pk=None):
        reg = self.get_object()
        reg.is_open = False
        reg.closed_at = timezone.now()
        closing_cash = request.data.get('closing_cash')
        if closing_cash:
            reg.current_cash = Decimal(str(closing_cash))
        reg.save()
        return Response({
            'message': f'Register shift closed for {reg.name}',
            'register': POSRegisterSerializer(reg).data,
        })

    @action(detail=True, methods=['post'])
    def open_shift(self, request, pk=None):
        reg = self.get_object()
        reg.is_open = True
        reg.opened_at = timezone.now()
        reg.closed_at = None
        opening_cash = request.data.get('opening_cash', 250.00)
        reg.opening_float = Decimal(str(opening_cash))
        reg.current_cash = Decimal(str(opening_cash))
        reg.save()
        return Response({
            'message': f'Register shift opened for {reg.name}',
            'register': POSRegisterSerializer(reg).data,
        })


class POSTransactionViewSet(viewsets.ModelViewSet):
    queryset = POSTransaction.objects.all().select_related('register')
    serializer_class = POSTransactionSerializer
    filterset_fields = ['payment_method']
    search_fields = ['receipt_number', 'customer_name']

    @action(detail=False, methods=['post'])
    def process_checkout(self, request):
        data = request.data
        cashier_name = data.get('cashier_name', 'Cashier Specialist')
        customer_name = data.get('customer_name', 'Walk-in Customer')
        payment_method = data.get('payment_method', 'card')
        subtotal = Decimal(str(data.get('subtotal', 0.0)))
        tax = Decimal(str(data.get('tax', 0.0)))
        discount = Decimal(str(data.get('discount', 0.0)))
        total_amount = Decimal(str(data.get('total_amount', 0.0)))
        amount_tendered = Decimal(str(data.get('amount_tendered', total_amount)))
        change_due = max(Decimal('0.00'), amount_tendered - total_amount) if payment_method == 'cash' else Decimal('0.00')
        items_data = data.get('items', [])

        register = POSRegister.objects.filter(is_open=True).first()
        if not register:
            register = POSRegister.objects.create(name='Terminal #01 (Front Register)', is_open=True)

        receipt_no = f"POS-{timezone.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"

        transaction = POSTransaction.objects.create(
            receipt_number=receipt_no,
            register=register,
            cashier_name=cashier_name,
            customer_name=customer_name,
            subtotal=subtotal,
            tax=tax,
            discount=discount,
            total_amount=total_amount,
            amount_tendered=amount_tendered,
            change_due=change_due,
            payment_method=payment_method,
            items_data=items_data,
        )

        if payment_method == 'cash':
            register.current_cash += total_amount
            register.save()

        # Deduct inventory for items if product ID exists
        from apps.inventory.models import StockItem, StockMovement, Warehouse
        store_wh = Warehouse.objects.filter(is_active=True).first()

        for item in items_data:
            p_id = item.get('product_id') or item.get('id')
            qty = int(item.get('quantity') or item.get('qty', 1))
            if p_id and store_wh:
                stock_rec = StockItem.objects.filter(product_id=p_id, warehouse=store_wh).first()
                if stock_rec:
                    stock_rec.quantity_on_hand = max(0, stock_rec.quantity_on_hand - qty)
                    stock_rec.save()

                    StockMovement.objects.create(
                        reference_number=f"POS-MVT-{uuid.uuid4().hex[:6].upper()}",
                        product_id=p_id,
                        from_warehouse=store_wh,
                        movement_type='pos_sale',
                        quantity=qty,
                        unit_cost=stock_rec.unit_cost,
                        performed_by=cashier_name,
                        notes=f"POS Sale Receipt #{receipt_no}",
                    )

        return Response({
            'success': True,
            'message': f'Transaction completed. Receipt #{receipt_no}',
            'transaction': POSTransactionSerializer(transaction).data,
        }, status=status.HTTP_201_CREATED)


class POSStatsAPIView(APIView):
    def get(self, request):
        txs = POSTransaction.objects.all()
        total_sales = sum(t.total_amount for t in txs)
        total_tx_count = txs.count()
        cash_sales = sum(t.total_amount for t in txs if t.payment_method == 'cash')
        card_sales = sum(t.total_amount for t in txs if t.payment_method == 'card')
        qr_sales = sum(t.total_amount for t in txs if t.payment_method in ['qr', 'split'])
        active_register = POSRegister.objects.filter(is_open=True).first()

        return Response({
            'total_sales': float(total_sales),
            'transactions_count': total_tx_count,
            'cash_sales': float(cash_sales),
            'card_sales': float(card_sales),
            'qr_sales': float(qr_sales),
            'avg_basket': float(round(total_sales / total_tx_count, 2)) if total_tx_count > 0 else 0.0,
            'active_register': POSRegisterSerializer(active_register).data if active_register else None,
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    filterset_fields = ['status']
    search_fields = ['invoice_number', 'customer_name']

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        inv = self.get_object()
        inv.status = 'paid'
        inv.save()
        return Response({
            'message': f'Invoice #{inv.invoice_number} marked as Paid.',
            'invoice': InvoiceSerializer(inv).data
        })


class SalesStatsAPIView(APIView):
    def get(self, request):
        orders = Order.objects.all()
        total_revenue = sum(o.total_amount for o in orders if o.status == 'paid')
        total_orders = orders.count()

        invoices = Invoice.objects.all()
        paid_invoices_amount = sum(i.total for i in invoices if i.status == 'paid')
        unpaid_invoices_amount = sum(i.total for i in invoices if i.status in ['sent', 'draft', 'overdue'])
        overdue_count = invoices.filter(status='overdue').count()

        quotes = Quotation.objects.all()
        total_quotes = quotes.count()
        accepted_quotes = quotes.filter(status__in=['accepted', 'converted']).count()
        conversion_rate = round((accepted_quotes / total_quotes * 100), 1) if total_quotes > 0 else 0.0

        return Response({
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'paid_invoices_amount': float(paid_invoices_amount),
            'unpaid_invoices_amount': float(unpaid_invoices_amount),
            'overdue_count': overdue_count,
            'total_quotes': total_quotes,
            'accepted_quotes': accepted_quotes,
            'conversion_rate': conversion_rate,
        })
