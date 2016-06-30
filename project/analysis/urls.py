from django.conf.urls import include, url
from rest_framework.routers import DefaultRouter

from . import api, views

router = DefaultRouter()
router.register('analysis',
                api.AnalysisViewset,
                base_name='analysis')
router.register('user-dataset',
                api.UserDatasetViewset,
                base_name='user-dataset')
router.register('encode-dataset',
                api.EncodeDatasetViewset,
                base_name='encode-dataset')
router.register('feature-list',
                api.FeatureListViewset,
                base_name='feature-list')
router.register('sort-vector',
                api.SortVectorViewset,
                base_name='sort-vector')
router.register('feature-list-count-matrix',
                api.FeatureListCountMatrixViewset,
                base_name="flcm")


urlpatterns = [

    url(r'^api/',
        include(router.urls, namespace='api')),

    url(r'^$',
        views.Dashboard.as_view(),
        name='dashboard'),

    url(r'^poll-messages/$',
        views.ShortPollMessages.as_view(),
        name='poll_messages'),

    url(r'^manage-data/$',
        views.ManageData.as_view(),
        name='manage_data'),

    # analysis CRUD
    url(r'^analysis/create/$',
        views.AnalysisCreate.as_view(),
        name='analysis_create'),

    url(r'^analysis/(?P<pk>\d+)/$',
        views.AnalysisDetail.as_view(),
        name='analysis'),

    url(r'^analysis/(?P<pk>\d+)/update/$',
        views.AnalysisUpdate.as_view(),
        name='analysis_update'),

    # analysis non-CRUD
    url(r'^analysis/(?P<pk>\d+)/delete/$',
        views.AnalysisDelete.as_view(),
        name='analysis_delete'),

    url(r'^analysis/(?P<pk>\d+)/visual/$',
        views.AnalysisVisual.as_view(),
        name='analysis_visual'),

    url(r'^analysis/(?P<pk>\d+)/zip/$',
        views.AnalysisZip.as_view(),
        name='analysis_zip'),

    url(r'^analysis/(?P<pk>\d+)/execute/$',
        views.AnalysisExecute.as_view(),
        name='analysis_execute'),

    # user dataset
    url(r'^user-dataset/create/$',
        views.UserDatasetCreate.as_view(),
        name='user_dataset_create'),

    url(r'^user-dataset/(?P<pk>\d+)/$',
        views.UserDatasetDetail.as_view(),
        name='user_dataset'),

    url(r'^user-dataset/(?P<pk>\d+)/update/$',
        views.UserDatasetUpdate.as_view(),
        name='user_dataset_update'),

    url(r'^user-dataset/(?P<pk>\d+)/delete/$',
        views.UserDatasetDelete.as_view(),
        name='user_dataset_delete'),

    # retry download dataset
    url(r'^user-dataset/(?P<pk>\d+)/retry-download/(?P<dd_pk>\d+)/$',
        views.DatasetDownloadRetry.as_view(),
        name='dataset_download_retry'),

    # feature list CRUD
    url(r'^feature-list/create/$',
        views.FeatureListCreate.as_view(),
        name='feature_list_create'),

    url(r'^feature-list/(?P<pk>\d+)/$',
        views.FeatureListDetail.as_view(),
        name='feature_list'),

    url(r'^feature-list/(?P<pk>\d+)/update/$',
        views.FeatureListUpdate.as_view(),
        name='feature_list_update'),

    url(r'^feature-list/(?P<pk>\d+)/delete/$',
        views.FeatureListDelete.as_view(),
        name='feature_list_delete'),

    # sort vector CRUD
    url(r'^sort-vector/create/$',
        views.SortVectorCreate.as_view(),
        name='sort_vector_create'),

    url(r'^sort-vector/(?P<pk>\d+)/$',
        views.SortVectorDetail.as_view(),
        name='sort_vector'),

    url(r'^sort-vector/(?P<pk>\d+)/update/$',
        views.SortVectorUpdate.as_view(),
        name='sort_vector_update'),

    url(r'^sort-vector/(?P<pk>\d+)/delete/$',
        views.SortVectorDelete.as_view(),
        name='sort_vector_delete'),

]
