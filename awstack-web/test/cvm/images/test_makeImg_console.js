'use strict'
var ResourceManageAction = require("../ResourceManageAction")

describe('测试镜像', function() {
    it('制作镜像—控制台', () => {
        browser.get('http://localhost:22555/#/cvm/makeimages');
        let select_active_image = element.all(by.repeater('iso in $data')).filter(function(item) {
          return item.element(by.binding('iso.osStatus')).getText().then(function(label) {
                return label == '创建成功';
          });
        });
        select_active_image.get(0).element(by.css('.checkbox')).click();
        let consoleClick = element(by.css('[ng-click="openConsole(editData,vmstatus)"]'))
        consoleClick.click()
        
    });
});
