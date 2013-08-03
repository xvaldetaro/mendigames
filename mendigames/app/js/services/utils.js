"use strict";

angular.module('mendigames')

.factory('roll', function(){ return function(mod, dice){
    var roll = _.random(1,dice);
    var result = parseInt(mod)+roll;
    var log = " d"+dice+": "+roll+"+"+mod+"="+result+" ";
    return {
        result: result,
        log: log
    };
};})

.factory('WizardsService', ['$rootScope', '$http','EM',
function($rootScope, $http, EM){
    return {
        fetch: function(id, model, entity, instance) {
            if(instance.html_description) {
                $rootScope.$broadcast('WizardsService.fetch',
                    instance.html_description);
                console.log('Got from db');
                return;
            }

            $http({
                url: '/dndinsider/compendium/display.aspx?page='+model+'&id='+id,
                method: 'GET',
                dataType: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }).
            success(function(data){
                var fakedom = $('<div></div>');
                fakedom.html(data.replace('<img src="images/bullet.gif" alt=""/>',
                    '<i class="icon-star"></i>'));
                var html_description = $('div[id|="detail"]', fakedom).html();
                if(entity){
                    instance.html_description = html_description;
                    EM.update(entity, instance);
                }
                $rootScope.$broadcast('WizardsService.fetch', html_description);
            });
        }
    };
}])

.factory('Log', ['$rootScope',
function($rootScope) {
    $rootScope.log = [];
    return function() {
        var line = "";
        for (var i = 0; i < arguments.length; i++) {
            line = line + " " + arguments[i];
        }
        $rootScope.log.push(line);
    };
}])

.factory('U', [
function() {
    function replace(items, oldValue, newValue) {
        var index = items.indexOf(oldValue);
        if (index !== -1) {
            items[index] = newValue;
        }
    }
    return {
        replace: replace
    };
}]);
