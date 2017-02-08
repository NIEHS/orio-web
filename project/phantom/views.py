from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import HttpResponse
from django.conf import settings
from django.http import HttpResponseBadRequest

from .convert import Converter


@method_decorator(csrf_exempt, name='dispatch')
class Rasterize(View):

    FORMATS = ('png', 'pdf')

    def is_valid(self, request):
        # TODO - change into a form
        msg = None

        # ensure payload is valid
        format = request.POST.get('format')
        if format not in self.FORMATS:
            msg = 'Invalid rasterization format; must be one of [{}]'.format(
                ', '.join(self.FORMATS))

        content = request.POST.get('content')
        width = request.POST.get('width')
        height = request.POST.get('height')
        if any([content is None, width is None, height is None]):
            msg = 'Content, width, and height are required.'

        return msg

    def post(self, request):
        # check input arguments
        msg = self.is_valid(request)
        if msg:
            return HttpResponseBadRequest(msg)

        # convert html
        format = request.POST['format']
        content = request.POST['content']
        width = request.POST['width']
        height = request.POST['height']
        protocol = 'https' if request.is_secure() else 'http'
        static_path = '{}://{}{}'.format(
            protocol, request.META['HTTP_HOST'], settings.STATIC_URL)
        converter = Converter(static_path, format, content, width, height)
        image = converter.convert()

        # return response as downloadable file
        response = HttpResponse(image, content_type='application/{}'.format(format))
        response['Content-Disposition'] = 'attachment; filename="download.{}"'.format(format)
        return response
