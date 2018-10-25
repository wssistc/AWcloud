import "./alarmSettingInitSrv";

var alarmSettingInitModule = angular.module("alarmSettingInitModule", ["alarmSettingInitSrvModule"]);

alarmSettingInitModule.controller("alarmSettingInitCtrl", ["$scope", "$rootScope", "$translate", "$uibModal", "$uibModalInstance", "alarmSettingInitSrv",
    "contactGroupSrv", "alarmSettingSrv", function($scope, $rootScope, $translate, $uibModal, $uibModalInstance, alarmSettingInitSrv, contactGroupSrv,
    alarmSettingSrv) {
    var self = $scope;
    self.submitValid = false;
    self.inStepOne = true;
    self.inStepTwo = false;
    self.inStepOneBar = true;
    self.inStepTwoBar = false;

    //第一步到第二步
    self.stepToTwo = function(items) {
        self.inStepOne = false;
        self.inStepTwo = true;
        self.inStepTwoBar = true;
    }
    //第二步到第一步
    self.stepToOne = function() {
        self.inStepOne = true;
        self.inStepTwo = false;
        self.inStepTwoBar = false;
    }

    var delContacts = [];
    self.repeatEmailOrPhone="";
    self.submitted = {};
    self.interacted = function(field,index) {
        self.field_form = field;
        return  field.name.$dirty || field["email_"+index].$dirty || field["phone_"+index].$dirty;
    };

    function checkSubmitted(formField){
        if(formField.name.$invalid){
            scope.submitted.name = true;
        }
        for(var i=0;i<scope.contactGroupForm.email.length;i++){
            if(formField["email_"+i].$invalid){
                scope.submitted["email_"+i] = true;
            }
        }
        for(var i=0;i<scope.contactGroupForm.phone.length;i++){
            if(formField["phone_"+i].$invalid){
                scope.submitted["phone_"+i] = true;
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
        wechat:[]
    };

    self.addContactToGroup = function(type) {
        self.contactGroupForm[type].push({
            type: type,
            value: ""
        });
    };
    self.delContactOfGroup = function(index,contact,type) {
        if(contact.id) {
            delContacts.push(contact.id);
        }
        self.contactGroupForm[type].splice(index,1);
    };

    function contactGroupConfirm(formField) {
        if(formField.$valid){
            self.contactGroupForm.contacts = self.contactGroupForm.email.concat(self.contactGroupForm.phone).concat(self.contactGroupForm.wechat);
            contactGroupSrv.addContactGroup(self.contactGroupForm).then(function() {

            });
        }else{
            checkSubmitted(formField);
        }
    };

    self.$on("wechatUserInfo", function(e, data) {
        if(self.contactGroupForm.wechat.length < 10) {
            self.contactGroupForm.weChat.push({
                type: "wechat",
                value: data.meta
            });
        }
        self.QRModal.close();
    });

    self.weChatBind = function() {
        self.QRModal = $uibModal.open({
            animation: true,
            templateUrl: "QRCode.html",
            controller: "QRCodeCrtl"
        });
    }

    self.$on("contractGroupError", function(e, v) {
        if (v == "repeatEmailOrPhone") {
            self.contractGroupError = 1;
        }
    });

    self.alarmForm = {
        alarmList: [],
        contactlists: []
    }
    self.submitAlarmValid = false;

    //获取告警
    alarmSettingSrv.getAlarmSettings().then(function(result){
        if (result && result.data) {
            self.alarms = {
                options: result.data
            };
            self.alarmForm.alarmList = result.data;
            setFieldFun(self.alarms.options, "contact");
        }
    });

    //获取联系人组
    contactGroupSrv.getContactGroup().then(function(result){
        if (result && result.data) {
            self.contacts = {
                options: result.data.data
            };
            self.alarmForm.contactlists = result.data.data;
            setFieldFun(self.contacts.options, "contact");
        }
    });

    function setFieldFun(option,field) {
        if(option.length > 0) {
            switch(field) {
            case "res":
                self.labelsPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.choseRes");
                break;
            case "contact":
                self.contactPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.choseContactGroup");
                break;
            }
        }else {
            switch(field) {
            case "res":
                self.labelsPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.noResToChose");
                break;
            case "contact":
                self.contactPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.noContactToChose");
                break;
            }
        }
    }

}]);