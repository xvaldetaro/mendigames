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
    function safe_REST(instance) {
        var _2o = instance._2o, _2m = instance._2m;
        instance._2o = null;instance._2m = null;
        $log.log('plucked instance _2');
        var deferred = $q.defer();
        deferred.promise.then(function(data) {
            instance._2o = _2o;
            instance._2m = _2m;
            $log.log('tucked back instance _2');
        });
        return deferred;
    }
    function rev_REST(promise) {
        return promise.then(function(data) {
            update_revision(data);
            $log.log('-- Revision: '+revision);
            return data;
        })
    }
    function fill_2o(entityInstance, related) {
        if(entityInstance[related])
            entityInstance._2o[related] = by_key(related, entityInstance[related]);
    }
    function fill_2m(entityInstance, related) {
        var pkList = entityInstance[related+'s'], relatedList = [];
        for(var i=0, len=pkList.length; i<len; i++) {
            relatedList.push(by_key(related, pkList[i]));
        }
        entityInstance._2m[related+'s'] = relatedList;
    }
    function merge_related(entity, instanceList) {
        for(var i = instanceList.length - 1; i >= 0; i--) {
            instanceList[i]._2o = {};
            instanceList[i]._2m = {};
            var relatedList = get_2o_list(entity);
            for(var j = relatedList.length - 1; j >= 0; j--) {
                fill_2o(instanceList[i], relatedList[j]);
            }
            relatedList = get_2m_list(entity);
            for(var j = relatedList.length - 1; j >= 0; j--) {
                fill_2m(instanceList[i], relatedList[j]);
            }
        }
    }
    function merge_related_multiple(eList) {
        for(var i = eList.length - 1; i >= 0; i--) {
            var entity = eList[i];
            var instanceList = list(entity);
            merge_related(entity, instanceList);
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
        var restore = safe_REST(e);
        $log.log('Requesting add '+entity);
        var promise = rev_REST(Restangular.all(entity).post(e)
        .then(function(newE) {
            $log.log('Received Add '+entity+' response');
            U.replace(entData.list, e, newE);
            merge_related(entity, [newE]);
            $rootScope.$broadcast('EM.new_list.'+entity);
            return newE;
        }));
        restore.resolve();
        return promise;
    }
    function remove(entity, instance) {
        var entData = all[entity], pk = get_pk(entity);
        entData.list.splice(entData.list.indexOf(instance), 1);
        delete entData.edict[instance[pk]];
        var restore = safe_REST(instance);
        $log.log('Requesting Remove '+entity);
        var promise = rev_REST(instance.remove()
        .then(function(response){
            $rootScope.$broadcast('EM.new_list.'+entity);
            return response;
        }));
        restore.resolve();
        return promise;
    }
    function update(entity, instance) {
        $log.log('Requesting Update '+entity);
        var restore = safe_REST(instance);
        if(!instance.put)
            Restangular.restangularizeElement('', instance, entity);
        var promise = rev_REST(instance.put().then(function(response) {
            return response;
        }));
        restore.resolve();
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
    function search(entity, key, value){
        var l = list(entity), res = [];
        for (var i = 0, len = l.length; i < len; i++) {
            l[i][key] == value && res.push(l[i]);
        };
        return res;
    }
    //start_poll_timeout();
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
