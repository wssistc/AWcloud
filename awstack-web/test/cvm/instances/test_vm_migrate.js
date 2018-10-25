'use strict'
var ResourceManageAction = require("../ResourceManageAction")
describe('测试云主机', function() {
    it('云主机热迁移', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '运行';
          });
        });
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let more_button =  element(by.css('.table-action .dropdown-toggle'))
        more_button.click()
        let migrate_select =$$('.dropdown-menu li button[ng-click="osMigrate(editData)"]')
        migrate_select.click()
        let confirm = element(by.css('[ng-click="confirm(migrate,osmigrateForm)"]'))
        browser.sleep(3000)
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
    });
});



