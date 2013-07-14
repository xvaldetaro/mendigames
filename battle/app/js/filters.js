'use strict';

/* Filters */

angular.module('battle.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]).
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
        return 1-character.used_action_points+(2*character.milestones);
    };
  });
