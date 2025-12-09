from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TenantViewSet, TenantDocumentViewSet

router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'documents', TenantDocumentViewSet, basename='tenant-document')

urlpatterns = [
    path('', include(router.urls)),
]
