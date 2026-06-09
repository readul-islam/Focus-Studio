from django.core.management.base import BaseCommand

from finance.reminders import process_automated_reminders


class Command(BaseCommand):
    help = 'Mark overdue invoices and send payment reminder emails (3-day cooldown).'

    def add_arguments(self, parser):
        parser.add_argument('--studio-id', type=int, default=None)

    def handle(self, *args, **options):
        result = process_automated_reminders(studio_id=options.get('studio_id'))
        self.stdout.write(self.style.SUCCESS(f"Reminders sent: {result['sent']}, skipped: {result['skipped']}"))
