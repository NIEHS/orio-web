# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-02-03 18:51
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analysis', '0011_auto_20160128_1412'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='genomicdataset',
            name='data_ambiguous',
        ),
        migrations.RemoveField(
            model_name='genomicdataset',
            name='data_minus',
        ),
        migrations.RemoveField(
            model_name='genomicdataset',
            name='data_plus',
        ),
    ]
