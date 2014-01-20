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

angular.module('mendigames').
filter('total_hp', function(){
  return function(character){
      return character.hit_points-character.used_hit_points;
  };
}).
filter('total_ap', function(){
  return function(character){
      return 1-character.used_action_points+Math.floor(character.milestones/2);
  };
}).
filter('total_hs', function(){
  return function(character){
      return character.healing_surges-character.used_healing_surges;
  };
}).
filter('trunc', function(){
  return function(str, value){
    if(!str)
      return "";
    if(str.length <= value)
      return str;

    var tStr = str.slice(0,value-3)+'...';
    tStr += str.slice(str.length-3);
    return tStr;
  };
}).
filter('weight', function(){
  return function(pl){
    if(!pl)
      return 0;
    var items = pl._2m.items();
    var total = 0;
    for(var i = items.length-1; i >= 0; i--)
      total += items[i].weight;
    return total;
  };
})
.filter('category_short', function(){
  return function(str, value){
    if(!str)
      return;
    var split = str.split(" ");
    if(split.length == 1)
      return split[0].slice(0,2);
    return split[0][0] + split[1][0];
  };
}).
filter('plus_sign', function(){
  return function(value){
      if(value > 0)
        return '+'+value;
      return value;
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
})

.filter('level_plus', function(){
  return function(magic){
    if(!magic.level_cost_plus)
      return magic.level;
    return magic.level+'+';
  };
})

.filter('cost_plus', function(){
  return function(magic){
    if(!magic.level_cost_plus)
      return magic.cost;
    return magic.cost+'+';
  };
})

.filter('subtypes', function(){
  return function(subtypes){
    if(!subtypes || subtypes.length === 0)
      return "?";
    if(subtypes.length > 4)
      return 'Many';
    var ststr = subtypes[0].name.slice(0,2);
    for(var i=1, len=subtypes.length; i<len; i++) {
      ststr += ','+subtypes[i].name.slice(0,2);
    }
    return ststr;
  };
})

  .filter('power_style', function(){
    return function(power){
      if(!power)
        return;
      if(power['used']===true)
          return "used";
      return "available";
    };
  });

