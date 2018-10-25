'use strict'
describe('测试', function() {
    it('刷新缓存盘测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(2).click();//点击缓存盘
        element.all(by.css('.table .checkbox')).get(13).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-refresh')).get(2).click();//点击刷新
    });
    
});