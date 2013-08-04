from django.conf.urls import patterns, include, url
from django.conf import settings
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
    url(r'^power/(?P<pk>[0-9]+)/?$', views.PowerDetail.as_view()),

    url(r'^has_power/?$', views.HasPowerList.as_view()),
    url(r'^has_power/(?P<pk>[0-9]+)/?$', views.HasPowerDetail.as_view()),

    url(r'^condition/?$', views.ConditionList.as_view()),
    url(r'^condition/(?P<pk>[0-9]+)/?$', views.ConditionDetail.as_view()),

    url(r'^has_condition/?$', views.HasConditionList.as_view()),
    url(r'^has_condition/(?P<pk>[0-9]+)/?$', views.HasConditionDetail.as_view()),

    url(r'^container/?$', views.ContainerList.as_view()),
    url(r'^container/(?P<pk>[0-9]+)/?$', views.ContainerDetail.as_view()),

    url(r'^item/?$', views.ItemList.as_view()),
    url(r'^item/(?P<pk>[0-9]+)/?$', views.ItemDetail.as_view()),

    url(r'^category/?$', views.CategoryList.as_view()),
    url(r'^category/(?P<pk>[0-9]+)/?$', views.CategoryDetail.as_view()),

    url(r'^subtype/?$', views.SubtypeList.as_view()),
    url(r'^subtype/(?P<pk>[0-9]+)/?$', views.SubtypeDetail.as_view()),

    url(r'^mundane/?$', views.MundaneList.as_view()),
    url(r'^mundane/(?P<pk>[0-9]+)/?$', views.MundaneDetail.as_view()),

    url(r'^magic/?$', views.MagicList.as_view()),
    url(r'^magic/(?P<pk>[0-9]+)/?$', views.MagicDetail.as_view()),

    url(r'^magic_page/?$', views.MagicPage.as_view()),

    url(r'^rev/?$', views.RevView.as_view()),
)
