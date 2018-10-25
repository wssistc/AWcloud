'use strict'

describe('路由器', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="routersTable"] .checkbox i,.table-content .table[ng-table="routersTable"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let setGatewayBtn = actionBtnList.get(2);
	let deleteGatewayBtn = actionBtnList.get(3);
	let deleteBtn = actionBtnList.get(4);
	let refreshBtn = actionBtnList.get(5);

	it("获取路由器页面", () => {
		browser.get('http://localhost:22555/#/cvm/routers');
		browser.sleep(2000);
	});

	it('新建路由器测试', () => {
		//browser.get('http://localhost:22555/#/cvm/routers');
		//browser.sleep(2000);
		let oldRowsCount = 0;
		element.all(by.repeater('router in $data')).then(rows => {
			oldRowsCount = rows.length;
		});
		createBtn.click().then(() => {
			let routerName = element(by.model('routerForm.name'));
			let inputRouterName = "e2etest-router001" + Math.ceil(Math.random() * 10);
			routerName.sendKeys(inputRouterName);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="routerConfirm(createrouterForm)"]')).click();
			refreshBtn.click().then(() => {
				element.all(by.repeater('router in $data')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount + 1);
				});
			})
		});
	});

	it("编辑路由器名称测试", () => {
		//browser.get('http://localhost:22555/#/cvm/routers');
		//browser.sleep(2000);
		chkboxs.get(1).click();
		editBtn.click().then(() => {
			let editField = element(by.css('form[name="editRouterForm"] input[ng-model="routerForm.name"]'));
			let editRouterName = "e2etest-edit-router001" + Math.ceil(Math.random() * 10);
			let editRouterCfmBtn = element(by.css('.modal-footer .btn.btn-primary'));
			editField.clear();
			editField.sendKeys(editRouterName);
			editRouterCfmBtn.click();
			refreshBtn.click().then(() => {
				element.all(by.css('tr td div.edit-name a ')).each((element, index) => {
					element.getText().then(text => {
						if (text.indexOf("e2etest-edit-routr001") > -1) {
							expect(text).toContain(editRouterName);
							console.log("-------->editRouterName success");
						}
					})
				})
			})
		})
	});

	it("清除路由器网关", () => {
		//browser.get('http://localhost:22555/#/cvm/routers');
		//browser.sleep(2000);
		let todoIndex = 2;
		chkboxs.get(todoIndex).click();
		deleteGatewayBtn.click().then(() => {
			let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
			delModalCfmBtn.click();
		});
		refreshBtn.click().then(() => {
			element.all(by.id('extNetwork-td-cont')).get(todoIndex - 1).getText().then(text => {
				expect(text).toEqual("");
			});
		});
	});

	it("设置路由器网关", () => {
		//browser.get('http://localhost:22555/#/cvm/routers');
		//browser.sleep(2000);
		let todoIndex = 0;
		element.all(by.id('extNetwork-td-cont')).each((elem, index) => {
			elem.getText().then(function(text) {
				if (!text) {
					todoIndex = index;
					chkboxs.get(index + 1).click();
					setGatewayBtn.click();
					let setGatewayCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="setGatewayConfirm(addGatewayForm)"]'));
					setGatewayCfmBtn.click();
				}
			});
		});
		refreshBtn.click().then(() => {
			element.all(by.id('extNetwork-td-cont')).get(todoIndex).getText().then(text => {
				expect(text).toEqual("external_net");
			});
		});
	});

	it("删除路由器测试", () => {
		//browser.get('http://localhost:22555/#/cvm/routers');
		//browser.sleep(2000);
		let oldRowsCount = 0;
		element.all(by.repeater('router in $data')).then(rows => {
			oldRowsCount = rows.length;
		});
		
		let elemList = element.all(by.id('extNetwork-td-cont'));
		let todoIndex = -1;
		for (let i = 0; i < elemList.length; i++) {
			let todoText = elemList.get(i).getText();
			if (!todoText) { //选择没有绑定网关的路由器
				todoIndex = i;
				break;
			}
		}
		if (todoIndex > -1) {
			chkboxs.get(index + 1).click();
			deleteBtn.click();
			let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
			delModalCfmBtn.click();
			refreshBtn.click().then(() => {
				//判断删除成功
				element.all(by.repeater('router in $data')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount - 1);
				})
			});
		}
	});
});