from django.contrib import admin
from battle.models import (Character, Power, HasPower,
                               Campaign, UsedPower, Item, HasItem)


class HasPowerInline(admin.TabularInline):
    model = HasPower


class HasItemInline(admin.TabularInline):
    model = HasItem


class UsedPowerInline(admin.TabularInline):
    model = UsedPower


class CharacterAdmin(admin.ModelAdmin):
    inlines = [HasPowerInline, HasItemInline, UsedPowerInline]


class CharacterInline(admin.TabularInline):
    model = Character


class CampaignAdmin(admin.ModelAdmin):
    inlines = [CharacterInline]


class PowerAdmin(admin.ModelAdmin):
    pass


class ItemAdmin(admin.ModelAdmin):
    pass


admin.site.register(Character, CharacterAdmin)
admin.site.register(Campaign, CampaignAdmin)
admin.site.register(Power, PowerAdmin)
admin.site.register(Item, ItemAdmin)
