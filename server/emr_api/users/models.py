from django.db import models

class User(models.Model):
    wallet_address = models.CharField(max_length=42, unique=True)
    ROLE_CHOICES = [('admin', 'Admin'), ('provider', 'Provider'), ('patient', 'Patient')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    created_at = models.DateTimeField(auto_now_add=True)