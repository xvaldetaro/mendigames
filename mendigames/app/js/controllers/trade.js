'use strict';

angular.module('mendigames')

.controller('TradeCtrl', ['$scope','$routeParams','EM','Wizards','InputDialog',
'Ocam', 'Oit','$q',
function($scope, $routeParams, EM, Wizards, InputDialog, Ocam, Oit, $q) {
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
        var activePlayer = 0, activeContainer = 0;
        if($scope.plContList) {
            for(var i=0, len=$scope.plContList.length; i<len; i++) {
                if($scope.plContList[i].active)
                    activePlayer = i;
            }
            for(var i=0, len=$scope.othContList.length; i<len; i++) {
                if($scope.othContList[i].active)
                    activeContainer = i;
            }
        }
        $scope.plContList = containers.player;
        $scope.plCont = $scope.plContList[activePlayer];
        $scope.othContList = containers.other;
        $scope.othCont = $scope.othContList[activeContainer];
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
    });
    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.change_player_container = function(cont) {
        $scope.plCont = cont;
    };
    $scope.change_other_container = function(cont) {
        $scope.othCont = cont;
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
        var subtypes = magic._2m.subtypes();
        if(subtypes.length == 0)
            subtypes = magic._2o.category()._2m.subtypes();
        return InputDialog('create_item', { magic: magic, subtypes: subtypes })
        .then(function(result){
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
            Ocont.change_gold($scope.plCont, result);
        });
    };
    // itemBase can be decorator, template or item
    $scope.item_drop = function(something) {
        var cost_adjustment = $scope.buy_adjustment.value;
        if(something.container)
            return Ocont.buy_item($scope.plCont, something, cost_adjustment);
        $scope.create_item(something).then(function(item) {
            Ocont.buy_item($scope.plCont, item, cost_adjustment);
        });
    };
}])

.controller('ContainerCtrl', ['$scope','Ocont', 'Oit', 'Ocam', 'EM', 'InputDialog',
function($scope, Ocont, Oit, Ocam, EM, InputDialog) {
    $scope.delete_container = function() {
        Ocam.remove_container($scope.othCont);
    };
    $scope.loot_gold = function() {
        InputDialog('loot_gold',{containerList: $scope.plContList})
        .then(function(result){
            if(!result)
                return;
            if(result.all)
                Ocam.split_gold($scope.plContList, $scope.othCont.gold);
            else
                Ocont.change_gold(result.container, $scope.othCont.gold);
            Ocont.change_gold($scope.othCont, -1*$scope.othCont.gold);
        });
    };
    $scope.split_item = function(item) {
        if(item.amount < 2)
            return;
        var amounts = [];
        for(var i=1; i<item.amount; i++) {
            amounts.push(i);
        }
        InputDialog('split_item',{amounts: amounts})
        .then(function(result){
            if(!result)
                return;
            Ocont.split_item(item, result);
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

.controller('MagicItemFinderCtrl', ['$scope','EM','Ocont','Oit','$http','Wizards',
'$dialog','BASEURL',
function($scope, EM, Ocont, Oit, $http, Wizards, $dialog, BASEURL) {
    $scope.rarityList = [
        {name: 'Common', value: 'C'},
        {name: 'Uncommon', value: 'U'},
        {name: 'Rare', value: 'R'},
    ];

    $scope.compendium = function(magic) {
        var subtypes = magic._2m.subtypes();
        if(!subtypes || subtypes.length < 1) {
            Wizards('item', 'magic', magic).then(function(){
                Oit.parse_subtypes(magic);
            });
        }
        $dialog.dialog({
            resolve: { magic: function(){ return magic; } }
        }).open(BASEURL()+'mendigames/partials/dialogs/magic.html', 'MagicDialogCtrl')
        .then(function(changed) {
            if(changed)
                item_page_REST($scope.current_query);
        });
    };

    function got_item_finder(list){
        $scope.itemFinder = list.data.data;
        var results = $scope.itemFinder.results;
        for(var i=0, len=results.length; i<len; i++) {
            EM.merge_related('magic', results[i]);
        }
        $scope.pageCount = Math.ceil($scope.itemFinder.count/100);
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