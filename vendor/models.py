from django.db import models
from accounts.models import User,UserProfile

# Create your models here.

class Vendor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='user_profile', null=True, blank=True)
    vendor_name = models.CharField(max_length=100)
    vendor_license_number = models.ImageField(upload_to='vendor/license')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.vendor_name





