from django.test import TestCase
from django.http import HttpRequest
from django.contrib.auth.models import AnonymousUser
from rest_framework.request import Request
from django.contrib.auth import get_user_model
from unittest.mock import Mock
from api.permissions import IsTeacher, IsStudent, IsOwnerTeacherProfile, IsBookingTeacher
from api.models import TeacherProfile, Booking
from datetime import date, time
from decimal import Decimal

User = get_user_model()


class IsTeacherPermissionTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student', password='pass', role='student'
        )
        self.teacher = User.objects.create_user(
            username='teacher', password='pass', role='teacher'
        )
        self.permission = IsTeacher()

    def _request(self, user):
        req = Mock(spec=Request)
        req.user = user
        req.META = {}
        req.authenticators = ()
        return req

    def test_teacher_user_passes(self):
        result = self.permission.has_permission(self._request(self.teacher), None)
        self.assertTrue(result)

    def test_student_user_denied(self):
        result = self.permission.has_permission(self._request(self.student), None)
        self.assertFalse(result)

    def test_unauthenticated_user_denied(self):
        result = self.permission.has_permission(self._request(AnonymousUser()), None)
        self.assertFalse(result)


class IsStudentPermissionTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student', password='pass', role='student'
        )
        self.teacher = User.objects.create_user(
            username='teacher', password='pass', role='teacher'
        )
        self.permission = IsStudent()

    def _request(self, user):
        req = Mock(spec=Request)
        req.user = user
        req.META = {}
        req.authenticators = ()
        return req

    def test_student_user_passes(self):
        result = self.permission.has_permission(self._request(self.student), None)
        self.assertTrue(result)

    def test_teacher_user_denied(self):
        result = self.permission.has_permission(self._request(self.teacher), None)
        self.assertFalse(result)

    def test_unauthenticated_user_denied(self):
        result = self.permission.has_permission(self._request(AnonymousUser()), None)
        self.assertFalse(result)


class IsOwnerTeacherProfileTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner', password='pass', role='teacher'
        )
        self.other = User.objects.create_user(
            username='other', password='pass', role='teacher'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.owner, bio='Test', city='City',
            price_per_hour=Decimal('50'), phone='0600000000'
        )
        self.permission = IsOwnerTeacherProfile()

    def _request(self, user):
        req = Mock(spec=Request)
        req.user = user
        req.META = {}
        req.authenticators = ()
        return req

    def test_owner_passes(self):
        result = self.permission.has_object_permission(
            self._request(self.owner), None, self.profile
        )
        self.assertTrue(result)

    def test_non_owner_denied(self):
        result = self.permission.has_object_permission(
            self._request(self.other), None, self.profile
        )
        self.assertFalse(result)


class IsBookingTeacherTest(TestCase):
    def setUp(self):
        self.teacher_user = User.objects.create_user(
            username='teacher', password='pass', role='teacher'
        )
        self.other_teacher = User.objects.create_user(
            username='other', password='pass', role='teacher'
        )
        self.student = User.objects.create_user(
            username='student', password='pass', role='student'
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user, bio='Test', city='City',
            price_per_hour=Decimal('50'), phone='0600000000'
        )
        self.booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        self.permission = IsBookingTeacher()

    def _request(self, user):
        req = Mock(spec=Request)
        req.user = user
        req.META = {}
        req.authenticators = ()
        return req

    def test_booking_teacher_passes(self):
        result = self.permission.has_object_permission(
            self._request(self.teacher_user), None, self.booking
        )
        self.assertTrue(result)

    def test_other_teacher_denied(self):
        result = self.permission.has_object_permission(
            self._request(self.other_teacher), None, self.booking
        )
        self.assertFalse(result)

    def test_student_denied(self):
        result = self.permission.has_object_permission(
            self._request(self.student), None, self.booking
        )
        self.assertFalse(result)
