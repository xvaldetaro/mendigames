'use strict';

angular.module('mendigames')

.controller('InventoryCtrl', ['$scope','$routeParams','EM','WizardsService','$dialog',
function($scope, $routeParams, EM, WizardsService,$dialog) {
    var campaign = $routeParams.campaignId;
    var entitiesMetadata = {
        'campaign': { related: [], query: { id: campaign } },
        'container': { related: ['item', 'campaign'], query: { campaign: campaign} },
        'item': { related: ['item_decorator','item_template', 'container'], 
            query: {campaign: campaign}},
        'item_decorator': { related: ['item_category', 'item_group'], query: {
            items__isnull: false } },
        'item_category': { related: ['item_group'] },
        'item_group': { related: ['item_template', 'item_category', 'item_decorator'] },
        'item_template': { related: ['item_group'], query: { items__isnull: false } }
    };
    var syncEntities = [
        'container',
        'campaign',
        'item'
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.container', function(){
        $scope.containerList = EM.list('container');
        $scope.container = $scope.containerList[0];
        $scope.$apply();
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
        $scope.$apply();
    });
    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.fetch_from_compendium = function(item) {
        var entity = 'item_decorator';
        if(item.rarity === undefined)
            entity = 'item_template'
        WizardsService.fetch(item.wizards_id, 'item', entity,item);
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
    $scope.$on('EM.new_list.item_category', function(){
        $scope.categoryList = EM.list('item_category');
        $scope.$apply();
    });

    $scope.get_category = function(itemDecorator) {
        return EM.by_key('item_category', itemDecorator.item_category)
    };
    $scope.rarityList = [
        {name: 'Common', value: 'C'},
        {name: 'Uncommon', value: 'U'},
        {name: 'Rare', value: 'R'},
    ];

    function got_item_finder(list){
        $scope.itemFinder = list.data.data;
        $scope.pageCount = Math.ceil($scope.itemFinder.count/100)
        $scope.$apply();
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
            query.item_category = $scope.category.id;
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
        EM.just_fetch_list('item_decorator_page',query).then(got_item_finder);
        $scope.current_query = query;
    };

    $scope.goto_page = function(page) {
        $scope.current_query.page = page;
        EM.just_fetch_list('item_decorator_page',$scope.current_query).then(got_item_finder);
    }

    $scope.predicate = 'level';
    $scope.set_predicate = function(predicate) {
        if($scope.predicate == predicate)
            $scope.predicate_reverse = !$scope.predicate_reverse;
        $scope.predicate = predicate;
    };

    $scope.item_drop = function(hi) {
        if(!hi.container)
            return;

        var cost = hi._item.cost * $scope.sell_adjustment.value;
        var c = EM.by_key('container', hi.container);
        Och.remove_item(c, hi, cost);
    };
}]);