'use strict';

angular.module('mendigames')

.controller('InventoryCtrl', ['$scope','$routeParams','EM','EMController',
function($scope, $routeParams, EM, EMController) {
    var entitiesMetadata = {
        'campaign': {pk: 'id', related: [], query: {id: $routeParams.campaignId}},
        'character': {pk: 'id', related: ['has_condition','has_power'],
            query: {campaign: $routeParams.campaignId}}
    };
    var initEntities = [
        'campaign',
        'character'
    ];
    var syncEntities = [
        'character',
        'campaign'
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.character', function(){
        var newList = EM.listSlice('character');
        $scope.characterList = newList;
        $scope.$apply();
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
        $scope.title = $scope.campaign.name;
        $scope.$apply();
    });

    // Bootstrap the scope
    EM.fetch_multiple(initEntities);
}]);