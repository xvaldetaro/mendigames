from django.conf.urls import patterns, url
from battle.views import IndexView

urlpatterns = patterns(
    '',
    url(r'^battle/$', IndexView.as_view(), name='index'),
)
