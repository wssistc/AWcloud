'use strict'

describe('告警模板', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let setRuleBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('设置规则', () => {
		browser.get('http://localhost:22555/#/monitor/alarmtemplate');
		browser.sleep(2000);
		let todoIndex = 0;
		chkboxs.get(todoIndex + 1).click();
		setRuleBtn.click().then(() => {
			element(by.css('.controls .rule.add a[ng-click="addThresholdRule($index)"]')).click();
			let thresholdField = element(by.css("div.rule.threshold input.form-controls.ng-empty"));
			let thresholdVal = Math.ceil(Math.random() * 100);
			thresholdField.sendKeys(thresholdVal);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="setTmplRuleConfirm()"]')).click();
			expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);

		})
	});

});