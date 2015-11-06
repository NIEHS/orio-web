from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import api, views

router = DefaultRouter()
router.register(r'result', api.ResultViewset, base_name="result")


urlpatterns = [

    # api
    url(r'^api/', include(router.urls, namespace="api")),


    url(r'^react/$',
        views.ReactView.as_view(),
        name='react'),

    url(r'^bokeh-plot/$',
        views.BokehPlot.as_view(),
        name='bokeh_plot'),

    url(r'^result/(?P<pk>\d+)/$',
        views.ResultDetail.as_view(),
        name="result_detail"),

    url(r'^result2/(?P<pk>\d+)/$',
        views.ResultDetail2.as_view(),
        name="result_detail2"),

]
