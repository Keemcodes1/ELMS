from rest_framework import serializers
from .models import Invoice, Payment, Receipt
from datetime import datetime


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model"""
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    tenant_phone = serializers.CharField(source='tenant.user.phone', read_only=True)
    unit_number = serializers.CharField(source='tenant.unit.unit_number', read_only=True)
    property_name = serializers.CharField(source='tenant.unit.building.name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('id', 'invoice_number', 'subtotal', 'balance', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Generate invoice number
        today = datetime.now()
        count = Invoice.objects.filter(created_at__year=today.year, created_at__month=today.month).count()
        invoice_number = f"INV-{today.strftime('%Y%m')}-{count + 1:04d}"
        validated_data['invoice_number'] = invoice_number
        return super().create(validated_data)


class InvoiceListSerializer(serializers.ModelSerializer):
    """Minimal serializer for invoice lists"""
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = ('id', 'invoice_number', 'tenant_name', 'month', 'total_amount', 
                  'amount_paid', 'balance', 'status', 'due_date')


class ReceiptSerializer(serializers.ModelSerializer):
    """Serializer for Receipt model"""
    payment_details = serializers.SerializerMethodField()
    tenant_name = serializers.CharField(source='payment.tenant.user.get_full_name', read_only=True)
    
    class Meta:
        model = Receipt
        fields = '__all__'
        read_only_fields = ('id', 'receipt_number', 'generated_at')
    
    def get_payment_details(self, obj):
        return {
            'amount': obj.payment.amount,
            'payment_method': obj.payment.get_payment_method_display(),
            'payment_date': obj.payment.payment_date,
            'transaction_reference': obj.payment.transaction_reference,
        }


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    receipt = ReceiptSerializer(read_only=True)
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('id', 'recorded_by', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Set recorded_by to current user
        validated_data['recorded_by'] = self.context['request'].user
        payment = super().create(validated_data)
        
        # Auto-generate receipt
        receipt_number = f"RCP-{datetime.now().strftime('%Y%m%d')}-{payment.id:06d}"
        Receipt.objects.create(payment=payment, receipt_number=receipt_number)
        
        return payment


class PaymentListSerializer(serializers.ModelSerializer):
    """Minimal serializer for payment lists"""
    tenant_name = serializers.CharField(source='tenant.user.get_full_name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = ('id', 'tenant_name', 'amount', 'payment_method_display', 
                  'payment_date', 'transaction_reference', 'status')
