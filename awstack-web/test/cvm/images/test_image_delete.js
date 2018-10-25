'use strict'
var ResourceManageAction = require("../ResourceManageAction")


describe('测试镜像', function() {
    it('删除镜像', () => {
        browser.get('http://localhost:22555/#/cvm/images');
        let select_active_image = element.all(by.repeater('item in $data'))
        select_active_image.get(0).element(by.css('.checkbox')).click()
        let delete_image = element.all(by.css('.table-action .btn')).get(3)
        delete_image.click()
        let confirm = element(by.css('[ng-click="confirm()"]'))
        browser.sleep(3000)
        confirm.click().then(function() {
            expect(element(by.css('.delete-show')).isDisplayed()).toBe(false);
        });
    });
});
