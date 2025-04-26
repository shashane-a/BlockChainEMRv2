from django.db import models

# Patient model with ip and wallet address
class Patient(models.Model):
    id = models.AutoField(primary_key=True)
    wallet_address = models.CharField(max_length=42, unique=True)

    def __str__(self):
        return f"Patient {self.wallet_address}"
    
