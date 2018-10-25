'use strict'

describe('测试用户管理', function() {
    it('新建部门', () => { 
        browser.get('http://localhost:22555/#/permit/department');
        element.all(by.css('.table-action .btn ')).get(0).click();
        element(by.model('domain.name')).sendKeys("xxxx")
        element(by.model('domain.description')).sendKeys("新建部门测试");
        element.all(by.model('quota.hardLimit')).get(0).clear();
        element.all(by.model('quota.hardLimit')).get(0).sendKeys("新建");
        element.all(by.model('quota.hardLimit')).get(0).clear();
        element.all(by.model('quota.hardLimit')).get(0).sendKeys("10");
        element.all(by.model('quota.hardLimit')).get(1).clear();
        element.all(by.model('quota.hardLimit')).get(1).sendKeys("21");
        element(by.css('[ng-click="confirmDep()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(2000);
    });
    it('编辑部门', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element.all(by.css('.table-action .btn ')).get(1).click();
        element(by.model('domain.name')).clear();
        element(by.model('domain.name')).sendKeys("编辑部门名称a");
        element(by.model('domain.description')).clear();
        element(by.model('domain.description')).sendKeys("编辑部门测试");
        element.all(by.model('quota.hardLimit')).get(0).clear();
        element.all(by.model('quota.hardLimit')).get(0).sendKeys("22");
        element.all(by.model('quota.hardLimit')).get(1).clear();
        element.all(by.model('quota.hardLimit')).get(1).sendKeys("33");
        element(by.css('[ng-click="confirmDep()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(2000);
    });
    it('删除部门', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element(by.css('[ng-click="del(checkedItems)"]')).click();
        element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);;//判断新建弹出层的标题是否存在
        })
    });
    it('刷新部门成功', () => { 
        element(by.css('[ng-click="refreshDep()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.modal')).get(0).isDisplayed()).toBe(false);;
        })
    });

});