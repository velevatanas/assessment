from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import ProductSearchView, ProductSelectView, CustomTokenObtainPairView, LogoutAndDeselectView, ProductDeselectView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/products/', ProductSearchView.as_view(), name='product-search'),
    path('api/products/<int:pk>/select/', ProductSelectView.as_view(), name='product-select'),
    path('api/logout/', LogoutAndDeselectView.as_view(), name='logout_and_deselect'),
    path('api/products/<int:pk>/deselect/', ProductDeselectView.as_view(), name="product-deselect"),
]