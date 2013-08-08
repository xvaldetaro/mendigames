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
    // Item owner gets money. Item transfer to \to_cont
    function sell_item_transfer(to_cont, item, cost_adjustment) {
        return $q.all([
            change_gold(item._2o.container(), item.cost*cost_adjustment),
            put_item(to_cont, item)
        ]);
    }
    // Item owner gets money. Item destroyed
    function sell_item_destroy(item, cost_adjustment) {
        //U.pluck(item._2o.container()._2m.items(), item);
        return $q.all([
            change_gold(item._2o.container(), item.cost*cost_adjustment),
            Oit.destroy_item(item)
        ]);
    }
    // \to_cont gets money and item
    function buy_item(to_cont, item, cost_adjustment) {
        return $q.all([
            change_gold(to_cont, -1*(item.cost*cost_adjustment)),
            put_item(to_cont, item)
        ]);
    }
    // Handles item instances and item dicts
    function put_item(to_cont, item) {
        to_cont._2m.items().push(item);
        item.container = to_cont.id;
        item._2o.container = function(){ return to_cont; };
        if(item.id)
            return EM.update('item', item);
        else
            return Oit.new_item(item).then(function(newE) {
                U.replace(to_cont._2m.items(), item, newE);
            })
    }
    return {
        change_gold: change_gold,
        buy_item: buy_item,
        put_item: put_item,
        sell_item_destroy: sell_item_destroy,
        sell_item_transfer: sell_item_transfer
    };
}])

.factory('Oit', ['EM', 'Restangular',
function(EM, Restangular) {
    var prices = [0,360,520,680,840,1000,1800,2600,3400,4200,5000,9000,13000,17000,21000,
        25000, 45000,65000,85000,105000,125000,225000,325000,425000,525000,625000,1125000,
        1625000,2125000,2625000,3125000];
    // Options are: level(decorator with level+), cost, weight, name
    function get_item_dict(opts) {
        var weight = 0, cost = 0, level, mundane, magic;
        var item = { cost: 0, weight: 0, level: 0 };
        if(opts) {
            weight = opts.weight || 0;
            cost = opts.cost || 0;
            item.name = opts.name;
            level = opts.level;
            mundane = opts.mundane;
            magic = opts.magic;
            if(opts.amount)
                item.amount = opts.amount;
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
        if(cost) {
            item.cost = cost;
        } else if(level && level > magic.level) {
            item.cost = prices[level];
        } else if(magic) {
            item.cost = magic.cost;
        } else if(mundane) {
            item.cost = mundane.cost;
        }

        // Weight
        if(weight) {
            item.weight = weight;
        } else if(mundane) {
            item.weight = mundane.weight;
        }

        item.cost *= item.amount;
        item.weight *= item.amount;

        // Level
        if(!level && magic)
            level = magic.level;
        item.level = level;

        // Put the relateds inside the EM list
        if(magic) {
            if(!EM.by_key('magic', magic.id))
                EM.add_local('magic', magic);
            item.magic = magic.id;
        }
        if(mundane)
            item.mundane = mundane.id;
        EM.merge_related('item', item);

        return item;
    }
    function item_from_mundane(mundane) {
        return get_item_dict({mundane: mundane});
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
    var preamble = '<b>\\s*', posamble = ':\\s*<\\/b>([\\w\\s\\(\\),]+)<\\/p>';
    var lineSplit = /\s*,\s*|\s*or\s*/, any = /^\s*any\s*$/i, space = /\s+/;
    function match_names(rawName, subtypes, matchedSubtypes) {
        var subName = rawName.split(space)[0];
        if(subName.match(any))
            subName = rawName.split(space)[1];
        for(var i = subtypes.length - 1; i >= 0; i--) {
            if(subtypes[i].tags.match(new RegExp(subName,'i')) ||
                subtypes[i].name.match(new RegExp('^'+subName+'(:?\\s|$)','i'))) {
                if(matchedSubtypes.indexOf(subtypes[i]) == -1)
                    matchedSubtypes.push(subtypes[i]);
            }
        }
    }
    function parse_subtypes(magic, html) {
        var category = magic._2o.category();
        var subtypes = category._2m.subtypes();
        if(subtypes.length == 1)
            return subtypes;

        var line = html.match(new RegExp(preamble+category.name+posamble, 'i'))[1];
        if(!line)
            return null;

        var rawNames = line.split(lineSplit);
        if(!rawNames)
            return null;

        var matchSubtypes = [];
        if(rawNames.length == 1 && rawNames[0].match(any)) {
            matchSubtypes = subtypes;
        } else {
            for(var i = rawNames.length - 1; i >= 0; i--) {
                var subtype = match_names(rawNames[i], subtypes, matchSubtypes);
            }
        }
        var instanceList = [];
        for(var i=0, len=matchSubtypes.length; i<len; i++) {
            instanceList.push({magic: magic.id, subtype: matchSubtypes[i].id});
        }
        return EM.add_list('m2m_magic_subtype', instanceList);
    }
    return {
        item_from_mundane: item_from_mundane,
        get_item_dict: get_item_dict,

        new_item: new_item,
        destroy_item: destroy_item,
        parse_subtypes: parse_subtypes
    };
}]);
