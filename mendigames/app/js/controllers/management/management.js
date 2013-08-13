'use strict';

angular.module('mendigames')

.controller('ManagementCtrl', ['$scope', '$routeParams', 'EM', 'Ocam','$location',
function($scope, $routeParams, EM, Ocam, $location) {
    var entitiesMetadata = {
        'campaign': { _2o: [], _2m: [], query: {id: $routeParams.campaignId}},
        'character': { _2o: ['container'], _2m: [],
            query: {campaign: $routeParams.campaignId}},
        'container': { _2o: [], _2m: [], query: {campaign: $routeParams.campaignId}},
    };
    var syncEntities = [
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.character', function(){
        var fullList = EM.list('character');
        $scope.characterList = [];
        for (var i = fullList.length - 1; i >= 0; i--) {
            if(fullList[i].type!=='Enemy')
                $scope.characterList.push(fullList[i]);
        }
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
    });

    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.delete_character = function(chi, c) {
        Ocam.delete_character(c);
    };

    $scope.edit_character = function(c) {
        $location.path('/campaign/'+$scope.campaignId+'/management/character/'+c.id+'/');
    };

    $scope.add_character = function(c) {
        $location.path('/campaign/'+$scope.campaignId+'/management/character/');
    };
}]);