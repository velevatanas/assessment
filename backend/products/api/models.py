from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):  
    email = models.EmailField(unique=True)  # Enforce email as unique and required

    REQUIRED_FIELDS = ['email']  # Make email required for superusers

class Product(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class UserProduct(models.Model):
    custom_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE) 
    selected_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        unique_together = ('custom_user', 'product')  # Prevent duplicate selections