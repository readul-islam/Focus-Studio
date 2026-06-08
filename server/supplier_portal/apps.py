from django.apps import AppConfig


class SupplierPortalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'supplier_portal'
    verbose_name = 'Supplier Portal'

    def ready(self):
        import supplier_portal.signals  # noqa: F401
