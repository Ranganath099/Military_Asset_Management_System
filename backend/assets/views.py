from datetime import datetime
from django.db.models import Sum
from django.utils.dateparse import parse_date
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from accounts.permissions import (
    IsAdmin,
    IsAdminOrCommander,
    IsAdminCommanderOrLogistics,
    IsAdminOrReadOnly
)
from .models import Base, EquipmentType, Purchase, Transfer, Assignment, Expenditure
from .serializers import (
    BaseSerializer, EquipmentTypeSerializer,
    PurchaseSerializer, TransferSerializer,
    AssignmentSerializer, ExpenditureSerializer
)
from .permissions import BaseScopedPermission
from rest_framework_simplejwt.authentication import JWTAuthentication

class BaseViewSet(viewsets.ModelViewSet):
    queryset = Base.objects.all()
    serializer_class = BaseSerializer
    authentication_classes = [JWTAuthentication] 
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        print("DEBUG /api/bases/ user:", request.user)
        print("DEBUG /api/bases/ headers:", request.headers)
        return super().list(request, *args, **kwargs)


class EquipmentTypeViewSet(viewsets.ModelViewSet):
    queryset = EquipmentType.objects.all()
    serializer_class = EquipmentTypeSerializer
    authentication_classes = [JWTAuthentication] 
    permission_classes = [IsAdminOrReadOnly]


class PurchaseViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated, IsAdminCommanderOrLogistics, BaseScopedPermission]

    def get_queryset(self):
        user = self.request.user
        qs = Purchase.objects.select_related('base', 'equipment_type')

        if user.is_superuser or user.role == User.ROLE_ADMIN:
            pass
        elif user.base:
            qs = qs.filter(base=user.base)
        else:
            return Purchase.objects.none()

        params = self.request.query_params
        base_id = params.get('base_id')
        eq_id = params.get('equipment_type_id')
        start = params.get('start_date')
        end = params.get('end_date')

        if base_id:
            qs = qs.filter(base_id=base_id)
        if eq_id:
            qs = qs.filter(equipment_type_id=eq_id)
        if start:
            qs = qs.filter(purchased_at__date__gte=start)
        if end:
            qs = qs.filter(purchased_at__date__lte=end)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        base = serializer.validated_data['base']
        if not (user.is_superuser or user.role == User.ROLE_ADMIN):
            if user.base is None or user.base != base:
                raise PermissionError("You can only create purchases for your own base.")
        serializer.save(created_by=user)



class TransferViewSet(viewsets.ModelViewSet):
    serializer_class = TransferSerializer
    permission_classes = [IsAuthenticated, IsAdminCommanderOrLogistics, BaseScopedPermission]

    def get_queryset(self):
        user = self.request.user
        qs = Transfer.objects.select_related('from_base', 'to_base', 'equipment_type')

        if user.is_superuser or user.role == User.ROLE_ADMIN:
            pass
        elif user.base:
            qs = qs.filter(from_base=user.base) | qs.filter(to_base=user.base)
        else:
            return Transfer.objects.none()


        params = self.request.query_params
        base_id = params.get('base_id')          
        eq_id = params.get('equipment_type_id')
        start = params.get('start_date')
        end = params.get('end_date')

        if base_id:
            qs = qs.filter(from_base_id=base_id) | qs.filter(to_base_id=base_id)
        if eq_id:
            qs = qs.filter(equipment_type_id=eq_id)
        if start:
            qs = qs.filter(transfer_at__date__gte=start)
        if end:
            qs = qs.filter(transfer_at__date__lte=end)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        from_base = serializer.validated_data['from_base']
        to_base = serializer.validated_data['to_base']

        if not (user.is_superuser or user.role == User.ROLE_ADMIN):
            if user.base is None or user.base != from_base:
                raise PermissionError("You can only transfer assets out from your own base.")
        if from_base == to_base:
            raise ValueError("From and To base cannot be the same.")

        serializer.save(created_by=user)



class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrCommander, BaseScopedPermission]

    def get_queryset(self):
        user = self.request.user
        qs = Assignment.objects.select_related('base', 'equipment_type')

        if user.is_superuser or user.role == User.ROLE_ADMIN:
            pass
        elif user.base:
            qs = qs.filter(base=user.base)
        else:
            return Assignment.objects.none()

        params = self.request.query_params
        base_id = params.get('base_id')
        eq_id = params.get('equipment_type_id')
        start = params.get('start_date')
        end = params.get('end_date')

        if base_id:
            qs = qs.filter(base_id=base_id)
        if eq_id:
            qs = qs.filter(equipment_type_id=eq_id)
        if start:
            qs = qs.filter(assigned_at__date__gte=start)
        if end:
            qs = qs.filter(assigned_at__date__lte=end)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        base = serializer.validated_data['base']
        if not (user.is_superuser or user.role == User.ROLE_ADMIN):
            if user.base is None or user.base != base:
                raise PermissionError("You can only assign assets from your own base.")
        serializer.save(created_by=user)



class ExpenditureViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenditureSerializer
    permission_classes = [IsAuthenticated, IsAdminOrCommander, BaseScopedPermission]

    def get_queryset(self):
        user = self.request.user
        qs = Expenditure.objects.select_related('base', 'equipment_type')

        if user.is_superuser or user.role == User.ROLE_ADMIN:
            pass
        elif user.base:
            qs = qs.filter(base=user.base)
        else:
            return Expenditure.objects.none()

        params = self.request.query_params
        base_id = params.get('base_id')
        eq_id = params.get('equipment_type_id')
        start = params.get('start_date')
        end = params.get('end_date')

        if base_id:
            qs = qs.filter(base_id=base_id)
        if eq_id:
            qs = qs.filter(equipment_type_id=eq_id)
        if start:
            qs = qs.filter(expended_at__date__gte=start)
        if end:
            qs = qs.filter(expended_at__date__lte=end)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        base = serializer.validated_data['base']
        if not (user.is_superuser or user.role == User.ROLE_ADMIN):
            if user.base is None or user.base != base:
                raise PermissionError("You can only record expenditures for your own base.")
        serializer.save(created_by=user)



class DashboardView(APIView):
   
    permission_classes = [IsAuthenticated, IsAdminCommanderOrLogistics]

    def get(self, request, format=None):
        user = request.user

        base_id = request.query_params.get('base_id')
        eq_id = request.query_params.get('equipment_type_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        today = datetime.utcnow().date()
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else today

        base_qs = Base.objects.all()
        if base_id:
            base_qs = base_qs.filter(id=base_id)
        elif not (user.is_superuser or user.role == User.ROLE_ADMIN):
            if user.base:
                base_qs = base_qs.filter(id=user.base.id)
            else:
                return Response({"detail": "No base assigned to user."}, status=400)

        equipment_qs = EquipmentType.objects.all()
        if eq_id:
            equipment_qs = equipment_qs.filter(id=eq_id)

        base = base_qs.first()
        equipment = equipment_qs.first()

        if not base or not equipment:
            return Response(
                {"detail": "Base or EquipmentType not found/ambiguous."},
                status=400,
            )
        
        def date_filter(qs, field_name, start=None, end=None):
            if start:
                qs = qs.filter(**{f"{field_name}__date__gte": start})
            if end:
                qs = qs.filter(**{f"{field_name}__date__lte": end})
            return qs

        if start_date:
            purchases_before = Purchase.objects.filter(
                base=base,
                equipment_type=equipment,
                purchased_at__date__lt=start_date,
            ).aggregate(total=Sum("quantity"))["total"] or 0

            transfers_in_before = Transfer.objects.filter(
                to_base=base,
                equipment_type=equipment,
                transfer_at__date__lt=start_date,
            ).aggregate(total=Sum("quantity"))["total"] or 0

            transfers_out_before = Transfer.objects.filter(
                from_base=base,
                equipment_type=equipment,
                transfer_at__date__lt=start_date,
            ).aggregate(total=Sum("quantity"))["total"] or 0

            assignments_before = Assignment.objects.filter(
                base=base,
                equipment_type=equipment,
                assigned_at__date__lt=start_date,
            ).aggregate(total=Sum("quantity"))["total"] or 0

            expenditures_before = Expenditure.objects.filter(
                base=base,
                equipment_type=equipment,
                expended_at__date__lt=start_date,
            ).aggregate(total=Sum("quantity"))["total"] or 0

            opening_balance = (
                purchases_before
                + transfers_in_before
                - transfers_out_before
                - assignments_before
                - expenditures_before
            )
        else:
            opening_balance = 0

        purchases_qs = date_filter(
            Purchase.objects.filter(base=base, equipment_type=equipment),
            "purchased_at",
            start_date,
            end_date,
        )
        transfers_in_qs = date_filter(
            Transfer.objects.filter(to_base=base, equipment_type=equipment),
            "transfer_at",
            start_date,
            end_date,
        )
        transfers_out_qs = date_filter(
            Transfer.objects.filter(from_base=base, equipment_type=equipment),
            "transfer_at",
            start_date,
            end_date,
        )
        assignments_qs = date_filter(
            Assignment.objects.filter(base=base, equipment_type=equipment),
            "assigned_at",
            start_date,
            end_date,
        )
        expenditures_qs = date_filter(
            Expenditure.objects.filter(base=base, equipment_type=equipment),
            "expended_at",
            start_date,
            end_date,
        )

        purchases_total = purchases_qs.aggregate(total=Sum("quantity"))["total"] or 0
        transfers_in_total = transfers_in_qs.aggregate(total=Sum("quantity"))["total"] or 0
        transfers_out_total = transfers_out_qs.aggregate(total=Sum("quantity"))["total"] or 0
        assigned_total = assignments_qs.aggregate(total=Sum("quantity"))["total"] or 0
        expended_total = expenditures_qs.aggregate(total=Sum("quantity"))["total"] or 0

        net_movement = purchases_total + transfers_in_total - transfers_out_total

        if user.role == User.ROLE_LOGISTICS and not user.is_superuser:
            assigned_total = 0
            expended_total = 0

        closing_balance = (
            opening_balance
            + net_movement
            - assigned_total
            - expended_total
        )

        data = {
            "base": {
                "id": base.id,
                "name": base.name,
                "code": base.code,
            },
            "equipment_type": {
                "id": equipment.id,
                "name": equipment.name,
                "category": equipment.category,
            },
            "filters": {
                "start_date": str(start_date) if start_date else None,
                "end_date": str(end_date) if end_date else None,
            },
            "opening_balance": opening_balance,
            "closing_balance": closing_balance,
            "net_movement": {
                "total": net_movement,
                "purchases": purchases_total,
                "transfers_in": transfers_in_total,
                "transfers_out": transfers_out_total,
            },
            "assigned_total": assigned_total,
            "expended_total": expended_total,
        }

        return Response(data)


