from django.contrib import admin
from .models import Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'property_type', 'city', 'owner', 'total_units', 'occupied_units', 'vacant_units')
    list_filter = ('property_type', 'city')
    search_fields = ('name', 'city', 'address', 'owner__username')
    readonly_fields = ('total_units', 'created_at', 'updated_at')


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('unit_number', 'building', 'rent_amount', 'status', 'bedrooms', 'bathrooms')
    list_filter = ('status', 'building', 'bedrooms')
    search_fields = ('unit_number', 'building__name')
    readonly_fields = ('created_at', 'updated_at')
