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

Group = namedtuple('Group', ['name', 'templates', 'tags', 'drop'])
Template = namedtuple('Template', ['name', 'weight', 'drop'])
Category = namedtuple('Category', ['abbr', 'name', 'drop', 'groups'])
categories = [
    Category(abbr='ALCH', name='Alchemical Item', drop=100, groups=[
        Group(name='Alchemical Item', drop=100, tags=[''], templates=[
            Template(name='Alchemical Item', weight=0, drop=100)
        ])
    ]),
    Category(abbr='ALTE', name='Alternative Reward', drop=100, groups=[
        Group(name='Alternative Reward', drop=5, tags=[''], templates=[
            Template(name='Alternative Reward', weight=0, drop=100)
        ])
    ]),
    Category(abbr='AMMU', name='Ammunition', drop=100, groups=[
        Group(name='Arrows (30)', drop=100, tags=['Arrow'], templates=[
            Template(name='Arrow', weight=2, drop=100),
        ]),
        Group(name='Bullets (20)', drop=100, tags=['Bullet', 'Stones', 'Stone'], templates=[
            Template(name='Bullets (20)', weight=15, drop=30),
        ]),
        Group(name='Bolts (20)', drop=100, tags=['Bolt'], templates=[
            Template(name='Bolt', weight=2, drop=80),
        ]),
    ]),
    Category(abbr='ARMO', name='Armor', drop=100, groups=[
        Group(name='Cloth Armor', drop=100, tags=['Basic Clothing', 'Light'], templates=[
            Template(name='Cloth Armor', weight=4, drop=100),
        ]),
        Group(name='Leather Armor', drop=100, tags=['Light'], templates=[
            Template(name='Leather Armor', weight=15, drop=100),
        ]),
        Group(name='Hide Armor', drop=100, tags=['Light'], templates=[
            Template(name='Hide', weight=25, drop=100),
        ]),
        Group(name='Chainmail', drop=100, tags=['Chain', 'Heavy'], templates=[
            Template(name='Chainmail', weight=40, drop=100),
        ]),
        Group(name='Scale Armor', drop=100, tags=['Heavy'], templates=[
            Template(name='Scale Armor', weight=45, drop=100),
        ]),
        Group(name='Plate Armor', drop=100, tags=['Heavy'], templates=[
            Template(name='Plate Armor', weight=50, drop=100),
        ]),
    ]),
    Category(abbr='ARMS', name='Arms', drop=60, groups=[
        Group(name='Bracers', drop=100, tags=[''],
              templates=[Template(name='Bracers', weight=1, drop=100),
        ]),
        Group(name='Light Shield', drop=100, tags=[], templates=[
            Template(name='Light Shield', weight=6, drop=100),
        ]),
        Group(name='Heavy Shield', drop=100, tags=[], templates=[
            Template(name='Heavy Shield', weight=15, drop=100),
        ]),
    ]),
    Category(abbr='ARTI', name='Artifact', drop=100, groups=[
        Group(name='Artifact', drop=100, tags=[''], templates=[
            Template(name='Artifact', weight=0, drop=100)
        ])
    ]),
    Category(abbr='COMP', name='Companion', drop=50, groups=[
        Group(name='Companion', drop=100, tags=[''], templates=[
            Template(name='Companion', weight=0, drop=100)
        ])
    ]),
    Category(abbr='CONS', name='Consumable', drop=100, groups=[
        Group(name='Consumable', drop=100, tags=[''], templates=[
            Template(name='Consumable', weight=0, drop=100)
        ])
    ]),
    Category(abbr='EQUI', name='Equipment', drop=100, groups=[
        Group(name='Equipment', drop=100, tags=[''], templates=[
            Template(name='Equipment', weight=0, drop=100)
        ])
    ]),
    Category(abbr='FAMI', name='Familiar', drop=100, groups=[
        Group(name='Familiar', drop=100, tags=[''], templates=[
            Template(name='Familiar', weight=0, drop=100)
        ])
    ]),
    Category(abbr='FEET', name='Feet', drop=100, groups=[
        Group(name='Feet', drop=100, tags=[''], templates=[
            Template(name='Feet', weight=0, drop=100)
        ])
    ]),
    Category(abbr='HAND', name='Hands', drop=100, groups=[
        Group(name='Hands', drop=100, tags=[''], templates=[
            Template(name='Hands', weight=0, drop=100)
        ])
    ]),
    Category(abbr='HEAD', name='Head', drop=100, groups=[
        Group(name='Head', drop=100, tags=[''], templates=[
            Template(name='Head', weight=0, drop=100)
        ])
    ]),
    Category(abbr='HENE', name='Head and Neck', drop=100, groups=[
        Group(name='Head and Neck', drop=100, tags=[''], templates=[
            Template(name='Head and Neck', weight=0, drop=100)
        ])
    ]),
    Category(abbr='IMPL', name='Implement', drop=100, groups=[
        Group(name='Holy Symbol', drop=100, tags=[], templates=[
            Template(name='Holy Symbol', weight=1, drop=100),
        ]),
        Group(name='Orb Implement', drop=100, tags=[], templates=[
            Template(name='Orb Implement', weight=2, drop=100),
        ]),
        Group(name='Rod Implement', drop=100, tags=[], templates=[
            Template(name='Rod Implement', weight=2, drop=100),
        ]),
        Group(name='Staff Implement', drop=100, tags=[], templates=[
            Template(name='Staff Implement', weight=4, drop=100),
        ]),
        Group(name='Tome Implement', drop=100, tags=[], templates=[
            Template(name='Tome Implement', weight=1, drop=100),
        ]),
        Group(name='Wand Implement', drop=100, tags=[], templates=[
            Template(name='Wand Implement', weight=0, drop=100),
        ]),
    ]),
    Category(abbr='ITEM', name='Item Set', drop=100, groups=[
        Group(name='Item Set', drop=100, tags=[''], templates=[
            Template(name='Item Set', weight=0, drop=100)
        ])
    ]),
    Category(abbr='MOUN', name='Mount', drop=100, groups=[
        Group(name='Mount', drop=100, tags=[''], templates=[
            Template(name='Mount', weight=0, drop=100)
        ])
    ]),
    Category(abbr='NECK', name='Neck', drop=100, groups=[
        Group(name='Neck', drop=100, tags=[''], templates=[
            Template(name='Neck', weight=0, drop=100)
        ])
    ]),
    Category(abbr='RING', name='Ring', drop=100, groups=[
        Group(name='Ring', drop=100, tags=[''], templates=[
            Template(name='Ring', weight=0, drop=100)
        ])
    ]),
    Category(abbr='WAIS', name='Waist', drop=100, groups=[
        Group(name='Waist', drop=100, tags=[''], templates=[
            Template(name='Waist', weight=0, drop=100)
        ])
    ]),
    Category(abbr='WEAP', name='Weapon', drop=100, groups=[
        Group(name='Flail', tags=[], drop=100, templates=[
            Template(name='Flail', weight=5, drop=100),
            Template(name='Scourge', weight=2, drop=100),
            Template(name='Heavy Flail', weight=10, drop=100),
            Template(name='Triple-headed Flail', weight=6, drop=100),
            Template(name='Spiked Chain', weight=10, drop=100),
            Template(name='Double Flail', weight=11, drop=100),
        ]),
        Group(name='Sling', tags=[], drop=30, templates=[
            Template(name='Dejada', weight=2, drop=100),
            Template(name='Sling', weight=0, drop=100),
        ]),
        Group(name='Spear', tags=[], drop=100, templates=[
            Template(name='Javelin', weight=2, drop=70),
            Template(name='Spear', weight=6, drop=100),
            Template(name='Trident', weight=4, drop=70),
            Template(name='Longspear', weight=9, drop=0),
            Template(name='Tratnyr', weight=5, drop=10),
        ]),
        Group(name='Heavy Blade', tags=[], drop=100, templates=[
            Template(name='Scythe', weight=10, drop=100),
            Template(name='Broadsword', weight=5, drop=100),
            Template(name='Khopesh', weight=8, drop=100),
            Template(name='Longsword', weight=4, drop=100),
            Template(name='Scimitar', weight=4, drop=100),
            Template(name='Falchion', weight=7, drop=100),
            Template(name='Greatsword', weight=8, drop=100),
            Template(name='Bastard Sword', weight=6, drop=100),
            Template(name='Fullblade', weight=10, drop=100),
        ]),
        Group(name='Crossbow', drop=80, tags=[], templates=[
            Template(name='Hand Crossbow', weight=2, drop=100),
            Template(name='Crossbow', weight=4, drop=100),
            Template(name='Repeating Crossbow', weight=6, drop=100),
            Template(name='Superior Crossbow', weight=6, drop=100),
        ]),
        Group(name='Pick', tags=[], drop=50, templates=[
            Template(name='Light War Pick', weight=4, drop=100),
            Template(name='War Pick', weight=6, drop=100),
            Template(name='Heavy War Pick', weight=8, drop=100),
        ]),
        Group(name='Unarmed', tags=[], drop=10, templates=[
            Template(name='Spiked Gauntlet', weight=1, drop=100),
        ]),
        Group(name='Mace', tags=[], drop=100, templates=[
            Template(name='Club', weight=3, drop=100),
            Template(name='Mace', weight=6, drop=100),
            Template(name='Greatclub', weight=10, drop=50),
            Template(name='Morningstar', weight=8, drop=100),
        ]),
        Group(name='Axe', tags=[], drop=100, templates=[
            Template(name='Battleaxe', weight=6, drop=100),
            Template(name='Handaxe', weight=3, drop=100),
            Template(name='Greataxe', weight=12, drop=100),
            Template(name='Waraxe', weight=10, drop=10),
            Template(name='Execution Axe', weight=14, drop=5),
            Template(name='Double Axe', weight=15, drop=5),
            Template(name='Urgrosh', weight=8, drop=5),
        ]),
        Group(name='Light Blade', drop=100, tags=[], templates=[
            Template(name='Dagger', weight=1, drop=100),
            Template(name='Sickle', weight=2, drop=50),
            Template(name='Rapier', weight=2, drop=90),
            Template(name='Short Sword', weight=2, drop=100),
            Template(name='Katar', weight=1, drop=40),
            Template(name='Kukri', weight=2, drop=40),
            Template(name='Parrying Dagger', weight=1, drop=5),
            Template(name='Double Sword', weight=9, drop=5),
            Template(name='Shuriken (5)', weight=0, drop=5),
            Template(name='Spiked Shield', weight=7, drop=12),
        ]),
        Group(name='Polearm', tags=[], drop=100, templates=[
            Template(name='Glaive', weight=10, drop=100),
            Template(name='Halberd', weight=12, drop=100),
            Template(name='Greatspear', weight=8, drop=100),
        ]),
        Group(name='Hammer', tags=[], drop=80, templates=[
            Template(name='Throwing Hammer', weight=2, drop=70),
            Template(name='Warhammer', weight=5, drop=100),
            Template(name='Maul', weight=12, drop=100),
            Template(name='Craghammer', weight=6, drop=15),
            Template(name='Mordenkrad', weight=12, drop=10),
        ]),
        Group(name='Bow', tags=[], drop=100, templates=[
            Template(name='Longbow', weight=3, drop=100),
            Template(name='Shortbow', weight=2, drop=100),
            Template(name='Greatbow', weight=5, drop=50),
        ]),
        Group(name='Staff', drop=20, tags=[], templates=[
            Template(name='Quarterstaff', weight=4, drop=100),
        ]),
    ]),
    Category(abbr='WOND', name='Wondrous', drop=100, groups=[
        Group(name='Wondrous', drop=100, tags=[''], templates=[
            Template(name='Wondrous', weight=0, drop=100)
        ])
    ]),
]
