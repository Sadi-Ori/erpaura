"""
URL configuration for Aura ERP project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        'name': 'Aura ERP Enterprise API',
        'version': 'v3.2.0',
        'status': 'healthy',
        'endpoints': {
            'core': '/api/core/',
            'products': '/api/products/',
            'sales': '/api/sales/',
            'inventory': '/api/inventory/',
            'crm': '/api/crm/',
            'projects': '/api/projects/',
            'hr': '/api/hr/',
            'docs': '/api/docs/',
            'blog': '/api/blog/',
            'procurement': '/api/procurement/',
            'manufacturing': '/api/manufacturing/',
            'maintenance': '/api/maintenance/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/', api_root, name='api-index'),
    path('admin/', admin.site.urls),
    path('api/core/', include('apps.core.urls', namespace='core')),
    path('api/products/', include('apps.products.urls', namespace='products')),
    path('api/sales/', include('apps.sales.urls', namespace='sales')),
    path('api/inventory/', include('apps.inventory.urls', namespace='inventory')),
    path('api/crm/', include('apps.crm.urls', namespace='crm')),
    path('api/projects/', include('apps.projects.urls', namespace='projects')),
    path('api/hr/', include('apps.hr.urls', namespace='hr')),
    path('api/docs/', include('apps.docs.urls', namespace='docs')),
    path('api/blog/', include('apps.blog.urls', namespace='blog')),
    path('api/procurement/', include('apps.procurement.urls', namespace='procurement')),
    path('api/manufacturing/', include('apps.manufacturing.urls', namespace='manufacturing')),
    path('api/maintenance/', include('apps.maintenance.urls', namespace='maintenance')),
]
