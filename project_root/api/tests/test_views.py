from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from unittest.mock import patch
from datetime import date, time
from decimal import Decimal

from api.models import Subject, TeacherProfile, Review, Booking, Availability, Notification

User = get_user_model()


class RegisterViewTest(APITestCase):
    def test_register_creates_user_and_returns_tokens(self):
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'secure123',
            'role': 'student',
        }
        response = self.client.post(reverse('register'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertEqual(response.data['role'], 'student')

    def test_register_invalid_data_returns_400(self):
        response = self.client.post(
            reverse('register'), {'username': ''}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TokenObtainPairViewTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123', role='student'
        )

    def test_valid_login_returns_tokens(self):
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': 'testpass123',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('role', response.data)

    def test_invalid_login_returns_401(self):
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': 'wrongpass',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TeacherProfileViewSetListTest(APITestCase):
    def setUp(self):
        self.teacher1_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.subject = Subject.objects.create(name='Math')
        self.profile1 = TeacherProfile.objects.create(
            user=self.teacher1_user, bio='Math expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )
        self.profile1.subjects.add(self.subject)

    def test_list_teachers_returns_200(self):
        response = self.client.get(reverse('teacherprofile-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_teachers_paginated(self):
        for i in range(3):
            u = User.objects.create_user(
                username=f'teacher{i+2}', password='pass', role='teacher'
            )
            TeacherProfile.objects.create(
                user=u, bio='Bio', city='Rabat',
                price_per_hour=Decimal('50'), phone='0600000000'
            )
        response = self.client.get(reverse('teacherprofile-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_by_city(self):
        response = self.client.get(
            reverse('teacherprofile-list'), {'search': 'Casablanca'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_search_by_subject(self):
        response = self.client.get(
            reverse('teacherprofile-list'), {'search': 'Math'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_filter_by_city(self):
        response = self.client.get(
            reverse('teacherprofile-list'), {'city': 'Casablanca'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class TeacherProfileViewSetRetrieveTest(APITestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )

    def test_retrieve_returns_detail(self):
        response = self.client.get(
            reverse('teacherprofile-detail', args=[self.profile.id])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user'], 'teacher1')


class TeacherProfileViewSetCreateTest(APITestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.student_user = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        self.data = {
            'bio': 'New teacher',
            'city': 'Rabat',
            'price_per_hour': '150.00',
            'phone': '0600000001',
        }

    def test_teacher_can_create_profile(self):
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.post(
            reverse('teacherprofile-list'), self.data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            TeacherProfile.objects.filter(user=self.teacher_user).exists()
        )

    def test_student_cannot_create_profile(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post(
            reverse('teacherprofile-list'), self.data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_profile(self):
        response = self.client.post(
            reverse('teacherprofile-list'), self.data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_profile_prevention(self):
        TeacherProfile.objects.create(
            user=self.teacher_user, bio='Existing', city='Fes',
            price_per_hour=Decimal('80'), phone='0600000000'
        )
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.post(
            reverse('teacherprofile-list'), self.data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TeacherProfileViewSetUpdateDeleteTest(APITestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.other_user = User.objects.create_user(
            username='other', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Original', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )

    def test_owner_can_update(self):
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.put(
            reverse('teacherprofile-detail', args=[self.profile.id]),
            {'bio': 'Updated', 'city': 'Rabat', 'price_per_hour': '120.00',
             'phone': '0600000002'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, 'Updated')

    def test_non_owner_cannot_update(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.put(
            reverse('teacherprofile-detail', args=[self.profile.id]),
            {'bio': 'Hacked', 'city': 'X', 'price_per_hour': '1', 'phone': '1'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_delete(self):
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.delete(
            reverse('teacherprofile-detail', args=[self.profile.id])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            TeacherProfile.objects.filter(id=self.profile.id).exists()
        )

    def test_non_owner_cannot_delete(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(
            reverse('teacherprofile-detail', args=[self.profile.id])
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TeacherProfileViewSetTopMeTest(APITestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )

    def test_top_returns_teachers(self):
        response = self.client.get(reverse('teacherprofile-top'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_me_returns_own_profile(self):
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.get(reverse('teacherprofile-me'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class BookingViewSetCreateTest(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )

    @patch('api.views.send_booking_email')
    def test_student_can_create_booking(self, mock_email):
        self.client.force_authenticate(user=self.student)
        data = {
            'teacher': self.profile.id,
            'date': '2025-02-01',
            'time': '10:00:00',
        }
        response = self.client.post(reverse('booking-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        mock_email.assert_called_once()

    def test_teacher_cannot_create_booking(self):
        self.client.force_authenticate(user=self.teacher_user)
        data = {
            'teacher': self.profile.id,
            'date': '2025-02-01',
            'time': '10:00:00',
        }
        response = self.client.post(reverse('booking-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_booking(self):
        data = {
            'teacher': self.profile.id,
            'date': '2025-02-01',
            'time': '10:00:00',
        }
        response = self.client.post(reverse('booking-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('api.views.send_booking_email')
    def test_duplicate_booking_prevention(self, mock_email):
        Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 2, 1), time=time(10, 0)
        )
        self.client.force_authenticate(user=self.student)
        data = {
            'teacher': self.profile.id,
            'date': '2025-02-01',
            'time': '10:00:00',
        }
        response = self.client.post(reverse('booking-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class BookingViewSetListTest(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )
        self.booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )

    def test_student_sees_own_bookings(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(reverse('booking-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_teacher_sees_own_bookings(self):
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.get(reverse('booking-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class BookingViewSetUpdateStatusTest(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )
        self.booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )

    def test_teacher_can_update_status(self):
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.patch(
            reverse('booking-detail', args=[self.booking.id]),
            {'status': 'confirmed'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, 'confirmed')

    def test_student_cannot_update_status(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.patch(
            reverse('booking-detail', args=[self.booking.id]),
            {'status': 'confirmed'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ReviewViewSetTest(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )

    def test_student_can_create_review(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse('review-list'), {
            'teacher': self.profile.id,
            'rating': 5,
            'comment': 'Great teacher!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

    def test_duplicate_review_prevention(self):
        Review.objects.create(
            student=self.student, teacher=self.profile, rating=4, comment='Good'
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(reverse('review-list'), {
            'teacher': self.profile.id,
            'rating': 5,
            'comment': 'Another review',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_reviews(self):
        Review.objects.create(
            student=self.student, teacher=self.profile, rating=5, comment='Great'
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.get(reverse('review-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class AvailabilityViewSetTest(APITestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher1', password='pass', role='teacher'
        )
        self.student = User.objects.create_user(
            username='student1', password='pass', role='student'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=Decimal('100'), phone='0600000000'
        )

    def test_teacher_can_create_availability(self):
        self.client.force_authenticate(user=self.teacher_user)
        data = {
            'day': '2025-01-15',
            'start_time': '09:00:00',
            'end_time': '12:00:00',
        }
        response = self.client.post(
            reverse('availability-list'), data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Availability.objects.count(), 1)

    def test_student_cannot_create_availability(self):
        self.client.force_authenticate(user=self.student)
        data = {
            'day': '2025-01-15',
            'start_time': '09:00:00',
            'end_time': '12:00:00',
        }
        response = self.client.post(
            reverse('availability-list'), data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_teacher_availability(self):
        Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.get(reverse('availability-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_duplicate_availability_prevention(self):
        Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        self.client.force_authenticate(user=self.teacher_user)
        data = {
            'day': '2025-01-15',
            'start_time': '09:00:00',
            'end_time': '12:00:00',
        }
        response = self.client.post(
            reverse('availability-list'), data, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class NotificationViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='user1', password='pass', role='student'
        )
        self.notification = Notification.objects.create(
            user=self.user, type='booking', message='New booking'
        )

    def test_list_notifications(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('notification-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_mark_as_read(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            reverse('notification-read', args=[self.notification.id])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)

    def test_unread_count(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('notification-unread-count'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_unread_count_after_marking_read(self):
        self.client.force_authenticate(user=self.user)
        self.notification.is_read = True
        self.notification.save()
        response = self.client.get(reverse('notification-unread-count'))
        self.assertEqual(response.data['count'], 0)
