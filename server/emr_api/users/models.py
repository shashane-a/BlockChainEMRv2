from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, wallet_address, password=None, **extra_fields):
        if not wallet_address:
            raise ValueError('The Wallet Address must be set')
        user = self.model(wallet_address=wallet_address, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, wallet_address, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(wallet_address, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    wallet_address = models.CharField(max_length=42, unique=True)
    ROLE_CHOICES = [('admin', 'Admin'), ('provider', 'Provider'), ('patient', 'Patient')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'wallet_address'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.wallet_address
