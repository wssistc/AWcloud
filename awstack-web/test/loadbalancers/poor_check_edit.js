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
	    let checkBox = element.all(by.css('.table .checkbox i, .table .checkbox .iconfont')).get(2);
	    checkBox.click()
	    let edit = element.all(by.css('.icon-aw-modify')).get(1);
	    edit.click();	
	    let name =  element(by.model('new.name'));
	    name.sendKeys("_f")
        let confirm = element(by.css('[ng-click="newconfirm(newMonitorForm)"]'));
        confirm.click();
        expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);
        
        
    });
});
