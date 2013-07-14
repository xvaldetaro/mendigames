from django.conf.urls import patterns, url, include
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns

from battle import views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)

urlpatterns = patterns(
    '',

    url(r'^$', views.IndexView.as_view(), name='index'),

    url(r'^campaign/?$', views.CampaignList.as_view()),

    url(r'^campaign/(?P<pk>[0-9]+)/?$', views.CampaignDetail.as_view()),

    url(r'^character/?$', views.CharacterList.as_view()),

    url(r'^character/(?P<pk>[0-9]+)/?$', views.CharacterDetail.as_view()),
)

urlpatterns = format_suffix_patterns(urlpatterns)
