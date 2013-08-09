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

.controller('InitDialogController', ['$scope', 'dialog', 'U',
function($scope, dialog, U) {
    $scope.setClose = function(result){
        dialog.close({
            result: result,
            log: " "+result+" "});
    };
    $scope.U = U;
    $scope.rollClose = function(mod, dice) {
        var roll = $scope.U.roll(mod, dice);
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

.controller('HpDialogController', ['$scope', 'dialog', 'U',
function($scope, dialog, U) {
    $scope.setClose = function(result){
        dialog.close(
        {
            result: result,
            log: " "+result+" ",
            heal: $scope.heal
        });
    };
    $scope.rollClose = function(mod, dice) {
        var roll = $scope.U.roll(mod, dice);
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

    $scope.U = U;
    $scope.heal = 'damage';
    $scope.dice = 8;
    $scope.numbers = numbers;
    $scope.mods = mods;
    $scope.input = "";
}])

.controller('MagicDialogCtrl', ['$scope', 'dialog', 'magic','EM','Oit',
function($scope, dialog, magic, EM, Oit) {
    $scope.magic = magic;
    $scope.subtypes = magic._2m.subtypes().slice();
    $scope.newSubtypeForm = false;

    $scope.clear = function() {
        $scope.subtypes = [];
    };
    $scope.clear_parse = function() {
        $scope.subtypes = Oit.parse_subtypes(magic);
    };
    $scope.remove_subtype = function(i) {
        $scope.subtypes.splice(i,1);
    };
    $scope.add_subtype = function() {
        $scope.newSubtypeForm = false;
        $scope.subtypes.push($scope.subtypeToAdd);
    };
    $scope.confirm = function() {
        var currSubtypes = magic._2m.subtypes(), toAdd=[], toRemove=[];
        for(var i=0, len=currSubtypes.length; i<len; i++) {
            if($scope.subtypes.indexOf(currSubtypes[i]) == -1)
                toRemove.push(currSubtypes[i]);
        }
        for(var i=0, len=$scope.subtypes.length; i<len; i++) {
            if(currSubtypes.indexOf($scope.subtypes[i]) == -1)
                toAdd.push($scope.subtypes[i]);
        }
        if(toRemove.length > 0) {
            EM.remove_list('m2m_magic_subtype', {magic: magic.id}).then(function(){
                var instanceList = [];
                for(var i=0, len=$scope.subtypes.length; i<len; i++) {
                    instanceList.push({magic: magic.id, subtype: $scope.subtypes[i].id});
                }
                EM.add_list('m2m_magic_subtype', instanceList);
            });
        } else {
            var instanceList = [];
            for(var i=0, len=toAdd.length; i<len; i++) {
                instanceList.push({magic: magic.id, subtype: toAdd[i].id});
            }
            EM.add_list('m2m_magic_subtype', instanceList);
        }
        magic._2m.subtypes = function() {
            return $scope.subtypes;
        };
        dialog.close(true);
    };
    $scope.cancel = function() {
        dialog.close();
    };
}])

.controller('ModalController', ['$scope', 'Wizards',
function($scope, Wizards) {
    $scope.wizardsModal = false;
    $scope.close = function() { $scope.wizardsModal = false; };
    $scope.$on('Wizards.fetch', function(event, detailTag) {
        $scope.wizardsModal = true;
        $scope.detailTag = detailTag;
    });
}])

;
