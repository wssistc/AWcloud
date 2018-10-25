'use strict'
describe('测试', function () {
    it('刷新系统盘测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(1).click();//点击系统盘
        var firstName = element.all(by.css('.table tbody tr td .edit-name > a')).get(10).getText();
        element.all(by.css('.btn.btn-refresh')).get(1).click().then(function () {//点击刷新
            expect(element.all(by.css('.table tbody tr td .edit-name > a')).get(10).getText()).toEqual(firstName);//判断新建弹出层的标题是否存在
        });
    });
});