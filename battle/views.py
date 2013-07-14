# Create your views here.
from django.views.generic.base import TemplateView
from django.contrib.auth.models import User, Group
from rest_framework import generics
from rest_framework import viewsets
from battle.models import Campaign, Character
from battle.serializers import (UserSerializer, GroupSerializer, CharacterSerializer,
                                CampaignSerializer)


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
            queryset = Character.objects.filter(campaign=campaign)
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
