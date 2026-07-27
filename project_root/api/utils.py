from .models import Notification
import resend
from django.conf import settings

resend.api_key = settings.RESEND_API_KEY

def create_notification(
    *,
    user,
    type,
    message
):

    return Notification.objects.create(
        user=user,
        type=type,
        message=message
    )


def send_booking_email(
    *,
    to_email,
    student_name,
    teacher_name
):

    resend.Emails.send({

        "from": "TeachMe <onboarding@resend.dev>",

        "to": ["machehouri12@gmail.com"],

        "subject": "New Booking",

        "html": f"""
        <h2>New Booking</h2>

        <p>
        {student_name} booked a lesson with {teacher_name}
        </p>
        """
    })