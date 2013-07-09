'use strict';

var CampaignListCtrl = function($scope, $http) {
    $http.get('/battle/campaign/.json').success(function(data) {
        $scope.campaign_list = data.results;
    });
};
CampaignListCtrl.$inject = ['$scope','$http'];

var CampaignDetailCtrl = function($scope, $http, $routeParams) {
    var url_detail = '/battle/campaign/'+$routeParams.campaignId+'/.json';
    var url_c_list = '/battle/character/?format=json&campaign='+$routeParams.campaignId;

    $http.get(url_detail).success(function(data) {
        $scope.campaign = data;
    });

    $http.get(url_c_list).success(function(data) {
        $scope.character_list = data.results;
    });
};
CampaignListCtrl.$inject = ['$scope','$http', '$routeParams'];

angular.module('battle.controllers', []).
    controller('CampaignListCtrl', CampaignListCtrl);
