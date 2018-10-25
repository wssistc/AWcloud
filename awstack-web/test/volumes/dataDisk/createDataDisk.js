'use strict'
describe('测试', function() {
    it('新建数据盘测试', () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element(by.css('.icon-aw-add-to2')).click();//点击新建
		expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
	});

	it('新建数据盘成功测试', () => {
		browser.get("http://localhost:22555/#/cvm/volumes");		
		element(by.css('.icon-aw-add-to2')).click();//点击新建
		element(by.model('volumeForm.name')).sendKeys('VolumesTest');//输入云硬盘名称
		element(by.model('volumeForm.size')).sendKeys('1');//输入 配置（GB）
		element(by.model('volumeForm.description')).sendKeys('自动化测试用例');//输入描述信息
		element.all(by.css('.btn.btn-primary')).get(0).click().then(function(){//点击确定
			expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
		});
	});

	it('新建数据盘失败测试', () => {
		browser.get("http://localhost:22555/#/cvm/volumes");
		element(by.css('.icon-aw-add-to2')).click();
		element(by.model('volumeForm.name')).sendKeys('=VolumesTest');
		element(by.model('volumeForm.size')).sendKeys('1');
		element(by.model('volumeForm.description')).sendKeys('自动化测试用例');
		element.all(by.css('.btn.btn-primary')).get(0).click().then(function() {
			expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(true);//判断新建弹出层的标题是否存在
		});
	});
});