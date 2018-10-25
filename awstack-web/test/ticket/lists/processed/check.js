'use strict'
describe('测试', function() {

    it('已处理查看测试', () => {
        browser.get("http://localhost:22555/#/ticket/lists");
        $('.nav-tabs li:last-child a').click();//点击已处理
        element.all(by.css('.table tbody tr td .btn')).get(0).click();//点击第一条数据的查看
		expect($('.workflowStatus .back').isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

});
