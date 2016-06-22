from bs4 import BeautifulSoup
import copy
import os

from django.conf import settings
from django.core.management.base import BaseCommand

import requests


HELP_TEXT = """Get latest website templates"""


class Command(BaseCommand):
    help = HELP_TEXT

    base = settings.PROJECT_PATH
    root = '//www.niehs.nih.gov'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            dest='forceDownload',
            default=False,
            help='Force re-downloading of templates',
        )

    def force_absolute(self, text):
        # Can't use beautiful-soup parser because these are incomplete
        # resources w/ tags missing. Therefore, we do a simple replace
        text = text\
            .replace('src="/resources', 'src="{}/resources'.format(self.root))\
            .replace('href="/index.cfm', 'href="//{}/index.cfm'.format(self.root))\
            .replace('href="/about', 'href="{}/about'.format(self.root))
        return text

    def get_menu(self):
        # get menu from similar tool
        url = 'http://tools.niehs.nih.gov/maps/index.cfm'
        resp = requests.get(url)

        # parse html and extract only menu
        soup = BeautifulSoup(resp.text, "html.parser")
        menu = soup.find(id="menu")

        # relabel one option
        selected = menu.find('li', class_='this active').find('span')
        selected.string = "ORIO"

        # write to file
        path = os.path.join(self.base, 'templates', 'niehs', 'menu.html')
        with open(path, 'w') as f:
            f.write(menu.prettify())

    def write_html_file(self, url, filename):
        path = os.path.join(self.base, 'templates', 'niehs', filename)
        resp = requests.get(url)
        text = self.force_absolute(resp.text)
        with open(path, 'w') as f:
            f.write(text)

    def download(self):
        urls = [
            'http://www.niehs.nih.gov/components/pullheaderfooter.cfc?method=getHeaderCode',  # noqa
            'http://www.niehs.nih.gov/components/pullheaderfooter.cfc?method=getFooterCode',  # noqa
            'http://www.niehs.nih.gov/components/pullheaderfooter.cfc?method=getAssets',  # noqa
        ]
        self.write_html_file(urls[0], 'header.html')
        self.write_html_file(urls[1], 'footer.html')
        self.write_html_file(urls[2], 'assets.html')
        self.get_menu()

    def file_exists(self):
        path = os.path.join(self.base, 'templates', 'niehs', 'header.html')
        return os.path.exists(path)

    def handle(self, *args, **options):
        if not self.file_exists() or options['forceDownload']:
            self.download()
