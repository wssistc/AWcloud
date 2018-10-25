'use strict'

describe('负载均衡', function() {
    it('负载均衡-资源池-新建', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let loadbalancer = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    loadbalancer.click();
	    let tab =  element(by.css('[ng-click="getPools()"]'));
	    tab.click();
	    // 资源池的 新建 按钮 任存在   但是隐藏  所以 寻找元素 要找第二个
        let add = element.all(by.css('.icon-aw-add-to2')).get(1);
        add.click();
        let name = element(by.model('pool.name'));
        name.sendKeys("gosh")
        let confirm = element(by.css('[ng-click="confirmPool(poolForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);

    });
});
