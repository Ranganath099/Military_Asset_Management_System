from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class TransactionLog(models.Model):
    ACTION_CHOICES = [
        ('PURCHASE', 'Purchase'),
        ('TRANSFER', 'Transfer'),
        ('ASSIGNMENT', 'Assignment'),
        ('EXPENDITURE', 'Expenditure'),
    ]

    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='transaction_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.action_type} by {self.user} on {self.timestamp}"
