'use strict'
describe('测试', function() {
    it('数据盘创建快照测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(2).click();//点击创建快照
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);	//验证弹出层是否存在	
	});

	it('数据盘创建成功测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(2).click();//点击创建快照
		element.all(by.css('.form-controls')).get(0).sendKeys('createSnapshootText');//输入快照名称
		element.all(by.css('.form-controls')).get(1).sendKeys('创建快照测试');//输入描述
		element.all(by.css('.btn.btn-primary')).get(0).click();//点击确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);	//验证弹出层是否存在
	});

	it('数据盘创建失败测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(2).click();//点击创建快照
		element.all(by.css('.form-controls')).get(0).sendKeys('_createSnapshootText');//输入不合法快照名称
		element.all(by.css('.form-controls')).get(1).sendKeys('创建快照测试');//输入描述
		element.all(by.css('.btn.btn-primary')).get(0).click();//点击确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);	//验证弹出层是否存在
	});
});