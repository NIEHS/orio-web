# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-02-03 18:51
from __future__ import unicode_literals

from django.db import migrations, models
import utils.models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0012_auto_20160203_1351'),
    ]

    operations = [
        migrations.AddField(
            model_name='encodedataset',
            name='data_ambiguous',
            field=models.FileField(blank=True, max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location='/Users/shapiroaj4/dev/temp/genomics'), upload_to=''),
        ),
        migrations.AddField(
            model_name='encodedataset',
            name='data_minus',
            field=models.FileField(blank=True, max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location='/Users/shapiroaj4/dev/temp/genomics'), upload_to=''),
        ),
        migrations.AddField(
            model_name='encodedataset',
            name='data_plus',
            field=models.FileField(blank=True, max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location='/Users/shapiroaj4/dev/temp/genomics'), upload_to=''),
        ),
        migrations.AddField(
            model_name='userdataset',
            name='data_ambiguous',
            field=models.FileField(blank=True, max_length=256, upload_to=''),
        ),
        migrations.AddField(
            model_name='userdataset',
            name='data_minus',
            field=models.FileField(blank=True, max_length=256, upload_to=''),
        ),
        migrations.AddField(
            model_name='userdataset',
            name='data_plus',
            field=models.FileField(blank=True, max_length=256, upload_to=''),
        ),
    ]