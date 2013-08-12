"use strict";

angular.module('mendigames',
['djangular','restangular','ui.bootstrap','btford.dragon-drop','ngSanitize'])

.config(['$routeProvider','DjangoProperties',function ($routeProvider,DjangoProperties){
    var static_url = DjangoProperties.STATIC_URL;

    $routeProvider.when('/campaign_list', {
        templateUrl: static_url+'mendigames/partials/campaign_list.html',
        controller: 'CampaignListCtrl'
    });

    $routeProvider.otherwise({redirectTo: '/campaign_list'});

    $routeProvider.when('/campaign/:campaignId/combat/', {
        templateUrl: static_url+'mendigames/partials/combat.html',
        controller: 'CombatCtrl'
    });

    $routeProvider.when('/campaign/:campaignId/trade/', {
        templateUrl: static_url+'mendigames/partials/trade.html',
        controller: 'TradeCtrl'
    });

    // Management routes
    $routeProvider.when('/campaign/:campaignId/management/', {
        templateUrl: static_url+'mendigames/partials/management/management.html',
        controller: 'ManagementCtrl'
    });
    $routeProvider.when('/campaign/:campaignId/management/character/:characterId', {
        templateUrl: static_url+'mendigames/partials/management/character.html',
        controller: 'ManagementCharacterCtrl'
    });
}])

.config(function(RestangularProvider) {
    RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
        // This is a get for a list
        if(response.data) {
            var newResponse;
            newResponse = response.data;
            newResponse.metadata = {revision: response.revision};
            return newResponse;
        }
        return {};
    });
});
