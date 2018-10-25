'use strict'
describe('测试系统管理', function() {
    it('部门配額,是否配置', () => { 
        browser.get('http://localhost:22555/#/system/quotas');
        element.all(by.model('quota.hardLimit')).get(0).clear();
        element.all(by.model('quota.hardLimit')).get(0).sendKeys("hello");
        element.all(by.model('quota.hardLimit')).get(0).clear();
        element.all(by.model('quota.hardLimit')).get(0).sendKeys("1000");
        element.all(by.model('quota.hardLimit')).get(1).clear();
        element.all(by.model('quota.hardLimit')).get(1).sendKeys("200");
        element.all(by.model('quota.hardLimit')).get(2).clear();
        element.all(by.model('quota.hardLimit')).get(2).sendKeys("200");
        element.all(by.model('quota.hardLimit')).get(3).clear();
        element.all(by.model('quota.hardLimit')).get(3).sendKeys("200");
        element.all(by.model('quota.hardLimit')).get(16).clear();
        element.all(by.model('quota.hardLimit')).get(16).sendKeys("200000");
        element.all(by.css('.checkbox .iconfont')).get(16).click();
        element.all(by.css('.text-center .btn-primary')).get(0).click().then(function(){//点击确定
            expect(element(by.css('.modal-footer')).isPresent()).toBe(false);
        });
        
    })
    it('项目配額,是否配置', () => { 
        browser.get('http://localhost:22555/#/system/quotas');
        element.all(by.css(".nav-link")).get(1).click()
        element.all(by.model('quota.hardLimit')).get(20).clear();
        element.all(by.model('quota.hardLimit')).get(20).sendKeys("world");
        element.all(by.model('quota.hardLimit')).get(20).clear();
        element.all(by.model('quota.hardLimit')).get(20).sendKeys("12");
        element.all(by.model('quota.hardLimit')).get(23).clear();
        element.all(by.model('quota.hardLimit')).get(23).sendKeys("12");
        element.all(by.model('quota.hardLimit')).get(24).clear();
        element.all(by.model('quota.hardLimit')).get(24).sendKeys("12");
        element.all(by.model('quota.hardLimit')).get(28).clear();
        element.all(by.model('quota.hardLimit')).get(28).sendKeys("12");
        element.all(by.model('quota.hardLimit')).get(36).clear();
        element.all(by.model('quota.hardLimit')).get(36).sendKeys("12");
        element.all(by.css('.checkbox .iconfont')).get(36).click();
        element.all(by.css('.text-center .btn-primary')).get(1).click().then(function(){//点击确定
            expect(element(by.css('.modal-footer')).isPresent()).toBe(false);
        });
        
    })
});