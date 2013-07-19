'use strict';

var condition_icons = {
    'Blinded': 'icon-eye-close',
    'Dazed': 'icon-camera',
    'Deafened': 'icon-volume-off',
    'Dominated': 'icon-user',
    'Dying': 'icon-arrow-down',
    'grabbed': 'icon-magnet',
    'Helpless': 'icon-flag',
    'hidden': 'icon-search',
    'Immobilized': 'icon-lock',
    'Petrified': 'icon-stop',
    'Prone': 'icon-chevron-down',
    'removed from play': 'icon-share-alt',
    'Restrained': 'icon-shopping-cart',
    'Slowed': 'icon-fast-backward',
    'Stunned': 'icon-warning-sign',
    'Surprised': 'icon-warning-sign',
    'Unconscious': 'icon-bell',
    'Weakened': 'icon-plus'
};

angular.module('battle.services', ['restangular']).
    factory('roll', function(){ return function(mod){
        if(isNaN(mod))
            return _.random(1,20);
        return parseInt(mod)+_.random(1,20);
    };}).
    factory('ConditionIcon', function(){ return function(condition) {
        return condition_icons[condition.name];
    };}).
    factory('NameDict', function(){ return function(list, key) {
        var nd = {};
        for(var i=0, len=list.length; i < len; i++)
        {
            var item = list[i];
            nd[item[key]] = item;
        }
        return nd;
    };}).
    factory('WizardsService', ['$rootScope', '$http', function($rootScope, $http){
        return {
            fetch: function(id, model) {
                $rootScope.$broadcast('WizardsService.fetching');
                $http({
                    url: '/dndinsider/compendium/'+model+'.aspx?id='+id,
                    method: 'GET',
                    dataType: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }).
                success(function(data){
                    var fakedom = $('<div></div>');
                    fakedom.html(data.replace('<img src="images/bullet.gif" alt=""/>','<i class="icon-star"></i>'));
                    $rootScope.$broadcast('WizardsService.fetch', $('div[id|="detail"]', fakedom));
                });
            }
        };
    }]).
    config(function(RestangularProvider) {
    RestangularProvider.setBaseUrl("/battle");
    RestangularProvider.setDefaultRequestParams({format: 'json'});

    // Now let's configure the response extractor for each request
   //  RestangularProvider.setResponseExtractor(function(response, operation, what, url) {
   //      // This is a get for a list
   //      var newResponse;
   //      if (operation === "getList") {
   //          // Here we're returning an Array which has one special property metadata with our extra information
   //          newResponse = response.results;
   //          newResponse.metadata = {"count": response.count,
   //                                  "next": response.next,
   //                                  "previous": response.previous };
   //      } else {
   //          // This is an element
   //          newResponse = response;
   //      }
   //      return newResponse;
   // });
});
