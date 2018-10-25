'use strict'
describe('测试系统管理', function() {
    it('主机集合新建', () => { 
        browser.get('http://localhost:22555/#/system/aggregates');
        element.all(by.css(".table-action button")).get(0).click();
        element(by.model('aggregateData.name')).sendKeys("hello");
        element(by.model('aggregateData.availability_zone')).sendKeys("world");
        element(by.model('aggregateData.availability_zone')).clear();
        element(by.model('aggregateData.availability_zone')).sendKeys("beautiful world");
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000)
    })
    it('主机集合新建2', () => { 
        browser.get('http://localhost:22555/#/system/aggregates');
        element.all(by.css(".table-action button")).get(0).click();
        element(by.model('aggregateData.name')).sendKeys("hellos");
        element(by.model('aggregateData.availability_zone')).sendKeys("sws");
        element(by.model('aggregateData.availability_zone')).clear();
        element(by.model('aggregateData.availability_zone')).sendKeys("beautiful adc");
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000)
    })
    it('主机集合编编辑', () => {
        $$('.checkbox .iconfont').then(function(arr){
            element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
        })
        element.all(by.css(".table-action button")).get(1).click();
        element(by.model('aggregateData.name')).clear()
        element(by.model('aggregateData.name')).sendKeys("hey");
        element(by.model('aggregateData.availability_zone')).clear();
        element(by.model('aggregateData.availability_zone')).sendKeys("world");
        element(by.model('aggregateData.availability_zone')).clear();
        element(by.model('aggregateData.availability_zone')).sendKeys("beautiful girl");
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000);
    })
    it('设置元数据成功', () => { 
        $$('.checkbox .iconfont').then(function(arr){
            element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
        })
        element.all(by.css(".table-action button")).get(2).click();
        element(by.css('.ui-select-container')).click();
        element.all(by.css('.ui-select-container .ui-select-choices-row')).get(1).click();
        element(by.model('metadata.value')).clear();
        element(by.model('metadata.value')).sendKeys("12");
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000);
    });
    it('删除主机集合', () => { 
        $$('.checkbox .iconfont').then(function(arr){
            element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
        })
        element.all(by.css(".table-action button")).get(4).click();
        element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);;//判断新建弹出层的标题是否存在
        })
        browser.sleep(1000);
    });
    it('管理主机', () => { 
        $$('.checkbox .iconfont').then(function(arr){
            element.all(by.css('.checkbox .iconfont')).get(arr.length-1).click();
        })
        element.all(by.css(".table-action button")).get(3).click();
        element(by.css('.ui-select-container')).click();
        element.all(by.css('.ui-select-container .ui-select-choices-row')).get(0).click();
        element.all(by.css('.ui-select-container .ui-select-choices-row')).get(0).click();
        element(by.buttonText('确定')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000);
    });
});