from django.core.management.base import BaseCommand

from supplier_portal.models import SupplierAccount, CatalogProduct


class Command(BaseCommand):
    help = 'Create or update a supplier portal account for local development.'

    def add_arguments(self, parser):
        parser.add_argument('--email', default='supplier@test.com')
        parser.add_argument('--password', default='supplier123')
        parser.add_argument('--company', default='Nordic Lighting Co')
        parser.add_argument('--verified', action='store_true', default=True)

    def handle(self, *args, **options):
        supplier, created = SupplierAccount.objects.update_or_create(
            email=options['email'],
            defaults={
                'company_name': options['company'],
                'contact_name': 'Demo Supplier',
                'is_active': True,
                'is_verified': options['verified'],
            },
        )
        supplier.set_password(options['password'])
        supplier.save()

        product, product_created = CatalogProduct.objects.get_or_create(
            supplier=supplier,
            sku='DEMO-LAMP-01',
            defaults={
                'name': 'Arc Floor Lamp',
                'category': 'Lighting',
                'currency': 'GBP',
                'trade_price': '450.00',
                'retail_price': '620.00',
                'lead_time_days': 14,
                'dimension': 'H 165cm × W 45cm',
                'materials': 'Brushed brass, linen shade',
                'is_published': True,
            },
        )

        action = 'Created' if created else 'Updated'
        product_note = ' (demo catalog product created)' if product_created else ''
        self.stdout.write(self.style.SUCCESS(
            f'{action} supplier account: {supplier.email} / {options["password"]} '
            f'(verified={supplier.is_verified}){product_note}'
        ))
