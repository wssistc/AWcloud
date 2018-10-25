import "ip";
import { zh_CN } from "./i18n/zh_CN";
import { en_US } from "./i18n/en_US";
import * as steponeCtrl from "./controllers/steponeCtrl";
import * as steptwoCtrl from "./controllers/steptwoCtrl";
import * as stepthreeCtrl from "./controllers/stepthreeCtrl";
import * as stepfourCtrl from "./controllers/stepfourCtrl";
import * as disksCtrl from "./controllers/disksCtrl";
import * as cardCtrl from "./controllers/cardCtrl";
angular.module("app", ["ngRoute", "pascalprecht.translate","ngMessages", "ui.bootstrap","ui.bootstrap.tpls", "ngSanitize","ui.select","ngTable"])
    .constant("API_HOST", GLOBALCONFIG.APIHOST)
    .config(["$routeProvider", "$locationProvider", "$httpProvider", "$translateProvider",
        function($routeProvider, $locationProvider, $httpProvider, $translateProvider) {
            $translateProvider.translations("en", en_US);
            $translateProvider.translations("zh", zh_CN);
            $translateProvider.preferredLanguage("zh");
            $httpProvider.interceptors.push([
                "$q", "$rootScope", "API_HOST","$location",
                function(q, $rootScope, api_host,$location) {
                    return {
                        request: function(config) {
                            if (config.url.indexOf("awstack-user") > -1) {
                                var user_url = config.url.split("awstack-user");
                                config.url = api_host.BASE + user_url[1];
                            }
                            var auth_token = localStorage.$REG_AUTH_TOKEN;
                            config.headers["X-Auth-Token"] = auth_token;
                            return config;
                        },
                        response: function(res) {
                            if (res.data.code === "00010101" || res.data.code === "00010105") {
                                $location.path("/").replace();
                            }
                            return res;
                        },
                        requestErr: function(rej) {
                            return rej;
                        },
                        responseErr: function(rej) {
                            return rej;
                        }
                    };
                }
            ]);
            $routeProvider
                .when("/info/cards", {
                    templateUrl: "/js/register/tmpl/cardconfigure.html",
                    controller: "cardCtrl",
                    reloadOnSearch: false
                })
                .when("/info/disks", {
                    templateUrl: "/js/register/tmpl/disksconfigure.html",
                    controller: "disksCtrl",
                    reloadOnSearch: false
                })
                .when("/info/stepone", {
                    templateUrl: "/js/register/tmpl/stepone.html",
                    controller: "steponeCtrl",
                    reloadOnSearch: false
                })
                .when("/info/steptwo", {
                    templateUrl: "/js/register/tmpl/steptwo.html",
                    controller: "steptwoCtrl",
                    reloadOnSearch: false
                })
                .when("/info/stepthree", {
                    templateUrl: "/js/register/tmpl/stepthree.html",
                    controller: "stepthreeCtrl",
                    reloadOnSearch: false
                })
                .when("/info/stepfour", {
                    templateUrl: "/js/register/tmpl/stepfour.html",
                    controller: "stepfourCtrl",
                    reloadOnSearch: false
                })
                .when("/", {
                    templateUrl: "/js/register/tmpl/login.html",
                    controller: "loginCtrl"
                })
                .when("/register", {
                    templateUrl: "/js/register/tmpl/registered.html",
                    controller: "registerCtrl"
                })
                .when("/forgetpass", {
                    templateUrl: "/js/register/tmpl/forgetpass.html",
                    controller: "passresetCtrl"
                })
                .when("/resetpass", {
                    templateUrl: "/js/register/tmpl/passreset.html",
                    controller: "passresetCtrl"
                })
                .when("/complete", {
                    templateUrl: "/js/register/tmpl/complete.html",
                    controller: "completeCtrl"
                })
                    .otherwise({ redirectTo: "/" });
        }
    ])
    .filter("unitFilter", function() {
        return function(v) {
            return Number(v) / 1024;
        };
    })
    .controller("infoCtrl", [function() {
        console.log("info");
    }])
    .config(["$controllerProvider", function($controllerProvider){
        $controllerProvider.register(steponeCtrl);
        $controllerProvider.register(steptwoCtrl);
        $controllerProvider.register(stepthreeCtrl);
        $controllerProvider.register(stepfourCtrl);
        $controllerProvider.register(disksCtrl);
        $controllerProvider.register(cardCtrl);
    }])
    .controller("loginCtrl", ["$scope", "$http","$location",function($scope, $http,$location) {
        var self = $scope;
        self.lgError = false;
        localStorage.clear()
        //localStorage.removeItem("INSTALLSTATUS");
        self.login = function(data) {
            if (self.loginForm.$valid) {
                $http({
                    method: "POST",
                    url: "awstack-user/v1/enterprises/signin",
                    data: data
                }).success(function(res, status, headers) {
                    if (res.code === "0") {
                        var component = "";
                        if(res.data.data.component){
                            component = Object.keys(res.data.data.component).length>0?res.data.data.component:"";
                        }
                        self.lgError = false;
                        localStorage.$AWCONFLOGINED = true;
                        localStorage.$REG_AUTH_TOKEN = headers("X-Auth-Token");
                        var loginData = JSON.stringify(res.data.data);
                        localStorage.setItem("LOGINS", loginData);
                        localStorage.setItem("INSTALLSTATUS", res.data.data.status);
                        localStorage.setItem("COMPONENT", JSON.stringify(component));
                        localStorage.removeItem("LISTS");
                        localStorage.removeItem("ACCOUNT");
                        localStorage.removeItem("USEDLIST");
                        localStorage.removeItem("HOSTNAMELIST");
                        localStorage.removeItem("TWOFORM");
                        localStorage.removeItem("THREEFORM");
                        if (res.data.data.status==1 || res.data.data.status==2 || res.data.data.status==3) {
                            $location.path("/complete").replace();
                        } else{
                            $location.path("/info/stepone").replace();
                        }
                    } else {
                        self.lgError = true;
                    }
                });
            }
        };
    }])
    .controller("registerCtrl", ["$scope", "$http","regsrv", function($scope, $http,regsrv) {
        var self = $scope;
        self.isError = false;
        self.isregSuccess = false;
        self.reg = {};
        self.isexist = false;
        self.regsub = function(reg) {
            self.isError = false;
            self.isregSuccess = false;
            if (self.regForm.$valid) {
                self.isRegLoading = true;
                regsrv.signup(reg).then(function(res) {
                    self.idExist = false;
                    self.isError = false;
                    if (res&&res.data&&res.data.code === "0") {
                        self.regData = res.data.data.data;
                        /*var signData = JSON.stringify(res.data.data);
                        localStorage.setItem("SIGNS", signData);*/
                        self.isregSuccess = true;
                    } else if(res&&res.data&&res.data.code === "01090201"){
                        self.idExist = true;
                    } else{
                        self.isError = true;
                    }
                }).finally(function(){
                    self.isRegLoading = false;
                });
            }
        };
        /*self.exist = function(data) {
            self.isdisabled = true;
            if (!data) {
                self.isdisabled = false;
                return;
            }
            regsrv.checkLoginName({loginName:data}).then(function(result) {
                self.isError = false;
                if(result.data.code=='0'){
                    self.isexist = false;
                }else if(result.data.code=='01090201'){
                    self.isexist = true;
                }else{
                    self.isexist = false;
                    self.isError = true;
                }
            })
        };*/
        self.getImg = function() {
            $http({
                method: "GET",
                url: "awstack-user/v1/verifycode"
            }).then(function(res) {
                // console.log(res);
                self.imgData = res.data;
            });
        };
    }])
    .controller("passresetCtrl", ["$scope","$rootScope","$http", function($scope,$rootScope, $http) {
        var self = $scope;
        self.sendMail = {email:""};
        self.passReset = {
            newpass:"",
            cfmPassword:""
        };
        self.sendMailSuccess= false;
        self.sendMailFail = false;
        self.resetSuccess = false;
        self.resetFail = false;
        self.serverError = false;

        self.sendMail = function(form_field){
            if(form_field.$valid){
                $http({
                    method:"GET",
                    url:"/awstack-user/v1/back/email",
                    params:{
                        email:self.sendMail.email
                    }
                }).success(function(result){
                    if(result && result.data){
                        self.mailInexistence = !result.data.data;
                        if(result.data.data){ //邮箱存在
                            $http({
                                method:"POST",
                                url:"/awstack-user/v1/back/email/password",
                                data:{
                                    email:self.sendMail.email
                                }
                            }).success(function(result){
                                if(result.code == "0"){
                                    self.sendMailSuccess = true; 
                                }else if(result.code == "01090901"){
                                    self.sendMailFail = true;
                                }else{
                                    self.serverError = true;
                                }
                            });
                        }
                        
                    }
                });
            }

        };
        
        self.resetPass = function(form_field){
            if(form_field.$valid){
                $http({
                    method:"POST",
                    url:"/awstack-user/v1/back/email/password/new",
                    data:{
                        uid:$rootScope.nextdata.params.uid,
                        password:self.passReset.newpass
                    }
                }).success(function(res){
                    if(res.code == "0"){
                        self.resetSuccess = true;
                    }else if(res.code == "01091001"){
                        self.resetFail = true;
                    }else{
                        self.serverError = true;
                    }
                });
            }
        };
    }])

    .controller("completeCtrl", ["$scope","$http","$location","$translate","$timeout", function(scope,$http,$location,translate,$timeout) {
        var regionKey = JSON.parse(localStorage.LOGINS).regionKey;
        //var listData = localStorage.LISTS ? JSON.parse(localStorage.LISTS) : "";
        //var component = localStorage.COMPONENT ? JSON.parse(localStorage.COMPONENT) : "";
        var patternSelected = localStorage.patternSelected ? JSON.parse(localStorage.patternSelected) : "";
        var websocket;
        var self = scope;
        //var component_enable_ceph = component.enable_ceph;
        if(patternSelected&&patternSelected.value=="hyper"){
            self.enable_ceph = true;
        }else{
            self.enable_ceph = false;
        }
        //self.enable_ceph = listData?listData[0].hostInfoMap.enable_ceph:component_enable_ceph;
        self.passed = false;
        self.startUp = false;
        self.ending = false;
        self.failed = false;
        self.redo = true;
        self.offline = false;
        self.complete = {
            status: ""
        };
        if (localStorage.INSTALLSTATUS == "3") {
            self.passed = true;
            self.startUp = false;
            self.ending = true;
            self.failed = false;
            self.redo = false;
        }
        scope.logOut = false;
        scope.logMessages = [];
        scope.logDisplay = function(val){
            scope.logOut = val;
            if(val){
                scope.logMessages = [];
            }
        }
        if (localStorage.LOGINS && localStorage.INSTALLSTATUS != '3') {
            if ("WebSocket" in window) {
                let url = GLOBALCONFIG.APIHOST.WEBSOCKET + "/v1/bobmsg/operation?X-Register-Code=" + regionKey;
                //let url = "ws://192.168.137.43:8001/awstack-websocket/v1/bobmsg/operation?X-Register-Code=" + regionKey;
                websocket = new WebSocket(url);

                websocket.onopen = function() {
                    self.passed = false;
                    self.startUp = false;
                    self.ending = false;
                    self.failed = false;
                    scope.$apply();
                };
                websocket.onmessage = function(event) {
                    if(scope.logOut){
                        scope.logMessages.unshift(event.data);    
                    }
                    if(localStorage.INSTALLSTATUS=="3"){
                        self.passed = true;
                        self.startUp = false;
                        self.ending = true;
                        self.failed = false;
                        self.redo = false;
                        self.$apply();
                        websocket.close();
                        return;
                    }
                    if (event.data.toLowerCase().indexOf("deploying success all") > -1) {
                        

                        self.components_neutron = true;
                        self.components_ha = true;
                        self.components_nova = true;
                        self.components_cinder = true;
                        self.components_glance = true;
                        self.components_keystone = true;
                        self.components_ceph = true;
                        self.complete.status = "color-9";



                        self.passed = true;
                        self.startUp = false;
                        self.ending = true;
                        self.failed = false;
                        self.redo = false;
                        websocket.close();

                        var trans_title = translate.instant("aws.siteTitle.completed");
                        /*var trans_title = translate.instant("aws.siteTitle.completed") + " - " + translate.instant("aws.siteTitle.projectname") || "home";*/
                        window.document.title = trans_title;

                    }else if(event.data.toLowerCase().indexOf("saas vm jobs") > -1) {
                        
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;

                        self.components_ha = true;
                        self.components_nova = true;
                        self.components_cinder = true;
                        self.components_glance = true;
                        self.components_keystone = true;
                        self.components_ceph = true;
                        self.complete.status = "color-8";
                    }else if (event.data.toLowerCase().indexOf("deploying agentproxy") > -1) {
                        //6
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;

                        self.components_ha = true;
                        self.components_nova = true;
                        self.components_cinder = true;
                        self.components_glance = true;
                        self.components_keystone = true;
                        self.components_ceph = true;
                        self.complete.status = "color-7";
                    }else if (event.data.toLowerCase().indexOf("deploying ceph restapi") > -1) {
                        //5
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.components_nova = true;
                        self.components_cinder = true;
                        self.components_glance = true;
                        self.components_keystone = true;
                        self.components_ceph = true;
                        self.complete.status = "color-6";
                    }else if (event.data.toLowerCase().indexOf("glance post install") > -1) {
                        //4
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.components_cinder = true;
                        self.components_glance = true;
                        self.components_keystone = true;
                        self.components_ceph = true;
                        self.complete.status = "color-5";
                    }else if (event.data.toLowerCase().indexOf("deploying openstack network service") > -1) {
                        //3
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.complete.status = "color-4";
                        self.components_glance = true;
                        self.components_keystone = true;
                        self.components_ceph = true;
                    }else if (event.data.toLowerCase().indexOf("deploying openstack image service") > -1) {
                        //2
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.complete.status = "color-3";
                        self.components_keystone = true;
                        self.components_ceph = true;
                    }else if (event.data.toLowerCase().indexOf("deploying load balancer") > -1) {
                        //1
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.complete.status = "color-2";
                        self.components_ceph = true;
                    }else if (event.data.toLowerCase().indexOf("deploying ceph restapi") > -1) {
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.complete.status = "color-1";
                    }else if (event.data.toLowerCase().indexOf("deploying ceph monitors") > -1) {
                        self.passed = true;
                        self.startUp = true;
                        self.ending = false;
                        self.failed = false;
                        self.redo = false;
                        
                        self.complete.status = "color-0";
                    }else if (event.data.toLowerCase().indexOf("deploying fail all") > -1) {
                        self.passed = true;
                        self.startUp = false;
                        self.ending = false;
                        self.failed = true;
                        self.redo = true;
                        
                    }else if(event.data.toLowerCase().indexOf("bob connection closed") > -1){
                        self.offline = true;
                    }else{
                        self.offline = false;
                    }
                    scope.$apply();
                };
                websocket.onerror = function() {

                };
                websocket.onclose = function() {

                };
            }
        }
        self.detail = function(){
            self.showConfDetail = !self.showConfDetail;
            if(localStorage.LOGINS){
                $http({
                    method:"GET",
                    url:"/awstack-user/v1/enterprises/regions/regionkeys/"+regionKey
                }).then(function(result){
                    if(result.data && result.data.data && result.data.data.data){
                        var nodesData = result.data.data.data;
                        var com = JSON.parse(nodesData.regionConfigScript);
                        self.usedList = com.user_list;
                    }
                });
            }
        };
        self.dismiss = function(){
            self.showConfDetail = false;
        };
        self.reset = function(){
            self.showAlert = true;
        };
        self.close = function(){
            self.showAlert = false;
        };
        self.reseConfirm = function(){
            var data=[];
            var enterpriseUid;
            
            if (localStorage.LOGINS) {
                enterpriseUid = JSON.parse(localStorage.LOGINS).enterpriseUid;
                data.push({"regionKey":JSON.parse(localStorage.LOGINS).regionKey});
                $http({
                    method:"DELETE",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    url:"/awstack-user/v1/enterprises/"+enterpriseUid+"/clusters/configurations",
                    data:data
                }).then(function(){
                    localStorage.removeItem("INSTALLSTATUS");
                    localStorage.removeItem("NODE");
                    localStorage.removeItem("CIDR");
                    localStorage.removeItem("LISTS");
                    localStorage.removeItem("HOSTNAMELIST");
                    localStorage.removeItem("TWOFORM");
                    localStorage.removeItem("THREEFORM");
                    localStorage.removeItem("ALLDATA");
                    localStorage.removeItem("ALLDATAS");
                    localStorage.removeItem("ACCOUNT");
                    $location.path("/info/stepone");
                    $location.replace();
                });
            }
        };
    }])
    .controller("mainCtrl", ["$scope", "$rootScope", "$routeParams","$location","$http","$translate", function($scope, $rootScope, $routeParams,$location,$http,translate) {
        var self = $scope;
        $rootScope.$on("$routeChangeStart",function(e,next){
            if(next.originalPath =="/resetpass"){
                $rootScope.nextdata = next;
                $http({
                    method:"GET",
                    url:"/awstack-user/v1/back/email/password",
                    params:{uid:next.params.uid}
                }).success(function(res){
                    if(res && res.data){
                        $rootScope.linkValid = res.data.data;
                    }
                });
            }
            if(!localStorage.$AWCONFLOGINED&&next.originalPath!="/register"&&next.originalPath!="/forgetpass"&&next.originalPath!="/resetpass"){
                $location.path("/").replace();
            }
            if(localStorage.LOGINS){
                var regionKey = JSON.parse(localStorage.LOGINS).regionKey;
                var data={
                    "regionKey":regionKey
                }
                $http({
                    method: "GET",
                    url: "/awstack-user/back/v1/enterprises/regions/status",
                    params:data
                }).then(function(result) {
                    if (result) {
                        var registerStatus=result.data.data.data;
                        if(registerStatus==1||registerStatus==2){
                            $location.path("/complete").replace();
                        }
                    }
                })
            }
        });
        $rootScope.siteTitle="";
        $http({
            url: "/awstack-user/v1/platform/version",
            method:"GET"
        }).then(function(res){
            if(res&&res.data&&res.data.data&&res.data.data.data){
                res.data.data.data=JSON.parse(res.data.data.data.description);
                $rootScope.siteTitle = res.data.data.data.title;
                $rootScope.copyright = res.data.data.data.copyright;
            }
            
        });
        function changeSiteTitle(path) {
            var titles = path.replace("/", "").split("/");
            var title = titles.length == 1 ? (titles[titles.length - 1] == "" ? "home" : titles[titles.length - 1]) : titles[1];
            var trans_title = translate.instant("aws.siteTitle." + title);
            if(title=="complete"){
                if(localStorage.INSTALLSTATUS>=3){
                    trans_title = translate.instant("aws.siteTitle.completed");
                }
            }
            $rootScope.pathTitle = trans_title;
        }
        $rootScope.$on("$routeChangeSuccess", function(a, cur) {
            self.isLogin = cur.originalPath == "/" ? true : false;
            self.isInfo = cur.originalPath.indexOf("/info") > -1 ? true : false;
            self.isStepfour = cur.originalPath == "/info/stepfour" ? true : false;
            changeSiteTitle(cur.originalPath);
            if (!cur.originalPath || cur.originalPath == ("/")) {
                localStorage.removeItem("$AWCONFLOGINED");
            }
            if(cur.originalPath!="/info/stepone"){
                self.isSetpOne = true;
            }
            switch (cur.originalPath) {
            case "/info/stepthree":
                self.stepOne = false;
                self.stepTwo = true;
                self.stepThree = false;
                self.stepOneActive = true;
                self.stepTwoActive = true;
                self.stepThreeActive = true;
                self.stepFourActive = false;
                break;
            case "/info/stepfour":
                self.stepOne = false;
                self.stepTwo = false;
                self.stepThree = true;
                self.stepFour = false;
                self.stepOneActive = true;
                self.stepTwoActive = true;
                self.stepThreeActive = true;
                self.stepFourActive = true;
                break;
            case "/info/stepone":
            case "/info/cards":
            case "/info/disks":
                self.stepOne = true;
                self.stepTwo = false;
                self.stepThree = false;
                self.stepFour = true;
                self.stepOneActive = true;
                self.stepTwoActive = false;
                self.stepThreeActive = false;
                self.stepFourActive = false;
                self.isSetpOne = false;
                break;
            case "/info/steptwo":
                self.stepOne = true;
                self.stepTwo = false;
                self.stepThree = false;
                self.stepFour = true;
                self.stepOneActive = true;
                self.stepTwoActive = true;
                self.stepThreeActive = false;
                self.stepFourActive = false;
                self.isSetpOne = false;
                break;
            case "/complete":
                history.pushState(null, null, document.URL);
                window.addEventListener('popstate', function () {
                    history.pushState(null, null, document.URL);
                });
                break;
            }
        });
    }])
    .service("regsrv",["$http",function($http){
        return {
            checkUserName:function(data){
                var loginsData = localStorage.LOGINS ? JSON.parse(localStorage.LOGINS) : "";
                var enterpriseUid = loginsData.enterpriseUid;
                return $http({
                    method: "POST",
                    url: "awstack-user/v1/enterprises/" + enterpriseUid + "/chkusername",
                    data:data
                });
            },
            signup:function(data){
                return $http({
                    method: "POST",
                    url: "awstack-user/v1/enterprises/signup",
                    data: data
                });
            },
            checkLoginName:function(data){
                return $http({
                    method: "POST",
                    url: "awstack-user/v1/enterprises/chkenterprisesname",
                    data: data
                });
            }
        };
    }])
    .directive("pwCheck", [function() {
        return {
            require: "ngModel",
            link: function(scope, elem, attrs, ctrl) {
                var firstPassword = "#" + attrs.pwCheck;
                elem.on("keyup", function() {
                    scope.$apply(function() {
                        var v = elem.val() === $(firstPassword).val();
                        ctrl.$setValidity("pwCheck", v);
                    });
                });
                scope.$watch(function(){
                    return $(firstPassword).val();
                },function(val){
                    if(elem.val() && elem.val() != val){
                        var v = elem.val() === $(firstPassword).val();
                        ctrl.$setValidity("pwCheck", v);
                    }else{
                        ctrl.$setValidity("pwCheck", !v);
                    }

                });
            }
        };
    }])
    .directive("gtip", [function() {
        return {
            require: "ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                $ngModel.$parsers.push(function(value){
                    var startValue = elem.parent().parent().siblings(".form-group").find(".form-control").val();
                    if(_IP.isV4Format(value)){
                        if(_IP.toLong(value) <= _IP.toLong(startValue)){
                            $ngModel.$setValidity("gtip",false);
                            return value;
                        }
                        $ngModel.$setValidity("gtip",true);
                        return value;
                    }
                    return value;
                });
                scope.$watch(function(){
                    return elem.parent().parent().siblings(".form-group").find(".form-control").val();
                },function(val){
                    if(_IP.isV4Format(val)){
                        if(_IP.toLong($ngModel.$viewValue) <= _IP.toLong(val)){
                            $ngModel.$setValidity("gtip",false);
                            return;
                        }
                        $ngModel.$setValidity("gtip",true);
                    }
                });
                $ngModel.$formatters.push(function(value){
                    var startValue = elem.parent().parent().siblings(".form-group").find(".form-control").val();
                    if(_IP.isV4Format(value)){
                        if(_IP.toLong(value) <= _IP.toLong(startValue)){
                            $ngModel.$setValidity("gtip",false);
                            return value;
                        }
                        $ngModel.$setValidity("gtip",true);
                        return value;
                    }
                    return value;
                });

            }
        };
    }])
    .directive("incidr", [function() {
        return {
            require: "ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var cidr = "#" + attrs.incidr;
                $ngModel.$parsers.push(function(value){
                    var min = _IP.cidrSubnet($(cidr).val()).networkAddress;
                    var max = _IP.cidrSubnet($(cidr).val()).broadcastAddress;
                    if(_IP.isV4Format(value)){
                        if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                            $ngModel.$setValidity("incidr", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("incidr", true);
                    return value;
                });
                $ngModel.$formatters.push(function(value){
                    var min = _IP.cidrSubnet($(cidr).val()).networkAddress;
                    var max = _IP.cidrSubnet($(cidr).val()).broadcastAddress;
                    if(_IP.isV4Format(value)){
                        if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && (_IP.toLong(min) >= _IP.toLong(value) || _IP.toLong(max)<= _IP.toLong(value)))){
                            $ngModel.$setValidity("incidr", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("incidr", true);
                    return value;
                });
                scope.$watch(function(){
                    return $(cidr).val();
                },function(val){
                    if(_IP.cidrSubnet(val)){
                        var min = _IP.cidrSubnet(val).networkAddress;
                        var max = _IP.cidrSubnet(val).broadcastAddress;
                        if(!_IP.cidrSubnet(val).contains($ngModel.$viewValue) || (_IP.cidrSubnet(val).contains($ngModel.$viewValue) && (_IP.toLong(min) >= _IP.toLong($ngModel.$viewValue) || _IP.toLong(max)<= _IP.toLong($ngModel.$viewValue)))){
                            $ngModel.$setValidity("incidr", false);
                            return;
                        }
                        $ngModel.$setValidity("incidr", true);
                    }
                });
            }
        };
    }])
    .directive("gateway", [function() {
        return {
            require: "ngModel",
            scope:{
                start:"=",
                end:"="
            },
            link: function(scope, elem, attrs, $ngModel) {
                var cidr = "#" + attrs.gateway;
                var min = $("input[name="+scope.start+"]").val();
                var max = $("input[name="+scope.end+"]").val();
                if(!min||!max){
                    return
                }
                $ngModel.$parsers.push(function(value){
                    var min = $("input[name="+scope.start+"]").val();
                    var max = $("input[name="+scope.end+"]").val();
                    if(_IP.isV4Format(value)){
                        if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && _IP.toLong(min) <= _IP.toLong(value) && _IP.toLong(max)>= _IP.toLong(value))){
                            $ngModel.$setValidity("gateway", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("gateway", true);
                    return value;
                });
                $ngModel.$parsers.push(function(value){
                    var min = $("input[name="+scope.start+"]").val();
                    var max = $("input[name="+scope.end+"]").val();
                    if(_IP.isV4Format(value)){
                        if(!_IP.cidrSubnet($(cidr).val()).contains(value) || (_IP.cidrSubnet($(cidr).val()).contains(value) && _IP.toLong(min) <= _IP.toLong(value) && _IP.toLong(max)>= _IP.toLong(value))){
                            $ngModel.$setValidity("gateway", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("gateway", true);
                    return value;
                });
                scope.$watch(function(){
                    var ipc = $("input[name="+scope.start+"]").val()+","+$("input[name="+scope.end+"]").val()+","+$(cidr).val();
                    return ipc;
                },function(ne){
                    var val = ne.split(",");
                    if(_IP.isV4Format(val[0]) && _IP.isV4Format(val[1]) && _IP.cidrSubnet(val[2])){
                        if(!_IP.cidrSubnet(val[2]).contains($ngModel.$viewValue) || (_IP.cidrSubnet(val[2]).contains($ngModel.$viewValue) && _IP.toLong(val[0]) <= _IP.toLong($ngModel.$viewValue) && _IP.toLong(val[1])>= _IP.toLong($ngModel.$viewValue))){
                            $ngModel.$setValidity("gateway", false);
                            return;
                        }
                        $ngModel.$setValidity("gateway", true);
                    }
                });
            }
        };
    }])
    .directive("vlan", [function() {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                /*$ngModel.$parsers.push(function(value){
                    var min = Number($("input[name='tenantStart']").val());
                    var max = Number(value);
                    if(max && min){
                        if(max<min){
                            $ngModel.$setValidity("vlan", false);
                            return value;
                        }
                    }
                    $ngModel.$setValidity("vlan", true);
                    return value;
                });*/
                $ngModel.$parsers.push(function(value){
                    scope.$watch(function(){
                        var min=$("input[name='tenantStart']").val();
                        var max=$("input[name='tenantEnd']").val();
                        return min+","+max;
                    },function(val){
                        var mins = Number(val.split(",")[0]);
                        var maxs = Number(val.split(",")[1]);
                        if(maxs && mins){
                            if(maxs>mins){
                                $ngModel.$setValidity("vlan", true);
                            }else{
                                $ngModel.$setValidity("vlan", false);
                            }
                        }
                    });
                    return value;
                });
            }
        };
    }])
    .directive("logicalvlanlimit", function() {
        return {
            restrict:"A",
            require:"ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var reg = /^[1-9]\d*$/;
                $ngModel.$parsers.push(function(viewValue){
                    var num = Number(viewValue);
                    if(reg.test(num)){
                        if(num>=2&&num<=4094){
                            $ngModel.$setValidity("logicalvlanlimit", true);
                        }else{
                            $ngModel.$setValidity("logicalvlanlimit", false);
                        }
                    }else{
                        if(num==0){
                            $ngModel.$setValidity("logicalvlanlimit", true);
                        }else{
                            $ngModel.$setValidity("logicalvlanlimit", false);    
                        }
                    }
                    return viewValue;
                })
            }
        };
    })
    .directive("vlanlimitstart", function() {
        return {
            restrict:"A",
            require:"ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var reg = /^[1-9]\d*$/;
                $ngModel.$parsers.push(function(viewValue){
                    var num = Number(viewValue);
                    if(reg.test(num)){
                        if(num>=2&&num<=4094){
                            $ngModel.$setValidity("vlanlimitstart", true);
                            scope.valnstartFlag=true;
                        }else{
                            $ngModel.$setValidity("vlanlimitstart", false);
                            scope.valnstartFlag=false;
                        }
                    }else{
                        $ngModel.$setValidity("vlanlimitstart", false);
                        scope.valnstartFlag=false;
                    }
                    return viewValue;
                })
            }
        };
    })
    .directive("vlanlimitend", function() {
        return {
            restrict:"A",
            require:"ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var reg = /^[1-9]\d*$/;
                $ngModel.$parsers.push(function(viewValue){
                    var num = Number(viewValue);
                    if(reg.test(num)){
                        if(num>=2&&num<=4094){
                            $ngModel.$setValidity("vlanlimitend", true);
                            scope.valnendFlag=true;
                        }else{
                            $ngModel.$setValidity("vlanlimitend", false);
                            scope.valnendFlag=false;
                        }
                    }else{
                        $ngModel.$setValidity("vlanlimitend", false);
                        scope.valnendFlag=false;
                        scope.valnstartFlag=false;
                    }
                    return viewValue;
                })
            }
        };
    })
    .directive("vxlanlimitstart", function() {
        return {
            restrict:"A",
            require:"ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var reg = /^[1-9]\d*$/;
                $ngModel.$parsers.push(function(viewValue){
                    var num = Number(viewValue);
                    if(reg.test(num)){
                        if(num>=1&&num<=16777215){
                            $ngModel.$setValidity("vxlanlimitstart", true);
                            scope.valnstartFlag=true;
                        }else{
                            $ngModel.$setValidity("vxlanlimitstart", false);
                            scope.valnstartFlag=false;
                        }
                    }else{
                        $ngModel.$setValidity("vxlanlimitstart", false);
                        scope.valnstartFlag=false;
                    }
                    return viewValue;
                })
            }
        };
    })
    .directive("vxlanlimitend", function() {
        return {
            restrict:"A",
            require:"ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var reg = /^[1-9]\d*$/;
                $ngModel.$parsers.push(function(viewValue){
                    var num = Number(viewValue);
                    if(reg.test(num)){
                       if(num>=1&&num<=16777215){
                            $ngModel.$setValidity("vxlanlimitend", true);
                            scope.valnendFlag=true;
                        }else{
                            $ngModel.$setValidity("vxlanlimitend", false);
                            scope.valnendFlag=false;
                        }
                    }else{
                        $ngModel.$setValidity("vxlanlimitend", false);
                        scope.valnendFlag=false;
                        scope.valnstartFlag=false;
                    }
                    return viewValue;
                })
            }
        };
    })
    .directive("checksassip", function() {
        return {
            restrict:"A",
            require:"ngModel",
            scope:{
                sassip:"="
            },
            link: function(scope, elem, attrs, $ngModel) {
                var reg=/^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
                $ngModel.$parsers.push(function(viewValue){
                    scope.$watch(function(){
                        var startip=$("input[name='floatingStart']").val();
                        var endip=$("input[name='floatingEnd']").val();
                        return startip+","+endip;
                    },function(val){
                        var startip = val.split(",")[0];
                        var endip = val.split(",")[1];
                        if(reg.test(startip) && reg.test(endip)){
                            var s= _IP.toLong(startip);
                            var e= _IP.toLong(endip);
                            var sass=_IP.toLong(scope.sassip);
                            if(sass>e||sass<s){
                                $ngModel.$setValidity("checksassip", true);
                            }else{
                                $ngModel.$setValidity("checksassip", false);
                            }
                        }
                    });
                    return viewValue;
                })
            }
        };
    })
    .directive("vlanlimitend", function() {
        return {
            restrict:"A",
            require:"ngModel",
            link: function(scope, elem, attrs, $ngModel) {
                var reg = /^[1-9]\d*$/;
                $ngModel.$parsers.push(function(viewValue){
                    var num = Number(viewValue);
                    if(reg.test(num)){
                        if(num>=2&&num<=4094){
                            $ngModel.$setValidity("vlanlimitend", true);
                            scope.valnendFlag=true;
                        }else{
                            $ngModel.$setValidity("vlanlimitend", false);
                            scope.valnendFlag=false;
                        }
                    }else{
                        $ngModel.$setValidity("vlanlimitend", false);
                        scope.valnendFlag=false;
                    }
                    return viewValue;
                })
            }
        };
    })
    .directive("repeatname",["$timeout","$window","regsrv",function($timeout,$window,regsrv){
        return {
            restrict:"A",
            require:"ngModel",
            link:function(scope,ele,attrs,model){
                /*ele.on("keyup",function(){
                    //if(model.$viewValue){
                        $window.timer = $timeout(function(){
                            regsrv.checkLoginName({loginName:model.$viewValue}).then(function(result){
                                if(result.data.code=="0"){
                                    model.$setValidity("repeatname",true);
                                }else if(result.data.code=="01090201"){
                                    model.$setValidity("repeatname",false);
                                }else{
                                    model.$setValidity("repeatname",false);
                                }
                            }); 
                        },100);
                    //}
                });
                ele.on("keydown",function(){
                    console.log(1);
                    scope.idExist = false;
                    $timeout.cancel($window.timer);
                    console.log(12);
                });*/
                scope.$watch(attrs.ngModel, function(v) {
                    if (!v) return;
                    $timeout.cancel($window.timer);
                    $window.timer = $timeout(function(){
                        regsrv.checkLoginName({loginName:model.$modelValue}).then(function(result){
                            if(result.data.code=="0"){
                                model.$setValidity("repeatname",true);
                            }else if(result.data.code=="01090201"){
                                model.$setValidity("repeatname",false);
                            }else{
                                model.$setValidity("repeatname",false);
                            }
                        });      
                    },1000);
                });
                
            }
        };
    }])
    .directive("checkemail",["$http",function($http){
        return {
            restrict:"A",
            require:"ngModel",
            link:function(scope,ele,attrs,ngModel){
                var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                ngModel.$parsers.push(function(viewValue){
                    if(viewValue){
                        scope.emailRequired = false;
                        if(reg.test(viewValue)){
                            scope.errorPattern = false;
                            ngModel.$setValidity("checkemail",true);
                            $http({
                                method:"GET",
                                url:"/awstack-user/v1/back/email",
                                params:{
                                    email:ngModel.$viewValue
                                }
                            }).success(function(result){
                                if(result && result.data){
                                    if(result.data.data){ //邮箱存在
                                        ngModel.$setValidity("checkemail",false);
                                    }else{
                                        ngModel.$setValidity("checkemail",true);
                                    }
                                    
                                }
                            });
                        }else{
                            scope.errorPattern = true;
                            ngModel.$setValidity("checkemail",false);
                        }
                    }else{
                        scope.emailRequired = true;
                        scope.errorPattern = false;
                    }
                    return viewValue;
                });
                    
            }
        };
    }])
