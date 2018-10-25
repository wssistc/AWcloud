
var initSettingModule = angular.module("initSettingModule", []);

initSettingModule.controller("initSettingCtrl", ["$scope", "$rootScope", "$translate", "$uibModalInstance", "initSettingSrv", "alertSrv", "mainScope",
    "$location", "$route", function($scope, $rootScope, $translate, $uibModalInstance, initSettingSrv, alertSrv, mainScope, $location, $route) {
    var self = $scope;

    self.vpcStatus = false;
    self.alarmStatus = false;
    self.storageStatus = false;
    self.transferStatus = false;
    self.checkIpStatus = false;
    self.storageDisabled = false;
    self.transferDisabled = false;
    self.canSetInitVpc=true;
    self.canSetInitStorage=true;

    self.vpcShow = true;
    self.alarmShow = false;
    self.storageShow = false;
    self.transferShow = false;
    self.checkIpShow = false;
    self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
    self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
    self.unSetup = $translate.instant('aws.initSetting.settingStatus.unSetup');
    self.setupEnd = $translate.instant('aws.initSetting.settingStatus.setupEnd');

    self.storageStepOne = false
    self.storageStepTwo = true;
    self.storageStepThree = false;

    // self.initRegionKey = angular.copy(localStorage.regionKey);
    // self.initRegionName = angular.copy(localStorage.regionName);
    // self.initLoginData = angular.copy(localStorage.$LOGINDATA);

    initStep();

    function initStep() {
        self.inStepOne = true;
        self.inStepTwo = false;
        self.inStepThree = false;
        self.inStepOneBar = true;
        self.inStepTwoBar = false;
        self.inStepThreeBar = false;
    }

    // //第一步到第二步
    // self.stepToTwo = function(items) {
    //     self.inStepOne = false;
    //     self.inStepTwo = true;
    //     self.inStepTwoBar = true;
    // }
    // //第二步到第一步
    // self.stepToOne = function() {
    //     self.inStepOne = true;
    //     self.inStepTwo = false;
    //     self.inStepTwoBar = false;
    // }
    // //第二步到第三步
    // self.stepToThree = function() {
    //     self.inStepThree = true;
    //     self.inStepTwo = false;
    //     self.inStepThreeBar = true;
    // }
    // //第三步到第二步
    // self.stepThreeToTwo = function() {
    //     self.inStepTwo = true;
    //     self.inStepThree = false;
    //     self.inStepThreeBar = false;
    // }

    function changeNewRegion() {
        initSettingSrv.changeNewRegion(self.setting.region.regionKey).then(function(res){
            if(res && res.data && res.data.token){
                self.initSettingRegion_token = res.data.token;
                self.initSetting_headers = {
                    "X-Auth-Token":self.initSettingRegion_token
                };
            }
        });
    }

    initSettingSrv.getSettingStatus().then(function(result) {
        if(result && result.data && angular.isArray(result.data)) {
            self.regionList = result.data;
            self.setting = {
                region: self.regionList[0]
            }
            for(var i = 0; i < self.regionList.length; i++) {
                if(self.regionList[i].regionKey == localStorage.regionKey) {
                    self.setting.region = self.regionList[i];
                    break;
                }
            }
            self.initSettingRegion_token = localStorage.$AUTH_TOKEN;
            self.initSetting_headers = {
                "X-Auth-Token":self.initSettingRegion_token
            };
            result.data.forEach(function(item, index) {
                if(item.regionKey == self.setting.region.regionKey) {
                    self.vpcStatus = item.vpc;
                    self.alarmStatus = item.alarm;
                    if(item.cinderVolume == 0) {
                        self.storageStatus = false;
                        self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                    }else if(item.cinderVolume == 1) {
                        self.storageStatus = false;
                        self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.setuping');
                        self.storageDisabled = true;
                    }else if(item.cinderVolume == 2) {
                        self.storageStatus = true;
                        self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.setupEnd');
                    }else {
                        self.storageStatus = false;
                        self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                    }
                    if(item.image == 0) {
                        self.transferStatus = false;
                        self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                    }else if(item.image == 1) {
                        self.transferStatus = false;
                        self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.setuping');
                        self.transferDisabled = true;
                    }else if(item.image == 2) {
                        self.transferStatus = true;
                        self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.setupEnd');
                    }else {
                        self.transferStatus = false;
                        self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                    }
                    if(item.status) {
                        mainScope.showInitSettingAlert = false;
                    }
                }
            });
        }
    });

    self.getSettingStatus = function() {
        initSettingSrv.getSettingStatus().then(function(result) {
            if(result && result.data && angular.isArray(result.data)) {
                result.data.forEach(function(item, index) {
                    if(item.regionKey == self.setting.region.regionKey) {
                        self.vpcStatus = item.vpc;
                        self.alarmStatus = item.alarm;
                        if(item.cinderVolume == 0) {
                            self.storageStatus = false;
                            self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                        }else if(item.cinderVolume == 1) {
                            self.storageStatus = false;
                            self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.setuping');
                            self.storageDisabled = true;
                        }else if(item.cinderVolume == 2) {
                            self.storageStatus = true;
                            self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.setupEnd');
                        }else {
                            self.storageStatus = false;
                            self.storageStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                        }
                        if(item.image == 0) {
                            self.transferStatus = false;
                            self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                        }else if(item.image == 1) {
                            self.transferStatus = false;
                            self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.setuping');
                            self.transferDisabled = true;
                        }else if(item.image == 2) {
                            self.transferStatus = true;
                            self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.setupEnd');
                        }else {
                            self.transferStatus = false;
                            self.transferStatusText = $translate.instant('aws.initSetting.settingStatus.unSetup');
                        }
                        if(item.status) {
                            mainScope.showInitSettingAlert = false;
                        }
                    }
                });
            }
        });
    }
    
    //数据中心需求调整目前不可切换
    self.changeRegion = function(obj, module) {
        self.getSettingStatus();
        changeNewRegion();
        self.changeModuleShow('regionShow');
        self.lastModule = module;
    };

    self.gotoSetting = function() {
        localStorage.regionKey = self.setting.region.regionKey;
        localStorage.regionName = self.setting.region.regionName;
        var loginData = angular.fromJson(localStorage.$LOGINDATA);
        loginData.regionUid = self.setting.region.regionUid;
        localStorage.$LOGINDATA = angular.toJson(loginData);
        if(!self.vpcStatus) {
            self.changeModuleShow('vpcShow');
        }else if(!self.alarmStatus) {
            self.changeModuleShow('alarmShow');
        }else if(!self.storageStatus) {
            self.changeModuleShow('storageShow');
        }else if(!self.transferStatus) {
            self.changeModuleShow('transferShow');
        }
    }

    self.cancelRegion = function() {
        self.changeModuleShow(self.lastModule);
        self.regionList.forEach(function(item, index) {
            if(item.regionKey == localStorage.regionKey) {
                self.setting.region = item;
            }
        });
        self.getSettingStatus();
        changeNewRegion();
    }

    self.closeInitModel = function() {
        $uibModalInstance.close();
        if($location.path() == "/system/storageManagement" && (self.storageStatus || self.transferStatus)) {
            $route.reload();
        }
        // localStorage.regionKey = self.initRegionKey;
        // localStorage.regionName = self.initRegionName;
        // localStorage.$LOGINDATA = self.initLoginData;
    }

    self.completeInit = function() {
        if(!self.transferStatus) {
            return;
        }
        self.closeInitModel();
    }

    self.changeToVpc = function() {
        if(self.vpcStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.vpcCompelete'), "error", 5000);
            return;
        }else {
           self.changeModuleShow('vpcShow');
        }
    }

    self.changeToAlarm = function() {
        if(self.canSetInitVpc){
            if(self.alarmStatus) {
                alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.alarmCompelete'), "error", 5000);
                return;
            }else if(!self.vpcStatus) {
                alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.vpcNetWorkCompelete'), "error", 5000);
            
            }else {
               self.changeModuleShow('alarmShow');
            }
        }else if(!self.canSetInitVpc){
            if(self.alarmStatus) {
                alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.alarmCompelete'), "error", 5000);
                return;
            }else {
               self.changeModuleShow('alarmShow');
            }
        }
    }

    self.changeToStorage = function() {
        if(self.storageStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.backendCompelete'), "error", 5000);
            return;
        }else if(!self.alarmStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.completeSetting'), "error", 5000);
        }else {
            self.changeModuleShow('storageShow');
        }
    };

    self.changeToTransfer = function() {
        if(self.transferStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.completeShare'), "error", 5000);
            return;
        }else if(!self.storageStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.configHost'), "error", 5000);
        }else {
           self.changeModuleShow('transferShow');
        }
    }

    self.changeToCheckIp = function() {
        if(self.checkIpStatus) {
            return;
        }else {
           self.changeModuleShow('checkIpShow');
        }
    }

    self.gotoAlarm = function() {
        if(!self.vpcStatus) {
            return;
        }else if(self.alarmStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.alarmCompelete'), "error", 5000);
            return;
        }
        self.changeModuleShow('alarmShow');
    }

    self.gotoStorage = function() {
        if(!self.alarmStatus) {
            return;
        }else if(self.storageStatus) {
            alertSrv.set("",$translate.instant('aws.initSetting.settingTranslate.backendCompelete'), "error", 5000);
            return;
        }
        self.changeModuleShow('storageShow');
    }

    self.gotoTransfer = function() {
        if(!self.storageStatus) {
            return;
        }else if(self.transferStatus) {
            alertSrv.set("", $translate.instant('aws.initSetting.settingTranslate.completeShare'), "error", 5000);
            return;
        }
        self.changeModuleShow('transferShow');
    }

    self.changeModuleShow = function(module) {
        var itemList = ["vpcShow", "alarmShow", "storageShow", "transferShow", "checkIpShow", "regionShow"];
        itemList.forEach(function(item) {
            if(item == module) {
                self[item] = true;
            }else {
                self[item] = false;
            }
        });
        initStep();
    }
    initSettingSrv.context = self;
    initSettingSrv.mainScope = mainScope;
    
    //判断是否需要初始化vpc网络
    function needInitVpcNet(){
        let regionBusiAuth=localStorage.regionBusiAuth!=2?JSON.parse(localStorage.regionBusiAuth):[];
        let vpcIndex=regionBusiAuth.indexOf("3");
        let storageIndex=regionBusiAuth.indexOf("2");
        if(vpcIndex>-1&&$rootScope.customizedIsAdmin){
           self.canSetInitVpc=true; 
        }else{
           self.canSetInitVpc=false;
           self.changeModuleShow('alarmShow');
        }
        if(storageIndex>-1){
           self.canSetInitStorage=true;
        }else{
           self.canSetInitStorage=false; 
        }
    }
    needInitVpcNet();

}]);

