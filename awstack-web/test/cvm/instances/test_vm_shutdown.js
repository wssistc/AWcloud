'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试云主机', function() {
    it('启动云主机', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '运行';
          });
        });;
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let shutdown_vm = element.all(by.css('.table-action .btn')).get(2)
        shutdown_vm.click()
        browser.sleep(3000)
        let confirm = element(by.css('.btn-item .btn-warning '))
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
