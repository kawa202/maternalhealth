from django.db import models
from django.contrib.auth.models import User
from datetime import datetime
from django.utils import timezone


class Profile(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    role = models.CharField(max_length=200,blank=True,null=True)
    phone_number = models.CharField(max_length=200,blank=True,null=True)
    provider = models.ForeignKey('auth.User',related_name="provider", on_delete=models.CASCADE,null=True,blank=True)
    blood_type = models.CharField(max_length=200,blank=True,null=True)
    due_date =models.DateField( auto_now=False, auto_now_add=False, blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    
    def __str__(self):
        return self.user.username
    

class HealthMetrics(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    age = models.CharField( max_length=50)
    systolic_bp = models.CharField( max_length=50)
    diastolic_bp = models.CharField( max_length=50)
    bs = models.CharField( max_length=50)
    body_temp = models.CharField( max_length=50)
    heartrate = models.CharField( max_length=50)
    predicted_risk = models.CharField( max_length=50)
    date = models.DateTimeField( auto_now_add=True,null=True,blank=True)
    
    def __str__(self):
        return self.user.username
    
class Appointments(models.Model):
    patient = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    provider = models.ForeignKey('auth.User',related_name='sent_appointments', on_delete=models.CASCADE,null=True,blank=True)
    time =  models.DateTimeField( auto_now=False, auto_now_add=False)
    type= models.CharField( max_length=250)
    notes = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ("Scheduled", "Scheduled"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
        ("Rescheduled", "Rescheduled"),
    ], default="Scheduled")
    created_at = models.DateTimeField( auto_now_add=True,null=True,blank=True)
    updated_at = models.DateTimeField( auto_now=True,null=True,blank=True)
    
    def __str__(self):
        return self.patient.first_name
    
class Reports(models.Model):
    provider = models.ForeignKey('auth.User',related_name='sent_report', on_delete=models.CASCADE,null=True,blank=True)
    patient= models.ForeignKey('auth.User',related_name='received_report', on_delete=models.CASCADE)
    notes = models.TextField()
    recommendations = models.TextField()
    next_appointment = models.DateField()
    created_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.patient.username

class MedicalHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='medical_histories')
    conditions = models.TextField(blank=True, help_text="Comma-separated list of conditions (e.g. hypertension, diabetes)")
    medications = models.TextField(blank=True, help_text="Comma-separated list of medications")
    allergies = models.TextField(blank=True, help_text="Comma-separated list of allergies")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Medical History of {self.user.get_full_name() or self.user.username}"
    
class Notifications(models.Model):
    user = models.ForeignKey(User,related_name='notifications_received', on_delete=models.CASCADE)
    provider = models.ForeignKey('auth.User',related_name='notifications_sent', on_delete=models.CASCADE,null=True,blank=True)
    message = models.TextField()
    
    def __str__(self):
        return self.user.email
    