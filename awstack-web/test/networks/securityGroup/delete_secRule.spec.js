'use strict'

describe('安全组', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="securityGroupTable"] .checkbox i,.table-content .table[ng-table="securityGroupTable"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);
		
	it('删除安全组规则', () => {
		browser.get('http://localhost:22555/#/cvm/security_groups');
		browser.sleep(2000);
		element.all(by.css('tbody tr td[data-title="headers.firewallName"] a')).get(0).click().then(()=>{
			let oldRowsCount = 0;
			element.all(by.repeater('firewallDetail in $data |filter:firewallDetailSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});
			let todoIndex = 0;
			let detailChkboxs = element.all(by.css('.detail-info .table[ng-table="tableParams"] .checkbox i,.detail-info .table[ng-table="tableParams"] .checkbox .iconfont'));
			detailChkboxs.get(todoIndex + 1).click();
			let deleteRuleBtn = element(by.css('.detailInner .tab-content .table-action .btn[ng-click="deleteSecurityGroupRule(checkedItems)"]'));
			
			deleteRuleBtn.click().then(()=>{
				let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
				delModalCfmBtn.click();
				let detailRefreshBtn = element(by.css('.detailInner .tab-content .table-action .btn[ng-click="refreshSecurityGroupDetail()"]'));
				detailRefreshBtn.click().then(() => {
					element.all(by.repeater('firewallDetail in $data |filter:firewallDetailSearchTerm')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount - 1);
					});
				});
				element(by.css(".detailInner .tab-content .detail-title a.an-close")).click();
			});
		});
	});

});