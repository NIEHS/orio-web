from django.conf.urls import url

from . import views


urlpatterns = [

    url(r'^rasterize/$',
        views.Rasterize.as_view(),
        name='rasterize'),

]
