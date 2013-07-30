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

.controller('CharacterInventoryCtrl', ['$scope',
function($scope) {

}])

.controller('ShopCtrl', ['$scope','EM',
function($scope, EM) {
    $scope.$on('EM.new_list.item', function(){
        $scope.shop = EM.listSlice('item');
        $scope.$apply();
    });

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

    $scope.shop_search = function() {
        var query = {};
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
        EM.fetch('item',query).then(function(){
            $scope.shop = EM.listSlice('item');
            $scope.$apply();
        });
    };

    $scope.predicate = 'name';
    $scope.set_predicate = function(predicate) {
        if($scope.predicate == predicate)
            $scope.predicate_reverse = !$scope.predicate_reverse;
        $scope.predicate = predicate;
    };
}]);