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

factory('EM', ['Restangular','$routeParams','$rootScope','$timeout','$http',
function(Restangular, $routeParams, $rootScope,$timeout,$http) {
    var all = {}, pollPromise, revision;
    function poll(entity, pk) {
        return Q(Restangular.all(entity).getList({campaignId: $routeParams.campaignId,
        owned: true}))
        .then(function(el) {
            all[entity] = {};
            all[entity].list = el;
            all[entity].pk = pk;
            all[entity].dict = {};

            var list=all[entity].list, dict=all[entity].dict;
            for(var i=0, len=el.length; i<len; i++)
                dict[el[i][pk]] = i;
        })
        .fail(function() {
            window.alert('Server not responding');
        });
    }
    function poll_multiple(eList) {
        var promiseArray = [];
        for(var i=0; i<eList.length; i++) {
            promiseArray.push(poll(eList[i].entity, eList[i].pk));
        }
        return Q.all(promiseArray);
    }
    function update(entity, instance) {
        return Q(instance.put())
        .then(function(instance) {
            instance.needPut = false;
            revision++;
        })
        .fail(function() {
            window.alert('Connection failed');
        });
    }
    function add(entity, e) {
        var entData = all[entity];
        entData.list.push(e);
        var i = entData.list.length-1;
        return Q(Restangular.all(entity).post(e))
        .then(function(newE) {
            revision++;
            entData.list[i] = newE;
            entData.dict[newE[entData.pk]] = i;
            return newE;
        })
        .fail(function() {
            window.alert('Connection failed');
        });
    }
    function remove(entity, instance) {
        var entData = all[entity];
        var i = entData.dict[instance[entData.pk]];
        entData.list.splice(i, 1);
        entData.dict[instance[entData.pk]] = null;
        return Q(instance.remove())
        .then(function(){
            revision++;
        })
        .fail(function(){
            window.alert('Connection failed');
        });
    }
    function by_key(entity, key) {
        var entData = all[entity];
        return entData.list[entData.dict[key]];
    }
    function fill_related(entityInstance, related) {
        entityInstance['_'+related] = by_key(related, entityInstance[related]);
    }
    function fill_related_array(entityInstance, related) {
        var pkList = entityInstance[related+'s'], relatedList = [];
        for(var i=0, len=pkList.length; i<len; i++) {
            relatedList.push(by_key(related, pkList[i]));
        }
        entityInstance['_'+related+'s'] = relatedList;
    }
    function fill_related_type(entity, related) {
        var entData = all[entity];
        if(entData.list.length === 0)
            return;
        if(entData.list[0][related+'s'] instanceof Array) {
            for(var i=0, len=entData.list.length; i<len; i++) {
                fill_related_array(entData.list[i], related);
            }
        } else {
            for(var i=0, len=entData.list.length; i<len; i++) {
                fill_related(entData.list[i], related);
            }
        }
    }
    function fill_related_multiple(relationList) {
        for(var i=0; i<relationList.length; i++) {
            var entData = all[relationList[i].entity];
            if(entData) {
                fill_related_type(relationList[i].entity, relationList[i].related,
                    relationList[i].isArray);
            }
        }
    }
    function check_poll() {
        $http.get('/battle/rev').success(function(data,status,headers,config){
            if(revision == data.revision) {
                $timeout(check_poll, 2000);
                return;
            }

            poll_multiple([
                {entity: 'has_condition', pk: 'id'},
                {entity: 'has_power', pk: 'id'},
                {entity: 'character', pk: 'id'}
            ]).then(function() {
                fill_related_multiple([
                    {entity: 'has_condition', related: 'condition'},
                    {entity: 'has_power', related: 'power'},
                    {entity: 'character', related: 'has_power'},
                    {entity: 'character', related: 'has_condition'}
                ]);
            }).then(function(){
                revision = all['character'].list.metadata.revision;
                $rootScope.$broadcast('EM.update');
                //$timeout(check_poll, 2000);
            });
        });
    }
    pollPromise = poll_multiple([
        {entity: 'condition', pk: 'name'},
        {entity: 'power', pk: 'name'},
        {entity: 'has_condition', pk: 'id'},
        {entity: 'has_power', pk: 'id'},
        {entity: 'character', pk: 'id'}
    ]).then(function() {
        fill_related_multiple([
            {entity: 'has_condition', related: 'condition'},
            {entity: 'has_power', related: 'power'},
            {entity: 'character', related: 'has_power'},
            {entity: 'character', related: 'has_condition'}
        ]);
    }).fin(function(){
        revision = all['character'].list.metadata.revision;
        $rootScope.$broadcast('EM.update');
        //$timeout(check_poll, 2000);
    });

    return {
        poll: poll,
        poll_multiple: poll_multiple,
        update: update,
        add: add,
        fill_related_multiple: fill_related_multiple,
        remove: remove,
        ready: function() {
            return pollPromise;
        },
        by_key: by_key,
        listSlice: function(entity) { return all[entity].list.slice(); }
    };
}]).

// Operator for characters
factory('Och', ['EM', 'roll','Restangular',
function(EM, roll, Restangular) {
    return {
        save: function(c) {
            EM.update('character', c);
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
        clear_conditions: function(c) {
            var hcl = Restangular.restangularizeCollection(c, c._has_powers,'has_condition');
            hcl[0].used = !hcl[0].used;
            hcl[0].put();
            c.has_conditions = [];
            c._has_conditions = [];
        },
        remove_condition: function(c, hci) {
            var hco = c._has_conditions[hci];
            c._has_conditions.splice(hci,1);
            c.has_conditions.splice(hci,1);

            return EM.remove('has_condition', hco).fail(function(){
                c._has_conditions.push(hco);
                c.has_conditions.push(hco.id);
            });
        },
        add_condition: function(ch, co) {
            var hasCondition = {
                character: ch.id,
                condition: co.name,
                ends: 'T',
                started_round: 1,
                started_init: 1,
                _condition: co,
                needSync: true
            };

            ch._has_conditions.push(hasCondition);
            var i = ch._has_conditions.length-1;
            return EM.add('has_condition', hasCondition)
            .then(function(newE) {
                newE._condition = EM.by_key('condition', newE.condition);
                ch._has_conditions[i] = newE;
            });
        }
    };
}]).
// Operator for HasPowers
factory('Ohpo', ['EM', 'WizardsService',
function(EM, WizardsService) {
    return {
        use_power: function(h) {
            h.used = !h.used;
            EM.update('has_power', h);
        },
        fetch_from_compendium: function(h){
            WizardsService.fetch(h._power.wizards_id, 'power');
        }
    };
}]).
// Operator for HasPowers
factory('Ohco', ['WizardsService',
function(WizardsService) {
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
    RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
        // This is a get for a list
        if(response.data) {
            var newResponse;
            newResponse = response.data;
            newResponse.metadata = {revision: response.revision};
            return newResponse;
        }
        return {};
    });
});
