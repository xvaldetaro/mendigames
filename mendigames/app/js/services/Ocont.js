"use strict";

angular.module('mendigames')

.factory('Ocont', ['EM', 'U','Oit','$q',
function(EM, U, Oit, $q) {
    function save(cont) {
        return EM.update('container', cont);
    }
    function change_gold(cont, value){
        if(value <  1 && value > -1)
            return;
        cont.gold = cont.gold+parseInt(value);
        return save(cont);
    }
    function sell_item(item, cost_adjustment) {
        U.pluck(item._2o.container._2m.items, item);
        return $q.all([
            change_gold(item._2o.container, item.cost*cost_adjustment),
            Oit.destroy_item(item)
        ]);
    }
    function buy_item(to_cont, item, cost_adjustment) {
        return $q.all([
            put_item(to_cont, item),
            change_gold(to_cont, -1*(item.cost*cost_adjustment)),
        ]);
    }
    // Handles item instances and item dicts
    function put_item(to_cont, item) {
        to_cont._2m.items.push(item);
        item.container = to_cont.id;
        item._2o.container = to_cont;
        if(item.id)
            return EM.update('item', item);
        else
            return Oit.new_item(item).then(function(newE) {
                U.replace(to_cont._2m.items, item, newE);
            })
    }
    return {
        buy_item: buy_item,
        sell_item: sell_item
    };
}])

.factory('Oit', ['EM', 'Restangular',
function(EM, Restangular) {
    var prices = [0,360,520,680,840,1000,1800,2600,3400,4200,5000,9000,13000,17000,21000,
        25000, 45000,65000,85000,105000,125000,225000,325000,425000,525000,625000,1125000,
        1625000,2125000,2625000,3125000];
    // Options are: level(decorator with level+), cost_addition, weight_addition, name
    function get_item_dict(mundane, magic, opts) {
        var weight_addition = 0, cost_addition = 0, level;
        var item = { cost: 0, weight: 0, level: 0 };
        if(opts) {
            weight_addition = opts.weight_addition || 0;
            cost_addition = opts.cost_addition || 0;
            item.name = opts.name;
            level = opts.level;
        }

        // Name
        if(!item.name) {
            if(magic)
                item.name = magic.name;
            else if(mundane)
                item.name = mundane.name;
            else
                item.name = 'Unnamed Item';
        }
        // Cost
        if(level) {
            item.cost = prices[level] + cost_addition;
        } else if(magic) {
            item.cost = magic.cost + cost_addition;
        } else if(mundane) {
            item.cost = mundane.cost + cost_addition;
        } else {
            item.cost = cost_addition;
        }

        // Weight
        if(mundane) {
            item.weight = mundane.weight + weight_addition;
        } else {
            item.weight = weight_addition; 
        }

        // Level
        if(!level)
            level = magic.level;
        item.level = level;

        // Put the relateds inside the EM list
        if(magic) {
            if(!EM.by_key('magic', magic.id))
                EM.add_local('magic', magic);
        }

        item.magic = magic.id;
        item.mundane = mundane.id;
        item._2o = { magic: magic, mundane: mundane };

        return item;
    }
    function template_from_decorator(magic) {
        var category = magic._2o.category;
        if(!category) //decorators are searched outside the EM, thus there are no relateds
            category = EM.by_key('category', magic.category);
        return category._2m.subtypes[0]._2m.mundanes[0];
    }
    function item_from_decorator(magic) {
        var mundane = template_from_decorator(magic);
        return get_item_dict(mundane, magic);
    }
    function item_from_template(mundane) {
        return get_item_dict(mundane);
    }
    function destroy_item(item) {
        return EM.remove('item', item);
    }
    function new_item(item_dict) {
        return EM.add('item', item_dict);
    }
    function get_price(magic, level, adjustment) {
        if(level) {
            return prices[level] * adjustment;
        } else if(magic) {
            return magic.cost * adjustment;
        } 
    }
    return {
        item_from_decorator: item_from_decorator,
        item_from_template: item_from_template,

        new_item: new_item,
        destroy_item: destroy_item
    };
}]);
