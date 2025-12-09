from django.db.models.signals import post_save
from django.dispatch import receiver

from assets.models import Purchase, Transfer, Assignment, Expenditure
from .models import TransactionLog

def _create_log(instance, action_type):
    user = getattr(instance, 'created_by', None)
    TransactionLog.objects.create(
        user=user,
        action_type=action_type,
        model_name=instance.__class__.__name__,
        object_id=instance.id,
        details={
            'base': getattr(instance, 'base_id', None),
            'from_base': getattr(instance, 'from_base_id', None),
            'to_base': getattr(instance, 'to_base_id', None),
            'equipment_type': getattr(instance, 'equipment_type_id', None),
            'quantity': getattr(instance, 'quantity', None),
        }
    )

@receiver(post_save, sender=Purchase)
def log_purchase(sender, instance, created, **kwargs):
    if created:
        _create_log(instance, 'PURCHASE')

@receiver(post_save, sender=Transfer)
def log_transfer(sender, instance, created, **kwargs):
    if created:
        _create_log(instance, 'TRANSFER')

@receiver(post_save, sender=Assignment)
def log_assignment(sender, instance, created, **kwargs):
    if created:
        _create_log(instance, 'ASSIGNMENT')

@receiver(post_save, sender=Expenditure)
def log_expenditure(sender, instance, created, **kwargs):
    if created:
        _create_log(instance, 'EXPENDITURE')
