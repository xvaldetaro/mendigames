angular.module('mendigames')

.controller('CampaignListCtrl', ['$scope','Restangular',
function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
}])

.controller('NavbarCtrl', ['$scope','$location','$routeParams',
function($scope, $location, $routeParams) {
    $scope.campaign = $routeParams.campaignId;
    $scope.isActive = function (viewLocation) {
        var active = ($location.path().indexOf(viewLocation) !== -1);
        return active ? "active" : "";
    };
}]);
