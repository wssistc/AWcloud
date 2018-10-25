'use strict'
describe('测试', function() {
    it('数据盘快照删除测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-warning')).get(0).click();//点击删除
		expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('数据盘快照删除失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-warning')).get(0).click();//点击删除
		expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('数据盘快照删除成功测试', () => {
        browser.get("http://localhost:22555/#/cvm/snapshots");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-warning')).get(0).click();//点击删除
        element.all(by.css(".alert .btn-item .btn")).get(0).click();//点击弹出层的确定
		expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);//判断新建弹出层的标题是否存在
    });

});