# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'CharacterStatus.campaign'
        db.add_column(u'battle_characterstatus', 'campaign',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=1, to=orm['battle.Campaign']),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'CharacterStatus.campaign'
        db.delete_column(u'battle_characterstatus', 'campaign_id')


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
            'campaign': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['battle.Campaign']"}),
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