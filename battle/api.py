from tastypie.resources import ModelResource
from mendigames.models import (Character, CharacterStatus, Power, HasPower,
                               UsedPower, Item, HasItem)


class CharacterResource(ModelResource):
    class Meta:
        queryset = Character.objects.all()
        resource_name = 'character'
