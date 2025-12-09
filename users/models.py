from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with role-based access control
    """
    ROLE_CHOICES = [
        ('LANDLORD', 'Landlord'),
        ('CARETAKER', 'Caretaker'),
        ('TENANT', 'Tenant'),
        ('ADMIN', 'Administrator'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='TENANT')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='users/photos/', blank=True, null=True)
    national_id = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
    
    @property
    def is_landlord(self):
        return self.role == 'LANDLORD'
    
    @property
    def is_caretaker(self):
        return self.role == 'CARETAKER'
    
    @property
    def is_tenant(self):
        return self.role == 'TENANT'
