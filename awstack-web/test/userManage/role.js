'use strict'

describe('测试权限管理', function() {
        it('新建权限', () => { 
            browser.get('http://localhost:22555/#/permit/role');
            element.all(by.css('.table-action .btn ')).get(0).click();
            element(by.model('role_form.name')).sendKeys("aaaa")
            element(by.model('role_form.description')).sendKeys("新建权限测试");
            element(by.css('.controls .ui-select-container')).click();
            element.all(by.css('.controls .ui-select-choices-row')).get(0).click();
            element.all(by.css('.ivh-treeview .icon-aw-square')).get(0).click();
            element.all(by.css('.ivh-treeview .icon-aw-square')).get(1).click();
            element(by.css('[ng-click="createRole(newRoleForm)"]')).click().then(function(){//点击确定
                expect(element(by.css('.text-center')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
            })
            browser.sleep(1000)
        });

        it('权限编辑', () => { 
            $$('.checkbox .iconfont').then(function(arr){
                element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
            })
            element.all(by.css('.table-action .btn ')).get(1).click();
            element(by.model('role_form.description')).clear();
            element(by.model('role_form.description')).sendKeys("编辑权限测试");
            element.all(by.css('.ivh-treeview .ascii-box span')).get(0).click();
            element(by.css('[ng-click="createRole(newRoleForm)"]')).click().then(function(){//点击确定
                expect(element(by.css('.text-center')).isPresent()).toBe(false);//判断编辑窗口尾部是否存在。
            })
            browser.sleep(1000)
        });
        it('权限删除', () => { 
            element(by.css('aside .icon-aw-user')).click();
            element.all(by.css('.top-menu .menu-li')).get(1).click();
            $$('.checkbox .iconfont').then(function(arr){
                element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
            })
            element.all(by.css('.table-action .btn ')).get(2).click();
            element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
                 expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);//判断新建弹出层的删除按钮
            })
        });
        it('刷新权限成功', () => { 
            element(by.css('[ng-click="refreshRole()"]')).click().then(function(){//点击确定
                expect(element.all(by.css('.modal')).get(0).isDisplayed()).toBe(false);;
            })
        });
    });