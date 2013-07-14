'use strict';

var _campaign1 = {"id": 1, "name": "campaign1", "resource_uri": "/battle/api/campaign/1/", "text": "campaign1_text"};
var _campaign2 = {"id": 2, "name": "campaign2", "resource_uri": "/battle/api/campaign/2/", "text": "campaign2_text"};
var _results = [_campaign1, _campaign2];
var _campaign_list_data = {"results": _results};

var _character1 = {"id": 1, "campaign": 1};
var _character2 = {"id": 2, "campaign": 1};
var _characters = [_character1, _character2];
var _characters_from_campaign_data = {"results": _characters };

describe('battle', function() {

    it('should automatically redirect to /home when location hash/fragment is empty', 
        function() {
            browser().navigateTo('/battle/battle/');
            expect(browser().location().url()).toBe("/home");
    });


    describe('campaign list', function() {

      beforeEach(function($httpBackend){
        browser().navigateTo('#/campaign_list');
      });

      it('should render campaign_list when user navigates to /campaign_list', function() {
        expect(repeater('ul li').count()).toEqual(2);
      });

    });

});
