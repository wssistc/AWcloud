'use strict'
describe('测试系统管理', function() {
    it('新建用户', () => {
        browser.get('http://localhost:22555/#/permit/role');
        element.all(by.css('.table-action .btn ')).get(0).click();
        element(by.model('role_form.name')).sendKeys("lowbbb")
        element(by.model('role_form.description')).sendKeys("为用户新建权限");
        element(by.css('.controls .ui-select-container')).click();
        element.all(by.css('.controls .ui-select-choices-row')).get(0).click();
        element.all(by.css('.ivh-treeview .icon-aw-square')).get(0).click();
        element.all(by.css('.ivh-treeview .icon-aw-square')).get(1).click();
        element(by.css('[ng-click="createRole(newRoleForm)"]')).click().then(function(){//点击确定
            expect(element(by.css('.text-center')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.get('http://localhost:22555/#/permit/user');  
        let addUserButton=element.all(by.css('.table-action button')).get(0);
        addUserButton.click();
        let loginName=element(by.model('userForm.name'));
        let password=element(by.model('userForm.password'));
        let cfmPassword=element(by.model('userForm.cfmPassword'));
        let phone=element(by.model('userForm.phone'));
        let email=element(by.model('userForm.email'));
        let org=element(by.css('.ui-select-container'));
        org.click();
        loginName.sendKeys('lowbee');
        password.sendKeys('Awcloud!23');
        cfmPassword.sendKeys('Awcloud!23');
        phone.sendKeys('13198999793');
        email.sendKeys('976331319@qq.com');
        let orgSelected=element.all(by.css('.ui-select-choices-row')).get(0);
        orgSelected.click();
        let confirmButton=element(by.css('[ng-click="userConfirm(userForm,createUserForm)"]'));
        confirmButton.click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);
        })
        browser.sleep(1000);
    });
    it('编辑用户',()=>{
        let select=$('table tbody>tr:first-child>td:first-child');
        select.click();
        let editUserButton=element.all(by.css('.table-action button')).get(1);
        editUserButton.click();
        let org=element(by.css('.ui-select-container'));
        org.click();
        let orgSelectedEdit=element.all(by.css('.ui-select-choices-row')).get(2);
        orgSelectedEdit.click();
        let confirmButton=element(by.css('[ng-click="userConfirm(userForm,createUserForm)"]'));
        confirmButton.click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-footer')).isPresent()).toBe(false);
        })
        browser.sleep(1000);
    })
    // it('分配权限成功', () => { 
    //     browser.get('http://localhost:22555/#/permit/role');
    //     element.all(by.css('.table-action .btn ')).get(0).click();
    //     element(by.model('role_form.name')).sendKeys("lowaaa")
    //     element(by.model('role_form.description')).sendKeys("为分配新建权限");
    //     element(by.css('.controls .ui-select-container')).click();
    //     element.all(by.css('.controls .ui-select-choices-row')).get(0).click();
    //     element.all(by.css('.ivh-treeview .icon-aw-square')).get(0).click();
    //     element.all(by.css('.ivh-treeview .icon-aw-square')).get(1).click();
    //     element(by.css('[ng-click="createRole(newRoleForm)"]')).click().then(function(){//点击确定
    //         expect(element(by.css('.text-center')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
    //     })
    //     browser.get('http://localhost:22555/#/permit/user'); 
    //     element.all(by.css('.checkbox .iconfont')).get(1).click();
    //     element.all(by.css('.table-action .btn')).get(1).click();
    //     element.all(by.css('.table-responsive .iconfont')).get(0).click();
    //     element(by.css('.btnGroup .selectBtn')).click();
    //     element(by.buttonText('确定')).click().then(function(){//点击确定
    //         expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
    //     })
    //     browser.sleep(1000);
    // });
    it('分配组织', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element.all(by.css('.table-action .btn')).get(5).click();
        element(by.css('.ui-select-container')).click();
        element.all(by.css('.ui-select-container .ui-select-choices-row')).get(0).click();
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(1000);
    }) 
    it('重置密码', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element.all(by.css('.table-action .btn')).get(4).click();
        element(by.model('userForm.password')).sendKeys('Awcloud!23');
        element(by.model('userForm.cfmPassword')).sendKeys('aaaaaa');
        element(by.model('userForm.cfmPassword')).clear();
        element(by.model('userForm.cfmPassword')).sendKeys('Awcloud!23');
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(1000);
    })
    it('删除用户成功', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element.all(by.css('.table-action .btn')).get(2).click();
        element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);;
        })
    });
    it('刷新用户成功', () => { 
        element(by.css('[ng-click="refreshUser()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);;
        })
    });
    it('用户激活、锁定成功', () => { 
        element.all(by.css('[ng-click="operateUser(user)"]')).get(0).click();
        element.all(by.css('[ng-click="operateUser(user)"]')).get(0).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);;
        })
    });
});