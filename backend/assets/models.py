from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Base(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class EquipmentType(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, blank=True)  # e.g. Vehicle, Weapon, Ammunition
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=50, default='units')  # e.g. pieces, rounds, vehicles

    class Meta:
        unique_together = ('name', 'category')

    def __str__(self):
        return f"{self.name} ({self.category})"

class Purchase(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE, related_name='purchases')
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE, related_name='purchases')
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    purchased_at = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_purchases')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total_cost(self):
        if self.unit_cost is not None:
            return self.quantity * self.unit_cost
        return None

    def __str__(self):
        return f"Purchase {self.id} - {self.equipment_type} - {self.base}"

class Transfer(models.Model):
    from_base = models.ForeignKey(Base, on_delete=models.CASCADE, related_name='transfers_out')
    to_base = models.ForeignKey(Base, on_delete=models.CASCADE, related_name='transfers_in')
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE, related_name='transfers')
    quantity = models.PositiveIntegerField()
    transfer_at = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_transfers')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transfer {self.id} - {self.equipment_type} {self.from_base}->{self.to_base}"

class Assignment(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE, related_name='assignments')
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE, related_name='assignments')
    assigned_to = models.CharField(max_length=100)  # personnel identifier/name
    quantity = models.PositiveIntegerField()
    assigned_at = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_assignments')
    purpose = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assignment {self.id} - {self.equipment_type} -> {self.assigned_to}"

class Expenditure(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE, related_name='expenditures')
    equipment_type = models.ForeignKey(EquipmentType, on_delete=models.CASCADE, related_name='expenditures')
    expended_by = models.CharField(max_length=100)  # who used it / unit
    quantity = models.PositiveIntegerField()
    expended_at = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_expenditures')
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Expenditure {self.id} - {self.equipment_type} - {self.base}"
