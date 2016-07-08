from django.core.management.base import BaseCommand

from analysis import models


HELP_TEXT = """Re-run all analyses"""


class Command(BaseCommand):
    help = HELP_TEXT

    def handle(self, *args, **options):
        self.stdout.write('Re-running all currently-saved analyses\n')
        for analysis in models.Analysis.objects.all():
            analysis.execute()
