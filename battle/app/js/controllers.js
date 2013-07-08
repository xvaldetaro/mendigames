'use strict';

var CampaignListCtrl = function($scope, $http) {
    $http.get('/battle/api/campaign/?format=json').success(function(data) {
        $scope.campaign_list = data.objects;
    });
};
CampaignListCtrl.$inject = ['$scope','$http'];

var CampaignDetailCtrl = function($scope, $http, $routeParams) {
    var url = '/battle/api/campaign/'+$routeParams.campaignId+'/?format=json';

    $http.get(url).success(function(data) {
        $scope.campaign_detail = data;
    });
};
CampaignListCtrl.$inject = ['$scope','$http', '$routeParams'];

angular.module('battle.controllers', []).
    controller('CampaignListCtrl', CampaignListCtrl);
