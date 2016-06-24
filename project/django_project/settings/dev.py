import os
import sys
from django_project.settings.base import *  # noqa


INSTALLED_APPS += (
    'debug_toolbar',
)

MIDDLEWARE_CLASSES += (
    'django_cprofile_middleware.middleware.ProfilerMiddleware',
)

INTERNAL_IPS = ('127.0.0.1', )

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

LOGGING['loggers']['']['handlers'] = ['console']

USE_CELERY_IN_DEV = os.environ.get('USE_CELERY_IN_DEV', 'False') == 'True'
if USE_CELERY_IN_DEV:
    # swap cache to filebased so multiple workers can use
    CACHES['default'] = {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': os.path.join(PROJECT_ROOT, 'django_cache'),
    }
else:
    # use simpler cache
    CACHES['default']['BACKEND'] = 'django.core.cache.backends.locmem.LocMemCache'
    CELERY_ALWAYS_EAGER = True
    CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

COMPRESS_ENABLED = False

if 'test' in sys.argv:
    PASSWORD_HASHERS = (
        'django.contrib.auth.hashers.SHA1PasswordHasher',
        'django.contrib.auth.hashers.MD5PasswordHasher',
    )

# to use jupyter, `add2virtualenv .` the project path
NOTEBOOK_ARGUMENTS = [
    '--notebook-dir',
    os.path.join(PROJECT_ROOT, 'notebooks')
]
