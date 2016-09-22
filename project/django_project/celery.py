"""
Startup script for celery commands.

Example run command (from django project-path):

celery worker --app=django_project --loglevel=INFO --autoreload
celery beat --app=django_project --loglevel=INFO

flower --app=django_project --port=5555

"""
from __future__ import absolute_import
from celery import Celery
from django.conf import settings

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app = Celery('orio')
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
