from __future__ import unicode_literals

from django.db import models


class Page(models.Model):
    lookup_name = models.CharField(
        max_length=32)
    title = models.CharField(
        default='Change me!',
        max_length=128)
    content = models.TextField(
        default='Change me!')
    created = models.DateTimeField(
        auto_now_add=True)
    last_updated = models.DateTimeField(
        auto_now=True)

    class Meta:
        ordering = ('id', )
