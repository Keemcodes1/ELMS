from django.db import models
from django.conf import settings
from tenants.models import Tenant
from properties.models import Unit


class Complaint(models.Model):
    """
    Maintenance complaints/requests from tenants
    """
    STATUS_CHOICES = [
        ('SUBMITTED', 'Submitted'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    CATEGORY_CHOICES = [
        ('PLUMBING', 'Plumbing'),
        ('ELECTRICAL', 'Electrical'),
        ('STRUCTURAL', 'Structural'),
        ('APPLIANCE', 'Appliance'),
        ('CLEANING', 'Cleaning'),
        ('SECURITY', 'Security'),
        ('OTHER', 'Other'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='complaints')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='complaints')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')
    
    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints',
        limit_choices_to={'role__in': ['CARETAKER', 'LANDLORD']}
    )
    
    # Cost tracking
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Dates
    submitted_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    closed_at = models.DateTimeField(blank=True, null=True)
    
    # Additional info
    resolution_notes = models.TextField(blank=True, null=True)
    technician_name = models.CharField(max_length=200, blank=True, null=True)
    technician_phone = models.CharField(max_length=15, blank=True, null=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.title} - {self.tenant.user.get_full_name()} ({self.get_status_display()})"


class ComplaintImage(models.Model):
    """
    Images attached to complaints
    """
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='complaint_images/')
    description = models.CharField(max_length=200, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['uploaded_at']
    
    def __str__(self):
        return f"Image for {self.complaint.title}"
