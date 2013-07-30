'use strict';

angular.module('mendigames')

.factory('Ocam', ['EM','Och',
function(EM, Och) {
    function next(cam, characterList) {
        cam.turn++;
        if(cam.turn >= characterList.length) {
            cam.turn = 0;
            cam.round++;
        }
        EM.update('campaign', cam);
    }
    function set_round(cam, value){
        cam.round = value;
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
    function _call_foreach(list, fName, param){
        var promises = []
        for (var i = list.length - 1; i >= 0; i--) {
            promises.push(Och[fName](list[i], param));
        }
        return Q.all(promises);
    }
    function split_gold(cam, characterList, value) {
        var playerList = _get_players(characterList);
        var share = Math.floor(value/playerList.length);
        var leftover = value%playerList.length;
        var lucky = _.random(0, playerList.length-1);
        playerList[lucky].gold += leftover;
        return _call_foreach(playerList, 'change_gold', share);
    }
    function mass_give_gold(cam, characterList, value) {
        var playerList = _get_players(characterList);
        return _call_foreach(playerList, 'change_gold', value);
    }
    function split_xp(cam, characterList, value) {
        var playerList = _get_players(characterList);
        var share = Math.floor(value/playerList.length);
        return _call_foreach(playerList, 'change_xp', share);
    }
    function mass_give_xp(cam, characterList, value) {
        var playerList = _get_players(characterList);
        return _call_foreach(playerList, 'change_xp', value);
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
        return _call_foreach(characterList, 'milestone');
    }
    function mass_short_rest(cam, characterList){
        return _call_foreach(characterList, '_short_rest_stats').then(function(){
            EM.update_list('has_power',
            {character__campaign: cam.id, power__usage: 'E'},{used: false});
        });
    }
    function mass_extended_rest(cam, characterList){
        _call_foreach(characterList, '_extended_rest_stats').then(function(){
            EM.update_list('has_power',
            {character__campaign: cam.id},{used: false});
        });
    }
    return {
        next: next,
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
        mass_milestone: mass_milestone
    };
}]);
