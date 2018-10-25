'use strict'

describe('负载均衡', function() {
    it('负载均衡-编辑', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let checkBox = element.all(by.css('.table .checkbox i, .table .checkbox .iconfont')).get(1);
	    checkBox.click();
        let edit = element(by.css('.icon-aw-modify'));
        edit.click();
        let name = element(by.model('Vlan.name'));
        name.clear();
        name.sendKeys('test_fc888');
        let confirm = element(by.css('[ng-click="confirm(createLBForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
        
    });
});
