'use strict'
describe('测试', function() {
    it('编辑系统盘测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(1).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(12).click();//选中列表中的第一条数据
        element.all(by.css('.table-action > .btn i')).get(4).click();//点击编辑
		expect(element(by.css('.modal .modal-dialog .modal-common')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });
    
    it('编辑系统盘失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(1).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(12).click();//选中列表中的第一条数据
        element.all(by.css('.table-action > .btn i')).get(4).click();//点击编辑
        element.all(by.css('.form-controls')).get(0).clear();//清空云硬盘名称
        element.all(by.css('.form-controls')).get(0).sendKeys("错误名称==");//输入云硬盘名称
        element.all(by.css('.form-controls')).get(1).clear();
        element.all(by.css('.form-controls')).get(1).sendKeys("编辑系统盘失败测试描述");
        element.all(by.css('.btn.btn-primary')).get(0).click();
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });
    
    it('编辑系统盘成功测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(1).click();//点击系统盘
        element.all(by.css('.table .checkbox')).get(12).click();//选中列表中的第一条数据
        element.all(by.css('.table-action > .btn i')).get(4).click();//点击编辑
        element.all(by.css('.form-controls')).get(0).clear();//清空云硬盘名称
        element.all(by.css('.form-controls')).get(0).sendKeys("正确名称");//输入云硬盘名称
        element.all(by.css('.form-controls')).get(1).clear();
        element.all(by.css('.form-controls')).get(1).sendKeys("编辑系统盘成功描述");
        element.all(by.css('.btn.btn-primary')).get(0).click();
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
	});
});