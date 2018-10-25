'use strict'
describe('测试', function() {

    
      describe('修改mac地址', function() {
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
	      //点击已关机的 
	      let checkBox =  element.all(by.repeater('item in $data')).filter(function(item) {
	          return item.element(by.binding('item.status')).getText().then(function(label) {
	                return label === '关机';
	          });
	        });
	      checkBox.get(0).element(by.css('.checkbox')).click();
		  let moreAction = element(by.buttonText('更多操作'));
		  moreAction.click();
		  let chooseClick  = element(by.buttonText('修改MAC地址'));
		  chooseClick.click();
		  let sureClick=element(by.css('[ng-click="confirm(osPort,macForm)"]')); 
	      sureClick.click()
	  	 expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false)

		  
            });
        });
  

});