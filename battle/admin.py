from django.contrib import admin
from battle.models import (Character, Power, HasPower, TraitSource,
                               Condition, HasCondition, Campaign, Item, HasItem, Book)


class HasPowerInline(admin.TabularInline):
    model = HasPower


class PowerInline(admin.TabularInline):
    model = Power
    fields = ['name','usage','action','level']


class HasItemInline(admin.TabularInline):
    model = HasItem


class HasConditionInline(admin.TabularInline):
    model = HasCondition


class CharacterAdmin(admin.ModelAdmin):
    inlines = [HasConditionInline, HasPowerInline, HasItemInline]


class CharacterInline(admin.TabularInline):
    model = Character


class CampaignAdmin(admin.ModelAdmin):
    inlines = [CharacterInline]


class PowerAdmin(admin.ModelAdmin):
    pass


class ConditionAdmin(admin.ModelAdmin):
    pass


class ItemAdmin(admin.ModelAdmin):
    pass


class BookAdmin(admin.ModelAdmin):
    pass


class TraitSourceAdmin(admin.ModelAdmin):
    inlines = [PowerInline]
    filter_horizontal = ['books']


admin.site.register(Character, CharacterAdmin)
admin.site.register(Campaign, CampaignAdmin)
admin.site.register(Power, PowerAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Book, BookAdmin)
admin.site.register(Condition, ConditionAdmin)
admin.site.register(TraitSource, TraitSourceAdmin)
