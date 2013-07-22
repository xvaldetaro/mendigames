'use strict';

angular.module('battle.services', ['restangular']).
    factory('roll', function(){ return function(mod, dice){
        var roll = _.random(1,dice);
        var result = parseInt(mod)+roll;
        var log = " d"+dice+": "+roll+"+"+mod+"="+result+" ";
        return {
            result: result,
            log: log
        };
    };}).
    factory('WizardsService', ['$rootScope', '$http', function($rootScope, $http){
        return {
            fetch: function(id, model) {
                $rootScope.$broadcast('WizardsService.fetching');
                $http({
                    url: '/dndinsider/compendium/'+model+'.aspx?id='+id,
                    method: 'GET',
                    dataType: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }).
                success(function(data){
                    var fakedom = $('<div></div>');
                    fakedom.html(data.replace('<img src="images/bullet.gif" alt=""/>','<i class="icon-star"></i>'));
                    $rootScope.$broadcast('WizardsService.fetch', $('div[id|="detail"]', fakedom));
                });
            }
        };
    }]).
    factory('Log', ['$rootScope',
    function($rootScope) {
        $rootScope.log = [];
        return function() {
            var line = "";
            for (var i = 0; i < arguments.length; i++) {
                line = line + " " + arguments[i];
            }
            $rootScope.log.push(line);
        };
    }]).

factory('CharacterList', ['Restangular','HasPowerList', 'HasConditionList', '$routeParams',
function(Restangular, HasPowerList, HasConditionList, $routeParams) {
    var list = [], dict = {};
    function poll() {
        Restangular.all('character').getList({campaignId: $routeParams.campaignId})
        .then(function(characterList){
            list.length = 0;
            for(var i=0, len=characterList.length; i<len; i++) {
                var c = characterList[i];
                list.push(c);
                dict[c.id] = c;
            }

            HasPowerList.onReady(fill_power_relations);
            HasConditionList.onReady(fill_condition_relations);
        });
    }
    function fill_power_relations() {
        for(var i=0, len=list.length; i<len; i++)
        {
            var ch = list[i];
            var hpoList = ch.has_powers;
            var _hpoList = [];
            for(var j=0, lenj=hpoList.length; j<lenj; j++) {
                _hpoList.push(HasPowerList.by_id(hpoList[j].id));
            }
            ch._has_powers = _hpoList;
        }
    }
    function fill_condition_relations() {
        for(var i=0, len=list.length; i<len; i++)
        {
            var ch = list[i];
            var hcoList = ch.has_conditions;
            var _hcoList = [];
            for(var j=0, lenj=hcoList.length; j<lenj; j++) {
                _hcoList.push(HasConditionList.by_id(hcoList[j].id));
            }
            ch._has_conditions = _hcoList;
        }
    }
    poll();
    return {
        poll: poll,
        list: list,
        by_id: function(id){ return dict[id]; }
    };
}]).

factory('HasPowerList', ['Restangular','PowerCatalog', '$routeParams',
function(Restangular, PowerCatalog, $routeParams) {
    var list, dict = {}, ready = false, cbs = [];
    function poll() {
        Restangular.all('has_power').getList({campaignId: $routeParams.campaignId})
        .then(function(data){
            list = data;
            fill_relations(list);
            for(var i=0, len=list.length; i<len; i++) {
                dict[list[i].id] = list[i];
            }
        });
    }
    function fill_relations(hpoList) {
        PowerCatalog.onReady(function(){
            for(var i=0, len=hpoList.length; i<len; i++) {
                hpoList[i]._power = PowerCatalog.getItem(hpoList[i].power);
            }
            for(var i=0, len=cbs.length; i<len; i++) {
                cbs[i]();
            }
            cbs = null;
            ready = true;
        });
    }
    poll();
    return {
        onReady: function(cb) {
            if(ready)
                return cb();
            cbs.push(cb);
        },
        poll: poll,
        list: list,
        by_id: function(id){ return dict[id]; }
    };
}]).

factory('HasConditionList', ['Restangular','ConditionCatalog', '$routeParams',
function(Restangular, ConditionCatalog, $routeParams) {
    var list, dict = {}, ready = false, cbs = [];
    function poll() {
        Restangular.all('has_condition').getList({campaignId: $routeParams.campaignId})
        .then(function(data){
            list = data;
            fill_relations(list);
            for(var i=0, len=list.length; i<len; i++) {
                dict[list[i].id] = list[i];
            }
        });
    }
    function fill_relations(hcoList) {
        ConditionCatalog.onReady(function(){
            for(var i=0, len=hcoList.length; i<len; i++) {
                hcoList[i]._condition = ConditionCatalog.getItem(hcoList[i].condition);
            }
            for(var i=0, len=cbs.length; i<len; i++)
            {
                cbs[i]();
            }
            cbs = null;
            ready = true;
        });
    }
    poll();
    return {
        onReady: function(cb) {
            if(ready)
                return cb();
            cbs.push(cb);
        },
        poll: poll,
        list: list,
        by_id: function(id){ return dict[id]; },
        add: function(ch, co) {
            // Create a has_condition from it
            var hasCondition = {
                character: ch.id,
                condition: co.name,
                ends: 'T',
                started_round: 1,
                started_init: 1,
                _condition: co,
                needSync: true
            };

            Restangular.all('has_condition').post(hasCondition).then(function(hc) {
                for(var i=0, len=ch._has_conditions.length; i<len; i++)
                {
                    var entry = ch._has_conditions[i];
                    if(entry.needSync && entry.condition == hc.condition) {
                        hc._condition = entry._condition;
                        list.push(hc);
                        ch._has_conditions[i] = hc;
                    }
                }
            });
            ch._has_conditions.push(hasCondition);
        }
    };
}]).

