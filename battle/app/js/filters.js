'use strict';

/* Filters */
var condition_icons = {
    'Blinded': 'icon-eye-close',
    'Dazed': 'icon-camera',
    'Deafened': 'icon-volume-off',
    'Dominated': 'icon-user',
    'Dying': 'icon-arrow-down',
    'grabbed': 'icon-magnet',
    'Helpless': 'icon-flag',
    'hidden': 'icon-search',
    'Immobilized': 'icon-lock',
    'Petrified': 'icon-stop',
    'Prone': 'icon-chevron-down',
    'removed from play': 'icon-share-alt',
    'Restrained': 'icon-shopping-cart',
    'Slowed': 'icon-fast-backward',
    'Stunned': 'icon-warning-sign',
    'Surprised': 'icon-warning-sign',
    'Unconscious': 'icon-bell',
    'Weakened': 'icon-plus'
};

angular.module('battle.filters', ['battle.services']).
  filter('total_hp', function(){
    return function(character){
        return character.hit_points-character.used_hit_points;
    };
  }).
  filter('total_hs', function(){
    return function(character){
        return character.healing_surges-character.used_healing_surges;
    };
  }).
  filter('total_ap', function(){
    return function(character){
        return 1-character.used_action_points+Math.floor(character.milestones/2);
    };
  }).
  filter('condition_icon',function(){
    return function(condition){
        if(!condition)
          return;
        return condition_icons[condition.name];
    };
  }).
  filter('power_type', function(){
    return function(power){
      if(!power)
        return;
      if(power['usage']=='E')
          return "encounter";
      if(power['usage']=='D')
          return "daily";
      return 'at-will';
    };
  }).
  filter('power_style', function(){
    return function(power){
      if(!power)
        return;
      if(power['used']===true)
          return "used";
      return "available";
    };
  });

