from rest_framework import serializers
from .models import Complaint, ComplaintImage


class ComplaintImageSerializer(serializers.ModelSerializer):
    """Serializer for complaint images"""
    
    class Meta:
        model = ComplaintImage
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at')


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for Complaint model"""
    images = ComplaintImageSerializer(many=True, read_only=True)
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.user.phone', read_only=True)
    unit_number = serializers.CharField(source='unit.unit_number', read_only=True)
    property_name = serializers.CharField(source='unit.building.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True, allow_null=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('id', 'submitted_at', 'updated_at')


class ComplaintListSerializer(serializers.ModelSerializer):
    """Minimal serializer for complaint lists"""
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    unit_number = serializers.CharField(source='unit.unit_number', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Complaint
        fields = ('id', 'title', 'tenant_name', 'unit_number', 'category',
                  'priority_display', 'status_display', 'submitted_at')


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating complaints (simplified for tenants)"""
    
    class Meta:
        model = Complaint
        fields = ('title', 'description', 'category', 'priority')
    
    def create(self, validated_data):
        # Auto-fill tenant and unit from current user
        user = self.context['request'].user
        tenant = user.tenancies.filter(status='ACTIVE').first()
        
        if not tenant:
            raise serializers.ValidationError("You must be an active tenant to submit complaints.")
        
        validated_data['tenant'] = tenant
        validated_data['unit'] = tenant.unit
        
        return super().create(validated_data)
