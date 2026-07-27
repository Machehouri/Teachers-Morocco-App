from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )


class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class TeacherProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    bio = models.TextField()
    city = models.CharField(max_length=100)
    price_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    phone = models.CharField(max_length=20)

    image = models.ImageField(
        upload_to='teachers/',
        blank=True,
        null=True
    )

    subjects = models.ManyToManyField(
        Subject,
        blank=True
    )

    def __str__(self):
        return self.user.username


class Review(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    rating = models.IntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"{self.student} -> {self.teacher}"
    

class Booking(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['teacher', 'date', 'time']),
        ]
    class Meta:
        indexes = [
            models.Index(fields=['teacher', 'date', 'time']),
        ]
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE)

    date = models.DateField()
    time = models.TimeField()

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )


class Availability(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['teacher', 'day']),
        ]
    class Meta:
        indexes = [
            models.Index(fields=['teacher', 'day']),
        ]

    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="availabilities"
    )

    day = models.DateField()

    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.teacher} - {self.day}"
    

class Notification(models.Model):

    TYPE_CHOICES = (
        ('booking', 'Booking'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('review', 'Review'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='booking'
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )