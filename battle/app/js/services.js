'use strict';

angular.module('battle.services', ['restangular']).
    factory('roll', function(){ return function(mod){
        if(isNaN(mod))
            return _.random(1,20);
        return parseInt(mod)+_.random(1,20)
        ;};}
    ).
    config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("/battle");
    RestangularProvider.setDefaultRequestParams({format: 'json'});

    // Now let's configure the response extractor for each request
    RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
        // This is a get for a list
        var newResponse;
        if (operation === "getList") {
            // Here we're returning an Array which has one special property metadata with our extra information
            newResponse = response.results;
            newResponse.metadata = {"count": response.count,
                                    "next": response.next,
                                    "previous": response.previous };
        } else {
            // This is an element
            newResponse = response;
        }
        return newResponse;
   });
});
