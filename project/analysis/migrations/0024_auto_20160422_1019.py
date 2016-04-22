# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-04-22 14:19
from __future__ import unicode_literals

from django.db import migrations, models
import utils.models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0023_auto_20160418_1738'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='datasetdownload',
            name='filename',
        ),
        migrations.AddField(
            model_name='datasetdownload',
            name='data',
            field=models.FileField(blank=True, max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location='/Users/shapiroaj4/dev/genomics/data/users'), upload_to=''),
        ),
    ]
