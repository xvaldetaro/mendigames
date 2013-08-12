'use strict';

angular.module('mendigames')

.controller('ManagementCtrl', ['$scope', '$routeParams', 'EM', 'Ocam','$location',
function($scope, $routeParams, EM, Ocam, $location) {
    var entitiesMetadata = {
        'campaign': { _2o: [], _2m: [], query: {id: $routeParams.campaignId}},
        'condition': { _2o: [], _2m: [], query: {}},
        'power': { _2o: [], _2m: [], query: {haspower__isnull: false}},
        'has_power': { _2o: ['power'], _2m: [],
            query: {character__campaign: $routeParams.campaignId}},
        'character': { _2o: [], _2m: ['has_power'],
            query: {campaign: $routeParams.campaignId}}
    };
    var syncEntities = [
        'has_power',
        'character',
        'campaign'
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.character', function(){
        $scope.characterList = EM.listSlice('character');
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