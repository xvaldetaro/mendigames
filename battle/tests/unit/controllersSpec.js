'use strict';
var _campaign1 = {"id": 1, "name": "campaign1", "resource_uri": "/battle/api/campaign/1/", "text": "campaign1_text"};
var _campaign2 = {"id": 2, "name": "campaign2", "resource_uri": "/battle/api/campaign/2/", "text": "campaign2_text"};
var _objects = [_campaign1, _campaign2];
var _json_get = {"objects": _objects};

/* jasmine specs for controllers go here */
describe('Battle controllers', function(){

    describe('Campaign List Controller', function(){
        var ctrl, scope = {}, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller){
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/battle/api/campaign/?format=json').
                respond(_json_get);

            scope = $rootScope.$new();
            ctrl = $controller('CampaignListCtrl', {$scope:scope});
        }));


        it('should return a campaign_list model', function() {
            expect(scope.campaign_list).toBeUndefined();
            $httpBackend.flush();

            expect(scope.campaign_list).toEqual(_objects);
        });

    });

    describe('Campaign Detail Controller', function(){

        it('should return a campaign detail model', inject(function($httpBackend,
            $rootScope, $controller){

            var ctrl, scope = {}, routeParams = {"campaignId": '1'};

            $httpBackend.expectGET('/battle/api/campaign/1/?format=json').
                respond(_campaign1);

            ctrl = $controller('CampaignDetailCtrl',
                {$scope:scope, $routeParams:routeParams });

            expect(scope.campaign_detail).toBeUndefined();
            $httpBackend.flush();

            expect(scope.campaign_detail).toEqual(_campaign1);
        }));

    });
});

