from rest_framework import serializers
from .models import TransactionLog

class TransactionLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = TransactionLog
        fields = [
            'id',
            'user',
            'action_type',
            'model_name',
            'object_id',
            'timestamp',
            'details',
        ]
