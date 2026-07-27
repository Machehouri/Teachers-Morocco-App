from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD, OPTIONS
        if request.method in SAFE_METHODS:
            return True

        # Only owner can edit/delete
        return obj.user == request.user

class IsOwnerTeacherProfile(BasePermission):

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        return obj.user == request.user

class IsTeacher(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role == "teacher"
        )


class IsStudent(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role == "student"
        )


class IsBookingTeacher(BasePermission):

    def has_object_permission(
        self,
        request,
        view,
        obj
    ):

        return obj.teacher.user == request.user