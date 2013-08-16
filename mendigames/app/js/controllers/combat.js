'use strict';

angular.module('mendigames')

.controller('CombatCtrl', ['$scope', 'Log', '$timeout', '$routeParams', 'EM','Wizards',
'Ocam','$dialog',
function($scope, Log, $timeout, $routeParams, EM, Wizards, Ocam, $dialog) {
    var entitiesMetadata = {
        'campaign': { _2o: [], _2m: [], query: {id: $routeParams.campaignId}},
        'condition': { _2o: [], _2m: [], query: {}},
        'power': { _2o: [], _2m: [], query: {haspower__isnull: false}},
        'has_condition': { _2o: ['condition'], _2m: [],
            query: {character__campaign: $routeParams.campaignId}},
        'has_power': { _2o: ['power'], _2m: [],
            query: {character__campaign: $routeParams.campaignId}},
        'character': { _2o: [], _2m: ['has_condition','has_power'],
            query: {campaign: $routeParams.campaignId}}
    };
    var syncEntities = [
        'has_condition',
        'has_power',
        'character',
        'campaign'
    ];

    $scope.campaignId = $routeParams.campaignId;
    $scope.$on('EM.new_list.character', function(){
        var newList = EM.listSlice('character');
        if($scope.campaign){
            var init = $scope.characterList[$scope.campaign.turn].init;
            Ocam.find_turn($scope.campaign, newList, init);
        }
        $scope.characterList = newList;
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
        $scope.title = $scope.campaign.name;
        if($scope.characterList)
            Ocam.normalize_turn($scope.campaign, $scope.characterList);
    });

    // Bootstrap the scope
    EM.start(entitiesMetadata, syncEntities);

    // Scroll to bottom of console log window when a new msg arrives
    $scope.$watch('log', function() {
        var console = $("#console");
        $timeout(function(){
            console.animate(
            {
                scrollTop: console.prop("scrollHeight") - console.height()
            }, 300);
        },100);
    }, true);

    $scope.detailOn = false;
    $scope.open_detail = function(c) {
        $scope.detailOn = true;
        $scope.detailCharacter = c;
    };
    $scope.open_list = function() {
        $scope.detailOn = false;
        $scope.detailCharacter = null;
    };
    $scope.character_container_display = function() {
        if($scope.detailOn)
            return 'detail';
        return 'list';
    };
    $scope.compendium = function(model, entity, instance) {
        Wizards(model, entity, instance).then(function(){
            $scope.modalInstance = instance;
            $scope.wizardsModal = true;
        });
    };
    $scope.wizardsModal = false;
}])

.controller('CharacterController', ['$scope', '$rootScope', '$dialog', 'Och', 'Log','Ocam',
'InputDialog',
function($scope, $rootScope, $dialog, Och, Log, Ocam, InputDialog) {
    $scope.Och = Och;
    $scope.change_xp = function () {
        InputDialog('input',{title: 'Give Experience Points', label: 'how many?', size: 'mini'})
        .then(function(result){
            if(!result)
                return;
            Och.change_xp($scope.c, result);
        });
    };
    $scope.has_turn = function() {
        if(!$scope.campaign)
            return '';
        if($scope.ci == $scope.campaign.turn)
            return "turn";
        return '';
    };
    $scope.spend_ap = function(c) {
        Och.spend_ap(c);
        Log(c.name+' used an action point');
    };
    $scope.spend_hs = function(c) {
        Och.spend_hs(c);
        Log(c.name+' used a healing surge');
    };
    $scope.increase_sub_init = function(c) {
        Och.increase_sub_init(c);
        Log(c.name+' sub init increased');
    };
    $scope.init_dialog = function(){
        var d = $dialog.dialog({
            templateUrl:  '/static/mendigames/partials/dialogs/init.html',
            controller: 'InitDialogController'
        });
        d.open().then(function(result){
          if(result)
          {
            Och.set_init($scope.c, result.result);
            Log($scope.c.name+" init set to: "+result.log);
          }
        });
    };
    $scope.hp_dialog = function(){
        var d = $dialog.dialog({
            templateUrl:  '/static/mendigames/partials/dialogs/hp.html',
            controller: 'HpDialogController'
        });
        d.open().then(function(result){
          if(result)
          {
            if(result.heal == 'heal')
            {
                Och.change_hp($scope.c, result.result);
                Log($scope.c.name+" gained "+result.log+" hit points");
            }
            else
            {
                var bloodied = Och.bloodied($scope.c);
                Och.change_hp($scope.c, -1*result.result);
                Log($scope.c.name+" lost "+result.log+" hit points");

                if(bloodied == false && Och.bloodied($scope.c) == true)
                    Log($scope.c.name+" is Bloodied!");
            }
          }
        });
    };

    $scope.delete_character = function(chi, c) {
        Ocam.delete_character(c);
        Log(c.name+' Removed!');
    };
    $scope.remove_condition = function(hci){
        var name = $scope.c._2m.has_conditions()[hci]._2o.condition().name;
        Och.remove_condition($scope.c, hci);

        Log($scope.c.name+' is not: '+name+' anymore');
    };
    $scope.drop_condition = function(condition) {
        // The condition dropped is the raw Restangular condition object
        if(!condition.wizards_id && condition.condition){
            Och.switch_condition($scope.c, condition);
            return;
        }

        Och.add_condition($scope.c, condition,
            $scope.characterList[$scope.campaign.turn].init, $scope.campaign.round);

        Log($scope.c.name+' is: '+condition.name);
    };
}])

