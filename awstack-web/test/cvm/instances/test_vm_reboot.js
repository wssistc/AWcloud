'use strict'
//var LoginAction = require("../../LoginAction.js");
var ResourceManageAction = require("../ResourceManageAction")

// describe("自动登录",function(){
//     LoginAction();
// })

describe('测试云主机', function() {
    it('重启云主机', () => {
        ResourceManageAction()
        let select_instance_menu=element.all(by.css('.menu-li')).get(1)
        select_instance_menu.click(); 
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '运行';
          });
        });
        select_active_vm.get(0).element(by.css('.checkbox')).click()
        let more_button =  element(by.css('.table-action .dropdown-toggle'))
        more_button.click()
        //let li_select = element.all(by.css('.dropdown-menu li button')).get(0)
        let li_select = $$('.dropdown-menu li button').get(0)
        li_select.click()
        browser.sleep(3000)
        let confirm = element(by.css('[ng-click="confirm()"]'))
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
         
    });
});
