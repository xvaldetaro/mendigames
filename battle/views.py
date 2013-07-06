# Create your views here.
from django.views.generic.base import TemplateView


class IndexView(TemplateView):
    template_name = 'battle/index.html'
