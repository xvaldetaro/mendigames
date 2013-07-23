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

factory('EM', ['Restangular','$routeParams','$rootScope',
function(Restangular, $routeParams, $rootScope) {
    var all = {}, ready = false, deferreds = [];
    function poll(entity, pk) {
        return Q(Restangular.all(entity).getList({campaignId: $routeParams.campaignId,
        owned: true}))
        .then(function(el) {
            if(!all[entity]) {
                all[entity] = {};
                all[entity].list = [];
                all[entity].pk = pk;
            }
            all[entity].dict = {};
            all[entity].list.length = 0;

            var list=all[entity].list, dict=all[entity].dict;
            for(var i=0, len=el.length; i<len; i++) {
                var e = el[i];
                list.push(e);
                dict[e[pk]] = i;
            }
        })
        .fail(function() {
            $timeout(poll(entity, pk),1000);
        });
    }
    function poll_multiple(eList) {
        var promiseArray = [];
        for(var i=0; i<eList.length; i++) {
            promiseArray.push(poll(eList[i].entity, eList[i].pk));
        }
        ready = Q.all(promiseArray);
        return ready;
    }
    function flush_all() {
        for(var e in all) {
            flush(e);
        }
    }
    function flush(entity) {
        var entData = all[entity];
        for(var i=0, len=entData.list.length; i<len; i++) {
            var e = entData.list[i];
            if(e.needPost && !e[entData.pk]) {
                console.log('Error: trying to flush with unsynced '+entity);
                console.log('Now trying to sync by posting again to '+entity);
                entData.list.splice(i, 1);
                add(entity, e);
            }
            else if(e.needPut) {
                Q(e.put())
                .then(function(e) {
                    e.needPush = false;
                })
                .fail(function() {
                    throw new Error('Failed to put '+entity);
                });
            }
            else if(e.needRemove) {
            }
        }
    }
    function update(entity, instance) {
        return Q(instance.put())
        .then(function(instance) {
            instance.needPut = false;
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
    function fill_related_type(entity, related, isArray) {
        var entData = all[entity];
        if(isArray) {
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
            if(entData && entData.list.length > 0) {
                fill_related_type(relationList[i].entity, relationList[i].related,
                    relationList[i].isArray);
            }
        }
    }
    poll_multiple([
        {entity: 'condition', pk: 'name'},
        {entity: 'power', pk: 'name'},
        {entity: 'has_condition', pk: 'id'},
        {entity: 'has_power', pk: 'id'},
        {entity: 'character', pk: 'id'}
    ]).then(function() {
        fill_related_multiple([
            {entity: 'has_condition', related: 'condition', isArray: false},
            {entity: 'has_power', related: 'power', isArray: false},
            {entity: 'character', related: 'has_power', isArray: true},
            {entity: 'character', related: 'has_condition', isArray: true}
        ]);
    }).fail(function() {
        throw new Error('Could not fetch data from server');
    }).fin(function() {
        $rootScope.$apply();
    });
    return {
        poll: poll,
        poll_multiple: poll_multiple,
        flush: flush,
        flush_all: flush_all,
        update: update,
        add: add,
        remove: remove,
        ready: function() {
            return ready;
        },
        by_key: by_key,
        listSlice: function(entity) { return all[entity].list.slice(); }
    };
}]).

// Operator for characters
factory('Och', ['EM', 'roll',
function(EM, roll, HasConditionList) {
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
});
