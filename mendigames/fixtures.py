from collections import namedtuple


action_types = {
    'Free': "FR",
    "Immediate Interrupt": 'II',
    'Immediate Reaction': 'IR',
    'Minor': 'MI',
    'Move': 'MO',
    'No Action': 'NA',
    'Opportunity': 'OP',
    'Standard': 'ST',
}

ts_types = {
    'Background': 'BA',
    'Theme': 'TH',
    'Class': 'CL',
    'Epic Destiny': 'ED',
    'Paragon Path': 'PP',
    'Race': 'RA'
}

power_types = {
    'Daily': 'D',
    'Encounter': 'E',
    'At-Will': 'W'
}

categories = {
    'Armor': 'ARMO',
    'Arms': 'ARMS',
    'Item Set': 'ITEM',
    'Wondrous': 'WOND',
    'Ammunition': 'AMMU',
    'Waist': 'WAIS',
    'Alternative Reward': 'ALTE',
    'Head': 'HEAD',
    'Familiar': 'FAMI',
    'Artifact': 'ARTI',
    'Companion': 'COMP',
    'Hands': 'HAND',
    'Consumable': 'CONS',
    'Mount': 'MOUN',
    'Neck': 'NECK',
    'Weapon': 'WEAP',
    'Implement': 'IMPL',
    'Equipment': 'EQUI',
    'Alchemical Item': 'ALCH',
    'Feet': 'FEET',
    'Head and Neck': 'HEAD',
    'Ring': 'RING',
}

rarity_types = {
    'Rare': 'R',
    'Uncommon': 'U',
    'Mundane': 'A',
    'Common': 'C',
}

group_roles = {
    'Minion': 'MI',
    'Solo': 'SO',
    'Conjured': 'CO',
    'Elite': 'EL',
    'Standard': 'ST',
}

combat_roles = {
    'Lurker': 'LU',
    'Skirmisher': 'SK',
    'No role': 'NO',
    'Artillery': 'AR',
    'No Role': 'NO',
    'Brute': 'BR',
    'Soldier': 'SO',
    'Controller': 'CO',
    'Leader': 'LE',
}

