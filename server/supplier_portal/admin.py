from django.contrib import admin, messages

from .emails import send_supplier_verified_email
from .models import CatalogProduct, CatalogProductImage, SupplierAccount, SupplierOrderLine


@admin.action(description='Approve selected suppliers and send verification email')
def approve_suppliers(modeladmin, request, queryset):
    approved = 0
    for supplier in queryset:
        if supplier.is_verified:
            continue
        supplier.is_verified = True
        supplier.save(update_fields=['is_verified', 'updated_at'])
        send_supplier_verified_email(supplier)
        approved += 1
    modeladmin.message_user(request, f'{approved} supplier(s) approved and notified.', messages.SUCCESS)


@admin.register(SupplierAccount)
class SupplierAccountAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'email', 'country', 'is_active', 'is_verified', 'created_at')
    list_filter = ('is_active', 'is_verified', 'country')
    search_fields = ('company_name', 'email', 'contact_name')
    actions = [approve_suppliers]
    readonly_fields = ('created_at', 'updated_at', 'last_login')


class CatalogProductImageInline(admin.TabularInline):
    model = CatalogProductImage
    extra = 0


@admin.register(CatalogProduct)
class CatalogProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'supplier', 'category', 'trade_price', 'is_published', 'updated_at')
    list_filter = ('is_published', 'category', 'supplier')
    search_fields = ('name', 'sku', 'supplier__company_name')
    inlines = [CatalogProductImageInline]


@admin.register(SupplierOrderLine)
class SupplierOrderLineAdmin(admin.ModelAdmin):
    list_display = ('id', 'supplier', 'catalog_product', 'project', 'status', 'quantity', 'created_at')
    list_filter = ('status', 'supplier')
    search_fields = ('supplier__company_name', 'catalog_product__name', 'project__project_name')
