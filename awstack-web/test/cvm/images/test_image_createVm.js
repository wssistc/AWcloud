'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试镜像', function() {
    it('新建云主机', () => {
        browser.get('http://localhost:22555/#/cvm/images');
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '正常';
          });
        });;
         select_active_vm.get(0).element(by.css('.checkbox')).click();
        let new_vm = element.all(by.css('.table-action .btn')).get(1)
        new_vm.click()
        let name = element(by.model('hostName'))
        name.sendKeys('test-vm-1')
        let confirm = element(by.css('.modal-footer .btn-primary '))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
    });
});
