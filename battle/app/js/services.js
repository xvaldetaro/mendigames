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
    factory('CharacterList', ['$rootScope','Restangular',
    function($rootScope, Restangular) {
        var dict = {}, list, ready = false;
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
factory('Och', ['Restangular', 'roll',
function(Restangular, WizardsService, roll) {
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
            if(h._power)
                return;
            PowerCatalog.onReady(function(){
                h._power = PowerCatalog.getItem(h.power);
            });
        },
        use_power: function(h) {
            h.used = !h.used;
            Restangular.one('has_power', h.id).get().then(
                function(data) {
                    data.used = h.used;
                    data.put();
                }
            );
        },
        fetch_from_compendium: function(c){
            WizardsService.fetch(c.wizards_id, 'power');
        }
    };
}]).
config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("/battle");
    RestangularProvider.setDefaultRequestParams({format: 'json'});
});
