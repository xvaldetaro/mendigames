# Create your views here.
from django.views.generic.base import TemplateView
from django.contrib.auth.models import User, Group
from rest_framework import viewsets, renderers, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from mendigames import models
from mendigames import serializers
from django.core.cache import cache


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


class ItemDecoratorPage(RevListView):
    queryset = models.ItemDecorator.objects.all()
    serializer_class = serializers.ItemDecoratorSerializer
    paginate_by = 100
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


# ItemCategory Views
class ItemCategoryList(RevListView):
    queryset = models.ItemCategory.objects.all()
    serializer_class = serializers.ItemCategorySerializer
class ItemCategoryDetail(RevDetailView):
    queryset = models.ItemCategory.objects.all()
    serializer_class = serializers.ItemCategorySerializer


# ItemGroup Views
class ItemGroupList(RevListView):
    queryset = models.ItemGroup.objects.all()
    serializer_class = serializers.ItemGroupSerializer
class ItemGroupDetail(RevDetailView):
    queryset = models.ItemGroup.objects.all()
    serializer_class = serializers.ItemGroupSerializer


# ItemTemplate Views
class ItemTemplateList(RevListView):
    queryset = models.ItemTemplate.objects.all()
    serializer_class = serializers.ItemTemplateSerializer
class ItemTemplateDetail(RevDetailView):
    queryset = models.ItemTemplate.objects.all()
    serializer_class = serializers.ItemTemplateSerializer


# ItemDecorator Views
class ItemDecoratorList(RevListView):
    queryset = models.ItemDecorator.objects.all()
    serializer_class = serializers.ItemDecoratorSerializer
class ItemDecoratorDetail(RevDetailView):
    queryset = models.ItemDecorator.objects.all()
    serializer_class = serializers.ItemDecoratorSerializer


# M2MItemDecoratorItemGroup Views
class M2MItemDecoratorItemGroupList(RevListView):
    queryset = models.M2MItemDecoratorItemGroup.objects.all()
    serializer_class = serializers.M2MItemDecoratorItemGroupSerializer
class M2MItemDecoratorItemGroupDetail(RevDetailView):
    queryset = models.M2MItemDecoratorItemGroup.objects.all()
    serializer_class = serializers.M2MItemDecoratorItemGroupSerializer


# Item Views
class ItemList(RevListView):
    queryset = models.Item.objects.all()
    serializer_class = serializers.ItemSerializer
class ItemDetail(RevDetailView):
    queryset = models.Item.objects.all()
    serializer_class = serializers.ItemSerializer
