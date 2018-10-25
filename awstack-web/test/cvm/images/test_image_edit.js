'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试镜像', function() {
    it('编辑镜像', () => {
        browser.get('http://localhost:22555/#/cvm/images');
        let select_active_image = element.all(by.repeater('item in $data')).filter(function(item) {
          return item.element(by.binding('item.status')).getText().then(function(label) {
                return label === '正常';
          });
        });;
        select_active_image.get(0).element(by.css('.checkbox')).click();
        let new_vm = element.all(by.css('.table-action .btn')).get(2)
        new_vm.click()
        let name = element(by.model('upImage.name'))
        name.clear()
        name.sendKeys('test-image-edit')
        let size = element(by.model('upImage.vol_size'))
        size.clear()
        size.sendKeys('9')
        let confirm = element(by.css('.modal-footer .btn-primary '))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
    });
});
