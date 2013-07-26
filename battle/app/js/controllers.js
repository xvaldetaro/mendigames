'use strict';

angular.module('battle.controllers', ['restangular','battle.services', 'ui.bootstrap',
    'ngDragDrop', 'ngSanitize'])

.controller('CampaignListCtrl', ['$scope','Restangular',
function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
}]).

controller('CampaignCtrl', ['$scope', '$rootScope', 'Log', '$timeout','Restangular', 
'$routeParams', 'EM', 'EMController',
function($scope, $rootScope, Log, $timeout, Restangular, $routeParams, EM, EMController) {
    $scope.campaignId = $routeParams.campaignId;

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

    // ----------- Create the polling
    // Polls campagin details every 10sec
    function campaign_poll(){
        Restangular.one('campaign', $scope.campaignId).get().then(function(campaign){
            $scope.campaign = campaign;
            $timeout(campaign_poll,10000);
        });
    }

    EM.fetch_multiple(EMController.initEntities).then(function(){
        $scope.$apply(function(){
            $scope.characterList = EM.list('character');
            $scope.conditionList = EM.listSlice('condition');
        });
    });

    Restangular.one('campaign', $scope.campaignId).get().then(function(campaign){
        $scope.campaign = campaign;
        $scope.$watch('campaign', function(newValue,oldValue){
            if(newValue == oldValue)
                return;
            newValue.put();
        });
    });
}])

.controller('CharacterController', ['$scope', '$rootScope', '$dialog', 'Och', 'Log',
function($scope, $rootScope, $dialog, Och, Log) {
    $scope.Och = Och;
    $scope.droppedConditions = [];

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
    $scope.init_dialog = function(){
        var d = $dialog.dialog({
            templateUrl:  '/static/battle/partials/dialogs/init.html',
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
            templateUrl:  '/static/battle/partials/dialogs/hp.html',
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
        var name = $scope.ch._has_conditions[hci].condition;
        Och.remove_condition($scope.ch, hci).fail(function() {
            window.alert('Connection failed, condition not removed');
        });

        Log($scope.ch.name+' is not: '+name+' anymore');
    };
    $scope.condition_drop = function(e,o) {
        // The condition dropped is the raw Restangular condition object
        var condition = $scope.droppedConditions.pop();
        Och.add_condition($scope.ch, condition);

        Log($scope.ch.name+' is: '+condition.name);
        $rootScope.$broadcast('Condition.dropped');
    };
}])

.controller('HasPowerController', ['$scope', 'EM', 'Ohpo', 'Log',
function($scope, EM, Ohpo, Log) {
    $scope.use_power = function(){
        Ohpo.use_power($scope.hasPower);
        if($scope.hasPower.used)
            Log($scope.ch.name+' used: '+$scope.hasPower.power);
        else
            Log($scope.ch.name+' recharged: '+$scope.hasPower.power);
    };
}])

.controller('MenuController', ['$scope', 'EM','roll','Log','$routeParams','$dialog',
function($scope, EM, roll, Log, $routeParams, $dialog) {
    $scope.diceMult = 1;
    $scope.roll = function(dice) {
        var logStr = 'd'+dice+'x'+$scope.diceMult+' : ', total = 0;
        for(var i = $scope.diceMult - 1; i >= 0; i--) {
            var result = roll(0, dice).result;
            logStr = logStr+result+'+';
            total += result;
        }
        logStr = logStr.slice(0, -1);
        logStr = logStr+ '= '+total;
        Log(logStr);
    };
    $scope.enemyCount = 0;
    $scope.$on('Condition.dropped', function() {
        $scope.conditionList = EM.listSlice('condition');
    });
    $scope.add_enemy = function(){
        var d = $dialog.dialog({
            templateUrl:  '/static/battle/partials/dialogs/enemy.html',
            controller: 'EnemyDialogController'
        });
        d.open().then(function(result){
          if(result)
          {
            Log('Enemy added');
            EM.add('character', enemy);
          }
        });
    };
}])

.controller('EnemyDialogController', ['$scope', 'dialog',
    function($scope, dialog) {
        $scope.close = function(){
            if(!$scope.enemy.hit_points || $scope.enemy.hit_points == ""){
                window.alert('Invalid Hp');
                return;
            }
            if(!$scope.enemy.init_mod || $scope.enemy.init_mod == ""){
                $scope.enemy.init_mod = 0;
            }
            if(!$scope.enemy.ap || $scope.enemy.ap == ""){
                $scope.enemy.ap = 0;
            }
            if(!$scope.enemy.count || $scope.enemy.count == ""){
                $scope.enemy.count = 1;
            }
            dialog.close($scope.enemy);
        };
        $scope.hp_show = 'password';
        $scope.enemy = {
            name: 'Enemy',
            hit_points: "",
            init_mod: "",
            ap: '',
            count: 1
        };
}])

.controller('InitDialogController', ['$scope', 'dialog', 'roll',
    function($scope, dialog, roll) {
        $scope.setClose = function(result){
            dialog.close({
                result: result,
                log: " "+result+" "});
        };
        $scope.roll = roll;
        $scope.rollClose = function(mod, dice) {
            var roll = $scope.roll(mod, dice);
            dialog.close(roll);
        };
        var numbers = [];
        for(var i=-4; i<52; i++)
        {
            numbers.push(i);
        }
        var mods = [];
        for(var j=-5; j<43; j++)
        {
            mods.push(j);
        }
        $scope.numbers = numbers;
        $scope.mods = mods;
        $scope.input = "";
}])

.controller('HpDialogController', ['$scope', 'dialog', 'roll',
    function($scope, dialog, roll) {
        $scope.setClose = function(result){
            dialog.close(
            {
                result: result,
                log: " "+result+" ",
                heal: $scope.heal
            });
        };
        $scope.rollClose = function(mod, dice) {
            var roll = $scope.roll(mod, dice);
            roll.heal = $scope.heal;
            dialog.close(roll);
        };
        var numbers = [];
        for(var i=0; i<52; i++)
        {
            numbers.push(i);
        }
        var mods = [];
        for(var j=-5; j<43; j++)
        {
            mods.push(j);
        }

        $scope.roll = roll;
        $scope.heal = 'damage';
        $scope.dice = 8;
        $scope.numbers = numbers;
        $scope.mods = mods;
        $scope.input = "";
}])

.controller('ModalController', ['$scope', 'WizardsService',
    function($scope, WizardsService) {
        $scope.wizardsModal = false;
        $scope.close = function() { $scope.wizardsModal = false; }
        $scope.$on('WizardsService.fetching', function(event, detailTag) {
            $scope.wizardsModal = true;
        });
        $scope.$on('WizardsService.fetch', function(event, detailTag) {
            $scope.detailTag = detailTag.html();
        });
}])

;
