from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MyTokenObtainPairView, NotificationViewSet, ReviewViewSet, TeacherProfileViewSet, RegisterView, BookingViewSet , AvailabilityViewSet

router = DefaultRouter()
router.register(r'teachers', TeacherProfileViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'availability', AvailabilityViewSet, basename='availability')
router.register(r'notifications', NotificationViewSet, basename='notification')





urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('', include(router.urls)),
]