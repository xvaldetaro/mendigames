from tastypie import fields
from tastypie.resources import ModelResource
from battle.models import (Character, CharacterStatus, Power, HasPower,
                               Campaign, UsedPower, Item, HasItem)


class CharacterResource(ModelResource):
    class Meta:
        queryset = Character.objects.all()
        resource_name = 'character'


class CampaignResource(ModelResource):
    character_status = fields.ToManyField(
        'battle.api.CharacterStatusResource', 'character_status',
        related_name='campaign', null=True, blank=True, full_list=True
    )

    class Meta:
        queryset = Campaign.objects.all()
        resource_name = 'campaign'


class CharacterStatusResource(ModelResource):
    character = fields.ToOneField(CharacterResource, 'character')
    campaign = fields.ToOneField(CampaignResource, 'campaign')

    class Meta:
        queryset = CharacterStatus.objects.all()
        resource_name = 'character_status'
