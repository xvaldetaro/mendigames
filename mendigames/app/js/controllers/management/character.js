'use strict';

function get_hps(powerList, characterId) {
    var hpList = [];
    for(var i=0, len=powerList.length; i<len; i++) {
        hpList.push({character: characterId, power: powerList[i].id});
    }
    return hpList;
}

angular.module('mendigames')

.controller('ManagementEditCharacterCtrl', ['$scope', '$routeParams', 'EM', 'Och','$location',
'Ocam','$http',
function($scope, $routeParams, EM, Och, $location, Ocam, $http) {
    var entitiesMetadata = {};
    var syncEntities = [];
    var cid = $routeParams.characterId;
    entitiesMetadata = {
        'power': { _2o: [], _2m: [], query: {haspower__character: cid}},
        'has_power': { _2o: [], _2m: [],
            query: {character: cid}},
        'character': { _2o: [], _2m: [],
            query: {id: cid}},
        'container': { _2o: [], _2m: [], query: {character: cid} },
    };

    $scope.$on('EM.new_list.character', function(){
        $scope.c = EM.by_key('character', cid);
    });
    $scope.$on('EM.new_list.power', function(){
        $scope.cPowers = EM.listSlice('power');
    });

    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    $scope.cTypes = ['Player', 'Neutral', 'Enemy'];
    
    $scope.save = function() {
        Och.save($scope.c).then(function() {
            $location.path('/campaign/'+$routeParams.campaignId+'/management/');
        });
        var oldP = EM.list('power');
        var added = [], removed = false;
        for(var i=0, len=$scope.cPowers.length; i<len; i++) {
            if(oldP.indexOf($scope.cPowers[i]) === -1)
                added.push($scope.cPowers[i]);
        }
        for(var i=0, len=oldP.length; i<len; i++) {
            if($scope.cPowers.indexOf(oldP[i]) === -1)
                removed = true;
        }
        if(removed) {
            EM.remove_list('has_power', {character: $scope.c.id}).then(function() {
                var hpList = get_hps($scope.cPowers, $scope.c.id);
                if(hpList.length > 0) {
                    EM.add_list('has_power', hpList).then(function() {
                        go_back();
                    });
                } else {
                    go_back();
                }
            });
        } else {
            var hpList = get_hps(added, $scope.c.id);
            if(hpList.length > 0) {
                EM.add_list('has_power', hpList).then(function() {
                    go_back();
                });
            } else {
                go_back();
            }
        }
    };
    $scope.cancel = function() {
        $location.path('/campaign/'+$routeParams.campaignId+'/management/');
    };

    function go_back() {
        $location.path('/campaign/'+$routeParams.campaignId+'/management/');
    }
}])

.controller('ManagementNewCharacterCtrl', ['$scope', '$routeParams', 'EM', 'Och','$location',
'Ocam','$http',
function($scope, $routeParams, EM, Och, $location, Ocam, $http) {
    var entitiesMetadata = {
        'power': { _2o: [], _2m: [] },
        'has_power': { _2o: [], _2m: [] },
        'character': { _2o: [], _2m: [] },
        'container': { _2o: [], _2m: [] },
    };

    // Bootstrap the scope
    EM.start(entitiesMetadata, [], true);

    $scope.c = {type: 'Player', campaign: $routeParams.campaignId};

    $scope.cTypes = ['Player', 'Neutral', 'Enemy'];
    $scope.cPowers = [];
   
    $scope.save = function() {
        Ocam.add_character($scope.c).then(function(c) {
            var hpList = get_hps($scope.cPowers, c.id);
            if(hpList.length > 0) {
                EM.add_list('has_power', hpList).then(function() {
                    go_back();
                });
            } else {
                go_back();
            }
        });
    };
    $scope.cancel = function() {
        $location.path('/campaign/'+$routeParams.campaignId+'/management/');
    };
    function go_back() {
        $location.path('/campaign/'+$routeParams.campaignId+'/management/');
    }
}])

.controller('ManagementCharacterPowerCtrl', ['$scope', '$routeParams', 'EM', 'Och','$location',
'Ocam','$http','Wizards',
function($scope, $routeParams, EM, Och, $location, Ocam, $http, Wizards) {
    $scope.pUsages = [{name: 'At-Will', abbr: 'W'},
    {name: 'Encounter', abbr: 'E'},
    {name: 'Daily', abbr: 'D'}];

    $scope.pActions = [{name: 'Free', abbr: 'FR'},
             {name: 'Immediate Interrupt', abbr: 'II'},
             {name: 'Immediate Reaction', abbr: 'IR'},
             {name: 'Minor', abbr: 'MI'},
             {name: 'Move', abbr: 'MO'},
             {name: 'No Action', abbr: 'NA'},
             {name: 'Opportunity', abbr: 'OP'},
             {name: 'Standard', abbr: 'ST'}];

    function got_power_finder(list){
        $scope.powerFinder = list.data.data;
        $scope.powers = $scope.powerFinder.results;
        $scope.pageCount = Math.ceil($scope.powerFinder.count/20);
    }
    function power_page_REST(query) {
        return $http.get('/power_page', {params: query});
    }
    $scope.search = function(page) {
        var query = {};
        if(!page)
            $scope.currentPage = 1;
        else
            $scope.currentPage = page;
        if($scope.pName)
            query.name__icontains = $scope.pName;
        if($scope.pUsage)
            query.usage = $scope.pUsage.abbr;
        if($scope.pAction)
            query.action = $scope.pAction.abbr;
        if($scope.pLevel)
            query.level = $scope.pLevel;
        
        query.page = $scope.currentPage;
        power_page_REST(query).then(got_power_finder);
        $scope.current_query = query;
    };

    $scope.goto_page = function(page) {
        $scope.current_query.page = page;
        power_page_REST($scope.current_query).then(got_power_finder);
    };

    $scope.add_power = function(power) {
        $scope.cPowers.push(power);
    };

    $scope.delete_power = function(pi) {
        $scope.cPowers.splice(pi, 1);
    };

    $scope.compendium = function(power) {
        Wizards('power', 'power', power).then(function(){
            $scope.modalPower = power;
            $scope.wizardsModal = true;
        });
    };
}]);