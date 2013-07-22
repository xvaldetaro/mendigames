'use strict';
var _campaign1 = {"id": 1, "name": "campaign1", "resource_uri": "/battle/api/campaign/1/", "text": "campaign1_text"};
var _campaign2 = {"id": 2, "name": "campaign2", "resource_uri": "/battle/api/campaign/2/", "text": "campaign2_text"};
var _results = [_campaign1, _campaign2];
var _campaign_list_data = _results;

var _conditionList_data = {"results": [{name: "condition1"}, {name: "condition2"}]}
var _character1 = {"id": 1, "campaign": 1};
var _character2 = {"id": 2, "campaign": 1};
var _characters = [_character1, _character2];
var _characters_from_campaign_data = _characters;

/* jasmine specs for controllers go here */
describe('Battle controllers', function(){
    beforeEach(module('battle.services'));
    beforeEach(module('battle.controllers'));

    describe('Campaign List Controller', function(){
        var ctrl, scope, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller){
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/battle/campaign?format=json').
                respond(_campaign_list_data);

            scope = $rootScope.$new();
            ctrl = $controller('CampaignListCtrl', {$scope:scope});
        }));


        it('should return a campaign_list model', function() {
            expect(scope.campaign_list).toBeUndefined();
            $httpBackend.flush();

            expect(scope.campaign_list).toEqual(_results);
        });

    });

    describe('Campaign Detail Controller', function(){

        it('should return a campaign detail model', inject(function($httpBackend,
            $rootScope, $controller){

            var ctrl, scope = $rootScope.$new(), routeParams = {"campaignId": '1'};

            $httpBackend.expectGET('/battle/campaign/1?format=json').
                respond(_campaign1);

            ctrl = $controller('CampaignCtrl',
                {$scope:scope, CharacterList:{list:_characters}, $routeParams:routeParams });

            expect(scope.campaign).toBeUndefined();
            $httpBackend.flush();

            expect(scope.campaign).toEqual(_campaign1);
            expect(scope.characterList).toEqual(_characters);
        }));

    });
});

