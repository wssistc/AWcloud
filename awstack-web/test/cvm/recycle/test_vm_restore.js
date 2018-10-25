'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试回收站', function() {
    it('恢复云主机', () => {
        browser.get('http://localhost:22555/#/cvm/recycle');
        
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '软删除';
          });
        });
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let restore_vm = element.all(by.css('.table-action .btn')).get(1)
        restore_vm.click()
        browser.sleep(8000)
        let confirm = element(by.css('.btn-item .btn-primary '))
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
