from django.contrib import messages

from django.core.exceptions import PermissionDenied

from functools import wraps
from django.http import Http404
from django.utils.cache import add_never_cache_headers
from django.utils.decorators import available_attrs, method_decorator
from django.utils.translation import ugettext as _


def never_cache(view_func):
    """Add headers for no client-side caching."""
    @wraps(view_func, assigned=available_attrs(view_func))
    def _wrapped_view_func(request, *args, **kwargs):
        response = view_func(request, *args, **kwargs)
        add_never_cache_headers(response)
        if not response.has_header('Pragma'):
            response['Pragma'] = 'no-Cache'
        if not response.has_header('Cache-Control'):
            response['Cache-Control'] = 'no-Store, no-Cache'
        return response

    return _wrapped_view_func


class NeverCacheFormMixin:

    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class SlugIDMixin(object):

    def get_object(self, queryset=None):
        if queryset is None:
            queryset = self.get_queryset()
        pk = self.kwargs.get(self.pk_url_kwarg)
        slug = self.kwargs.get(self.slug_url_kwarg)
        queryset = queryset.filter(pk=pk, slug=slug)
        try:
            # Get the single item from the filtered queryset
            obj = queryset.get()
        except queryset.model.DoesNotExist:
            raise Http404(_("No %(verbose_name)s found matching the query") %
                          {'verbose_name': queryset.model._meta.verbose_name})
        return obj


class UserCanEdit(SlugIDMixin, object):

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.user_can_edit(self.request.user):
            raise PermissionDenied()
        return obj


class UserCanView(SlugIDMixin, object):

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.user_can_view(self.request.user):
            raise PermissionDenied()
        return obj

    def get_context_data(self, **kwargs):
        context = super(UserCanView, self).get_context_data(**kwargs)
        context['user_can_edit'] = self.object.user_can_edit(self.request.user)
        return context


class AddUserToFormMixin(object):

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['owner'] = self.request.user
        return kwargs


class MessageMixin(object):

    def send_message(self):
        if self.success_message:
            messages.success(
                self.request, self.success_message)

    def delete(self, request, *args, **kwargs):
        self.send_message()
        return super(MessageMixin, self).delete(request, *args, **kwargs)

    def form_valid(self, form):
        self.send_message()
        return super(MessageMixin, self).form_valid(form)
