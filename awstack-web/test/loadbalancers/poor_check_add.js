'use strict'

describe('负载均衡', function() {
    it('负载均衡-资源池-检查器-新建', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let loadbalancer = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    loadbalancer.click();
	    let tab =  element(by.css('[ng-click="getPools()"]'));
	    tab.click();
        let poor = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    poor.click();
        let check_tab =  element(by.css('[ng-click="getHealthMonitors()"]'));
	    check_tab.click();
	    let add = element.all(by.css('.icon-aw-add-to2')).get(1);
	    add.click();
	    let name =  element(by.model('new.name'));
	    name.sendKeys("gosh_")
	    let delay =  element(by.model('new.delay'));
	    delay.sendKeys("1")
	    let timeout=  element(by.model('new.timeout'));
	    timeout.sendKeys("2")
	    let maxRetries=  element(by.model('new.maxRetries'));
	    maxRetries.sendKeys("5")
        let confirm = element(by.css('[ng-click="newconfirm(newMonitorForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
        
    });
});
