angular.module("auth", ['wsModule'])
    .controller("loginCtrl", ["$rootScope", "$scope","$http", "$location",'$timeout','$window',"bobMesSrv","commonFuncSrv","$translate","NOPROJECTMENU","localInit","$uibModal","$route",
        function(rootscope, scope,$http, $location,$timeout,$window,bobMesSrv,commonFuncSrv,$translate,NOPROJECTMENU,localInit,$uibModal,$route) {
        var static_url = "http://192.168.138.134:8080/awstack-user/v1";
        var static_url_code="http://192.168.140.126:9080/awstack-user/v1";
        var self = scope;
        self.userName="";
        self.enterpriseUid="";
        self.$USERID="";
        self.userUid="";
        self.checkVerication = function(v){
            if(v&&v.length>=4&&self.verifyKey){
                var codeurl = static_url + "/verifycode";
                $http({
                    url: codeurl,
                    method: 'POST',
                    data:{
                        "X-Verification-Key":self.verifyKey,
                        "userInput":v
                    }
                }).then(function(result) {
                    if(result&&result.data){
                        if(result.data.code=='0'){
                            self.vericationYes = true;
                            self.vericationNo = false;
                        }else if(result.data.code=='01090301'){
                            self.loginError = 9;
                            self.loginCfmed = true; 
                            $timeout(function(){
                                self.loginCfmed = false;
                                self.vericationYes = false;
                                self.getVerificationCode(loginForm);
                                self.loginForm.$setPristine();
                                self.loginForm.$setUntouched();
                            },1000)
                        }else if(result.data.code=='01090302'){
                            self.vericationYes = false;
                            self.vericationNo = true;
                        }
                    }
                })
            }else{
                self.vericationYes = false;
                self.vericationNo = false;
            }
        };


        localInit.clearLocalstorage();
        $window.gradeStatus = true;
        rootscope.effeToken = false;
        rootscope.showNatureStart = false;
        bobMesSrv.closed();
        self.login = {
            selectedEnterpriseId: "",
            username: "",
            password: "",
            enterpriseLoginName: "",
            verificationCode:""
        };
        self.threeTime=false;
        self.tryAgain=false;
        self.loginCfmed = false; //控制错误信息提示以及4秒消失
        self.logining = false;//控制登陆转圈的显示
        self.submitted = false;
        self.loginError = 0;
        self.getVerificationCode=function(loginForm){//获取验证码
            localInit.getVerificationCode(self,loginForm)
        };

        self.getLicenseList = function(result){//获取license
            localInit.getLicenseList(result)
        }
        self.menuInit = function(result){//获取license
            localInit.menuInit(self,result)
        }
        self.interacted = function(field) {
            return self.submitted || field.$dirty;
        };
        self.localstorageInit = function(result){
            localInit.localstorageInit(result,self);//localstorage 初始化
        }
        self.$on("loginerror", function(e, v) {
            if(v=='codeError'||v=="codeInvalid"){
                self.vericationYes=false;
                self.getVerificationCode(loginForm);
                self.loginForm.$setPristine();
                self.loginForm.$setUntouched(); 
            }
            localInit.loginError(self,v);
        });
        self.getVerificationCode(loginForm);
        
        self.submitForm = function(isValid) {
            self.hasResManage=false;
            self.loginCfmed = true;
            self.loginError = "";
            //if (isValid&&self.vericationYes) {
            if (isValid) {
                self.logining = true; 
                var data = {
                    enterpriseLoginName: self.login.enterpriseLoginName?self.login.enterpriseLoginName:"awcloud",
                    userName: self.login.username,
                    password: self.login.password,
                    verificationCode:self.login.verificationCode,
                    verificationKey:self.verifyKey
                };
                $http({
                    method: "POST",
                    url: static_url + "/login",
                    data: data
                }).then(function(result) {
                    if (result) {
                        self.result=result;
                        self.tryAgain=false;
                        self.threeTime=false;
                        if(result.code=="01030706"){
                                self.vericationYes=false;
                                self.vericationNo = false;
                                self.getVerificationCode(loginForm);
                                self.loginForm.$setPristine();
                                self.loginForm.$setUntouched();
                                var loginTime=result.data.data.time;                           
                                var leftLockedTime=Math.floor(loginTime/60)>1;
                                self.showTime=leftLockedTime?(Math.round(loginTime/60)+$translate.instant("aws.auth.minute")):(loginTime+$translate.instant("aws.auth.second"));
                                self.errorTime=result.data.data.loginErrorTimes;                        
                        }else if(result.code=="01030702"){
                            self.vericationYes=false;
                            self.vericationNo = false;
                            self.getVerificationCode(loginForm);
                            self.loginForm.$setPristine();
                            self.loginForm.$setUntouched();
                            if(result.data&&result.data.data&&angular.isObject(result.data.data)){
                                self.hadFailedTime=result.data.data.loginTimes;
                                self.leftFailedTime=result.data.data.loginErrorTimes-result.data.data.loginTimes;
                                var countLockedTime=Math.floor(result.data.data.loginLockedTime/60)>1;
                                self.loginLockedTime=countLockedTime?(Math.round(result.data.data.loginLockedTime/60)+$translate.instant("aws.auth.minute")):(result.data.data.loginLockedTime+$translate.instant("aws.auth.second"));
                                self.loginError1Msg=$translate.instant("aws.auth.hadLoginFailed")+self.hadFailedTime+$translate.instant("aws.auth.times")+"，"+$translate.instant("aws.auth.left")+self.leftFailedTime+$translate.instant("aws.auth.times")+"，"+$translate.instant("aws.auth.userWillLocked")+self.loginLockedTime;
                            }else{
                                self.loginError1Msg=$translate.instant("aws.auth.userorpasswderror");
                            }
                        }else if(result.code==false){
                            showForceModifyPwd(result);
                            rootscope.services = {
                                "backups":localStorage.backupsService,
                                "cinder":localStorage.cinderService,
                                "ceph":localStorage.cephService
                            }
                        }
                    }
                }).finally(function(){
                    self.logining = false; 
                    $timeout(function(){
                       self.loginCfmed = false; 
                    },4000)
                })
            } else {
                self.submitted = true;
            }

        };

        /*token自动登录*/
        function secretFree(){
            self.secretFreeLogin = 1;
            localStorage.removeItem('secretFreeLogin');
            var urlParams = $location.search();
            if(urlParams.from&&urlParams.from=='jiyun'&&urlParams.token){
                self.secretFreeLogin = 2;
                self.hasResManage = false;
                self.loginCfmed = true;
                self.loginError = "";
                self.logining = true; 
                $http({
                    method: "POST",
                    url: static_url + "/back/login/token",
                    headers: {
                        "X-Auth-Token":urlParams.token 
                    }
                }).then(function(result) {
                    if (result) {
                        self.result=result;
                        self.tryAgain=false;
                        self.threeTime=false;
                        if(result.code=="01030706"){
                            self.vericationYes=false;
                            self.vericationNo = false;
                            self.getVerificationCode(loginForm);
                            self.loginForm.$setPristine();
                            self.loginForm.$setUntouched();
                            var loginTime=result.data.data.time;                           
                            var leftLockedTime=Math.floor(loginTime/60)>1;
                            self.showTime=leftLockedTime?(Math.round(loginTime/60)+$translate.instant("aws.auth.minute")):(loginTime+$translate.instant("aws.auth.second"));
                            self.errorTime=result.data.data.loginErrorTimes;                        
                        }else if(result.code=="01030702"){
                            self.vericationYes=false;
                            self.vericationNo = false;
                            self.getVerificationCode(loginForm);
                            self.loginForm.$setPristine();
                            self.loginForm.$setUntouched();
                            if(result.data&&result.data.data&&angular.isObject(result.data.data)){
                                self.hadFailedTime=result.data.data.loginTimes;
                                self.leftFailedTime=result.data.data.loginErrorTimes-result.data.data.loginTimes;
                                var countLockedTime=Math.floor(result.data.data.loginLockedTime/60)>1;
                                self.loginLockedTime=countLockedTime?(Math.round(result.data.data.loginLockedTime/60)+$translate.instant("aws.auth.minute")):(result.data.data.loginLockedTime+$translate.instant("aws.auth.second"));
                                self.loginError1Msg=$translate.instant("aws.auth.hadLoginFailed")+self.hadFailedTime+$translate.instant("aws.auth.times")+"，"+$translate.instant("aws.auth.left")+self.leftFailedTime+$translate.instant("aws.auth.times")+"，"+$translate.instant("aws.auth.userWillLocked")+self.loginLockedTime;
                            }else{
                                self.loginError1Msg=$translate.instant("aws.auth.userorpasswderror");
                            }
                        }else if(result.code==false){
                            showForceModifyPwd(result);
                            localStorage.secretFreeLogin = true;
                            rootscope.services = {
                                "backups":localStorage.backupsService,
                                "cinder":localStorage.cinderService,
                                "ceph":localStorage.cephService
                            }
                        }else if(result.code=="01030701"){
                            self.secretFreeLogin = 3;
                        }
                    }
                }).finally(function(){
                    self.logining = false; 
                    $timeout(function(){
                       self.loginCfmed = false; 
                    },4000)
                })
            }
        }
        secretFree();

        self.forceModifyPwd=function(){
            self.adminPasswordModifyModal = $uibModal.open({
                animation:scope.animationsEnabled,
                templateUrl:"js/commonModal/tmpl/forcePasswordModify.html",
                controller:"forcePasswordModifyCtrl",
                resolve:{
                    context:function(){
                        return self
                    }
                }
            });
        };

        function showForceModifyPwd(result){
            if(result){
                //超级管理员不用修改密码
                if(result&&result.data&&result.data.data&&(result.data.data.managementRole==2)){
                    localStorage.$AWLOGINED = true;
                    self.loginError= 0;
                    self.localstorageInit(result);//localstorage 初始化
                    self.menuInit(result);//处理菜单
                    self.getLicenseList(result)//获取license直接登录进去
                }else{
                    //密码过期开关打开
                    localStorage.pwdLastUpdatedTime = result.data.data.pwdLastUpdatedTime; //密码上次修改的时间
                    localStorage.pwdExpiredDate = result.data.data.pwdExpiredDate; //密码过期时间
                    localStorage.pwdForceModify= result.data.data.pwdForceModify?1:2; //新用户强制修改密码开关
                    localStorage.createTime= result.data.data.createTime;//用户创建时间
                    if(Number(localStorage.pwdExpiredDate)>0){
                        self.pwdLastUpdatedTime=Number(localStorage.pwdLastUpdatedTime);
                        self.deadLineTime=self.pwdLastUpdatedTime+localStorage.pwdExpiredDate*24*60*60*1000;
                        self.nowTime=(new Date()).getTime();
                        self.isShowPasswordExpired=(self.nowTime >= self.deadLineTime)?true:false;
                    }else{
                        self.isShowPasswordExpired=false;
                    }
                    //新用户强制修改密码开关打开
                    if(localStorage.pwdForceModify==1){
                        self.isNewUser=localStorage.createTime==localStorage.pwdLastUpdatedTime?true:false;
                    }else{
                        self.isNewUser=false;
                    }
                    if(self.isShowPasswordExpired||self.isNewUser){
                        self.userName=result.data.data.userName;
                        self.enterpriseUid=result.data.data.enterpriseUid;
                        self.$USERID=result.data.data.id;
                        self.userUid=result.data.data.userUid;
                        self.forceModifyPwd(); 
                    }
                    if(!self.isShowPasswordExpired&&!self.isNewUser){
                       localStorage.$AWLOGINED = true;
                       self.loginError= 0;
                       self.localstorageInit(result);//localstorage 初始化
                       self.menuInit(result);//处理菜单
                       self.getLicenseList(result)//获取license
                    }
                }
            } 
        }
    }])
    .controller("forcePasswordModifyCtrl", ["$scope", "$location","$route", "$translate", "$rootScope","$uibModal", "$http", "$route","$timeout", "departmentDataSrv", "ticketsSrv","commonFuncSrv","context","$translate","localInit","$window",
        function(scope, $location,$route, translate, rootScope,$uibModal, $http, route, $timeout, departmentDataSrv, ticketsSrv,commonFuncSrv,context,$translate,localInit,$window) {
           var self=scope;
           self.isShowPasswordExpired=context.isShowPasswordExpired;
           self.isNewUser=context.isNewUser;
           self.logining=false;
           self.showPasswordExpiredMsg=$translate.instant("aws.auth.pwdExpired")+localStorage.pwdExpiredDate+$translate.instant("aws.auth.day")+$translate.instant("aws.auth.updatePwd");
           self.newUserToModifyPwd=$translate.instant("aws.system.modifyPassword.newUserToModifyPwd");
           self.modifySuccessMsg=$translate.instant("aws.system.modifyPassword.modifyPwdSuccess");
           self.modify={
                newPassword:"",
                confirmPassword:""
           };
           self.forceModifyPwd=function(modify,pwdModify){
              self.submitValid=false;
              if(pwdModify.$valid&&!self.click){
                  self.logining=true;
                  self.click=true;
                  var data={
                        "userName":context.userName,
                        "newPwd":modify.newPassword,
                        "enterpriseUid":context.enterpriseUid,
                        "userId":context.$USERID,
                        "userUid":context.userUid
                  };
                  self.isRotate=true;
                  $http({
                    method:"PUT",
                    url:"awstack-user/v1/enterprises/force/modify",
                    data:data
                  }).then(function(result){                      
                    if(result.code==0){
                        //修改成功关闭修改弹出框，重新进行登录
                        self.isRotate=false;
                        self.modifySuccess=true;
                        $timeout(function(){
                            context.adminPasswordModifyModal.close();
                            $route.reload();
                        },500);
                    }
                  }).finally(function(){
                       self.logining=false;
                       $timeout(function(){
                            self.click=false;
                       },3000);
                  });
              }else{
                 self.submitValid=true;
              }
           }
           context.$on("modifyerror", function(e, v) {
                //旧密码错误
                if (v == "prePasswordError") {
                    self.isRotate=false;
                    self.modifyError = 1;
                    $timeout(function(){
                        self.modifyError ="";
                    },2500);
                    self.canModifyAfterSuccess=false;
                    self.confirmTwice=true;
                }
                //密码修改错误
                if (v == "modifyError") {
                    self.isRotate=false;
                    self.modifyError = 2;
                    $timeout(function(){
                        self.modifyError ="";
                    },2500);
                    self.canModifyAfterSuccess=false;
                    self.confirmTwice=true;
                }
                if (v == "modifyFrequent") {
                    self.isRotate=false;
                    self.modifyError = 3;
                    $timeout(function(){
                        self.modifyError ="";
                    },2500);
                    self.canModifyAfterSuccess=false;
                }
                if (v == "keystoneError") {
                    self.isRotate=false;
                    self.modifyError = 4;
                    $timeout(function(){
                        self.modifyError ="";
                    },2500);
                    self.canModifyAfterSuccess=false;
                }
                if (v == "preventError") {
                    self.isRotate=false;
                    self.modifyError = 5;
                    $timeout(function(){
                        self.modifyError ="";
                    },2500);
                    self.canModifyAfterSuccess=false;
                }
                if (v == "sameWithPrePwd") {
                    self.isRotate=false;
                    self.modifyError = 6;
                    $timeout(function(){
                        self.modifyError ="";
                    },2500);
                    self.canModifyAfterSuccess=false;
                }
            });
        }   
    ]);
