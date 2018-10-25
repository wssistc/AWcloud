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

	it('复制告警', () => {
		browser.get('http://localhost:22555/#/monitor/alarmsetting');
		browser.sleep(2000);
		let todoIndex = 0;
		chkboxs.get(todoIndex + 1).click();
		copyBtn.click().then(() => {
			let nameField = element(by.model("alarmForm.name"));
			let name = "e2etest-copy-alrm" + Math.ceil(Math.random() * 10);
			nameField.sendKeys(name);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="alarmConfirm(createAlarmForm,alarmForm)"]')).click();
			refreshBtn.click().then(() => {
				browser.sleep(3000);
				element.all(by.css('tr td div.edit-name span ')).each((element, index) => {
					element.getText().then(text => {
						if (text.indexOf("e2etest-copy-alrm") > -1) {
							expect(text).toContain(name);
						}
					})
				})
			})
		});
	});

});