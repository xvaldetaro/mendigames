"use strict";

angular.module('mendigames')

.factory('Ocont', ['EM', 'U','Oit',
function(EM, U, Oit) {
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
        change_gold(item._2o.container, item.cost*cost_adjustment);
        U.pluck(item._2o.container._2m.items, item);
        return Oit.destroy_item(item);
    }
    function buy_item(to_cont, item, cost_adjustment) {
        change_gold(to_cont, -1*(item.cost*cost_adjustment));
        return put_item(to_cont, item);
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
    function get_item_dict(itemTemplate, itemDecorator, opts) {
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
            if(itemDecorator)
                item.name = itemDecorator.name;
            else if(itemTemplate)
                item.name = itemTemplate.name;
            else
                item.name = 'Unnamed Item';
        }
        // Cost
        if(level) {
            item.cost = prices[level] + cost_addition;
        } else if(itemDecorator) {
            item.cost = itemDecorator.cost + cost_addition;
        } else if(itemTemplate) {
            item.cost = itemTemplate.cost + cost_addition;
        } else {
            item.cost = cost_addition;
        }

        // Weight
        if(itemTemplate) {
            item.weight = itemTemplate.weight + weight_addition;
        } else {
            item.weight = weight_addition; 
        }

        // Level
        if(!level)
            level = itemDecorator.level;
        item.level = level;

        // Put the relateds inside the EM list
        if(itemDecorator) {
            if(!EM.by_key('item_decorator', itemDecorator.id))
                EM.add_local('item_decorator', itemDecorator);
        }

        item.item_decorator = itemDecorator.id;
        item.item_template = itemTemplate.id;
        item._2o = { item_decorator: itemDecorator, item_template: itemTemplate };

        return item;
    }
    function template_from_decorator(itemDecorator) {
        var category = itemDecorator._2o.item_category;
        if(!category) //decorators are searched outside the EM, thus there are no relateds
            category = EM.by_key('item_category', itemDecorator.item_category);
        return category._2m.item_groups[0]._2m.item_templates[0];
    }
    function item_from_decorator(itemDecorator) {
        var itemTemplate = template_from_decorator(itemDecorator);
        return get_item_dict(itemTemplate, itemDecorator);
    }
    function item_from_template(itemTemplate) {
        return get_item_dict(itemTemplate);
    }
    function destroy_item(item) {
        return EM.remove('item', item);
    }
    function new_item(item_dict) {
        return EM.add('item', item_dict);
    }
    function get_price(itemDecorator, level, adjustment) {
        if(level) {
            return prices[level] * adjustment;
        } else if(itemDecorator) {
            return itemDecorator.cost * adjustment;
        } 
    }
    return {
        item_from_decorator: item_from_decorator,
        item_from_template: item_from_template,

        new_item: new_item,
        destroy_item: destroy_item
    };
}]);
