import xmltodict
from mendigames import models
from string import capwords
from fixtures import *


def lowerdash(str):
    return str.lower().replace(" ", "_")


def capcut(str):
    return capwords(str).replace(" ", "")


class wizards():
    def __init__(self, xmlpath):
        self.xmlpath = xmlpath
        self.books = {}
        self.traitSources = {}
        self.book_length = 0
        try:
            self.blankSource = models.TraitSource.objects.get(name='No Source')
        except:
            self.blankSource = models.TraitSource(name='No Source')
            self.blankSource.save()

        #for book in models.Book.objects.all():
            #self.books[book.name] = book

        for ts in models.TraitSource.objects.all():
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
        pass
        #book.save()
        #print "Saved book: %s" % book.name
        #self.books[name] = book
        #return book

    def goc_books(self, books_string):
        ret_books = []
        books = books_string.split(', ')
        # self.book_length = max(self.book_length, len(books))
        # for bookname in books:
        #     book = self.books.get(bookname)
        #     if not book:
        #         try:
        #             book = models.Book.objects.get(name=bookname)
        #         except:
        #             book = self.create_book(bookname)
        #     ret_books.append(book)
        return books

    def add_books(self, entry, object):
        pass
        #books = self.goc_books(entry['SourceBook'])
        #for book in books:
            #object.books.add(book)

    def create_trait_source(self, type_abbr, entry):
        ts = models.TraitSource(
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
                ts = models.TraitSource.objects.get(name=entry['Name'])
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

        p = models.Power(
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
                models.Power.objects.get(name=p_entry['Name'])
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

        i = models.Item(
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
                models.Item.objects.get(name=i_entry['Name'])
            except:
                self.create_item(i_entry)

    def create_monster(self, entry):
        croles = entry['CombatRole'].split(', ')
        m = models.Monster(
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
                models.Monster.objects.get(name=m_entry['Name'])
            except:
                self.create_monster(m_entry)

    def create_condition(self, entry):
        m = models.Condition(
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
                    models.Condition.objects.get(name=m_entry['Name'])
                except:
                    self.create_condition(m_entry)

    def create_baseitem(self, entry):
        cat = categories.get(entry['Category'])
        rar = self.get_rarity(entry)
        if not ((cat == 'ARMO' or cat == 'WEAP') and rar == 'A'):
            return
        i = models.TemplateItem(
            id=entry['Name'],
            category=categories.get(entry['Category']),
        )
        i.save()
        print "Created TemplateItem %s" % i.id

    def persist_baseitems(self):
        i_list = self.get_list_from_xml('item', 'item')

        for i_entry in i_list:
            books = self.goc_books(i_entry['SourceBook'])
            if "Player's Handbook" in books:
                try:
                    models.TemplateItem.objects.get(id=i_entry['Name'])
                except:
                    self.create_baseitem(i_entry)

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

    def create_templates(self, t_list, cat_abbr):
        for t in t_list:
            try:
                models.TemplateItem.objects.get(id=t)
            except:
                i = models.TemplateItem(
                    id=categories.get(v),
                    category=categories.get(v),
                )
                i.save()
                print "Created TemplateItem %s" % i.id


    def create_item_group(self, name, cat_abbr, addit_tags=None):
        try:
            models.ItemGroup.objects.get(name=name)
            print 'got', name
        except:
            tags = name
            if addit_tags:
                tags = tags+' '+addit_tags

            ig = models.ItemGroup(
                name=name,
                category=cat_abbr,
                tags=tags,
            )
            ig.save()
            print "Created ItemGroup %s" % ig.name

    def create_from_dict(self, obj_class, obj_dict, **kwargs):
        filter_dict = dict(kwargs)
        for k,v in obj_dict.iteritems():
            if type(v) != list and type(v) != dict:
                filter_dict[k] = v
        obj = None

        try:
            obj = obj_class.objects.get(name=obj_dict['name'])
        except obj_class.DoesNotExist:
            obj = obj_class(**filter_dict)
            obj.save()
            print 'saved object: %s' % obj.name
        return obj

    def persist_item_categories(self, cat_list):
        for cat_dict in cat_list:
            cat = self.create_from_dict(models.ItemCategory, cat_dict)
            groups = cat_dict['groups']
            for group_dict in groups:
                group = self.create_from_dict(models.ItemGroup, group_dict, category=cat)
                for template_dict in group_dict['templates']:
                    self.create_from_dict(models.ItemTemplate, template_dict, group=group)

w = wizards("/home/xande/Documents")
# w.persist_all_trait_sources()
# w.persist_all_powers()
# w.persist_items()
# w.persist_monsters()
# w.persist_baseitems()
# w.persist_templateitems_base('item', 'item', 'Category')
# w.persist_conditions()
w.persist_item_categories(categories)


#w.print_dict_choices('creature', 'monster', 'CombatRole', 'Unknown')
1/0
