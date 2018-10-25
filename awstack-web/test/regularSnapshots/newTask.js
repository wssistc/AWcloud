'use strict'
describe('测试', function() {

    it('定时快照新建测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element.all(by.css('.btn.btn-primary')).get(1).click();//点击新建任务
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('定时快照新建失败测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element.all(by.css('.btn.btn-primary')).get(1).click();//点击新建任务
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
    });

    it('定时快照新建测试', () => {
        browser.get("http://localhost:22555/#/cvm/regularSnap");
        element.all(by.css('.btn.btn-primary')).get(1).click();//点击新建任务
        element.all(by.css('.ui-select-container .ui-select-match .ui-select-toggle .ui-select-match-text')).get(0).click();//点击云主机名称下拉框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(3).click();//点击下拉框的第四条数据   第四个云主机上加载有云硬盘
        element.all(by.css('.ui-select-container.ui-select-multiple input.ui-select-search')).get(0).click();//点击云主机系统盘下拉框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(0).click();//点击下拉框中的第一条数据
        element.all(by.css('.ui-select-container.ui-select-multiple input.ui-select-search')).get(1).click();//点击与主机数据盘下拉框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(0).click();//点击下拉框中的第一条数据
        element.all(by.css('.ui-select-container .ui-select-match .ui-select-toggle .ui-select-match-text')).get(1).click();//点击执行快照频率下拉框
        element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(0).click();//点击下拉框中的第一条数据
        element(by.css('.input-group .form-control')).click();//点击首次执行时间的输入框
        element.all(by.css('.datetimepicker .table-condensed tbody tr .day')).get(41).click();//点击日历中的最后一天
        element.all(by.css('.datetimepicker .datetimepicker-hours span')).get(2).click();//点击时间中的0:00
        element.all(by.css('.datetimepicker .datetimepicker-minutes span')).get(2).click();//点击时间中的0:00
        element.all(by.css('.btn.btn-primary')).get(0).click();//点击弹出层的确定
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
    });

});