import json
from datetime import date, timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum
from django.conf import settings
from openai import OpenAI

from task.models import Task
from projects.models import Project
from time_tracker.models import TimeSession
from finance.models import PurchaseOrder
from gmail.utils import get_today_meetings

def get_dashboard_data(user):
    today = date.today()
    meetings = get_today_meetings(user)
    
    # User Greeting
    current_hour = timezone.now().hour
    if 5 <= current_hour < 12:
        greeting = "Good morning"
    elif 12 <= current_hour < 17:
        greeting = "Good afternoon"
    else:
        greeting = "Good evening"
        
    # Overdue Tasks
    overdue_tasks = Task.objects.filter(
        assignees=user, 
        end_date__lt=today
    ).exclude(status='D')  # Assuming 'D' is Done
    
    overdue_tasks_count = overdue_tasks.count()
    overdue_tasks_data = []
    for task in overdue_tasks.order_by('end_date')[:5]: # Top 5 overdue
        overdue_tasks_data.append({
            'id': task.id,
            'title': task.title,
            'project': task.project.project_name if task.project else None,
            'client': f"{task.project.client.name} {task.project.client.surname}" if task.project and task.project.client else None,
            'end_date': task.end_date
        })

    # Time Tracked (Weekly)
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    # Get all time sessions for the user this week
    weekly_sessions = TimeSession.objects.filter(
        time_log__user=user,
        start_time__date__gte=start_of_week,
        start_time__date__lte=end_of_week
    )
    
    total_seconds = 0
    daily_breakdown = {day: 0.0 for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
    
    for session in weekly_sessions:
        if session.end_time:
            duration = (session.end_time - session.start_time).total_seconds()
            total_seconds += duration
            day_name = session.start_time.strftime('%a')
            if day_name in daily_breakdown:
                 daily_breakdown[day_name] += duration # Add seconds

    total_hours_numeric = round(total_seconds / 3600.0)
    
    def format_duration(seconds):
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{hours}h {minutes}m"

    total_hours = format_duration(total_seconds)
    
    # Format daily breakdown
    for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']:
        seconds = daily_breakdown[day]
        daily_breakdown[day] = {
            'calc_hours': round(seconds / 3600.0, 2),
            'time': format_duration(seconds)
        }

    
    # KPI 1: Budget Utilization (Total POs / Total Budget for Active Projects)
    # ------------------------------------------------------------------------
    user_projects = Project.objects.filter(assignees=user).distinct()
    total_budget = user_projects.aggregate(total=Sum('total_budget'))['total'] or Decimal('0')
    
    # Total Spent (All POs for these projects)
    total_spent = PurchaseOrder.objects.filter(project__in=user_projects).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    
    budget_util_value = f"{total_spent:,.2f}"
    budget_percentage = 0
    if total_budget > 0:
        budget_percentage = (float(total_spent) / float(total_budget)) * 100
    
    # Spend Trend: This Month vs Last Month
    first_day_this_month = today.replace(day=1)
    last_month_end = first_day_this_month - timedelta(days=1)
    first_day_last_month = last_month_end.replace(day=1)
    
    spend_this_month = PurchaseOrder.objects.filter(
        project__in=user_projects,
        created_at__date__gte=first_day_this_month,
        created_at__date__lte=today
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    
    spend_last_month = PurchaseOrder.objects.filter(
        project__in=user_projects,
        created_at__date__gte=first_day_last_month,
        created_at__date__lte=last_month_end
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')
    
    spend_diff = spend_this_month - spend_last_month
    budget_trend_sign = '+' if spend_diff >= 0 else '-'
    budget_trend_text = f"{budget_trend_sign}£{abs(spend_diff):,.0f} vs last month"

    # KPI 2: Hours This Week (Trend vs Last Week)
    # -------------------------------------------
    # Logic for "This Week" (total_hours) was already calculated above.
    
    # Calculate Last Week Hours
    last_week_start = start_of_week - timedelta(days=7)
    last_week_end = end_of_week - timedelta(days=7)
    
    last_week_sessions = TimeSession.objects.filter(
        time_log__user=user,
        start_time__date__gte=last_week_start,
        start_time__date__lte=last_week_end
    )
    last_week_seconds = sum([(s.end_time - s.start_time).total_seconds() for s in last_week_sessions if s.end_time])
    last_week_hours = round(last_week_seconds / 3600.0)
    
    hours_diff = total_hours_numeric - last_week_hours
    hours_trend_sign = '+' if hours_diff >= 0 else '-'
    hours_trend_text = f"{hours_trend_sign}{abs(hours_diff)}h vs last week"
    
    # KPI 3: Projects Active (Trend: New Projects This Month)
    # -------------------------------------------------------
    projects_active_count = user_projects.filter(project_status='AC').count()
    
    # Trend: New projects created this month assigned to user
    new_projects_this_month = user_projects.filter(
        created_at__date__gte=first_day_this_month
    ).count()
    
    projects_trend_text = f"+{new_projects_this_month} new"

    my_kpis = {
        'budget_util': {'value': budget_util_value, 'subtitle': f"{int(budget_percentage)}% utilized", 'trend': budget_trend_text},
        'hours_this_week': {'value': total_hours, 'trend': hours_trend_text}, 
        'projects_active': {'value': projects_active_count, 'trend': projects_trend_text}
    }

    # Jump Back In (Active Projects)
    active_projects = Project.objects.filter(
        assignees=user, 
        project_status='AC'
    ).order_by('-updated_at')[:3]
    
    jump_back_in_data = []
    for project in active_projects:
        last_phase = project.phases.last()
        pill_text = last_phase.name if last_phase else project.get_project_status_display()
        progress = last_phase.progress if last_phase and last_phase.progress else 0
        
        jump_back_in_data.append({
            'id': project.id,
            'name': project.project_name,
            'pill': pill_text,
            'time_ago': project.updated_at,
            'progress': progress
        })

    quick_actions = [
        "Schedule client call", 
        "Send invoice reminder", 
        "Update project status", 
        "Review proposals"
    ]

    dashboard_data = {
        'greeting': {
            'greeting': greeting,
            'name': f"{user.name} {user.username if hasattr(user, 'username') else ''}".strip() or user.email,
            'date': today.strftime("%A %-d %B"),
            'meetings_today': f"{len(meetings)} meetings today" if meetings else "No meetings today",
            'overdue_count': overdue_tasks_count,
        },
        'today_meetings': meetings,
        'overdue_tasks': {
            'count': overdue_tasks_count,
            'tasks': overdue_tasks_data
        },
        'my_kpis': my_kpis,
        'time_tracked': {
            'total_hours': total_hours,
            'breakdown': daily_breakdown
        },
        'jump_back_in': jump_back_in_data,
        'quick_actions': quick_actions
    }
    
    return dashboard_data

def generate_daily_brief(user, dashboard_data):
    """
    Generate a daily brief using OpenAI in UK English.
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    # Prepare a concise summary for the AI
    summary = {
        "user_name": dashboard_data['greeting']['name'],
        "meetings_today": [m['summary'] for m in dashboard_data['today_meetings']],
        "overdue_tasks": [t['title'] for t in dashboard_data['overdue_tasks']['tasks']],
        "active_projects": [{"name": p['name'], "progress": p['progress']} for p in dashboard_data['jump_back_in']],
        "kpis": dashboard_data['my_kpis']
    }
    
    prompt = f"""
    You are a professional assistant for {summary['user_name']}. 
    Based on their dashboard data for today, write a concise, encouraging "Daily Brief" in UK English.
    Mention key things like their meetings today, any urgent (overdue) tasks, and project progress.
    Use UK English spelling (e.g., 'organised', 'prioritise', 'programme').
    
    Data:
    {json.dumps(summary, indent=2)}
    
    Reference design style: 
    "Good morning {summary['user_name']}. Your calendar is clear today - a perfect opportunity for focused work. The Old Rectory is at 0% completion. Everything is running smoothly across your projects. A great day to make progress on your priorities."
    
    Format the response as a single, friendly paragraph.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for a busy professional. You speak in UK English."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating daily brief: {e}")
        return f"Good morning {summary['user_name']}. I'm having trouble generating your full brief right now, but you have {len(summary['meetings_today'])} meetings and {len(summary['overdue_tasks'])} overdue tasks to keep in mind today."
