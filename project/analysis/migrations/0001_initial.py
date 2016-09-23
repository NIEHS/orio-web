 # -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-09-22 21:12
from __future__ import unicode_literals

import analysis.models
from django.conf import settings
import django.contrib.postgres.fields.jsonb
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import orio.utils
import utils.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Analysis',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('anchor', models.PositiveSmallIntegerField(choices=[(0, 'start'), (1, 'center'), (2, 'end')], default=1, help_text='Where to center analysis window relative to BED range')),
                ('bin_start', models.IntegerField(default=-2500, help_text='Distance from anchor to start designating bins')),
                ('bin_number', models.PositiveIntegerField(default=50, help_text='Number of bins to use in search window', validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(250)])),
                ('bin_size', models.PositiveIntegerField(default=100, help_text='Size of bins to use in search window', validators=[django.core.validators.MinValueValidator(1)])),
                ('name', models.CharField(max_length=128)),
                ('slug', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('validated', models.BooleanField(default=False)),
                ('validation_errors', models.TextField(blank=True)),
                ('validation_warnings', models.TextField(blank=True)),
                ('start_time', models.DateTimeField(null=True)),
                ('end_time', models.DateTimeField(null=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('output', models.FileField(blank=True, max_length=256, null=True, upload_to='analysis/')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Analyses',
            },
            bases=(analysis.models.ValidationMixin, models.Model),
        ),
        migrations.CreateModel(
            name='AnalysisDatasets',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('display_name', models.CharField(max_length=128)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('analysis', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.Analysis')),
            ],
            options={
                'verbose_name_plural': 'Analysis datasets',
            },
        ),
        migrations.CreateModel(
            name='DatasetDownload',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField()),
                ('data', models.FileField(blank=True, max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location=settings.USERDATA_PATH), upload_to='')),
                ('filesize', models.FloatField(null=True)),
                ('md5', models.CharField(max_length=64, null=True)),
                ('status_code', models.PositiveSmallIntegerField(choices=[(0, 'not-started'), (1, 'started'), (2, 'finished with errors'), (3, 'successfully completed')], default=0)),
                ('status', models.TextField(blank=True, null=True)),
                ('start_time', models.DateTimeField(blank=True, null=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('owner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='datasetdownload', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='FeatureList',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('slug', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('validation_errors', models.TextField(blank=True)),
                ('validation_warnings', models.TextField(blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('stranded', models.BooleanField(default=True)),
                ('dataset', models.FileField(max_length=256, upload_to='')),
            ],
            options={
                'abstract': False,
            },
            bases=(analysis.models.ValidationMixin, models.Model),
        ),
        migrations.CreateModel(
            name='FeatureListCountMatrix',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('anchor', models.PositiveSmallIntegerField(choices=[(0, 'start'), (1, 'center'), (2, 'end')], default=1, help_text='Where to center analysis window relative to BED range')),
                ('bin_start', models.IntegerField(default=-2500, help_text='Distance from anchor to start designating bins')),
                ('bin_number', models.PositiveIntegerField(default=50, help_text='Number of bins to use in search window', validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(250)])),
                ('bin_size', models.PositiveIntegerField(default=100, help_text='Size of bins to use in search window', validators=[django.core.validators.MinValueValidator(1)])),
                ('matrix', models.FileField(help_text='Matrix file of read coverage', max_length=256, upload_to='fcm/')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Feature list count matrices',
            },
        ),
        migrations.CreateModel(
            name='GenomeAssembly',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=32, unique=True)),
                ('chromosome_size_file', utils.models.DynamicFilePathField(max_length=128, path=orio.utils.get_data_path, unique=True)),
                ('annotation_file', utils.models.DynamicFilePathField(max_length=128, path=orio.utils.get_data_path, unique=True)),
            ],
            options={
                'verbose_name_plural': 'genome assemblies',
            },
        ),
        migrations.CreateModel(
            name='GenomicDataset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('slug', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('validation_errors', models.TextField(blank=True)),
                ('validation_warnings', models.TextField(blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SortVector',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=128)),
                ('slug', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('public', models.BooleanField(default=False)),
                ('validated', models.BooleanField(default=False)),
                ('validation_errors', models.TextField(blank=True)),
                ('validation_warnings', models.TextField(blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('dataset', models.FileField(max_length=256, upload_to='')),
                ('feature_list', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.FeatureList')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sortvector', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
            bases=(analysis.models.ValidationMixin, models.Model),
        ),
        migrations.CreateModel(
            name='TemporaryDownload',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(max_length=256, upload_to=analysis.models.get_temporary_download_path)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='temporarydownload', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='EncodeDataset',
            fields=[
                ('genomicdataset_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='analysis.GenomicDataset')),
                ('data_ambiguous', models.FileField(blank=True, help_text='Coverage data for which strand is ambiguous or unknown', max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location=settings.ENCODE_PATH), upload_to='')),
                ('data_plus', models.FileField(blank=True, help_text='Coverage data for which strand is plus', max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location=settings.ENCODE_PATH), upload_to='')),
                ('data_minus', models.FileField(blank=True, help_text='Coverage data for which strand is minus', max_length=256, storage=utils.models.ReadOnlyFileSystemStorage(location=settings.ENCODE_PATH), upload_to='')),
                ('data_type', models.CharField(db_index=True, help_text='Experiment type', max_length=16)),
                ('cell_type', models.CharField(db_index=True, help_text='Cell type (cell line or tissue); reported by ENCODE', max_length=32)),
                ('antibody', models.CharField(blank=True, db_index=True, help_text='Antibody used in pulldown; reported by ENCODE', max_length=32)),
                ('rna_extract', models.CharField(blank=True, db_index=True, help_text='RNA extraction protocol; reported by ENCODE', max_length=32)),
                ('treatment', models.CharField(blank=True, db_index=True, help_text='Experimental treatment of cells; reported by ENCODE', max_length=32)),
                ('phase', models.CharField(blank=True, db_index=True, help_text='Cell phase; reported by ENCODE', max_length=32)),
                ('localization', models.CharField(blank=True, db_index=True, help_text='Cellular localization; reported by ENCODE', max_length=32)),
                ('extra_content', django.contrib.postgres.fields.jsonb.JSONField(default=dict)),
            ],
            options={
                'abstract': False,
            },
            bases=('analysis.genomicdataset',),
        ),
        migrations.CreateModel(
            name='UserDataset',
            fields=[
                ('genomicdataset_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='analysis.GenomicDataset')),
                ('data_type', models.CharField(choices=[('Cage', 'Cage'), ('ChiaPet', 'ChiaPet'), ('ChipSeq', 'ChipSeq'), ('DnaseDgf', 'DnaseDgf'), ('DnaseSeq', 'DnaseSeq'), ('FaireSeq', 'FaireSeq'), ('Mapability', 'Mapability'), ('Nucleosome', 'Nucleosome'), ('Orchid', 'Orchid'), ('RepliChip', 'RepliChip'), ('RepliSeq', 'RepliSeq'), ('RipSeq', 'RipSeq'), ('RnaPet', 'RnaPet'), ('RnaSeq', 'RnaSeq'), ('SmartSeq', 'SmartSeq'), ('Other', 'Other (describe in "description" field)')], help_text='Experiment type', max_length=16)),
                ('url', models.URLField(max_length=256, null=True)),
                ('expiration_date', models.DateTimeField(null=True)),
                ('ambiguous', models.ForeignKey(help_text='Coverage data for which strand is ambiguous or unknown', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='ambiguous', to='analysis.DatasetDownload')),
                ('minus', models.ForeignKey(help_text='Coverage data for which strand is minus', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='minus', to='analysis.DatasetDownload')),
                ('plus', models.ForeignKey(help_text='Coverage data for which strand is plus', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='plus', to='analysis.DatasetDownload')),
            ],
            options={
                'abstract': False,
            },
            bases=(analysis.models.ValidationMixin, 'analysis.genomicdataset'),
        ),
        migrations.AddField(
            model_name='genomicdataset',
            name='genome_assembly',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.GenomeAssembly'),
        ),
        migrations.AddField(
            model_name='genomicdataset',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='genomicdataset', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='dataset',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='intermediates', to='analysis.GenomicDataset'),
        ),
        migrations.AddField(
            model_name='featurelistcountmatrix',
            name='feature_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='intermediates', to='analysis.FeatureList'),
        ),
        migrations.AddField(
            model_name='featurelist',
            name='genome_assembly',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.GenomeAssembly'),
        ),
        migrations.AddField(
            model_name='featurelist',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='featurelist', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='analysisdatasets',
            name='count_matrix',
            field=models.ForeignKey(help_text='Matrix of read coverage over genomic features', null=True, on_delete=django.db.models.deletion.CASCADE, to='analysis.FeatureListCountMatrix'),
        ),
        migrations.AddField(
            model_name='analysisdatasets',
            name='dataset',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.GenomicDataset'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='datasets',
            field=models.ManyToManyField(through='analysis.AnalysisDatasets', to='analysis.GenomicDataset'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='feature_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.FeatureList'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='genome_assembly',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='analysis.GenomeAssembly'),
        ),
        migrations.AddField(
            model_name='analysis',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='analysis',
            name='sort_vector',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='analysis.SortVector'),
        ),
    ]
