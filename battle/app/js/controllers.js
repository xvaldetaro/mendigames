'use strict';

var CampaignsCt = function($scope) {
    $scope.campaigns = [
        {"name": "Nervath",
        "participants": ["Digajigg", "Isildur", "Theokoles"]}
    ];
};
CampaignsCt.$inject = ['$scope'];

angular.module('battle.controllers', []).
    controller('CampaignsCt', CampaignsCt);
    