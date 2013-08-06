'use strict';

angular.module('mendigames')

.controller('TradeCtrl', ['$scope','$routeParams','EM','WizardsService','InputDialog',
'Ocam', 'Oit','$q',
function($scope, $routeParams, EM, WizardsService,InputDialog, Ocam, Oit, $q) {
    var campaign = $routeParams.campaignId;
    var entitiesMetadata = {
        'campaign': { _2o: [], _2m: [], query: { id: campaign } },
        'container': { _2o: ['campaign'], _2m: ['item'], query: { campaign: campaign} },
        'item': { _2o: ['magic','mundane', 'container'], _2m: [],
            query: {container__campaign: campaign}},
        'magic': { _2o: ['category'], _2m: ['subtype'], query: {
            items__isnull: false } },
        'category': { _2o: [], _2m: ['subtype', 'mundane'] },
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
        InputDialog('input',{title: 'Split Gold', label: 'Split how much?', size: 'mini'})
        .then(function(result){
            if(!result)
                return;
            Ocam.split_gold($scope.plContList, result);
        });
    };
    $scope.mass_give_gold = function () {
        InputDialog('input',{title: 'Give Gold', label: 'Give how much?', size: 'mini'})
        .then(function(result){
            if(!result)
                return;
            Ocam.mass_give_gold($scope.plContList, result);
        });
    };
    $scope.new_container = function() {
        InputDialog('create_container').then(function(result) {
            if(!result)
                return;
            Ocam.add_container(result.name, $scope.campaign, result.gold);
        });
    };
    function create_magic_item(magic) {
        var deferred = $q.defer();
        EM.merge_related('magic', magic);
        return InputDialog('create_item', { magic: magic }).then(function(result){
            if(!result)
                return;
            result.magic = magic;
            return Oit.get_item_dict(result);
        });
    }
    $scope.create_item = function(something) {
        var deferred = $q.defer();
        if(something.rarity) { // is decorator
            create_magic_item(something).then(function(item){
                if(!item)
                    deferred.reject();
                else
                    deferred.resolve(item);
            });
        } else if(something.core !== undefined) {
            deferred.resolve(Oit.item_from_mundane(something));
        }
        return deferred.promise;
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

.controller('InventoryCtrl', ['$scope','Ocont', 'Oit', 'EM','InputDialog',
function($scope, Ocont, Oit, EM, InputDialog) {
    $scope.change_gold = function () {
        InputDialog('input',{title: 'Change Gold', label: 'How much?', size: 'mini'})
        .then(function(result){
            if(!result)
                return;
            Ocont.change_gold($scope.cont, result);
        });
    };
    // itemBase can be decorator, template or item
    $scope.item_drop = function(something) {
        var cost_adjustment = $scope.buy_adjustment.value;
        if(something.container)
            return Ocont.buy_item($scope.cont, something, cost_adjustment);
        $scope.create_item(something).then(function(item) {
            Ocont.buy_item($scope.cont, item, cost_adjustment);
        });
    };
}])

.controller('ContainerCtrl', ['$scope','Ocont', 'Oit', 'Ocam', 'EM', 'InputDialog',
function($scope, Ocont, Oit, Ocam, EM, InputDialog) {
    $scope.delete_container = function() {
        Ocam.remove_container($scope.cont);
    };
    $scope.loot_gold = function() {
        InputDialog('loot_gold',{containerList: $scope.plContList})
        .then(function(result){
            if(!result)
                return;
            if(result.all)
                Ocam.split_gold($scope.plContList, $scope.cont.gold);
            else
                Ocont.change_gold(result.container, $scope.cont.gold);
            Ocont.change_gold($scope.cont, -1*$scope.cont.gold);
        });
    };
    // itemBase can be decorator, template or item
    $scope.item_drop = function(something) {
        var cost_adjustment = $scope.buy_adjustment.value;
        if(something.container)
            return Ocont.sell_item_transfer($scope.cont, something, cost_adjustment);
        $scope.create_item(something).then(function(item) {
            Ocont.put_item($scope.cont, item, cost_adjustment);
        });
    };
}])

.controller('ItemFinderCtrl', ['$scope','EM','Ocont',
function($scope, EM, Ocont) {
    $scope.$on('EM.new_list.category', function(){
        $scope.categoryList = EM.list('category');
    });

    $scope.item_drop = function(item) {
        Ocont.sell_item_destroy(item, $scope.sell_adjustment.value);
    };
}])

.controller('MagicItemFinderCtrl', ['$scope','EM','Ocont','$http',
function($scope, EM, Ocont, $http) {
    $scope.rarityList = [
        {name: 'Common', value: 'C'},
        {name: 'Uncommon', value: 'U'},
        {name: 'Rare', value: 'R'},
    ];

    $scope.get_category = function(magic) {
        return EM.by_key('category', magic.category);
    };

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
}])

.controller('MundaneItemFinderCtrl', ['$scope','EM','Ocont',
function($scope, EM, Ocont) {
    $scope.goto_page = function(page) {
        $scope.current_query.page = page;
        item_page_REST($scope.current_query).then(got_item_finder);
    };

    $scope.get_category = function(mundane) {
        return EM.by_key('subtype', mundane.subtype)._2o.category();
    };

    $scope.get_subtype = function(mundane) {
        return EM.by_key('subtype', mundane.subtype);
    };

    $scope.item_finder_search = function(page) {
        var matchQuery = {}, exactQuery = {};
        if($scope.itemName)
            matchQuery.name = $scope.itemName;
        if($scope.category)
            exactQuery.category = $scope.category.id;
        if($scope.subtype)
            exactQuery.subtype = $scope.subtype.id;
        $scope.results = EM.search('mundane', matchQuery, exactQuery);
    };

    $scope.predicate = 'level';
    $scope.set_predicate = function(predicate) {
        if($scope.predicate == predicate)
            $scope.predicate_reverse = !$scope.predicate_reverse;
        $scope.predicate = predicate;
    };
}]);