'use strict';

var _character1 = {"id":"1","name":"Character1"};
var _character2 = {"id":"2","name":"Character2"};
var _character_list = [_character1, _character2];
var _character_list_data = {"results": _character_list};


describe('Battle Services', function(){
    beforeEach(module('battle.services'));

    describe('Character Resource', function(){
        var $httpBackend;

        beforeEach(inject(function(_$httpBackend_){
            $httpBackend = _$httpBackend_;
        }));


        it('should return a character_list model', inject(function(Restangular) {
            $httpBackend.expectGET('/battle/character?format=json').
                respond(_character_list_data);

            var character_list = Restangular.all('character');
            character_list.getList().then(function(character_list) {
                var character1 = character_list[0];
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
});
