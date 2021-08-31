FROM centos/python-38-centos7

USER root
# Create a group and user to run our app
ARG APP_USER=appuser
RUN groupadd -r ${APP_USER} && useradd --no-log-init -r -g ${APP_USER} ${APP_USER}

# Install packages needed to run your application
RUN yum update -y

RUN yum -y install libpcre3 mime-support postgresql-client nano less gcc nodejs npm curl wget

# Copy your application code to the container (make sure you create a .dockerignore file if any large files or directories should be excluded)

WORKDIR /code/project

# Copy in your requirements file
ADD requirements/${ENVIRONMENT:-dev}.txt /requirements.txt
ADD requirements/base.txt /base.txt

# OR, if you're using a directory for your requirements, copy everything (comment out the above and uncomment this if so):
# ADD requirements /requirements

RUN pip install virtualenvwrapper --upgrade
RUN python3 -m venv /code/project/.venv
RUN source /code/project/.venv/bin/activate

RUN pip install -r /requirements.txt


#ADD project/django_project/settings/local.example.py django_project/settings/local.py
#RUN cp django_project/settings/local.example.py django_project/settings/local.py
#ADD ./django_project/settings/local.example.py django_project/settings/local.py

# uWSGI will listen on this port
EXPOSE 8000

# Add any static environment variables needed by Django or your settings file here:
ENV DJANGO_SETTINGS_MODULE=project.django_project.settings.local

# Call collectstatic (customize the following line with the minimal environment variables needed for manage.py to run):
RUN DATABASE_URL='db:5432' python manage.py collectstatic --noinput

# Tell uWSGI where to find your wsgi file (change this):
ENV UWSGI_WSGI_FILE=django_project/wsgi.py

# Base uWSGI configuration (you shouldn't need to change these):
ENV UWSGI_HTTP=:8000 UWSGI_MASTER=1 UWSGI_HTTP_AUTO_CHUNKED=1 UWSGI_HTTP_KEEPALIVE=1 UWSGI_LAZY_APPS=1 UWSGI_WSGI_ENV_BEHAVIOR=holy

# Number of uWSGI workers and threads per worker (customize as needed):
ENV UWSGI_WORKERS=2 UWSGI_THREADS=4

# uWSGI static file serving configuration (customize or comment out if not needed):
ENV UWSGI_STATIC_MAP="/static/=/code/static/" UWSGI_STATIC_EXPIRES_URI="/static/.*\.[a-f0-9]{12,}\.(css|js|png|jpg|jpeg|gif|ico|woff|ttf|otf|svg|scss|map|txt) 315360000"

# Deny invalid hosts before they get to Django (uncomment and change to your hostname(s)):
ENV UWSGI_ROUTE_HOST="^(?!localhost:8000$) break:400"

# Change to a non-root user
USER ${APP_USER}:${APP_USER}

# Uncomment after creating your docker-entrypoint.sh
# ENTRYPOINT ["/code/docker-entrypoint.sh"]

# Start uWSGI
#CMD ["uwsgi", "--show-config"]
CMD ["tail", "-f", "/dev/null"]