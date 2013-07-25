from django.contrib.auth.models import User, Group
from django.forms.models import model_to_dict
from battle.models import (Character, Power, HasPower, HasCondition,
                               Condition, Campaign, Item, HasItem)
from rest_framework import serializers
from django.core.cache import cache

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class RevSerializer(serializers.ModelSerializer):
    def save(self, **kwargs):
        revision = cache.get('revision')
        if not revision:
            cache.set('revision', 1, 200000)
            revision = 1
        cache.set('revision', revision+1)
        return super(RevSerializer, self).save(**kwargs)


class CharacterSerializer(RevSerializer):
    has_powers = serializers.PrimaryKeyRelatedField(many=True)
    has_conditions = serializers.PrimaryKeyRelatedField(many=True)

    class Meta:
        model = Character


class CampaignSerializer(RevSerializer):
    class Meta:
        model = Campaign


class PowerSerializer(RevSerializer):
    class Meta:
        model = Power


class ConditionSerializer(RevSerializer):
    class Meta:
        model = Condition


class HasPowerSerializer(RevSerializer):
    class Meta:
        model = HasPower


class HasConditionSerializer(RevSerializer):
    class Meta:
        model = HasCondition
