from django.contrib import admin
from .models import Complaint, ComplaintImage


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'tenant', 'unit', 'category', 'priority', 'status', 'submitted_at')
    list_filter = ('status', 'priority', 'category', 'submitted_at')
    search_fields = ('title', 'description', 'tenant__user__username')
    readonly_fields = ('submitted_at', 'updated_at')
    date_hierarchy = 'submitted_at'


@admin.register(ComplaintImage)
class ComplaintImageAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'description', 'uploaded_at')
    search_fields = ('complaint__title', 'description')
    readonly_fields = ('uploaded_at',)
