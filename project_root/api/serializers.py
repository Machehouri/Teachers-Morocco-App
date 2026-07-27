from rest_framework import serializers
from .models import Availability, Booking, Notification, TeacherProfile, Subject, Review
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Avg
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
User = get_user_model()

# ----------------------
# Subject Serializer
# ----------------------
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


# ----------------------
# Review Serializer (MOVE UP 🔥)
# ----------------------
class ReviewSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'student', 'teacher', 'rating', 'comment']

    def validate(self, data):
        user = self.context['request'].user
        teacher = data['teacher']

        if Review.objects.filter(student=user, teacher=teacher).exists():
            raise serializers.ValidationError("You have already reviewed this teacher.")

        return data

class AvailabilitySerializer(serializers.ModelSerializer):

    is_booked = serializers.SerializerMethodField()

    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['teacher']

    def validate(self, data):

        teacher = self.context['request'].user.teacherprofile

        exists = Availability.objects.filter(
            teacher=teacher,
            day=data['day'],
            start_time=data['start_time'],
            end_time=data['end_time']
        ).exists()

        if exists:
            raise serializers.ValidationError(
                "Availability already exists."
            )

        return data
    def get_is_booked(self, obj):
        return Booking.objects.filter(
            teacher=obj.teacher,
            date=obj.day,
            time__gte=obj.start_time,
        ).exists()

# ----------------------
# Teacher Serializer
# ----------------------
class TeacherListSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField()

    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile

        fields = [
            'id',
            'user',
            'city',
            'price_per_hour',
            'image',
            'average_rating'
        ]

    def get_average_rating(self, obj):

        avg = obj.reviews.aggregate(
            Avg('rating')
        )['rating__avg']

        return round(avg, 1) if avg else 0
    
class TeacherDetailSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField()

    subjects = SubjectSerializer(
        many=True,
        read_only=True
    )

    reviews = ReviewSerializer(
        many=True,
        read_only=True
    )

    availabilities = AvailabilitySerializer(
        many=True,
        read_only=True
    )

    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile

        fields = '__all__'

    def get_average_rating(self, obj):

        avg = obj.reviews.aggregate(
            Avg('rating')
        )['rating__avg']

        return round(avg, 1) if avg else 0
    
class TeacherCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = TeacherProfile

        fields = [
            'bio',
            'city',
            'price_per_hour',
            'phone',
            'image',
            'subjects'
        ]


# ----------------------
# Register Serializer
# ----------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'access', 'refresh' ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        refresh = RefreshToken.for_user(user)

        return {
            'username': user.username,
            'email': user.email,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role
        }
    
class BookingSerializer(serializers.ModelSerializer):

    student = serializers.StringRelatedField(read_only=True)

    teacher_name = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking

        fields = [
            'id',
            'student',
            'teacher',
            'teacher_name',
            'student_name',
            'date',
            'time',
            'status'
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.user.username

    def get_student_name(self, obj):
        return obj.student.username
    
    def validate(self, data):

        teacher = data.get('teacher')

        date = data.get('date')
        time = data.get('time')

        # for PATCH update
        if self.instance:
            teacher = data.get('teacher', self.instance.teacher)
            date = data.get('date', self.instance.date)
            time = data.get('time', self.instance.time)

        exists = Booking.objects.filter(
            teacher=teacher,
            date=date,
            time=time
        ).exclude(
            id=self.instance.id if self.instance else None
        ).exists()

        if exists:
            raise serializers.ValidationError(
                "This slot is already booked."
            )

        return data
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        data['role'] = self.user.role
        data['username'] = self.user.username

        return data
    

class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = '__all__'