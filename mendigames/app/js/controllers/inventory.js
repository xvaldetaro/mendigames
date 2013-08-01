'use strict';

angular.module('mendigames')

.controller('InventoryCtrl', ['$scope','$routeParams','EM','WizardsService',
function($scope, $routeParams, EM, WizardsService) {
    var entitiesMetadata = {
        'item': {pk: 'id', related: [], query: {hasitem__isnull: false}},
        'campaign': {pk: 'id', related: [], query: {id: $routeParams.campaignId}},
        'character': {pk: 'id', related: ['has_item'],
            query: {campaign: $routeParams.campaignId, type: 'Player'}},
        'has_item': {pk: 'id', related: ['item'],
            query: {character__campaign: $routeParams.campaignId}}
    };
    var syncEntities = [
        'character',
        'campaign',
        'has_item'
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.character', function(){
        var newList = EM.listSlice('character');
        $scope.characterList = newList;
        $scope.character = $scope.characterList[0];
        $scope.$apply();
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
        $scope.title = $scope.campaign.name;
        $scope.$apply();
    });

    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.fetch_from_compendium = function(item) {
        WizardsService.fetch(item.wizards_id, 'item', 'item',item);
    };
}])

.controller('CharacterInventoryCtrl', ['$scope','Och',
function($scope, Och) {
    $scope.item_drop = function(item) {

        Och.add_item($scope.c, item);
    };
    $scope.accept_item = function(item) {
        return !(item.wizards_id === undefined);
    };
    $scope.predicate = '_item.cost';
    $scope.set_predicate = function(predicate) {
        predicate = '_item.'+predicate;
        if($scope.predicate == predicate)
            $scope.predicate_reverse = !$scope.predicate_reverse;
        $scope.predicate = predicate;
    };
}])

.controller('ItemFinderCtrl', ['$scope','EM','Och',
function($scope, EM, Och) {
    $scope.categories = [
        {name: 'Armor', value: 'ARMO'},
        {name: 'Arms', value: 'ARMS'},
        {name: 'Item Set', value: 'ITEM'},
        {name: 'Wondrous', value: 'WOND'},
        {name: 'Ammunition', value: 'AMMU'},
        {name: 'Waist', value: 'WAIS'},
        {name: 'Alternative Reward', value: 'ALTE'},
        {name: 'Head', value: 'HEAD'},
        {name: 'Familiar', value: 'FAMI'},
        {name: 'Artifact', value: 'ARTI'},
        {name: 'Companion', value: 'COMP'},
        {name: 'Hands', value: 'HAND'},
        {name: 'Consumable', value: 'CONS'},
        {name: 'Mount', value: 'MOUN'},
        {name: 'Neck', value: 'NECK'},
        {name: 'Weapon', value: 'WEAP'},
        {name: 'Implement', value: 'IMPL'},
        {name: 'Equipment', value: 'EQUI'},
        {name: 'Alchemical Item', value: 'ALCH'},
        {name: 'Feet', value: 'FEET'},
        {name: 'Head and Neck', value: 'HEAD'},
        {name: 'Ring', value: 'RING'},
    ];

    $scope.rarities = [
        {name: 'Rare', value: 'R'},
        {name: 'Uncommon', value: 'U'},
        {name: 'Mundane', value: 'A'},
        {name: 'Common', value: 'C'},
    ];

    function got_item_finder(list){
        $scope.item_finder = list.data.data;
        $scope.pageCount = Math.ceil($scope.item_finder.count/100)
        $scope.$apply();
    }
    $scope.item_finder_search = function(page) {
        var query = {};

        if(!page)
            $scope.currentPage = 1;
        else
            $scope.currentPage = page;
        if($scope.item_name)
            query.name__icontains = $scope.item_name;
        if($scope.category)
            query.category = $scope.category.value;
        if($scope.rarity)
            query.rarity = $scope.rarity.value;
        if($scope.level_start)
            query.level__gte = $scope.level_start;
        if($scope.level_stop)
            query.level__lte = $scope.level_stop;
        if($scope.cost_start)
            query.cost__gte = $scope.cost_start;
        if($scope.cost_stop)
            query.cost__lte = $scope.cost_stop;
        query.page = $scope.currentPage;
        EM.just_fetch_list('item_page',query).then(got_item_finder);
        $scope.current_query = query;
    };

    $scope.goto_page = function(page) {
        $scope.current_query.page = page;
        EM.just_fetch_list('item_page',$scope.current_query).then(got_item_finder);
    }

    $scope.predicate = 'level';
    $scope.set_predicate = function(predicate) {
        if($scope.predicate == predicate)
            $scope.predicate_reverse = !$scope.predicate_reverse;
        $scope.predicate = predicate;
    };

    $scope.item_drop = function(hi) {
        if(!hi.character)
            return;

        var c = EM.by_key('character', hi.character);
        Och.remove_item(c, hi);
    };
}]);