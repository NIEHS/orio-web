from django.contrib import admin

from . import models


class GenomeAssemblyAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'chromosome_size_file',
    )
    search_fields = ('name', )


class UserDatasetAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'genome_assembly', 'owner', 'validated',
        'public', 'created', 'last_updated'
    )
    list_filter = (
        'owner', 'genome_assembly', 'public', 'validated',
    )


class EncodeDatasetAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'genome_assembly', 'data_type',
        'cell_type', 'antibody', 'rna_extract',
        'treatment', 'phase', 'localization',
        'validated', 'created', 'last_updated',
    )
    list_filter = (
        'genome_assembly', 'validated', 'data_type',
        'cell_type', 'antibody', 'rna_extract',
        'treatment', 'phase', 'localization',
    )
    search_fields = (
        'name',
    )


class FeatureListAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'genome_assembly', 'owner', 'validated',
        'public', 'created', 'last_updated'
    )
    list_filter = (
        'owner', 'genome_assembly', 'public', 'validated',
    )
    search_fields = (
        'name', 'owner__email',
    )


class SortVectorAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'owner', 'feature_list', 'public',
        'validated', 'created', 'last_updated'
    )
    list_filter = (
        'owner', 'public', 'validated',
    )
    search_fields = (
        'name', 'feature_list__name', 'owner__email',
    )


class AnalysisDatasetsAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'analysis', 'dataset',
        'display_name', 'created', 'last_updated',
    )
    list_filter = (
        'analysis',
    )
    search_fields = (
        'analysis__name', 'dataset__name', 'analysis__owner__email',
    )


class AnalysisAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'genome_assembly', 'owner',
        'feature_list', 'sort_vector',
        'start_time', 'end_time',
        'validated', 'public',
    )
    list_filter = (
        'owner', 'public', 'genome_assembly',
    )
    search_fields = (
        'name', 'owner__email', 'feature_list__name', 'sort_vector__name',
    )


class FeatureListCountMatrixAdmin(admin.ModelAdmin):
    list_display = (
        'feature_list',
        'dataset',
        'anchor',
        'bin_start',
        'bin_number',
        'bin_size',
        'created',
        'last_updated',
    )
    list_filter = (
        'anchor',
        'bin_start',
        'bin_number',
        'bin_size',
    )
    search_fields = (
        'dataset__name', 'feature_list__name',
    )


class TemporaryDownloadAdmin(admin.ModelAdmin):
    list_display = (
        'file', 'owner', 'created', 'expiration_date',
    )
    search_fields = (
        'owner__email',
    )


admin.site.register(models.GenomeAssembly, GenomeAssemblyAdmin)
admin.site.register(models.UserDataset, UserDatasetAdmin)
admin.site.register(models.EncodeDataset, EncodeDatasetAdmin)
admin.site.register(models.FeatureList, FeatureListAdmin)
admin.site.register(models.SortVector, SortVectorAdmin)
admin.site.register(models.AnalysisDatasets, AnalysisDatasetsAdmin)
admin.site.register(models.Analysis, AnalysisAdmin)
admin.site.register(models.FeatureListCountMatrix, FeatureListCountMatrixAdmin)
admin.site.register(models.TemporaryDownload, TemporaryDownloadAdmin)
