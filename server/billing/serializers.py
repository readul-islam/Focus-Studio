from rest_framework import serializers


class CheckoutSerializer(serializers.Serializer):
    plan_tier = serializers.ChoiceField(choices=['solo', 'starter', 'beta', 'professional', 'enterprise'])


class ActivatePlanSerializer(serializers.Serializer):
    plan_tier = serializers.ChoiceField(choices=['beta'])


class VerifySessionSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=255)
