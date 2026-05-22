"""Plan catalogue — aligned with README / marketing pricing."""

from django.conf import settings

PLAN_TIERS = ('starter', 'beta', 'professional', 'enterprise')

# Plans shown in the app (Starter hidden until launch).
PUBLIC_PLAN_TIERS = ('beta', 'professional', 'enterprise')

PLAN_DEFINITIONS = {
    'beta': {
        'id': 'beta',
        'name': 'Beta Access',
        'tagline': 'Full platform access during beta',
        'stripe_name': 'Focuspilot Beta Access',
        'stripe_description': (
            'Join the beta program — unlimited access with no payment required during the beta period.'
        ),
        'price_display': 'Free',
        'price_note': 'during beta',
        'ideal_for': 'Early adopters, design studios',
        'features': [
            'Unlimited users during beta',
            'All AI features included',
            'Project management & CRM',
            'Client portal & approvals',
            'AI procurement & library',
            'Priority support & feedback',
        ],
        'emphasis': False,
        'badge': 'Limited spots',
        'no_payment_required': True,
    },
    'starter': {
        'id': 'starter',
        'name': 'Starter',
        'tagline': 'For solo practitioners & small teams',
        'stripe_name': 'Focuspilot Starter',
        'stripe_description': (
            'Everything you need to run a small studio — projects, CRM, basic invoicing, '
            'and 10GB storage for up to 5 team members.'
        ),
        'price_display': '£149',
        'price_note': 'per month',
        'ideal_for': 'Solo practitioners, small teams',
        'stripe_price_id': settings.STRIPE_PRICE_STARTER,
        'features': [
            'Up to 5 team members',
            '10 active projects',
            'Basic invoicing',
            'Document storage (10GB)',
            'Email support',
            'Core CRM features',
        ],
        'emphasis': False,
    },
    'professional': {
        'id': 'professional',
        'name': 'Professional',
        'tagline': 'For growing studios (10–30 people)',
        'stripe_name': 'Focuspilot Professional',
        'stripe_description': (
            'Scale with confidence — unlimited projects, Xero sync, time tracking, '
            'advanced reports, and contractor portal for up to 20 team members.'
        ),
        'price_display': '£399',
        'price_note': 'per month',
        'ideal_for': 'Mid-size studios (10–30 people)',
        'stripe_price_id': settings.STRIPE_PRICE_PROFESSIONAL,
        'features': [
            'Up to 20 team members',
            'Unlimited projects',
            'Advanced invoicing + Xero sync',
            'Document storage (100GB)',
            'Time tracking',
            'Advanced reports (3 months of history)',
            'Contractor portal (QR codes, 10 contractors)',
            'Priority email + chat support',
        ],
        'emphasis': True,
        'badge': 'Most popular',
    },
    'enterprise': {
        'id': 'enterprise',
        'name': 'Enterprise',
        'tagline': 'For large studios & networks',
        'stripe_name': 'Focuspilot Enterprise',
        'stripe_description': (
            'Full platform access for established studios — unlimited team & projects, '
            'API & SSO, custom integrations, and dedicated support.'
        ),
        'price_display': '£999',
        'price_note': 'per month',
        'ideal_for': 'Large studios, networks',
        'stripe_price_id': settings.STRIPE_PRICE_ENTERPRISE,
        'features': [
            'Unlimited team members',
            'Unlimited projects',
            'Full feature set',
            'Unlimited storage',
            '24/7 dedicated support',
            'API access',
            'Custom integrations',
            'SSO / Advanced security',
        ],
        'emphasis': False,
        'contact_sales': True,
    },
}


def get_plan(tier: str) -> dict:
    if tier not in PLAN_DEFINITIONS:
        raise ValueError(f'Unknown plan tier: {tier}')
    return PLAN_DEFINITIONS[tier]


def list_plans_for_api() -> list[dict]:
    """Public plan list for the client (no secrets)."""
    out = []
    for tier in PUBLIC_PLAN_TIERS:
        p = PLAN_DEFINITIONS[tier]
        out.append({
            'id': p['id'],
            'name': p['name'],
            'tagline': p.get('tagline', ''),
            'price_display': p['price_display'],
            'price_note': p['price_note'],
            'ideal_for': p['ideal_for'],
            'features': p['features'],
            'emphasis': p.get('emphasis', False),
            'badge': p.get('badge'),
            'contact_sales': p.get('contact_sales', False),
            'no_payment_required': p.get('no_payment_required', False),
            'checkout_available': bool(p.get('stripe_price_id')),
        })
    return out
