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


class SubtypeInline(admin.TabularInline):
    model = models.Subtype
class CategoryAdmin(admin.ModelAdmin):
    inlines = [SubtypeInline]
admin.site.register(models.Category, CategoryAdmin)


class MundaneInline(admin.TabularInline):
    model = models.Mundane
    fields = ['name', 'weight', 'drop', 'cost', 'core']
class SubtypeAdmin(admin.ModelAdmin):
    inlines = [MundaneInline]
admin.site.register(models.Subtype, SubtypeAdmin)


class MundaneAdmin(admin.ModelAdmin):
    pass
admin.site.register(models.Mundane, MundaneAdmin)


class M2MMagicSubtypeInline(admin.TabularInline):
    model = models.M2MMagicSubtype
class MagicAdmin(admin.ModelAdmin):
    inlines = [M2MMagicSubtypeInline]
admin.site.register(models.Magic, MagicAdmin)


class ItemAdmin(admin.ModelAdmin):
    pass
admin.site.register(models.Item, ItemAdmin)
