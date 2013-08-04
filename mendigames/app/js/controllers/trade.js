'use strict';

angular.module('mendigames')

.controller('TradeCtrl', ['$scope','$routeParams','EM','WizardsService','InputDialog','Ocam',
function($scope, $routeParams, EM, WizardsService,InputDialog, Ocam) {
    var campaign = $routeParams.campaignId;
    var entitiesMetadata = {
        'campaign': { _2o: [], _2m: [], query: { id: campaign } },
        'container': { _2o: ['campaign'], _2m: ['item'], query: { campaign: campaign} },
        'item': { _2o: ['magic','mundane', 'container'], _2m: [], 
            query: {container__campaign: campaign}},
        'magic': { _2o: ['category'], _2m: ['subtype'], query: {
            items__isnull: false } },
        'category': { _2o: [], _2m: ['subtype'] },
        'subtype': { _2o: ['category'], _2m: ['mundane', 'magic'] },
        'mundane': { _2o: ['subtype'], _2m: [] }
    };
    var syncEntities = [
        'container',
        'campaign',
        'item'
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.container', function(){
        var containers = Ocam.categorize_containers(EM.list('container'));
        $scope.plContList = containers.player;
        $scope.othContList = containers.other;
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
    });
    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.fetch_from_compendium = function(item) {
        var entity = 'magic';
        if(item.rarity === undefined)
            entity = 'mundane'
        WizardsService.fetch(item.wizards_id, 'item', entity,item);
    };

    $scope.split_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Ocam.split_gold($scope.campaign, $scope.plContList, result);
        });
    };
    $scope.mass_give_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Ocam.mass_give_gold($scope.campaign, $scope.plContList, result);
        });
    };
    $scope.new_container = function() {
        InputDialog('create_container').then(function(result) {
            Ocam.add_container(result.name, $scope.campaign, result.gold);
        });
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
}])

.controller('InventoryCtrl', ['$scope','Ocont', 'Oit', 'EM',
function($scope, Ocont, Oit, EM) {
    $scope.change_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Ocont.change_gold($scope.cont, result);
        });
    };
    // itemBase can be decorator, template or item
    $scope.item_drop = function(itemBase) {
        var cost_adjustment = $scope.buy_adjustment.value;
        var item = itemBase;
        if(itemBase.rarity) { // is decorator
            EM.merge_related('magic', [itemBase]);
            item = Oit.item_from_magic(itemBase);
        } else if(itemBase.core !== undefined) {
            item = Oit.item_from_mundane(itemBase);
        }
        Ocont.buy_item($scope.cont, item, cost_adjustment)
    };
}])

.controller('ContainerCtrl', ['$scope','Ocont', 'Oit', 'Ocam', 'EM',
function($scope, Ocont, Oit, Ocam, EM) {
    $scope.delete_container = function() {
        Ocam.remove_container($scope.cont);
    };
    $scope.loot_gold = function() {

    };
    // itemBase can be decorator, template or item
    $scope.item_drop = function(itemBase) {
        var cost_adjustment = $scope.sell_adjustment.value;
        var item = itemBase;
        if(itemBase.rarity) { // is decorator
            EM.merge_related('magic', [itemBase]);
            item = Oit.item_from_magic(itemBase);
        } else if(itemBase.core !== undefined) {
            item = Oit.item_from_mundane(itemBase);
        }
        Ocont.sell_item_transfer($scope.cont, item, cost_adjustment);
    };
}])

.controller('ItemFinderCtrl', ['$scope','EM','Ocont','$http',
function($scope, EM, Ocont, $http) {
    $scope.$on('EM.new_list.category', function(){
        $scope.categoryList = EM.list('category');
        
    });

    $scope.get_category = function(magic) {
        return EM.by_key('category', magic.category)
    };
    $scope.rarityList = [
        {name: 'Common', value: 'C'},
        {name: 'Uncommon', value: 'U'},
        {name: 'Rare', value: 'R'},
    ];

    function got_item_finder(list){
        $scope.itemFinder = list.data.data;
        $scope.pageCount = Math.ceil($scope.itemFinder.count/100)
        
    }
    function item_page_REST(query) {
        return $http.get('/magic_page', {params: query});
    }
    $scope.item_finder_search = function(page) {
        var query = {};
        if(!page)
            $scope.currentPage = 1;
        else
            $scope.currentPage = page;
        if($scope.itemName)
            query.name__icontains = $scope.itemName;
        if($scope.category)
            query.category = $scope.category.id;
        if($scope.rarity)
            query.rarity = $scope.rarity.value;
        if($scope.levelStart)
            query.level__gte = $scope.levelStart;
        if($scope.levelStop)
            query.level__lte = $scope.levelStop;
        if($scope.costStart)
            query.cost__gte = $scope.costStart;
        if($scope.costStop)
            query.cost__lte = $scope.costStop;
        query.page = $scope.currentPage;
        item_page_REST(query).then(got_item_finder);
        $scope.current_query = query;
    };

    $scope.goto_page = function(page) {
        $scope.current_query.page = page;
        item_page_REST($scope.current_query).then(got_item_finder);
    };

    $scope.predicate = 'level';
    $scope.set_predicate = function(predicate) {
        if($scope.predicate == predicate)
            $scope.predicate_reverse = !$scope.predicate_reverse;
        $scope.predicate = predicate;
    };

    $scope.item_drop = function(item) {
        Ocont.sell_item_destroy(item, $scope.sell_adjustment.value);
    };
}]);