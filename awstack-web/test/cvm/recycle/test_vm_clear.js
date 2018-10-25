'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试回收站', function() {
    it('清除云主机', () => {
        browser.get('http://localhost:22555/#/cvm/recycle');
        
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '软删除';
          });
        });
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let clear_vm = element.all(by.css('.table-action .btn')).get(0)
        clear_vm.click()
        let confirm = element(by.css('.btn-item .btn-danger '))
        browser.sleep(3000)
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
