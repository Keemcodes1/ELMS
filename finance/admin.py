from django.contrib import admin
from .models import Invoice, Payment, Receipt


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'tenant', 'month', 'total_amount', 'amount_paid', 'balance', 'status', 'due_date')
    list_filter = ('status', 'month', 'created_at')
    search_fields = ('invoice_number', 'tenant__user__username', 'tenant__user__first_name')
    readonly_fields = ('subtotal', 'balance', 'created_at', 'updated_at')
    date_hierarchy = 'month'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'amount', 'payment_method', 'payment_date', 'status', 'transaction_reference')
    list_filter = ('payment_method', 'status', 'payment_date')
    search_fields = ('tenant__user__username', 'transaction_reference')
    readonly_fields = ('recorded_by', 'created_at', 'updated_at')
    date_hierarchy = 'payment_date'


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'payment', 'generated_at')
    search_fields = ('receipt_number', 'payment__tenant__user__username')
    readonly_fields = ('generated_at',)
