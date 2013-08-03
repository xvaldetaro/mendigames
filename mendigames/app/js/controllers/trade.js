'use strict';

angular.module('mendigames')

.controller('TradeCtrl', ['$scope','$routeParams','EM','WizardsService','$dialog',
function($scope, $routeParams, EM, WizardsService,$dialog) {
    var campaign = $routeParams.campaignId;
    var entitiesMetadata = {
        'campaign': { related: [], query: { id: campaign } },
        'container': { related: ['item', 'campaign'], query: { campaign: campaign} },
        'item': { related: ['item_decorator','item_template', 'container'], 
            query: {container__campaign: campaign}},
        'item_decorator': { related: ['item_category', 'item_group'], query: {
            items__isnull: false } },
        'item_category': { related: ['item_group'] },
        'item_group': { related: ['item_template', 'item_category', 'item_decorator'] },
        'item_template': { related: ['item_group'] }
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
            item = Oit.item_from_decorator(itemBase);
        } else {
            item = Oit.item_from_template(itemBase);
        }
        Ocont.buy_item($scope.cont, item, cost_adjustment).then(function(newE) {
            $scope.$apply();
        });
    };
}])

.controller('ItemFinderCtrl', ['$scope','EM','Ocont',
function($scope, EM, Ocont) {
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

    $scope.item_drop = function(item) {
        Ocont.sell_item(item, $scope.sell_adjustment.value);
    };
}]);