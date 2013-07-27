from django.contrib.auth.models import User, Group
from django.forms.models import model_to_dict
from battle.models import (Character, Power, HasPower, HasCondition,
                               Condition, Campaign, Item, HasItem)
from rest_framework import serializers
from django.core.cache import cache
import random

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class RevSerializer(serializers.ModelSerializer):
    revision_key = 'none'

    def save_revision(self):
        previous = cache.get('revision', 0)

        cache.set('previous', previous, 200000)
        revision = random.randint(1, 999999999)
        cache.set('revision', revision, 200000)
        cache.set(revision, self.revision_key, 200000)


    def save(self, **kwargs):
        self.save_revision()
        return super(RevSerializer, self).save(**kwargs)


class CharacterSerializer(RevSerializer):
    has_powers = serializers.PrimaryKeyRelatedField(many=True)
    has_conditions = serializers.PrimaryKeyRelatedField(many=True)
    revision_key = 'character'
    class Meta:
        model = Character


class CampaignSerializer(RevSerializer):
    revision_key = 'campaign'
    class Meta:
        model = Campaign


class PowerSerializer(RevSerializer):
    revision_key = 'power'
    class Meta:
        model = Power


class ConditionSerializer(RevSerializer):
    revision_key = 'condition'
    class Meta:
        model = Condition


class HasPowerSerializer(RevSerializer):
    revision_key = 'has_power'
    class Meta:
        model = HasPower


class HasConditionSerializer(RevSerializer):
    revision_key = 'has_condition'
    class Meta:
        model = HasCondition
