from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import User

def _has_role(user, roles):
    return (
        user and user.is_authenticated
        and (user.is_superuser or user.role in roles)
    )

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, [User.ROLE_ADMIN])

class IsAdminOrCommander(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request.user, [User.ROLE_ADMIN, User.ROLE_COMMANDER])

class IsAdminCommanderOrLogistics(BasePermission):
    def has_permission(self, request, view):
        return _has_role(
            request.user,
            [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
        )

class IsAdminOrReadOnly(BasePermission):
    
    def has_permission(self, request, view):
        user = request.user
        if request.method in SAFE_METHODS:
            return bool(user and user.is_authenticated)
        return _has_role(user, [User.ROLE_ADMIN])
