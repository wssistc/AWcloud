'use strict'

describe('告警联系人组', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('删除联系人组', () => {
		browser.get('http://localhost:22555/#/monitor/contractgroup');
		browser.sleep(2000);
		let todoIndex = 0;
		let oldRowsCount = 0;
		element.all(by.css('.table tbody tr[ng-repeat-start="item in $data"]')).then(rows => {
			oldRowsCount = rows.length;
		});
		chkboxs.get(todoIndex + 1).click();
		deleteBtn.click().then(() => {
			element(by.css('.alert .btn-item .btn.btn-danger')).click();
			refreshBtn.click().then(() => {
				element.all(by.css('.table tbody tr[ng-repeat-start="item in $data"]')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount - 1);
				});
			});
		});
	});

});