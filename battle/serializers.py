from django.contrib.auth.models import User, Group
from battle.models import (Character, Power, HasPower,
                               Campaign, UsedPower, Item, HasItem)
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
    class Meta:
        model = Character


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
