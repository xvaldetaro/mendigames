'use strict';

angular.module('mendigames')

.controller('CombatCtrl', ['$scope', 'Log', '$timeout', '$routeParams', 'EM',
'Ocam','$dialog',
function($scope, Log, $timeout, $routeParams, EM, Ocam, $dialog) {
    var entitiesMetadata = {
        'campaign': {pk: 'id', related: [], query: {id: $routeParams.campaignId}},
        'condition': {pk: 'id', related: [], query: {}},
        'power': {pk: 'id', related: [], query: {haspower__isnull: false}},
        'has_condition': {pk: 'id', related: ['condition'],
            query: {character__campaign: $routeParams.campaignId}},
        'has_power': {pk: 'id', related: ['power'],
            query: {character__campaign: $routeParams.campaignId}},
        'character': {pk: 'id', related: ['has_condition','has_power'],
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
        $scope.$apply();
    });
    $scope.$on('EM.new_list.campaign', function(){
        $scope.campaign = EM.by_key('campaign', $scope.campaignId);
        $scope.title = $scope.campaign.name;
        if($scope.characterList)
            Ocam.normalize_turn($scope.campaign, $scope.characterList);
        $scope.$apply();
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

    $scope.inputDialog = $dialog.dialog({
        templateUrl:  '/static/mendigames/partials/dialogs/input.html',
        controller: 'InputDialogController'
    });
}])

.controller('CharacterController', ['$scope', '$rootScope', '$dialog', 'Och', 'Log',
function($scope, $rootScope, $dialog, Och, Log) {
    $scope.Och = Och;
    $scope.droppedConditions = [];

    $scope.change_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Och.change_gold($scope.ch, result);
        });
    };
    $scope.change_xp = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Och.change_xp($scope.ch, result);
        });
    };
    $scope.has_turn = function() {
        if(!$scope.campaign)
            return '';
        if($scope.chi == $scope.campaign.turn)
            return "turn";
        return '';
    };
    $scope.short_rest = function(c) {
        Och.short_rest(c);
        Log(c.name+' short rested');
    };
    $scope.extended_rest = function(c) {
        Och.extended_rest(c);
        Log(c.name+' extended rested');
    };
    $scope.spend_ap = function(c) {
        Och.spend_ap(c);
        Log(c.name+' used an action point');
    };
    $scope.spend_hs = function(c) {
        Och.spend_hs(c);
        Log(c.name+' used a healing surge');
    };
    $scope.milestone = function(c) {
        Och.milestone(c);
        Log(c.name+' reached a milestone');
    };
    $scope.clear_conditions = function(c) {
        Och.clear_conditions(c);
        Log(c.name+' is clean');
    };
    $scope.delete_character = function(chi, c) {
        Och.delete_character(chi,c);
        Log(c.name+' Removed!');
    }
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
            Och.set_init($scope.ch, result.result);
            Log($scope.ch.name+" init set to: "+result.log);
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
                Och.change_hp($scope.ch, result.result);
                Log($scope.ch.name+" gained "+result.log+" hit points");
            }
            else
            {
                var bloodied = Och.bloodied($scope.ch);
                Och.change_hp($scope.ch, -1*result.result);
                Log($scope.ch.name+" lost "+result.log+" hit points");

                if(bloodied == false && Och.bloodied($scope.ch) == true)
                    Log($scope.ch.name+" is Bloodied!");
            }
          }
        });
    };
    $scope.remove_condition = function(hci){
        var name = $scope.ch._has_conditions[hci]._condition.name;
        Och.remove_condition($scope.ch, hci)

        Log($scope.ch.name+' is not: '+name+' anymore');
    };
    $scope.condition_drop = function(e,o) {
        // The condition dropped is the raw Restangular condition object
        var condition = $scope.droppedConditions.pop();
        Och.add_condition($scope.ch, condition,
            $scope.characterList[$scope.campaign.turn].init, $scope.campaign.round);

        Log($scope.ch.name+' is: '+condition.name);
        $rootScope.$broadcast('Condition.dropped');
    };
}])

.controller('HasPowerController', ['$scope', 'EM', 'Ohpo', 'Log',
function($scope, EM, Ohpo, Log) {
    $scope.use_power = function(){
        Ohpo.use_power($scope.hasPower);
        if($scope.hasPower.used)
            Log($scope.ch.name+' used: '+$scope.hasPower._power.name);
        else
            Log($scope.ch.name+' recharged: '+$scope.hasPower._power.name);
    };
}])

.controller('MenuController', ['$scope', 'EM','roll','Log','$dialog','Ocam',
'WizardsService',
function($scope, EM, roll, Log, $dialog, Ocam, WizardsService) {
    $scope.$on('EM.new_list.condition', function(){
        $scope.conditionList = EM.listSlice('condition');
    });
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
    $scope.diceMod = 1;
    $scope.roll = function(dice) {
        var logStr = 'd'+dice+'x'+$scope.diceMult+'+'+$scope.diceMod+' : ', total = 0;
        for(var i = $scope.diceMult - 1; i >= 0; i--) {
            var result = roll(0, dice).result;
            logStr = logStr+result+'+';
            total += result;
        }
        total += parseInt($scope.diceMod);
        logStr = logStr.slice(0, -1);
        logStr = logStr+ '= '+total;
        Log(logStr);
    };
    $scope.enemyCount = 0;
    $scope.$on('Condition.dropped', function() {
        $scope.conditionList = EM.listSlice('condition');
    });
    $scope.fetch_from_compendium = function(condition) {
        WizardsService.fetch(condition.wizards_id, 'glossary', 'condition',condition);
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
                    init: roll(dialogData.init_mod, 20).result,
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

    $scope.split_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Ocam.split_gold($scope.campaign, $scope.characterList, result);
        });
    };
    $scope.mass_give_gold = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Ocam.mass_give_gold($scope.campaign, $scope.characterList, result);
        });
    };
    $scope.split_xp = function () {
        $scope.inputDialog.open().then(function(result){
            if(!result)
                return;
            Ocam.split_xp($scope.campaign, $scope.characterList, result);
        });
    };
    $scope.mass_give_xp = function () {
        $scope.inputDialog.open().then(function(result){
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
}])