.controller('CharacterDetailCtrl', ['$scope', 'EM', 'Ohpo','Och', 'Log','$location',
function($scope, EM, Ohpo, Och, Log, $location) {
    $scope.c = $scope.detailCharacter;

    $scope.edit_character = function() {
        $location.path('/campaign/'+$scope.campaignId+'/management/character/'+$scope.c.id+'/');
    };

    $scope.use_power = function(hasPower){
        if(!hasPower.used)
            Log($scope.c.name+' used: '+hasPower._2o.power().name);
        else
            Log($scope.c.name+' recharged: '+hasPower._2o.power().name);
        Ohpo.use_power(hasPower);
    };

    $scope.short_rest = function(c) {
        Och.short_rest(c);
        Log(c.name+' short rested');
    };
    $scope.extended_rest = function(c) {
        Och.extended_rest(c);
        Log(c.name+' extended rested');
    };
    $scope.milestone = function(c) {
        Och.milestone(c);
        Log(c.name+' reached a milestone');
    };
    $scope.clear_conditions = function(c) {
        Och.clear_conditions(c);
        Log(c.name+' is clean');
    };
}])

.controller('MenuController', ['$scope', 'EM','U','Log','$dialog','Ocam','InputDialog',
function($scope, EM, U, Log, $dialog, Ocam, InputDialog) {
    $scope.$on('EM.new_list.condition', function(){
        $scope.conditionList = EM.listSlice('condition');
    });
    $scope.multipliers = [];
    for(var i=1; i<20; i++) {
        $scope.multipliers.push(i);
    }
    $scope.modifiers = [];
    for(var i=0; i<15; i++) {
        $scope.modifiers.push(i);
    }
    $scope.selectedModifier = 0;
    $scope.selectedMultiplier = 1;
    $scope.dices = [4,6,8,10,12,20,100];
    $scope.previous_turn = function(){
        Ocam.previous_turn($scope.campaign, $scope.characterList);
    };
    $scope.next_turn = function(){
        Ocam.next_turn($scope.campaign, $scope.characterList);
    };
    $scope.previous_round = function(){
        Ocam.previous_round($scope.campaign);
    };
    $scope.next_round = function(){
        Ocam.next_round($scope.campaign);
    };
    $scope.set_round = function(value) {
        Ocam.set_round($scope.campaign, value);
    };
    $scope.reorder = function(){ Ocam.reorder($scope.campaign, $scope.characterList); };

    $scope.diceMult = 1;
    $scope.diceMod = 0;
    $scope.roll = function(dice) {
        Log(U.roll($scope.selectedModifier, dice, $scope.selectedMultiplier).log);
    };
    $scope.enemyCount = 0;
    $scope.fetch_from_compendium = function(condition) {
        Wizards(condition.wizards_id, 'glossary', 'condition',condition);
    };
    $scope.clear_enemies = function(){
        EM.remove_list('character', {campaign: $scope.campaignId,
            type: 'Enemy'});
    };
    $scope.add_enemy = function(){
        var d = $dialog.dialog({
            templateUrl:  '/static/mendigames/partials/dialogs/enemy.html',
            controller: 'EnemyDialogController'
        });
        function make_enemy(dialogData, index) {
            return {
                    name: dialogData.name+index,
                    init: U.roll(dialogData.init_mod, 20,1).result,
                    hit_points: dialogData.hit_points,
                    ap: -1*(dialogData.ap-1),
                    type: 'Enemy',
                    campaign: $scope.campaignId
                };
        }
        d.open().then(function(result){
          if(result)
          {
            if(result.count == 1)
                return EM.add('character', make_enemy(result, ''));

            var enemies = [];
            for (var i = 1; i <= result.count; i++) {
                enemies.push(make_enemy(result, i));
            };
            EM.add_list('character', enemies);
          }
        });
    };
    $scope.split_xp = function () {
        InputDialog('input',{title: 'Split Experience Points', label: 'How many?', size: 'mini'})
        .then(function(result){
            if(!result)
                return;
            Ocam.split_xp($scope.campaign, $scope.characterList, result);
        });
    };
    $scope.mass_give_xp = function () {
        InputDialog('input',{title: 'Give Experience Points to All Players', label: 'How many?', size: 'mini'})
        .then(function(result){
            if(!result)
                return;
            Ocam.mass_give_xp($scope.campaign, $scope.characterList, result);
        });
    };
    $scope.mass_clear_conditions = function(){
        Ocam.mass_clear_conditions($scope.campaign, $scope.characterList);
    };
    $scope.mass_short_rest = function(){
        Ocam.mass_short_rest($scope.campaign, $scope.characterList);
    };
    $scope.mass_extended_rest = function(){
        Ocam.mass_extended_rest($scope.campaign, $scope.characterList);
    };
    $scope.mass_milestone = function(){
        Ocam.mass_milestone($scope.characterList);
    };
    $scope.ret_false = function(){
        return false;
    };
}]);