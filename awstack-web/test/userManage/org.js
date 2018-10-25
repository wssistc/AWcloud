'use strict'

describe('测试用户管理', function() {
    it('新建组织', () => { 
        browser.get('http://localhost:22555/#/permit/org');
        element.all(by.css('.table-action .btn ')).get(0).click();
        element(by.model('departName')).sendKeys("黑客")
        element(by.model('departDes')).sendKeys("新建组织测试");
        element(by.css('[ng-click="ok()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(2000);
    });
    it('新建组织子部门', () => { 
        $$('.tree-item .icon-aw-add-to2').then(function(arr){
            element.all(by.css('.tree-item .icon-aw-add-to2')).get(arr.length-1).click();
        })
        element(by.model('departName')).sendKeys("黑客1号")
        element(by.model('departDes')).sendKeys("新建组织子部门测试");
        element(by.css('[ng-click="ok()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(2000);
    });
    it('编辑组织', () => { 
        $$('.tree-item .icon-aw-modify').then(function(arr){
            element.all(by.css('.tree-item .icon-aw-modify')).get(arr.length-1).click();
        })
        element(by.model('departName')).clear();
        element(by.model('departName')).sendKeys("红客")
        element(by.model('departDes')).sendKeys("编辑组织测试");
        element(by.css('[ng-click="ok()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(2000);
    });
});