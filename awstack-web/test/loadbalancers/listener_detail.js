'use strict'

describe('负载均衡', function() {
    it('负载均衡-监听器-删除', () => {
        browser.get('http://localhost:22555/#/cvm/loadbalancers');
        let loadbalancer = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    loadbalancer.click();
	    let tab =  element(by.css('[ng-click="getListeners()"]'));
	    tab.click();
        let  listener = element.all(by.css('.table tbody tr td .edit-name > a')).get(0);
	    listener.click();
        expect(element(by.css('.icon-aw-mail-reply')).isPresent()).toBe(true);
    });
});
