	
'use strict'

describe('密钥对', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let importKeypair = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it("删除密钥对", () => {
		browser.get('http://localhost:22555/#/cvm/keypairs');
		browser.sleep(3000);
		let oldRowsCount = 0;
		element.all(by.repeater('keypair in $data')).then(rows => {
			oldRowsCount = rows.length;
		});
		let todoIndex = 0;
		chkboxs.get(todoIndex + 1).click();
		deleteBtn.click().then(() => {
			let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
			delModalCfmBtn.click();
		});
		refreshBtn.click().then(() => {
			element.all(by.repeater('keypair in $data')).then(newRows => {
				expect(newRows.length).toEqual(oldRowsCount - 1);
			})
		});
	});

});