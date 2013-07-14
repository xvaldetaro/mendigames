'use strict';

var CampaignListCtrl = function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
};
CampaignListCtrl.$inject = ['$scope','Restangular'];

var CampaignCtrl = function($scope, Restangular, $routeParams) {
    var campaignId = $routeParams.campaignId;
    Restangular.one('campaign', campaignId).get().then(function(campaign){
        $scope.campaign = campaign;
    });

    var params = {campaignId: campaignId};
    Restangular.all('character').getList(params).then(function(character_list){
        $scope.character_list = character_list;
    });

    $scope.change_hp = {};

    $scope.damage = function(character){
        character.used_hit_points += parseInt($scope.change_hp[character.id]);
    };
};
CampaignCtrl.$inject = ['$scope','Restangular', '$routeParams'];

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
