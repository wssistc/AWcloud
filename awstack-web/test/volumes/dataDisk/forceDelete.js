'use strict'
describe('测试', function() {
    it('数据盘强制删除云硬盘测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
		element.all(by.css('.dropdown-menu li button')).get(4).click();//点击强制删除
		expect(element.all(by.css('.delete-wrap .delete-alert.delete-show')).get(0).isPresent()).toBe(true);//验证弹出层是否存在 
	});	

	it('数据盘强制删除云硬盘失败测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
        element.all(by.css('.dropdown-menu li button')).get(4).click();//点击强制删除
        expect(element.all(by.css('.delete-wrap .delete-alert.delete-show')).get(0).isPresent()).toBe(true);//验证弹出层是否存在 
	});

	it('数据盘强制删除云硬盘成功测试' , () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条信息
		element.all(by.css('.btn.btn-info')).get(1).click();//点击更多操作
        element.all(by.css('.dropdown-menu li button')).get(4).click();//点击强制删除
        element.all(by.css('.alert .btn-item .btn')).get(0).click();//点击弹出层的确定
        expect(element.all(by.css('.delete-wrap .delete-alert.delete-show')).get(1).isPresent()).toBe(false);//验证弹出层是否存在
	});
});