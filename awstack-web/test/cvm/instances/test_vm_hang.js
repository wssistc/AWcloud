'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试云主机', function() {
    it('挂起云主机', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '运行';
          });
        });;
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let more_button =  element(by.css('.table-action .dropdown-toggle'))
        more_button.click()
        let hang_select =$$('.dropdown-menu li button[ng-click="osHang(editData)"]')
        hang_select.click()
        let confirm = element(by.css('[ng-click="confirm()"]'))
        browser.sleep(3000)
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
