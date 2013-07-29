# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Campaign'
        db.create_table(u'battle_campaign', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(default='Unnamed', max_length=20)),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('round', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('turn', self.gf('django.db.models.fields.IntegerField')(default=1)),
        ))
        db.send_create_signal(u'battle', ['Campaign'])

        # Adding model 'Monster'
        db.create_table(u'battle_monster', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('wizards_id', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('html_description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('level', self.gf('django.db.models.fields.IntegerField')(default=1, blank=True)),
            ('group_role', self.gf('django.db.models.fields.CharField')(default='SO', max_length=2)),
            ('combat_role', self.gf('django.db.models.fields.CharField')(default='NO', max_length=2)),
            ('combat_role2', self.gf('django.db.models.fields.CharField')(default='NO', max_length=2, blank=True)),
        ))
        db.send_create_signal(u'battle', ['Monster'])

        # Adding model 'Character'
        db.create_table(u'battle_character', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('campaign', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Campaign'])),
            ('type', self.gf('django.db.models.fields.CharField')(default='Player', max_length=7)),
            ('name', self.gf('django.db.models.fields.CharField')(default='Unnamed', max_length=20)),
            ('healing_surges', self.gf('django.db.models.fields.IntegerField')(default=6)),
            ('hit_points', self.gf('django.db.models.fields.IntegerField')(default=30)),
            ('experience_points', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('gold', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('used_action_points', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('milestones', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('used_healing_surges', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('used_hit_points', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('init', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('monster', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Monster'], null=True, blank=True)),
        ))
        db.send_create_signal(u'battle', ['Character'])

        # Adding model 'TraitSource'
        db.create_table(u'battle_traitsource', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('wizards_id', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('html_description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('source_type', self.gf('django.db.models.fields.CharField')(default='CL', max_length=2)),
        ))
        db.send_create_signal(u'battle', ['TraitSource'])

        # Adding model 'Power'
        db.create_table(u'battle_power', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('wizards_id', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('html_description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('level', self.gf('django.db.models.fields.IntegerField')(default=1, blank=True)),
            ('usage', self.gf('django.db.models.fields.CharField')(default='W', max_length=1)),
            ('action', self.gf('django.db.models.fields.CharField')(default='ST', max_length=2)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.TraitSource'])),
            ('text', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'battle', ['Power'])

        # Adding model 'HasPower'
        db.create_table(u'battle_haspower', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character', self.gf('django.db.models.fields.related.ForeignKey')(related_name='has_powers', to=orm['battle.Character'])),
            ('power', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Power'])),
            ('used', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'battle', ['HasPower'])

        # Adding unique constraint on 'HasPower', fields ['character', 'power']
        db.create_unique(u'battle_haspower', ['character_id', 'power_id'])

        # Adding model 'Item'
        db.create_table(u'battle_item', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('wizards_id', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('html_description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('category', self.gf('django.db.models.fields.CharField')(default='ARMO', max_length=4)),
            ('level', self.gf('django.db.models.fields.IntegerField')(default=1, blank=True)),
            ('level_cost_plus', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('rarity', self.gf('django.db.models.fields.CharField')(default='A', max_length=1)),
            ('weight', self.gf('django.db.models.fields.IntegerField')(default=0, blank=True)),
            ('cost', self.gf('django.db.models.fields.IntegerField')(default=0, blank=True)),
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

        # Adding model 'Condition'
        db.create_table(u'battle_condition', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=60)),
            ('wizards_id', self.gf('django.db.models.fields.IntegerField')(default=1)),
            ('html_description', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal(u'battle', ['Condition'])

        # Adding model 'HasCondition'
        db.create_table(u'battle_hascondition', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('character', self.gf('django.db.models.fields.related.ForeignKey')(related_name='has_conditions', to=orm['battle.Character'])),
            ('condition', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['battle.Condition'])),
            ('ends', self.gf('django.db.models.fields.CharField')(default='T', max_length=1)),
            ('started_round', self.gf('django.db.models.fields.IntegerField')(blank=True)),
            ('started_init', self.gf('django.db.models.fields.IntegerField')(blank=True)),
        ))
        db.send_create_signal(u'battle', ['HasCondition'])


    def backwards(self, orm):
        # Removing unique constraint on 'HasPower', fields ['character', 'power']
        db.delete_unique(u'battle_haspower', ['character_id', 'power_id'])

        # Deleting model 'Campaign'
        db.delete_table(u'battle_campaign')

        # Deleting model 'Monster'
        db.delete_table(u'battle_monster')

        # Deleting model 'Character'
        db.delete_table(u'battle_character')

        # Deleting model 'TraitSource'
        db.delete_table(u'battle_traitsource')

        # Deleting model 'Power'
        db.delete_table(u'battle_power')

        # Deleting model 'HasPower'
        db.delete_table(u'battle_haspower')

        # Deleting model 'Item'
        db.delete_table(u'battle_item')

        # Deleting model 'HasItem'
        db.delete_table(u'battle_hasitem')

        # Deleting model 'Condition'
        db.delete_table(u'battle_condition')

        # Deleting model 'HasCondition'
        db.delete_table(u'battle_hascondition')


    models = {
        u'battle.campaign': {
            'Meta': {'object_name': 'Campaign'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'round': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'turn': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'battle.character': {
            'Meta': {'ordering': "['-init', 'name']", 'object_name': 'Character'},
            'campaign': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Campaign']"}),
            'experience_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'gold': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '6'}),
            'hit_points': ('django.db.models.fields.IntegerField', [], {'default': '30'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'init': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'milestones': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'monster': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Monster']", 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "'Unnamed'", 'max_length': '20'}),
            'type': ('django.db.models.fields.CharField', [], {'default': "'Player'", 'max_length': '7'}),
            'used_action_points': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_healing_surges': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'used_hit_points': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        },
        u'battle.condition': {
            'Meta': {'ordering': "['name']", 'object_name': 'Condition'},
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'battle.hascondition': {
            'Meta': {'object_name': 'HasCondition'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'has_conditions'", 'to': u"orm['battle.Character']"}),
            'condition': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Condition']"}),
            'ends': ('django.db.models.fields.CharField', [], {'default': "'T'", 'max_length': '1'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'started_init': ('django.db.models.fields.IntegerField', [], {'blank': 'True'}),
            'started_round': ('django.db.models.fields.IntegerField', [], {'blank': 'True'})
        },
        u'battle.hasitem': {
            'Meta': {'object_name': 'HasItem'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'item': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Item']"})
        },
        u'battle.haspower': {
            'Meta': {'ordering': "['-power__usage', 'power__level', 'power__name']", 'unique_together': "(('character', 'power'),)", 'object_name': 'HasPower'},
            'character': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'has_powers'", 'to': u"orm['battle.Character']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'power': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Power']"}),
            'used': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        u'battle.item': {
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
        u'battle.monster': {
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
        u'battle.power': {
            'Meta': {'ordering': "['-usage', 'level', 'name']", 'object_name': 'Power'},
            'action': ('django.db.models.fields.CharField', [], {'default': "'ST'", 'max_length': '2'}),
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'level': ('django.db.models.fields.IntegerField', [], {'default': '1', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.TraitSource']"}),
            'text': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'usage': ('django.db.models.fields.CharField', [], {'default': "'W'", 'max_length': '1'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        },
        u'battle.traitsource': {
            'Meta': {'ordering': "['source_type', 'name']", 'object_name': 'TraitSource'},
            'html_description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '60'}),
            'source_type': ('django.db.models.fields.CharField', [], {'default': "'CL'", 'max_length': '2'}),
            'wizards_id': ('django.db.models.fields.IntegerField', [], {'default': '1'})
        }
    }

    complete_apps = ['battle']