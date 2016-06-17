from django.core.management.base import BaseCommand

import orio


HELP_TEXT = """Download OS-specific UCSC software used in application."""


class Command(BaseCommand):

    help = HELP_TEXT

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            dest='forceDownload',
            default=False,
            help='Force re-downloading of binaries',
        )

    def handle(self, *args, **options):
        if not orio.binaries_exist() or options['forceDownload']:
            orio.download_ucsc_tools()
