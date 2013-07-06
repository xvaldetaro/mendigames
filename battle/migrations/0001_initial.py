# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Character'
        db.create_table(u'battle_character', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(default='Unnamed', max_length=20)),
            ('action_points', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('healing_surges', self.gf('django.db.models.fields.IntegerField')(default=6)),
            ('hit_points', self.gf('django.db.models.fields.IntegerField')(default=30)),
            ('experience_points', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('gold', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'battle', ['Character'])

        # Adding model 'Campaign'
        db.create_table(u'battle_campaign', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(default='Unnamed', max_length=20)),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'battle', ['Campaign'])

        # Adding model 'CharacterStatus'
        db.create_table(u'battle_characterstatus', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Character'])),
            ('used_action_points', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('used_healing_surges', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('lost_hit_points', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'battle', ['CharacterStatus'])

        # Adding model 'Power'
        db.create_table(u'battle_power', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('usage', self.gf('django.db.models.fields.CharField')(default='W', max_length=1)),
            ('level', self.gf('django.db.models.fields.IntegerField')(default=1, blank=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'battle', ['Power'])

        # Adding model 'HasPower'
        db.create_table(u'battle_haspower', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Character'])),
            ('power', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Power'])),
        ))
        db.send_create_signal(u'battle', ['HasPower'])

        # Adding model 'UsedPower'
        db.create_table(u'battle_usedpower', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character_instance', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.CharacterStatus'])),
            ('power', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Power'])),
        ))
        db.send_create_signal(u'battle', ['UsedPower'])

        # Adding model 'Item'
        db.create_table(u'battle_item', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('weight', self.gf('django.db.models.fields.IntegerField')(default=0, blank=True)),
            ('value', self.gf('django.db.models.fields.IntegerField')(default=0, blank=True)),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'battle', ['Item'])

        # Adding model 'HasItem'
        db.create_table(u'battle_hasitem', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Character'])),
            ('item', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Item'])),
        ))
        db.send_create_signal(u'battle', ['HasItem'])


    def backwards(self, orm):
        # Deleting model 'Character'
        db.delete_table(u'battle_character')

        # Deleting model 'Campaign'
        db.delete_table(u'battle_campaign')

        # Deleting model 'CharacterStatus'
        db.delete_table(u'battle_characterstatus')

        # Deleting model 'Power'
        db.delete_table(u'battle_power')

        # Deleting model 'HasPower'
        db.delete_table(u'battle_haspower')

        # Deleting model 'UsedPower'
        db.delete_table(u'battle_usedpower')

        # Deleting model 'Item'
        db.delete_table(u'battle_item')

        # Deleting model 'HasItem'
        db.delete_table(u'battle_hasitem')


    models = {
        u'battle.campaign': {
            'Meta': {'object_name': 'Campaign'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'})
        },
        u'battle.character': {
            'Meta': {'object_name': 'Character'},
            'action_points': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'experience_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'gold': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '6'}),
            'hit_points': ('django.db.models.fields.IntegerField', [], {'default': '30'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'})
        },
        u'battle.characterstatus': {
            'Meta': {'object_name': 'CharacterStatus'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lost_hit_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_action_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '0'})
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
            'character_instance': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.CharacterStatus']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'power': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Power']"})
        }
    }

    complete_apps = ['battle']