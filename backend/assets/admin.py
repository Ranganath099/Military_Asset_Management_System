from django.contrib import admin
from .models import Base, EquipmentType, Purchase, Transfer, Assignment, Expenditure

@admin.register(Base)
class BaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'location')
    search_fields = ('name', 'code')

@admin.register(EquipmentType)
class EquipmentTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'unit')
    search_fields = ('name', 'category')

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'base', 'equipment_type', 'quantity', 'purchased_at', 'created_by')
    list_filter = ('base', 'equipment_type', 'purchased_at')
    search_fields = ('base__name', 'equipment_type__name')

@admin.register(Transfer)
class TransferAdmin(admin.ModelAdmin):
    list_display = ('id', 'from_base', 'to_base', 'equipment_type', 'quantity', 'transfer_at')
    list_filter = ('from_base', 'to_base', 'equipment_type', 'transfer_at')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'base', 'equipment_type', 'assigned_to', 'quantity', 'assigned_at')
    list_filter = ('base', 'equipment_type', 'assigned_at')
    search_fields = ('assigned_to',)

@admin.register(Expenditure)
class ExpenditureAdmin(admin.ModelAdmin):
    list_display = ('id', 'base', 'equipment_type', 'expended_by', 'quantity', 'expended_at')
    list_filter = ('base', 'equipment_type', 'expended_at')
    search_fields = ('expended_by',)
