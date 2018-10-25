import "./contractGroupSrv";

var contactGroupModule = angular.module("contactGroupModule", ["ngTable", "ngAnimate", "ui.bootstrap", "contactGroupSrvModule", "ngMessages"]);

contactGroupModule.controller("contactGroupCtrl", function($scope, $rootScope, NgTableParams, contactGroupSrv, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG) {
    var self = $scope;
    
    self.headers = {
        "contactGroup": $translate.instant("aws.monitor.alarmModule.contactGroup"),
        "email": $translate.instant("aws.monitor.alarmModule.email"),
        "phone": $translate.instant("aws.monitor.alarmModule.phone"),
        "wechat": $translate.instant("aws.monitor.alarmModule.weChat"),
        "operate": $translate.instant("aws.monitor.alarmModule.operate")
    };

    var groups_data = [];
    var initContactGroupTable = function(){
        self.existedNamesList = [];
        contactGroupSrv.getContactGroup().then(function(result){
            result.data?self.loadData = true:"";
            if(result && result.data.data){
                groups_data = result.data.data;
                self.existedNamesList = self.existedNamesList.splice(self.existedNamesList.length,0);
                _.each(groups_data,function(item){
                  self.existedNamesList.push(item.name);
                  let emails_str = "" ,phones_str = "",wechats_str = ""
                  if(item.emails.length>0){
                    item.emails.forEach(function(item){
                        emails_str += item.value
                    })
                  }
                  if(item.phones.length>0){
                    item.phones.forEach(function(item){
                        phones_str += item.value
                    })
                  }
                  if(item.wechats.length>0){
                    item.wechats.forEach(function(item){
                        wechats_str += item.value
                    })
                  }
                  item.searchTerm = [item.name,emails_str,phones_str,wechats_str].join("\b")  
                });
                self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:groups_data });
                var tableId = "id";
                checkedSrv.checkDo(self,result.data, tableId);
            }
        });
    };
    initContactGroupTable();

    self.$watch(function(){
        return self.checkedItems;
    },function(value){
        if(!value){
            self.isDisabled = true;
            self.delisDisabled = true;
        }
    });

    self.refreshContactGroup = function(){
        self.globalSearchTerm = "";
        initContactGroupTable();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.tableParams.filter({ searchTerm: term });
    };

    //获取某个联系人组的联系人明细
    self.getContactsOfGroup = function(id,hideContacts){
        if(!hideContacts){
            contactGroupSrv.getContactsOfGroup(id).then(function(result){
                groups_data = _.map(groups_data,function(item){
                    if(item.id == id){
                        item.contacts = result.data;
                    }
                    return item;
                });
            });
        }
    };

    //新建、编辑联系人组
    self.contactGroup = function(type,editData){
        var scope = self.$new();
        var contactGroupModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"contactGroup.html",
            scope:scope
        });
        var delContacts = [];
        self.repeatEmailOrPhone="";
        scope.submitted = {};
        scope.interacted = function(field,index){
            scope.field_form = field;
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
            for(var i=0;i<scope.contactGroupForm.wechat.length;i++){
                if(formField["wechat_"+i].$invalid){
                    scope.submitted["wechat_"+i] = true;
                }
            }
        }
        scope.addContactToGroup = function(type){
            scope.contactGroupForm[type].push({
                type: type,
                value: ""
            });
        };
        scope.addWechatToGroup = function() {
            scope.contactGroupForm['wechat'].push({
                type: "wechat",
                value: "",
                check: $translate.instant("aws.monitor.alarmModule.checkNickName"),
                disable: false
            });
        };
        scope.delContactOfGroup = function(index,contact,type){
            if(contact.id){
                delContacts.push(contact.id);
            }
            scope.contactGroupForm[type].splice(index,1);
        };

        // self.$on("wechatUserInfo", function(e, data) {
        //     if(scope.contactGroupForm.wechat.length < 10) {
        //         scope.contactGroupForm.weChat.push({
        //             type: "wechat",
        //             value: data.meta
        //         });
        //     }
        //     scope.QRModal.close();
        // });
        scope.weChatBind = function() {
            scope.QRModal = $uibModal.open({
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

        scope.checkNickname = function(index, wechat, type) {
            if(wechat.disable) {
                scope.contactGroupForm.wechat[index].value = "";
                scope.contactGroupForm.wechat[index].check = $translate.instant("aws.monitor.alarmModule.checkNickName");
                scope.contactGroupForm.wechat[index].disable = false;
            }else {
                var wechatName = angular.copy(wechat.value);
                var wechatIndex = angular.copy(index);
                scope.nicknameModal = $uibModal.open({
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
            scope.contactGroupForm.wechat[index].value = wechatData;
            scope.contactGroupForm.wechat[index].check = $translate.instant("aws.monitor.alarmModule.cancelCheck");
            scope.contactGroupForm.wechat[index].disable = true;
        }

        switch(type){
        case "new":
            scope.groupModalTitle =  $translate.instant("aws.monitor.alarmModule.newCreatContactGroup");
            scope.contactGroupForm = {
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
            scope.contactGroupConfirm = function(formField){
                if(formField.$valid){
                    scope.contactGroupForm.wechat.map(item => {
                        if(!item.disable) {
                            item.value = "";
                        }
                    });
                    scope.contactGroupForm.contacts = scope.contactGroupForm.email.concat(scope.contactGroupForm.phone).concat(scope.contactGroupForm.wechat);
                    contactGroupSrv.addContactGroup(scope.contactGroupForm).then(function(){
                        contactGroupModal.close();
                        initContactGroupTable();
                    });
                }else{
                    checkSubmitted(formField);
                }
            };
            break;

        case "edit":
            scope.groupModalTitle = $translate.instant("aws.monitor.alarmModule.editContactGroup");
            contactGroupSrv.getOneContactGroup(editData.id).then(function(result){
                return result.data;
            }).then(function(data){
                scope.contactGroupForm = data.data;
                scope.contactGroupForm.email = [];
                scope.contactGroupForm.phone = [];
                scope.contactGroupForm.wechat = [];
                scope.contactGroupForm.contacts.forEach(function(item, index) {
                    if(item.type == "email") {
                        scope.contactGroupForm.email.push(scope.contactGroupForm.contacts[index]);
                    }else if(item.type == "phone"){
                        scope.contactGroupForm.phone.push(scope.contactGroupForm.contacts[index]);
                    }else if(item.type == "wechat"){
                        var obj = scope.contactGroupForm.contacts[index];
                        if(obj.value) {
                            obj.check = $translate.instant("aws.monitor.alarmModule.cancelCheck");
                            obj.disable = true;
                        }else {
                            obj.check = $translate.instant("aws.monitor.alarmModule.checkNickName"),
                            obj.disable = false;
                        }
                        scope.contactGroupForm.wechat.push(obj);
                    }
                });
            });
            scope.contactGroupConfirm = function(formField){
                scope.contactGroupForm.wechat.map(item => {
                    if(!item.disable) {
                        item.value = "";
                    }
                });
                scope.contactGroupForm.contacts = scope.contactGroupForm.email.concat(scope.contactGroupForm.phone).concat(scope.contactGroupForm.wechat);
                var params = {
                    id:editData.id,
                    data:{
                        name:scope.contactGroupForm.name,
                        contacts:scope.contactGroupForm.contacts,
                        delContacts:delContacts
                    }
                };
                //每个控件输入值有效
                if(formField.$valid){
                    contactGroupSrv.editContactGroup(params).then(function(result){
                        if(result.code!="03012902"){
                            self.repeatEmailOrPhone="";
                            contactGroupSrv.getOneContactGroup(editData.id).then(function(result){
                                return result.data;
                            }).then(function(data){
                                scope.contactGroupForm.contacts = data.data.contacts;
                                groups_data = _.map(groups_data,function(item){
                                if(item.id == params.id){
                                    item.name = scope.contactGroupForm.name;
                                    item.contacts = scope.contactGroupForm.contacts;
                                }
                                return item;
                                });
                                self.existedNamesList = [];
                                _.each(groups_data,function(item){
                                  self.existedNamesList.push(item.name);  
                                });
                                contactGroupModal.close();
                                initContactGroupTable();
                            });
                        }else{
                            self.repeatEmailOrPhone=true;
                        }
                    });
                }else{
                    checkSubmitted(formField);
                }
            };
            break;
        }
    };
    self.$on("contractGroupError", function(e, v) {
            if (v == "repeatEmailOrPhone") {
                self.contractGroupError = 1;
            }
    });
    //删除联系人组
    self.delContactGroup = function(checkedItems){
        var content = {
            target:"delContactGroup",
            msg:"<span>"+$translate.instant("aws.monitor.alarmModule.delContactGroup")+"</sapn>",
            data:checkedItems
        };
        self.$emit("delete",content);
    };
    self.$on("delContactGroup",function(e,data){
        var ids = [];
        _.each(data,function(item){
            ids.push(item.id);
        });
        contactGroupSrv.delContactGroup({"ids":ids}).then(function(){
            initContactGroupTable();
        });
    });
    
    //编辑联系人
    self.editContact = function(contact){
        self.repeatEmailOrPhone="";
        var scope = self.$new();
        var editContactModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"editContact.html",
            scope:scope
        });

        scope.submited = false;
        scope.interacted = function(field){
            return scope.submited || field.$dirty;
        };

        scope.editContactForm = {
            email:contact.email,
            phone:contact.phone
        };

        scope.contactConfirm = function(contactForm){
            if(contactForm.$valid){
                var params = {
                    id:contact.id,
                    data:{
                        email:scope.editContactForm.email,
                        phone:scope.editContactForm.phone
                    }
                };
                contactGroupSrv.editContact(params).then(function(result){
                    if(result.code!="03012902"){
                        self.repeatEmailOrPhone="";
                        groups_data = _.map(groups_data,function(item){
                            if(item.contacts){
                                _.each(item.contacts,function(val,i){
                                    if(val.id == contact.id){
                                        item.contacts[i].email = scope.editContactForm.email;
                                        item.contacts[i].phone = scope.editContactForm.phone;
                                    }
                                });
                            }
                            return item;
                        });
                        editContactModal.close();
                    }else{
                        self.repeatEmailOrPhone=true;
                    }
                });
            }else{
                scope.submited = true;
            }
        };
    };

    //删除联系人
    self.deleteContact = function(contact){
        var content = {
            target:"delContact",
            msg:"<span>"+$translate.instant("aws.monitor.alarmModule.delContact")+"</sapn>",
            data:contact
        };
        self.$emit("delete",content);
    };
    self.$on("delContact",function(e,data){
        contactGroupSrv.delContact(data.id).then(function(){
            groups_data = _.map(groups_data,function(item){
                if(item.contacts){
                    _.remove(item.contacts,function(val){
                        return val.id == data.id; 
                    });
                }
                return item;
            });
        });
    });
})

contactGroupModule.controller("QRCodeCrtl", ["$scope", "$translate", "weChatAlarmSrv", function($scope, $translate, weChatAlarmSrv) {
    var self = $scope;
    var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
    self.QRCodeImg = GLOBALCONFIG.APIHOST.MONITOR + "/v1/wechat/qrcode/" + enterpriseUid;
    weChatAlarmSrv.getWeChatData().then(function(res) {
        if(res && res.data && angular.isArray(res.data) && res.data.length != 0) {
            var weChatData = JSON.parse(res.data[0].paramValue);
            var isUse = weChatData["weixin.isUse"];
            if(isUse == "1") {
                self.hasBindWechat = 1;
                self.modalTitle = $translate.instant("aws.monitor.alarmModule.addWeChatContact");
            }else {
                $scope.hasBindWechat = 0;
                self.modalTitle = $translate.instant("aws.common.prompts");
            }
        }else {
            $scope.hasBindWechat = 0;
            self.modalTitle = $translate.instant("aws.common.prompts");
        }
    });
}]);


contactGroupModule.controller("nicknameCheckCtrl", ["$scope", "$uibModalInstance", "wechatName", "wechatIndex", "setWechatInfo", "contactGroupSrv",
    "$translate", function($scope, $uibModalInstance, wechatName, wechatIndex, setWechatInfo, contactGroupSrv, $translate) {
    var self = $scope;
    self.wechat = {
        openId: ""
    }
    self.wechatInfoList = [];
    var wechatName = encodeURI(wechatName);
    if(wechatName) {
        self.nicknameTips = $translate.instant("aws.common.loading");
        contactGroupSrv.getWechatName(wechatName).then(function(result) {
            self.nicknameTips = $translate.instant("aws.common.noData");
            if(result && result.data && angular.isArray(result.data)) {
                self.wechatInfoList = result.data;
                self.wechat.openId = result.data[0] && result.data[0].openId || "";
            }
        });
    }else {
        self.nicknameTips = $translate.instant("aws.common.noData");
    }
        
    self.checkConfirm = function() {
        if(self.wechat.openId) {
            var wechatData;
             self.wechatInfoList.map(item => {
                if(item.openId == self.wechat.openId) {
                    wechatData = item.nickName + "[" + item.openId + "]";
                }
             });
             setWechatInfo(wechatIndex, wechatData);
        }
        $uibModalInstance.close();
    }
}]);