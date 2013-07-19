import xmltodict
from battle.models import Power, Item, TraitSource, Book, Monster, Condition
from string import capwords

action_types = {
    'Free': "FR",
    "Immediate Interrupt": 'II',
    'Immediate Reaction': 'IR',
    'Minor': 'MI',
    'Move': 'MO',
    'No Action': 'NA',
    'Opportunity': 'OP',
    'Standard': 'ST',
}

ts_types = {
    'Background': 'BA',
    'Theme': 'TH',
    'Class': 'CL',
    'Epic Destiny': 'ED',
    'Paragon Path': 'PP',
    'Race': 'RA'
}

power_types = {
    'Daily': 'D',
    'Encounter': 'E',
    'At-Will': 'W'
}

categories = {
    'Armor': 'ARMO',
    'Arms': 'ARMS',
    'Item Set': 'ITEM',
    'Wondrous': 'WOND',
    'Ammunition': 'AMMU',
    'Waist': 'WAIS',
    'Alternative Reward': 'ALTE',
    'Head': 'HEAD',
    'Familiar': 'FAMI',
    'Artifact': 'ARTI',
    'Companion': 'COMP',
    'Hands': 'HAND',
    'Consumable': 'CONS',
    'Mount': 'MOUN',
    'Neck': 'NECK',
    'Weapon': 'WEAP',
    'Implement': 'IMPL',
    'Equipment': 'EQUI',
    'Alchemical Item': 'ALCH',
    'Feet': 'FEET',
    'Head and Neck': 'HEAD',
    'Ring': 'RING',
}

rarity_types = {
    'Rare': 'R',
    'Uncommon': 'U',
    'Mundane': 'A',
    'Common': 'C',
}

group_roles = {
    'Minion': 'MI',
    'Solo': 'SO',
    'Conjured': 'CO',
    'Elite': 'EL',
    'Standard': 'ST',
}

combat_roles = {
    'Lurker': 'LU',
    'Skirmisher': 'SK',
    'No role': 'NO',
    'Artillery': 'AR',
    'No Role': 'NO',
    'Brute': 'BR',
    'Soldier': 'SO',
    'Controller': 'CO',
    'Leader': 'LE',
}


def lowerdash(str):
    return str.lower().replace(" ", "_")


def capcut(str):
    return capwords(str).replace(" ", "")


