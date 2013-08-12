'use strict';

angular.module('mendigames')

.controller('ManagementCharacterCtrl', ['$scope', '$routeParams', 'EM', 'Och','$location',
'Ocam',
function($scope, $routeParams, EM, Och, $location, Ocam) {
    var entitiesMetadata = {
        'power': { _2o: [], _2m: [], query: {haspower__isnull: false}},
        'has_power': { _2o: ['power'], _2m: [],
            query: {character__campaign: $routeParams.campaignId}},
        'character': { _2o: [], _2m: ['has_power'],
            query: {campaign: $routeParams.campaignId}},
        'container': { _2o: [], _2m: [], query: { campaign: $routeParams.campaignId} },
    };
    var syncEntities = [
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.character', function(){
        if(!$routeParams.characterId) {
            $scope.c = {type: 'Player', campaign: $routeParams.campaignId};
        } else {
            $scope.c = EM.by_key('character', $routeParams.characterId);
        }
    });

    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.cTypes = ['Player', 'Neutral', 'Enemy'];

    $scope.save = function() {
        if($routeParams.characterId!=='') {
            Och.save($scope.c).then(function() {
                $location.path('/campaign/'+$routeParams.campaignId+'/management/');
            });
        } else {
            Ocam.add_character($scope.c).then(function() {
                $location.path('/campaign/'+$routeParams.campaignId+'/management/');
            });
        }
    };
    $scope.cancel = function() {
        $location.path('/campaign/'+$routeParams.campaignId+'/management/');
    };
}]);