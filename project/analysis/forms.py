import logging
import itertools
import json
from django import forms

from utils.forms import BaseFormHelper

from . import models

logger = logging.getLogger(__name__)


class BaseFormMixin:
    """Form mixin to generate basic layout and set owner if available."""

    CREATE_LEGEND = None
    CREATE_HELP_TEXT = None

    def __init__(self, *args, **kwargs):
        owner = kwargs.pop('owner', None)
        super().__init__(*args, **kwargs)
        if owner:
            self.instance.owner = owner

        if 'description' in self.fields:
            self.fields['description'].widget.attrs['rows'] = 3

        self.helper = self.set_helper()

    def set_helper(self):

        for fld in self.fields.keys():
            widget = self.fields[fld].widget
            if type(widget) != forms.CheckboxInput:
                widget.attrs['class'] = 'span12'

        inputs = {}

        if self.instance.id:
            # update
            inputs["legend_text"] = 'Update {}'.format(self.instance)
        else:
            # create
            if self.CREATE_LEGEND:
                inputs["legend_text"] = self.CREATE_LEGEND

            if self.CREATE_HELP_TEXT:
                inputs["help_text"] = self.CREATE_HELP_TEXT

        helper = BaseFormHelper(self, **inputs)
        return helper


class UserDatasetForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create user dataset'
    URL_HELP = 'URL for downloading user-dataset, must be publicly available without authentication using the http or https protocol.'  # noqa

    url_ambiguous = forms.URLField(
        required=False,
        label='URL (strands unspecified)',
        help_text=URL_HELP)
    url_plus = forms.URLField(
        required=False,
        label='URL (plus-strand)',
        help_text=URL_HELP)
    url_minus = forms.URLField(
        required=False,
        label='URL (minus-strand)',
        help_text=URL_HELP)
    stranded = forms.BooleanField(
        required=False)

    class Meta:
        model = models.UserDataset
        fields = (
            'name', 'description', 'data_type',
            'genome_assembly', 'stranded',
            'url_ambiguous', 'url_plus', 'url_minus',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.id:
            self.fields['stranded'].initial = self.instance.is_stranded
            self.fields['url_ambiguous'].initial = '' \
                if self.instance.ambiguous is None \
                else self.instance.ambiguous.url
            self.fields['url_plus'].initial = '' \
                if self.instance.plus is None \
                else self.instance.plus.url
            self.fields['url_minus'].initial = '' \
                if self.instance.minus is None \
                else self.instance.minus.url

            NO_EDIT_HELP = 'URL cannot be changed after dataset creation'

            self.fields['stranded'].disabled = True
            self.fields['stranded'].help_text = \
                'Strand cannot be updated after dataset creation'
            self.fields['url_ambiguous'].disabled = True
            self.fields['url_ambiguous'].help_text = NO_EDIT_HELP
            self.fields['url_plus'].disabled = True
            self.fields['url_plus'].help_text = NO_EDIT_HELP
            self.fields['url_minus'].disabled = True
            self.fields['url_minus'].help_text = NO_EDIT_HELP
            self.fields['genome_assembly'].disabled = True
            self.fields['genome_assembly'].help_text = \
                'Genome assembly cannot be updated after dataset creation'

    def check_url_validity(self, url):
        is_ok, status = models.DatasetDownload.check_valid_url(url)
        if not is_ok:
            raise forms.ValidationError(status)

    def clean_url_ambiguous(self):
        url = self.cleaned_data['url_ambiguous']
        if url:
            self.check_url_validity(url)
        return url

    def clean_url_plus(self):
        url = self.cleaned_data['url_plus']
        if url:
            self.check_url_validity(url)
        return url

    def clean_url_minus(self):
        url = self.cleaned_data['url_minus']
        if url:
            self.check_url_validity(url)
        return url

    def clean(self):
        cleaned_data = super().clean()

        stranded = cleaned_data['stranded']
        if stranded:
            if cleaned_data.get('url_plus') == '':
                self.add_error('url_plus', 'This field is required.')
            if cleaned_data.get('url_minus') == '':
                self.add_error('url_minus', 'This field is required.')
        else:
            if cleaned_data.get('url_ambiguous') == '':
                self.add_error('url_ambiguous', 'This field is required.')

    def add_data_download(self, url, fld_name):
        fld = getattr(self.instance, fld_name, None)
        if url and (fld is None or fld.url != url):
            obj = models.DatasetDownload.objects.create(
                owner=self.instance.owner,
                url=url)
            setattr(self.instance, fld_name, obj)

    def save(self, commit=True):
        if commit:
            self.instance.validated = False
            self.instance.validation_warnings = ''
            self.instance.validation_errors = ''
            self.add_data_download(
                self.cleaned_data.get('url_ambiguous'), 'ambiguous')
            self.add_data_download(
                self.cleaned_data.get('url_plus'), 'plus')
            self.add_data_download(
                self.cleaned_data.get('url_minus'), 'minus')

        return super().save(commit=commit)


class FeatureListForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create feature list'

    class Meta:
        model = models.FeatureList
        exclude = (
            'owner', 'slug', 'public',
            'validated', 'validation_errors', 'validation_warnings',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.id:
            self.fields['dataset'].disabled = True
            self.fields['dataset'].help_text = \
                'Dataset cannot be changed after feature list creation'
            self.fields['genome_assembly'].disabled = True
            self.fields['genome_assembly'].help_text = \
                'Genome assembly cannot be updated after feature list creation'
            self.fields['stranded'].disabled = True
            self.fields['stranded'].help_text = \
                'Strand cannot be updated after feature list creation'


class SortVectorForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create sort vector'

    class Meta:
        model = models.SortVector
        exclude = (
            'owner', 'slug', 'public',
            'validated', 'validation_errors', 'validation_warnings',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['feature_list'].queryset = \
            models.FeatureList.usable(self.instance.owner)

        if self.instance.id:
            self.fields['dataset'].disabled = True
            self.fields['dataset'].help_text = \
                'Dataset cannot be changed after sort vector creation'
            self.fields['feature_list'].disabled = True
            self.fields['feature_list'].help_text = \
                'Feature list cannot be changed after sort vector creation'


class DatasetField(forms.CharField):

    def get_dataset_ids(self, value):
        return [
            d['dataset'] for d in
            itertools.chain(value['userDatasets'], value['encodeDatasets'])]

    def validate(self, cleaned):
        if len(cleaned['userDatasets']) + len(cleaned['encodeDatasets']) < 2:
            raise forms.ValidationError("At least two datasets are required.")

        for obj in itertools.chain(
                cleaned['userDatasets'], cleaned['encodeDatasets']):
            if 'dataset' not in obj or 'display_name' not in obj:
                raise forms.ValidationError("2+ datasets are required.")

        return True

    def to_python(self, value):
        try:
            value = json.loads(value)
            return {
                'userDatasets': value.get('userDatasets', []),
                'encodeDatasets': value.get('encodeDatasets', []),
            }
        except (TypeError, json.decoder.JSONDecodeError):
            raise forms.ValidationError('JSON format required.')


class AnalysisForm(BaseFormMixin, forms.ModelForm):
    CREATE_LEGEND = 'Create analysis'

    datasets_json = DatasetField(widget=forms.HiddenInput)

    class Meta:
        model = models.Analysis
        fields = (
            'name', 'description', 'public',
            'genome_assembly', 'feature_list', 'sort_vector',
            'anchor', 'bin_start', 'bin_size',
            'bin_number',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['feature_list'].queryset = \
            models.FeatureList.usable(self.instance.owner)
        self.fields['sort_vector'].queryset = \
            models.SortVector.usable(self.instance.owner)

        if self.instance.id:
            self.fields['datasets_json'].initial = \
                self.instance.get_form_datasets()

    def save(self, commit=True):
        if commit:
            dsIds = self.fields['datasets_json']\
                .get_dataset_ids(self.cleaned_data['datasets_json'])
            self.execute_reset_required = \
                self.instance.is_reset_required(dsIds)
            if self.execute_reset_required:
                self.instance.reset_analysis_object()
        return super().save(commit=commit)

    def _save_m2m(self):
        if not self.execute_reset_required:
            return

        logger.info("Resetting analysis m2m relations")
        ds = self.cleaned_data['datasets_json']

        # out with the old
        models.AnalysisDatasets.objects\
            .filter(analysis=self.instance)\
            .delete()

        # in with the new
        objects = [
            models.AnalysisDatasets(
                analysis_id=self.instance.id,
                dataset_id=d['dataset'],
                display_name=d['display_name']
            ) for d in itertools.chain(
                ds['userDatasets'], ds['encodeDatasets'])
        ]
        models.AnalysisDatasets.objects.bulk_create(objects)
