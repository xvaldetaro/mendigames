'use strict';

var _character1 = {"id":"1","name":"Character1"};
var _character2 = {"id":"2","name":"Character2"};
var _characterList = [_character1, _character2];
var _characterList_data = _characterList;


describe('Battle Services', function(){
    beforeEach(module('mendigames.services'));

    describe('Character Resource', function(){
        var $httpBackend;

        beforeEach(inject(function(_$httpBackend_){
            $httpBackend = _$httpBackend_;
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
