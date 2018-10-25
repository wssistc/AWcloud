'use strict'

describe('负载均衡', function() {
    it('负载均衡-监听器-编辑', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let loadbalancer = element.all(by.css('.table tbody tr td .edit-name > a')).get(1);
	    loadbalancer.click();
	    let tab =  element(by.css('[ng-click="getListeners()"]'));
	    tab.click();
        let checkBox = element.all(by.css('.table .checkbox i, .table .checkbox .iconfont')).get(1);
	    checkBox.click();
        let edit = element(by.css('.icon-aw-modify'));
        edit.click();
        let name = element(by.model('listener.name'));
        name.clear();
        name.sendKeys('gosh_fc888');
        let confirm = element(by.css('[ng-click="confirm(listenerForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
        
    });
});
