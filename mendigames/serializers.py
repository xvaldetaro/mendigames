from django.contrib.auth.models import User, Group
from django.forms.models import model_to_dict
from mendigames import models
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


class ThroughSerializer(RevSerializer):
    through = None
    def __init__(self, through=None, *args, **kwargs):
        if through:
            self.through = through
        return super(ThroughSerializer, self).__init__(*args, **kwargs)

    def to_native(self, value):
        if through:
            return value[through]
        return super(ThroughSerializer, self).to_native(self, value)


class CharacterSerializer(RevSerializer):
    has_powers = serializers.PrimaryKeyRelatedField(many=True)
    has_conditions = serializers.PrimaryKeyRelatedField(many=True)
    #has_items = serializers.PrimaryKeyRelatedField(many=True)
    revision_key = 'Character'
    class Meta:
        model = models.Character


class CampaignSerializer(RevSerializer):
    revision_key = 'Campaign'
    class Meta:
        model = models.Campaign


class PowerSerializer(RevSerializer):
    revision_key = 'Power'
    class Meta:
        model = models.Power


class HasPowerSerializer(RevSerializer):
    revision_key = 'HasPower'
    class Meta:
        model = models.HasPower


class ConditionSerializer(RevSerializer):
    revision_key = 'Condition'
    class Meta:
        model = models.Condition


class HasConditionSerializer(RevSerializer):
    revision_key = 'HasCondition'
    class Meta:
        model = models.HasCondition


class TraitSourceSerializer(RevSerializer):
    revision_key = 'TraitSource'
    class Meta:
        model = models.TraitSource


class MonsterSerializer(RevSerializer):
    revision_key = 'Monster'
    class Meta:
        model = models.Monster


class ItemCategorySerializer(RevSerializer):
    item_groups = serializers.PrimaryKeyRelatedField(many=True)
    item_decorators = serializers.PrimaryKeyRelatedField(many=True)
    revision_key = 'ItemCategory'
    class Meta:
        model = models.ItemCategory


class M2MItemDecoratorItemGroupSerializer(ThroughSerializer):
    revision_key = 'M2MItemDecoratorItemGroup'
    class Meta:
        model = models.M2MItemDecoratorItemGroup


class ItemGroupSerializer(RevSerializer):
    item_decorators = M2MItemDecoratorItemGroupSerializer(many=True,
        through='item_decorator')
    item_templates = serializers.PrimaryKeyRelatedField(many=True)
    revision_key = 'ItemGroup'
    class Meta:
        model = models.ItemGroup


class ItemTemplateSerializer(RevSerializer):
    revision_key = 'ItemTemplate'
    class Meta:
        model = models.ItemTemplate


class ItemDecoratorSerializer(RevSerializer):
    item_groups = M2MItemDecoratorItemGroupSerializer(many=True, through='item_group')
    revision_key = 'ItemDecorator'
    class Meta:
        model = models.ItemDecorator


class ItemSerializer(RevSerializer):
    revision_key = 'Item'
    class Meta:
        model = models.Item
