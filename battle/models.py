from django.db import models


# Create your models here.
class Character(models.Model):
    name = models.CharField(max_length=20, default='Unnamed')
    action_points = models.IntegerField(default=1)
    healing_surges = models.IntegerField(default=6)
    hit_points = models.IntegerField(default=30)

    experience_points = models.IntegerField(default=0)
    gold = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name


class Campaign(models.Model):
    name = models.CharField(max_length=20, default='Unnamed')
    text = models.TextField(blank=True)

    def __unicode__(self):
        return self.name


class CharacterStatus(models.Model):
    character = models.ForeignKey(Character)
    campaign = models.ForeignKey(Campaign)
    used_action_points = models.IntegerField(default=0)
    used_healing_surges = models.IntegerField(default=0)
    lost_hit_points = models.IntegerField(default=0)

    def __unicode__(self):
        return "%s - in Campaign %s" % (self.character, self.campaign)


class Power(models.Model):
    USAGE = (('W', 'At-Will'), ('E', 'Encounter'), ('D', 'Daily'))
    usage = models.CharField(max_length=1, choices=USAGE, default='W')
    level = models.IntegerField(default=1, blank=True)
    name = models.CharField(max_length=30)
    text = models.TextField(blank=True)

    def __unicode__(self):
        return self.name


class HasPower(models.Model):
    character = models.ForeignKey(Character)
    power = models.ForeignKey(Power)

    def __unicode__(self):
        return self.power


class UsedPower(models.Model):
    character_status = models.ForeignKey(CharacterStatus)
    power = models.ForeignKey(Power)

    def __unicode__(self):
        return self.power


class Item(models.Model):
    name = models.CharField(max_length=30)
    weight = models.IntegerField(default=0, blank=True)
    value = models.IntegerField(default=0, blank=True)
    text = models.TextField(blank=True)

    def __unicode__(self):
        return self.name


class HasItem(models.Model):
    character = models.ForeignKey(Character)
    item = models.ForeignKey(Item)

    def __unicode__(self):
        return self.item
