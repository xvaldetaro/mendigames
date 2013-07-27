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
    var all = {}, polling = false, revision, emmd, pollPromise;
    function get_pk(entity) { return emmd[entity].pk; }
    function get_related(entity) { return emmd[entity].related; }
    function by_key(entity, key) { return all[entity].edict[key]; }
    function list(entity) { return all[entity].list; }
    function listSlice(entity) { return all[entity].list.slice(); }
    function get_query(entity) { return emmd[entity].query; }
    function update_revision(response) {
        if(response.data && response.data.revision)
            revision = response.data.revision;
        else
            revision = response.metadata.revision;
    }
    function fetch(entity) {
        return Q(Restangular.all(entity).getList(get_query(entity)))
        .then(function(el) {
            update_revision(el);
            all[entity].list = el;
            all[entity].edict = {};

            var list=all[entity].list, pk = get_pk(entity), edict=all[entity].edict;
            for (var i = 0, len=el.length; i < len; i++) {
                var instance = el[i];
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

        console.log('Requesting fetch all');
        pollPromise = async_request(function(){
            return Q.all(promiseArray).then(function(){
                console.log('Received FetchAll response');
                merge_related_multiple(eList);
                polling = false;
                for(var i = eList.length - 1; i >= 0; i--) {
                    $rootScope.$broadcast('EM.new_list.'+eList[i]);
                }
                return {data: {revision: revision}};
            });
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
    function on_response(response) {
        update_revision(response);
            console.log('-- Revision: '+revision);
            return response;
    }
    function on_response_err(error){
        window.alert(error.message);
    }
    function on_response_fin() {
        console.log('Ok! finishing request and applying');
        $rootScope.$apply();
    }
    // Expects a function that executes a request and returns a promise
    function async_request(func) {
        var defer = Q.defer();
        setTimeout(function(){
            func().then(function(response) {
                defer.resolve(response);
            },function(error) {
                defer.reject(error);
            });
        },0);
        return defer.promise.then(on_response).fail(on_response_err).fin(on_response_fin);
    }
    function add(entity, e) {
        var entData = all[entity];
        entData.list.push(e);
        var i = entData.list.length-1;

        console.log('Requesting add '+entity);
        return async_request(function() {
            return Restangular.all(entity).post(e)
            .then(function(newE) {
                console.log('Received Add '+entity+' response');
                entData.list[i] = newE;
                entData.edict[newE[get_pk(entity)]] = newE;

                var relatedList = get_related(entity);
                for(var j = relatedList.length - 1; j >= 0; j--) {
                    fill_related_type([newE], relatedList[j]);
                }
                console.log('Added '+entity+' with proper response');
                $rootScope.$broadcast('EM.new_list.'+entity);
                return newE;
            });
        });
    }
    function remove(entity, instance, i) {
        var entData = all[entity], pk = get_pk(entity);
        entData.list.splice(i, 1);
        delete entData.edict[instance[pk]];
        console.log('Requesting Remove '+entity);
        return async_request(function(){
            return instance.remove()
            .then(function(response){
                $rootScope.$broadcast('EM.new_list.'+entity);
                return response;
            });
        });
    }
    function update(entity, instance) {
        console.log('Requesting Update '+entity);
        return async_request(function(){ return instance.put(); });
    }
    function set_all_entity_metadata(metadata) {
        emmd = metadata;
        for(var entity in emmd){
            all[entity] = {};
            emmd[entity].reverse = [];
        }
        for(var entity in emmd){
            var relateds = emmd[entity].related;
            for(var i=0, len=relateds.length; i<len; i++)
                emmd[relateds[i]].reverse.push(entity);
        }
    }
    function get_revision() {
        return revision;
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
        async_request: async_request
    };
}]).

factory('EMController', ['EM','$http','$rootScope','$timeout','$routeParams',
function(EM, $http, $rootScope,$timeout,$routeParams) {
    var revision;
    var entitiesMetadata = {
        'campaign': {pk: 'id', related: [], query: {}},
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
        'campaign',
        'condition',
        'power',
        'has_condition',
        'has_power',
        'character'
    ];
    var syncEntities = [
        'has_condition',
        'has_power',
        'character',
        'campaign'
    ];
    function poll() {
        $http.get('/battle/rev').success(function(data,status,headers,config){
            if(EM.get_revision() == data.revision) {
                start_poll_timeout();
                return;
            }
            var localRev = EM.get_revision(), remoteRev = data.revision, 
                prev = data.previous, changed = data.revisionUpdate;

            if(localRev!=prev) // more than 1 revision behind, poll everything 
                EM.fetch_multiple(syncEntities).then(broadcast).then(start_poll_timeout);
        });
    }
    function start_poll_timeout(){
        //$timeout(poll, 2000);
    }
    function remove_list(entity, query) {
        return EM.async_request(function(){
            console.log('Requesting Remove '+entity+' list');
            return Q($http.delete('/battle/'+entity, {params: query}))
            .then(function(response) {
                console.log('Received Remove '+entity+' list response');
                EM.fetch_multiple(syncEntities);
                return response;
            });
        });
    }
    function update_list(entity, query, data) {
        return EM.async_request(function(){
            console.log('Requesting Update '+entity+' list');
            return Q($http.put('/battle/'+entity, data, {params: query}))
            .then(function(response) {
                console.log('Received Update '+entity+' list response');
                return response;
            });
        }).then(function(){
            EM.fetch_multiple(syncEntities);
        });
    }
    function add_list(entity, data){
        return EM.async_request(function(){
            console.log('Requesting Add '+entity+' list');
            return Q($http.post('/battle/'+entity, data, {params: {many: true}}))
            .then(function(response) {
                console.log('Received add '+entity+' list response');
                EM.fetch_multiple(syncEntities);
                return response;
            });
        });
    }
    function init() {
        EM.set_all_entity_metadata(entitiesMetadata);
    }
    init();
    return {
        remove_list: remove_list,
        update_list: update_list,
        add_list: add_list,
        initEntities: initEntities,
        syncEntities: syncEntities
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
        return save(c);
    }
    function set_init(c, value){
        c.init = parseInt(value);
        return save(c);
    }
    function roll_init(c, mod){
        c.init = roll(mod, dice);
        return save(c);
    }
    function change_xp(c, value){
        c.experience_points = c.experience_points+parseInt(value);
        return save(c);
    }
    function change_gold(c, value){
        c.gold = c.gold+parseInt(value);
        return save(c);
    }
    function _short_rest_stats(c){
        c.milestones = c.milestones-c.milestones%2;
        return save(c);
    }
    function short_rest(c){
        _short_rest_stats(c).then(function(){
            recharge_encounters(c);
        });
    }
    function _extended_rest_stats(c){
        c.milestones = 0;
        c.used_action_points = 0;
        c.used_healing_surges = 0;
        return save(c);
    }
    function extended_rest(c){
        _extended_rest_stats(c).then(function(){
            recharge_powers(c);
        });
    }
    function spend_ap(c){
        c.used_action_points = c.used_action_points+1;
        return save(c);
    }
    function spend_hs(c){
        c.used_healing_surges = c.used_healing_surges+1;
        return save(c);
    }
    function milestone(c){
        c.milestones = c.milestones+1;
        return save(c);
    }
    function bloodied(c){
        if(c.used_hit_points*2 > c.hit_points)
            return true;
        return false;
    }
    function incapacitated(c){
        if(c.used_hit_points >= c.hit_points)
            return true;
        return false;
    }
    function recharge_encounters(c) {
        for (var i = c._has_powers.length - 1; i >= 0; i--) {
            if(c._has_powers[i]._power.usage == 'E')
                c._has_powers[i].used = false;
        }
        return EMController.update_list('has_power', {character: c.id, power__usage: 'E'},
         {used: false});
    }
    function recharge_powers(c) {
        for (var i = c._has_powers.length - 1; i >= 0; i--) {
            c._has_powers[i].used = false;
        }
        return EMController.update_list('has_power', {character: c.id}, {used: false});
    }
    function clear_conditions(c) {
        c.has_conditions = [];
        c._has_conditions = [];
        return EMController.remove_list('has_condition', {character: c.id});
    }
    function remove_condition(c, hci) {
        var hco = c._has_conditions[hci];
        c._has_conditions.splice(hci,1);
        c.has_conditions.splice(hci,1);

        return EM.remove('has_condition', hco);
    }
    function add_condition(ch, co, init, round) {
        var hasCondition = {
            character: ch.id,
            condition: co.name,
            ends: 'T',
            started_round: round,
            started_init: init,
            _condition: co,
            needSync: true
        };

        ch._has_conditions.push(hasCondition);
        var i = ch._has_conditions.length-1;
        return EM.add('has_condition', hasCondition).then(function(newE){
            ch._has_conditions[i] = newE;
        });
    }
    function delete_character(chi, c) {
        return EM.remove('character', c, chi);
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
        _short_rest_stats: _short_rest_stats,
        _extended_rest_stats: _extended_rest_stats,
        spend_ap: spend_ap,
        spend_hs: spend_hs,
        milestone: milestone,
        bloodied: bloodied,
        recharge_encounters: recharge_encounters,
        recharge_powers: recharge_powers,
        clear_conditions: clear_conditions,
        remove_condition: remove_condition,
        add_condition: add_condition,
        delete_character: delete_character,
        incapacitated: incapacitated
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

factory('Ocam', ['EM','EMController','Och',
function(EM, EMController, Och) {
    function next(cam, characterList) {
        cam.turn++;
        if(cam.turn >= characterList.length) {
            cam.turn = 0;
            cam.round++;
        }
        EM.update('campaign', cam);
    }
    function set_round(cam, value){
        cam.round = value;
        EM.update('campaign', cam);
    }
    function normalize_turn(cam, characterList) {
        if(cam.turn >= characterList.length) {
            cam.turn = characterList.length-1;
            EM.update(cam);
        }
    }
    function init_sort(c1, c2){
        return c2.init - c1.init;
    }
    function reorder(cam, characterList) {
        var init = characterList[cam.turn].init;
        characterList.sort(init_sort);
        find_turn(cam, characterList, init);
    }
    function find_turn(cam, characterList, init) {
        var i=0, len=characterList.length;
        for(; i<len; i++) {
            if(characterList[i].init <= init) {
                cam.turn = i;
                return;
            }
        }
        cam.turn = len-1;
    }
    function _get_players(characterList) {
        var playerList = [];
        for (var i = characterList.length - 1; i >= 0; i--) {
            if(characterList[i].type=='Player')
                playerList.push(characterList[i]);
        }
        return playerList;
    }
    function _call_foreach(list, fName, param){
        var promises = []
        for (var i = list.length - 1; i >= 0; i--) {
            promises.push(Och[fName](list[i], param));
        }
        return Q.all(promises);
    }
    function split_gold(cam, characterList, value) {
        var playerList = _get_players(characterList);
        var share = Math.floor(value/playerList.length);
        var leftover = value%playerList.length;
        var lucky = _.random(0, playerList.length-1);
        playerList[lucky].gold += leftover;
        return _call_foreach(playerList, 'change_gold', share);
    }
    function mass_give_gold(cam, characterList, value) {
        var playerList = _get_players(characterList);
        return _call_foreach(playerList, 'change_gold', value);
    }
    function split_xp(cam, characterList, value) {
        var playerList = _get_players(characterList);
        var share = Math.floor(value/playerList.length);
        return _call_foreach(playerList, 'change_xp', share);
    }
    function mass_give_xp(cam, characterList, value) {
        var playerList = _get_players(characterList);
        return _call_foreach(playerList, 'change_xp', value);
    }
    function mass_clear_conditions(cam, characterList) {
        for (var i = characterList.length - 1; i >= 0; i--) {
            var c = characterList[i];
            c.has_conditions = [];
            c._has_conditions = [];
        }
        return EMController.remove_list('has_condition', {character__campaign: cam.id});
    }
    function mass_milestone(characterList){
        return _call_foreach(characterList, 'milestone');
    }
    function mass_short_rest(cam, characterList){
        return _call_foreach(characterList, '_short_rest_stats').then(function(){
            EMController.update_list('has_power',
            {character__campaign: cam.id, power__usage: 'E'},{used: false});
        });
    }
    function mass_extended_rest(cam, characterList){
        _call_foreach(characterList, '_extended_rest_stats').then(function(){
            EMController.update_list('has_power',
            {character__campaign: cam.id},{used: false});
        });
    }
    return {
        next: next,
        set_round: set_round,
        normalize_turn: normalize_turn,
        reorder: reorder,
        find_turn: find_turn,
        split_gold: split_gold,
        mass_give_gold: mass_give_gold,
        split_xp: split_xp,
        mass_give_xp: mass_give_xp,
        mass_clear_conditions: mass_clear_conditions,
        mass_short_rest: mass_short_rest,
        mass_extended_rest: mass_extended_rest,
        mass_milestone: mass_milestone
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
