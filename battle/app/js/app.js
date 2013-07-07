"use strict";

var makeRoute = function(static_url, route) {
    return {templateUrl: static_url+'battle/partials/'+route+'.html',
            controller: route.charAt(0).toUpperCase()+route.slice(1)+'Ct'};
};

function battleConfigFn($routeProvider, DjangoProperties) {
    var static_url = DjangoProperties.STATIC_URL;

    $routeProvider.when('/campaigns', makeRoute(static_url, 'campaigns') );
    $routeProvider.when('/characters', makeRoute(static_url, 'characters') );
    $routeProvider.when('/powers', makeRoute(static_url, 'powers') );
    $routeProvider.when('/items', makeRoute(static_url, 'items') );
    $routeProvider.when('/home', makeRoute(static_url, 'home') );
    $routeProvider.otherwise({redirectTo: '/home'});
}

// Declare app level module which depends on filters, and services
angular.module('battle',
    ['djangular','battle.filters', 'battle.services', 'battle.directives',
        'battle.controllers']).
    config(['$routeProvider','DjangoProperties', battleConfigFn]);
