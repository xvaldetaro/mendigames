'use strict';

angular.module('mendigames')

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

.controller('CreateItemDialogController', ['$scope', 'dialog', 'EM','item',
function($scope, dialog, EM, item) {
    $scope.tis = EM.search('template_item', 'category', item.category);
    $scope.new = true;
    $scope.close = function(){
        dialog.close($scope.ti);
    };
    $scope.cancel = function(){
        dialog.close();
    };
    $scope.new_template = function(){
        $scope.template_id = '';
        $scope.template_weight = 0;
        $scope.find_chance = 100;
        $scope.new_form = true;
    }
    $scope.save = function(){
        if(!$scope.template_id) {
            window.alert('Missing Name!');
            return;
        }
        var new_template = {
            id: $scope.template_id,
            category: item.category,
            weight: $scope.template_weight,
            find_chance: $scope.find_chance
        };
        EM.add('template_item', new_template);
        $scope.tis.push(new_template);
        $scope.ti = new_template;
        $scope.new_form = false;
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

.controller('InputDialogController', ['$scope', 'dialog',
function($scope, dialog) {
    $scope.close = function() {
        dialog.close($scope.input);
    };
}])

.controller('ModalController', ['$scope', 'WizardsService',
function($scope, WizardsService) {
    $scope.wizardsModal = false;
    $scope.close = function() { $scope.wizardsModal = false; };
    $scope.$on('WizardsService.fetch', function(event, detailTag) {
        $scope.wizardsModal = true;
        $scope.detailTag = detailTag;
    });
}])

;
