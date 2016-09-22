from django.apps import AppConfig


class MyUserConfig(AppConfig):
    name = 'myuser'
    verbose_name = 'User'

    def ready(self):
        from . import signals  # noqa
