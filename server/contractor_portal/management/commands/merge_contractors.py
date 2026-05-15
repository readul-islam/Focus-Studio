from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from crm.models import Client
from contractor_portal.models import (
    ContractorProject,
    ContractorSharedProcurement,
    ContractorSharedDocument,
    ContractorProfile,
)


class Command(BaseCommand):
    help = (
        "Merge a duplicate contractor into a primary one. "
        "All shared procurements, drawings, and project links are moved to the primary. "
        "Usage: python manage.py merge_contractors <primary_id> <secondary_id> [--delete-secondary]"
    )

    def add_arguments(self, parser):
        parser.add_argument('primary_id', type=int, help='ID of the contractor to keep')
        parser.add_argument('secondary_id', type=int, help='ID of the duplicate contractor to merge from')
        parser.add_argument(
            '--delete-secondary',
            action='store_true',
            default=False,
            help='Delete the secondary contractor record after merging',
        )

    def handle(self, *args, **options):
        primary_id = options['primary_id']
        secondary_id = options['secondary_id']

        if primary_id == secondary_id:
            raise CommandError("primary_id and secondary_id must be different.")

        try:
            primary = Client.objects.get(id=primary_id, contact_type='CN')
        except Client.DoesNotExist:
            raise CommandError(f"No contractor found with id={primary_id}")

        try:
            secondary = Client.objects.get(id=secondary_id, contact_type='CN')
        except Client.DoesNotExist:
            raise CommandError(f"No contractor found with id={secondary_id}")

        self.stdout.write(f"\nPrimary  : [{primary.id}] {primary.name} ({primary.email})")
        self.stdout.write(f"Secondary: [{secondary.id}] {secondary.name} ({secondary.email})\n")

        with transaction.atomic():
            # --- ContractorProject ---
            primary_project_ids = set(
                ContractorProject.objects.filter(contractor=primary).values_list('project_id', flat=True)
            )
            cp_qs = ContractorProject.objects.filter(contractor=secondary)
            moved_cp = skipped_cp = 0
            for cp in cp_qs:
                if cp.project_id in primary_project_ids:
                    skipped_cp += 1
                else:
                    cp.contractor = primary
                    cp.save(update_fields=['contractor'])
                    primary_project_ids.add(cp.project_id)
                    moved_cp += 1
            self.stdout.write(f"Project links  — moved: {moved_cp}, skipped (already exists): {skipped_cp}")

            # --- ContractorSharedProcurement ---
            primary_proc_ids = set(
                ContractorSharedProcurement.objects.filter(contractor=primary).values_list('procurement_id', flat=True)
            )
            sp_qs = ContractorSharedProcurement.objects.filter(contractor=secondary)
            moved_sp = skipped_sp = 0
            for sp in sp_qs:
                if sp.procurement_id in primary_proc_ids:
                    skipped_sp += 1
                else:
                    sp.contractor = primary
                    sp.save(update_fields=['contractor'])
                    primary_proc_ids.add(sp.procurement_id)
                    moved_sp += 1
            self.stdout.write(f"Shared items   — moved: {moved_sp}, skipped (already exists): {skipped_sp}")

            # --- ContractorSharedDocument ---
            primary_doc_ids = set(
                ContractorSharedDocument.objects.filter(contractor=primary).values_list('document_id', flat=True)
            )
            sd_qs = ContractorSharedDocument.objects.filter(contractor=secondary)
            moved_sd = skipped_sd = 0
            for sd in sd_qs:
                if sd.document_id in primary_doc_ids:
                    skipped_sd += 1
                else:
                    sd.contractor = primary
                    sd.save(update_fields=['contractor'])
                    primary_doc_ids.add(sd.document_id)
                    moved_sd += 1
            self.stdout.write(f"Shared drawings— moved: {moved_sd}, skipped (already exists): {skipped_sd}")

            if options['delete_secondary']:
                secondary.delete()
                self.stdout.write(self.style.SUCCESS(f"\nSecondary contractor [{secondary_id}] deleted."))
            else:
                self.stdout.write(f"\nSecondary contractor [{secondary_id}] kept (pass --delete-secondary to remove it).")

        self.stdout.write(self.style.SUCCESS("\nMerge complete."))
