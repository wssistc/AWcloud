'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试镜像', function() {
    it('http上传镜像', () => {
        browser.get('http://localhost:22555/#/cvm/images');
        let new_image = element.all(by.css('.table-action .btn')).get(0)
        new_image.click()
        let name = element(by.model('upImage.name'))
        name.sendKeys('test-image-1')
        let copyAdrress = element(by.model('upImage.copy_from'))
        copyAdrress.sendKeys('http://192.168.254.252/Awstack/CentOS-7.0-x86_64_100G.qcow2')
        let os_type =  element(by.model('os_type'))
        os_type.click()
        let osList  =  element.all(by.binding('os_type.dataName_t')).get(1)
        osList.click()
        let size =  element(by.model('upImage.vol_size'))
        size.sendKeys('8')
        let confirm = element(by.css('.modal-footer .btn-primary '))
        confirm.click()
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false)
    });
});
