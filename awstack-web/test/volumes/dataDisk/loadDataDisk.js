'use strict'
describe('测试', function() {
    it('数据盘加载云硬盘测试' , () => {	
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(0).click();//点击加载云硬盘
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//验证编辑弹出层是否存在
	});

	it('数据盘加载云硬盘失败测试' , () => {	
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(0).click();//点击加载云硬盘		
		element.all(by.css('.btn.btn-primary')).get(0).click().then(function() {//点击确认
			expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//验证编辑弹出层是否存在
		});
	});

	it('数据盘加载云硬盘成功测试' , () => {	
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(0).click();//点击加载云硬盘
		element.all(by.css('.ui-select-container .ui-select-match .btn')).get(0).click();//点击弹出层下拉框
		element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(0).click();//点击下拉框的第一条显示信息		
		element.all(by.css('.btn.btn-primary')).get(0).click().then(function() {//点击确认
			expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//验证编辑弹出层是否存在
		});
	});
});