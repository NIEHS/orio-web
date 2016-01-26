from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView

from analysis import views


urlpatterns = [

    url(r'^$',
        views.Home.as_view(),
        name='home'),

    url(r'^dashboard/',
        include('analysis.urls',
                namespace='analysis')),

    url(r'^admin/',
        include(admin.site.urls)),

    url(r'^accounts/',
        include('myuser.urls',
                namespace='user')),

]


# server media-only in debug mode
if settings.DEBUG:

    from django.views.static import serve

    urlpatterns += [
        url(r'^media/(?P<path>.*)$',
            serve,
            {'document_root': settings.MEDIA_ROOT, }),
        url(r'^403/$', TemplateView.as_view(template_name='403.html')),
        url(r'^404/$', TemplateView.as_view(template_name='404.html')),
        url(r'^500/$', TemplateView.as_view(template_name='500.html')),
    ]
