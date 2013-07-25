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

factory('EM', ['Restangular','$routeParams','$http',
function(Restangular, $routeParams, $http) {
    var all = {}, polling = false, revision, emmd, pollPromise;
    function get_pk(entity) { return emmd[entity].pk; }
    function get_related(entity) { return emmd[entity].related; }
    function by_key(entity, key) { return all[entity].edict[key]; }
    function list(entity) { return all[entity].list; }
    function listSlice(entity) { return all[entity].list.slice(); }
    function get_query(entity) { return emmd[entity].query; }

    function fetch(entity) {
        return Q(Restangular.all(entity).getList(get_query(entity)))
        .then(function(el) {
            all[entity] = {};
            all[entity].list = el;
            all[entity].idict = {};
            all[entity].edict = {};

            var list=all[entity].list, idict=all[entity].idict, pk = get_pk(entity);
            var edict=all[entity].edict;
            for (var i = el.length - 1; i >= 0; i--) {
                var instance = el[i];
                idict[instance[pk]] = i;
                edict[instance[pk]] = instance;
            }
        })
        .fail(function() {
            window.alert('Server not responding');
        });
    }
    function fetch_multiple(eList) {
        if(polling)
            return pollPromise;
        polling = true;
        var promiseArray = [];
        for (var i = eList.length - 1; i >= 0; i--) {
            promiseArray.push(fetch(eList[i]));
        }
        pollPromise = Q.all(promiseArray).then(function(){
            revision = list(eList[0]).metadata.revision;
            merge_related_multiple(eList);
        }).fin(function(){
            polling = false;
        });
        return pollPromise;
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
    function fill_related_type(instanceList, related) {
        if(instanceList[0][related+'s'] instanceof Array)
            for (var i = instanceList.length - 1; i >= 0; i--)
                fill_related_array(instanceList[i], related);
        else
            for(var i = instanceList.length - 1; i >= 0; i--)
                fill_related(instanceList[i], related);
    }
    function merge_related_multiple(eList) {
        for(var i = eList.length - 1; i >= 0; i--) {
            var entity = eList[i];
            var instanceList = list(entity);
            if(instanceList.length != 0) {
                var relatedList = get_related(entity);
                for(var j = relatedList.length - 1; j >= 0; j--) {
                    fill_related_type(instanceList, relatedList[j]);
                }
            }
        }
    }
    function update(entity, instance) {
        return Q(instance.put())
        .then(function(instance) {
            revision++;
        })
        .fail(function() {
            window.alert('Connection failed when updating');
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
            entData.idict[newE[get_pk(entity)]] = i;
            entData.edict[newE[get_pk(entity)]] = newE;
            return newE;
        })
        .fail(function() {
            window.alert('Connection failed when adding');
        });
    }
    function remove(entity, instance) {
        var entData = all[entity], pk = get_pk(entity);
        var i = entData.idict[instance[pk]];
        entData.list.splice(i, 1);
        entData.idict[instance[pk]] = null;
        entData.edict[instance[pk]] = null;
        return Q(instance.remove())
        .then(function(){
            revision++;
        })
        .fail(function(){
            window.alert('Connection failed when removing');
        });
    }
    function set_all_entity_metadata(metadata) {
        emmd = metadata;
    }
    function get_revision() {
        return revision;
    }
    function increase_revision() {
        revision++;
    }
    return {
        update: update,
        add: add,
        remove: remove,
        by_key: by_key,
        list: list,
        listSlice: listSlice,
        fetch_multiple: fetch_multiple,
        set_all_entity_metadata: set_all_entity_metadata,
        get_revision: get_revision,
        increase_revision: increase_revision
    };
}]).

factory('EMController', ['EM','$http','$rootScope','$timeout','$routeParams',
function(EM, $http, $rootScope,$timeout,$routeParams) {
    var revision;
    var entitiesMetadata = {
        'condition': {pk: 'name', related: [], query: {}},
        'power': {pk: 'name', related: [], query: {haspower__isnull: false}},
        'has_condition': {pk: 'id', related: ['condition'],
            query: {character__campaign: $routeParams.campaignId}},
        'has_power': {pk: 'id', related: ['power'],
            query: {character__campaign: $routeParams.campaignId}},
        'character': {pk: 'id', related: ['has_condition','has_power'],
            query: {campaign: $routeParams.campaignId}}
    };
    var initEntities = [
        'condition',
        'power',
        'has_condition',
        'has_power',
        'character'
    ];
    var syncEntities = [
        'has_condition',
        'has_power',
        'character'
    ];
    function poll() {
        $http.get('/battle/rev').success(function(data,status,headers,config){
            if(EM.get_revision() == data.revision) {
                start_poll_timeout();
                return;
            }

            EM.fetch_multiple(syncEntities).then(broadcast).then(start_poll_timeout);
        });
    }
    function start_poll_timeout(){
        //$timeout(poll, 2000);
    }
    function broadcast() {
        $rootScope.$broadcast('EM.update');
    }
    function remove_list(entity, query) {
        var deferred = Q.defer();
        $http.delete('/battle/'+entity, {params: query}).success(function() {
            deferred.resolve();
        });
        return deferred.promise.then(function(){
            EM.fetch_multiple(syncEntities).then(broadcast);
        });
    }
    function update_list(entity, query, data) {
        var deferred = Q.defer();
        $http.put('/battle/'+entity, data, {params: query}).success(function() {
            deferred.resolve();
        });
        return deferred.promise.then(function(){
            EM.fetch_multiple(syncEntities).then(broadcast);
        });
    }
    function init() {
        EM.set_all_entity_metadata(entitiesMetadata);
        EM.fetch_multiple(initEntities).then(broadcast).then(start_poll_timeout);
    }
    init();
    return {
        remove_list: remove_list,
        update_list: update_list
    };
}]).

// Operator for characters
factory('Och', ['EM', 'EMController','roll','Restangular',
function(EM, EMController, roll, Restangular) {
    function save(c) {
        return EM.update('character', c);
    }
    function change_hp(c, value){
        c.used_hit_points = c.used_hit_points-parseInt(value);
        if(c.used_hit_points < 0)
            c.used_hit_points = 0;
        else if(c.used_hit_points > c.hit_points+c.hit_points/3)
            c.used_hit_points = c.hit_points+c.hit_points/3;
        save(c);
    }
    function set_init(c, value){
        c.init = parseInt(value);
        save(c);
    }
    function roll_init(c, mod){
        c.init = roll(mod, dice);
        save(c);
    }
    function change_xp(c, value){
        c.experience_points = c.experience_points+parseInt(value);
        save(c);
    }
    function change_gold(c, value){
        c.gold = c.gold+parseInt(value);
        save(c);
    }
    function short_rest(c){
        c.milestones = c.milestones-c.milestones%2;
        recharge_encounters(c, save(c));
    }
    function extended_rest(c){
        c.milestones = 0;
        c.used_action_points = 0;
        c.used_healing_surges = 0;
        recharge_powers(c, save(c));
    }
    function spend_ap(c){
        c.used_action_points = c.used_action_points+1;
        save(c);
    }
    function spend_hs(c){
        c.used_healing_surges = c.used_healing_surges+1;
        save(c);
    }
    function milestone(c){
        c.milestones = c.milestones+1;
        save(c);
    }
    function bloodied(c){
        if(c.used_hit_points*2 > c.hit_points)
            return true;
        return false;
    }
    function recharge_encounters(c, promise) {
        for (var i = c._has_powers.length - 1; i >= 0; i--) {
            if(c._has_powers[i]._power.usage == 'E')
                c._has_powers[i].used = false;
        }
        if(promise)
            return promise.then(function() {
                EMController.update_list('has_power', {character: c.id, power__usage: 'E'},
                    {used: false});
            });
        return EMController.update_list('has_power', {character: c.id, power__usage: 'E'},
         {used: false});
    }
    function recharge_powers(c, promise) {
        for (var i = c._has_powers.length - 1; i >= 0; i--) {
            c._has_powers[i].used = false;
        }
        if(promise)
            return promise.then(function() {
                EMController.update_list('has_power', {character: c.id},{used: false});
            });
        return EMController.update_list('has_power', {character: c.id}, {used: false});
    }
    function clear_conditions(c, promise) {
        c.has_conditions = [];
        c._has_conditions = [];
        if(promise)
            return promise.then(function() {
                EMController.remove_list('has_condition', {character: c.id});
            });
        return EMController.remove_list('has_condition', {character: c.id});
    }
    function remove_condition(c, hci) {
        var hco = c._has_conditions[hci];
        c._has_conditions.splice(hci,1);
        c.has_conditions.splice(hci,1);

        return EM.remove('has_condition', hco).fail(function(){
            c._has_conditions.push(hco);
            c.has_conditions.push(hco.id);
        });
    }
    function add_condition(ch, co) {
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
    return {
        save: save,
        change_hp: change_hp,
        set_init: set_init,
        roll_init: roll_init,
        change_xp: change_xp,
        change_gold: change_gold,
        short_rest: short_rest,
        extended_rest: extended_rest,
        spend_ap: spend_ap,
        spend_hs: spend_hs,
        milestone: milestone,
        bloodied: bloodied,
        recharge_encounters: recharge_encounters,
        recharge_powers: recharge_powers,
        clear_conditions: clear_conditions,
        remove_condition: remove_condition,
        add_condition: add_condition
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
