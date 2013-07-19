'use strict';

/* Filters */

angular.module('battle.filters', ['battle.services']).
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
        return 1-character.used_action_points+Math.floor(character.milestones/2);
    };
  }).
  // HTML FORMATTING FILTERS
  filter('activate_icon', function(){
    return function(has_power){
        return "search";
    };
  }).
  filter('active_string', function(){
    return function(activeTab, definition_tab){
        if(activeTab==definition_tab)
            return "active";

        return "inactive";
    };
  }).
  filter('hidden_on', function(){
    return function(value, on){
        if(value==on)
            return 'hidden';

        return "";
    };
  }).
  filter('condition_icon', ['ConditionIcon',function(ConditionIcon){
    return function(condition){
        return ConditionIcon(condition);
    };
  }]).
  filter('hidden_string', function(){
    return function(activeTab, definition_tab){
        if(activeTab==definition_tab)
            return definition_tab;

        return "hidden";
    };
  }).
  filter('power_type', function(){
    return function(power){
        if(power['usage']=='E')
            return "encounter";
        if(power['usage']=='D')
            return "daily";
        return 'at-will';
    };
  }).
  filter('power_style', function(){
    return function(power){
        if(power['used']===true)
            return "used";
        return "available";
    };
  });

