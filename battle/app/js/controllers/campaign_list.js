angular.module('mendigames')

.controller('CampaignListCtrl', ['$scope','Restangular',
function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
}]);
