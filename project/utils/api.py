import json
from rest_framework import authentication, permissions, pagination
from rest_framework import renderers


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 500
    page_size_query_param = 'page_size'
    max_page_size = 1000


class NoPagination(pagination.PageNumberPagination):
    page_size = None


class SiteMixin(object):
    """Sitewide default authentication, permissions, filtering, and pagination."""

    pagination_class = StandardResultsSetPagination
    authentication_classes = (
        authentication.BasicAuthentication,
        authentication.SessionAuthentication,
    )
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
    )


class AnalysisObjectMixin(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.user_can_view(request.user)
        return obj.user_can_edit()


class AnalysisObjectMixin(SiteMixin):
    permission_classes = (
        permissions.IsAuthenticatedOrReadOnly,
        AnalysisObjectMixin,
    )


class PlainTextRenderer(renderers.BaseRenderer):
    media_type = 'text/plain'
    format = 'txt'

    def render(self, data, media_type=None, renderer_context=None):
        # permissions errors are dict; render as such.
        if isinstance(data, dict):
            return json.dumps(data)
        return data.encode(self.charset)