categories = [
    { 'abbr': 'ALCH', 'name': 'Alchemical Item', 'drop': 100, 'groups': [
        { 'name': 'Alchemical Item', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Alchemical Item', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'ALTE', 'name': 'Alternative Reward', 'drop': 100, 'groups': [
        { 'name': 'Alternative Reward', 'drop': 5, 'on_empty': True, 'templates': [
            { 'name': 'Alternative Reward', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'AMMU', 'name': 'Ammunition', 'drop': 100, 'groups': [
        { 'name': 'Arrows (30)', 'drop': 100, 'tags': 'Arrow', 'templates': [
            { 'name': 'Arrow', 'weight': 2, 'drop': 100 },
        ]},
        { 'name': 'Bullets (20)', 'drop': 100, 'tags': 'Bullet Stone', 'templates': [
            { 'name': 'Bullets (20)', 'weight': 15, 'drop': 30 },
        ]},
        { 'name': 'Bolts (20)', 'drop': 100, 'tags': 'Bolt', 'templates': [
            { 'name': 'Bolts (20)', 'weight': 2, 'drop': 80 },
        ]},
    ]},
    { 'abbr': 'ARMO', 'name': 'Armor', 'drop': 100, 'groups': [
        { 'name': 'Cloth Armor', 'drop': 100, 'tags': 'Basic Clothing Light', 'templates': [
            { 'name': 'Cloth Armor', 'weight': 4, 'drop': 100 },
        ]},
        { 'name': 'Leather Armor', 'drop': 100, 'tags': 'Light', 'templates': [
            { 'name': 'Leather Armor', 'weight': 15, 'drop': 100 },
        ]},
        { 'name': 'Hide Armor', 'drop': 100, 'tags': 'Light', 'templates': [
            { 'name': 'Hide', 'weight': 25, 'drop': 100 },
        ]},
        { 'name': 'Chainmail', 'drop': 100, 'tags': 'Chain Heavy', 'templates': [
            { 'name': 'Chainmail', 'weight': 40, 'drop': 100 },
        ]},
        { 'name': 'Scale Armor', 'drop': 100, 'tags': 'Heavy', 'templates': [
            { 'name': 'Scale Armor', 'weight': 45, 'drop': 100 },
        ]},
        { 'name': 'Plate Armor', 'drop': 100, 'tags': 'Heavy', 'templates': [
            { 'name': 'Plate Armor', 'weight': 50, 'drop': 100 },
        ]},
    ]},
    { 'abbr': 'ARMS', 'name': 'Arms', 'drop': 60, 'groups': [
        { 'name': 'Bracers', 'drop': 100, 'on_empty': True,
              'templates': [{ 'name': 'Bracers', 'weight': 1, 'drop': 100 },
        ]},
        { 'name': 'Light Shield', 'drop': 100, 'templates': [
            { 'name': 'Light Shield', 'weight': 6, 'drop': 100 },
        ]},
        { 'name': 'Heavy Shield', 'drop': 100, 'templates': [
            { 'name': 'Heavy Shield', 'weight': 15, 'drop': 100 },
        ]},
    ]},
    { 'abbr': 'ARTI', 'name': 'Artifact', 'drop': 100, 'groups': [
        { 'name': 'Artifact', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Artifact', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'COMP', 'name': 'Companion', 'drop': 50, 'groups': [
        { 'name': 'Companion', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Companion', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'CONS', 'name': 'Consumable', 'drop': 100, 'groups': [
        { 'name': 'Consumable', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Consumable', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'EQUI', 'name': 'Equipment', 'drop': 100, 'groups': [
        { 'name': 'Equipment', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Equipment', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'FAMI', 'name': 'Familiar', 'drop': 100, 'groups': [
        { 'name': 'Familiar', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Familiar', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'FEET', 'name': 'Feet', 'drop': 100, 'groups': [
        { 'name': 'Feet', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Feet', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'HAND', 'name': 'Hands', 'drop': 100, 'groups': [
        { 'name': 'Hands', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Hands', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'HEAD', 'name': 'Head', 'drop': 100, 'groups': [
        { 'name': 'Head', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Head', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'HENE', 'name': 'Head and Neck', 'drop': 100, 'groups': [
        { 'name': 'Head and Neck', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Head and Neck', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'IMPL', 'name': 'Implement', 'drop': 100, 'groups': [
        { 'name': 'Holy Symbol', 'drop': 100, 'templates': [
            { 'name': 'Holy Symbol', 'weight': 1, 'drop': 100 },
        ]},
        { 'name': 'Orb Implement', 'drop': 100, 'templates': [
            { 'name': 'Orb Implement', 'weight': 2, 'drop': 100 },
        ]},
        { 'name': 'Rod Implement', 'drop': 100, 'templates': [
            { 'name': 'Rod Implement', 'weight': 2, 'drop': 100 },
        ]},
        { 'name': 'Staff Implement', 'drop': 100, 'templates': [
            { 'name': 'Staff Implement', 'weight': 4, 'drop': 100 },
        ]},
        { 'name': 'Tome Implement', 'drop': 100, 'templates': [
            { 'name': 'Tome Implement', 'weight': 1, 'drop': 100 },
        ]},
        { 'name': 'Totem Implement', 'drop': 100, 'templates': [
            { 'name': 'Totem Implement', 'weight': 1, 'drop': 50 },
        ]},
        { 'name': 'Wand Implement', 'drop': 100, 'templates': [
            { 'name': 'Wand Implement', 'weight': 0, 'drop': 100 },
        ]},
    ]},
    { 'abbr': 'ITEM', 'name': 'Item Set', 'drop': 100, 'groups': [
        { 'name': 'Item Set', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Item Set', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'MOUN', 'name': 'Mount', 'drop': 100, 'groups': [
        { 'name': 'Mount', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Mount', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'NECK', 'name': 'Neck', 'drop': 100, 'groups': [
        { 'name': 'Neck', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Neck', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'RING', 'name': 'Ring', 'drop': 100, 'groups': [
        { 'name': 'Ring', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Ring', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'WAIS', 'name': 'Waist', 'drop': 100, 'groups': [
        { 'name': 'Waist', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Waist', 'weight': 0, 'drop': 100 }
        ] }
    ]},
    { 'abbr': 'WEAP', 'name': 'Weapon', 'drop': 100, 'groups': [
        { 'name': 'Flail', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Flail', 'weight': 5, 'drop': 100 },
            { 'name': 'Scourge', 'weight': 2, 'drop': 100 },
            { 'name': 'Heavy Flail', 'weight': 10, 'drop': 100 },
            { 'name': 'Triple-headed Flail', 'weight': 6, 'drop': 100 },
            { 'name': 'Spiked Chain', 'weight': 10, 'drop': 100 },
            { 'name': 'Double Flail', 'weight': 11, 'drop': 100 },
        ]},
        { 'name': 'Sling', 'drop': 30, 'tags': 'ranged', 'templates': [
            { 'name': 'Dejada', 'weight': 2, 'drop': 100 },
            { 'name': 'Sling', 'weight': 0, 'drop': 100 },
        ]},
        { 'name': 'Spear', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Javelin', 'weight': 2, 'drop': 70 },
            { 'name': 'Spear', 'weight': 6, 'drop': 100 },
            { 'name': 'Trident', 'weight': 4, 'drop': 70 },
            { 'name': 'Longspear', 'weight': 9, 'drop': 0 },
            { 'name': 'Tratnyr', 'weight': 5, 'drop': 10 },
        ]},
        { 'name': 'Heavy Blade', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Scythe', 'weight': 10, 'drop': 100 },
            { 'name': 'Broadsword', 'weight': 5, 'drop': 100 },
            { 'name': 'Khopesh', 'weight': 8, 'drop': 100 },
            { 'name': 'Longsword', 'weight': 4, 'drop': 100 },
            { 'name': 'Scimitar', 'weight': 4, 'drop': 100 },
            { 'name': 'Falchion', 'weight': 7, 'drop': 100 },
            { 'name': 'Greatsword', 'weight': 8, 'drop': 100 },
            { 'name': 'Bastard Sword', 'weight': 6, 'drop': 100 },
            { 'name': 'Fullblade', 'weight': 10, 'drop': 100 },
        ]},
        { 'name': 'Crossbow', 'drop': 80, 'tags': 'ranged', 'templates': [
            { 'name': 'Hand Crossbow', 'weight': 2, 'drop': 100 },
            { 'name': 'Crossbow', 'weight': 4, 'drop': 100 },
            { 'name': 'Repeating Crossbow', 'weight': 6, 'drop': 100 },
            { 'name': 'Superior Crossbow', 'weight': 6, 'drop': 100 },
        ]},
        { 'name': 'Pick', 'drop': 50, 'tags': 'melee', 'templates': [
            { 'name': 'Light War Pick', 'weight': 4, 'drop': 100 },
            { 'name': 'War Pick', 'weight': 6, 'drop': 100 },
            { 'name': 'Heavy War Pick', 'weight': 8, 'drop': 100 },
        ]},
        { 'name': 'Unarmed', 'drop': 10, 'tags': 'melee', 'templates': [
            { 'name': 'Spiked Gauntlet', 'weight': 1, 'drop': 100 },
        ]},
        { 'name': 'Mace', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Club', 'weight': 3, 'drop': 100 },
            { 'name': 'Mace', 'weight': 6, 'drop': 100 },
            { 'name': 'Greatclub', 'weight': 10, 'drop': 50 },
            { 'name': 'Morningstar', 'weight': 8, 'drop': 100 },
        ]},
        { 'name': 'Axe', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Battleaxe', 'weight': 6, 'drop': 100 },
            { 'name': 'Handaxe', 'weight': 3, 'drop': 100 },
            { 'name': 'Greataxe', 'weight': 12, 'drop': 100 },
            { 'name': 'Waraxe', 'weight': 10, 'drop': 10 },
            { 'name': 'Execution Axe', 'weight': 14, 'drop': 5 },
            { 'name': 'Double Axe', 'weight': 15, 'drop': 5 },
            { 'name': 'Urgrosh', 'weight': 8, 'drop': 5 },
        ]},
        { 'name': 'Light Blade', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Dagger', 'weight': 1, 'drop': 100 },
            { 'name': 'Sickle', 'weight': 2, 'drop': 50 },
            { 'name': 'Rapier', 'weight': 2, 'drop': 90 },
            { 'name': 'Short Sword', 'weight': 2, 'drop': 100 },
            { 'name': 'Katar', 'weight': 1, 'drop': 40 },
            { 'name': 'Kukri', 'weight': 2, 'drop': 40 },
            { 'name': 'Parrying Dagger', 'weight': 1, 'drop': 5 },
            { 'name': 'Double Sword', 'weight': 9, 'drop': 5 },
            { 'name': 'Shuriken (5)', 'weight': 0, 'drop': 5 },
            { 'name': 'Spiked Shield', 'weight': 7, 'drop': 12 },
        ]},
        { 'name': 'Polearm', 'drop': 100, 'tags': 'melee', 'templates': [
            { 'name': 'Glaive', 'weight': 10, 'drop': 100 },
            { 'name': 'Halberd', 'weight': 12, 'drop': 100 },
            { 'name': 'Greatspear', 'weight': 8, 'drop': 100 },
        ]},
        { 'name': 'Hammer', 'drop': 80, 'tags': 'melee', 'templates': [
            { 'name': 'Throwing Hammer', 'weight': 2, 'drop': 70 },
            { 'name': 'Warhammer', 'weight': 5, 'drop': 100 },
            { 'name': 'Maul', 'weight': 12, 'drop': 100 },
            { 'name': 'Craghammer', 'weight': 6, 'drop': 15 },
            { 'name': 'Mordenkrad', 'weight': 12, 'drop': 10 },
        ]},
        { 'name': 'Bow', 'drop': 100, 'tags': 'ranged', 'templates': [
            { 'name': 'Longbow', 'weight': 3, 'drop': 100 },
            { 'name': 'Shortbow', 'weight': 2, 'drop': 100 },
            { 'name': 'Greatbow', 'weight': 5, 'drop': 50 },
        ]},
        { 'name': 'Staff', 'drop': 20, 'tags': 'melee', 'templates': [
            { 'name': 'Quarterstaff', 'weight': 4, 'drop': 100 },
        ]},
    ]},
    { 'abbr': 'WOND', 'name': 'Wondrous', 'drop': 100, 'groups': [
        { 'name': 'Wondrous', 'drop': 100, 'on_empty': True, 'templates': [
            { 'name': 'Wondrous', 'weight': 0, 'drop': 100 }
        ] }
    ]},
]
