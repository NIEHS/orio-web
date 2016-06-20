from django.conf.urls import url
from django.core.urlresolvers import reverse_lazy

from django.contrib.auth import views as auth_views

from . import forms, views
from utils.views import never_cache


urlpatterns = [

    url(r'^register/$',
        never_cache(views.Register.as_view()),
        name='register'),

    url(r'^login/$',
        never_cache(auth_views.login),
        {'authentication_form': forms.LoginForm},
        name='login'),

    url(r'^logout/$',
        auth_views.logout,
        {'next_page': reverse_lazy('home')},
        name='logout'),

    url(r'^reset-password/$',
        never_cache(auth_views.password_reset),
        {
            'post_reset_redirect': reverse_lazy('user:password_reset_done'),
            'password_reset_form': forms.ResetPasswordEmailForm,
        },
        name='password_reset'),

    url(r'^reset-password/sent/$',
        auth_views.password_reset_done,
        name='password_reset_done'),

    url(r'^reset-password/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$',
        auth_views.password_reset_confirm,
        {
            'post_reset_redirect': reverse_lazy('user:login'),
            'set_password_form': forms.ResetPasswordForm
        },
        name='password_reset_confirm'),
]
