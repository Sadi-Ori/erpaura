from django import forms
from .models import Order, Coupon


class CheckoutForm(forms.ModelForm):
    coupon_code = forms.CharField(max_length=50, required=False, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Enter Promo / Coupon Code'
    }))

    class Meta:
        model = Order
        fields = ['customer_name', 'customer_email', 'customer_phone', 'company_name', 'billing_address', 'payment_method']
        widgets = {
            'customer_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Full Name', 'required': True}),
            'customer_email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'name@company.com', 'required': True}),
            'customer_phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '+1 (555) 000-0000'}),
            'company_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Enterprise or Business Name'}),
            'billing_address': forms.Textarea(attrs={'class': 'form-textarea', 'placeholder': 'Street, City, State, ZIP, Country', 'rows': 3}),
            'payment_method': forms.Select(attrs={'class': 'form-select'}, choices=[
                ('card', 'Credit / Debit Card'),
                ('invoice', 'Direct Company Invoice / Wire Transfer'),
                ('crypto', 'Enterprise Crypto / USDC'),
            ])
        }
