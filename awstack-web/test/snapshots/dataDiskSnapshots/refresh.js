'use strict'
describe('测试', function() {
    it('数据盘快照刷新测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-refresh')).get(0).click();//点击刷新
    });

});