'use strict';

angular.module('battle.controllers', ['restangular','battle.services', 'ui.bootstrap',
    'ngDragDrop', 'ngSanitize'])

.controller('CampaignListCtrl', ['$scope','Restangular',
function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
}]).

controller('CampaignCtrl', ['$scope','$timeout','Restangular', '$routeParams', 'roll', 
'$http', 'WizardsService','PowerCatalog', 'ConditionCatalog',
function($scope, $timeout, Restangular, $routeParams, roll, $http,
    WizardsService, PowerCatalog, ConditionCatalog) {

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
    function character_poll_timeout(){
        Restangular.all('character').getList(params).then(function(characterList){
            $scope.characterList = characterList;
            $timeout(character_poll_timeout,200000);
        });
    }
    character_poll_timeout();

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
    function initialize()
    {
        $scope.power = PowerCatalog.getItem($scope.hasPower.power);
    }
    PowerCatalog.onReady(initialize);
    $scope.$watch('character', initialize);

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
    function initialize() {
        var hcs = $scope.character.has_conditions;
        $scope.conditionList = [];
        for(var i=0, len=hcs.length; i<len; i++)
        {
            $scope.conditionList.push({
                hasCondition: hcs[i],
                condition: ConditionCatalog.getItem(hcs[i].condition)
            });
        }
    }
    ConditionCatalog.onReady(initialize);
    $scope.$watch('character', initialize);

    $scope.remove_condition = function(hci){
        var hc = $scope.conditionList[hci];
        var remoteHc = Restangular.one('has_condition', hc.hasCondition.id);
        remoteHc.remove().then(null, function() {window.alert("No sync")});
        $scope.character.has_conditions.splice(hci, 1);
        $scope.conditionList.splice(hci, 1);
    };
    $scope.condition_drop = function(e,o,characterIndex) {
        var list = $scope.conditionList, ch = $scope.character;
        // The condition dropped is the raw Restangular condition object
        var condition = list.pop();
        // Create a has_condition from it
        var hasCondition = {character: ch.id, condition: condition.name, ends: 'T',
                        started_round: 1, started_init: 1, name: condition.name,
                        wizards_id: condition.wizards_id};

        // Push into the viewable lists
        $scope.character.has_conditions.push(hasCondition);
        list.push({hasCondition: hasCondition, condition: condition})
        $rootScope.$broadcast('Condition.dropped');

        Restangular.all('has_condition').post(hasCondition).then(function(hc) {
            for(var i=0, len=$scope.conditionList.length; i<len; i++)
            {
                var entry = $scope.conditionList[i];
                if(!entry.hasCondition.id && entry.condition.name == hc.condition)
                    entry.hasCondition.id = hc.id;
            }
        });
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
