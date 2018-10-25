'use strict'
var ResourceManageAction = require("../ResourceManageAction")


describe('测试云主机', function() {
    it('删除云主机', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        
        let select_active_vm = element.all(by.repeater('item in $data'))
        select_active_vm.get(0).element(by.css('.checkbox')).click()
        let more_button =  element(by.css('.table-action .dropdown-toggle'))
        more_button.click()
        let delete_select =$$('.dropdown-menu li button').get(2)
        delete_select.click()
        let confirm = element(by.css('[ng-click="confirm()"]'))
        browser.sleep(3000)
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
