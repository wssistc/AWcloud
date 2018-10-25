'use strict'
describe('测试', function() {

    it('待处理查看测试', () => {
        browser.get("http://localhost:22555/#/ticket/lists");
        element.all(by.css('.table tbody tr td .btn')).get(1).click();
		expect($('.workflowStatus .boxw').isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

});