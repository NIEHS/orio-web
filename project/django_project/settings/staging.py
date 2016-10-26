from django_project.settings.base import *  # noqa

DEBUG = bool(os.environ.get('DJANGO_FORCE_DEBUG', 'False') == 'True')
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split('|')

_admin_names = os.getenv('DJANGO_ADMIN_NAMES', '')
_admin_emails = os.getenv('DJANGO_ADMIN_EMAILS', '')
if (len(_admin_names) > 0 and len(_admin_emails) > 0):
    ADMINS = list(zip(_admin_names.split('|'), _admin_emails.split('|')))
MANAGERS = ADMINS

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

DATABASES['default']['NAME'] = os.environ.get('DB_NAME')
DATABASES['default']['USER'] = os.environ.get('DB_USER')
DATABASES['default']['PASSWORD'] = os.environ.get('DB_PASSWORD')

EMAIL_HOST = os.environ.get('DJANGO_EMAIL_HOST')
EMAIL_HOST_USER = os.environ.get('DJANGO_EMAIL_USER', None)
EMAIL_HOST_PASSWORD = os.environ.get('DJANGO_EMAIL_PASSWORD', None)
EMAIL_PORT = int(os.environ.get('DJANGO_EMAIL_PORT'))
EMAIL_USE_SSL = bool(os.environ.get('DJANGO_EMAIL_USE_SSL') == 'True')
DEFAULT_FROM_EMAIL = os.environ.get('DJANGO_DEFAULT_FROM_EMAIL')

PUBLIC_ROOT = os.environ.get('DJANGO_PUBLIC_PATH')
STATIC_ROOT = os.path.join(PUBLIC_ROOT, 'static')
MEDIA_ROOT = os.path.join(PUBLIC_ROOT, 'media')

LOGGING['handlers']['file']['filename'] = os.environ.get('DJANGO_LOG_FULLPATH')
LOGGING['handlers']['celery_file']['filename'] = os.environ.get('CELERY_LOG_FULLPATH')

BROKER_URL = os.environ.get('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

# root path to where ENCODE files are located
ENCODE_PATH = os.environ.get('ENCODE_PATH')

# to use jupyter, `add2virtualenv .` the project path
NOTEBOOK_ARGUMENTS = [
    '--no-browser',
    '--port=8765',
    '--notebook-dir',
    os.path.join(PROJECT_ROOT, 'notebooks')
]
