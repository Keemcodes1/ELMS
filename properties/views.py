from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Property, Unit
from .serializers import (
    PropertySerializer, 
    PropertyListSerializer,
    UnitSerializer,
    UnitListSerializer
)


class PropertyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing properties
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see their own properties
        if user.is_landlord:
            return Property.objects.filter(owner=user)
        # Admins see all properties
        elif user.is_staff:
            return Property.objects.all()
        # Tenants see properties where they have a unit
        elif user.is_tenant:
            return Property.objects.filter(units__tenant__user=user).distinct()
        return Property.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def units(self, request, pk=None):
        """Get all units for a property"""
        property = self.get_object()
        units = property.units.all()
        serializer = UnitSerializer(units, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def vacant_units(self, request, pk=None):
        """Get vacant units for a property"""
        property = self.get_object()
        units = property.units.filter(status='VACANT')
        serializer = UnitSerializer(units, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get overall property statistics"""
        queryset = self.get_queryset()
        total_properties = queryset.count()
        total_units = sum(p.total_units for p in queryset)
        occupied_units = sum(p.occupied_units for p in queryset)
        vacant_units = sum(p.vacant_units for p in queryset)
        
        return Response({
            'total_properties': total_properties,
            'total_units': total_units,
            'occupied_units': occupied_units,
            'vacant_units': vacant_units,
            'occupancy_rate': (occupied_units / total_units * 100) if total_units > 0 else 0
        })


class UnitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing units
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UnitListSerializer
        return UnitSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see units in their properties
        if user.is_landlord:
            return Unit.objects.filter(property__owner=user)
        # Admins see all units
        elif user.is_staff:
            return Unit.objects.all()
        # Tenants see their own unit
        elif user.is_tenant:
            return Unit.objects.filter(tenant__user=user)
        return Unit.objects.none()
    
    def perform_create(self, serializer):
        unit = serializer.save()
        # Update property total_units count
        building = unit.building
        building.total_units = building.units.count()
        building.save()
    
    def perform_destroy(self, instance):
        building = instance.building
        instance.delete()
        # Update property total_units count
        building.total_units = building.units.count()
        building.save()
    
    @action(detail=False, methods=['get'])
    def vacant(self, request):
        """Get all vacant units"""
        units = self.get_queryset().filter(status='VACANT')
        serializer = UnitListSerializer(units, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def occupied(self, request):
        """Get all occupied units"""
        units = self.get_queryset().filter(status='OCCUPIED')
        serializer = UnitListSerializer(units, many=True)
        return Response(serializer.data)
