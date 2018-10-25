'use strict'
describe('测试', function() {
   	it('数据盘编辑测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.icon-aw-modify')).get(0).click();//点击编辑
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);
	});

	it('数据盘编辑成功测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.icon-aw-modify')).get(0).click();//点击编辑
		var input = element.all(by.css('input[type="text"]')).get(0);
		input.clear();
		input.sendKeys('编辑完成');//添加编辑信息
		element.all(by.css('.btn.btn-primary')).get(0).click().then(function() {
			expect(element.all(by.css('.table tbody tr td .edit-name > a')).get(0).getText()).toEqual('编辑完成');//验证编辑信息是否成功
		});
	});

	it('数据盘编辑失败测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.icon-aw-modify')).get(0).click();//点击编辑
		var input = element.all(by.css('input[type="text"]')).get(0);
		input.clear();//清空云硬盘名
		element.all(by.css('.btn.btn-primary')).get(0).click().then(function() {
			expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//验证编辑弹出层是否存在
		});
	});
});