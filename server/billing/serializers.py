from rest_framework import serializers


class CheckoutSerializer(serializers.Serializer):
    plan_tier = serializers.ChoiceField(choices=['starter', 'professional', 'enterprise'])


class VerifySessionSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=255)
