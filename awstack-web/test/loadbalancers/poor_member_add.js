'use strict'

describe('负载均衡', function() {
    it('负载均衡-资源池-成员-新建', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let loadbalancer = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    loadbalancer.click();
	    let tab =  element(by.css('[ng-click="getPools()"]'));
	    tab.click();
        let poor = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    poor.click();
        let mamber_tab =  element(by.css('[ng-click="getMembers()"]'));
	    mamber_tab.click();
	    let add = element(by.css('.icon-aw-add-to2'));
	    add.click();
	    let name =  element(by.model('member.name'));
	    name.sendKeys("gosh_")
	    let ip =  element(by.model('member.address'));
	    ip.sendKeys("24.78.8.39")
	    let port=  element(by.model('member.protocol_port'));
	    port.sendKeys("25")
	    let weight=  element(by.model('member.weight'));
	    weight.sendKeys("5")
        let confirm = element(by.css('[ng-click="confirmMember(memberForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
        
    });
});
