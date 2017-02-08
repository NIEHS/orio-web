import logging
import os
import subprocess
import tempfile

from django.conf import settings
from django.template.loader import render_to_string

__all__ = ('Converter', )


logger = logging.getLogger(__name__)


class TempFileList(list):
    # Maintains a list of temporary files and cleans up after itself

    def get_tempfile(self, prefix='', suffix='.txt'):
        fd, fn = tempfile.mkstemp(prefix=prefix, suffix=suffix)
        os.close(fd)
        self.append(fn)
        return fn

    def cleanup(self):
        for fn in iter(self):
            try:
                os.remove(fn)
            except OSError:
                pass

    def __del__(self):
        self.cleanup()


class Converter:

    def __init__(self, static_path, format, html, width, height):
        self.static_path = static_path
        self.format = format
        self.html = html
        self.width = width
        self.height = height
        self.tempfiles = TempFileList()

    def _to_html(self):
        # return rendered html absolute filepath
        fn = self.tempfiles.get_tempfile(suffix='.html')
        html = render_to_string('phantom/base.html', dict(
            static_path=self.static_path,
            content=self.html,
        ))
        with open(fn, 'w') as f:
            f.write(html)
        return fn

    def _rasterize(self, output_fn):
        rasterize = os.path.join(
            settings.PROJECT_PATH,
            'phantom/js/rasterize.js')
        html_fn = self._to_html()
        commands = [
            settings.PHANTOMJS_PATH, rasterize,
            html_fn, output_fn,
            str(self.width), str(self.height)
        ]
        subprocess.call(commands)

    def convert(self):
        content = None
        try:
            img = self.tempfiles.get_tempfile(suffix='.' + self.format)
            self._rasterize(img)
            with open(img, 'rb') as f:
                content = f.read()
        except Exception as e:
            logger.error(e, exc_info=True)
        finally:
            self.tempfiles.cleanup()
        return content
