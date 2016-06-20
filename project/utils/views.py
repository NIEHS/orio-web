from django.contrib import messages

from django.core.exceptions import PermissionDenied

from functools import wraps
from django.utils.cache import add_never_cache_headers
from django.utils.decorators import available_attrs


def never_cache(view_func):
    """
    Revised django.views.decorators.cache.never_cache to include a few extra
    headers to ensure no client-side caching.
    """
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


class UserCanEdit(object):

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if not obj.user_can_edit(self.request.user):
            raise PermissionDenied()
        return obj


class UserCanView(object):

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
