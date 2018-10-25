'use strict'
describe('测试', function() {
    it('数据盘扩容测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(3).click();//点击扩容
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);	//验证弹出层是否存在
	});

	it('数据盘扩容成功测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(3).click();//点击扩容
		element.all(by.css('.form-controls')).get(0).clear();//清空 扩容后大小（GB）input框信息
		element.all(by.css('.form-controls')).get(0).sendKeys(10);//向扩容后大小（GB）input框输入10
		element.all(by.css('.btn.btn-primary')).get(0).click();//点击确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);	//验证弹出层是否存在
	});

	it('数据盘扩容失败测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(3).click();//点击扩容
		element.all(by.css('.form-controls')).get(0).clear();//清空 扩容后大小（GB）input框信息
		element.all(by.css('.form-controls')).get(0).sendKeys("_10");//向扩容后大小（GB）input框输入非法字符
		element.all(by.css('.btn.btn-primary')).get(0).click();//点击确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);	//验证弹出层是否存在
	});
});