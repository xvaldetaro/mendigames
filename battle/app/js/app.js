"use strict";

var makeRoute = function(static_url, route, ctrl_name) {
    return {templateUrl: static_url+'battle/partials/'+route+'.html',
            controller: ctrl_name};
};

function battleConfigFn($routeProvider, DjangoProperties) {
    var static_url = DjangoProperties.STATIC_URL;

    $routeProvider.when('/campaign_list', makeRoute(static_url, 'campaign_list',
        'CampaignListCtrl') );

    $routeProvider.when('/character_list', makeRoute(static_url,
        'character_list', 'CharacterListCtrl') );

    $routeProvider.when('/power_list', makeRoute(static_url, 'power_list',
        'PowerListCtrl') );

    $routeProvider.when('/item_list', makeRoute(static_url, 'item_list',
        'ItemListCtrl') );

    $routeProvider.when('/home', makeRoute(static_url, 'home',
        'HomeCtrl') );

    $routeProvider.otherwise({redirectTo: '/home'});

    // Detail routes
    $routeProvider.when('/campaign/:campaignId', makeRoute(static_url,
        'campaign', 'CampaignCtrl') );

    $routeProvider.when('/character/:characterId', makeRoute(static_url,
        'character', 'CharacterCtrl') );
}

// Declare app level module which depends on filters, and services
angular.module('battle',
    ['djangular','battle.filters', 'battle.services', 'battle.directives',
        'battle.controllers']).
    config(['$routeProvider','DjangoProperties', battleConfigFn]);
