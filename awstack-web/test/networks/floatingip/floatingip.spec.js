'use strict'

describe('公网IP', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let bindFloatingIp = actionBtnList.get(1);
	let unBindFloatip = actionBtnList.get(2);
	let deleteBtn = actionBtnList.get(3);
	let refreshBtn = actionBtnList.get(4);

	it("获取公网IP页面", () => {
		browser.get('http://localhost:22555/#/cvm/floating_ips');
		browser.sleep(2000);
	});

	it('申请公网IP', () => {
		//browser.get('http://localhost:22555/#/cvm/floating_ips');
		let oldRowsCount = 0;
		element.all(by.repeater('floatip in $data')).then(rows => {
			oldRowsCount = rows.length;
		});
		createBtn.click().then(() => {
			element(by.css('.modal-footer .btn.btn-primary[ng-click="floatipConfirm()"]')).click();
			refreshBtn.click().then(() => {
				element.all(by.repeater('floatip in $data')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount + 1);
				});
			})
		});
	});

	it("绑定公网IP", () => {
		//browser.get('http://localhost:22555/#/cvm/floating_ips');
		browser.sleep(3000);
		let todoIndex = 0;

		function bindFloatingIpAction(todoIndex) {
			bindFloatingIp.click().then(() => {
				let bindFloatingIpCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="confirmBind(bindFloatIpForm,bindFloatipForm)"]'));
				bindFloatingIpCfmBtn.click();
				let bindRes = false;
				refreshBtn.click().then(() => {
					element.all(by.id('floatingIp-table-fixedIp')).get(todoIndex).getText().then(text => {
						if (text) {
							bindRes = true;
						}
					});
					expect(bindRes).toEqual(true);
				});
			});
		}

		function factorial(todoIndex) {
			element.all(by.repeater('floatip in $data')).then(rows => {
				if (todoIndex == rows.length) {
					return;
				}
				chkboxs.get(todoIndex + 1).click();
				bindFloatingIp.isEnabled().then(isEnabled => {
					if (isEnabled) {
						bindFloatingIpAction(todoIndex);
					} else {
						chkboxs.get(todoIndex + 1).click();
						todoIndex++;
						factorial(todoIndex);
					}
				});
			});
		}
		factorial(todoIndex);
	});

	it("解绑公网IP", () => {
		//browser.get('http://localhost:22555/#/cvm/floating_ips');
		browser.sleep(3000);
		let todoIndex = 0;

		function unbindFloatingIpAction(todoIndex) {
			unBindFloatip.click().then(() => {
				let unBindFloatingIpCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
				unBindFloatingIpCfmBtn.click();
				let unBindRes = false;
				refreshBtn.click().then(() => {
					element.all(by.id('floatingIp-table-fixedIp')).get(todoIndex).getText().then(text => {
						if (!text) {
							unBindRes = true;
						}
					});
					expect(unBindRes).toEqual(true);
				});
			});
		}

		function factorial(todoIndex) {
			element.all(by.repeater('floatip in $data')).then(rows => {
				if (todoIndex == rows.length) {
					return;
				}
				chkboxs.get(todoIndex + 1).click();
				unBindFloatip.isEnabled().then(isEnabled => {
					if (isEnabled) {
						unbindFloatingIpAction(todoIndex);
					} else {
						chkboxs.get(todoIndex + 1).click();
						todoIndex++;
						factorial(todoIndex);
					}
				});
			});
		}
		factorial(todoIndex);
	});

	it("删除公网IP", () => {
		//browser.get('http://localhost:22555/#/cvm/floating_ips');
		let oldRowsCount = 0;
		element.all(by.repeater('floatip in $data')).then(rows => {
			oldRowsCount = rows.length;
		});

		let todoIndex = 0;
		chkboxs.get(todoIndex + 1).click();
		deleteBtn.click().then(() => {
			let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
			delModalCfmBtn.click();
		});
		refreshBtn.click().then(() => {
			element.all(by.repeater('floatip in $data')).then(newRows => {
				expect(newRows.length).toEqual(oldRowsCount - 1);
			})
		});
	});

});