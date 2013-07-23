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


class CharacterSerializer(serializers.ModelSerializer):
    has_powers = serializers.PrimaryKeyRelatedField(many=True)
    has_conditions = serializers.PrimaryKeyRelatedField(many=True)
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
