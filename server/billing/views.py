import logging

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.permissions import check_role_permission

from .plans import list_plans_for_api
from .serializers import CheckoutSerializer, VerifySessionSerializer
from . import services

logger = logging.getLogger(__name__)


def _require_studio_admin(user):
    if not user.studio:
        return Response({'error': 'No studio associated with this account.'}, status=status.HTTP_400_BAD_REQUEST)
    if user.role != 'admin' and not check_role_permission(user, 'settings.edit'):
        return Response({'error': 'Only studio admins can manage billing.'}, status=status.HTTP_403_FORBIDDEN)
    return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_status(request):
    """Current studio subscription + Stripe configuration flag."""
    studio = request.user.studio
    if not studio:
        return Response({
            'stripe_configured': services.stripe_configured(),
            'subscription': services.subscription_payload(None),
            'plans': list_plans_for_api(),
        })

    sub = services.get_or_create_subscription(studio)
    return Response({
        'stripe_configured': services.stripe_configured(),
        'subscription': services.subscription_payload(sub),
        'plans': list_plans_for_api(),
        'trial_days': settings.STRIPE_TRIAL_DAYS,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def billing_plans(request):
    return Response({
        'plans': list_plans_for_api(),
        'stripe_configured': services.stripe_configured(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout(request):
    denied = _require_studio_admin(request.user)
    if denied:
        return denied

    serializer = CheckoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    plan_tier = serializer.validated_data['plan_tier']

    try:
        url = services.create_checkout_session(
            studio=request.user.studio,
            user=request.user,
            plan_tier=plan_tier,
        )
        return Response({'checkout_url': url})
    except RuntimeError as e:
        return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception('Checkout session failed')
        return Response({'error': 'Could not start checkout. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_portal(request):
    denied = _require_studio_admin(request.user)
    if denied:
        return denied

    try:
        url = services.create_portal_session(studio=request.user.studio)
        return Response({'portal_url': url})
    except RuntimeError as e:
        return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        logger.exception('Portal session failed')
        return Response({'error': 'Could not open billing portal.'}, status=status.HTTP_502_BAD_GATEWAY)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_session(request):
    denied = _require_studio_admin(request.user)
    if denied:
        return denied

    serializer = VerifySessionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        sub = services.verify_checkout_session(
            serializer.validated_data['session_id'],
            request.user.studio,
        )
        return Response({'subscription': services.subscription_payload(sub)})
    except PermissionError as e:
        return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
    except RuntimeError as e:
        return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception:
        logger.exception('Verify session failed')
        return Response({'error': 'Could not verify checkout session.'}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    try:
        services.handle_webhook_event(request.body, request.META.get('HTTP_STRIPE_SIGNATURE', ''))
        return Response({'received': True})
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        logger.exception('Stripe webhook error')
        return Response({'error': 'Webhook handler failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
