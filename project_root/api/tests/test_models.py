from django.test import TestCase
from django.db import IntegrityError
from django.contrib.auth import get_user_model
from api.models import Subject, TeacherProfile, Review, Booking, Availability, Notification
from datetime import date, time

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_student_user(self):
        user = User.objects.create_user(username='student1', password='pass', role='student')
        self.assertEqual(user.role, 'student')

    def test_create_teacher_user(self):
        user = User.objects.create_user(username='teacher1', password='pass', role='teacher')
        self.assertEqual(user.role, 'teacher')

    def test_create_admin_user(self):
        user = User.objects.create_user(username='admin1', password='pass', role='admin')
        self.assertEqual(user.role, 'admin')

    def test_default_role(self):
        user = User.objects.create_user(username='default1', password='pass')
        self.assertEqual(user.role, 'student')

    def test_str(self):
        user = User.objects.create_user(username='testuser', password='pass')
        self.assertEqual(str(user), 'testuser')


class SubjectModelTest(TestCase):
    def test_create_subject(self):
        subject = Subject.objects.create(name='Mathematics')
        self.assertEqual(subject.name, 'Mathematics')

    def test_str(self):
        subject = Subject.objects.create(name='Physics')
        self.assertEqual(str(subject), 'Physics')


class TeacherProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teacher1', password='pass', role='teacher')
        self.subject = Subject.objects.create(name='Math')

    def _create_profile(self, user=None):
        u = user or self.user
        return TeacherProfile.objects.create(
            user=u, bio='Expert', city='Casablanca',
            price_per_hour=100, phone='0600000000'
        )

    def test_create_profile(self):
        profile = self._create_profile()
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.bio, 'Expert')
        self.assertEqual(profile.city, 'Casablanca')
        self.assertEqual(profile.price_per_hour, 100)
        self.assertEqual(profile.phone, '0600000000')

    def test_str(self):
        profile = self._create_profile()
        self.assertEqual(str(profile), 'teacher1')

    def test_one_to_one_constraint(self):
        self._create_profile()
        with self.assertRaises(IntegrityError):
            self._create_profile()

    def test_many_to_many_subjects(self):
        profile = self._create_profile()
        profile.subjects.add(self.subject)
        self.assertIn(self.subject, profile.subjects.all())

    def test_relation_to_user(self):
        profile = self._create_profile()
        self.assertEqual(profile.user, self.user)
        self.assertEqual(self.user.teacherprofile, profile)


class ReviewModelTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='student1', password='pass', role='student')
        teacher_user = User.objects.create_user(username='teacher1', password='pass', role='teacher')
        self.profile = TeacherProfile.objects.create(
            user=teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=100, phone='0600000000'
        )

    def test_create_review(self):
        review = Review.objects.create(
            student=self.student, teacher=self.profile,
            rating=5, comment='Great!'
        )
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.student, self.student)
        self.assertEqual(review.teacher, self.profile)
        self.assertEqual(review.comment, 'Great!')

    def test_str(self):
        review = Review.objects.create(
            student=self.student, teacher=self.profile,
            rating=4, comment='Good'
        )
        self.assertEqual(str(review), 'student1 -> teacher1')

    def test_relation_to_student(self):
        review = Review.objects.create(
            student=self.student, teacher=self.profile,
            rating=3, comment='OK'
        )
        self.assertEqual(review.student, self.student)

    def test_relation_to_teacher_profile(self):
        review = Review.objects.create(
            student=self.student, teacher=self.profile,
            rating=5, comment='Excellent'
        )
        self.assertEqual(review.teacher, self.profile)


class BookingModelTest(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='student1', password='pass', role='student')
        teacher_user = User.objects.create_user(username='teacher1', password='pass', role='teacher')
        self.profile = TeacherProfile.objects.create(
            user=teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=100, phone='0600000000'
        )

    def test_create_booking(self):
        booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        self.assertEqual(booking.student, self.student)
        self.assertEqual(booking.teacher, self.profile)
        self.assertEqual(booking.date, date(2025, 1, 15))
        self.assertEqual(booking.time, time(10, 0))

    def test_default_status(self):
        booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        self.assertEqual(booking.status, 'pending')

    def test_status_choices(self):
        for status_value in ['pending', 'confirmed', 'cancelled']:
            booking = Booking.objects.create(
                student=self.student, teacher=self.profile,
                date=date(2025, 1, 15), time=time(10, 0),
                status=status_value
            )
            self.assertEqual(booking.status, status_value)

    def test_relation_to_student(self):
        booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        self.assertEqual(booking.student, self.student)

    def test_relation_to_teacher(self):
        booking = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        self.assertEqual(booking.teacher, self.profile)

    def test_no_model_level_conflict_detection(self):
        Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        booking2 = Booking.objects.create(
            student=self.student, teacher=self.profile,
            date=date(2025, 1, 15), time=time(10, 0)
        )
        self.assertIsNotNone(booking2.pk)


class AvailabilityModelTest(TestCase):
    def setUp(self):
        teacher_user = User.objects.create_user(username='teacher1', password='pass', role='teacher')
        self.profile = TeacherProfile.objects.create(
            user=teacher_user, bio='Expert', city='Casablanca',
            price_per_hour=100, phone='0600000000'
        )

    def test_create_availability(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        self.assertEqual(slot.teacher, self.profile)
        self.assertEqual(slot.day, date(2025, 1, 15))
        self.assertEqual(slot.start_time, time(9, 0))
        self.assertEqual(slot.end_time, time(12, 0))

    def test_str(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        self.assertEqual(str(slot), 'teacher1 - 2025-01-15')

    def test_related_name(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(12, 0)
        )
        self.assertIn(slot, self.profile.availabilities.all())

    def test_time_range(self):
        slot = Availability.objects.create(
            teacher=self.profile, day=date(2025, 1, 15),
            start_time=time(9, 0), end_time=time(17, 0)
        )
        self.assertLess(slot.start_time, slot.end_time)


class NotificationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='user1', password='pass')

    def test_create_notification(self):
        notif = Notification.objects.create(
            user=self.user, type='booking', message='You have a new booking'
        )
        self.assertEqual(notif.user, self.user)
        self.assertEqual(notif.type, 'booking')
        self.assertEqual(notif.message, 'You have a new booking')
        self.assertIsNotNone(notif.created_at)

    def test_default_is_read(self):
        notif = Notification.objects.create(user=self.user, message='Test')
        self.assertFalse(notif.is_read)

    def test_default_type(self):
        notif = Notification.objects.create(user=self.user, message='Test')
        self.assertEqual(notif.type, 'booking')

    def test_type_choices(self):
        for t in ['booking', 'accepted', 'rejected', 'review']:
            notif = Notification.objects.create(
                user=self.user, type=t, message=f'Test {t}'
            )
            self.assertEqual(notif.type, t)

    def test_is_read_flag(self):
        notif = Notification.objects.create(user=self.user, message='Unread')
        self.assertFalse(notif.is_read)
        notif.is_read = True
        notif.save()
        self.assertTrue(notif.is_read)
