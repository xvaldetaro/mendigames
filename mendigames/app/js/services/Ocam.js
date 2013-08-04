'use strict';

angular.module('mendigames')

.factory('Ocam', ['EM','Och','Ocont','$q','U',
function(EM, Och, Ocont, $q, U) {
    function next_turn(cam, characterList) {
        cam.turn++;
        if(cam.turn >= characterList.length) {
            cam.turn = 0;
            cam.round++;
        }
        EM.update('campaign', cam);
    }
    function previous_turn(cam, characterList) {
        cam.turn--;
        if(cam.turn < 0) {
            cam.turn = characterList.length-1;
            cam.round--;
        }
        EM.update('campaign', cam);
    }
    function set_round(cam, value){
        cam.round = value;
        EM.update('campaign', cam);
    }
    function next_round(cam){
        cam.round++;
        EM.update('campaign', cam);
    }
    function previous_round(cam){
        cam.round--;
        EM.update('campaign', cam);
    }
    function normalize_turn(cam, characterList) {
        if(cam.turn >= characterList.length) {
            cam.turn = characterList.length-1;
            EM.update(cam);
        }
    }
    function init_sort(c1, c2){
        var res = c2.init - c1.init;
        if(res == 0)
            res = c2.sub_init - c1.sub_init;
        return res;
    }
    function reorder(cam, characterList) {
        var init = characterList[cam.turn].init;
        characterList.sort(init_sort);
        find_turn(cam, characterList, init);
    }
    function find_turn(cam, characterList, init) {
        var i=0, len=characterList.length;
        for(; i<len; i++) {
            if(characterList[i].init <= init) {
                cam.turn = i;
                return;
            }
        }
        cam.turn = len-1;
    }
    function _get_players(characterList) {
        var playerList = [];
        for (var i = characterList.length - 1; i >= 0; i--) {
            if(characterList[i].type=='Player')
                playerList.push(characterList[i]);
        }
        return playerList;
    }
    function categorize_containers(containerList) {
        var plContList = [], othContList = [];
        for (var i = containerList.length - 1; i >= 0; i--) {
            if(containerList[i].character)
                plContList.push(containerList[i]);
            else
                othContList.push(containerList[i]);
        }
        return { player: plContList, other: othContList };
    }
    function _call_for_character(list, fName, param){
        var promises = []
        for (var i = list.length - 1; i >= 0; i--) {
            promises.push(Och[fName](list[i], param));
        }
        return $q.all(promises);
    }
    function _call_for_container(list, fName, param){
        var promises = []
        for (var i = list.length - 1; i >= 0; i--) {
            promises.push(Ocont[fName](list[i], param));
        }
        return $q.all(promises);
    }
    function split_gold(cam, containerList, value) {
        var share = Math.floor(value/containerList.length);
        var leftover = value%containerList.length;
        var lucky = U.randint(0, containerList.length);
        pcList[lucky].gold += leftover;
        return _call_for_container(containerList, 'change_gold', share);
    }
    function mass_give_gold(cam, characterList, value) {
        return _call_for_container(containerList, 'change_gold', value);
    }
    function split_xp(cam, characterList, value) {
        var playerList = _get_players(characterList);
        var share = Math.floor(value/playerList.length);
        return _call_for_character(playerList, 'change_xp', share);
    }
    function mass_give_xp(cam, characterList, value) {
        var playerList = _get_players(characterList);
        return _call_for_character(playerList, 'change_xp', value);
    }
    function mass_clear_conditions(cam, characterList) {
        for (var i = characterList.length - 1; i >= 0; i--) {
            var c = characterList[i];
            c.has_conditions = [];
            c._has_conditions = [];
        }
        return EM.remove_list('has_condition', {character__campaign: cam.id});
    }
    function mass_milestone(characterList){
        return _call_for_character(characterList, 'milestone');
    }
    function mass_short_rest(cam, characterList){
        return _call_for_character(characterList, '_short_rest_stats').then(function(){
            EM.update_list('has_power',
            {character__campaign: cam.id, power__usage: 'E'},{used: false});
        });
    }
    function mass_extended_rest(cam, characterList){
        _call_for_character(characterList, '_extended_rest_stats').then(function(){
            EM.update_list('has_power',
            {character__campaign: cam.id},{used: false});
        });
    }
    return {
        next_turn: next_turn,
        next_round: next_round,
        previous_turn: previous_turn,
        previous_round: previous_round,
        set_round: set_round,
        normalize_turn: normalize_turn,
        reorder: reorder,
        find_turn: find_turn,
        split_gold: split_gold,
        mass_give_gold: mass_give_gold,
        split_xp: split_xp,
        mass_give_xp: mass_give_xp,
        mass_clear_conditions: mass_clear_conditions,
        mass_short_rest: mass_short_rest,
        mass_extended_rest: mass_extended_rest,
        mass_milestone: mass_milestone,
        categorize_containers: categorize_containers
    };
}]);
