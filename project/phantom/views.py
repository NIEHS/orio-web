import json

from django.views.generic import FormView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import HttpResponse
from django.conf import settings
from django.http import HttpResponseBadRequest

from .convert import Converter
from .forms import RasterizeForm


@method_decorator(csrf_exempt, name='dispatch')
class Rasterize(FormView):

    http_method_names = ('post', )
    form_class = RasterizeForm

    def form_invalid(self, form):
        return HttpResponseBadRequest(json.dumps(form.errors))

    def form_valid(self, form):
        data = form.cleaned_data
        format_ = data['format']

        protocol = 'https' if self.request.is_secure() else 'http'
        static_path = '{}://{}{}'.format(
            protocol, self.request.META['HTTP_HOST'], settings.STATIC_URL)
        converter = Converter(
            static_path, format_, data['content'],
            data['width'], data['height'])
        image = converter.convert()

        response = HttpResponse(image, content_type='application/{}'.format(format_))
        response['Content-Disposition'] = 'attachment; filename="download.{}"'.format(format_)
        return response
