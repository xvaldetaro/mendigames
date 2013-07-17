from django.contrib.auth.models import User, Group
from django.forms.models import model_to_dict
from battle.models import (Character, Power, HasPower,
                               Campaign, Item, HasItem)
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class HasPowerListingField(serializers.RelatedField):
    def to_native(self, value):
        power = model_to_dict(value.power)
        power['used'] = value.used
        power['has_power_id'] = value.id
        return power


class CharacterSerializer(serializers.ModelSerializer):
    has_powers = HasPowerListingField(many=True)

    class Meta:
        model = Character


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign


class PowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Power


class HasPowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HasPower
