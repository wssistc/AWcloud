'use strict'

describe('告警事件', function() {
	
	let tabBtnList = element.all(by.css('ul.nav.nav-tabs li'));
	let actionBtnList = element.all(by.css(".tab-pane.active .table-action .btn"));
	let chkboxs = element.all(by.css('.tab-pane.active .table .checkbox i,.tab-pane.active .table .checkbox .iconfont'));
	let refreshBtn = actionBtnList.get(0);
	let handleBtn = actionBtnList.get(1);
	let ignoreBtn = actionBtnList.get(2);

	it('忽略告警事件', () => {
		browser.get('http://localhost:22555/#/monitor/alarmevent');
		browser.sleep(2000);
		tabBtnList.get(0).click().then(() => {
			let oldRowsCount = 0;
			element.all(by.css('.tab-pane.active .table tbody tr[ng-repeat="item in $data"]')).then(rows => {
				oldRowsCount = rows.length;
			});
			let todoIndex = 0;
			chkboxs.get(todoIndex+1).click();

			ignoreBtn.click().then(() => {
				let delModalCfmBtn = element(by.css(".delete-wrap .btn-item .btn.btn-danger[ng-click='confirm()']"));
				delModalCfmBtn.click();
				refreshBtn.click().then(() => {
					// element.all(by.css('.tab-pane.active .table tbody tr[ng-repeat="item in $data"]')).then(newRows => {
					// 	expect(newRows.length).toEqual(oldRowsCount - 1);
					// });
				});
			});
		});
	});
	
});