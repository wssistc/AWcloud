'use strict'

describe('安全组', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="securityGroupTable"] .checkbox i,.table-content .table[ng-table="securityGroupTable"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it("编辑安全组名称", () => {
		browser.get('http://localhost:22555/#/cvm/security_groups');
		browser.sleep(2000);
		chkboxs.get(1).click();
		editBtn.click().then(() => {
			let editField = element(by.css('form[name="securityGroupModalForm"] input[ng-model="securityGroupForm.name"]'));
			let name = "e2etest-edit-sec001" + Math.ceil(Math.random() * 10);
			let editCfmBtn = element(by.css('.modal-footer .btn.btn-primary'));
			editField.clear();
			editField.sendKeys(name);
			editCfmBtn.click();
			refreshBtn.click().then(() => {
				element.all(by.css('tr td a ')).each((element, index) => {
					element.getText().then(text => {
						if (text.indexOf("e2etest-edit-sec001") > -1) {
							expect(text).toContain(name);
						}
					})
				})
			})
		})
	});
	
});