from django.conf.urls import patterns, include, url
from django.conf import settings
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from mendigames import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^djangular/', include('djangular.urls')),

    url(r'^$', views.IndexView.as_view(), name='index'),

    url(r'^campaign/?$', views.CampaignList.as_view()),

    url(r'^campaign/(?P<pk>[0-9]+)/?$', views.CampaignDetail.as_view()),

    url(r'^character/?$', views.CharacterList.as_view()),

    url(r'^character/(?P<pk>[0-9]+)/?$', views.CharacterDetail.as_view()),

    url(r'^power/?$', views.PowerList.as_view()),

    url(r'^item/?$', views.ItemList.as_view()),

    url(r'^item/(?P<pk>[0-9]+)/?$', views.ItemDetail.as_view()),

    url(r'^power/(?P<pk>[0-9]+)/?$', views.PowerDetail.as_view()),

    url(r'^has_power/?$', views.HasPowerList.as_view()),

    url(r'^has_power/(?P<pk>[0-9]+)/?$', views.HasPowerDetail.as_view()),

    url(r'^has_item/?$', views.HasItemList.as_view()),

    url(r'^has_item/(?P<pk>[0-9]+)/?$', views.HasItemDetail.as_view()),

    url(r'^condition/?$', views.ConditionList.as_view()),

    url(r'^condition/(?P<pk>[0-9]+)/?$', views.ConditionDetail.as_view()),

    url(r'^has_condition/?$', views.HasConditionList.as_view()),

    url(r'^has_condition/(?P<pk>[0-9]+)/?$', views.HasConditionDetail.as_view()),

    url(r'^rev/?$', views.RevView.as_view()),
)
