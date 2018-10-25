'use strict'
describe('测试', function() {

    it('系统盘快照删除测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element(by.css('.nav-tabs li:last-child a')).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-refresh')).get(1).click();//点击刷新
    });

});