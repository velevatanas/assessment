from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Product, UserProduct, CustomUser

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(username=attrs['username'], password=attrs['password'])
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        data = {
            'refresh': str(refresh),
            'access': access_token,
            'user': {
                'username': user.username,
                'email': user.email
            }
        }

        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock']

class UserProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProduct
        fields = ['custom_user', 'product', 'selected_at']
