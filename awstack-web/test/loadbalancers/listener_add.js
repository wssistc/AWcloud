'use strict'

describe('负载均衡', function() {
    it('负载均衡-监听器-新建', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let loadbalancer = element.all(by.css('.table tbody tr td .edit-name > a')).get(1);
	    loadbalancer.click();
	    let tab =  element(by.css('[ng-click="getListeners()"]'));
	    tab.click();
        let add = element(by.css('.icon-aw-add-to2'));
        add.click();
        let name = element(by.model('listener.name'));
        name.sendKeys("gosh")
        let port= element(by.model('listener.protocol_port'));
        port.sendKeys("250")
        let confirm = element(by.css('[ng-click="confirm(listenerForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
    });
});
