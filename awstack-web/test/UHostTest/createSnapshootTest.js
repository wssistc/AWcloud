'use strict'
describe('测试', function() {

      describe('云主机快照', function() {
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
		  let snapsClick  = element(by.buttonText('云主机快照'));
		  snapsClick.click();
		  //选择系统盘下拉列表第一个
		  let systemDisk=element(by.model('newObj.systemDisk'));
	 	  systemDisk.click()
	 	  let choseSystemFirst=element.all(by.css('.ui-select-container .ui-select-choices .ui-select-choices-row > a')).get(0); 
	 	  choseSystemFirst.click();
	 	  let sureClick=element(by.css('[ng-click="createInsSnap(insForm)"]')); 
	 	  sureClick.click()
	  	 expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false)

		  
            });
        });
  

});