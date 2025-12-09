from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, ComplaintImageViewSet

router = DefaultRouter()
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'images', ComplaintImageViewSet, basename='complaint-image')

urlpatterns = [
    path('', include(router.urls)),
]
