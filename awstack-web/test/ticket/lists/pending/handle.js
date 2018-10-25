'use strict'
describe('测试', function() {

    it('待处理处理测试', () => {
        browser.get("http://localhost:22555/#/ticket/lists");
        element.all(by.css('.table tbody tr td .btn')).get(0).click();//点击列表中第一条数据的处理
        $('textarea.form-controls').sendKeys('自动批注');//填写描述信息
		expect($('.modal .modal-dialog .modal-header h3').isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

    it('待处理处理失败测试', () => {
        browser.get("http://localhost:22555/#/ticket/lists");
        element.all(by.css('.table tbody tr td .btn')).get(0).click();//点击列表中第一条数据的处理
        $('textarea.form-controls').sendKeys('自动批注');//填写描述信息
		expect($('.modal .modal-dialog .modal-header h3').isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

    it('待处理处理成功测试', () => {
        browser.get("http://localhost:22555/#/ticket/lists");
        element.all(by.css('.table tbody tr td .btn')).get(0).click();//点击列表中第一条数据的处理
        $('textarea.form-controls').sendKeys('自动批注');//填写描述信息
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect($('.modal .modal-dialog .modal-header h3').isPresent()).toBe(false);//判断弹出层的标题是否存在
    });

});