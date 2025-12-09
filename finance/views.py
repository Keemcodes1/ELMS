from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from datetime import datetime, timedelta
from .models import Invoice, Payment, Receipt
from .serializers import (
    InvoiceSerializer,
    InvoiceListSerializer,
    PaymentSerializer,
    PaymentListSerializer,
    ReceiptSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing invoices
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see invoices for their tenants
        if user.is_landlord:
            return Invoice.objects.filter(tenant__unit__building__owner=user)
        # Admins see all invoices
        elif user.is_staff:
            return Invoice.objects.all()
        # Tenants see their own invoices
        elif user.is_tenant:
            return Invoice.objects.filter(tenant__user=user)
        return Invoice.objects.none()
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending invoices"""
        invoices = self.get_queryset().filter(status='PENDING')
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get all overdue invoices"""
        invoices = self.get_queryset().filter(status='OVERDUE')
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def paid(self, request):
        """Get all paid invoices"""
        invoices = self.get_queryset().filter(status='PAID')
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get invoice statistics"""
        queryset = self.get_queryset()
        total_invoiced = queryset.aggregate(total=Sum('total_amount'))['total'] or 0
        total_paid = queryset.aggregate(total=Sum('amount_paid'))['total'] or 0
        total_outstanding = queryset.aggregate(total=Sum('balance'))['total'] or 0
        
        return Response({
            'total_invoiced': total_invoiced,
            'total_paid': total_paid,
            'total_outstanding': total_outstanding,
            'pending_count': queryset.filter(status='PENDING').count(),
            'overdue_count': queryset.filter(status='OVERDUE').count(),
            'paid_count': queryset.filter(status='PAID').count(),
        })


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payments
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see payments for their tenants
        if user.is_landlord:
            return Payment.objects.filter(tenant__unit__building__owner=user)
        # Admins see all payments
        elif user.is_staff:
            return Payment.objects.all()
        # Tenants see their own payments
        elif user.is_tenant:
            return Payment.objects.filter(tenant__user=user)
        return Payment.objects.none()
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent payments (last 30 days)"""
        thirty_days_ago = datetime.now().date() - timedelta(days=30)
        payments = self.get_queryset().filter(payment_date__gte=thirty_days_ago)
        serializer = PaymentListSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_tenant(self, request):
        """Get payment history grouped by tenant"""
        tenant_id = request.query_params.get('tenant_id')
        if not tenant_id:
            return Response({'error': 'tenant_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        payments = self.get_queryset().filter(tenant_id=tenant_id)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get payment statistics"""
        queryset = self.get_queryset()
        total_received = queryset.filter(status='COMPLETED').aggregate(total=Sum('amount'))['total'] or 0
        
        # Monthly collection
        current_month = datetime.now().replace(day=1).date()
        monthly_collection = queryset.filter(
            payment_date__gte=current_month,
            status='COMPLETED'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'total_received': total_received,
            'monthly_collection': monthly_collection,
            'total_payments': queryset.count(),
            'completed_count': queryset.filter(status='COMPLETED').count(),
            'pending_count': queryset.filter(status='PENDING').count(),
        })


class ReceiptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing receipts (read-only)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ReceiptSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Landlords see receipts for their tenants
        if user.is_landlord:
            return Receipt.objects.filter(payment__tenant__unit__building__owner=user)
        # Admins see all receipts
        elif user.is_staff:
            return Receipt.objects.all()
        # Tenants see their own receipts
        elif user.is_tenant:
            return Receipt.objects.filter(payment__tenant__user=user)
        return Receipt.objects.none()
