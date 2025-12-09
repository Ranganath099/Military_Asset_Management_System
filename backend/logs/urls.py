from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionLogViewSet

router = DefaultRouter()
router.register(r'logs', TransactionLogViewSet, basename='transactionlog')

urlpatterns = [
    path('', include(router.urls)),
]
