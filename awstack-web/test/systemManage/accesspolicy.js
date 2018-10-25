'use strict'
describe('测试系统管理', function() {
    it('黑名单新建', () => { 
        browser.get('http://localhost:22555/#/system/accesspolicy');
        element.all(by.css(".table-action button")).get(0).click();
        element(by.model('wbListIpsForm.listName')).sendKeys("hello");
        element(by.model('wbListIpsForm.bgnIp')).sendKeys("192.168.111.130");
        element(by.model('wbListIpsForm.description')).sendKeys("哈哈哈哈哈");
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000)
    })
    it('编辑', () => {
        $$('.checkbox .iconfont').then(function(arr){
            element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
        })
        element.all(by.css(".table-action button")).get(1).click();
        element(by.model('wbListIpsForm.listName')).clear();
        element(by.model('wbListIpsForm.listName')).sendKeys("zhubajie");
        element(by.model('wbListIpsForm.bgnIp')).clear();
        element(by.model('wbListIpsForm.bgnIp')).sendKeys("192.168.111.130");
        element(by.model('wbListIpsForm.description')).clear();
        element(by.model('wbListIpsForm.description')).sendKeys("哈哈哈哈哈");
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000);
    })
    it('删除', () => {
        $$('.checkbox .iconfont').then(function(arr){
            element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
        })
        element(by.css('[ng-click="delWbListIps(checkedItems)"]')).click();
        element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);;//判断新建弹出层的标题是否存在
        })
        browser.sleep(1000);
    })

});