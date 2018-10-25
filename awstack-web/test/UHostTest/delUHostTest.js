'use strict'
describe('测试', function() {

      describe('删除云主机', function() {
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
	      let checkBox = element.all(by.css('.table .checkbox i, .table .checkbox .iconfont')).get(2);
	      checkBox.click();
		  let moreAction = element(by.buttonText('更多操作'));
		  moreAction.click();
		  let delMainframe  = element(by.buttonText('删除云主机'));
		  delMainframe.click();
		  let sureDelClick=element(by.css('[ng-click="confirm()"]')); 
	 	  sureDelClick.click()
	  	  expect(element(by.css('.delete-wrap .delete-alert .delete-show')).isPresent()).toBe(false)

		  
            });
        });
  

});