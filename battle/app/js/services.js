'use strict';

angular.module('battle.services', ['restangular']).config(function(RestangularProvider) {
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
