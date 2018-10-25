function LoginAction(){
    //输入账号密码然后点击登录
    it('自动登录', () => {
        browser.get('http://localhost:22555');
        browser.wait(function(){
            return browser.isElementPresent(by.model("login.username"));
        },5000)
        let username = element(by.model('login.username'))
        let enterpriseLoginName = element(by.model('login.enterpriseLoginName'))
        let password = element(by.model('login.password'))
        let submit = element(by.css('.login-form .btn.btn-primary[type="submit"]'))

        username.sendKeys('admin')
        password.sendKeys('Awcloud!23')
        enterpriseLoginName.sendKeys('awcloud888')
        submit.click();
        return browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
                return url === 'http://localhost:22555/#/view';
            });
        }, 3000);
    });
}

module.exports = LoginAction;


 