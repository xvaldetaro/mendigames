'use strict';

/* jasmine specs for controllers go here */

describe('CampaignsCt', function(){
    var campaignsCt, scope = {};


    beforeEach(function(){
        campaignsCt = new CampaignsCt(scope);
    });


    it('should return a campaigns model', function() {
        expect(scope.campaigns.length).toBe(1);
    });
});

