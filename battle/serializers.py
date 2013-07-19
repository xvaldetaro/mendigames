from django.contrib.auth.models import User, Group
from django.forms.models import model_to_dict
from battle.models import (Character, Power, HasPower, HasCondition,
                               Condition, Campaign, Item, HasItem)
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


class HasConditionListingField(serializers.RelatedField):
    def to_native(self, value):
        condition = model_to_dict(value.condition)
        condition['started_round'] = value.started_round
        condition['started_init'] = value.started_init
        condition['ends'] = value.ends
        condition['has_condition_id'] = value.id
        return condition


class CharacterSerializer(serializers.ModelSerializer):
    has_powers = HasPowerListingField(many=True)
    has_conditions = HasConditionListingField(many=True)
    class Meta:
        model = Character


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign


class PowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Power


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition


class HasPowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HasPower


class HasConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HasCondition
