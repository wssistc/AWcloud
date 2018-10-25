'use strict'
describe('登出', function() {

	it('登出', () => {
		let adminCenterBtn = element(by.css('.user-mes-box .admin-center-info'));
		let logoutBtn = element(by.css('.user-mes-box .admin-center-info li a[ng-click="logOut()"]'))
		adminCenterBtn.click().then(() => {
			logoutBtn.click();
		});
		browser.driver.getCurrentUrl().then(url => {
			expect(url).toEqual('http://localhost:22555/#/');
		});

	})

});