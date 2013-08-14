# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Character.insight'
        db.add_column(u'mendigames_character', 'insight',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)

        # Adding field 'Character.perception'
        db.add_column(u'mendigames_character', 'perception',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)

        # Adding field 'Character.ac'
        db.add_column(u'mendigames_character', 'ac',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)

        # Adding field 'Character.fort'
        db.add_column(u'mendigames_character', 'fort',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)

        # Adding field 'Character.refl'
        db.add_column(u'mendigames_character', 'refl',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)

        # Adding field 'Character.will'
        db.add_column(u'mendigames_character', 'will',
                      self.gf('django.db.models.fields.IntegerField')(default=10),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Character.insight'
        db.delete_column(u'mendigames_character', 'insight')

        # Deleting field 'Character.perception'
        db.delete_column(u'mendigames_character', 'perception')

        # Deleting field 'Character.ac'
        db.delete_column(u'mendigames_character', 'ac')

        # Deleting field 'Character.fort'
        db.delete_column(u'mendigames_character', 'fort')

        # Deleting field 'Character.refl'
        db.delete_column(u'mendigames_character', 'refl')

        # Deleting field 'Character.will'
        db.delete_column(u'mendigames_character', 'will')


    models = {
        u'mendigames.campaign': {
            'Meta': {'object_name': 'Campaign'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'round': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'turn': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.category': {
            'Meta': {'ordering': "['name']", 'object_name': 'Category'},
            'abbr': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '4'}),
            'drop': ('django.db.models.fields.IntegerField', [], {'default': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '20'})
        },
        u'mendigames.character': {
            'Meta': {'ordering': "['-init', '-sub_init', 'name']", 'object_name': 'Character'},
            'ac': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'campaign': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Campaign']"}),
            'container': ('django.db.models.fields.related.OneToOneField', [], {'blank': 'True', 'related_name': "'character'", 'unique': 'True', 'null': 'True', 'to': u"orm['mendigames.Container']"}),
            'experience_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'fort': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '6'}),
            'hit_points': ('django.db.models.fields.IntegerField', [], {'default': '30'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'init': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'insight': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'milestones': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'monster': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Monster']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'perception': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'refl': ('django.db.models.fields.IntegerField', [], {'default': '10'}),
            'sub_init': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'Player'", 'max_length': '7'}),
            'used_action_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_hit_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'will': ('django.db.models.fields.IntegerField', [], {'default': '10'})
        },
        u'mendigames.condition': {
            'Meta': {'ordering': "['name']", 'object_name': 'Condition'},
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.container': {
            'Meta': {'object_name': 'Container'},
            'campaign': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Campaign']", 'null': 'True'}),
            'gold': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60', 'blank': 'True'})
        },
        u'mendigames.hascondition': {
            'Meta': {'object_name': 'HasCondition'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'has_conditions'", 'to': u"orm['mendigames.Character']"}),
            'condition': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Condition']"}),
            'ends': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'started_init': ('django.db.models.fields.IntegerField', [], {'blank': 'True'}),
            'started_round': ('django.db.models.fields.IntegerField', [], {'blank': 'True'})
        },
        u'mendigames.haspower': {
            'Meta': {'ordering': "['-power__usage', 'power__level', 'power__name']", 'unique_together': "(('character', 'power'),)", 'object_name': 'HasPower'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'has_powers'", 'to': u"orm['mendigames.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'power': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Power']"}),
            'used': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'mendigames.item': {
            'Meta': {'object_name': 'Item'},
            'amount': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'container': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'to': u"orm['mendigames.Container']"}),
            'cost': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'magic': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'items'", 'null': 'True', 'to': u"orm['mendigames.Magic']"}),
            'mundane': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'items'", 'null': 'True', 'to': u"orm['mendigames.Mundane']"}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'weight': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        u'mendigames.m2mmagicsubtype': {
            'Meta': {'unique_together': "(('magic', 'subtype'),)", 'object_name': 'M2MMagicSubtype'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'magic': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'subtypes'", 'to': u"orm['mendigames.Magic']"}),
            'subtype': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'magics'", 'to': u"orm['mendigames.Subtype']"})
        },
        u'mendigames.magic': {
            'Meta': {'ordering': "['level', 'rarity', 'name']", 'object_name': 'Magic'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'magics'", 'to': u"orm['mendigames.Category']"}),
            'cost': ('django.db.models.fields.IntegerField', [], {'default': '0', 'blank': 'True'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'level_cost_plus': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'rarity': ('django.db.models.fields.CharField', [], {'default': "'C'", 'max_length': '1'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.monster': {
            'Meta': {'object_name': 'Monster'},
            'combat_role': ('django.db.models.fields.CharField', [], {'default': "'NO'", 'max_length': '2'}),
            'combat_role2': ('django.db.models.fields.CharField', [], {'default': "'NO'", 'max_length': '2', 'blank': 'True'}),
            'group_role': ('django.db.models.fields.CharField', [], {'default': "'SO'", 'max_length': '2'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.mundane': {
            'Meta': {'ordering': "['name']", 'object_name': 'Mundane'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'mundanes'", 'to': u"orm['mendigames.Category']"}),
            'core': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'cost': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'drop': ('django.db.models.fields.IntegerField', [], {'default': '100'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'subtype': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'mundanes'", 'to': u"orm['mendigames.Subtype']"}),
            'tags': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'weight': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.power': {
            'Meta': {'ordering': "['-usage', 'level', 'name']", 'object_name': 'Power'},
            'action': ('django.db.models.fields.CharField', [], {'default': "'ST'", 'max_length': '2'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.TraitSource']"}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'usage': ('django.db.models.fields.CharField', [], {'default': "'W'", 'max_length': '1'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.subtype': {
            'Meta': {'ordering': "['name']", 'object_name': 'Subtype'},
            'category': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'subtypes'", 'to': u"orm['mendigames.Category']"}),
            'drop': ('django.db.models.fields.IntegerField', [], {'default': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'on_empty': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'tags': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'})
        },
        u'mendigames.traitsource': {
            'Meta': {'ordering': "['source_type', 'name']", 'object_name': 'TraitSource'},
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '60'}),
            'source_type': ('django.db.models.fields.CharField', [], {'default': "'CL'", 'max_length': '2'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        }
    }

    complete_apps = ['mendigames']