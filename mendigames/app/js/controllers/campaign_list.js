angular.module('mendigames')

.controller('CampaignListCtrl', ['$scope','Restangular',
function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
}])

.controller('NavbarCtrl', ['$scope','$location','$routeParams','$http',
function($scope, $location, $routeParams, $http) {
    $scope.campaign = $routeParams.campaignId;
    $scope.isActive = function (viewLocation) {
        var active = ($location.path().indexOf(viewLocation) !== -1);
        return active ? "active" : "";
    };

    $scope.login = function() {
        $http.post('auth/', {username: $scope.username, password: $scope.password})
        .then(function(response) {
            window.alert('Logged in successfully');
        }, function(error) {
            window.alert('Unauthorized');
        }).then(function() {
            $scope.loginModal = false;
        });
    };

    $scope.cancel = function() {
        $scope.username = '';
        $scope.password = '';
        $scope.loginModal = false;
    };
}]);
