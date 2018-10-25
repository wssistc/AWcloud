'use strict'

describe('告警联系人组', function() {
	let actionBtnList = element.all(by.css(".page-inner .table-action .btn"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('删除联系人', () => {
		browser.get('http://localhost:22555/#/monitor/contractgroup');
		browser.sleep(2000);
		element.all(by.css('tr td[data-title="headers.contactGroup"] a')).then((elemList) => {
			elemList[0].click().then(() => {
				let deleteContactBtn = element(by.css('tbody tr[ng-repeat-end] td[data-title="headers.operate"] a[ng-click="deleteContact(contact)"]'));
				if (deleteContactBtn) {
					deleteContactBtn.click();
					element(by.css('.alert .btn-item .btn.btn-danger')).click();
					element(by.css('.alert .del-cont span')).getText().then(text => {
						expect(text).toEqual("");
					})
				}
			})
		})

	});

});