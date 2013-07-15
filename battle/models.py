from django.db import models


class Campaign(models.Model):
    name = models.CharField(max_length=20, default='Unnamed')
    text = models.TextField(blank=True)

    def __unicode__(self):
        return self.name


# Create your models here.
class Character(models.Model):
    campaign = models.ForeignKey(Campaign)

    name = models.CharField(max_length=20, default='Unnamed')
    healing_surges = models.IntegerField(default=6)
    hit_points = models.IntegerField(default=30)

    experience_points = models.IntegerField(default=0)
    gold = models.IntegerField(default=0)

    used_action_points = models.IntegerField(default=0)
    milestones = models.IntegerField(default=0)
    used_healing_surges = models.IntegerField(default=0)
    used_hit_points = models.IntegerField(default=0)
    init = models.IntegerField(default=0)

    def __unicode__(self):
        return "%s - in Campaign %s" % (self.name, self.campaign)


class Power(models.Model):
    USAGE = (('W', 'At-Will'), ('E', 'Encounter'), ('D', 'Daily'))
    usage = models.CharField(max_length=1, choices=USAGE, default='W')
    level = models.IntegerField(default=1, blank=True)
    name = models.CharField(max_length=30)
    text = models.TextField(blank=True)

    class Meta:
        ordering = ['-usage','level','name']

    def __unicode__(self):
        return self.name


class HasPower(models.Model):
    character = models.ForeignKey(Character, related_name="has_powers")
    power = models.ForeignKey(Power)
    used = models.BooleanField(default=False)

    class Meta:
        unique_together = (("character", "power"),)
        ordering = ['-power__usage','power__level','power__name']

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
