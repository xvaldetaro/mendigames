from django.conf.urls import patterns, url, include
from battle.views import IndexView
from battle.api import CampaignResource

campaign_resource = CampaignResource()

urlpatterns = patterns(
    '',
    url(r'^battle/$', IndexView.as_view(), name='index'),
    url(r'^api/', include(campaign_resource.urls)),
)
