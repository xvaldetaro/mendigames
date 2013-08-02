from django.contrib import admin
from mendigames import models


class HasPowerInline(admin.TabularInline):
    model = models.HasPower


class PowerInline(admin.TabularInline):
    model = models.Power
    fields = ['name','usage','action','level']


class HasConditionInline(admin.TabularInline):
    model = models.HasCondition


class CharacterAdmin(admin.ModelAdmin):
    inlines = [HasConditionInline, HasPowerInline]


class CharacterInline(admin.TabularInline):
    model = models.Character


class CampaignAdmin(admin.ModelAdmin):
    inlines = [CharacterInline]


class PowerAdmin(admin.ModelAdmin):
    pass


class ConditionAdmin(admin.ModelAdmin):
    pass


class TraitSourceAdmin(admin.ModelAdmin):
    inlines = [PowerInline]


admin.site.register(models.Character, CharacterAdmin)
admin.site.register(models.Campaign, CampaignAdmin)
admin.site.register(models.Power, PowerAdmin)
admin.site.register(models.Condition, ConditionAdmin)
admin.site.register(models.TraitSource, TraitSourceAdmin)


class ItemGroupInline(admin.TabularInline):
    model = models.ItemGroup
class ItemCategoryAdmin(admin.ModelAdmin):
    inlines = [ItemGroupInline]
admin.site.register(models.ItemCategory, ItemCategoryAdmin)


class ItemTemplateInline(admin.TabularInline):
    model = models.ItemTemplate
    fields = ['name', 'weight', 'drop', 'cost', 'core']
class ItemGroupAdmin(admin.ModelAdmin):
    inlines = [ItemTemplateInline]
admin.site.register(models.ItemGroup, ItemGroupAdmin)


class ItemTemplateAdmin(admin.ModelAdmin):
    pass
admin.site.register(models.ItemTemplate, ItemTemplateAdmin)


class M2MItemDecoratorItemGroupInline(admin.TabularInline):
    model = models.M2MItemDecoratorItemGroup
class ItemDecoratorAdmin(admin.ModelAdmin):
    inlines = [M2MItemDecoratorItemGroupInline]
admin.site.register(models.ItemDecorator, ItemDecoratorAdmin)


class ItemAdmin(admin.ModelAdmin):
    pass
admin.site.register(models.Item, ItemAdmin)
