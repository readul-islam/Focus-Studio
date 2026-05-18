Right but for test Identifying the issue: sync only saves emails that match a CRM contact, so most Gmail messages are skipped. Fixing sync to import inbox messages and show them in the UI.

Composer — Sync was running, but the app was dropping almost all Gmail messages before they reached the Inbox. That’s fixed. Here’s what was wrong and what to do now.

Why Sync showed nothing
Two bugs in the backend:

Only CRM contacts were imported — If the sender wasn’t in your CRM (Clients), the email was skipped. Mail from Sagor, Focuspilot, GitHub, etc. was ignored unless that address was a client.
Inbox list was too strict — Threads were filtered so your login email had to appear in From/To, which hid many synced messages.
What we fixed
Import all Gmail messages from the last 15 days (CRM link is optional).
Sync now does a full re-import (force_full: true).
Inbox lists all synced mail for your studio.
What you should do now (2 minutes)
Restart the Django API (so the new code loads):

cd server
.\.venv\Scripts\Activate.ps1
python manage.py runserver
Open http://localhost:3000/ai/inbox

Confirm the green Gmail badge (connected).

Click Sync once and wait ~10–30 seconds (you have many emails).

Select the All tab.

You should see threads including “Test for Intrgredients…” from Sagor Mahamud.

The toast should say something like “Synced 47 emails” (number depends on how much mail you have in the last 15 days).

If the list is still empty
Disconnect Gmail (Settings → Integrations or the green Gmail pill).
Connect again → Continue → Allow.
Click Sync again.
Limits to know
Rule	Detail
Time window
Last 15 days only (older mail won’t import yet)
Gmail account
Must be the same account you authorized in OAuth
Tab
Use All — other tabs only show AI-categorized mail
After restart + Sync, your Gmail inbox should show in Focuspilot. If the toast shows a number but the list is still empty, say what the toast said and we can dig further.

