'use strict'
describe('测试', function() {
    it('数据盘删除测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-warning')).get(0).click().then(function() {//点击删除
			expect(element.all(by.css('.delete-wrap .delete-alert.delete-show')).get(0).isPresent()).toBe(true);//验证弹出层是否存在                                                                                                                                                                                                                                                                                                                                                    弹出层是否存在
		});	
		// browser.pause();
	});
	
	it('数据盘删除失败测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-warning')).get(0).click();//点击导航中的删除
		expect(element.all(by.css('.delete-wrap .delete-alert.delete-show')).get(0).isPresent()).toBe(true);//验证弹出层是否存在
	});

	it('数据盘删除成功测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-warning')).get(0).click();//点击导航中的删除
		element.all(by.css('.alert .btn-item .btn')).get(0).click().then(function() {//点击弹出层的删除
			expect(element.all(by.css('.delete-wrap .delete-alert.delete-show')).get(1).isPresent()).toBe(false);//验证弹出层是否存在
		});    
	});
});