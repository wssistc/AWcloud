'use strict'

describe('告警联系人组', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('编辑联系人', () => {
		browser.get('http://localhost:22555/#/monitor/contractgroup');
		browser.sleep(2000);
		element.all(by.css('tr td[data-title="headers.contactGroup"] a')).then(elemList => {
			elemList[0].click().then(() => {
				element(by.css('tbody tr[ng-repeat-end] td[data-title="headers.operate"] a[ng-click="editContact(contact)"]')).click();
				let phoneFiled = element(by.model("editContactForm.phone"));
				phoneFiled.clear();
				phoneFiled.sendKeys("15896176523");
				element(by.css('.modal-footer .btn.btn-primary[ng-click="contactConfirm(contactForm)"]')).click();

			})
		})

		refreshBtn.click().then(() => {
			element.all(by.css('tr td[data-title="headers.contactGroup"] a')).then(elemList => {
				elemList[0].click().then(() => {
					element(by.css('tbody tr[ng-repeat-end] td[data-title="headers.phone"]')).getText().then(text => {
						expect(text).toEqual("15896176523");
					});
				})
			})
		})
	});

});