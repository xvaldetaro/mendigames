'use strict';

var CampaignListCtrl = function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
};
CampaignListCtrl.$inject = ['$scope','Restangular'];

var CampaignCtrl = function($scope, $timeout, Restangular, $routeParams) {
    var campaignId = $routeParams.campaignId;

    // ----------- Create the polling
    // Polls campagin details every 10sec
    function campaign_poll(){
        Restangular.one('campaign', campaignId).get().then(function(campaign){
            $scope.campaign = campaign;
            $timeout(campaign_poll,10000);
        });
    }
    $timeout(campaign_poll,10000);

    // Polls character list every 2sec
    var params = {campaignId: campaignId};
    function character_poll(){
        Restangular.all('character').getList(params).then(function(character_list){
            $scope.character_list = character_list;
            $timeout(character_poll,2000);
        });
    }
    $timeout(character_poll,2000);

    // --------------- Register the watchers
    var watcher = function(newValue,oldValue){
                if(newValue == oldValue)
                    return;

                newValue.put(); };

    Restangular.all('character').getList(params).then(function(character_list){
        $scope.character_list = character_list;

        // Listeners for every character in the list
        for (var i=0;i<character_list.length;i++) {
            $scope.$watch('character_list['+i+']', watcher, true);
        }
    });
    Restangular.one('campaign', campaignId).get().then(function(campaign){
        $scope.campaign = campaign;
        $scope.$watch('campaign', watcher, true);
    });

    // ----------- EVENT HANDLERS:
    // Character specific editable fields models
    $scope.change_hp = {};
    $scope.change_xp = {};
    $scope.change_gold = {};
    $scope.set_init = {};

    $scope.changeHp = function(character){
        character.used_hit_points =
            character.used_hit_points+parseInt($scope.change_hp[character.id]);

        character.put();
    };
    $scope.setInit = function(character){
        character.init = parseInt($scope.set_init[character.id]);
    };
    $scope.changeXp = function(character){
        character.experience_points =
            character.experience_points+parseInt($scope.change_xp[character.id]);
    };
    $scope.changeGold = function(character){
        character.gold = character.gold+parseInt($scope.change_gold[character.id]);
    };
    $scope.shortRest = function(character){
        character.milestones = character.milestones-character.milestones%2;
    };
    $scope.extRest = function(character){
        $scope.shortRest(character);
        character.milestones = 0;
        character.used_action_points = 0;
        character.used_healing_surges = 0;
    };
    $scope.spendAp = function(character){
        character.used_action_points = character.used_action_points+1;
    };
    $scope.spendHs = function(character){
        character.used_healing_surges = character.used_healing_surges+1;
    };
    $scope.awardMilestone = function(character){
        character.milestones = character.milestones+1;
    };
};
CampaignCtrl.$inject = ['$scope','$timeout','Restangular', '$routeParams'];

var CharacterCtrl = function($scope, Restangular, $routeParams) {
    var characterId = $routeParams.characterId;
    Restangular.one('character', characterId).get().then(function(character){
        $scope.character = character;
    });
};
CharacterCtrl.$inject = ['$scope', 'Restangular', '$routeParams'];

angular.module('battle.controllers', ['restangular']).
    controller('CampaignListCtrl', CampaignListCtrl).

    controller('CampaignCtrl', CampaignCtrl).

    controller('CharacterCtrl', CharacterCtrl).

    config(function(RestangularProvider) {
        RestangularProvider.setBaseUrl("/battle");

        RestangularProvider.setDefaultRequestParams({format: 'json'});

        // Now let's configure the response extractor for each request
        RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
            // This is a get for a list
            var newResponse;
            if (operation === "getList") {
                // Here we're returning an Array which has one special property metadata with our extra information
                newResponse = response.results;
                newResponse.metadata = {"count": response.count,
                                        "next": response.next,
                                        "previous": response.previous };
            } else {
                // This is an element
                newResponse = response;
            }
            return newResponse;
        });
    });
