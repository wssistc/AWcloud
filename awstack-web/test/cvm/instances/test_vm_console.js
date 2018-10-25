'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试云主机', function() {
    it('云主机控制台', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '运行';
          });
        });;
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let vm_console = element.all(by.css('.table-action .btn')).get(3)
        vm_console.click()
        browser.pause();
    });
});
