from itertools import chain
from rest_framework import serializers

from . import models


class UserDatasetSerializer(serializers.ModelSerializer):
    genome_assembly_display = serializers.ReadOnlyField(source='get_genome_assembly_display')
    url = serializers.ReadOnlyField(source='get_absolute_url')

    class Meta:
        model = models.UserDataset
        fields = '__all__'
        read_only_fields = (
            'validated', 'validation_notes',
            'expiration_date', 'owner',
        )


class FeatureListSerializer(serializers.ModelSerializer):
    genome_assembly_display = serializers.ReadOnlyField(source='get_genome_assembly_display')

    class Meta:
        model = models.FeatureList
        fields = '__all__'
        read_only_fields = (
            'validated', 'validation_notes', 'owner')


class SortVectorSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.SortVector
        fields = '__all__'
        read_only_fields = (
            'validated', 'validation_notes', 'owner')


class EncodeDatasetSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.EncodeDataset
        exclude = (
           'public', 'validated', 'validation_notes', 'owner',
           'created', 'last_updated', 'data_plus', 'data_minus',
           'data_ambiguous', 'uuid',
        )


class AnalysisDatasetsSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.AnalysisDatasets
        fields = ('id', 'dataset', 'display_name')


class AnalysisSerializer(serializers.ModelSerializer):
    url_execute = serializers.ReadOnlyField(source='get_execute_url')
    url_visuals = serializers.ReadOnlyField(source='get_visuals_url')
    analysis_user_datasets = AnalysisDatasetsSerializer(many=True)
    analysis_encode_datasets = AnalysisDatasetsSerializer(many=True)
    genome_assembly_display = serializers.ReadOnlyField(source='get_genome_assembly_display')
    anchor_display = serializers.ReadOnlyField(source='get_anchor_display')

    class Meta:
        model = models.Analysis
        exclude = ('output', )
        read_only_fields = (
            'validated', 'validation_notes', 'start_time', 'end_time', 'owner')

    def create_analysis_datasets(self, analysis, datasets):
        objects = [
            models.AnalysisDatasets(
                analysis_id=analysis.id,
                dataset_id=d['dataset'].id,
                display_name=d['display_name']
            ) for d in datasets
        ]
        models.AnalysisDatasets.objects.bulk_create(objects)

    def create(self, validated_data):
        datasets = chain(
            validated_data.pop('analysis_user_datasets', []),
            validated_data.pop('analysis_encode_datasets', [])
        )
        instance = super().create(validated_data)
        self.create_analysis_datasets(instance, datasets)
        return instance

    def update_analysis_datasets(self, analysis, datasets, isUser):
        # get existing objects queryset
        if isUser:
            existing = analysis.analysis_user_datasets
        else:
            existing = analysis.analysis_encode_datasets

        # delete datasets no longer found
        ids = [d['dataset'].id for d in datasets]
        existing.exclude(analysis_id=analysis.id, id__in=ids).delete()

        # create new datasets (to implement)
        existing_ids = set(existing.values_list('id', flat=True))
        news = [
            d for d in datasets
            if d['dataset'].id not in existing_ids
        ]
        self.create_analysis_datasets(analysis, news)

        # update ONLY datasets which changed (to implement)
        keymap = {}
        for d in existing:
            keymap[d.dataset_id] = d

        for ds in datasets:
            match = keymap.get(ds['dataset'].id)
            if match:
                if ds['display_name'] != match.display_name:
                    match.display_name = ds['display_name']
                    match.save()

    def update(self, instance, validated_data):
        """
        Only call `update_analysis_datasets` if any changes were made to the
        models. Note that this requires the complete list for `user_datasets`
        or `encode_datasets`, as anything not in the list will be deleted.
        """
        user_datasets = validated_data.pop('analysis_user_datasets', None)
        encode_datasets = validated_data.pop('analysis_encode_datasets', None)
        instance = super().update(instance, validated_data)
        if user_datasets is not None:
            self.update_analysis_datasets(instance, user_datasets, True)
        if encode_datasets is not None:
            self.update_analysis_datasets(instance, encode_datasets, False)
        return instance


class FeatureListCountMatrixSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.FeatureListCountMatrix
        fields = ('id', )