factory('ConditionCatalog', ['$rootScope','Restangular',
function($rootScope, Restangular) {
    var dict = {}, list, ready = false, cbs = [];
    Restangular.all('condition').getList().then(function(data){
        list = data;
        for(var i=0, len=list.length; i<len; i++)
        {
            var item = list[i];
            dict[item.name] = item;
        }
        for(var i=0, len=cbs.length; i<len; i++)
        {
            cbs[i]();
        }
        cbs = null;
        ready = true;
    });
    return {
        onReady: function(cb) {
            if(ready)
                return cb();
            cbs.push(cb);
        },
        ready: function() { return ready; },
        listSlice: function(){ return list.slice(); },
        getItem: function(key){ return dict[key]; }
    };
}]).

factory('PowerCatalog', ['$rootScope','Restangular',
function($rootScope, Restangular) {
    var dict = {}, list, ready = false, cbs = [];
    Restangular.all('power').getList({owned: 'True'}).then(function(data){
        list = data;
        for(var i=0, len=list.length; i<len; i++)
        {
            var item = list[i];
            dict[item.name] = item;
        }
        for(var i=0, len=cbs.length; i<len; i++)
            cbs[i]();
        cbs = null;
        ready = true;
    });
    return {
        onReady: function(cb) {
            if(ready)
                return cb();
            cbs.push(cb);
        },
        ready: function() { return ready; },
        listSlice: function(){ return list.slice(); },
        getItem: function(key){ return dict[key]; }
    };
}]).

// Operator for characters
factory('Och', ['Restangular', 'roll', 'HasConditionList',
function(Restangular, roll, HasConditionList) {
    return {
        save: function(c) {
            c.put();
        },
        change_hp: function(c, value){
            c.used_hit_points = c.used_hit_points-parseInt(value);
            this.save(c);
        },
        set_init: function(c, value){
            c.init = parseInt(value);
            this.save(c);
        },
        roll_init: function(c, mod){
            c.init = roll(mod, dice);
            this.save(c);
        },
        change_xp: function(c, value){
            c.experience_points = c.experience_points+parseInt(value);
            this.save(c);
        },
        change_gold: function(c, value){
            c.gold = c.gold+parseInt(value);
            this.save(c);
        },
        short_rest: function(c){
            c.milestones = c.milestones-c.milestones%2;
            this.save(c);
        },
        extended_rest: function(c){
            this.short_rest(c);
            c.milestones = 0;
            c.used_action_points = 0;
            c.used_healing_surges = 0;
            this.save(c);
        },
        spend_ap: function(c){
            c.used_action_points = c.used_action_points+1;
            this.save(c);
        },
        spend_hs: function(c){
            c.used_healing_surges = c.used_healing_surges+1;
            this.save(c);
        },
        milestone: function(c){
            c.milestones = c.milestones+1;
            this.save(c);
        },
        bloodied: function(c){
            if(c.used_hit_points*2 > c.hit_points)
                return true;
            return false;
        },
        remove_condition: function(c, hci) {
            c._has_conditions[hci].remove().then(null, function() {window.alert("No sync");});
            c._has_conditions.splice(hci,1);
        },
        add_condition: function(c, co) {
            HasConditionList.add(c, co);
        }
    };
}]).
// Operator for HasPowers
factory('Ohpo', ['Restangular', 'WizardsService', 'PowerCatalog',
function(Restangular, WizardsService, PowerCatalog) {
    return {
        save: function(h) {
            h.put();
        },
        get_power: function(h) {
            h._power = PowerCatalog.getItem(h.power);
        },
        use_power: function(h) {
            h.used = !h.used;
            h.put();
        },
        fetch_from_compendium: function(h){
            WizardsService.fetch(h._power.wizards_id, 'power');
        }
    };
}]).
// Operator for HasPowers
factory('Ohco', ['Restangular', 'WizardsService', 'ConditionCatalog',
function(Restangular, WizardsService, ConditionCatalog) {
    return {
        save: function(h) {
            h.put();
        },
        get_condition: function(h) {
            h._condition = ConditionCatalog.getItem(h.condition);
        },
        remove: function(h) { 
            Restangular.one('has_condition', h.id)
            .remove().then(null, function() {window.alert("No sync");});
        },
        fetch_from_compendium: function(h){
            WizardsService.fetch(h._.wizards_id, 'power');
        }
    };
}]).
config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("/battle");
    RestangularProvider.setDefaultRequestParams({format: 'json'});
});
