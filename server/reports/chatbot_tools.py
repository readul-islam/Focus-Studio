"""
Database query functions that the chatbot can call via OpenAI function calling.
Each function receives the studio and optional filters, queries the DB, and
returns a plain dict that gets serialised into JSON for the model to read.
"""
from time_tracker.models import TimeSession, TimeLog
from projects.models import Project, Procurement
from finance.models import Invoice
from task.models import Task
from users.models import User
from django.db.models import Q, Sum


# ---------------------------------------------------------------------------
# Tool: hours by team member
# ---------------------------------------------------------------------------

def get_hours_by_team_member(studio, start_date=None, end_date=None, project_id=None):
    """
    Returns total hours per team member for the studio, with per-project breakdown.
    Optionally filtered by date range or a specific project.
    """
    session_filter = Q(time_log__studio=studio, end_time__isnull=False)
    if start_date:
        session_filter &= Q(start_time__date__gte=start_date)
    if end_date:
        session_filter &= Q(start_time__date__lte=end_date)
    if project_id:
        session_filter &= Q(time_log__project_id=project_id)

    sessions = (
        TimeSession.objects
        .filter(session_filter)
        .select_related('time_log__user', 'time_log__project')
    )

    data = {}
    for s in sessions:
        log = s.time_log
        if not log:
            continue
        user_name = (log.user.name or log.user.email) if log.user else 'Unknown'
        project_name = log.project.project_name if log.project else 'No Project'
        secs = (s.end_time - s.start_time).total_seconds()
        data.setdefault(user_name, {'total_seconds': 0, 'projects': {}})
        data[user_name]['total_seconds'] += secs
        data[user_name]['projects'].setdefault(project_name, 0)
        data[user_name]['projects'][project_name] += secs

    result = []
    for user_name, info in sorted(data.items()):
        result.append({
            'team_member': user_name,
            'total_hours': round(info['total_seconds'] / 3600, 2),
            'by_project': {
                p: round(s / 3600, 2) for p, s in sorted(info['projects'].items())
            },
        })
    return {'team_members': result}


# ---------------------------------------------------------------------------
# Tool: hours by project
# ---------------------------------------------------------------------------

def get_hours_by_project(studio, start_date=None, end_date=None):
    """
    Returns total hours per project for the studio, optionally filtered by date.
    """
    session_filter = Q(time_log__studio=studio, end_time__isnull=False)
    if start_date:
        session_filter &= Q(start_time__date__gte=start_date)
    if end_date:
        session_filter &= Q(start_time__date__lte=end_date)

    sessions = (
        TimeSession.objects
        .filter(session_filter)
        .select_related('time_log__project')
    )

    data = {}
    for s in sessions:
        log = s.time_log
        if not log:
            continue
        project_name = log.project.project_name if log.project else 'No Project'
        secs = (s.end_time - s.start_time).total_seconds()
        data[project_name] = data.get(project_name, 0) + secs

    return {
        'projects': [
            {'project': p, 'total_hours': round(s / 3600, 2)}
            for p, s in sorted(data.items(), key=lambda x: -x[1])
        ]
    }


# ---------------------------------------------------------------------------
# Tool: project overview
# ---------------------------------------------------------------------------

def get_project_overview(studio):
    """
    Returns all active projects for the studio with status, budget, and task counts.
    """
    projects = Project.objects.filter(studio=studio).prefetch_related('phases')
    result = []
    for p in projects:
        total_tasks = Task.objects.filter(project=p).count()
        done_tasks = Task.objects.filter(project=p, status='D').count()
        result.append({
            'id': p.id,
            'name': p.project_name,
            'status': p.project_status,
            'start_date': str(p.start_date) if p.start_date else None,
            'end_date': str(p.end_date) if p.end_date else None,
            'total_budget': p.total_budget,
            'total_tasks': total_tasks,
            'completed_tasks': done_tasks,
        })
    return {'projects': result}


# ---------------------------------------------------------------------------
# Tool: task overview
# ---------------------------------------------------------------------------

