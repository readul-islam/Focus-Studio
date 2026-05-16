from django.contrib import admin
from django.apps import apps
from django.contrib.admin.sites import AlreadyRegistered

# Only register models from this app — do not register every project model globally.
for model in apps.get_app_config('users').get_models():
    try:
        admin.site.register(model)
    except AlreadyRegistered:
        pass
