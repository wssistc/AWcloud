'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试镜像', function() {
    it('编辑镜像', () => {
            browser.get('http://localhost:22555/#/cvm/makeimages');
        let select_active_image = element.all(by.repeater('iso in $data')).filter(function(item) {
          return item.element(by.binding('iso.osStatus')).getText().then(function(label) {
                return label != '创建中';
          });
        });
        select_active_image.get(0).element(by.css('.checkbox')).click();
        let del = element(by.css('[ng-click="delImage(editData)"]'))
        del.click()
        let confirm =element(by.css('[ng-click="confirm()"]'))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
    });
});
