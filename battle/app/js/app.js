'use strict';


// Declare app level module which depends on filters, and services
angular.module('battle', ['djangular','battle.filters', 'battle.services', 'battle.directives', 'battle.controllers']).
  config(['$routeProvider','DjangoProperties', function($routeProvider, DjangoProperties) {
    $routeProvider.when('/view1', {templateUrl: DjangoProperties.STATIC_URL + 'battle/partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: DjangoProperties.STATIC_URL + 'battle/partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