def get_task_overview(studio, project_id=None, assignee_name=None):
    """
    Returns task counts by status for the studio.
    Optionally filtered by project or assignee name.
    """
    qs = Task.objects.filter(project__studio=studio)
    if project_id:
        qs = qs.filter(project_id=project_id)
    if assignee_name:
        qs = qs.filter(assignees__name__icontains=assignee_name)

    status_labels = {'TD': 'To-do', 'IP': 'In Progress', 'IR': 'In Review', 'D': 'Done'}
    breakdown = {}
    for code, label in status_labels.items():
        breakdown[label] = qs.filter(status=code).count()

    overdue = qs.filter(
        end_date__lt=__import__('django.utils.timezone', fromlist=['now']).now().date(),
        status__in=['TD', 'IP', 'IR']
    ).count()

    return {
        'total': qs.count(),
        'by_status': breakdown,
        'overdue': overdue,
    }


# ---------------------------------------------------------------------------
# Tool: invoice summary
# ---------------------------------------------------------------------------

def get_invoice_summary(studio, project_id=None):
    """
    Returns invoice totals grouped by status for the studio.
    """
    qs = Invoice.objects.filter(studio=studio)
    if project_id:
        qs = qs.filter(project_id=project_id)

    status_labels = {'DFT': 'Draft', 'SNT': 'Sent', 'PD': 'Paid', 'OVD': 'Overdue'}
    breakdown = []
    for code, label in status_labels.items():
        total = qs.filter(status=code).aggregate(t=Sum('total_amount'))['t'] or 0
        count = qs.filter(status=code).count()
        breakdown.append({'status': label, 'count': count, 'total_amount': round(float(total), 2)})

    grand = qs.aggregate(t=Sum('total_amount'))['t'] or 0
    return {
        'by_status': breakdown,
        'grand_total': round(float(grand), 2),
        'currency': studio.default_currency or 'GBP',
    }


# ---------------------------------------------------------------------------
# Tool: procurement summary
# ---------------------------------------------------------------------------

def get_procurement_summary(studio, project_id=None):
    """
    Returns procurement counts and spend by status for the studio.
    """
    qs = Procurement.objects.filter(project__studio=studio).select_related('product')
    if project_id:
        qs = qs.filter(project_id=project_id)

    status_labels = {
        'QT': 'Quoting', 'IR': 'Internal Review', 'IA': 'Internally Approved',
        'CR': 'Client Review', 'ORD': 'Ordered', 'IT': 'In Transit',
        'DEL': 'Delivered', 'INS': 'Installed',
    }
    breakdown = []
    for code, label in status_labels.items():
        items = qs.filter(status=code)
        spend = sum(
            (float(p.product.tader_price or p.product.regular_price or 0) * (p.quantity or 1))
            for p in items if p.product
        )
        breakdown.append({'status': label, 'count': items.count(), 'estimated_spend': round(spend, 2)})

    return {'by_status': breakdown, 'total_items': qs.count()}


# ---------------------------------------------------------------------------
# OpenAI tool schemas
# ---------------------------------------------------------------------------

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_hours_by_team_member",
            "description": "Get hours tracked per team member, with breakdown by project. Use for questions about who worked how many hours, monthly/weekly reports, individual hours.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date filter YYYY-MM-DD (optional)"},
                    "end_date": {"type": "string", "description": "End date filter YYYY-MM-DD (optional)"},
                    "project_id": {"type": "integer", "description": "Filter by a specific project ID (optional)"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_hours_by_project",
            "description": "Get total hours tracked per project. Use for questions about which projects consumed the most time.",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {"type": "string", "description": "Start date filter YYYY-MM-DD (optional)"},
                    "end_date": {"type": "string", "description": "End date filter YYYY-MM-DD (optional)"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_project_overview",
            "description": "Get a list of all projects with their status, budget, and task completion. Use for questions about active projects, project health, or project details.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_task_overview",
            "description": "Get task counts by status and overdue count. Use for questions about tasks, workload, what's in progress, or what's overdue.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "Filter by project ID (optional)"},
                    "assignee_name": {"type": "string", "description": "Filter by team member name (optional)"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_invoice_summary",
            "description": "Get invoice totals grouped by status (draft, sent, paid, overdue). Use for questions about billing, revenue, outstanding invoices.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "Filter by project ID (optional)"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_procurement_summary",
            "description": "Get procurement item counts and estimated spend by status. Use for questions about orders, purchasing, procurement pipeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer", "description": "Filter by project ID (optional)"},
                },
            },
        },
    },
]

TOOL_FUNCTIONS = {
    "get_hours_by_team_member": get_hours_by_team_member,
    "get_hours_by_project": get_hours_by_project,
    "get_project_overview": get_project_overview,
    "get_task_overview": get_task_overview,
    "get_invoice_summary": get_invoice_summary,
    "get_procurement_summary": get_procurement_summary,
}
