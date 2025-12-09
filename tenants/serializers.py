from rest_framework import serializers
from .models import Tenant, TenantDocument
from django.contrib.auth import get_user_model

User = get_user_model()


class TenantDocumentSerializer(serializers.ModelSerializer):
    """Serializer for tenant documents"""
    
    class Meta:
        model = TenantDocument
        fields = '__all__'
        read_only_fields = ('id', 'uploaded_at')


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model"""
    documents = TenantDocumentSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    unit_number = serializers.CharField(source='unit.unit_number', read_only=True)
    property_name = serializers.CharField(source='unit.building.name', read_only=True)
    rent_amount = serializers.DecimalField(
        source='unit.rent_amount', 
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    
    class Meta:
        model = Tenant
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class TenantListSerializer(serializers.ModelSerializer):
    """Minimal serializer for tenant lists"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    unit_number = serializers.CharField(source='unit.unit_number', read_only=True)
    property_name = serializers.CharField(source='unit.building.name', read_only=True)
    
    class Meta:
        model = Tenant
        fields = ('id', 'user_name', 'user_phone', 'unit_number', 'property_name', 
                  'move_in_date', 'status')


class TenantCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tenants with user details"""
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Tenant
        fields = ('unit', 'move_in_date', 'lease_duration_months', 'deposit_paid',
                  'emergency_contact_name', 'emergency_contact_phone', 'notes',
                  'username', 'email', 'first_name', 'last_name', 'phone', 'password')
    
    def create(self, validated_data):
        # Extract user data
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'phone': validated_data.pop('phone'),
            'role': 'TENANT',
        }
        
        password = validated_data.pop('password', None)
        
        # Create user
        if password:
            user = User.objects.create_user(password=password, **user_data)
        else:
            # Generate default password
            user = User.objects.create_user(password='tenant123', **user_data)
        
        # Create tenant
        tenant = Tenant.objects.create(user=user, **validated_data)
        return tenant
