from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Tenant, TenantDocument
from .serializers import (
    TenantSerializer,
    TenantListSerializer,
    TenantCreateSerializer,
    TenantDocumentSerializer
)


class TenantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tenants
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TenantListSerializer
        elif self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see tenants in their properties
        if user.is_landlord:
            return Tenant.objects.filter(unit__building__owner=user)
        # Admins see all tenants
        elif user.is_staff:
            return Tenant.objects.all()
        # Tenants see themselves
        elif user.is_tenant:
            return Tenant.objects.filter(user=user)
        return Tenant.objects.none()
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active tenants"""
        tenants = self.get_queryset().filter(status='ACTIVE')
        serializer = TenantListSerializer(tenants, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vacated(self, request):
        """Get all vacated tenants"""
        tenants = self.get_queryset().filter(status='VACATED')
        serializer = TenantListSerializer(tenants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def vacate(self, request, pk=None):
        """Mark tenant as vacated"""
        tenant = self.get_object()
        tenant.status = 'VACATED'
        tenant.move_out_date = request.data.get('move_out_date')
        tenant.save()
        return Response({'message': 'Tenant marked as vacated'})
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a tenant"""
        tenant = self.get_object()
        documents = tenant.documents.all()
        serializer = TenantDocumentSerializer(documents, many=True)
        return Response(serializer.data)


class TenantDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tenant documents
    """
    permission_classes = [IsAuthenticated]
    serializer_class = TenantDocumentSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see documents for their tenants
        if user.is_landlord:
            return TenantDocument.objects.filter(tenant__unit__building__owner=user)
        # Admins see all documents
        elif user.is_staff:
            return TenantDocument.objects.all()
        # Tenants see their own documents
        elif user.is_tenant:
            return TenantDocument.objects.filter(tenant__user=user)
        return TenantDocument.objects.none()
