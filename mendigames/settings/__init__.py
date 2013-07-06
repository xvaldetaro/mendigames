import os
from mendigames.settings.base import *

env = os.environ.get('ENV', 'development')

if env == 'production':
    from mendigames.settings.production import *
elif env == 'test':
    from mendigames.settings.test import *
else:
    from mendigames.settings.development import *
