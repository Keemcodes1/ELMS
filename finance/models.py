from django.db import models
from django.conf import settings
from tenants.models import Tenant
from decimal import Decimal


class Invoice(models.Model):
    """
    Monthly invoice for rent and utilities
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    month = models.DateField(help_text="Invoice month (first day of the month)")
    
    # Charges
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    water_bill = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    electricity_bill = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_charges_description = models.TextField(blank=True, null=True)
    
    # Totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    due_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-month']
        unique_together = ['tenant', 'month']
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.tenant.user.get_full_name()}"
    
    def save(self, *args, **kwargs):
        from django.utils import timezone
        # Calculate totals
        self.subtotal = (
            self.rent_amount + 
            self.water_bill + 
            self.electricity_bill + 
            self.other_charges
        )
        self.total_amount = self.subtotal
        self.balance = self.total_amount - self.amount_paid
        
        # Update status based on payment
        if self.amount_paid >= self.total_amount:
            self.status = 'PAID'
        elif self.due_date and self.due_date < timezone.now().date() and self.status == 'PENDING':
            self.status = 'OVERDUE'
        
        super().save(*args, **kwargs)


class Payment(models.Model):
    """
    Payment record for rent and other charges
    """
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('MOBILE_MONEY', 'Mobile Money'),
        ('CHEQUE', 'Cheque'),
        ('CARD', 'Card'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    invoice = models.ForeignKey(
        Invoice, 
        on_delete=models.SET_NULL, 
        related_name='payments',
        blank=True,
        null=True
    )
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = models.DateField()
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    notes = models.TextField(blank=True, null=True)
    
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_payments'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment {self.id} - {self.tenant.user.get_full_name()} - {self.amount}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Update invoice if linked
        if self.invoice and self.status == 'COMPLETED':
            invoice = self.invoice
            total_paid = invoice.payments.filter(status='COMPLETED').aggregate(
                total=models.Sum('amount')
            )['total'] or Decimal('0')
            invoice.amount_paid = total_paid
            invoice.balance = invoice.total_amount - invoice.amount_paid
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = 'PAID'
            invoice.save()


class Receipt(models.Model):
    """
    Receipt for payments
    """
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='receipt')
    receipt_number = models.CharField(max_length=50, unique=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-generated_at']
    
    def __str__(self):
        return f"Receipt {self.receipt_number} - {self.payment.tenant.user.get_full_name()}"
