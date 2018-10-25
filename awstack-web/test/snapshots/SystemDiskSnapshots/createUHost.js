'use strict'
describe('测试', function() {
    it('系统盘快照新建云主机测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element(by.css('.nav-tabs li:last-child a')).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-primary')).get(1).click();//点击新建云主机
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('系统盘快照新建云主机失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element(by.css('.nav-tabs li:last-child a')).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-primary')).get(1).click();//点击新建云主机
        element.all(by.css('.form-controls')).get(0).sendKeys("错误名称==");//输入不合法的名称
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('系统盘快照新建云主机失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element(by.css('.nav-tabs li:last-child a')).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-primary')).get(1).click();//点击新建云主机
        element.all(by.css('.form-controls')).get(0).sendKeys("正确名称");//输入合法的名称
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
    });

});