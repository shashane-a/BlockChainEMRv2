from django.db import models

# Create your models here.
class Event(models.Model):
    
    event_types = [
        ('user_registration', 'User Registration'),
        ('patient_added', 'Patient Added'),
        ('provider_added', 'Provider Added'),
        ('record_created', 'Record Created'),
        ('record_updated', 'Record Updated'),
        ('record_accessed', 'Record Accessed'),
        ('appointment_scheduled', 'Appointment Scheduled'),
        ('appointment_cancelled', 'Appointment Cancelled'),
        ('prescription_added', 'Prescription Added'),
        ('prescription_removed', 'Prescription Removed'),
        ('access_granted', 'Access Granted'),
        ('access_revoked', 'Access Revoked'),
        ('note_added', 'Note Added'),
        ('note_removed', 'Note Removed'),
    ]
    
    id = models.AutoField(primary_key=True)
    event_type = models.CharField(max_length=50, choices=event_types)
    event_details = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    related_wallet_address = models.CharField(max_length=42)
    related_patient_wallet_address = models.CharField(max_length=42, null=True, blank=True) 

    def __str__(self):
        return f"Event {self.id} - {self.event_type} at {self.timestamp}"