class wizards():
    def __init__(self, xmlpath):
        self.xmlpath = xmlpath
        self.books = {}
        self.traitSources = {}
        try:
            self.blankSource = TraitSource.objects.get(name='No Source')
        except:
            self.blankSource = TraitSource(name='No Source')
            self.blankSource.save()

        for book in Book.objects.all():
            self.books[book.name] = book

        for ts in TraitSource.objects.all():
            self.traitSources[ts.name] = ts

    def get_level(self, entry):
        level = entry.get('Level', 0)
        if not level:
            level = "0"
        return level

    def get_list_from_xml(self, tag_name, filename):
        xmlfile = open("%s/%s.xml" % (self.xmlpath, lowerdash(filename)), "r")
        dom = xmltodict.parse(xmlfile.read())
        return dom['Data']['Results'][capcut(tag_name)]

    def create_book(self, name):
        book = Book(name=name)
        book.save()
        print "Saved book: %s" % book.name
        self.books[name] = book
        return book

    def goc_books(self, books_string):
        ret_books = []
        for bookname in books_string.split(', '):
            book = self.books.get(bookname)
            if not book:
                try:
                    book = Book.objects.get(name=bookname)
                except:
                    book = self.create_book(bookname)
            ret_books.append(book)
        return ret_books

    def add_books(self, entry, object):
        books = self.goc_books(entry['SourceBook'])
        for book in books:
            object.books.add(book)

    def create_trait_source(self, type_abbr, entry):
        ts = TraitSource(
            name=entry['Name'],
            wizards_id=entry['ID'],
            source_type=type_abbr
        )
        ts.save()
        self.add_books(entry, ts)
        print "Saved ts: %s " % ts.name
        return ts

    def goc_trait_source(self, type_abbr, entry):
        ts = self.traitSources.get(entry['Name'])
        if not ts:
            try:
                ts = TraitSource.objects.get(name=entry['Name'])
            except:
                ts = self.create_trait_source(type_abbr, entry)
            self.traitSources[entry['Name']] = ts
        return ts

    def persist_trait_sources(self, type_fullname, type_abbr):
        ts_list = self.get_list_from_xml(type_fullname, type_fullname)

        for ts_entry in ts_list:
            ts = self.goc_trait_source(type_abbr, ts_entry)

    def persist_all_trait_sources(self):
        for fullname, abb in ts_types.iteritems():
            self.persist_trait_sources(fullname, abb)

    def create_power(self, type_abbr, entry):
        ts = self.traitSources.get(entry['ClassName'], self.blankSource)

        p = Power(
            name=entry['Name'],
            wizards_id=entry['ID'],
            usage=type_abbr,
            action=action_types.get(entry['ActionType']),
            level=int(self.get_level(entry)),
            source=ts,
        )
        p.save()
        print "Created Power %s" % p.name
        self.add_books(entry, p)

    def persist_powers(self, type_fullname, type_abbr):
        p_list = self.get_list_from_xml('power', type_fullname)

        for p_entry in p_list:
            try:
                Power.objects.get(name=p_entry['Name'])
            except:
                self.create_power(type_abbr, p_entry)

    def persist_all_powers(self):
        for fullname, abbr in power_types.iteritems():
            self.persist_powers(fullname, abbr)

    def get_rarity(self, entry):
        rarity = entry.get('Rarity', 'Mundane')
        try:
            rarity = rarity_types[rarity]
        except:
            rarity = 'A'
        return rarity

    def create_item(self, entry):
        level = self.get_level(entry)
        level_plus = False
        if '+' in level:
            level_plus = True
            level.replace('+', '')

        i = Item(
            name=entry['Name'],
            wizards_id=entry['ID'],
            category=categories.get(entry['Category']),
            cost=entry['CostSort'],
            rarity=self.get_rarity(entry),
            level=entry['LevelSort'],
            level_cost_plus=level_plus,
        )
        i.save()
        print "Created Item %s" % i.name
        self.add_books(entry, i)

    def persist_items(self):
        i_list = self.get_list_from_xml('item', 'item')

        for i_entry in i_list:
            try:
                Item.objects.get(name=i_entry['Name'])
            except:
                self.create_item(i_entry)

    def create_monster(self, entry):
        croles = entry['CombatRole'].split(', ')
        m = Monster(
            name=entry['Name'][0:60],
            wizards_id=entry['ID'],
            level=self.get_level(entry),
            combat_role=combat_roles[croles[0]],
            group_role=group_roles.get(entry['GroupRole']),
        )
        if len(croles) == 2:
            m.combat_role2 = combat_roles[croles[1]]
        m.save()
        print "Created Monster %s" % m.name
        self.add_books(entry, m)

    def persist_monsters(self):
        m_list = self.get_list_from_xml('monster', 'creature')

        for m_entry in m_list:
            try:
                Monster.objects.get(name=m_entry['Name'])
            except:
                self.create_monster(m_entry)

    def create_condition(self, entry):
        m = Condition(
            name=entry['Name'][0:60],
            wizards_id=entry['ID'],
        )
        m.save()
        print "Created Condition %s" % m.name
        self.add_books(entry, m)

    def persist_conditions(self):
        m_list = self.get_list_from_xml('glossary', 'glossary')

        for m_entry in m_list:
            if m_entry['Type'] == "Rules Condition":
                try:
                    Condition.objects.get(name=m_entry['Name'])
                except:
                    self.create_condition(m_entry)

    def print_dict_choices(self, xmlfile, tag, subtag, defaults_to):
        il = self.get_list_from_xml(tag, xmlfile)
        item_types = {}
        for i in il:
            value = i.get(subtag)
            if not value:
                value = defaults_to
            if len(value.split(', ')) > 2:
                print 'TEM!'
            value = value.split(', ')[0]
            item_types[value] = value.replace(" ", "")[0:2].upper()

        tuples = "(\n"
        for category, abbr in item_types.iteritems():
            tuples += ("    ('%s', '%s'),\n" % (abbr, category))
        tuples += ")"
        print tuples

        tuples = "{\n"
        for category, abbr in item_types.iteritems():
            tuples += ("    '%s': '%s',\n" % (category, abbr))
        tuples += "}"
        print tuples

    def check_value(self, xmlfile, tag, subtag):
        il = self.get_list_from_xml(tag, xmlfile)
        biggest = 0
        bvalue = ""
        for i in il:
            value = i.get(subtag)
            if len(value) > biggest:
                biggest = len(value)
                bvalue = value

        print "Biggest is %s, with %s" % (bvalue, biggest)


w = wizards("/home/xande/Documents")
# w.persist_all_trait_sources()
# w.persist_all_powers()
# w.persist_items()
#w.persist_monsters()
#w.print_dict_choices('creature', 'monster', 'CombatRole', 'Unknown')
#w.check_value('power', 'power', 'Name')
w.persist_conditions()
