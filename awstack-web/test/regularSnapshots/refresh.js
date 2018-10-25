'use strict'
describe('测试', function() {

    it('定时快照刷新测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element(by.css('.btn.btn-refresh')).click();//点击刷新
    });

});