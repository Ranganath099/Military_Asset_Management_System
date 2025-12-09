from django.http import JsonResponse
from django.urls import resolve

from accounts.models import User

class RoleBasedAccessMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response
        self.route_roles = {
            'base-list': [User.ROLE_ADMIN],
            'base-detail': [User.ROLE_ADMIN],
            'equipmenttype-list': [User.ROLE_ADMIN],
            'equipmenttype-detail': [User.ROLE_ADMIN],
            'purchase-list': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
            'purchase-detail': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
            'transfer-list': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
            'transfer-detail': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
            'assignment-list': [User.ROLE_ADMIN, User.ROLE_COMMANDER],
            'assignment-detail': [User.ROLE_ADMIN, User.ROLE_COMMANDER],
            'expenditure-list': [User.ROLE_ADMIN, User.ROLE_COMMANDER],
            'expenditure-detail': [User.ROLE_ADMIN, User.ROLE_COMMANDER],
            'dashboard': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
            'transactionlog-list': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
            'transactionlog-detail': [User.ROLE_ADMIN, User.ROLE_COMMANDER, User.ROLE_LOGISTICS],
        }

    def __call__(self, request):
        try:
            resolver_match = resolve(request.path_info)
        except Exception:
            return self.get_response(request)

        view_name = resolver_match.view_name
        allowed_roles = self.route_roles.get(view_name)

        if not allowed_roles:
            return self.get_response(request)

        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'detail': 'Authentication required'}, status=401)

        if user.is_superuser or user.role in allowed_roles:
            return self.get_response(request)

        return JsonResponse({'detail': 'Forbidden: insufficient role'}, status=403)
