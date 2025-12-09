from django.contrib import admin
from .models import Tenant, TenantDocument


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('user', 'unit', 'move_in_date', 'status', 'deposit_paid')
    list_filter = ('status', 'unit__building')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'unit__unit_number')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TenantDocument)
class TenantDocumentAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'document_type', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')
    search_fields = ('tenant__user__username', 'description')
    readonly_fields = ('uploaded_at',)
