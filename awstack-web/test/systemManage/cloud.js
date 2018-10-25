'use strict'

describe('测试系统管理', function() {
    it('腾讯云设置', () => { 
        browser.get('http://localhost:22555/#/settings/cloud');
        $$('.choose-item .ui-select-container').click();
        element.all(by.css('.ui-select-choices-row')).get(0).click();
        element.all(by.model('selectedCloudCon[k]')).get(0).clear();
        element.all(by.model('selectedCloudCon[k]')).get(0).sendKeys('awstack');
        element.all(by.model('selectedCloudCon[k]')).get(1).clear();
        element.all(by.model('selectedCloudCon[k]')).get(1).sendKeys('openstack');
        element(by.css('.switch-btn .iconfont')).click();
        element(by.css('[ng-click="updateCloud()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(3000);
    });
    it('VMWARE设置', () => { 
        $$('.choose-item .ui-select-container').click();
        element.all(by.css('.ui-select-choices-row')).get(1).click();
        element.all(by.model('selectedCloudCon[k]')).get(0).clear();
        element.all(by.model('selectedCloudCon[k]')).get(0).sendKeys('http://gerrit.corp.awcloud.com/#/dashboard/self');
        element.all(by.model('selectedCloudCon[k]')).get(1).clear();
        element.all(by.model('selectedCloudCon[k]')).get(1).sendKeys('openstack');
        element.all(by.model('selectedCloudCon[k]')).get(2).clear();
        element.all(by.model('selectedCloudCon[k]')).get(2).sendKeys('awstack');
        element(by.css('.switch-btn .iconfont')).click();
        element(by.css('[ng-click="updateCloud()"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
    });
});