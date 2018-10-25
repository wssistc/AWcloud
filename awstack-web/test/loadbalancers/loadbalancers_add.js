'use strict'

describe('负载均衡', function() {
    it('负载均衡-新建', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let add = element(by.css('.icon-aw-add-to2'));
        add.click();
        let name = element(by.model('Vlan.name'));
        name.sendKeys('test_fc');
        let confirm = element(by.css('[ng-click="confirm(createLBForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
    });
});
