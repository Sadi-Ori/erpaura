from django import forms
from .models import ContactInquiry, NewsletterSubscriber


class ContactInquiryForm(forms.ModelForm):
    class Meta:
        model = ContactInquiry
        fields = ['name', 'email', 'subject', 'message', 'phone', 'company']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Your Full Name', 'required': True}),
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'Your Email Address', 'required': True}),
            'subject': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Subject or Requirement', 'required': True}),
            'message': forms.Textarea(attrs={'class': 'form-textarea', 'placeholder': 'Describe your business needs...', 'rows': 4, 'required': True}),
            'phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Phone Number (Optional)'}),
            'company': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Company Name (Optional)'}),
        }


class NewsletterForm(forms.ModelForm):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email']
        widgets = {
            'email': forms.EmailInput(attrs={'class': 'newsletter-input', 'placeholder': 'Enter your email for updates', 'required': True}),
        }
