from django.db import models
from django.conf import settings
from properties.models import Unit


class Tenant(models.Model):
    """
    Tenant model - links a user to a rental unit
    """
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('VACATED', 'Vacated'),
        ('SUSPENDED', 'Suspended'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tenancies',
        limit_choices_to={'role': 'TENANT'}
    )
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='tenant')
    move_in_date = models.DateField()
    move_out_date = models.DateField(blank=True, null=True)
    lease_duration_months = models.IntegerField(default=12)
    deposit_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-move_in_date']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.unit}"
    
    def save(self, *args, **kwargs):
        # Update unit status when tenant is created or status changes
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if self.status == 'ACTIVE':
            self.unit.status = 'OCCUPIED'
        elif self.status == 'VACATED' and not is_new:
            self.unit.status = 'VACANT'
        self.unit.save()


class TenantDocument(models.Model):
    """
    Documents uploaded by/for tenants (IDs, contracts, etc.)
    """
    DOCUMENT_TYPE_CHOICES = [
        ('ID', 'National ID'),
        ('PASSPORT', 'Passport'),
        ('CONTRACT', 'Lease Contract'),
        ('OTHER', 'Other'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    document_file = models.FileField(upload_to='tenant_documents/')
    description = models.CharField(max_length=200, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.tenant.user.get_full_name()} - {self.get_document_type_display()}"
