'use strict';

var _character1 = {"id":"1","name":"Character1"};
var _character2 = {"id":"2","name":"Character2"};
var _characterList = [_character1, _character2];
var _characterList_data = _characterList;


describe('Battle Services', function(){
    beforeEach(module('battle.services'));

    describe('Character Resource', function(){
        var $httpBackend;

        beforeEach(inject(function(_$httpBackend_){
            $httpBackend = _$httpBackend_;
        }));


        it('should return a characterList model', inject(function(Restangular) {
            $httpBackend.expectGET('/battle/character?format=json').
                respond(_characterList_data);

            var characterList = Restangular.all('character');
            characterList.getList().then(function(characterList) {
                var character1 = characterList[0];
                expect(character1).toEqual(_character1);
            });

            $httpBackend.flush();
        }));

        it('should return a character model', inject(function(Restangular) {
            $httpBackend.expectGET('/battle/character/2?format=json').
                respond(_character2);
            $httpBackend.expectPUT('/battle/character/2?format=json').
                respond(_character2);

            var character2 = Restangular.one('character', 2).get().then(
                function(character){
                    expect(character).toEqual(_character2);
                    character.name = "newname";
                    character.put();
                });

            $httpBackend.flush();
        }));
    });

    describe('Roll service', function(){
        it('should return a characterList model', inject(function(roll) {
            for (var i = 0;i<1000;i++) {
                var result = roll(i);
                expect(result).toBeLessThan(i+21);
                expect(result).toBeGreaterThan(i-1);
            }
            for (var i = 0;i<1000;i++) {
                var result = roll();
                expect(result).toBeLessThan(21);
                expect(result).toBeGreaterThan(0);
            }
        }));
    });

    describe('Wizards service', function(){
        it('Get the proper detail detailTag', inject(function($rootScope, WizardsService, $httpBackend) {
            var id = 10, model = 'power', detailTag = '<html><div id="detail">A</div></html>';
            $httpBackend.expectGET('/dndinsider/compendium/'+model+'.aspx?id='+id).
                respond("");

            WizardsService.fetch(id, model);
        }));
    });
});
