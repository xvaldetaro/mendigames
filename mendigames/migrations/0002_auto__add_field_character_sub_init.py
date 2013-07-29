# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Character.sub_init'
        db.add_column(u'mendigames_character', 'sub_init',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Character.sub_init'
        db.delete_column(u'mendigames_character', 'sub_init')


    models = {
        u'mendigames.campaign': {
            'Meta': {'object_name': 'Campaign'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'round': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'turn': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.character': {
            'Meta': {'ordering': "['-init', '-sub_init', 'name']", 'object_name': 'Character'},
            'campaign': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Campaign']"}),
            'experience_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'gold': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '6'}),
            'hit_points': ('django.db.models.fields.IntegerField', [], {'default': '30'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'init': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'milestones': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'monster': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Monster']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'sub_init': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'Player'", 'max_length': '7'}),
            'used_action_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_hit_points': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        u'mendigames.condition': {
            'Meta': {'ordering': "['name']", 'object_name': 'Condition'},
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
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
        u'mendigames.hasitem': {
            'Meta': {'object_name': 'HasItem'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Item']"})
        },
        u'mendigames.haspower': {
            'Meta': {'ordering': "['-power__usage', 'power__level', 'power__name']", 'unique_together': "(('character', 'power'),)", 'object_name': 'HasPower'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'has_powers'", 'to': u"orm['mendigames.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'power': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.Power']"}),
            'used': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'mendigames.item': {
            'Meta': {'ordering': "['level', 'rarity', 'name']", 'object_name': 'Item'},
            'category': ('django.db.models.fields.CharField', [], {'default': "'ARMO'", 'max_length': '4'}),
            'cost': ('django.db.models.fields.IntegerField', [], {'default': '0', 'blank': 'True'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'level_cost_plus': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'rarity': ('django.db.models.fields.CharField', [], {'default': "'A'", 'max_length': '1'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'weight': ('django.db.models.fields.IntegerField', [], {'default': '0', 'blank': 'True'}),
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
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.power': {
            'Meta': {'ordering': "['-usage', 'level', 'name']", 'object_name': 'Power'},
            'action': ('django.db.models.fields.CharField', [], {'default': "'ST'", 'max_length': '2'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['mendigames.TraitSource']"}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'usage': ('django.db.models.fields.CharField', [], {'default': "'W'", 'max_length': '1'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'mendigames.traitsource': {
            'Meta': {'ordering': "['source_type', 'name']", 'object_name': 'TraitSource'},
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'source_type': ('django.db.models.fields.CharField', [], {'default': "'CL'", 'max_length': '2'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        }
    }

    complete_apps = ['mendigames']