from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated , IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from .permissions import IsOwnerOrReadOnly, IsTeacher, IsStudent, IsBookingTeacher, IsOwnerTeacherProfile
from .models import Availability, Notification, TeacherProfile, Review, Booking
from .serializers import AvailabilitySerializer, MyTokenObtainPairSerializer, NotificationSerializer, TeacherCreateSerializer, TeacherDetailSerializer, TeacherListSerializer
from rest_framework import generics
from .serializers import RegisterSerializer, ReviewSerializer, BookingSerializer, MyTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status, serializers
from django.db.models import Avg
from rest_framework.decorators import action
from rest_framework.response import Response
from .pagination import TeacherPagination
from rest_framework.filters import SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction
from .utils import create_notification, send_booking_email

User = get_user_model()

# Create your views here.



class TeacherProfileViewSet(viewsets.ModelViewSet):
    queryset = TeacherProfile.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = TeacherPagination
    filter_backends = [SearchFilter]
    search_fields = ['city', 'subjects__name']
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):

        if self.action == 'list':
            return TeacherListSerializer

        elif self.action == 'retrieve':
            return TeacherDetailSerializer

        return TeacherCreateSerializer

    def get_queryset(self):
        queryset = TeacherProfile.objects.all().prefetch_related('subjects').order_by('-id')

        city = self.request.query_params.get('city')
        subject = self.request.query_params.get('subject')
        if city:
            queryset = queryset.filter(city__iexact=city)
        if subject:
            queryset = queryset.filter(subjects__name__iexact=subject)

        return queryset
    
    def perform_create(self, serializer):
        if TeacherProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError("You already have a teacher profile.")
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            raise serializers.ValidationError("You can only update your own profile.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise serializers.ValidationError("You can only delete your own profile.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def top(self, request):
        teachers = TeacherProfile.objects.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating')

        serializer = self.get_serializer(teachers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
            profile = TeacherProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
    
    def get_permissions(self):
        if self.action in [
            'create'
        ]:
            permission_classes = [IsTeacher]

        elif self.action in [
            'update',
            'partial_update',
            'destroy'
        ]:
            permission_classes = [
                IsAuthenticated,
                IsOwnerTeacherProfile
            ]
        else:
            permission_classes = [AllowAny]
        
        return [
            permission()
            for permission in permission_classes
        ]

    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_data = serializer.save()
        return Response(user_data, status=status.HTTP_201_CREATED)
    

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)



class BookingViewSet(viewsets.ModelViewSet):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # STUDENT BOOKINGS
        if user.role == "student":

            return Booking.objects.filter(
                student=user
            ).order_by("-id")

        # TEACHER BOOKINGS
        elif user.role == "teacher":

            return Booking.objects.filter(
                teacher__user=user
            ).order_by("-id")

        return Booking.objects.none()

    def perform_create(self, serializer):

        with transaction.atomic():

            teacher = serializer.validated_data['teacher']
            date = serializer.validated_data['date']
            time = serializer.validated_data['time']

            existing_booking = Booking.objects.select_for_update().filter(
                teacher=teacher,
                date=date,
                time=time
            ).exists()

            if existing_booking:
                raise serializer.ValidationError(
                    "this slot has already been booked."
                )
            booking = serializer.save(
                student=self.request.user
            )
            Notification.objects.create(
                user=booking.teacher.user,
                message=f"{self.request.user.username} booked a lesson"
            )
            send_booking_email(
                to_email=booking.teacher.user.email,
                student_name=self.request.user.username,
                teacher_name=booking.teacher.user.username
            )

    def partial_update(self, request, *args, **kwargs):

        booking = self.get_object()

        status = request.data.get("status")

        booking.status = status

        Notification.objects.create(
            user=booking.student,
            message=f"Your booking was {status}"
        )

        booking.save()

        serializer = self.get_serializer(booking)

        return Response(serializer.data)
    
    def get_permissions(self):

        if self.action == 'create':

            permission_classes = [IsStudent]

        elif self.action in [
            'partial_update',
            'update'
        ]:

            permission_classes = [
                IsAuthenticated,
                IsBookingTeacher
            ]

        else:

            permission_classes = [IsAuthenticated]

        return [
            permission()
            for permission in permission_classes
        ]
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class AvailabilityViewSet(viewsets.ModelViewSet):

    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated, IsTeacher]
    pagination_class = None

    def get_queryset(self):
        return Availability.objects.filter(
            teacher__user=self.request.user
        ).order_by("day", "start_time")

    def perform_create(self, serializer):

        serializer.save(
            teacher=self.request.user.teacherprofile
        )

        


class NotificationViewSet(viewsets.ModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Notification.objects.filter(
            user=self.request.user
        ).order_by("-created_at")[:30]
    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):

        notification = self.get_object()

        notification.is_read = True
        notification.save()
    @action(detail=False, methods=['get'])
    def unread_count(self, request):

        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response({
            "count": count
        })

        return Response({"message": "Notification marked as read"})
    