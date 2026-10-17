import uuid
from django.db import models
from django.utils import timezone
from apps.products.models import Product, PricingPlan
from apps.crm.models import Contact


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    fixed_discount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    times_used = models.PositiveIntegerField(default=0)

    def is_valid(self):
        if not self.is_active:
            return False
        if self.valid_until and timezone.now() > self.valid_until:
            return False
        return True

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}% off / ${self.fixed_discount})"


class Cart(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def subtotal(self):
        return sum(item.total_price for item in self.items.all())

    @property
    def discount_amount(self):
        if not self.coupon or not self.coupon.is_valid():
            return 0.00
        sub = self.subtotal
        if self.coupon.discount_percentage > 0:
            return round(sub * (self.coupon.discount_percentage / 100), 2)
        return min(sub, self.coupon.fixed_discount)

    @property
    def total(self):
        return max(0.00, self.subtotal - self.discount_amount)

    def __str__(self):
        return f"Cart {self.session_id} - ${self.total}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    plan = models.ForeignKey(PricingPlan, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    billing_cycle = models.CharField(max_length=20, default='monthly', choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')])

    @property
    def unit_price(self):
        if self.plan:
            return self.plan.yearly_price if self.billing_cycle == 'yearly' else self.plan.monthly_price
        if self.product:
            return self.product.price
        return 0.00

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    def __str__(self):
        name = self.plan.name if self.plan else (self.product.name if self.product else "Item")
        return f"{self.quantity}x {name} in {self.cart.session_id}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('processing', 'Processing Deployment'),
        ('active', 'Active Subscription'),
        ('cancelled', 'Cancelled'),
    ]

    order_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=50, blank=True)
    company_name = models.CharField(max_length=150, blank=True)
    billing_address = models.TextField()
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    payment_method = models.CharField(max_length=50, default='credit_card')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name} (${self.total_amount})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.item_name} for Order #{self.order.order_number}"


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    order = models.OneToOneField(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_company = models.CharField(max_length=150, blank=True)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField(default=timezone.now)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"INV-{self.invoice_number} ({self.status}) - ${self.total}"


class Quotation(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft Estimate'),
        ('sent', 'Sent to Customer'),
        ('accepted', 'Accepted by Customer'),
        ('declined', 'Declined'),
        ('converted', 'Converted to Sales Order'),
    ]

    quote_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    customer = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='quotations')
    issue_date = models.DateField(default=timezone.now)
    valid_until = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"QTN #{self.quote_number} - {self.customer.name} (${self.total})"


class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.item_name} for Quote #{self.quotation.quote_number}"


class POSTransaction(models.Model):
    PAYMENT_CHOICES = [
        ('cash', 'Cash Tender'),
        ('card', 'Credit / Debit Card'),
        ('qr', 'QR / Digital Wallet'),
        ('split', 'Split Payment'),
    ]

    receipt_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    cashier_name = models.CharField(max_length=100, default='Admin Operator')
    customer_name = models.CharField(max_length=150, default='Walk-in Customer')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount_tendered = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    change_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='card')
    items_data = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"POS #{self.receipt_number} - ${self.total_amount} ({self.payment_method})"

