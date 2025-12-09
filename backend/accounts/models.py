from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_ADMIN = 'ADMIN'
    ROLE_COMMANDER = 'COMMANDER'
    ROLE_LOGISTICS = 'LOGISTICS'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_COMMANDER, 'Base Commander'),
        (ROLE_LOGISTICS, 'Logistics Officer'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    base = models.ForeignKey(
        'assets.Base',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
