'use strict'
describe('测试', function() {

    it('申请信息咨询测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");
        element.all(by.css('.ticket .data-list li .text .action')).get(0).click();//点击由此提问
        $('.ui-select-container.ui-select-multiple input.ui-select-search').click();//点击收件人的输入框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(22).click();//点击下拉框中的admin
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

    it('申请信息咨询失败测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");
        element.all(by.css('.ticket .data-list li .text .action')).get(0).click();//点击由此提问
        $('.ui-select-container.ui-select-multiple input.ui-select-search').click();//点击收件人的输入框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(22).click();//点击下拉框中的admin
        element.all(by.css('.form-controls')).get(0).sendKeys('自动化测试信息咨询测试不合法标题23333333333333333');//输入不合法的标题
        element.all(by.css('.form-controls')).get(1).sendKeys('自动化测试信息咨询测试描述');//输入描述
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

    it('申请信息咨询成功测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");
        element.all(by.css('.ticket .data-list li .text .action')).get(0).click();//点击由此提问
        $('.ui-select-container.ui-select-multiple input.ui-select-search').click();//点击收件人的输入框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(22).click();//点击下拉框中的admin
        element.all(by.css('.form-controls')).get(0).sendKeys('自动化测试信息咨询测试合法标题');//输入不合法的标题
        element.all(by.css('.form-controls')).get(1).sendKeys('自动化测试信息咨询测试描述');//输入描述
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断弹出层的标题是否存在
    });

});