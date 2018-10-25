'use strict'
describe('测试', function() {

    it('申请信息咨询测试', () => {
        browser.get("http://localhost:22555/#/ticket/create");//进入工单申请
        $('.nav-tabs li:last-child a').click();//点击已申请
        element.all(by.css('.table tbody tr td .edit-name > a')).get(0).click();//点击第一条数据的查看
		expect($('.workflowStatus .boxw').isPresent()).toBe(true);//判断弹出层的标题是否存在
    });

});