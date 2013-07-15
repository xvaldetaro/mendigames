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
    return function(active_tab, definition_tab){
        if(active_tab==definition_tab)
            return "active";

        return "inactive";
    };
  }).
  filter('hidden_string', function(){
    return function(active_tab, definition_tab){
        if(active_tab==definition_tab)
            return definition_tab;

        return "hidden";
    };
  }).
  filter('power_style', function(){
    return function(power){
        var c1 = "available", c2 = "at-will";
        if(power['used']===true)
            c1 = "used";
        if(power['usage']=='E')
            c2 = "encounter";
        if(power['usage']=='D')
            c2 = "daily";

        return c2+'-'+c1;
    };
  });

