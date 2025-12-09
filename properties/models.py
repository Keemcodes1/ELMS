from django.db import models
from django.conf import settings


class Property(models.Model):
    """
    Property/Building model
    """
    PROPERTY_TYPE_CHOICES = [
        ('APARTMENT', 'Apartment Building'),
        ('HOUSE', 'House'),
        ('COMMERCIAL', 'Commercial Building'),
        ('MIXED', 'Mixed Use'),
    ]
    
    name = models.CharField(max_length=200)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, default='APARTMENT')
    address = models.TextField()
    city = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='properties',
        limit_choices_to={'role': 'LANDLORD'}
    )
    image = models.ImageField(upload_to='properties/', blank=True, null=True)
    total_units = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.city}"
    
    @property
    def occupied_units(self):
        return self.units.filter(status='OCCUPIED').count()
    
    @property
    def vacant_units(self):
        return self.units.filter(status='VACANT').count()
    
    @property
    def occupancy_rate(self):
        if self.total_units == 0:
            return 0
        return (self.occupied_units / self.total_units) * 100


class Unit(models.Model):
    """
    Individual rental unit (room/apartment) within a property
    """
    STATUS_CHOICES = [
        ('VACANT', 'Vacant'),
        ('OCCUPIED', 'Occupied'),
        ('MAINTENANCE', 'Under Maintenance'),
    ]
    
    building = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='units')
    unit_number = models.CharField(max_length=50)
    floor = models.IntegerField(blank=True, null=True)
    bedrooms = models.IntegerField(default=1)
    bathrooms = models.IntegerField(default=1)
    size_sqft = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='VACANT')
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='units/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['building', 'unit_number']
        unique_together = ['building', 'unit_number']
    
    def __str__(self):
        return f"{self.building.name} - Unit {self.unit_number}"
    
    @property
    def current_tenant(self):
        """Get the current active tenant for this unit"""
        from tenants.models import Tenant
        return Tenant.objects.filter(unit=self, status='ACTIVE').first()
