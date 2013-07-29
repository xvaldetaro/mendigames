angular.module('mendigames').

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
        return async_request(function(){
            return Restangular.all(entity).getList(get_query(entity))
            .then(function(el) {
                all[entity].list = el;
                all[entity].edict = {};

                var list=all[entity].list, pk = get_pk(entity), edict=all[entity].edict;
                for (var i = 0, len=el.length; i < len; i++) {
                    var instance = el[i];
                    edict[instance[pk]] = instance;
                }
                return el;
            });
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

        console.log('Requesting fetch multiple:'+eList);
        pollPromise = Q.all(promiseArray);

        return pollPromise.then(function(){
            console.log('Received FetchAll response');
            merge_related_multiple(eList);
            polling = false;
            for(var i = eList.length - 1; i >= 0; i--) {
                $rootScope.$broadcast('EM.new_list.'+eList[i]);
            }
            return {data: {revision: revision}};
        });
    }
    function fetch_with_reverse(entity){
        var eList = [entity], reverses = emmd[entity].reverse;
        for (var i = reverses.length - 1; i >= 0; i--) {
            eList.push(reverses[i]);
        }
        return fetch_multiple(eList);
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
    }
    // Expects a function that executes a request and returns a promise
    function async_request(func) {
        var defer = Q.defer();
        setTimeout(function(){
            func().then(function(response) {
                console.log('Resolved');
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
        fetch_with_reverse: fetch_with_reverse,
        set_all_entity_metadata: set_all_entity_metadata,
        get_revision: get_revision,
        async_request: async_request
    };
}])

.factory('EMController', ['EM','$http','$rootScope','$timeout','$routeParams',
function(EM, $http, $rootScope,$timeout,$routeParams) {
    var revision;
    var entitiesMetadata = {
        'campaign': {pk: 'id', related: [], query: {id: $routeParams.campaignId}},
        'condition': {pk: 'id', related: [], query: {}},
        'power': {pk: 'id', related: [], query: {haspower__isnull: false}},
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
        $http.get('/rev').success(function(data,status,headers,config){
            if(EM.get_revision() == data.revision) {
                start_poll_timeout();
                return;
            }
            var localRev = EM.get_revision(), remoteRev = data.revision, 
                prev = data.previous, changed = data.revisionUpdate;

            if(localRev!=prev||!changed||changed===''){ // more than 1 revision behind or 0
                console.log('revision changed, pulling all');
                return EM.fetch_multiple(syncEntities).then(start_poll_timeout);
            }
            console.log('revision changed, pulling '+changed);
            return EM.fetch_with_reverse(changed).then(start_poll_timeout);
        });
    }
    function start_poll_timeout(){
        $timeout(poll, 2000);
    }
    function remove_list(entity, query) {
        return EM.async_request(function(){
            console.log('Requesting Remove '+entity+' list');
            return Q($http.delete('/'+entity, {params: query}))
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
            return Q($http.put('/'+entity, data, {params: query}))
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
            return Q($http.post('/'+entity, data, {params: {many: true}}))
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
        syncEntities: syncEntities,
        start_poll_timeout: start_poll_timeout
    };
}]);