from django.apps import AppConfig
from django.conf import settings

from django.core.management import call_command

import os


class MyConfig(AppConfig):
    name = 'analysis'
    verbose_name = 'Analysis'

    def ready(self):

        from . import signals  # noqa

        # download ORIO tools if needed
        call_command('download_ucsc_tools')
