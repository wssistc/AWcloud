'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试云主机', function() {
    it('启动云主机', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '关机';
          });
        });
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let boot_vm = element.all(by.css('.table-action .btn')).get(1)
        boot_vm.click()
        let confirm = element(by.css('.btn-item .btn-primary '))
        browser.sleep(3000)
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
