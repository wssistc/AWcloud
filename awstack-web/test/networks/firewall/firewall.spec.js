'use strict'

describe('防火墙', function() {

	let tabBtnList = element.all(by.css('ul.nav.nav-tabs li'));
	let actionBtnList = element.all(by.css(".tab-pane.active .table-action .btn"));
	let chkboxs = element.all(by.css('.tab-pane.active .table .checkbox i,.tab-pane.active .table .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let editBtn = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);
	let moreActionBtn = element(by.css(".tab-pane.active .table-action .dropdown .btn.btn-info"));

	it("获取防火墙页面", () => {
		browser.get('http://localhost:22555/#/cvm/firewall');
		browser.sleep(2000);
	});

	it('新建防火墙规则', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(2).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('firewallRule in $data | filter:globalSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});
			createBtn.click().then(() => {
				let nameInputField = element(by.model('firewallRuleForm.name'));
				let name = "e2etest-firewall-rule001" + Math.ceil(Math.random() * 10);
				nameInputField.sendKeys(name);
				element(by.css('.modal-footer .btn.btn-primary[ng-click="firewallRuleConfirm(firewallruleForm)"]')).click();
				refreshBtn.click().then(() => {
					element.all(by.repeater('firewallRule in $data | filter:globalSearchTerm')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount + 1);
						console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->create firewall rule success");
					});
				})
			});
		});
	});

	it("编辑防火墙规则", () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(2).click().then(() => {
			chkboxs.get(2).click();
			editBtn.click().then(() => {
				let editField = element(by.css('form[name="firewallruleForm"] input[ng-model="firewallRuleForm.name"]'));
				let editName = "e2etest-edit-firewall-rule001" + Math.ceil(Math.random() * 10);
				let editCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="firewallRuleConfirm(firewallruleForm)"]'));
				editField.clear();
				editField.sendKeys(editName);
				editCfmBtn.click();
				refreshBtn.click().then(() => {
					element.all(by.css('tr td div.edit-name a ')).each((element, index) => {
						element.getText().then(text => {
							if (text.indexOf("e2etest-edit-firewall-rule001") > -1) {
								expect(text).toContain(editName);
								console.log("-------->edit firewall rule  success");
							}
						})
					})
				})
			})
		})
	});

	it("删除防火墙规则", () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(2).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('firewallRule in $data | filter:globalSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});

			let todoIndex = 2;
			chkboxs.get(todoIndex).click();
			deleteBtn.click().then(() => {
				let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
				delModalCfmBtn.click();
			});

			refreshBtn.click().then(() => {
				element.all(by.repeater('firewallRule in $data | filter:globalSearchTerm')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount - 1);
					console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->delete firewall rule success");
				})
			});
		});
	});

	it('新建防火墙策略', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(1).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('firewallPolicy in $data | filter:globalSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});
			createBtn.click().then(() => {
				let nameInputField = element(by.model('firewallPolicyForm.name'));
				let name = "e2etest-policy001" + Math.ceil(Math.random() * 10);
				nameInputField.sendKeys(name);
				element(by.css('.modal-footer .btn.btn-primary[ng-click="firewallPolicyConfirm(firewallpolicyForm)"]')).click();
				refreshBtn.click().then(() => {
					element.all(by.repeater('firewallPolicy in $data | filter:globalSearchTerm')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount + 1);
						console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->create firewall policy success");
					});
				})
			});
		});
	});

	it("编辑防火墙策略", () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(1).click().then(() => {
			chkboxs.get(2).click();
			editBtn.click().then(() => {
				let editField = element(by.css('form[name="firewallpolicyForm"] input[ng-model="firewallPolicyForm.name"]'));
				let editName = "e2etest-edit-policy001" + Math.ceil(Math.random() * 10);
				let editCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="firewallPolicyConfirm(firewallpolicyForm)"]'));
				editField.clear();
				editField.sendKeys(editName);
				editCfmBtn.click();
				refreshBtn.click().then(() => {
					element.all(by.css('tr td div.edit-name a ')).each((element, index) => {
						element.getText().then(text => {
							if (text.indexOf("e2etest-edit-policy001") > -1) {
								expect(text).toContain(editName);
								console.log("-------->edit firewall policy  success");
							}
						})
					})
				})
			})
		})
	});

	it("删除防火墙策略", () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(2).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('firewallPolicy in $data | filter:globalSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});
			let elemList = element.all(by.id('td-policy-binded-rule'));
			let todoIndex = -1;
			for (let i = 0; i < elemList.length; i++) {
				let todoText = elemList.get(i).getText();
				if (!todoText) { //绑定了规则的防火墙策略不可以删除
					todoIndex = i;
					break;
				}
			}
			if (todoIndex > -1) {
				chkboxs.get(todoIndex + 1).click();
				deleteBtn.click();
				let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
				delModalCfmBtn.click();
				refreshBtn.click().then(() => {
					element.all(by.repeater('firewallPolicy in $data | filter:globalSearchTerm')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount - 1);
						console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->delete firewall policy success");
					});
				});
			}
		});
	});

	it('防火墙策略插入规则', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(1).click().then(() => {

			let elemList = element.all(by.id('td-policy-binded-rule'));
			let todoIndex = -1;
			for (let i = 0; i < elemList.length; i++) {
				let todoText = elemList.get(i).getText();
				if (!todoText) {
					todoIndex = i;
					break;
				}
			}
			if (todoIndex > -1) {
				chkboxs.get(todoIndex + 1).click();
				moreActionBtn.click();

				let addRuleToPolicyBtn = element(by.css("ul.dropdown-menu li[ng-click='addRuleToPolicy('add',editPolicyData)']"));
				addRuleToPolicyBtn.click().then(() => {
					let selectedRuleName = "";
					element(by.css('form[name="ruletopolicyForm"] input[type="search"]')).click().then(() => {
						let dropmenuRule = element(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row"));
						if (dropmenuRule.length > 0) {
							dropmenuRule.get(0).click();
							selectedRuleName = element(by.css('.ui-select-match-item span["uis-transclude-append"] span')).getText();
							element(by.css('.modal-footer .btn.btn-primary[ng-click="ruleToPolicyConfirm(ruletopolicyForm)"]')).click();
						}
					});
					refreshBtn.click().then(() => {
						let addSucces = false;
						element.all(by.css('div[ng-repeat = "rule in firewallPolicy.firewall_rules"] span')).each((elem, index) => {
							if (elem.getText() == selectedRuleName) {
								delSucces = true;
							}
						});
						expect(addSucces).toEqual(true);
					})
				});
			}

		});
	});

	it('防火墙策略移除规则', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(1).click().then(() => {

			let elemList = element.all(by.id('td-policy-binded-rule'));
			let todoIndex = -1;
			for (let i = 0; i < elemList.length; i++) {
				let todoText = elemList.get(i).getText();
				if (todoText) {
					todoIndex = i;
					break;
				}
			}
			console.log(todoIndex);
			if (todoIndex > -1) {
				chkboxs.get(todoIndex + 1).click();
				moreActionBtn.click();

				let delRuleFromPolicyBtn = element(by.css("ul.dropdown-menu li[ng-click='addRuleToPolicy('del',editPolicyData)']"));
				delRuleFromPolicyBtn.click().then(() => {
					let selectedRuleName = "";
					element(by.css('form[name="ruletopolicyForm"] input[type="search"]')).click().then(() => {
						let dropmenuRule = element(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row"));
						dropmenuRule.get(0).click();
						selectedRuleName = element(by.css('.ui-select-match-item span["uis-transclude-append"] span')).getText();
						element(by.css('.modal-footer .btn.btn-primary[ng-click="ruleToPolicyConfirm(ruletopolicyForm)"]')).click();
					});
					refreshBtn.click().then(() => {
						let delSucces = true;
						element.all(by.css('div[ng-repeat = "rule in firewallPolicy.firewall_rules"] span')).each((elem, index) => {
							if (elem.getText() == selectedRuleName) {
								delSucces = false;
							}
						});
						expect(addSucces).toEqual(true);
					})
				});
			}

		});
	});

	it('新建防火墙', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(0).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('netFirewall in $data | filter:globalSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});
			createBtn.click().then(() => {
				let policyVal = element(by.css('.ui-select-container[name="policy"] .ui-select-match-text span')).getText();
				if (policyVal) { //新建防火墙，策略必填项
					let nameInputField = element(by.model('netFirewallForm.name'));
					let name = "e2etest-firewall001" + Math.ceil(Math.random() * 10);
					nameInputField.sendKeys(name);
					element(by.css('.modal-footer .btn.btn-primary[ng-click="netFirewallConfirm(netfirewallForm)"]')).click();
					refreshBtn.click().then(() => {
						element.all(by.repeater('netFirewall in $data | filter:globalSearchTerm')).then(newRows => {
							expect(newRows.length).toEqual(oldRowsCount + 1);
							console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->create firewall  success");
						});
					})
				} else {
					element(by.css(".modal-footer .btn.btn-default[ng-click='$dismiss()']"));
				}
			});
		});
	});

	it("编辑防火墙", () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(0).click().then(() => {
			chkboxs.get(2).click();
			editBtn.click().then(() => {
				let editField = element(by.css('form[name="netfirewallForm"] input[ng-model="netFirewallForm.name"]'));
				let editName = "e2etest-edit-firewall001" + Math.ceil(Math.random() * 10);
				let editCfmBtn = element(by.css('.modal-footer .btn.btn-primary[ng-click="netFirewallConfirm(netfirewallForm)"]'));
				editField.clear();
				editField.sendKeys(editName);
				editCfmBtn.click();
				refreshBtn.click().then(() => {
					element.all(by.css('tr td div.edit-name a ')).each((element, index) => {
						element.getText().then(text => {
							if (text.indexOf("e2etest-edit-firewall001") > -1) {
								expect(text).toContain(editName);
								console.log("-------->edit firewall  success");
							}
						});
					});
				});
			});
		});
	});

	it("删除防火墙", () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(0).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.repeater('netFirewall in $data | filter:globalSearchTerm')).then(rows => {
				oldRowsCount = rows.length;
			});
			let todoIndex = 0;

			chkboxs.get(todoIndex + 1).click();
			deleteBtn.click();
			let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
			delModalCfmBtn.click();
			refreshBtn.click().then(() => {
				element.all(by.repeater('netFirewall in $data | filter:globalSearchTerm')).then(newRows => {
					expect(newRows.length).toEqual(oldRowsCount - 1);
					console.log("------>oldRowsCount：" + oldRowsCount + "  newRowsCount:" + newRows.length + "\n------->delete firewall success");
				})
			});
		});
	});

	it('防火墙关联路由器', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(0).click().then(() => {
			let todoIndex = 0;
			chkboxs.get(todoIndex + 1).click();
			moreActionBtn.click().then(() => {
				let addRuleToPolicyBtn = element(by.id("associateRouter-add-btn"));
				addRuleToPolicyBtn.click().then(() => {

					element(by.css('form[name="associaterouteForm"] input[type="search"]')).click().then(() => {
						browser.sleep(3000);

						element.all(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row")).then(rules=>{
							if (rules.length > 0) {
								element.all(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row")).first().click();

								element(by.css('.ui-select-match-item span span.ng-binding')).getText().then(selectedRouteName=>{
									element(by.css('.modal-footer .btn.btn-primary[ng-click="associateRouteConfirm(associaterouteForm)"]')).click();
									refreshBtn.click().then(() => {
										let addSucces = false;
										element.all(by.css('div[ng-repeat = "allocationRoute in netFirewall.associateRouter"] span')).each((elem, index) => {
											elem.getText().then(text=>{
												if (text == selectedRouteName) {
													addSucces = true;
													expect(addSucces).toEqual(true);
												}
											})
										})
									})
								});
							}
						});
					});
				});
			});
		});
	});

	it('防火墙解除关联路由器', () => {
		//browser.get('http://localhost:22555/#/cvm/firewall');
		tabBtnList.get(0).click().then(() => {
			let todoIndex = -1;
			element.all(by.id('td-firewall-route')).each((elem,index)=>{
				elem.getText().then(text=>{
					if(text){
						console.log(index);
						todoIndex = index;
						if (todoIndex > -1) {
							chkboxs.get(todoIndex + 1).click();
							moreActionBtn.click();
							let delRouteFromFirewallBtn = element(by.id("associateRouter-del-btn"));

							delRouteFromFirewallBtn.click().then(() => {
								element(by.css('form[name="associaterouteForm"] input[type="search"]')).click().then(() => {
									element.all(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row")).first().click();

									element(by.css('.ui-select-match-item span span.ng-binding')).getText().then(selectedRouteName=>{
										element(by.css('.modal-footer .btn.btn-primary[ng-click="associateRouteConfirm(associaterouteForm)"]')).click();
										expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
										// refreshBtn.click().then(() => {
										// 	let delSucces = true;
										// 	element.all(by.css('div[ng-repeat = "allocationRoute in netFirewall.associateRouter"] span')).each((elem, i) => {
										// 		elem.getText().then(text=>{
										// 			console.log(text,selectedRouteName);
										// 			if (text == selectedRouteName) {
										// 				delSucces = false;
										// 			}
										// 		})
										// 	});
										// 	expect(delSucces).toEqual(true);
										// });
									});
								});
							});
						}
					}
				})
			});
			
			// element.all(by.id('td-firewall-route')).then(elemList=>{
			// 	for (let i = 0; i < elemList.length; i++) {
			// 		elemList[i].getText().then(todoText=>{
			// 			if (todoText) {
			// 				todoIndex = i;
			// 				// break;
			// 			}
			// 			return todoIndex;
			// 		}).then(todoIndex=>{
			// 			if (todoIndex > -1) {
			// 				chkboxs.get(todoIndex + 1).click();
			// 				moreActionBtn.click();
			// 				let delRouteFromFirewallBtn = element(by.id("associateRouter-del-btn"));

			// 				delRouteFromFirewallBtn.click().then(() => {
			// 					element(by.css('form[name="associaterouteForm"] input[type="search"]')).click().then(() => {
			// 						element.all(by.css(".ui-select-choices  li.ui-select-choices-group div.ui-select-choices-row")).first().click();

			// 						element(by.css('.ui-select-match-item span span.ng-binding')).getText().then(selectedRouteName=>{
			// 							element(by.css('.modal-footer .btn.btn-primary[ng-click="associateRouteConfirm(associaterouteForm)"]')).click();
			// 							refreshBtn.click().then(() => {
			// 								let delSucces = true;
			// 								element.all(by.css('div[ng-repeat = "allocationRoute in netFirewall.associateRouter"] span')).each((elem, i) => {
			// 									elem.getText().then(text=>{
			// 										console.log(text,selectedRouteName);
			// 										if (text == selectedRouteName) {
			// 											delSucces = false;
			// 										}

			// 									})
			// 								});
			// 								expect(delSucces).toEqual(true);
			// 							});
			// 						});
			// 					});
			// 				});
			// 			}
			// 		});
			// 	}
			// })
		});
	});

});