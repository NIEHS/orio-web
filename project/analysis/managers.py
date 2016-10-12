from django.db import models


class AnalysisManager(models.Manager):

    def running(self, owner):
        return self\
            .filter(end_time__isnull=True, owner=owner)\
            .select_related('genome_assembly', 'feature_list')\
            .annotate(models.Count('datasets'))\
            .order_by('-last_updated')

    def complete(self, owner):
        return self\
            .filter(end_time__isnull=False, owner=owner)\
            .select_related('genome_assembly', 'feature_list')\
            .annotate(models.Count('datasets'))\
            .order_by('-last_updated')
