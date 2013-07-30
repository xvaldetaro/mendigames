'use strict';

angular.module('mendigames').

factory('EM', ['Restangular','$routeParams','$rootScope','$http','$timeout','$log',
function(Restangular, $routeParams, $rootScope, $http, $timeout,$log) {
    var all = {}, polling = false, revision, emmd, pollPromise, syncE;
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

        $log.log('Requesting fetch multiple:'+eList);
        pollPromise = Q.all(promiseArray);

        return pollPromise.then(function(){
            $log.log('Received FetchAll response');
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
            $log.log('-- Revision: '+revision);
            return response;
    }
    function on_response_err(error){
        window.alert(error.message);
    }
    function on_response_fin() {
        $log.log('Ok! finishing request and applying');
    }
    // Expects a function that executes a request and returns a promise
    function async_request(func) {
        var defer = Q.defer();
        setTimeout(function(){
            func().then(function(response) {
                $log.log('Resolved');
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

        $log.log('Requesting add '+entity);
        return async_request(function() {
            return Restangular.all(entity).post(e)
            .then(function(newE) {
                $log.log('Received Add '+entity+' response');
                entData.list[i] = newE;
                entData.edict[newE[get_pk(entity)]] = newE;

                var relatedList = get_related(entity);
                for(var j = relatedList.length - 1; j >= 0; j--) {
                    fill_related_type([newE], relatedList[j]);
                }
                $log.log('Added '+entity+' with proper response');
                $rootScope.$broadcast('EM.new_list.'+entity);
                return newE;
            });
        });
    }
    function remove(entity, instance, i) {
        var entData = all[entity], pk = get_pk(entity);
        entData.list.splice(i, 1);
        delete entData.edict[instance[pk]];
        $log.log('Requesting Remove '+entity);
        return async_request(function(){
            return instance.remove()
            .then(function(response){
                $rootScope.$broadcast('EM.new_list.'+entity);
                return response;
            });
        });
    }
    function update(entity, instance) {
        $log.log('Requesting Update '+entity);
        return async_request(function(){ return instance.put(); });
    }
    function remove_list(entity, query) {
        return async_request(function(){
            $log.log('Requesting Remove '+entity+' list');
            return Q($http.delete('/'+entity, {params: query}))
            .then(function(response) {
                $log.log('Received Remove '+entity+' list response');
                fetch_multiple(syncEntities);
                return response;
            });
        });
    }
    function update_list(entity, query, data) {
        return async_request(function(){
            $log.log('Requesting Update '+entity+' list');
            return Q($http.put('/'+entity, data, {params: query}))
            .then(function(response) {
                $log.log('Received Update '+entity+' list response');
                return response;
            });
        }).then(function(){
            fetch_multiple(syncEntities);
        });
    }
    function add_list(entity, data){
        return async_request(function(){
            $log.log('Requesting Add '+entity+' list');
            return Q($http.post('/'+entity, data, {params: {many: true}}))
            .then(function(response) {
                $log.log('Received add '+entity+' list response');
                fetch_multiple(syncEntities);
                return response;
            });
        });
    }
    function set_all_entity_metadata(metadata, syncEntities) {
        emmd = metadata, syncE = syncEntities;
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
    function poll() {
        $http.get('/rev').success(function(data,status,headers,config){
            if(revision == data.revision) {
                start_poll_timeout();
                return;
            }
            var localRev = revision, remoteRev = data.revision,
                prev = data.previous, changed = data.revisionUpdate;

            if(localRev!=prev||!changed||changed===''){ // more than 1 revision behind or 0
                $log.log('revision changed, pulling all');
                return fetch_multiple(syncE).then(start_poll_timeout);
            }
            $log.log('revision changed, pulling '+changed);
            if(_.contains(syncE, changed))
                return fetch_with_reverse(changed).then(start_poll_timeout);

            // Other update that is not pertinent to this view
            $log.log(changed+' is not relevant to this view. Only updated revision');
            revision = data.revision;
            start_poll_timeout();
        });
    }
    function start_poll_timeout(){
        $timeout(poll, 2000);
    }
    function start(entitiesMetadata, syncEntities) {
        all = {};
        var initEntities = [];
        set_all_entity_metadata(entitiesMetadata, syncEntities);
        for (var eName in entitiesMetadata)
            initEntities.push(eName);
        fetch_multiple(initEntities);
    }
    start_poll_timeout();
    return {
        update: update,
        add: add,
        remove: remove,
        remove_list: remove_list,
        update_list: update_list,
        add_list: add_list,

        by_key: by_key,
        list: list,
        listSlice: listSlice,

        fetch_multiple: fetch_multiple,
        fetch_with_reverse: fetch_with_reverse,

        set_all_entity_metadata: set_all_entity_metadata,
        start_poll_timeout: start_poll_timeout,

        start: start
    };
}]);