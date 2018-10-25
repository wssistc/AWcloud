'use strict'
describe('测试', function() {

      describe('调整宽带测试', function() {
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
	      //选择第二个checkbox 
	      let checkBox = element.all(by.css('.table .checkbox i, .table .checkbox .iconfont')).get(2);
	      checkBox.click();
		  let moreAction = element(by.buttonText('更多操作'));
		  moreAction.click();
		  let bdbClick  = element(by.buttonText('调整带宽'));
		  bdbClick.click();
		  let changeInput=element(by.model('network.networkBandwidth'));
	 	  changeInput.click()
	 	  changeInput.clear();
	 	  changeInput.sendKeys('125');
	 	  let sureClick=element(by.css('[ng-click="cfmBandwidth(modifyBandwidthForm,limitType)"]')); 
	 	 sureClick.click()
	  	 expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false)

		  
            });
        });
  

});