from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import Mock
from datetime import date, time
from decimal import Decimal

from api.models import Subject, TeacherProfile, Review, Booking, Availability, Notification
from api.serializers import (
    RegisterSerializer,
    SubjectSerializer,
    TeacherListSerializer,
    TeacherDetailSerializer,
    TeacherCreateSerializer,
    ReviewSerializer,
    BookingSerializer,
    AvailabilitySerializer,
    NotificationSerializer,
)

User = get_user_model()


class RegisterSerializerTest(TestCase):
    def test_valid_registration_returns_tokens(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'securepass123',
            'role': 'student',
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        result = serializer.save()
        self.assertIn('access', result)
        self.assertIn('refresh', result)
        self.assertEqual(result['username'], 'newuser')
        self.assertEqual(result['email'], 'new@example.com')
        self.assertEqual(result['role'], 'student')
        self.assertNotIn('password', result)

    def test_invalid_data_raises_errors(self):
        serializer = RegisterSerializer(data={})
        self.assertFalse(serializer.is_valid())

    def test_missing_required_fields(self):
        serializer = RegisterSerializer(data={'username': ''})
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
        self.assertIn('password', serializer.errors)


class SubjectSerializerTest(TestCase):
    def test_serialization(self):
        subject = Subject.objects.create(name='Mathematics')
        serializer = SubjectSerializer(subject)
        self.assertEqual(serializer.data['id'], subject.id)
        self.assertEqual(serializer.data['name'], 'Mathematics')

    def test_deserialization(self):
        serializer = SubjectSerializer(data={'name': 'Physics'})
        self.assertTrue(serializer.is_valid())
        subject = serializer.save()
        self.assertEqual(subject.name, 'Physics')


class TeacherListSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100.00'), phone='0600000000'
        )

    def test_fields_match_expected_output(self):
        serializer = TeacherListSerializer(self.profile)
        expected = {'id', 'user', 'city', 'price_per_hour', 'image', 'average_rating'}
        self.assertEqual(set(serializer.data.keys()), expected)

    def test_user_is_string_related(self):
        serializer = TeacherListSerializer(self.profile)
        self.assertEqual(serializer.data['user'], 'teacher1')

    def test_average_rating_with_no_reviews(self):
        serializer = TeacherListSerializer(self.profile)
        self.assertEqual(serializer.data['average_rating'], 0)

    def test_average_rating_with_reviews(self):
        student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        Review.objects.create(
            student=student, teacher=self.profile, rating=4, comment='Good'
        )
        Review.objects.create(
            student=student, teacher=self.profile, rating=5, comment='Great'
        )
        serializer = TeacherListSerializer(self.profile)
        self.assertEqual(serializer.data['average_rating'], 4.5)


class TeacherDetailSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.subject = Subject.objects.create(name='Math')
        self.profile = TeacherProfile.objects.create(
            user=self.user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100.00'), phone='0600000000'
        )
        self.profile.subjects.add(self.subject)
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )

    def test_nested_subjects(self):
        serializer = TeacherDetailSerializer(self.profile)
        self.assertIn('subjects', serializer.data)
        self.assertEqual(len(serializer.data['subjects']), 1)
        self.assertEqual(serializer.data['subjects'][0]['name'], 'Math')

    def test_nested_reviews(self):
        Review.objects.create(
            student=self.student, teacher=self.profile, rating=5, comment='Great'
        )
        serializer = TeacherDetailSerializer(self.profile)
        self.assertIn('reviews', serializer.data)
        self.assertEqual(len(serializer.data['reviews']), 1)
        self.assertEqual(serializer.data['reviews'][0]['rating'], 5)

    def test_nested_availabilities(self):
        Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        serializer = TeacherDetailSerializer(self.profile)
        self.assertIn('availabilities', serializer.data)
        self.assertEqual(len(serializer.data['availabilities']), 1)

    def test_average_rating(self):
        Review.objects.create(
            student=self.student, teacher=self.profile, rating=4, comment='Good'
        )
        serializer = TeacherDetailSerializer(self.profile)
        self.assertEqual(serializer.data['average_rating'], 4.0)

    def test_user_field(self):
        serializer = TeacherDetailSerializer(self.profile)
        self.assertEqual(serializer.data['user'], 'teacher1')


class TeacherCreateSerializerTest(TestCase):
    def test_required_fields_validation(self):
        serializer = TeacherCreateSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('bio', serializer.errors)
        self.assertIn('city', serializer.errors)
        self.assertIn('price_per_hour', serializer.errors)
        self.assertIn('phone', serializer.errors)

    def test_valid_data(self):
        data = {
            'bio': 'Expert teacher',
            'city': 'Rabat',
            'price_per_hour': '150.00',
            'phone': '0600000001',
        }
        serializer = TeacherCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_valid_data_with_subjects(self):
        subject = Subject.objects.create(name='Physics')
        data = {
            'bio': 'Physics teacher',
            'city': 'Fes',
            'price_per_hour': '120.00',
            'phone': '0600000002',
            'subjects': [subject.id],
        }
        serializer = TeacherCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())


class ReviewSerializerTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100.00'), phone='0600000000'
        )

    def _serializer(self, data, user=None):
        request = Mock()
        request.user = user or self.student
        return ReviewSerializer(data=data, context={'request': request})

    def test_fields_present(self):
        review = Review.objects.create(
            student=self.student, teacher=self.profile, rating=4, comment='Good'
        )
        serializer = ReviewSerializer(review)
        expected = {'id', 'student', 'teacher', 'rating', 'comment'}
        self.assertEqual(set(serializer.data.keys()), expected)

    def test_student_is_string_related(self):
        serializer = ReviewSerializer(
            Review.objects.create(
                student=self.student, teacher=self.profile, rating=5, comment='Great'
            )
        )
        self.assertEqual(serializer.data['student'], 'student1')

    def test_duplicate_review_check(self):
        Review.objects.create(
            student=self.student, teacher=self.profile, rating=4, comment='First'
        )
        data = {'teacher': self.profile.id, 'rating': 5, 'comment': 'Second'}
        serializer = self._serializer(data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_unique_review_allowed(self):
        data = {'teacher': self.profile.id, 'rating': 5, 'comment': 'Great'}
        serializer = self._serializer(data)
        self.assertTrue(serializer.is_valid())

    def test_different_teacher_allows_duplicate_student(self):
        other_teacher = User.objects.create_user(
            username='teacher2', password='pass', role='teacher'
        )
        other_profile = TeacherProfile.objects.create(
            user=other_teacher, bio='Second', city='Rabat',
            price_per_hour=Decimal('80.00'), phone='0600000001'
        )
        Review.objects.create(
            student=self.student, teacher=self.profile, rating=4, comment='First'
        )
        data = {'teacher': other_profile.id, 'rating': 5, 'comment': 'Second teacher'}
        serializer = self._serializer(data)
        self.assertTrue(serializer.is_valid())


class BookingSerializerTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100.00'), phone='0600000000'
        )

    def _create_booking(self, **kwargs):
        defaults = {
            'student': self.student,
            'teacher': self.profile,
            'date': date(2025, 1, 15),
            'time': time(10, 0),
        }
        defaults.update(kwargs)
        return Booking.objects.create(**defaults)

    def test_teacher_name_field(self):
        booking = self._create_booking()
        serializer = BookingSerializer(booking)
        self.assertEqual(serializer.data['teacher_name'], 'teacher1')

    def test_student_name_field(self):
        booking = self._create_booking()
        serializer = BookingSerializer(booking)
        self.assertEqual(serializer.data['student_name'], 'student1')

    def test_fields_present(self):
        booking = self._create_booking()
        serializer = BookingSerializer(booking)
        expected = {'id', 'student', 'teacher', 'teacher_name',
                    'student_name', 'date', 'time', 'status'}
        self.assertEqual(set(serializer.data.keys()), expected)

    def test_duplicate_booking_validation_on_create(self):
        self._create_booking()
        data = {
            'teacher': self.profile.id,
            'date': date(2025, 1, 15),
            'time': time(10, 0),
        }
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_unique_booking_allowed_different_time(self):
        self._create_booking()
        data = {
            'teacher': self.profile.id,
            'date': date(2025, 1, 15),
            'time': time(14, 0),
        }
        serializer = BookingSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_unique_booking_allowed_different_date(self):
        self._create_booking()
        data = {
            'teacher': self.profile.id,
            'date': date(2025, 1, 16),
            'time': time(10, 0),
        }
        serializer = BookingSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_update_excludes_self_from_conflict(self):
        booking = self._create_booking()
        serializer = BookingSerializer(
            instance=booking, data={}, partial=True
        )
        self.assertTrue(serializer.is_valid())


class AvailabilitySerializerTest(TestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100.00'), phone='0600000000'
        )
        self.request = Mock()
        self.request.user = self.teacher_user

    def _serializer(self, data):
        return AvailabilitySerializer(data=data, context={'request': self.request})

    def test_duplicate_availability_check(self):
        Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        data = {
            'day': date(2025, 1, 15),
            'start_time': time(9, 0),
            'end_time': time(12, 0),
        }
        serializer = self._serializer(data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

    def test_unique_availability_allowed(self):
        data = {
            'day': date(2025, 1, 15),
            'start_time': time(9, 0),
            'end_time': time(12, 0),
        }
        serializer = self._serializer(data)
        self.assertTrue(serializer.is_valid())

    def test_is_booked_field(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        serializer = AvailabilitySerializer(slot)
        self.assertIn('is_booked', serializer.data)

    def test_is_booked_false_when_no_booking(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        serializer = AvailabilitySerializer(slot)
        self.assertFalse(serializer.data['is_booked'])

    def test_is_booked_true_when_booking_exists(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        Booking.objects.create(
            student=User.objects.create_user(
                username='student1', password='pass', role='student'
            ),
            teacher=self.profile,
            date=date(2025, 1, 15),
            time=time(10, 0),
        )
        serializer = AvailabilitySerializer(slot)
        self.assertTrue(serializer.data['is_booked'])


class NotificationSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user1', password='pass')

    def test_all_fields_present(self):
        notif = Notification.objects.create(
            user=self.user, type='booking', message='New booking'
        )
        serializer = NotificationSerializer(notif)
        expected = {'id', 'user', 'type', 'message', 'is_read', 'created_at'}
        self.assertEqual(set(serializer.data.keys()), expected)

    def test_field_values(self):
        notif = Notification.objects.create(
            user=self.user, type='review', message='You got a review!', is_read=False
        )
        serializer = NotificationSerializer(notif)
        self.assertEqual(serializer.data['type'], 'review')
        self.assertEqual(serializer.data['message'], 'You got a review!')
        self.assertFalse(serializer.data['is_read'])
