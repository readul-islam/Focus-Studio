"""
March Time Report
Run with: python manage.py shell < scripts/march_time_report.py
"""

from datetime import datetime, timedelta
from django.db.models import Sum, F, ExpressionWrapper, DurationField
from django.utils.timezone import make_aware
from time_tracker.models import TimeSession

MARCH_START = make_aware(datetime(2026, 3, 1))
MARCH_END   = make_aware(datetime(2026, 3, 31, 23, 59, 59))

sessions = TimeSession.objects.filter(
    start_time__gte=MARCH_START,
    start_time__lte=MARCH_END,
    end_time__isnull=False,
).select_related('time_log__user', 'time_log__project')

# ── Overall total ────────────────────────────────────────────────────────────
total_seconds = sum(
    (s.end_time - s.start_time).total_seconds()
    for s in sessions
)
total_hours, remainder = divmod(int(total_seconds), 3600)
total_minutes = remainder // 60

print("=" * 55)
print("         TIME LOGGED — MARCH 2026")
print("=" * 55)
print(f"  Total: {total_hours}h {total_minutes}m  ({len(sessions)} sessions)\n")

# ── Breakdown by user ────────────────────────────────────────────────────────
from collections import defaultdict

by_user = defaultdict(float)
by_user_project = defaultdict(lambda: defaultdict(float))

for s in sessions:
    secs = (s.end_time - s.start_time).total_seconds()
    user = str(s.time_log.user) if s.time_log and s.time_log.user else 'Unknown'
    project = str(s.time_log.project) if s.time_log and s.time_log.project else 'No Project'
    by_user[user] += secs
    by_user_project[user][project] += secs

print("  By User:")
print("  " + "-" * 53)
for user, secs in sorted(by_user.items(), key=lambda x: -x[1]):
    h, rem = divmod(int(secs), 3600)
    m = rem // 60
    print(f"  {user:<35} {h}h {m}m")
    for project, psecs in sorted(by_user_project[user].items(), key=lambda x: -x[1]):
        ph, prem = divmod(int(psecs), 3600)
        pm = prem // 60
        print(f"      └─ {project:<31} {ph}h {pm}m")

print("=" * 55)
