from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    Subject,
    TeacherProfile,
    Review,
    Booking,
    Availability,
    Notification
)

admin.site.register(User, UserAdmin)

admin.site.register(Subject)
admin.site.register(TeacherProfile)
admin.site.register(Review)
admin.site.register(Booking)
admin.site.register(Availability)
admin.site.register(Notification)