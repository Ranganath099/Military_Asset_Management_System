from rest_framework.permissions import BasePermission
from accounts.models import User

class BaseScopedPermission(BasePermission):

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
        if user.is_superuser or user.role == User.ROLE_ADMIN:
            return True

        user_base = user.base
        if user_base is None:
            return False

        # For models with 'base'
        base_field = getattr(obj, 'base', None)
        if base_field is not None:
            return base_field == user_base

        # For Transfer: check involvement
        from_base = getattr(obj, 'from_base', None)
        to_base = getattr(obj, 'to_base', None)
        if from_base or to_base:
            return user_base in (from_base, to_base)

        return False
