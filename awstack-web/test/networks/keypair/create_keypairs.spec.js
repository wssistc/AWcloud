'use strict'

describe('密钥对', function() {

	let actionBtnList = element.all(by.css(".page-inner .table-action .btn[type='button']"));
	let chkboxs = element.all(by.css('.table-content .table[ng-table="tableParams"] .checkbox i,.table-content .table[ng-table="tableParams"] .checkbox .iconfont'));
	let createBtn = actionBtnList.get(0);
	let importKeypair = actionBtnList.get(1);
	let deleteBtn = actionBtnList.get(2);
	let refreshBtn = actionBtnList.get(3);

	it('新建密钥对', () => {
		browser.get('http://localhost:22555/#/cvm/keypairs');
		browser.sleep(3000);
		let oldRowsCount = 0;
		element.all(by.repeater('keypair in $data')).then(rows => {
			oldRowsCount = rows.length;
		});

		createBtn.click().then(() => {
			let nameField = element(by.model("newKeyPairData.name"));
			let name = "e2etest_keypair001" + Math.ceil(Math.random() * 10);
			nameField.sendKeys(name);
			element(by.css('.modal-footer .btn.btn-primary[ng-click="confirmNewKeypair(newKeyPairData)"]')).click().then(()=>{
				element(by.css('.modal-footer .btn[ng-click="download()"]')).click();
				refreshBtn.click().then(() => {
					element.all(by.repeater('keypair in $data')).then(newRows => {
						expect(newRows.length).toEqual(oldRowsCount + 1);
					});
				});
			});
			
		});
	});

	// it('导入密钥对', () => {
	// 	browser.get('http://localhost:22555/#/cvm/keypairs');
	// 	browser.sleep(3000);
	// 	let oldRowsCount = 0;
	// 	element.all(by.repeater('keypair in $data')).then(rows => {
	// 		oldRowsCount = rows.length;
	// 	});
	// 	importKeypair.click().then(()=>{
	// 		let nameField = element(by.model("importKeyPairData.name"));
	// 		let publicKeyField = element(by.model("importKeyPairData.public_key"));

	// 		let name = "e2etest_import_keypair001" + Math.ceil(Math.random() * 10);
	// 		let publicKey ="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDMueTrPk+oEe8v0pPeYkhnZ9TnQ/B3/Li8o+NE6hCz9yFPbJIzzeHm80Dn61Ewzi54DLx8mazgt4vqopAsefK5RQ8ZGjeKEPA79z4VWZ7UwdaAHT2teI4RRLbZzQZhW3Q3HntHzc2pP4Frbj7+XurKOvk+dYZflD0vKoJeYfCgelDG9IHigvQhTYIv2GqRtJewLxVxqygCrl22WskanC3qANiXCdQA2ZazdBdGhknPEAnXasb2a6CvrYZy/8wkvaJU6jKSzb5foMVBs5MR+M71KabJ2DX25xQe4u7vqRDPSs5N6vWYOI2xypR7BSMZeapmrcsSPi9YXk/idjxXBmV3 Generated-by-Nova"
	// 		nameField.sendKeys(name);
	// 		publicKeyField.sendKeys(publicKey);
	// 		element(by.css('.modal-footer .btn.btn-primary[ng-click="confirmImportKeypair(importKeyPairData,importKeyPairForm)"]')).click();
	// 		refreshBtn.click().then(() => {
	// 			element.all(by.repeater('keypair in $data')).then(newRows => {
	// 				expect(newRows.length).toEqual(oldRowsCount + 1);
	// 			});
	// 		})
	// 	})
	// });

	// it("删除密钥对", () => {
	// 	browser.get('http://localhost:22555/#/cvm/keypairs');
	// 	browser.sleep(3000);
	// 	let oldRowsCount = 0;
	// 	element.all(by.repeater('keypair in $data')).then(rows => {
	// 		oldRowsCount = rows.length;
	// 	});
	// 	let todoIndex = 0;
	// 	chkboxs.get(todoIndex + 1).click();
	// 	deleteBtn.click().then(() => {
	// 		let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
	// 		delModalCfmBtn.click();
	// 	});
	// 	refreshBtn.click().then(() => {
	// 		element.all(by.repeater('keypair in $data')).then(newRows => {
	// 			expect(newRows.length).toEqual(oldRowsCount - 1);
	// 		})
	// 	});
	// });

});