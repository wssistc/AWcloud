'use strict'
describe('测试系统管理', function() {
    it('导入激活码', () => { 
        browser.get('http://localhost:22555/#/system/license');
        element.all(by.css('[ng-click="applylicense()"]')).get(0).click().then(function(){//点击确定
            expect(element(by.css('.modal-footer')).isPresent()).toBe(true);
        });
    })
});