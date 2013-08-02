"use strict";

angular.module('mendigames')

.factory('Och', ['EM', 'roll',
function(EM, roll) {
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
    return {
    };
}])
