"use strict";

angular.module('mendigames')
.factory('BASEURL', ['DjangoProperties', function(DjangoProperties){
    var static_url = DjangoProperties.STATIC_URL;
    return function() {
        return static_url;
    };
}])
.factory('Wizards', ['$rootScope', '$http','EM','$log','$q',
function($rootScope, $http, EM, $log, $q){
    return function(model, entity, instance) {
        window.open(
          'http://www.wizards.com/dndinsider/compendium/display.aspx?page='+model+'&id='+instance.wizards_id,
          '_blank'
        );
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

.controller('InputDialogCtrl', ['$scope', 'dialog', 'params',
function($scope, dialog, params) {
    $scope.confirm = function() {
        dialog.close($scope.result);
    };
    $scope.cancel = function() {
        dialog.close();
    };
    for(var param in params) {
        $scope[param] = params[param];
    }
}])

.factory('InputDialog', ['$dialog','BASEURL',
function($dialog, BASEURL) {
    var baseUrl = BASEURL()+'mendigames/partials/dialogs/';
    return function(partialName, scopeAugment) {
        return $dialog.dialog({
            resolve: { params: function(){ return scopeAugment || {}; } }
        }).open(baseUrl+partialName+'.html', 'InputDialogCtrl');
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
    function pluck(items, value) {
        var index = items.indexOf(value);
        if (index !== -1) {
            items.splice(index, 1);
        }
    }
    // inclusive min, exclusive max
    function randint(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    function roll(mod, dice, mult){
        var rollStr = '', total = 0;
        for(var i = mult - 1; i >= 0; i--) {
            var result = randint(1,dice+1);
            rollStr = rollStr+result+'+';
            total += result;
        }
        rollStr = rollStr.slice(0, -1);
        rollStr += '='+total;
        var logStr = mult+'d'+dice+'('+rollStr+')+'+mod+' : ';
        total += parseInt(mod);
        logStr = logStr+total;
        return {
            result: total,
            log: logStr
        };
    }
    return {
        replace: replace,
        pluck: pluck,
        randint: randint,
        roll: roll
    };
}]);
