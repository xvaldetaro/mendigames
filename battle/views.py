# Create your views here.
from django.views.generic.base import TemplateView
from django.contrib.auth.models import User, Group
from rest_framework import generics
from rest_framework import viewsets, renderers
from rest_framework.views import APIView
from rest_framework.response import Response
from battle.models import Campaign, Character, Condition, HasPower, Power, HasCondition
from battle.serializers import (UserSerializer, GroupSerializer, CharacterSerializer,
                                CampaignSerializer, PowerSerializer, HasPowerSerializer,
                                ConditionSerializer, HasConditionSerializer)
from django.core.cache import cache
cache.set('revision', 1, 2592000)


class RevJSONRenderer(renderers.JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = {}
        response_data['data'] = data
        revision = cache.get('revision')
        revision = revision
        response_data['revision'] = revision
        response = super(RevJSONRenderer, self).render(response_data, accepted_media_type, renderer_context)
        return response


class IndexView(TemplateView):
    template_name = 'battle/index.html'


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class RevListView(generics.ListCreateAPIView):
    renderer_classes = (RevJSONRenderer,)


class RevDetailView(generics.RetrieveUpdateDestroyAPIView):
    renderer_classes = (RevJSONRenderer,)

    def destroy(self, request, *args, **kwargs):
        cache.set('revision', cache.get('revision')+1)
        return super(RevDetailView, self).destroy(request, *args, **kwargs)


class RevView(APIView):
    def get(self, request, format=None):
        return Response({'revision': cache.get('revision')})


class CharacterList(RevListView):
    serializer_class = CharacterSerializer
    def get_queryset(self):
        queryset = Character.objects.all()
        campaign = self.request.QUERY_PARAMS.get('campaignId', None)
        if campaign is not None:
            queryset = queryset.filter(campaign=campaign)
        return queryset


class CharacterDetail(RevDetailView):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer


class CampaignList(RevListView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer


class CampaignDetail(RevDetailView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer


class PowerList(RevListView):
    serializer_class = PowerSerializer

    def get_queryset(self):
        queryset = Power.objects.all()
        if self.request.QUERY_PARAMS.get('owned', False):
            queryset = queryset.filter(haspower__isnull=False)

        return queryset


class PowerDetail(RevDetailView):
    queryset = Power.objects.all()
    serializer_class = PowerSerializer


class ConditionList(RevListView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class HasPowerList(RevListView):
    serializer_class = HasPowerSerializer

    def get_queryset(self):
        queryset = HasPower.objects.all()
        characterId = self.request.QUERY_PARAMS.get('characterId', None)
        campaignId = self.request.QUERY_PARAMS.get('campaignId', None)
        if characterId is not None:
            queryset = queryset.filter(character=characterId)
        if campaignId is not None:
            queryset = queryset.filter(character__campaign=campaignId)
        return queryset


class HasPowerDetail(RevDetailView):
    queryset = HasPower.objects.all()
    serializer_class = HasPowerSerializer


class ConditionDetail(RevDetailView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class HasConditionList(RevListView):
    serializer_class = HasConditionSerializer

    def get_queryset(self):
        queryset = HasCondition.objects.all()
        characterId = self.request.QUERY_PARAMS.get('characterId', None)
        campaignId = self.request.QUERY_PARAMS.get('campaignId', None)
        if characterId is not None:
            queryset = queryset.filter(character=characterId)
        if campaignId is not None:
            queryset = queryset.filter(character__campaign=campaignId)
        return queryset


class HasConditionDetail(RevDetailView):
    queryset = HasCondition.objects.all()
    serializer_class = HasConditionSerializer
