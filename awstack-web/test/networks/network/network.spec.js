'use strict'

describe('测试交换机子网', function() {
	// var table, tbody, rows;
	// beforeEach(() => {
	// 	  table = element(by.css('.tab-pane.active .table-content table[ng-table="networkTable"]'));
	//    tbody = table.find('tbody');
	//    rows = tbody.find('tr');
	// });
	let tabBtnList = element.all(by.css('ul.nav.nav-tabs li'));
	let actionBtnList = element.all(by.css(".tab-pane.active .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.tab-pane.active .table .checkbox i,.tab-pane.active .table .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);
	let inputSubName;

	it("获取交换机子网页面", () => {
		browser.get('http://localhost:22555/#/cvm/networks');
		browser.sleep(2000);
	});

	it('新建交换机测试', () => {
		//browser.get('http://localhost:22555/#/cvm/networks');
		tabBtnList.get(0).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('network in $data track by $index')).then(rows => {
				oldRowsCount = rows.length;
			});
			createBtn.click().then(() => {
				let networkName = element(by.model('networkForm.name'));
				let inputNetName = "e2etest-net001" + Math.ceil(Math.random() * 10);
				networkName.sendKeys(inputNetName);
				element(by.id('networkConfirm')).click();
				refreshBtn.click().then(() => {
					//判断创建成功
					element.all(by.repeater('network in $data track by $index')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount + 1);
						console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->create network success");
					});
					//expect(table.find("td div.edit-name a").text()).toContain("e2etest-net001");
				})
			});
		});
	});

	it("编辑交换机", () => {
		//browser.get('http://localhost:22555/#/cvm/networks');
		tabBtnList.get(0).click().then(() => {
			chkboxs.get(2).click();
			editBtn.click().then(() => {
				let editField = element(by.css('form[name="editNetworkForm"] input[ng-model="networkForm.name"]'));
				let editNetName = "e2etest-edit-net001" + Math.ceil(Math.random() * 10);
				let editNetCfmBtn = element(by.css('.modal-footer .btn.btn-primary'));
				editField.clear();
				editField.sendKeys(editNetName);
				editNetCfmBtn.click();
				refreshBtn.click().then(() => {
					element.all(by.css('tr td div.edit-name a ')).each((element, index) => {
						element.getText().then(text => {
							if (text.indexOf("e2etest-edit-net001") > -1) {
								expect(text).toContain(editNetName);
							}
						})
					})
				})
			})
		})

	});

	it("删除交换机", () => {
		//browser.get('http://localhost:22555/#/cvm/networks');
		tabBtnList.get(0).click().then(() => {
			let oldRowsCount = 0;
			let newRowsCount = 0;
			element.all(by.repeater('network in $data track by $index')).then(rows => {
				oldRowsCount = rows.length;
			});
			element.all(by.css('tr td div.edit-name a ')).each((elem, index) => {
				elem.getText().then(text => {
					if (text.indexOf("e2etest") > -1) {
						chkboxs.get(index + 1).click();
						deleteBtn.click().then(() => {
							let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
							delModalCfmBtn.click();
						});
					}
				})
			});
			refreshBtn.click().then(() => {
				element.all(by.repeater('network in $data track by $index')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount - 1);
				})
			});
		})

	});

	it("新建子网", () => {
		//browser.get('http://localhost:22555/#/cvm/networks');
		tabBtnList.get(1).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('subnet in $data track by $index')).then(rows => {
				oldRowsCount = rows.length;
			});
			createBtn.click().then(() => {
				let subName = element(by.model('subnetForm.name'));
				let cidr_ip1 = element(by.model("subnetForm.init_cidr.ip_1"));
				let cidr_ip2 = element(by.model("subnetForm.init_cidr.ip_2"));
				let cidr_ip3 = element(by.model("subnetForm.init_cidr.ip_3"));
				let cidr_ip4 = element(by.model("subnetForm.init_cidr.ip_4"));
				let cidr_ip5 = element(by.model("subnetForm.init_cidr.ip_5"));
				inputSubName = "e2etest-sub001" + Math.ceil(Math.random() * 10);

				subName.sendKeys(inputSubName);
				cidr_ip1.sendKeys(Math.floor(Math.random() * 255));
				cidr_ip2.sendKeys(Math.floor(Math.random() * 255));
				cidr_ip3.sendKeys(Math.floor(Math.random() * 255));
				cidr_ip4.sendKeys(0);
				cidr_ip5.sendKeys(24);
				let autoAssignGatewayIp_chkbox = element(by.css('label.checkbox input[name="use_gateway"]+i.iconfont'));
				autoAssignGatewayIp_chkbox.click();
				element(by.css('.modal-footer .btn.btn-primary[ng-click="createSubnetCfm(createSubnetForm)"]')).click();
				refreshBtn.click().then(() => {
					element.all(by.repeater('subnet in $data track by $index')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount + 1);
						console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->create subnet success");
					});
				})
			});
		});

	})

	it("编辑子网", () => {
		//browser.get('http://localhost:22555/#/cvm/networks');
		tabBtnList.get(1).click().then(() => {
			chkboxs.get(2).click();
			editBtn.click().then(() => {
				let editField = element(by.css('form[name="editSubnetForm"] input[ng-model="subnetForm.name"]'));
				let editSubCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="editSubnetCfm(editSubnetForm)"]'));
				editField.clear();

				let editSubName = "e2etest-edit-sub001" + Math.ceil(Math.random() * 10);
				editField.sendKeys(editSubName);
				editSubCfmBtn.click();
				refreshBtn.click().then(() => {
					element.all(by.css('tr td div.edit-name span ')).each((element, index) => {
						element.getText().then(text => {
							if (text.indexOf("e2etest-edit-sub001") > -1) {
								expect(text).toContain(editSubName);
							}
						})
					})
				})
			})
		});

	});

	it("删除子网", () => {
		//browser.get('http://localhost:22555/#/cvm/networks');
		tabBtnList.get(1).click().then(() => {
			let oldRowsCount = 0;
			let newRowsCount = 0;
			element.all(by.repeater('subnet in $data track by $index')).then(rows => {
				oldRowsCount = rows.length;
			});
			element.all(by.css('table[ng-table="subnetTable"] tbody tr td div.edit-name span ')).each((elem, index) => {
				elem.getText().then(text => {
					if (text.indexOf(inputSubName) > -1) {
						chkboxs.get(index + 1).click();
						deleteBtn.click();
						let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
						delModalCfmBtn.click();
					}
				})
			});
			refreshBtn.click().then(() => {
				//判断删除成功
				element.all(by.repeater('subnet in $data track by $index')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount - 1);
				})
			});
		});
	});
});