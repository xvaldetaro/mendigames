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


    describe('campaigns', function() {

      beforeEach(function() {
        browser().navigateTo('#/campaigns');
      });


      it('should render campaigns when user navigates to /campaigns', function() {
        expect(element('[ng-view] h1:first').text()).
          toMatch(/campaigns:/);
      });

    });
});
