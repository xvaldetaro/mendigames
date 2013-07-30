'use strict';

angular.module('mendigames')

.controller('InventoryCtrl', ['$scope','$routeParams','EM',
function($scope, $routeParams, EM) {
    var entitiesMetadata = {
        'item': {pk: 'id', related: [], query: {hasitem__isnull: false}},
        'campaign': {pk: 'id', related: [], query: {id: $routeParams.campaignId}},
        'character': {pk: 'id', related: ['has_item'],
            query: {campaign: $routeParams.campaignId, type: 'Player'}},
        'has_item': {pk: 'id', related: ['item'],
            query: {character__campaign: $routeParams.campaignId}}
    };
    var syncEntities = [
        'character',
        'campaign',
        'has_item'
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
    EM.start(entitiesMetadata, syncEntities);
}]);