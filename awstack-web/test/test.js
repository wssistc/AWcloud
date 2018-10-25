'use strict'
describe('测试', function() {

	it('登录页登陆成功测试', () => {
		browser.get('http://localhost:22555');
		let username = element(by.model('login.username'))
		let enterpriseLoginName = element(by.model('login.enterpriseLoginName'))
		let password = element(by.model('login.password'))
		let submit = element(by.css('.login-form .btn.btn-primary[type="submit"]'))

		username.sendKeys('admin')
		password.sendKeys('Awcloud!23')
		enterpriseLoginName.sendKeys('awcloud888')
		submit.click()

		return browser.driver.wait(function() {
			return browser.driver.getCurrentUrl().then(function(url) {
				return url === 'http://localhost:22555/#/view';
			});
		}, 3000);
	})

	it('登录页登陆失败测试', () => {
		browser.get('http://localhost:22555');
		let enterpriseLoginName = element(by.model('login.enterpriseLoginName'))
		let username = element(by.model('login.username'))
		let password = element(by.model('login.password'))
		let submit = element(by.css('.login-form .btn.btn-primary[type="submit"]'))

		username.sendKeys('admin')
		password.sendKeys('awcloud2')
		enterpriseLoginName.sendKeys('awzhao91')
		submit.click()

		let errinfo = element(by.css('.signuperror')).getText()
		expect(errinfo).toEqual('用户名或密码错误')
	})

});