'use strict';

angular.module('mendigames')

.factory('EM', ['Restangular','$routeParams','$rootScope','$http','$timeout','$log','U',
'$q',
function(Restangular, $routeParams, $rootScope, $http, $timeout,$log,U,$q) {
    var all = {}, revision, emmd, syncE;
    function get_pk(entity) { return emmd[entity].pk; }
    function get_2o_list(entity) { return emmd[entity]._2o; }
    function get_2m_list(entity) { return emmd[entity]._2m; }
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
    function rev_REST(promise) {
        return promise.then(function(data) {
            update_revision(data);
            $log.log('-- Revision: '+revision);
            return data;
        })
    }
    function merge_related_2o(entity, instance, related) {
        var relIntance = by_key(related, instance[related]);
        instance._2o[related] = function() {
            return relIntance;
        }
    }
    function merge_related_2m(entity, instance, related) {
        var pkList = instance[related+'s'], relatedList = [];
        for(var i=0, len=pkList.length; i<len; i++) {
            relatedList.push(by_key(related, pkList[i]));
        }

        instance._2m[related+'s'] = function() {
            return relatedList;
        }
    }
    function merge_related(entity,instance) {
        instance._2o = {};
        var relatedList = get_2o_list(entity);
        for(var j = relatedList.length - 1; j >= 0; j--) {
            merge_related_2o(entity, instance, relatedList[j]);
        }
        instance._2m = {};
        relatedList = get_2m_list(entity);
        for(var j = relatedList.length - 1; j >= 0; j--) {
            merge_related_2m(entity, instance, relatedList[j]);
        }
    }
    function merge_related_multiple(eList) {
        for(var i = eList.length - 1; i >= 0; i--) {
            var entity = eList[i];
            var instanceList = list(entity);
            for(var j = instanceList.length - 1; j >= 0; j--) {
                merge_related(entity, instanceList[j]);
            }
        }
    }
    function on_response_err(error){
        throw error;
    }
    function fetch(entity, _query) {
        var query = _query || get_query(entity)
        return Restangular.all(entity).getList(query)
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
    }
    function fetch_multiple(eList) {
        var promiseArray = [];
        for (var i = eList.length - 1; i >= 0; i--) {
            promiseArray.push(rev_REST(fetch(eList[i])));
        }

        $log.log('Requesting fetch multiple:'+eList);
        return $q.all(promiseArray).then(function(){
            $log.log('Received FetchAll response');
            merge_related_multiple(eList);
            for(var i = eList.length - 1; i >= 0; i--) {
                $rootScope.$broadcast('EM.new_list.'+eList[i]);
            }
        });
    }
    // Fetch the entity and its reverse related entities
    function fetch_with_reverse(entity){
        var eList = [entity], reverses = emmd[entity].reverse;
        for (var i = reverses.length - 1; i >= 0; i--) {
            eList.push(reverses[i]);
        }
        return fetch_multiple(eList);
    }
    function add(entity, e) {
        var entData = all[entity];
        entData.list.push(e);
        $log.log('Requesting add '+entity);
        var promise = rev_REST(Restangular.all(entity).post(e)
        .then(function(newE) {
            $log.log('Received Add '+entity+' response');
            U.replace(entData.list, e, newE);
            merge_related(entity, newE);
            $rootScope.$broadcast('EM.new_list.'+entity);
            return newE;
        }));
        return promise;
    }
    function remove(entity, instance) {
        var entData = all[entity], pk = get_pk(entity);
        entData.list.splice(entData.list.indexOf(instance), 1);
        delete entData.edict[instance[pk]];
        $log.log('Requesting Remove '+entity);
        var promise = rev_REST(instance.remove()
        .then(function(response){
            $rootScope.$broadcast('EM.new_list.'+entity);
            return response;
        }));
        return promise;
    }
    function update(entity, instance) {
        $log.log('Requesting Update '+entity);
        if(!instance.put)
            Restangular.restangularizeElement('', instance, entity);
        var promise = rev_REST(instance.put().then(function(response) {
            return response;
        }));
        return promise;
    }
    // used when a relation is needed to an entity not from the EM local database
    function add_local(entity, instance) {
        if(by_key(entity, instance[get_pk(entity)]))
            return;
        var entData = all[entity];
        entData.list.push(instance);
        var i = entData.list.length-1;
        entData.edict[instance[get_pk(entity)]] = instance;
    }
    function remove_list(entity, query) {
        $log.log('Requesting Remove '+entity+' list');
        return rev_REST($http.delete('/'+entity, {params: query})
        .then(function(response) {
            $log.log('Received Remove '+entity+' list response');
            fetch_multiple(syncE);
            return response;
        }));
    }
    function update_list(entity, query, data) {
        $log.log('Requesting Update '+entity+' list');
        return rev_REST($http.put('/'+entity, data, {params: query})
        .then(function(response) {
            $log.log('Received Update '+entity+' list response');
            fetch_multiple(syncE);
            return response;
        }));
    }
    function add_list(entity, data){
        $log.log('Requesting Add '+entity+' list');
        return rev_REST($http.post('/'+entity, data, {params: {many: true}})
        .then(function(response) {
            $log.log('Received add '+entity+' list response');
            fetch_multiple(syncE);
            return response;
        }));
    }
    function set_all_entity_metadata(metadata, syncEntities) {
        emmd = metadata, syncE = syncEntities;
        for(var entity in emmd){
            emmd[entity].pk = emmd[entity].pk || 'id';
            all[entity] = {};
            emmd[entity].reverse = [];
        }
        for(var entity in emmd){
            var relateds = emmd[entity]._2o;
            for(var i=0, len=relateds.length; i<len; i++)
                emmd[relateds[i]].reverse.push(entity);
            relateds = emmd[entity]._2m;
            for(var i=0, len=relateds.length; i<len; i++)
                emmd[relateds[i]].reverse.push(entity);
        }
    }
    function poll() {
        $rootScope.$apply(function() {
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
        })
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
    function match(instance, query) {
        for(var key in query) {
            if(instance[key].toLowerCase().indexOf(query[key]) == -1)
                return false;
        }
        return true;
    }
    function exact(instance, query) {
        for(var key in query) {
            if(instance[key] !== query[key])
                return false;
        }
        return true;
    }
    function search(entity, matchquery, exactquery){
        var l = list(entity), res = [];
        for (var i = 0, len = l.length; i < len; i++) {
            if(match(l[i], matchquery) && exact(l[i], exactquery))
                res.push(l[i]);
        };
        return res;
    }
    return {
        update: update,
        add: add,
        remove: remove,
        add_local: add_local,
        remove_list: remove_list,
        update_list: update_list,
        add_list: add_list,

        by_key: by_key,
        search: search,
        list: list,
        listSlice: listSlice,

        fetch: fetch,
        fetch_multiple: fetch_multiple,
        fetch_with_reverse: fetch_with_reverse,

        set_all_entity_metadata: set_all_entity_metadata,
        start_poll_timeout: start_poll_timeout,

        merge_related: merge_related,

        start: start
    };
}]);
