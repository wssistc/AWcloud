'use strict'
describe('测试', function() {

    it('定时快照编辑测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-primary')).get(2).click();//点击编辑任务
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('定时快照编辑失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-primary')).get(2).click();//点击编辑任务
        element.all(by.css('.input-group .form-control')).get(0).clear();//清空首次执行的输入框
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('定时快照编辑成功测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element.all(by.css('.table .checkbox')).get(1).click();//选中列表中的第一条数据
        element.all(by.css('.btn.btn-primary')).get(2).click();//点击编辑任务
        element.all(by.css('.ui-select-container .ui-select-match .ui-select-toggle .ui-select-match-text')).get(1).click();//点击执行快照频率
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(1).click();//选择下拉框的第二条数据
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
    });

});