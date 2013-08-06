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
    has_powers = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    has_conditions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    #has_items = serializers.PrimaryKeyRelatedField(many=True)
    revision_key = 'character'
    class Meta:
        model = models.Character


class CampaignSerializer(RevSerializer):
    revision_key = 'campaign'
    class Meta:
        model = models.Campaign


class PowerSerializer(RevSerializer):
    revision_key = 'power'
    class Meta:
        model = models.Power


class HasPowerSerializer(RevSerializer):
    revision_key = 'has_power'
    class Meta:
        model = models.HasPower


class ConditionSerializer(RevSerializer):
    revision_key = 'condition'
    class Meta:
        model = models.Condition


class HasConditionSerializer(RevSerializer):
    revision_key = 'has_condition'
    class Meta:
        model = models.HasCondition


class TraitSourceSerializer(RevSerializer):
    revision_key = 'trait_source'
    class Meta:
        model = models.TraitSource


class MonsterSerializer(RevSerializer):
    revision_key = 'monster'
    class Meta:
        model = models.Monster


class CategorySerializer(RevSerializer):
    mundanes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    subtypes = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    magics = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    revision_key = 'category'
    class Meta:
        model = models.Category


class M2MMagicSubtypeSerializer(ThroughSerializer):
    revision_key = 'm2m_magic_subtype'
    class Meta:
        model = models.M2MMagicSubtype


class ContainerSerializer(RevSerializer):
    items = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    character = serializers.PrimaryKeyRelatedField(required=False, read_only=True)
    revision_key = 'container'
    class Meta:
        model = models.Container


class SubtypeSerializer(RevSerializer):
    magics = M2MMagicSubtypeSerializer(many=True,
        through='magic', required=False, read_only=True)
    mundanes = serializers.PrimaryKeyRelatedField(many=True)
    revision_key = 'subtype'
    class Meta:
        model = models.Subtype


class MundaneSerializer(RevSerializer):
    revision_key = 'mundane'
    class Meta:
        model = models.Mundane


class MagicSerializer(RevSerializer):
    subtypes = M2MMagicSubtypeSerializer(many=True, through='subtype', 
        required=False, read_only=True)
    revision_key = 'magic'
    class Meta:
        model = models.Magic


class ItemSerializer(RevSerializer):
    revision_key = 'item'
    class Meta:
        model = models.Item
