# Create your views here.
from django.views.generic.base import TemplateView
from django.contrib.auth.models import User, Group
from rest_framework import viewsets, renderers, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from battle.models import Campaign, Character, Condition, HasPower, Power, HasCondition
from battle.serializers import (UserSerializer, GroupSerializer, CharacterSerializer,
                                CampaignSerializer, PowerSerializer, HasPowerSerializer,
                                ConditionSerializer, HasConditionSerializer)
from django.core.cache import cache


class RevJSONRenderer(renderers.JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = {}
        response_data['data'] = data
        revision = cache.get('revision')
        if not revision:
            cache.set('revision', 1, 200000)
            revision = 1
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

    def increase_revision(self):
        revision = cache.get('revision')
        if not revision:
            cache.set('revision', 1, 200000)
            revision = 1
        cache.set('revision', revision+1)

    def delete(self, request, format=None):
        queryset = self.get_queryset()
        queryset.delete()
        self.increase_revision()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_queryset(self):
        queryset = super(RevListView, self).get_queryset()
        params = self.request.QUERY_PARAMS
        pyparams = {}
        for k,v in params.iteritems():
            pyv = v
            try:
                pyv = int(v)
            except:
                if v == 'true':
                    pyv = True
                elif v == 'false':
                    pyv = False
            pyparams[k] = pyv

        return queryset.filter(**pyparams)

    def post(self, request, *args, **kwargs):
        many = False
        try:
            self.request.QUERY_PARAMS['many']
            many = True
        except:
            pass
        serializer = self.get_serializer(data=request.DATA, many=many, files=request.FILES)

        if serializer.is_valid():
            self.pre_save(serializer.object)
            self.object = serializer.save(force_insert=True)
            self.post_save(self.object, created=True)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED,
                            headers=headers)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, format=None):
        data = self.request.DATA
        queryset = self.get_queryset()
        queryset.update(**data)
        self.increase_revision()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RevDetailView(generics.RetrieveUpdateDestroyAPIView):
    renderer_classes = (RevJSONRenderer,)

    def destroy(self, request, *args, **kwargs):
        revision = cache.get('revision')
        if not revision:
            cache.set('revision', 1, 200000)
            revision = 1
        cache.set('revision', revision+1)
        return super(RevDetailView, self).destroy(request, *args, **kwargs)


class RevView(APIView):
    def get(self, request, format=None):
        return Response({'revision': cache.get('revision')})


class CharacterList(RevListView):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer


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
    queryset = Power.objects.all()
    serializer_class = PowerSerializer


class PowerDetail(RevDetailView):
    queryset = Power.objects.all()
    serializer_class = PowerSerializer


class ConditionList(RevListView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class HasPowerList(RevListView):
    queryset = HasPower.objects.all()
    serializer_class = HasPowerSerializer


class HasPowerDetail(RevDetailView):
    queryset = HasPower.objects.all()
    serializer_class = HasPowerSerializer


class ConditionDetail(RevDetailView):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class HasConditionList(RevListView):
    queryset = HasCondition.objects.all()
    serializer_class = HasConditionSerializer


class HasConditionDetail(RevDetailView):
    queryset = HasCondition.objects.all()
    serializer_class = HasConditionSerializer