.directive("repeatusername",["$timeout","$window","regsrv",function($timeout,$window,regsrv){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,ele,attrs,model){
            ele.on("keyup",function(){
                if(model.$viewValue){
                    $window.username = $timeout(function(){
                        regsrv.checkUserName({userName:model.$viewValue,regionKey:localStorage.regionKey}).then(function(result){
                            if(result.data.code=="0"){
                                model.$setValidity("repeatusername",true);
                            }else if(result.data.code=="01080601"){
                                model.$setValidity("repeatusername",false);
                            }else{
                                model.$setValidity("repeatusername",false);
                            }
                        }); 
                    },500);
                }
            });
            ele.on("keydown",function(){
                scope.threeModule.idExist = false;
                $timeout.cancel($window.username);
            });
            
        }
    };
}])
.directive("autoHeight",["$timeout",function($timeout){
    return {
        restrict:"A",
        link:function(scope,elem,attr,ngmodal){
            var timer;
            scope.$watch(function(){
                return $("body").outerHeight();
            },function(bodyHeight){
                $timeout.cancel(timer);
                timer = $timeout(function(){
                    if(bodyHeight > $(window).height()){
                        $(elem).addClass('auto-height');
                    }else{
                        $(elem).removeClass('auto-height');
                    }
                },5);
            }); 

            $(window).resize(function() {
                if($('body').outerHeight() > $(window).height()){
                    $(elem).addClass('auto-height');
                }else{
                    $(elem).removeClass('auto-height');
                }
            });
        }
    }
}])
.directive("ipDomain",[function(){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,ele,attrs,ngModel){
            var reg = /^(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/;
            var ipReg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/;
            function checkIpDomain(value){
                if(!reg.test(value)&&!ipReg.test(value)){
                    ngModel.$setValidity("ipDomain",false);
                }else{
                    ngModel.$setValidity("ipDomain",true);
                }
                return value;
            }
            ngModel.$parsers.push(checkIpDomain);
            ngModel.$formatters.push(checkIpDomain);
        }
    };
}])
.directive("backupCheck",[function(){
    return {
        restrict:"A",
        require: "ngModel",
        scope:{
            min:"=",
            max:"="
        },
        link:function(scope,ele,attr,ngModel){
            if(!scope.max){
                ngModel.$setValidity("backupCheck",false);
                return;
            }
            var reg = /^[1-9]\d*$/;
            ngModel.$parsers.push(function(val){
                if(val&&reg.test(val)){
                    if(Number(val) <= scope.min || Number(val) >= scope.max){
                        ngModel.$setValidity("backupCheck",false);
                    }else{
                        ngModel.$setValidity("backupCheck",true);
                    }
                }else{
                    ngModel.$setValidity("backupCheck",false);
                }
                return val;
            })
        }
    }
}])
.directive("maxCheck",[function(){
    return {
        restrict:"A",
        require: "ngModel",
        scope:{
            maxvalue:"="
        },
        link:function(scope,ele,attr,ngModel){
            var reg = /^[1-9]\d*$/;
            ngModel.$parsers.push(function(val){
                if(val&&reg.test(val)){
                    if(Number(val) <= Number(scope.maxvalue)){
                        ngModel.$setValidity("maxCheck",true);
                    }else{
                        ngModel.$setValidity("maxCheck",false);
                    }
                }
                return val;
            })
        }
    }
}]);