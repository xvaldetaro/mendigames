'use strict';

angular.module('battle.controllers', ['restangular','battle.services', 'ui.bootstrap',
    'ngDragDrop', 'ngSanitize'])

.controller('CampaignListCtrl', ['$scope','Restangular',
function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
}]).

controller('CampaignCtrl', ['$scope', '$rootScope','$timeout','Restangular', '$routeParams',
'PowerCatalog', 'ConditionCatalog',
function($scope, $rootScope, $timeout, Restangular, $routeParams, PowerCatalog,
ConditionCatalog) {
    PowerCatalog.onReady(function() { $scope.powerCatalogReady = true;});
    var campaignId = $routeParams.campaignId;

    // ----------- Create the polling
    // Polls campagin details every 10sec
    function campaign_poll(){
        Restangular.one('campaign', campaignId).get().then(function(campaign){
            $scope.campaign = campaign;
            $timeout(campaign_poll,10000);
        });
    }
    //$timeout(campaign_poll,10000);

    // Polls character list every 2sec
    var params = {campaignId: campaignId};
    $scope.character_poll_timeout = function() {
        Restangular.all('character').getList(params).then(function(characterList){
            $scope.characterList = characterList;
            //$timeout($scope.character_poll_timeout,2000);
        });
    };
    $scope.character_poll_timeout();
    $scope.test = function() {
        $rootScope.$broadcast('Character.poll');
    }

    // --------------- Register the watchers
    var watcher = function(newValue,oldValue){
                if(newValue == oldValue)
                    return;

                newValue.put(); };

    
    Restangular.one('campaign', campaignId).get().then(function(campaign){
        $scope.campaign = campaign;
        $scope.$watch('campaign', watcher);
    });
}])

.controller('CharacterController', ['$rootScope','$scope','Restangular',
function($rootScope, $scope, Restangular) {
    $scope.$watch('character', function(newValue, oldValue) {
        if(newValue == oldValue)
            return;
        newValue.put();
    });

    // ----------- EVENT HANDLERS:
    $scope.change_hp = function(value){
        $scope.character.used_hit_points =
            $scope.character.used_hit_points-parseInt(value);
    };
    $scope.set_init = function(init){
        $scope.character.init = parseInt(init);
    };
    $scope.roll_init = function(character, init){
        $scope.character.init = roll(init);
    };
    $scope.change_xp = function(character){
        character.experience_points =
            character.experience_points+parseInt($scope.changeXp[character.id]);
    };
    $scope.change_gold = function(character){
        character.gold = character.gold+parseInt($scope.changeGold[character.id]);
    };
    $scope.short_rest = function(character){
        character.milestones = character.milestones-character.milestones%2;
    };
    $scope.ext_rest = function(character){
        $scope.shortRest(character);
        character.milestones = 0;
        character.used_action_points = 0;
        character.used_healing_surges = 0;
    };
    $scope.spend_ap = function(character){
        character.used_action_points = character.used_action_points+1;
    };
    $scope.spend_hs = function(character){
        character.used_healing_surges = character.used_healing_surges+1;
    };
    $scope.award_milestone = function(character){
        character.milestones = character.milestones+1;
    };
    $scope.bloodied = function(character){
        if(character.used_hit_points*2 > character.hit_points)
            return true;
        return false;
    };
    $scope.fetch_from_compendium = function(id, model){
        WizardsService.fetch(id, model);
    };
}])

.controller('MenuController', ['$scope', 'ConditionCatalog',
function($scope, ConditionCatalog) {
    ConditionCatalog.onReady(function() {
        $scope.conditionList = ConditionCatalog.listSlice();
    });
    $scope.$on('Condition.dropped', function() {
        $scope.conditionList = ConditionCatalog.listSlice();
    });
}])

.controller('HasPowerController', ['$scope', 'Restangular', 'PowerCatalog',
'HasPowerCatalog',
function($scope, Restangular, PowerCatalog, HasPowerCatalog) {
    PowerCatalog.onReady(function(){
        $scope.hasPower._power = PowerCatalog.getItem($scope.hasPower.power);
    });

    $scope.use_power = function(){
        $scope.hasPower.used = !$scope.hasPower.used;
        Restangular.one('has_power', $scope.hasPower.id).get().then(
            function(data) {
                data.used = $scope.hasPower.used;
                data.put();
            });
    };
}])

.controller('HasConditionListController', ['$rootScope','$scope',
'Restangular', 'ConditionCatalog',
function($rootScope, $scope, Restangular, ConditionCatalog, HasConditionCatalog) {
    // gets executed always
    ConditionCatalog.onReady(function() {
        $scope.conditionList = $scope.character.has_conditions;
        for(var i=0, len=$scope.conditionList.length; i<len; i++)
        {
            // The data comes wuth only the pk reference, so we fill it whole
            var name = $scope.conditionList[i].condition;
            $scope.conditionList[i]._condition = ConditionCatalog.getItem(name);
        }
    });

    $scope.remove_condition = function(hci){
        Restangular.one('has_condition', $scope.conditionList[hci].id)
            .remove().then(null, function() {window.alert("No sync");});

        $scope.conditionList.splice(hci, 1);
    };
    $scope.condition_drop = function(e,o,characterIndex) {
        // The condition dropped is the raw Restangular condition object
        var condition = $scope.conditionList.pop();
        // Create a has_condition from it
        var hasCondition = {
            character: $scope.character.id,
            condition: condition.name,
            ends: 'T',
            started_round: 1,
            started_init: 1,
            _condition: condition
        };

        Restangular.all('has_condition').post(hasCondition).then(function(hc) {
            for(var i=0, len=$scope.conditionList.length; i<len; i++)
            {
                var entry = $scope.conditionList[i];
                if(!entry.id && entry.condition == hc.condition)
                    entry.id = hc.id;
            }
        });

        $scope.conditionList.push(hasCondition);
        $rootScope.$broadcast('Condition.dropped');
    };
}])

.controller('ModalController', ['$scope', 'WizardsService',
    function($scope, WizardsService) {
        $scope.wizardsModal = false;
        $scope.close = function() { $scope.wizardsModal = false; }
        $scope.$on('WizardsService.fetching', function(event, detailTag) {
            $scope.wizardsModal = true;
        });
        $scope.$on('WizardsService.fetch', function(event, detailTag) {
            $scope.detailTag = detailTag.html();
        });
}]);
