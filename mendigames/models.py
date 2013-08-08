from django.db import models


class Campaign(models.Model):
    name = models.CharField(max_length=20, default='Unnamed')
    text = models.TextField(blank=True)
    round = models.IntegerField(default=1)
    turn = models.IntegerField(default=1)

    def __unicode__(self):
        return self.name


class BookEntry(models.Model):
    name = models.CharField(max_length=60, unique=True)
    wizards_id = models.IntegerField(default=1)
    html_description = models.TextField(blank=True)
    class Meta:
        abstract = True


class Monster(BookEntry):
    GROUP_ROLE = (
        ('MI', 'Minion'),
        ('SO', 'Solo'),
        ('CO', 'Conjured'),
        ('EL', 'Elite'),
        ('ST', 'Standard'),
    )
    COMBAT_ROLE = (
        ('LU', 'Lurker'),
        ('SK', 'Skirmisher'),
        ('AR', 'Artillery'),
        ('NO', 'No Role'),
        ('BR', 'Brute'),
        ('SO', 'Soldier'),
        ('CO', 'Controller'),
        ('LE', 'Leader'),
    )
    level = models.IntegerField(default=1, blank=True)
    group_role = models.CharField(max_length=2, choices=GROUP_ROLE, default='SO')
    combat_role = models.CharField(max_length=2, choices=COMBAT_ROLE, default='NO')
    combat_role2 = models.CharField(max_length=2, blank=True, choices=COMBAT_ROLE, default='NO')


class Container(models.Model):
    name = models.CharField(max_length=60, blank=True)
    campaign = models.ForeignKey(Campaign, null=True)
    gold = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

class Character(models.Model):
    TYPES = (('Player', 'Player'), ('Enemy', 'Enemy'), ('Neutral', 'Neutral'))
    campaign = models.ForeignKey(Campaign)
    container = models.OneToOneField(Container, null=True, blank=True, 
        related_name='character')

    type = models.CharField(max_length=7, choices=TYPES, default='Player')
    name = models.CharField(max_length=20, default='Unnamed')
    healing_surges = models.IntegerField(default=6)
    hit_points = models.IntegerField(default=30)

    experience_points = models.IntegerField(default=0)

    used_action_points = models.IntegerField(default=0)
    milestones = models.IntegerField(default=0)
    used_healing_surges = models.IntegerField(default=0)
    used_hit_points = models.IntegerField(default=0)
    init = models.IntegerField(default=0)
    sub_init = models.IntegerField(default=0)

    monster = models.ForeignKey(Monster, blank=True, null=True)

    def __unicode__(self):
        return "%s - in Campaign %s" % (self.name, self.campaign)

    class Meta:
        ordering = ['-init', '-sub_init', 'name']


class TraitSource(BookEntry):
    SOURCE_TYPE = (('BA', 'Background'),
                  ('TH', 'Theme'),
                  ('CL', 'Class'),
                  ('ED', 'Epic Destiny'),
                  ('PP', 'Paragon Path'),
                  ('RA', 'Race'))

    source_type = models.CharField(max_length=2, choices=SOURCE_TYPE, default='CL')

    def __unicode__(self):
        return "%s: %s" % (self.source_type, self.name)

    class Meta:
        ordering = ['source_type', 'name']


class Power(BookEntry):
    USAGE = (('W', 'At-Will'), ('E', 'Encounter'), ('D', 'Daily'))
    ACTION = (('FR', "Free"),
             ('II', "Immediate Interrupt"),
             ('IR', 'Immediate Reaction'),
             ('MI', 'Minor'),
             ('MO', 'Move'),
             ('NA', 'No Action'),
             ('OP', 'Opportunity'),
             ('ST', 'Standard'))

    level = models.IntegerField(default=1, blank=True)
    usage = models.CharField(max_length=1, choices=USAGE, default='W')
    action = models.CharField(max_length=2, choices=ACTION, default='ST')
    source = models.ForeignKey(TraitSource)
    text = models.TextField(blank=True)

    class Meta:
        ordering = ['-usage', 'level', 'name']

    def __unicode__(self):
        return self.name


class HasPower(models.Model):
    character = models.ForeignKey(Character, related_name="has_powers")
    power = models.ForeignKey(Power)
    used = models.BooleanField(default=False)

    class Meta:
        unique_together = (("character", "power"),)
        ordering = ['-power__usage', 'power__level', 'power__name']

    def __unicode__(self):
        return self.power


class Category(models.Model):
    name = models.CharField(max_length=20)
    abbr = models.CharField(max_length=4, unique=True)
    drop = models.IntegerField(default=100)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Subtype(models.Model):
    name = models.CharField(max_length=30)
    category = models.ForeignKey(Category, related_name='subtypes')
    tags = models.CharField(max_length=30, blank=True)
    drop = models.IntegerField(default=100)
    on_empty = models.BooleanField(default=False)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Mundane(BookEntry):
    category = models.ForeignKey(Category, related_name='mundanes')
    weight = models.IntegerField(default=0)
    subtype = models.ForeignKey(Subtype, related_name='mundanes')
    drop = models.IntegerField(default=100)
    tags = models.CharField(max_length=30, blank=True)
    core = models.BooleanField(default=True)
    cost = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Magic(BookEntry):
    RARITY = (
        ('C', 'Common'),
        ('U', 'Uncommon'),
        ('R', 'Rare')
    )
    category = models.ForeignKey(Category, related_name='magics')
    level = models.IntegerField(default=1, blank=True)
    level_cost_plus = models.BooleanField(default=False)
    rarity = models.CharField(max_length=1, choices=RARITY, default='C')
    cost = models.IntegerField(default=0, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['level', 'rarity', 'name']


class M2MMagicSubtype(models.Model):
    magic = models.ForeignKey(Magic, related_name="subtypes")
    subtype = models.ForeignKey(Subtype, related_name="magics")
    class Meta:
        unique_together = (("magic", "subtype"),)


class Item(models.Model):
    container = models.ForeignKey(Container, related_name="items")
    magic = models.ForeignKey(Magic, null=True, blank=True, related_name='items')
    mundane = models.ForeignKey(Mundane, null=True, related_name='items')
    weight = models.IntegerField(default=0)
    name = models.CharField(max_length=60)
    cost = models.IntegerField(default=0)
    level = models.IntegerField(default=0)
    amount = models.IntegerField(default=1)

    def __unicode__(self):
        return self.name


class Condition(BookEntry):
    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ['name']


class HasCondition(models.Model):
    ENDS = (("T", 'Turn'), ('S', 'Save'))
    character = models.ForeignKey(Character, related_name="has_conditions")
    condition = models.ForeignKey(Condition)
    ends = models.CharField(max_length=1, choices=ENDS, default='T')
    started_round = models.IntegerField(blank=True)
    started_init = models.IntegerField(blank=True)

    def __unicode__(self):
        return self.condition
