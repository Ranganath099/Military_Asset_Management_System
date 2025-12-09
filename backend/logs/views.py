from datetime import datetime
from django.db.models import Q
from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from .models import TransactionLog
from .serializers import TransactionLogSerializer


class TransactionLogViewSet(viewsets.ReadOnlyModelViewSet):
   
    queryset = TransactionLog.objects.all().order_by('-timestamp')
    serializer_class = TransactionLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.is_superuser or user.role == User.ROLE_ADMIN:
            pass
        else:
            if not user.base:
                return TransactionLog.objects.none()

            base_id = user.base.id
            qs = qs.filter(
                Q(details__base=base_id) |
                Q(details__from_base=base_id) |
                Q(details__to_base=base_id)
            )

        action_type = self.request.query_params.get('action_type')
        if action_type:
            qs = qs.filter(action_type=action_type)

        start_date_str = self.request.query_params.get('start_date')
        end_date_str = self.request.query_params.get('end_date')
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None

        if start_date:
            qs = qs.filter(timestamp__date__gte=start_date)
        if end_date:
            qs = qs.filter(timestamp__date__lte=end_date)

        base_id_param = self.request.query_params.get('base_id')
        if base_id_param:
            qs = qs.filter(
                Q(details__base=int(base_id_param)) |
                Q(details__from_base=int(base_id_param)) |
                Q(details__to_base=int(base_id_param))
            )

        return qs
