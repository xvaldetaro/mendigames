'use strict';

angular.module('mendigames')

.controller('InventoryCtrl', ['$scope','$routeParams','EM','WizardsService','$dialog',
function($scope, $routeParams, EM, WizardsService,$dialog) {
    var entitiesMetadata = {
        'item': {pk: 'id', related: [], query: {hasitem__isnull: false}},
        'template_item': {pk: 'id', related: [], query: {}},
        'campaign': {pk: 'id', related: [], query: {id: $routeParams.campaignId}},
        'character': {pk: 'id', related: ['has_item'],
            query: {campaign: $routeParams.campaignId, type: 'Player'}},
        'has_item': {pk: 'id', related: ['item','template_item'],
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
        if(item.item !== undefined)
            item = item._item;
        WizardsService.fetch(item.wizards_id, 'item', 'item',item);
    };

    $scope.prices = [
        {text:'Free',value:0},
        {text:'25%',value:0.25},
        {text:'50%',value:0.5},
        {text:'75%',value:0.75},
        {text:'100%',value:1},
    ];
    $scope.buy_adjustment = $scope.prices[0];
    $scope.sell_adjustment = $scope.prices[0];
    $scope.inputDialog = $dialog.dialog({
        templateUrl:  '/static/mendigames/partials/dialogs/input.html',
        controller: 'InputDialogController'
    });
    $scope.createItemDialog = $dialog.dialog({
        templateUrl:  '/static/mendigames/partials/dialogs/create_item.html',
        controller: 'CreateItemDialogController'
    })
}])

.controller('CharacterInventoryCtrl', ['$scope','Och','EM',
function($scope, Och, EM) {
    $scope.change_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Och.change_gold($scope.c, result);
        });
    };
    $scope.item_drop = function(item) {
        var cost = item.cost * $scope.buy_adjustment.value;
        if($scope.c.gold < cost) {
            window.alert($scope.c.name+' has insufficient gold');
            return;
        }
        if(item.rarity!=='A' && (item.category==='ARMO' || item.category==='WEAP')) {
            $scope.createItemDialog.options.resolve['item'] = function(){ 
                return item; 
            };
            $scope.createItemDialog.open().then(function(result){
                if(!result)
                    result = EM.by_key('template_item',item.category);
                Och.add_item($scope.c, item, cost, result);
            });
            return;
        } 

        Och.add_item($scope.c, item, cost, EM.by_key('template_item',item.category));
    };
    $scope.accept_item = function(item) {
        return item.item === undefined;
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
        {name: '----', value: ''},
        {name: 'Alchemical Item', value: 'ALCH'},
        {name: 'Alternative Reward', value: 'ALTE'},
        {name: 'Ammunition', value: 'AMMU'},
        {name: 'Armor', value: 'ARMO'},
        {name: 'Arms', value: 'ARMS'},
        {name: 'Artifact', value: 'ARTI'},
        {name: 'Companion', value: 'COMP'},
        {name: 'Consumable', value: 'CONS'},
        {name: 'Equipment', value: 'EQUI'},
        {name: 'Familiar', value: 'FAMI'},
        {name: 'Feet', value: 'FEET'},
        {name: 'Hands', value: 'HAND'},
        {name: 'Head', value: 'HEAD'},
        {name: 'Implement', value: 'IMPL'},
        {name: 'Item Set', value: 'ITEM'},
        {name: 'Mount', value: 'MOUN'},
        {name: 'Neck', value: 'NECK'},
        {name: 'Ring', value: 'RING'},
        {name: 'Waist', value: 'WAIS'},
        {name: 'Weapon', value: 'WEAP'},
        {name: 'Wondrous', value: 'WOND'},
    ];

    $scope.rarities = [
        {name: '----', value: ''},
        {name: 'Mundane', value: 'A'},
        {name: 'Common', value: 'C'},
        {name: 'Uncommon', value: 'U'},
        {name: 'Rare', value: 'R'},
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

        var cost = hi._item.cost * $scope.sell_adjustment.value;
        var c = EM.by_key('character', hi.character);
        Och.remove_item(c, hi, cost);
    };
}]);