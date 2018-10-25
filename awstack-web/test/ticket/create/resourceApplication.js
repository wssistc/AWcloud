'use strict'
describe('测试', function() {

    it('申请资源申请测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");
        element.all(by.css('.ticket .data-list li .text .action')).get(1).click();//点击由此提问
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

    it('申请资源申请失败测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");
        element.all(by.css('.ticket .data-list li .text .action')).get(1).click();//点击由此提问
        element.all(by.css('.ui-select-container .ui-select-match .ui-select-toggle .ui-select-match-text')).get(1).click();//点击选择项目输入框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(5).click();//点击下拉框中的admin
        element.all(by.css('.form-controls')).get(0).sendKeys(1);//输入云主机数量
        element.all(by.css('.form-controls')).get(1).sendKeys(1);//输入CPU核数量
        element.all(by.css('.form-controls')).get(2).sendKeys(100);//输入内存大小
        element.all(by.css('.form-controls')).get(3).sendKeys(1);//输入云主机数量
        element.all(by.css('.form-controls')).get(4).sendKeys(1);//输入公网IP数量
        element.all(by.css('.form-controls')).get(5).sendKeys(1);//输入快照数量
        element.all(by.css('.form-controls')).get(6).sendKeys(1);//输入路由数量
        element.all(by.css('.form-controls')).get(7).sendKeys(1);//输入网络数量
        element.all(by.css('.form-controls')).get(8).sendKeys(1);//输入子网数量
        element.all(by.css('.form-controls')).get(9).sendKeys('==');//输入不合法的虚拟机组成员个数
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

    it('申请资源申请成功测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");
        element.all(by.css('.ticket .data-list li .text .action')).get(1).click();//点击由此提问
        element.all(by.css('.ui-select-container .ui-select-match .ui-select-toggle .ui-select-match-text')).get(1).click();//点击选择项目输入框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(5).click();//点击下拉框中的admin
        element.all(by.css('.form-controls')).get(0).sendKeys(1);//输入云主机数量
        element.all(by.css('.form-controls')).get(1).sendKeys(1);//输入CPU核数量
        element.all(by.css('.form-controls')).get(2).sendKeys(100);//输入内存大小
        element.all(by.css('.form-controls')).get(3).sendKeys(1);//输入云主机数量
        element.all(by.css('.form-controls')).get(4).sendKeys(1);//输入公网IP数量
        element.all(by.css('.form-controls')).get(5).sendKeys(1);//输入快照数量
        element.all(by.css('.form-controls')).get(6).sendKeys(1);//输入路由数量
        element.all(by.css('.form-controls')).get(7).sendKeys(1);//输入网络数量
        element.all(by.css('.form-controls')).get(8).sendKeys(1);//输入子网数量
        element.all(by.css('.form-controls')).get(9).sendKeys(1);//输入虚拟机组成员个数
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断弹出层的标题是否存在
    });
});