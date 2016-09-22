# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-09-22 18:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0042_auto_20160824_1206'),
    ]

    operations = [
        migrations.RenameField(
            model_name='analysis',
            old_name='validation_notes',
            new_name='validation_errors',
        ),
        migrations.RenameField(
            model_name='featurelist',
            old_name='validation_notes',
            new_name='validation_errors',
        ),
        migrations.RenameField(
            model_name='genomicdataset',
            old_name='validation_notes',
            new_name='validation_errors',
        ),
        migrations.RenameField(
            model_name='sortvector',
            old_name='validation_notes',
            new_name='validation_errors',
        ),
        migrations.AddField(
            model_name='analysis',
            name='validation_warnings',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='featurelist',
            name='validation_warnings',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='genomicdataset',
            name='validation_warnings',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='sortvector',
            name='validation_warnings',
            field=models.TextField(blank=True),
        ),
    ]