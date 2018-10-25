'use strict'

describe('告警设置', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let copyBtn = actionBtnList.get(2);
	let disableBtn = actionBtnList.get(3);
	let enableBtn = actionBtnList.get(4);
	let deleteBtn = actionBtnList.get(5);
	let refreshBtn = actionBtnList.get(6);

	it('启用告警', () => {
		browser.get('http://localhost:22555/#/monitor/alarmsetting');
		browser.sleep(3000);
		let todoIndex = 0;
		function enableAlarmAction(todoIndex) {
			enableBtn.click().then(() => {
				element(by.css('.alert .btn-item .btn.btn-primary')).click();
				refreshBtn.click().then(() => {
					element.all(by.css('tbody tr td[data-title="\'aws.monitor.alarmModule.enabled\'|translate"]')).then(elemList => {
						elemList[todoIndex].getText().then(resText => {
							expect(resText).toEqual("是");
						})
					})
				});
			});
		};

		function factorial(todoIndex) {
			element.all(by.css('.table tbody tr[ng-repeat="item in $data"]')).then(rows => {
				if (todoIndex == rows.length) {
					return;
				}
				chkboxs.get(todoIndex + 1).click();
				enableBtn.isEnabled().then(isEnabled => {
					if (isEnabled) {
						enableAlarmAction(todoIndex);
					} else {
						chkboxs.get(todoIndex + 1).click();
						todoIndex++;
						factorial(todoIndex);
					}
				});
			});

		}
		factorial(todoIndex);

	});

});