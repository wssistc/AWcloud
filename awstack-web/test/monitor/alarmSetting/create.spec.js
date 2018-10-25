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

	it('新建告警', () => {
		browser.get('http://localhost:22555/#/monitor/alarmsetting');
		browser.sleep(2000);
		let oldRowsCount = 0;
		element.all(by.css('.table tbody tr[ng-repeat="item in $data"]')).then(rows => {
			oldRowsCount = rows.length;
		});
		createBtn.click().then(() => {
			let nameField = element(by.model("alarmForm.name"));
			let name = "e2etest-alrm001" + Math.ceil(Math.random() * 10);
			nameField.sendKeys(name);

			element(by.css('form[name="createAlarmForm"] div.ui-select-container[ng-model="alarmForm.labelList"] input[type="search"]')).click().then(() => {
				browser.sleep(1000);
				element.all(by.css('div.ui-select-container[ng-model="alarmForm.labelList"] .ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row')).then(res =>{
					if (res.length > 0) {
						element.all(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row")).first().click().then(()=>{
							nameField.click()
						});
					}
				});
			});
			element(by.css('form[name="createAlarmForm"] div.ui-select-container[ng-model="alarmForm.alarmtemps"] input[type="search"]')).click().then(() => {
				browser.sleep(2000);
				element.all(by.css('div.ui-select-container[ng-model="alarmForm.alarmtemps"] .ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row')).then(tmpl =>{
					if (tmpl.length > 0) {
						element.all(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row")).first().click().then(()=>{
							nameField.click()
						});
					}
				});
			});
			element(by.css('form[name="createAlarmForm"] div.ui-select-container[ng-model="alarmForm.contactlists"] input[type="search"]')).click().then(() => {
				browser.sleep(2000);
				element.all(by.css('div.ui-select-container[ng-model="alarmForm.contactlists"] .ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row')).then(contractGroup =>{
					if (contractGroup.length > 0) {
						element.all(by.css('div.ui-select-container[ng-model="alarmForm.contactlists"] .ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row')).first().click().then(()=>{
							nameField.click()
						});
					}
				});
			});
			element(by.css('.modal-footer .btn.btn-primary[ng-click="alarmConfirm(createAlarmForm,alarmForm)"]')).click();
			refreshBtn.click().then(() => {
				element.all(by.css('.table tbody tr[ng-repeat="item in $data"]')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount + 1);
				});
			});
		});
	});
	
});