'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('battle', function() {

    beforeEach(function() {
        browser().navigateTo('/battle/battle/');
    });


    it('should automatically redirect to /home when location hash/fragment is empty', 
        function() {
            expect(browser().location().url()).toBe("/home");
    });


    describe('campaign_list', function() {

      beforeEach(function() {
        browser().navigateTo('#/campaign_list');
      });


      it('should render campaign_list when user navigates to /campaign_list', function() {
        expect(element('[ng-view] h1:first').text()).
          toMatch(/campaign_list:/);
      });

    });
});
