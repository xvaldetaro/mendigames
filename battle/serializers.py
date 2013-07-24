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


class CharacterSerializer(serializers.ModelSerializer):
    has_powers = serializers.PrimaryKeyRelatedField(many=True)
    has_conditions = serializers.PrimaryKeyRelatedField(many=True)

    def save(self, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(CharacterSerializer, self).save(**kwargs)

    class Meta:
        model = Character


class CampaignSerializer(serializers.ModelSerializer):
    def save(self, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(CampaignSerializer, self).save(**kwargs)

    class Meta:
        model = Campaign


class PowerSerializer(serializers.ModelSerializer):
    def save(self, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(PowerSerializer, self).save(**kwargs)

    class Meta:
        model = Power


class ConditionSerializer(serializers.ModelSerializer):
    def save(self, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(ConditionSerializer, self).save(**kwargs)

    class Meta:
        model = Condition


class HasPowerSerializer(serializers.ModelSerializer):
    def save(self, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(HasPowerSerializer, self).save(**kwargs)

    class Meta:
        model = HasPower


class HasConditionSerializer(serializers.ModelSerializer):
    def save(self, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(HasConditionSerializer, self).save(**kwargs)

    class Meta:
        model = HasCondition
