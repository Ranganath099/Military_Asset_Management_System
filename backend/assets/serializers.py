from rest_framework import serializers
from .models import Base, EquipmentType, Purchase, Transfer, Assignment, Expenditure

class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Base
        fields = ['id', 'name', 'code', 'location']

class EquipmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentType
        fields = ['id', 'name', 'category', 'description', 'unit']

class PurchaseSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Purchase
        fields = [
            'id', 'base', 'equipment_type', 'quantity', 'unit_cost',
            'purchased_at', 'created_by', 'notes', 'created_at', 'total_cost'
        ]
        read_only_fields = ['created_by', 'created_at', 'total_cost']

class TransferSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Transfer
        fields = [
            'id', 'from_base', 'to_base', 'equipment_type',
            'quantity', 'transfer_at', 'created_by', 'notes', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

class AssignmentSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Assignment
        fields = [
            'id', 'base', 'equipment_type', 'assigned_to', 'quantity',
            'assigned_at', 'purpose', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

class ExpenditureSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Expenditure
        fields = [
            'id', 'base', 'equipment_type', 'expended_by', 'quantity',
            'expended_at', 'reason', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']
