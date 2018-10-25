'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试镜像', function() {
    it('镜像-制作镜像', () => {
        browser.get('http://localhost:22555/#/cvm/makeimages');
        let add = element(by.css('[ng-click="newImage()"]'));
        add.click();
        let name = element(by.model('postParams.image_name'))
        name.sendKeys('test-image')
        let size = element(by.model('postParams.disk_size'))
        size.sendKeys('10');
        let confirm = element(by.css('[ng-click="createImage()"]'))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
    });
});
