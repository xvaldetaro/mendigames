angular.module('mendigames')

.factory('Och', ['EM', 'roll','Restangular',
function(EM, roll, Restangular) {
    function save(c) {
        return EM.update('character', c);
    }
    function _change_hp(c, value) {
        c.used_hit_points = c.used_hit_points-parseInt(value);
        if(c.used_hit_points < 0)
            c.used_hit_points = 0;
        else if(c.used_hit_points > c.hit_points+c.hit_points/3)
            c.used_hit_points = c.hit_points+c.hit_points/3;
    }
    function change_hp(c, value){
        _change_hp(c,value);
        return save(c);
    }
    function set_init(c, value){
        c.init = parseInt(value);
        c.sub_init = 0;
        return save(c);
    }
    function increase_sub_init(c) {
        c.sub_init++;
        return save(c);
    }
    function roll_init(c, mod){
        c.init = roll(mod, dice);
        return save(c);
    }
    function change_xp(c, value){
        c.experience_points = c.experience_points+parseInt(value);
        return save(c);
    }
    function change_gold(c, value){
        c.gold = c.gold+parseInt(value);
        return save(c);
    }
    function _short_rest_stats(c){
        c.milestones = c.milestones-c.milestones%2;
        return save(c);
    }
    function short_rest(c){
        _short_rest_stats(c).then(function(){
            recharge_encounters(c);
        });
    }
    function _extended_rest_stats(c){
        c.milestones = 0;
        c.used_action_points = 0;
        c.used_healing_surges = 0;
        return save(c);
    }
    function extended_rest(c){
        _extended_rest_stats(c).then(function(){
            recharge_powers(c);
        });
    }
    function spend_ap(c){
        c.used_action_points = c.used_action_points+1;
        return save(c);
    }
    function spend_hs(c){
        c.used_healing_surges = c.used_healing_surges+1;
        _change_hp(c, Math.floor(c.hit_points/4));
        return save(c);
    }
    function milestone(c){
        c.milestones = c.milestones+1;
        return save(c);
    }
    function bloodied(c){
        if(c.used_hit_points*2 > c.hit_points)
            return true;
        return false;
    }
    function incapacitated(c){
        if(c.used_hit_points >= c.hit_points)
            return true;
        return false;
    }
    function recharge_encounters(c) {
        for (var i = c._has_powers.length - 1; i >= 0; i--) {
            if(c._has_powers[i]._power.usage == 'E')
                c._has_powers[i].used = false;
        }
        return EM.update_list('has_power', {character: c.id, power__usage: 'E'},
         {used: false});
    }
    function recharge_powers(c) {
        for (var i = c._has_powers.length - 1; i >= 0; i--) {
            c._has_powers[i].used = false;
        }
        return EM.update_list('has_power', {character: c.id}, {used: false});
    }
    function clear_conditions(c) {
        c.has_conditions = [];
        c._has_conditions = [];
        return EM.remove_list('has_condition', {character: c.id});
    }
    function remove_condition(c, hci) {
        var hco = c._has_conditions[hci];
        c._has_conditions.splice(hci,1);
        c.has_conditions.splice(hci,1);

        return EM.remove('has_condition', hco);
    }
    function add_condition(ch, co, init, round) {
        var hasCondition = {
            character: ch.id,
            condition: co.id,
            ends: 'T',
            started_round: round,
            started_init: init,
            _condition: co
        };

        ch._has_conditions.push(hasCondition);
        var i = ch._has_conditions.length-1;
        return EM.add('has_condition', hasCondition).then(function(newE){
            ch._has_conditions[i] = newE;
        });
    }
    function remove_item(ch, hi, cost) {
        if(cost > 0)
            change_gold(ch, cost);
        return EM.remove('has_item', hi);
    }
    function add_item(ch, i, cost, templateItem) {
        var hasItem = {
            character: ch.id,
            item: i.id,
            _item: i,
            template_item: templateItem.id,
            _template_item: templateItem,
            weight: templateItem.weight
        };
        if(cost > 0)
            change_gold(ch, -1*cost);
        EM.add_local('item', i);
        ch._has_items.push(hasItem);
        var i = ch._has_items.length-1;
        return EM.add('has_item', hasItem).then(function(newE){
            ch._has_items[i] = newE;
        });
    }
    function delete_character(chi, c) {
        return EM.remove('character', c, chi);
    }
    function switch_condition(ch, hasCondition){
        ch._has_conditions.push(hasCondition);
        hasCondition.character = ch.id;
        EM.update('has_condition', hasCondition);
    }
    return {
        save: save,
        change_hp: change_hp,
        set_init: set_init,
        roll_init: roll_init,
        change_xp: change_xp,
        change_gold: change_gold,
        short_rest: short_rest,
        extended_rest: extended_rest,
        _short_rest_stats: _short_rest_stats,
        _extended_rest_stats: _extended_rest_stats,
        spend_ap: spend_ap,
        spend_hs: spend_hs,
        milestone: milestone,
        bloodied: bloodied,
        recharge_encounters: recharge_encounters,
        recharge_powers: recharge_powers,
        clear_conditions: clear_conditions,
        remove_condition: remove_condition,
        add_condition: add_condition,
        add_item: add_item,
        remove_item: remove_item,
        delete_character: delete_character,
        incapacitated: incapacitated,
        increase_sub_init: increase_sub_init,
        switch_condition: switch_condition
    };
}])

.factory('Ohpo', ['EM', 'WizardsService',
function(EM, WizardsService) {
    return {
        use_power: function(h) {
            h.used = !h.used;
            EM.update('has_power', h);
        },
        fetch_from_compendium: function(h){
            WizardsService.fetch(h._power.wizards_id, 'power');
        }
    };
}]);