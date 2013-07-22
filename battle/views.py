# Create your views here.
from django.views.generic.base import TemplateView
from django.contrib.auth.models import User, Group
from rest_framework import generics
from rest_framework import viewsets
from rest_framework.views import APIView
from battle.models import Campaign, Character, Condition, HasPower, Power, HasCondition
from battle.serializers import (UserSerializer, GroupSerializer, CharacterSerializer,
                                CampaignSerializer, PowerSerializer, HasPowerSerializer,
                                ConditionSerializer, HasConditionSerializer)


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


class CharacterList(generics.ListCreateAPIView):
    serializer_class = CharacterSerializer

    def get_queryset(self):
        queryset = Character.objects.all()
        campaign = self.request.QUERY_PARAMS.get('campaignId', None)
        if campaign is not None:
            queryset = queryset.filter(campaign=campaign)
        return queryset


class CharacterDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer


class CampaignList(generics.ListCreateAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer


class CampaignDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer


class PowerList(generics.ListCreateAPIView):
    serializer_class = PowerSerializer

    def get_queryset(self):
        queryset = Power.objects.all()
        if self.request.QUERY_PARAMS.get('owned', False):
            queryset = queryset.filter(haspower__isnull=False)

        return queryset


class PowerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Power.objects.all()
    serializer_class = PowerSerializer


class ConditionList(generics.ListCreateAPIView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class HasPowerList(generics.ListCreateAPIView):
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


class HasPowerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = HasPower.objects.all()
    serializer_class = HasPowerSerializer


class ConditionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class HasConditionList(generics.ListCreateAPIView):
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


class HasConditionDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = HasCondition.objects.all()
    serializer_class = HasConditionSerializer
