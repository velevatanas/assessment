from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from ..models import Product, UserProduct
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class ProductAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client.force_authenticate(user=self.user)

        self.product1 = Product.objects.create(name="Test Product 1", description="A test product", price=10.99, stock=5)
        self.product2 = Product.objects.create(name="Another Item", description="Description with test keyword", price=15.99, stock=2)

    def test_search_products(self):
        response = self.client.get("/api/products/?search=Test")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Both products have "Test" in name or description

    def test_search_no_results(self):
        response = self.client.get("/api/products/?search=Unknown")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_select_product_success(self):
        response = self.client.post(f"/api/products/{self.product1.id}/select/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 4)  # Stock reduced by 1
        self.assertTrue(UserProduct.objects.filter(custom_user=self.user, product=self.product1).exists())

    def test_select_product_out_of_stock(self):
        self.product2.stock = 0
        self.product2.save()
        response = self.client.post(f"/api/products/{self.product2.id}/select/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Product out of stock", response.data["error"])

    def test_deselect_product_success(self):
        self.client.post(f"/api/products/{self.product1.id}/select/")
        response = self.client.post(f"/api/products/{self.product1.id}/deselect/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock, 5)  # Stock restored
        self.assertFalse(UserProduct.objects.filter(custom_user=self.user, product=self.product1).exists())

    def test_deselect_unselected_product(self):
        response = self.client.post(f"/api/products/{self.product1.id}/deselect/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Product was not selected", response.data["error"])

    def test_logout_and_deselect(self):
        self.client.post(f"/api/products/{self.product1.id}/select/")
        self.client.post(f"/api/products/{self.product2.id}/select/")

        refresh = RefreshToken.for_user(self.user)
        response = self.client.post("/api/logout/", {"refresh": str(refresh)})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock, 5)
        self.assertEqual(self.product2.stock, 2)
        self.assertFalse(UserProduct.objects.filter(custom_user=self.user).exists())

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=None)  # Remove authentication
        response = self.client.get("/api/products/?search=Test")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
