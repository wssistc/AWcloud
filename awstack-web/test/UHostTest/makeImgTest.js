'use strict'
describe('测试', function() {

    
      describe('制作镜像', function() {
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
				let chooseClick  = element(by.buttonText('制作镜像'));
				chooseClick.click();
				let imgName = element(by.model('img.imageName'))
				imgName.sendKeys('fc');
				let sureClick=element(by.css('[ng-click="confirm(img,mkImgForm)"]')); 
			  sureClick.click()
			  	expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false)

		  
            });
        });
  

});