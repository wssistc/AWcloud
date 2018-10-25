'use strict'
describe('测试系统管理', function() {
    it('新建云主机类型成功', () => { 
        browser.get('http://localhost:22555/#/system/flavors');
        element.all(by.css('.table-action button')).get(0).click();
        let flavorName=element(by.model('newFlavorData.name'));
        let vcpus=element(by.model('newFlavorData.vcpus'));
        let vcpus_max=element(by.model('newFlavorData.vcpus_max'));
        let ram=element(by.model('newFlavorData.ram'));
        let ram_max=element(by.model('newFlavorData.ram_max'));
        flavorName.sendKeys('aaaa');
        vcpus.clear();
        vcpus.sendKeys('1');
        vcpus_max.clear();
        vcpus_max.sendKeys('4');
        ram.clear();
        ram.sendKeys('1');
        ram_max.clear();
        ram_max.sendKeys('4');
        let org=element(by.css('.ui-select-container'));
        org.click();
        let orgSelected=element.all(by.css('.ui-select-choices-row')).get(1);
        orgSelected.click();
        let confirmButton=element.all(by.css('.modal-footer .btn')).get(0);
        confirmButton.click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000);
    });
    it('删除云主机类型成功', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element(by.css('[ng-click="deleteFlavor()"]')).click();
        element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);//判断新建弹出层的标题是否存在
        });
        browser.sleep(1000);
    });
    it('搜索云主机类型', () => { 
        element(by.css('aside .icon-aw-adjust')).click();
        element(by.model('globalSearchTerm')).sendKeys('16');
        element(by.model('globalSearchTerm')).clear();
        element(by.model('globalSearchTerm')).sendKeys(" ");
        element(by.model('globalSearchTerm')).clear();
        element(by.model('globalSearchTerm')).sendKeys('内存');
        browser.sleep(1000);
        expect(element.all(by.css('.del-cont')).get(0).isDisplayed()).toBe(false);
    });
    it('刷新成功', () => { 
        element.all(by.css('.checkbox .iconfont')).get(1).click();
        element(by.css('[ng-click="refreshFlavors()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('[disabled="disabled"]')).get(0).isDisplayed()).toBe(true);;
        })
    })
    it('新建云主机特别设置', () => { 
        element.all(by.css('.edit-name')).get(0).click();
        browser.sleep(1000);
        element.all(by.css('.detail-info .table-action .btn')).get(0).click();
        element(by.css('.ui-select-container')).click();
        element.all(by.css('.ui-select-container .ui-select-choices-row')).get(0).click();
        element(by.model('flavorExtrasData.value')).sendKeys("1");
        element(by.css('[ng-click="confirmFlavorExtras(flavorExtrasData,FlavorExtraForm)"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
    })
    it('编辑云主机特别设置', () => { 
        element.all(by.css('.detail-info .checkbox .iconfont')).get(1).click();
        element.all(by.css('.detail-info .table-action .btn')).get(1).click();
        element(by.model('flavorExtrasData.value')).clear();
        element(by.model('flavorExtrasData.value')).sendKeys("2");
        element(by.css('[ng-click="confirmFlavorExtras(flavorExtrasData,FlavorExtraForm)"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal .modal-dialog .modal-header h3')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        });
    })
    it('删除云主机特别设置', () => { 
        element.all(by.css('.detail-info .checkbox .iconfont')).get(1).click();
        element(by.css('[ng-click="deleteFlavorExtra()"]')).click();
        element(by.css('[ng-click="confirm()"]')).click().then(function(){//点击确定
            expect(element.all(by.css('.alert .del-cont')).get(0).isDisplayed()).toBe(false);//判断新建弹出层的标题是否存在
        });
    })

}); 