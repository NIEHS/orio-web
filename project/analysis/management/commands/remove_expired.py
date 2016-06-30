from django.core.management.base import BaseCommand

from analysis.models import TemporaryDownload


HELP_TEXT = """Remove expired temporary download files."""


class Command(BaseCommand):

    help = HELP_TEXT

    def handle(self, *args, **options):
        TemporaryDownload.remove_expired()
