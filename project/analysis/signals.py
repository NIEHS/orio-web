from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from . import tasks, models


@receiver(post_save, sender=models.DatasetDownload)
def trigger_download(sender, instance, created, **kwargs):
    if created:
        tasks.download_dataset.delay(instance.id)


@receiver(post_delete, sender=models.DatasetDownload)
def trigger_delete(sender, instance, **kwargs):
    instance.delete_file()
