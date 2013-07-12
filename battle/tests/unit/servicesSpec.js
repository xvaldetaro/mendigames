'use strict';

describe('Battle controllers', function(){

    describe('Campaign List Controller', function(){
        var $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller){
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('/battle/campaign/.json').
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
});
