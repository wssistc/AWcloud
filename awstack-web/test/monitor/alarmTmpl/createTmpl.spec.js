'use strict'

describe('告警模板', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let setRuleBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('新建告警', () => {
		browser.get('http://localhost:22555/#/monitor/alarmtemplate');
		browser.sleep(2000);
		let oldRowsCount = 0;
		element.all(by.css('.table tbody tr[ng-repeat="item in $data"]')).then(rows => {
			oldRowsCount = rows.length;
		});
		createBtn.click().then(() => {
			let nameField = element(by.model("addAlarmTmplForm.name"));
			let name = "e2etest-alrmTmpl" + Math.ceil(Math.random() * 10);
			nameField.sendKeys(name);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="alarmTmplConfirm()"]')).click();
			refreshBtn.click().then(() => {
				element.all(by.css('.table tbody tr[ng-repeat="item in $data"]')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount + 1);
				});
			});
		});
	});

});