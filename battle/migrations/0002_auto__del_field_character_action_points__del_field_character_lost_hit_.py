# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Character.action_points'
        db.delete_column(u'battle_character', 'action_points')

        # Deleting field 'Character.lost_hit_points'
        db.delete_column(u'battle_character', 'lost_hit_points')

        # Adding field 'Character.milestones'
        db.add_column(u'battle_character', 'milestones',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Character.used_hit_points'
        db.add_column(u'battle_character', 'used_hit_points',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Character.action_points'
        db.add_column(u'battle_character', 'action_points',
                      self.gf('django.db.models.fields.IntegerField')(default=1),
                      keep_default=False)

        # Adding field 'Character.lost_hit_points'
        db.add_column(u'battle_character', 'lost_hit_points',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Deleting field 'Character.milestones'
        db.delete_column(u'battle_character', 'milestones')

        # Deleting field 'Character.used_hit_points'
        db.delete_column(u'battle_character', 'used_hit_points')


    models = {
        u'battle.campaign': {
            'Meta': {'object_name': 'Campaign'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        },
        u'battle.character': {
            'Meta': {'object_name': 'Character'},
            'campaign': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Campaign']"}),
            'experience_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'gold': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '6'}),
            'hit_points': ('django.db.models.fields.IntegerField', [], {'default': '30'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'init': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'milestones': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'used_action_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_hit_points': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        u'battle.hasitem': {
            'Meta': {'object_name': 'HasItem'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Item']"})
        },
        u'battle.haspower': {
            'Meta': {'object_name': 'HasPower'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'power': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Power']"})
        },
        u'battle.item': {
            'Meta': {'object_name': 'Item'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'value': ('django.db.models.fields.IntegerField', [], {'default': '0', 'blank': 'True'}),
            'weight': ('django.db.models.fields.IntegerField', [], {'default': '0', 'blank': 'True'})
        },
        u'battle.power': {
            'Meta': {'object_name': 'Power'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'usage': ('django.db.models.fields.CharField', [], {'default': "'W'", 'max_length': '1'})
        },
        u'battle.usedpower': {
            'Meta': {'object_name': 'UsedPower'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'power': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Power']"})
        }
    }

    complete_apps = ['battle']