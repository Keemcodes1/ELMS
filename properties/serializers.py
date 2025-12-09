from rest_framework import serializers
from .models import Property, Unit


class UnitSerializer(serializers.ModelSerializer):
    """Serializer for Unit model"""
    current_tenant = serializers.SerializerMethodField()
    property_name = serializers.CharField(source='building.name', read_only=True)
    
    class Meta:
        model = Unit
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_current_tenant(self, obj):
        tenant = obj.current_tenant
        if tenant:
            return {
                'id': tenant.id,
                'name': tenant.user.get_full_name(),
                'phone': tenant.user.phone,
            }
        return None


class UnitListSerializer(serializers.ModelSerializer):
    """Minimal serializer for unit lists"""
    property_name = serializers.CharField(source='building.name', read_only=True)
    
    class Meta:
        model = Unit
        fields = ('id', 'unit_number', 'property_name', 'rent_amount', 'status')


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for Property model with nested units"""
    units = UnitSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    occupancy_rate = serializers.ReadOnlyField()
    occupied_units = serializers.ReadOnlyField()
    vacant_units = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('id', 'total_units', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Set owner to current user if not provided
        if 'owner' not in validated_data:
            validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class PropertyListSerializer(serializers.ModelSerializer):
    """Minimal serializer for property lists"""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    occupancy_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = ('id', 'name', 'property_type', 'city', 'total_units', 
                  'occupied_units', 'vacant_units', 'occupancy_rate', 'owner_name')
