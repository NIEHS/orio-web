import json
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from analysis import models


HELP_TEXT = """

Delete all ENCODE datasets currently stored in the database, and load new
datasets into the database.

This script requires that all encode datasets are found in the value specified
in the django `settings.ENCODE_PATH` setting. It will check to make sure a
file all files exist when creating objects.

"""


class Command(BaseCommand):

    help = HELP_TEXT

    assembly_cw = {
        d.name: d.id for d in
        models.GenomeAssembly.objects.all()
    }

    def add_arguments(self, parser):
        parser.add_argument('json_file')

    def handle(self, *args, **options):
        json_file = options.get('json_file')
        if not os.path.exists(json_file):
            raise ValueError("Input file not found: {}".format(json_file))

        with open(json_file, 'r') as f:
            datasets = json.loads(f.read())

        self.files_added = 0
        models.EncodeDataset.objects.all().delete()
        for ds in datasets:
            self.create_django_object(ds)

        self.stdout.write("{} datasets in JSON file".format(len(datasets)))
        self.stdout.write("{} datasets created".format(self.files_added))

    def file_exists(self, fn):
        path = os.path.join(settings.ENCODE_PATH, fn)
        found = os.path.exists(path)
        if not found:
            self.stdout.write("File not found: {}".format(path))
        return found

    def create_django_object(self, ds):
        should_create = True
        genome_assembly = self.assembly_cw[ds["genome_assembly"]]
        obj = models.EncodeDataset(
            name=ds["name"],
            public=True,
            genome_assembly=genome_assembly,
            data_type=ds["data_type"],
            cell_type=ds["cell_type"],
            antibody=ds["antibody"],
            rna_extract=ds["rna_extract"],
            treatment=ds["treatment"],
            phase=ds["phase"],
            localization=ds["localization"],
            extra_content=ds["extra_content"],
        )

        fn = ds.get("plus_bigwig")
        if fn:
            if self.file_exists(fn):
                obj.data_plus.name = fn
            else:
                should_create = False

        fn = ds.get("minus_bigwig")
        if fn:
            if self.file_exists(fn):
                obj.data_minus.name = fn
            else:
                should_create = False

        fn = ds.get("ambig_bigwig")
        if fn:
            if self.file_exists(fn):
                obj.data_ambiguous.name = fn
            else:
                should_create = False

        if should_create:
            obj.save()
            self.files_added += 1
