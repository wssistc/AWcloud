'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试云主机', function() {
    it('新建云主机', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        let new_vm = element.all(by.css('.table-action .btn')).get(0)
        new_vm.click()
        let name = element(by.model('name'))
        name.sendKeys('test-vm-1')
        let confirm = element(by.css('.modal-footer .btn-primary '))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
    });
});
