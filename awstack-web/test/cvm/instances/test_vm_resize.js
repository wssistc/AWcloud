'use strict'
var ResourceManageAction = require("../ResourceManageAction")
describe('测试云主机', function() {
    it('云主机调整配置', () => {
        browser.get('http://localhost:22555/#/cvm/instances');
        let select_active_vm = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '关机';
          });
        });
        select_active_vm.get(0).element(by.css('.checkbox')).click();
        let more_button =  element(by.css('.table-action .dropdown-toggle'))
        more_button.click()
        let resize_select =$$('.dropdown-menu li button[ng-click="osUpgrade(editData)"]')
        resize_select.click()
       
        let flavorModel =  element(by.model('upgrade.flavor'))
        flavorModel.click()
        let flavorList  =  element.all(by.binding('value.text')).get(0)
        flavorList.click()
        browser.sleep(3000)
        let confirm = element(by.css('[ng-click="confirm(upgradeForm)"]'))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
    });
});



