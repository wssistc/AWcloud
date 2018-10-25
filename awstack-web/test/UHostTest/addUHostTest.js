'use strict'
describe('新建云主机测试', function() {

    
      describe('新建云主机', function() {
        it('进入', () => {
        beforeEach(function() {
        browser.get('http://localhost:22555/#/view');
          });
          let search=element(by.binding('userName')).getText();
          expect(search).toBe('admin');
          let userManager=element(by.css('aside .icon-aw-storage1'));
          userManager.click();
          let resClick = element.all(by.linkText('admin')).get(1);
          resClick.click();
          let yzjClick = element.all(by.css('.main .main-content .menu-manage .nav > ul > li > a')).get(1);
          yzjClick.click();
          let addClick=element(by.css('[ng-click="newInstance()"]')); 
          addClick.click();
          let nameInput = element(by.model('name'));
          nameInput.sendKeys('test');
          let sureAddClick=element(by.css('[ng-click="createInstance(InstanceForm);"]')); 
         sureAddClick.click()
		 expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false)
            });
        });
});