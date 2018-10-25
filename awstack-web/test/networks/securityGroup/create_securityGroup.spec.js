'use strict'

describe('安全组', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="securityGroupTable"] .checkbox i,.table-content .table[ng-table="securityGroupTable"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('新建安全组', () => {
		browser.get('http://localhost:22555/#/cvm/security_groups');
		browser.sleep(2000);
		let oldRowsCount = 0;
		element.all(by.repeater('firewall in $data')).then(rows => {
			oldRowsCount = rows.length;
		});
		createBtn.click().then(() => {
			let nameField = element(by.model('securityGroupForm.name'));
			let name = "e2etest-securityGroup001" + Math.ceil(Math.random() * 10);
			nameField.sendKeys(name);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="securityGroupConfirm()"]')).click();
			refreshBtn.click().then(() => {
				//判断创建成功
				element.all(by.repeater('firewall in $data')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount + 1);
				});
			})
		});
	});

	// it("编辑安全组名称", () => {
	// 	browser.get('http://localhost:22555/#/cvm/security_groups');
	// 	browser.sleep(2000);
	// 	chkboxs.get(1).click();
	// 	editBtn.click().then(() => {
	// 		let editField = element(by.css('form[name="securityGroupModalForm"] input[ng-model="securityGroupForm.name"]'));
	// 		let name = "e2etest-edit-sec001" + Math.ceil(Math.random() * 10);
	// 		let editCfmBtn = element(by.css('.modal-footer .btn.btn-primary'));
	// 		editField.clear();
	// 		editField.sendKeys(name);
	// 		editCfmBtn.click();
	// 		refreshBtn.click().then(() => {
	// 			element.all(by.css('tr td a ')).each((element, index) => {
	// 				element.getText().then(text => {
	// 					if (text.indexOf("e2etest-edit-sec001") > -1) {
	// 						expect(text).toContain(name);
	// 					}
	// 				})
	// 			})
	// 		})
	// 	})
	// });
	
	// it("删除安全组", () => {
	// 	browser.get('http://localhost:22555/#/cvm/security_groups');
	// 	browser.sleep(2000);
	// 	let oldRowsCount = 0;
	// 	element.all(by.repeater('firewall in $data')).then(rows => {
	// 		oldRowsCount = rows.length;
	// 	});
		
	// 	let todoIndex = 0;
	// 	chkboxs.get(todoIndex + 1).click();
	// 	deleteBtn.click();
	// 	let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
	// 	delModalCfmBtn.click();
	// 	refreshBtn.click().then(() => {
	// 		element.all(by.repeater('firewall in $data')).then(newRows => {
	// 			expect(newRows.length).toEqual(oldRowsCount - 1);
	// 		})
	// 	});
	// });

	// it('新建安全组规则', () => {
	// 	browser.get('http://localhost:22555/#/cvm/security_groups');
	// 	browser.sleep(2000);
	// 	element.all(by.css('tbody tr td[data-title="headers.firewallName"] a')).get(0).click().then(()=>{
	// 		let oldRowsCount = 0;
	// 		element.all(by.repeater('firewallDetail in $data |filter:firewallDetailSearchTerm')).then(rows => {
	// 			oldRowsCount = rows.length;
	// 		});

	// 		let createRuleBtn = element(by.css('.detailInner .tab-content .table-action .btn[ng-click="addSecurityGroupRule()"]'));
	// 		createRuleBtn.click().then(()=>{
	// 			let portField = element(by.model('securityGroupRule.port'));
	// 			let portVal = Math.ceil(Math.random() * 65535);
	// 			portField.sendKeys(portVal);
	// 			let modalCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="securityGroupRuleConfirm(securityGroupRule)"]'));
	// 			modalCfmBtn.click();
	// 			let detailRefreshBtn = element(by.css('.detailInner .tab-content .table-action .btn[ng-click="refreshSecurityGroupDetail()"]'));
	// 			detailRefreshBtn.click().then(() => {
	// 				element.all(by.repeater('firewallDetail in $data |filter:firewallDetailSearchTerm')).then(newRows => {
	// 					expect(newRows.length).toEqual(oldRowsCount + 1);
	// 				});
	// 				element(by.css(".detailInner .tab-content .detail-title a.an-close")).click();
	// 			})
	// 		})
	// 	})
	// });

	// it('删除安全组规则', () => {
	// 	browser.get('http://localhost:22555/#/cvm/security_groups');
	// 	browser.sleep(2000);
	// 	element.all(by.css('tbody tr td[data-title="headers.firewallName"] a')).get(0).click().then(()=>{
	// 		let oldRowsCount = 0;
	// 		element.all(by.repeater('firewallDetail in $data |filter:firewallDetailSearchTerm')).then(rows => {
	// 			oldRowsCount = rows.length;
	// 		});
	// 		let todoIndex = 0;
	// 		let detailChkboxs = element.all(by.css('.detail-info .table[ng-table="tableParams"] .checkbox i,.detail-info .table[ng-table="tableParams"] .checkbox .iconfont'));
	// 		detailChkboxs.get(todoIndex + 1).click();
	// 		let deleteRuleBtn = element(by.css('.detailInner .tab-content .table-action .btn[ng-click="deleteSecurityGroupRule(checkedItems)"]'));
			
	// 		deleteRuleBtn.click().then(()=>{
	// 			let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
	// 			delModalCfmBtn.click();
	// 			let detailRefreshBtn = element(by.css('.detailInner .tab-content .table-action .btn[ng-click="refreshSecurityGroupDetail()"]'));
	// 			detailRefreshBtn.click().then(() => {
	// 				element.all(by.repeater('firewallDetail in $data |filter:firewallDetailSearchTerm')).then(newRows => {
	// 					expect(newRows.length).toEqual(oldRowsCount - 1);
	// 				});
	// 			});
	// 			element(by.css(".detailInner .tab-content .detail-title a.an-close")).click();
	// 		});
	// 	});
	// });

});