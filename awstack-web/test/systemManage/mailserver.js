'use strict'

describe('测试系统管理', function() {
    it('邮件服务器设置', () => { 
        browser.get('http://localhost:22555/#/system/mailserver');
        element(by.model('mail.host')).clear();
        element(by.model('mail.host')).sendKeys('smtp.exmail.qq.com');
        element(by.model('mail.username')).clear();
        element(by.model('mail.username')).sendKeys('zhongpan@awcloud.com');
        element(by.model('mail.password')).clear();
        element(by.model('mail.password')).sendKeys('12345678');
        element(by.model('mail.smtp.sender')).clear();
        element(by.model('mail.smtp.sender')).sendKeys('帅气');
        element(by.css('[ng-click="saveMailServer(mail,mailSrvForm)"]')).click().then(function(){//点击确定
            expect(element(by.css('.modal-dialog .modal-footer')).isPresent()).toBe(false);//判断新建弹出层的标题是否存在
        })
        browser.sleep(3000);
    });

});