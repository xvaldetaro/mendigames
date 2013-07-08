from tastypie.resources import ModelResource
from battle.models import (Character, CharacterStatus, Power, HasPower,
                               Campaign, UsedPower, Item, HasItem)


class CampaignResource(ModelResource):
    class Meta:
        queryset = Campaign.objects.all()
        resource_name = 'campaign'
