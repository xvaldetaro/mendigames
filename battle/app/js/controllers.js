'use strict';

var CampaignListCtrl = function($scope, Restangular) {
    Restangular.all('campaign').getList().then(function(campaign_list){
        $scope.campaign_list = campaign_list;
    });
};
CampaignListCtrl.$inject = ['$scope','Restangular'];

var CharacterCtrl = function($scope, Restangular, $routeParams) {
    var characterId = $routeParams.characterId;
    Restangular.one('character', characterId).get().then(function(character){
        $scope.character = character;
    });
};
CharacterCtrl.$inject = ['$scope', 'Restangular', '$routeParams'];

angular.module('battle.controllers', ['restangular','battle.services', 'ui.bootstrap',
    'ngDragDrop', 'ngSanitize']).
controller('CampaignListCtrl', CampaignListCtrl).

controller('CampaignCtrl', ['$scope','$timeout','Restangular', '$routeParams', 'roll', 
    '$http', 'NameDict', 'WizardsService',
    function($scope, $timeout, Restangular, $routeParams, roll, $http, NameDict, 
        WizardsService) {
        var campaignId = $routeParams.campaignId;

        // Character specific editable fields models
        $scope.changeHp = {};
        $scope.changeXp = {};
        $scope.changeGold = {};
        $scope.setInit = {};
        $scope.activeTab = {};

        // ----------- Create the polling
        // Polls campagin details every 10sec
        function campaign_poll(){
            Restangular.one('campaign', campaignId).get().then(function(campaign){
                $scope.campaign = campaign;
                $timeout(campaign_poll,10000);
            });
        }
        //$timeout(campaign_poll,10000);

        // Polls character list every 2sec
        var params = {campaignId: campaignId};
        function character_poll_timeout(){
            Restangular.all('character').getList(params).then(function(characterList){
                $scope.characterList = characterList;
                $scope.characterDict = NameDict(characterList, 'id');
                $timeout(character_poll,2000);
            });
        }
        //$timeout(character_poll,2000);

        // --------------- Register the watchers
        var watcher = function(newValue,oldValue){
                    if(newValue == oldValue)
                        return;

                    newValue.put(); };

        Restangular.all('character').getList(params).then(function(characterList){
            $scope.characterList = characterList;
            $scope.characterDict = NameDict(characterList, 'id');

            // Listeners for every character in the list
            for (var i=0;i<characterList.length;i++) {
                $scope.$watch('characterList['+i+']', watcher, true);
            }

            // Initialize the character specific variables
            for (var i=0;i<characterList.length;i++) {
                $scope.activeTab[characterList[i].id] = 'status';
            }
        });
        Restangular.all('condition').getList().then(function(conditionList){
            $scope.conditionList = conditionList;
        });
        Restangular.one('campaign', campaignId).get().then(function(campaign){
            $scope.campaign = campaign;
            $scope.$watch('campaign', watcher, true);
        });

        // ----------- EVENT HANDLERS:
        $scope.changeHp = function(character, value){
            character.used_hit_points =
                character.used_hit_points-parseInt(value);
        };
        $scope.setInit = function(character, init){
            character.init = parseInt(init);
        };
        $scope.roll_init = function(character, init){
            character.init = roll(init);
        };
        $scope.changeXp = function(character){
            character.experience_points =
                character.experience_points+parseInt($scope.changeXp[character.id]);
        };
        $scope.changeGold = function(character){
            character.gold = character.gold+parseInt($scope.changeGold[character.id]);
        };
        $scope.shortRest = function(character){
            character.milestones = character.milestones-character.milestones%2;
        };
        $scope.extRest = function(character){
            $scope.shortRest(character);
            character.milestones = 0;
            character.used_action_points = 0;
            character.used_healing_surges = 0;
        };
        $scope.spendAp = function(character){
            character.used_action_points = character.used_action_points+1;
        };
        $scope.spend_hs = function(character){
            character.used_healing_surges = character.used_healing_surges+1;
        };
        $scope.award_milestone = function(character){
            character.milestones = character.milestones+1;
        };
        $scope.bloodied = function(character){
            if(character.used_hit_points*2 > character.hit_points)
                return true;
            return false;
        };
        $scope.use_power = function(power){
            power.used = !power.used;
            Restangular.one('has_power', power.has_power_id).get().then(function(got_power){
                got_power.used = power.used;
                got_power.put();
            });
        };
        $scope.recharge_power = function(power){
            power.used = false;
            Restangular.one('has_power', power.has_power_id).get().then(function(got_power){
                got_power.used = false;
                got_power.put();
            });
        };
        $scope.remove_condition = function(character, hci){
            var hc = character.has_conditions[hci];
            var remoteHc = Restangular.one('has_condition', hc.has_condition_id);
            remoteHc.remove().then(null, function() {window.alert("No sync")});
            character.has_conditions.splice(hci, 1);
        };
        $scope.fetch_from_compendium = function(id, model){
            WizardsService.fetch(id, model);
        };
        $scope.condition_drag = function(e,o,index) {
            $scope.dragged_condition = index;
        };
        $scope.condition_drop = function(e,o,characterIndex) {
            var ch = $scope.characterList[characterIndex];
            var condition = ch.has_conditions.pop();
            $scope.conditionList.splice($scope.dragged_condition,0,condition);
            var has_condition = {character: ch.id, condition: condition.name, ends: 'T',
                            started_round: 1, started_init: 1, name: condition.name,
                            wizards_id: condition.wizards_id};

            ch.has_conditions.push(has_condition)
            Restangular.all('has_condition').post(has_condition).then(function(hc) {
                ch = $scope.characterDict[hc.character];
                var hcs = ch.has_conditions;
                for(var i=0, len=hcs.length; i<len; i++)
                {
                    var localHc = hcs[i];
                    if(!localHc.has_condition_id && hcs[i].name == hc.condition)
                        localHc.has_condition_id = hc.id;
                }
            });
        };
    }]).
controller('CharacterCtrl', CharacterCtrl).
controller('ModalController', ['$scope', 'WizardsService',
    function($scope, WizardsService) {
        $scope.wizardsModal = false;
        $scope.close = function() { $scope.wizardsModal = false; }
        $scope.$on('WizardsService.fetching', function(event, detailTag) {
            $scope.wizardsModal = true;
        });
        $scope.$on('WizardsService.fetch', function(event, detailTag) {
            $scope.detailTag = detailTag.html();
        });
    }]);
