from bs4 import BeautifulSoup
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
            .replace('href="/resources', 'href="//{}/resources'.format(self.root))\
            .replace('href="/index.cfm', 'href="//{}/index.cfm'.format(self.root))\
            .replace('href="/about', 'href="{}/about'.format(self.root))
        return text

    def get_menu(self):
        # dogfooding
        url = 'https://www.niehs.nih.gov/research/resources/databases/orio/'
        resp = requests.get(url)

        # parse html and extract only menu
        soup = BeautifulSoup(resp.text, "html.parser")
        menu = soup.find(id="menu")

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
            'http://www.niehs.nih.gov/components/layout.cfc?method=headerasset',
            'http://www.niehs.nih.gov/components/layout.cfc?method=headermeta',
            'http://www.niehs.nih.gov/components/layout.cfc?method=header&active=research',
            'http://www.niehs.nih.gov/components/layout.cfc?method=footer',
            'http://www.niehs.nih.gov/components/layout.cfc?method=footerasset',
        ]
        self.write_html_file(urls[0], 'headerasset.html')
        self.write_html_file(urls[1], 'headermeta.html')
        self.write_html_file(urls[2], 'header.html')
        self.write_html_file(urls[3], 'footer.html')
        self.write_html_file(urls[4], 'footerasset.html')
        self.get_menu()

    def file_exists(self):
        path = os.path.join(self.base, 'templates', 'niehs', 'header.html')
        return os.path.exists(path)

    def handle(self, *args, **options):
        if not self.file_exists() or options['forceDownload']:
            self.download()
