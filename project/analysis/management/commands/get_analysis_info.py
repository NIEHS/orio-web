from django.core.management.base import BaseCommand
from django.core.serializers.json import DjangoJSONEncoder

from analysis import models


HELP_TEXT = """Get path and settings for debugging an analysis"""


class Command(BaseCommand):
    help = HELP_TEXT

    def add_arguments(self, parser):
        parser.add_argument('analysis_id')

    def handle(self, analysis_id, **options):
        analysis = models.Analysis.objects.get(id=analysis_id)
        serializer = DjangoJSONEncoder(indent=4)
        output = serializer.encode(analysis.to_dict())
        self.stdout.write('{}\n'.format(output))
