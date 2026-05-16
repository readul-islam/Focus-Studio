"""
Remove rows that reference users_user.id but point at deleted/missing users.
Fixes SQLite migrate failures: IntegrityError during check_constraints().
"""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Delete rows with broken foreign keys to users_user (local dev repair).'

    def handle(self, *args, **options):
        deleted_total = 0

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
            tables = [row[0] for row in cursor.fetchall()]

            for table in tables:
                cursor.execute(f'PRAGMA table_info("{table}")')
                columns = [row[1] for row in cursor.fetchall()]

                if 'user_id' in columns:
                    cursor.execute(
                        f'''
                        DELETE FROM "{table}"
                        WHERE user_id IS NOT NULL
                          AND user_id NOT IN (SELECT id FROM users_user)
                        '''
                    )
                    if cursor.rowcount:
                        self.stdout.write(
                            self.style.WARNING(f'{table}.user_id: removed {cursor.rowcount} row(s)')
                        )
                        deleted_total += cursor.rowcount

                if 'sender_id' in columns:
                    cursor.execute(
                        f'''
                        DELETE FROM "{table}"
                        WHERE sender_id IS NOT NULL
                          AND sender_id NOT IN (SELECT id FROM users_user)
                        '''
                    )
                    if cursor.rowcount:
                        self.stdout.write(
                            self.style.WARNING(f'{table}.sender_id: removed {cursor.rowcount} row(s)')
                        )
                        deleted_total += cursor.rowcount

            # Blacklisted tokens whose outstanding token was removed
            if 'token_blacklist_blacklistedtoken' in tables:
                cursor.execute(
                    '''
                    DELETE FROM token_blacklist_blacklistedtoken
                    WHERE token_id NOT IN (SELECT id FROM token_blacklist_outstandingtoken)
                    '''
                )
                if cursor.rowcount:
                    self.stdout.write(
                        self.style.WARNING(
                            f'token_blacklist_blacklistedtoken: removed {cursor.rowcount} row(s)'
                        )
                    )
                    deleted_total += cursor.rowcount

        self.stdout.write(self.style.SUCCESS(f'Done. Removed {deleted_total} orphaned row(s).'))
