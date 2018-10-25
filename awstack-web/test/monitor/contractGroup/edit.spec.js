'use strict'

describe('告警联系人组', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('编辑联系人组', () => {
		browser.get('http://localhost:22555/#/monitor/contractgroup');
		browser.sleep(2000);
		let todoIndex = 0;
		chkboxs.get(todoIndex + 1).click();
		editBtn.click().then(() => {
			let nameField = element(by.model("contactGroupForm.name"));
			nameField.clear();
			let name = "e2etest-edit" + Math.ceil(Math.random() * 10);
			nameField.sendKeys(name);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="contactGroupConfirm(createContactGroupForm)"]')).click();
			refreshBtn.click().then(() => {
				element.all(by.css('tr td[data-title="headers.contactGroup"] a')).each((element, index) => {
					element.getText().then(text => {
						if (text.indexOf("e2etest-edit") > -1) {
							expect(text).toContain(name);
						}
					});
				})
			})
		});
	});

});