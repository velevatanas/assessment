from django.db import transaction
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .models import Product, UserProduct
from .serializers import CustomTokenObtainPairSerializer, ProductSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ProductSearchView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        search_query = self.request.query_params.get('search', None)
        if search_query:
            return Product.objects.filter(Q(name__icontains=search_query) | Q(description__icontains=search_query))
        return Product.objects.none()

class ProductSelectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        with transaction.atomic():
            product = get_object_or_404(Product, pk=pk)

            if product.stock > 0:
                product.stock -= 1
                product.save()

                UserProduct.objects.create(custom_user=request.user, product=product)

                return Response({"message": f"{product.name} selected!", "stock": product.stock}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Product out of stock"}, status=status.HTTP_400_BAD_REQUEST)

class ProductDeselectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        with transaction.atomic():
            product = get_object_or_404(Product, pk=pk)
            user_product = UserProduct.objects.filter(custom_user=request.user, product=product)
            if user_product.exists():
                product.stock += 1
                product.save()
                user_product.delete()
                return Response({"message": "Selection cleared"}, status=status.HTTP_200_OK)
            return Response({"error": "Product was not selected"}, status=status.HTTP_400_BAD_REQUEST)

            
class LogoutAndDeselectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                user_products = UserProduct.objects.filter(custom_user=request.user)

                if user_products.exists():
                    for user_product in user_products:
                        product = user_product.product
                        product.stock += 1
                        product.save()

                    user_products.delete()

                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({"message": "Logged out and all selections cleared"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)