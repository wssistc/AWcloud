'use strict'
describe('测试', function() {
    it('删除缓存盘测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(2).click();//点击缓存盘
        element.all(by.css('.table .checkbox')).get(13).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-warning')).get(1).click();//点击删除
		expect(element.all(by.css('.alert.alert-danger')).get(0).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('删除缓存盘失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(2).click();//点击缓存盘
        element.all(by.css('.table .checkbox')).get(13).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-warning')).get(1).click();//点击删除
		expect(element.all(by.css('.alert.alert-danger')).get(0).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });
    
    it('删除缓存盘成功测试', () => {
        browser.get("http://localhost:22555/#/cvm/volumes");
        element.all(by.css('.nav-tabs li a')).get(2).click();//点击缓存盘
        element.all(by.css('.table .checkbox')).get(13).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-warning')).get(1).click();//点击删除
        element.all(by.css('.alert .btn-item .btn')).get(0).click()//点击弹出层的确定
        browser.sleep(3000)        
		expect(element.all(by.css('.delete-wrap .delete-alert .alert')).get(0).isDisplayed()).toBe(false);//判断新建弹出层的标题是否存在
    });
    
});