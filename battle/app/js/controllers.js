'use strict';

var CampaignListCtrl = function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
};
CampaignListCtrl.$inject = ['$scope','Restangular'];

var CampaignCtrl = function($scope, $timeout, Restangular, $routeParams, roll, $http) {
    var campaignId = $routeParams.campaignId;

    // Character specific editable fields models
    $scope.change_hp = {};
    $scope.change_xp = {};
    $scope.change_gold = {};
    $scope.set_init = {};
    $scope.active_tab = {};

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
    function character_poll(){
        Restangular.all('character').getList(params).then(function(character_list){
            $scope.character_list = character_list;
            $timeout(character_poll,2000);
        });
    }
    //$timeout(character_poll,2000);

    // --------------- Register the watchers
    var watcher = function(newValue,oldValue){
                if(newValue == oldValue)
                    return;

                newValue.put(); };

    Restangular.all('character').getList(params).then(function(character_list){
        $scope.character_list = character_list;

        // Listeners for every character in the list
        for (var i=0;i<character_list.length;i++) {
            $scope.$watch('character_list['+i+']', watcher);
        }

        // Initialize the character specific variables
        for (var i=0;i<character_list.length;i++) {
            $scope.active_tab[character_list[i].id] = 'status';
        }
    });
    Restangular.one('campaign', campaignId).get().then(function(campaign){
        $scope.campaign = campaign;
        $scope.$watch('campaign', watcher, true);
    });

    // ----------- EVENT HANDLERS:
    $scope.changeHp = function(character, value){
        character.used_hit_points =
            character.used_hit_points-parseInt(value);
    };
    $scope.set_init = function(character, init){
        character.init = parseInt(init);
    };
    $scope.roll_init = function(character, init){
        character.init = roll(init);
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
    $scope.spend_hs = function(character){
        character.used_healing_surges = character.used_healing_surges+1;
    };
    $scope.award_milestone = function(character){
        character.milestones = character.milestones+1;
    };
    $scope.use_power = function(power){
        power.used = true;
        Restangular.one('has_power', power.has_power_id).get().then(function(got_power){
            got_power.used = true;
            got_power.put();
        });
    };
    $scope.recharge_power = function(power){
        power.used = false;
        Restangular.one('has_power', power.has_power_id).get().then(function(got_power){
            got_power.used = false;
            got_power.put();
        });
    };
    $scope.fetch_from_compendium = function(power){
        $http({
            url: '/dndinsider/compendium/power.aspx?id='+power.id,
            method: 'GET',
            dataType: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }).
        success(function(data){
            var fakedom = $('<div></div>');
            fakedom.html(data.replace('<img src="images/bullet.gif" alt=""/>','<i class="icon-star"></i>'));
            $('span[id|="detailPlaceholder"]').append($('div[id|="detail"]', fakedom));
        });
    };
};
CampaignCtrl.$inject = ['$scope','$timeout','Restangular', '$routeParams', 'roll', '$http'];

var CharacterCtrl = function($scope, Restangular, $routeParams) {
    var characterId = $routeParams.characterId;
    Restangular.one('character', characterId).get().then(function(character){
        $scope.character = character;
    });
};
CharacterCtrl.$inject = ['$scope', 'Restangular', '$routeParams'];

angular.module('battle.controllers', ['restangular','battle.services']).
    controller('CampaignListCtrl', CampaignListCtrl).

    controller('CampaignCtrl', CampaignCtrl).

    controller('CharacterCtrl', CharacterCtrl).

    config(['RestangularProvider',function(RestangularProvider) {
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
    }]);
