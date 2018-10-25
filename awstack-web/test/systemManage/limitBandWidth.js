'use strict'
describe('测试系统管理', function() {
    it('带宽限速', () => { 
        browser.get('http://localhost:22555/#/system/bandlimit');
        //操作按钮
        //element(by.css('.switch-btn .iconfont')).click();
        //调整带宽
        let limitText=element(by.model('limitType.fixType.networkBandwidth'));
        limitText.clear();
        limitText.sendKeys('6');
        //点击保存
        element(by.css('[ng-click="updateLimit(LimitForm)"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal-dialog .modal-footer')).isPresent()).toBe(false);
        })
        browser.sleep(1000);
    });
});