initSettingModule.service("initSettingSrv", ["$http",function($http){
    var static_user_url = "awstack-user/v1";
    return {
        context: null,
        mainScope: null,
        configStorageData: function(option,headers) {
            return $http({
                method: "POST",
                url: static_user_url + "/network/config/storage",
                data:option,
                headers:headers
            });
        },
        checkStorageData: function(option,headers) {
            return $http({
                method: "POST",
                url: static_user_url + "/network/check/storage",
                data:option,
                headers:headers
            });
        },
        checkResultData: function(params) {
            return $http({
                method: "GET",
                url: static_user_url + "/network/check/result/storage",
                params: params
            });
        },
        getRegionList: function(headers){
            return $http({
                method:"GET",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions",
                headers:headers
            });
        },
        getSettingStatus: function(){
            return $http({
                method:"GET",
                url: "awstack-user/v1/ent/" + localStorage.enterpriseUid + "/platform/initialization"
            });
        },
        getStorage: function(headers){
            return $http({
                method: "GET",
                url: "/awstack-user/v1/storage/list",
                headers:headers
            })
        },
        transferImage: function(regionKey, params,headers) {
            return $http({
                method:"POST",
                url: "awstack-user/v1/transferImage2SharedStorage/" + regionKey,
                data: params,
                headers:headers 
            });
        },
        getStorageIp: function(regionKey,headers){
            return $http({
                method:"GET",
                url: "awstack-user/v1/region/"+regionKey+"/iprange",
                headers:headers
            });
        },
        getAvailableDisks:function(regionKey,headers){
            return $http({
                method:"GET",
                url: "awstack-user/v1/region/"+regionKey+"/disk/ceph",
                headers:headers
            });
        },
        changeNewRegion:function(regionKey){
            return $http({
                method:"POST",
                url:"/awstack-user/v1/newregion",
                data:{
                    'regionKey':regionKey
                }
            })
        },
        isHealthAction: function (options,regionUid) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/health",
                params: options
            });
        },
    }
}])