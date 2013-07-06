from dilla import spam
import string
import random

random.seed()

@spam.global_handler('IntegerField')  # field.get_internal_type()
def random_int(record, field):
    return random.randint(0, 100)

@spam.strict_handler('battle.Character.experience_points')
def get_xp(record, field):
    return random.randint(0, 10000)