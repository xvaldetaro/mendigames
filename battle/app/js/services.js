'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('battle.services', ['ngResource']).
    factory('Character', function($resource) {
        return $resource('/battle/character/:characterId',
            {format:'json', characterId:'@id'});
    });
