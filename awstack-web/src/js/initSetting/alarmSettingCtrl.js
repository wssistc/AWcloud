
var initAlarmSettingModule = angular.module("initAlarmSettingModule", []);

initAlarmSettingModule.controller("initAlarmSettingCtrl", ["$scope", "$rootScope", "$uibModal", "mailServerSrv", "weChatAlarmSrv", "contactGroupSrv",
    "initSettingSrv", "alertSrv", "$translate", function($scope, $rootScope, $uibModal, mailServerSrv, weChatAlarmSrv, contactGroupSrv, initSettingSrv,
    alertSrv, $translate) {

    var self = $scope;
    var context = initSettingSrv.context;

    //第一步到第二步
    context.stepToTwo = function() {
        if((self.hasAddEmail && self.emailStatus) || (self.hasAddWeChat && self.weChatStatus)) {
            context.inStepOne = false;
            context.inStepTwo = true;
            context.inStepTwoBar = true;
        }else {
            var msg = $translate.instant("aws.initSetting.settingTranslate.activeEmailOrWeChat");
            alertSrv.set("", msg, "error", 5000);
        }
    }
    //第二步到第一步
    context.stepToOne = function() {
        context.inStepOne = true;
        context.inStepTwo = false;
        context.inStepTwoBar = false;
    }

    // if(!$rootScope.ADMIN) {
    //     context.inStepOne = false;
    //     context.inStepTwo = true;
    //     context.inStepTwoBar = true;
    // }

    //邮件
    self.mail = {
        host:"",
        username:"",
        password:"",
        isUse: false,
        smtp:{
            auth:"",
            sender:"",
            port:"",
            timeout:""
        },
        paramId:""
    };

    mailServerSrv.getMailData(context.initSetting_headers).then(function(res){
        if(res && res.data && angular.isArray(res.data) && res.data.length !=0){
            self.hasAddEmail = true;
            var mailData = JSON.parse(res.data[0].paramValue);
            var mailPassword = mailData["mail.password"].split(",").map(item=>{return String.fromCharCode(item)}).join("");
            self.mail={
                host:mailData["mail.host"],
                username:mailData["mail.username"],
                //password:mailData["mail.password"],
                password:mailPassword,
                isUse:mailData["mail.isUse"],
                smtp:{
                    auth:mailData["mail.smtp.auth"],
                    sender:mailData["mail.smtp.sender"],
                    port:mailData["mail.smtp.port"],
                    timeout:mailData["mail.smtp.timeout"]
                },
                paramId:res.data[0].paramId
            };
            self.emailStatus = angular.copy(self.mail.isUse);
        }else{
            self.mail.smtp.port=25;
            self.hasAddEmail = false;
        }
    });

    self.isSaveConnection = function(auth) {
        auth?self.mail.smtp.port=465:self.mail.smtp.port=25;
    }

    self.saveMailServer = function(mail,mailSrvForm) {
        self.submitValid =false;
        if(mailSrvForm.$valid && !self.canSubmit){
            self.canSubmit = true;
            let data={
                "mail.host":mail.host,
                "mail.username":mail.username,
                "mail.password":mail.password,
                "mail.isUse":mail.isUse,
                "mail.smtp.auth":mail.smtp.auth,
                "mail.smtp.sender":mail.smtp.sender,
                "mail.smtp.port":mail.smtp.port
            };
            data=JSON.stringify(data);
            let option={
                "enterpriseUid":localStorage.enterpriseUid,
                "paramValue":data,
                "paramName":"mailserver",
                "parentId":27,
                "regionUid":0
            };
            switch (self.hasAddEmail){
                case true:
                    option.paramId = self.mail.paramId;
                    mailServerSrv.editData(option,context.initSetting_headers).then(function(result){
                        if(result && result.status == "0") {
                            self.emailStatus = angular.copy(self.mail.isUse);
                        }else {
                            self.mail.isUse = !self.mail.isUse;
                        }
                    }).finally(function(){
                        self.canSubmit=false;
                    })
                    break;
                case false:
                    option.paramLevel = 2;
                    option.paramDesc = "邮件服务器配置";
                    option.regionKey = 0;
                    mailServerSrv.addData(option,context.initSetting_headers).then(function(res){
                        if(res && res.status == "0"){
                            self.hasAddEmail = true;
                            self.emailStatus = angular.copy(self.mail.isUse);
                            self.mail.paramId = res.data.paramId;
                        }else {
                            self.mail.isUse = !self.mail.isUse;
                        }

                    }).finally(function(){
                        self.canSubmit=false;
                    })
                    break;
            }
        }else{
            self.submitValid = true;
            self.mail.isUse = !self.mail.isUse;
        }
    };

    //微信
    self.weChat = {
        app_id: "",
        app_secret: "",
        url: "",
        token: "",
        encoding_aes_key: "",
        encryption: "aes",
        isUse: false
    };
    self.canSubmitWeChat = false;
    self.submitValidWeChat = false;

    getWeChatData();
    function getWeChatData() {
        weChatAlarmSrv.getWeChatData(context.initSetting_headers).then(function(res) {
            if(res && res.data && angular.isArray(res.data) && res.data.length !=0) {
                self.hasAddWeChat = true;
                var weChatData=JSON.parse(res.data[0].paramValue);
                var weChatPassword=weChatData["weixin.app_secret"].split(",").map(item=>{return String.fromCharCode(item)}).join("");
                self.weChat = {
                    app_id: weChatData["weixin.app_id"],
                    //app_secret: weChatData["weixin.app_secret"],
                    app_secret: weChatPassword,
                    url: weChatData["weixin.url"],
                    token: weChatData["weixin.token"],
                    encoding_aes_key: weChatData["weixin.encoding_aes_key"],
                    encryption: weChatData["weixin.encryption"],
                    isUse: weChatData["weixin.isUse"] == "1" ? true : false
                };
                self.paramId = res.data[0].paramId;
                self.weChatStatus = angular.copy(self.weChat.isUse);
            }else {
                self.hasAddWeChat = false;
            }
        });
    }

    self.saveWeChat = function(weChat, weChatAlarmForm) {
        if(weChatAlarmForm.$valid && !self.canSubmitWeChat){
            self.canSubmitWeChat = true;
            let data = {
                "weixin.enterprise_id": localStorage.enterpriseUid,
                "weixin.region_key": 0,
                "weixin.app_id": weChat.app_id,
                "weixin.app_secret": weChat.app_secret,
                "weixin.url": weChat.url,
                "weixin.token": weChat.token,
                "weixin.encoding_aes_key": weChat.encoding_aes_key,
                "weixin.encryption": weChat.encryption,
                "weixin.isUse": weChat.isUse == true ? "1" : "0"
            };
            data = JSON.stringify(data);
            let option={
                "enterpriseUid": localStorage.enterpriseUid,
                "paramValue": data,
                "paramName": "wechatserver",
                "parentId": 800,
                "regionUid": 0
            };
            switch (self.hasAddWeChat){
                case true:
                    option.paramId = self.paramId;
                    weChatAlarmSrv.editData(option,context.initSetting_headers).then(function(res) {
                        if(res && res.status == "0"){
                            self.weChatStatus = angular.copy(self.weChat.isUse);
                            checkWeChat(weChat);
                        }else {
                            self.weChat.isUse = !self.weChat.isUse;
                        }
                    }).finally(function(res) {
                        self.canSubmitWeChat = false;
                    });
                    break;
                case false:
                    option.paramLevel = 2;
                    option.paramDesc = "微信配置";
                    option.regionKey = 0;
                    weChatAlarmSrv.addData(option,context.initSetting_headers).then(function(res) {
                        if(res && res.status == "0"){
                            self.hasAddWeChat = true;
                            self.weChatStatus = angular.copy(self.weChat.isUse);
                            self.paramId = res.data.paramId;
                            checkWeChat(weChat);
                        }else {
                            self.weChat.isUse = !self.weChat.isUse;
                        }
                    }).finally(function() {
                        self.canSubmitWeChat = false;
                    });
                    break;
            }
        }else{
            self.submitValidWeChat = true;
            self.weChat.isUse = !self.weChat.isUse;
        }
    };

    // 微信信息保存后校验是否设置成功
    function checkWeChat(weChat) {
        let data = {
            "weixin.enterprise_id": localStorage.enterpriseUid,
            "weixin.region_key": 0,
            "weixin.app_id": weChat.app_id,
            "weixin.app_secret": weChat.app_secret,
            "weixin.isUse": "0"
        };
        data = JSON.stringify(data);
        let option={
            "enterpriseUid": localStorage.enterpriseUid,
            "paramValue": data,
            "paramName": "wechatserver",
            "parentId": 800,
            "regionUid": 0,
            "paramId": self.paramId
        };
        weChatAlarmSrv.weChatProxyInit(option).then(function(res) {
            if(res && res.status == "0") {
                var msg = $translate.instant("aws.system.weChatAlarm.saveSuccess");
                alertSrv.set("", msg, "success", 5000);
            }else {
                getWeChatData();
                self.weChatStatus = false;
            }
        });
    }

    //添加告警联系人
    self.delContacts = [];
    self.repeatEmailOrPhone="";
    self.submitted = {};
    self.interacted = function(field,index) {
        self.field_form = field;
        return  field.name.$dirty || field["email_"+index].$dirty || field["phone_"+index].$dirty;
    };

    self.existedNamesList = [];
    contactGroupSrv.getContactGroup(context.initSetting_headers).then(function(result){
        if(result && result.data.data){
            var groups_data = result.data.data;
            self.existedNamesList = [];
            _.each(groups_data,function(item){
              self.existedNamesList.push(item.name);  
            });
        }
    });

    function checkSubmitted(formField){
        if(formField.name.$invalid){
            self.submitted.name = true;
        }
        for(var i=0;i<self.contactGroupForm.email.length;i++){
            if(formField["email_"+i].$invalid){
                self.submitted["email_"+i] = true;
            }
        }
        for(var i=0;i<self.contactGroupForm.phone.length;i++){
            if(formField["phone_"+i].$invalid){
                self.submitted["phone_"+i] = true;
            }
        }
        for(var i=0;i<self.contactGroupForm.wechat.length;i++){
            if(formField["wechat_"+i].$invalid){
                self.submitted["wechat_"+i] = true;
            }
        }
    }

    self.contactGroupForm = {
        name:"",
        email:[{
            type:"email",
            value:""
        }],
        phone:[{
            type:"phone",
            value:""
        }],
        wechat:[{
            type:"wechat",
            value:"",
            check: $translate.instant("aws.monitor.alarmModule.checkNickName"),
            disable: false
        }]
    };

    self.addContactToGroup = function(type){
        self.contactGroupForm[type].push({
            type: type,
            value: ""
        });
    };
    self.addWechatToGroup = function() {
        self.contactGroupForm['wechat'].push({
            type: "wechat",
            value: "",
            check: $translate.instant("aws.monitor.alarmModule.checkNickName"),
            disable: false
        });
    };
    self.delContactOfGroup = function(index,contact,type){
        if(contact.id){
            delContacts.push(contact.id);
        }
        self.contactGroupForm[type].splice(index,1);
    };

    self.$on("contractGroupError", function(e, v) {
        if (v == "repeatEmailOrPhone") {
            self.contractGroupError = 1;
        }
    });

    self.weChatBind = function() {
        $uibModal.open({
            animation: true,
            templateUrl: "js/monitor/alarmManagement/tmpl/QRCode.html",
            controller: "QRCodeCrtl",
            resolve:{
                context:function(){
                    return self;
                }
            }
        });
    }

    self.checkNickname = function(index, wechat, type) {
        if(wechat.disable) {
            self.contactGroupForm.wechat[index].value = "";
            self.contactGroupForm.wechat[index].check = $translate.instant("aws.monitor.alarmModule.checkNickName");
            self.contactGroupForm.wechat[index].disable = false;
        }else {
            var wechatName = angular.copy(wechat.value);
            var wechatIndex = angular.copy(index);
            self.nicknameModal = $uibModal.open({
                animation: true,
                templateUrl: "js/monitor/alarmManagement/tmpl/nicknameCheck.html",
                controller: "nicknameCheckCtrl",
                resolve: {
                    wechatName: function() {
                        return wechatName;
                    },
                    wechatIndex: function() {
                        return wechatIndex;
                    },
                    setWechatInfo: function() {
                        return setWechatInfo;
                    }
                }
            });
        }
    }

    function setWechatInfo(index, wechatData) {
        self.contactGroupForm.wechat[index].value = wechatData;
        self.contactGroupForm.wechat[index].check = $translate.instant("aws.monitor.alarmModule.cancelCheck");
        self.contactGroupForm.wechat[index].disable = true;
    }

    self.contactGroupConfirm = function() {
        if(self.createContactGroupForm.$valid){
            self.contactGroupForm.wechat.map(item => {
                if(!item.disable) {
                    item.value = "";
                }
            });
            self.contactGroupForm.contacts = self.contactGroupForm.email.concat(self.contactGroupForm.phone).concat(self.contactGroupForm.wechat);
            if(self.weChatStatus) {
                self.contactGroupForm.alarmAction = "wechat";
            }else {
                self.contactGroupForm.alarmAction = "email";
            }
            contactGroupSrv.initAddContactGroup(self.contactGroupForm,context.initSetting_headers).then(function(result) {
                context.getSettingStatus();
            });
            //license不显示存储，告警设置后直接关掉
            if(!context.canSetInitStorage){
               context.closeInitModel();
            }
        }else{
            checkSubmitted(self.createContactGroupForm);
        }
    };
    initSettingSrv.context.contactGroupConfirm = self.contactGroupConfirm;


}]);