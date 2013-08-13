# Create your views here.
from django.views.generic.base import TemplateView
from django.contrib.auth.models import User, Group
from rest_framework import viewsets, renderers, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from mendigames import models
from mendigames import serializers
from django.core.cache import cache
import re


class RevJSONRenderer(renderers.JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = {}
        response_data['data'] = data
        response_data['revision'] = cache.get('revision', 0)
        response = super(RevJSONRenderer, self).render(response_data, accepted_media_type, renderer_context)
        return response


class RevListView(generics.ListCreateAPIView):
    renderer_classes = (RevJSONRenderer,)

    def delete(self, request, format=None):
        queryset = self.get_queryset()
        queryset.delete()
        self.get_serializer().save_revision()
        return Response(data={})

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
        if(pyparams.get("page", None)):
            pyparams.pop("page")
            print pyparams
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
        self.get_serializer().save_revision()
        return Response(data={})


class RevDetailView(generics.RetrieveUpdateDestroyAPIView):
    renderer_classes = (RevJSONRenderer,)

    def destroy(self, request, *args, **kwargs):
        self.get_serializer().save_revision()
        super(RevDetailView, self).destroy(request, *args, **kwargs)
        return Response(data={})


class RevView(APIView):
    def get(self, request, format=None):
        revision = cache.get('revision', 0)
        previous = cache.get('previous', 0)
        return Response({
            'revision': revision,
            'previous': previous,
            'revisionUpdate': cache.get(revision, ''),
        })

#### DRF Views
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer


#### Mendigames views #######
class IndexView(TemplateView):
    template_name = 'mendigames/index.html'


class SummaryView(APIView):
    def post(self, request, format=None):
        text = request.DATA['summary']
        names = re.findall("""[\w'\d\s]+\:\s((?:[\w'\d]+\s*)+)(?:\n|$)""", text)
        powers = []
        for name in names:
            try:
                p = models.Power.objects.get(name=name)
                powers.append(p)
            except:
                pass
        serializer = serializers.PowerSerializer(powers, many=True)
        return Response(serializer.data)


class MagicPage(RevListView):
    queryset = models.Magic.objects.all()
    serializer_class = serializers.MagicSerializer
    paginate_by = 100
    paginate_by_param = 'page_size'


class PowerPage(RevListView):
    queryset = models.Power.objects.all()
    serializer_class = serializers.PowerSerializer
    paginate_by = 20
    paginate_by_param = 'page_size'


# Character Views
class CharacterList(RevListView):
    queryset = models.Character.objects.all()
    serializer_class = serializers.CharacterSerializer
class CharacterDetail(RevDetailView):
    queryset = models.Character.objects.all()
    serializer_class = serializers.CharacterSerializer


# Campaign Views
class CampaignList(RevListView):
    queryset = models.Campaign.objects.all()
    serializer_class = serializers.CampaignSerializer
class CampaignDetail(RevDetailView):
    queryset = models.Campaign.objects.all()
    serializer_class = serializers.CampaignSerializer


# Power Views
class PowerList(RevListView):
    queryset = models.Power.objects.all()
    serializer_class = serializers.PowerSerializer
class PowerDetail(RevDetailView):
    queryset = models.Power.objects.all()
    serializer_class = serializers.PowerSerializer


# HasPower Views
class HasPowerList(RevListView):
    queryset = models.HasPower.objects.all()
    serializer_class = serializers.HasPowerSerializer
class HasPowerDetail(RevDetailView):
    queryset = models.HasPower.objects.all()
    serializer_class = serializers.HasPowerSerializer


# Condition Views
class ConditionList(RevListView):
    queryset = models.Condition.objects.all()
    serializer_class = serializers.ConditionSerializer
class ConditionDetail(RevDetailView):
    queryset = models.Condition.objects.all()
    serializer_class = serializers.ConditionSerializer


# HasCondition Views
class HasConditionList(RevListView):
    queryset = models.HasCondition.objects.all()
    serializer_class = serializers.HasConditionSerializer
class HasConditionDetail(RevDetailView):
    queryset = models.HasCondition.objects.all()
    serializer_class = serializers.HasConditionSerializer


# TraitSource Views
class TraitSourceList(RevListView):
    queryset = models.TraitSource.objects.all()
    serializer_class = serializers.TraitSourceSerializer
class TraitSourceDetail(RevDetailView):
    queryset = models.TraitSource.objects.all()
    serializer_class = serializers.TraitSourceSerializer


# Monster Views
class MonsterList(RevListView):
    queryset = models.Monster.objects.all()
    serializer_class = serializers.MonsterSerializer
class MonsterDetail(RevDetailView):
    queryset = models.Monster.objects.all()
    serializer_class = serializers.MonsterSerializer


# Container Views
class ContainerList(RevListView):
    queryset = models.Container.objects.all()
    serializer_class = serializers.ContainerSerializer
class ContainerDetail(RevDetailView):
    queryset = models.Container.objects.all()
    serializer_class = serializers.ContainerSerializer


# Category Views
class CategoryList(RevListView):
    queryset = models.Category.objects.all()
    serializer_class = serializers.CategorySerializer
class CategoryDetail(RevDetailView):
    queryset = models.Category.objects.all()
    serializer_class = serializers.CategorySerializer


# Subtype Views
class SubtypeList(RevListView):
    queryset = models.Subtype.objects.all()
    serializer_class = serializers.SubtypeSerializer
class SubtypeDetail(RevDetailView):
    queryset = models.Subtype.objects.all()
    serializer_class = serializers.SubtypeSerializer


# Mundane Views
class MundaneList(RevListView):
    queryset = models.Mundane.objects.all()
    serializer_class = serializers.MundaneSerializer
class MundaneDetail(RevDetailView):
    queryset = models.Mundane.objects.all()
    serializer_class = serializers.MundaneSerializer


# Magic Views
class MagicList(RevListView):
    queryset = models.Magic.objects.all()
    serializer_class = serializers.MagicSerializer
class MagicDetail(RevDetailView):
    queryset = models.Magic.objects.all()
    serializer_class = serializers.MagicSerializer


# M2MMagicSubtype Views
class M2MMagicSubtypeList(RevListView):
    queryset = models.M2MMagicSubtype.objects.all()
    serializer_class = serializers.M2MMagicSubtypeSerializer
class M2MMagicSubtypeDetail(RevDetailView):
    queryset = models.M2MMagicSubtype.objects.all()
    serializer_class = serializers.M2MMagicSubtypeSerializer


# Item Views
class ItemList(RevListView):
    queryset = models.Item.objects.all()
    serializer_class = serializers.ItemSerializer
class ItemDetail(RevDetailView):
    queryset = models.Item.objects.all()
    serializer_class = serializers.ItemSerializer
