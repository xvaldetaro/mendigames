from fabric.api import *

def redb():
    with settings(warn_only=True):
        local('mysql -u root -h localhost -P 3306 -p mysql < dropdb_mysql')
        local('mysql -u root -h localhost -P 3306 -p mysql < createdb_mysql')
        local('rm -rf mendigames/migrations')
        local('python manage.py syncdb')

def fix():
    local('python manage.py loaddata fix.json')

def fixvar():
    local('python manage.py loaddata fixvar.json')

def dump():
    local('python manage.py dumpdata mendigames >> fix.json')

def sminit():
    local('python manage.py schemamigration mendigames --init')
    local('python manage.py migrate mendigames --fake')

def sm():
    local('python manage.py schemamigration mendigames --auto')
    local('python manage.py migrate mendigames')

