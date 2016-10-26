from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages import get_messages
from django.core.urlresolvers import reverse_lazy
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, CreateView, UpdateView, \
    DetailView, DeleteView, View

from utils.views import UserCanEdit, UserCanView, \
    AddUserToFormMixin, MessageMixin, NeverCacheFormMixin
from . import models, forms, tasks


class Home(TemplateView):
    template_name = 'niehs/base.html'

    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return HttpResponseRedirect(reverse_lazy('analysis:dashboard'))
        return super(Home, self).get(request, *args, **kwargs)


class About(TemplateView):
    template_name = 'about.html'


class Help(TemplateView):
    template_name = 'help.html'


class ShortPollMessages(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({
            'messages': [
                {'status': m.tags, 'message': m.message}
                for m in get_messages(request)
            ]
        })


# ensure errors are raised appropriately
class CeleryErrorTester(Home):

    @method_decorator(staff_member_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        tasks.raise_error.delay()
        return HttpResponseRedirect(reverse_lazy('home'))


# Dashboard CRUD views
class Dashboard(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['analysis_running'] = models.Analysis.objects.running(self.request.user)
        context['analysis_complete'] = models.Analysis.objects.complete(self.request.user)
        return context


class ManageData(LoginRequiredMixin, TemplateView):
    template_name = 'analysis/manage_data.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['feature_lists'] = models.FeatureList.objects\
            .filter(owner=self.request.user)\
            .select_related('genome_assembly')
        context['sort_vectors'] = models.SortVector.objects\
            .filter(owner=self.request.user)\
            .select_related('feature_list')
        context['user_datasets'] = models.UserDataset.objects\
            .filter(owner=self.request.user)\
            .select_related('genome_assembly')
        return context


class ValidatedSuccessMixin:
    def get_success_url(self):
        self.object.validate_and_save()
        if self.object.validated:
            return reverse_lazy('analysis:manage_data')
        else:
            return self.object.get_absolute_url()


# User dataset CRUD
class UserDatasetDetail(UserCanView, DetailView):
    model = models.UserDataset


class UserDatasetCreate(NeverCacheFormMixin, ValidatedSuccessMixin, MessageMixin,
                        AddUserToFormMixin, CreateView):
    model = models.UserDataset
    form_class = forms.UserDatasetForm
    success_message = 'User dataset created; datasets will begin downloading.'


class UserDatasetUpdate(NeverCacheFormMixin, ValidatedSuccessMixin, MessageMixin,
                        UserCanEdit, UpdateView):
    model = models.UserDataset
    form_class = forms.UserDatasetForm
    success_message = 'User dataset updated; datasets will begin downloading.'


class UserDatasetDelete(MessageMixin, UserCanEdit, DeleteView):
    model = models.UserDataset
    success_url = reverse_lazy('analysis:manage_data')
    success_message = 'User dataset deleted.'


# User dataset CRUD
class DatasetDownloadRetry(UserCanEdit, DetailView):
    model = models.UserDataset

    def render_to_response(self, context, **response_kwargs):
        # try to download-dataset again, then redirect to UserDataset detail
        dd = get_object_or_404(
            models.DatasetDownload,
            id=int(self.kwargs['dd_pk']),
            owner=self.request.user
        )
        tasks.download_dataset.delay(dd.id)
        return HttpResponseRedirect(self.object.get_absolute_url())


# Feature list CRUD
class FeatureListDetail(UserCanView, DetailView):
    model = models.FeatureList


class FeatureListCreate(NeverCacheFormMixin, ValidatedSuccessMixin,
                        AddUserToFormMixin, CreateView):
    model = models.FeatureList
    form_class = forms.FeatureListForm


class FeatureListUpdate(NeverCacheFormMixin, ValidatedSuccessMixin,
                        UserCanEdit, UpdateView):
    model = models.FeatureList
    form_class = forms.FeatureListForm


class FeatureListDelete(MessageMixin, UserCanEdit, DeleteView):
    model = models.FeatureList
    success_url = reverse_lazy('analysis:manage_data')
    success_message = 'Feature-list deleted.'


# Sort vector CRUD
class SortVectorDetail(UserCanView, DetailView):
    model = models.SortVector


class SortVectorCreate(NeverCacheFormMixin, ValidatedSuccessMixin,
                       AddUserToFormMixin, CreateView):
    model = models.SortVector
    form_class = forms.SortVectorForm


class SortVectorUpdate(NeverCacheFormMixin, ValidatedSuccessMixin,
                       UserCanEdit, UpdateView):
    model = models.SortVector
    form_class = forms.SortVectorForm


class SortVectorDelete(MessageMixin, UserCanEdit, DeleteView):
    model = models.SortVector
    success_url = reverse_lazy('analysis:manage_data')
    success_message = 'Sort-vector deleted.'


# Analysis CRUD
class AnalysisDetail(UserCanView, DetailView):
    model = models.Analysis


class AnalysisCreate(NeverCacheFormMixin, AddUserToFormMixin, CreateView):
    model = models.Analysis
    form_class = forms.AnalysisForm
    success_url = reverse_lazy('analysis:dashboard')

    def get_success_url(self):
        self.object.validate_and_save()
        if self.object.is_ready_to_run:
            return self.object.get_execute_url()
        else:
            return self.object.get_absolute_url()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['feature_lists'] = models.FeatureList.usable_json(self.request.user)
        context['sort_vectors'] = models.SortVector.usable_json(self.request.user)
        return context


class AnalysisUpdate(NeverCacheFormMixin, UserCanEdit, UpdateView):
    model = models.Analysis
    form_class = forms.AnalysisForm

    def get_success_url(self):
        self.object.validate_and_save()
        if self.object.is_ready_to_run:
            return self.object.get_execute_url()
        else:
            return self.object.get_absolute_url()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['feature_lists'] = models.FeatureList.usable_json(self.request.user)
        context['sort_vectors'] = models.SortVector.usable_json(self.request.user)
        return context


class AnalysisDelete(MessageMixin, UserCanEdit, DeleteView):
    model = models.Analysis
    success_url = reverse_lazy('analysis:dashboard')
    success_message = 'Analysis deleted.'


# analysis non-CRUD
class AnalysisVisual(UserCanView, DetailView):
    model = models.Analysis
    template_name = 'analysis/analysis_visual.html'


class AnalysisExecute(UserCanEdit, DetailView):
    model = models.Analysis
    template_name = 'analysis/analysis_execute.html'

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()

        if self.object.is_complete:
            return HttpResponseRedirect(self.object.get_visuals_url())

        if self.object.is_ready_to_run:
            self.object.execute()

        return super().get(request, *args, **kwargs)


class AnalysisZip(MessageMixin, UserCanView, DetailView):
    model = models.Analysis
    success_message = "Zip file being created; we will email you the link once it's complete."  # noqa

    def get(self, request, *args, **kwargs):
        object = self.get_object()
        tasks.analysis_zip.delay(object.id)
        self.send_message()
        return HttpResponseRedirect(object.get_absolute_url())
