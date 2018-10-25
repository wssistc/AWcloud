'use strict'

describe('告警联系人组', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('新建联系人组', () => {
		browser.get('http://localhost:22555/#/monitor/contractgroup');
		browser.sleep(2000);
		let oldRowsCount = 0;
		element.all(by.css('.table tbody tr[ng-repeat-start="item in $data"]')).then(rows => {
			oldRowsCount = rows.length;
		});
		createBtn.click().then(() => {
			let nameField = element(by.model("contactGroupForm.name"));
			let emailField = element(by.model("contact.email"));
			let phoneFiled = element(by.model("contact.phone"));
			nameField.sendKeys("e2etest-contractGroup" + Math.ceil(Math.random() * 10));
			emailField.sendKeys("example@qq.com");
			phoneFiled.sendKeys("15896176523");
			element(by.css('.modal-footer .btn.btn-primary[ng-click="contactGroupConfirm(createContactGroupForm)"]')).click();
			refreshBtn.click().then(() => {
				element.all(by.css('.table tbody tr[ng-repeat-start="item in $data"]')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount + 1);
				});
			});
		});
	});

});