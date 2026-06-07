"""Static FAQ knowledge for client and contractor portals (used by Pilot support chat)."""

from __future__ import annotations

CLIENT_PORTAL_FAQ = [
    {
        'id': 'overview',
        'title': 'Client portal overview',
        'keywords': ['portal', 'dashboard', 'client', 'login', 'access'],
        'content': (
            'The Focuspilot client portal lets you review project procurement, invoices, shared documents, '
            'and presentations your studio has shared with you. Use the sidebar to switch between sections.'
        ),
    },
    {
        'id': 'procurement',
        'title': 'Reviewing procurement items',
        'keywords': ['procurement', 'approve', 'items', 'products', 'selection'],
        'content': (
            'Open Procurement from the sidebar to see items your studio has shared. You can review specifications, '
            'quantities, and pricing. Follow your studio\'s instructions for approvals or feedback — contact them '
            'directly if an action is unclear.'
        ),
    },
    {
        'id': 'finance',
        'title': 'Viewing invoices',
        'keywords': ['invoice', 'finance', 'payment', 'bill', 'pay'],
        'content': (
            'Go to Finance to see invoices shared with you. Open an invoice to view line items, totals, and status. '
            'Payment links appear when your studio has enabled online payments via Stripe.'
        ),
    },
    {
        'id': 'documents',
        'title': 'Accessing shared documents',
        'keywords': ['documents', 'files', 'folder', 'download', 'pdf'],
        'content': (
            'Documents lists files and folders your studio shared with you for this project. Open folders to browse, '
            'preview supported files in the browser, or download copies for offline use.'
        ),
    },
    {
        'id': 'presentations',
        'title': 'Viewing presentations',
        'keywords': ['presentation', 'slides', 'deck', 'review'],
        'content': (
            'Presentations shows design decks your studio published for client review. Open a presentation to step '
            'through slides and leave feedback if your studio enabled comments.'
        ),
    },
    {
        'id': 'support',
        'title': 'Getting human help',
        'keywords': ['support', 'help', 'contact', 'email', 'studio'],
        'content': (
            'For project-specific questions, contact your studio directly. For portal technical issues, email '
            'support@focuspilot.io and include your studio name and project.'
        ),
    },
]

CONTRACTOR_PORTAL_FAQ = [
    {
        'id': 'overview',
        'title': 'Contractor portal overview',
        'keywords': ['portal', 'dashboard', 'contractor', 'login', 'project'],
        'content': (
            'The contractor portal gives you access to procurement schedules, shared documents, and messages for '
            'projects your studio invited you to. Select a project after login if you work on multiple sites.'
        ),
    },
    {
        'id': 'procurement',
        'title': 'Procurement schedules',
        'keywords': ['procurement', 'schedule', 'items', 'quote', 'pricing'],
        'content': (
            'Procurement lists items assigned to you. Review specifications, update pricing or lead times where '
            'permitted, and mark items viewed so the studio knows you have seen them.'
        ),
    },
    {
        'id': 'messages',
        'title': 'Messaging your studio',
        'keywords': ['message', 'chat', 'communication', 'reply', 'thread'],
        'content': (
            'Use Messages in the sidebar for project communication with the studio team. This is separate from '
            'Pilot (AI support). For urgent site issues, message the studio directly through Messages.'
        ),
    },
    {
        'id': 'documents',
        'title': 'Shared documents and drawings',
        'keywords': ['documents', 'files', 'drawings', 'download', 'folder'],
        'content': (
            'Documents contains files the studio shared with you — specifications, drawings, and schedules. Download '
            'or preview files as needed and mark them viewed when reviewed.'
        ),
    },
    {
        'id': 'profile',
        'title': 'Updating your profile',
        'keywords': ['profile', 'insurance', 'cert', 'trade', 'account'],
        'content': (
            'Profile lets you update contact details and upload insurance or trade certificates when requested by '
            'the studio. Keep these current so approvals are not delayed.'
        ),
    },
    {
        'id': 'support',
        'title': 'Getting human help',
        'keywords': ['support', 'help', 'contact', 'email'],
        'content': (
            'For project or site questions, message the studio via Messages. For portal technical issues, email '
            'support@focuspilot.io with your studio and project name.'
        ),
    },
]


def search_portal_faq(portal: str, query: str, limit: int = 5) -> list[dict]:
    faq = CLIENT_PORTAL_FAQ if portal == 'client_portal' else CONTRACTOR_PORTAL_FAQ
    q = (query or '').strip().lower()
    if len(q) < 2:
        return faq[:limit]

    scored: list[tuple[int, dict]] = []
    for item in faq:
        score = 0
        blob = f"{item['title']} {' '.join(item['keywords'])} {item['content']}".lower()
        if q in item['title'].lower():
            score += 5
        if any(q in kw for kw in item['keywords']):
            score += 4
        if q in blob:
            score += 2
        for word in q.split():
            if len(word) > 2 and word in blob:
                score += 1
        if score:
            scored.append((score, item))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in scored[:limit]] or faq[:limit]
