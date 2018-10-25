import "./generalSrv";

var generalModule = angular.module("generalModule", ["generalSrv"]);
generalModule.controller("generalCtrl", ["$scope", "generalSrv", "$timeout", "alertSrv", "$translate", function($scope, generalSrv, $timeout,
    alertSrv, $translate) {
    var self = $scope;
    self.timeList = [
        { 
            id: "300",
            name: $translate.instant("aws.general.time.5min")
        }, { 
            id: "600",
            name: $translate.instant("aws.general.time.10min")
        }, {
            id: "900",
            name: $translate.instant("aws.general.time.15min")
        }, {
            id: "1800",
            name: $translate.instant("aws.general.time.30min")
        }, {
            id: "3600",
            name: $translate.instant("aws.general.time.1hour")
        }, {
            id: "7200",
            name: $translate.instant("aws.general.time.2hour")
        }, {
            id: "10800",
            name: $translate.instant("aws.general.time.3hour")
        }, {
            id: "21600",
            name: $translate.instant("aws.general.time.6hour")
        }];
    self.upsTypeList = [
        { 
            id: "APC",
            name: $translate.instant("aws.general.ups.apc")
        }, { 
            id: "GCCALLIANCE",
            name: $translate.instant("aws.general.ups.gcc")
        }];
    self.general = {
        timeout: "",
        upsType: "",
        dataCenter: ""
    }
    self.expirationTime = "";
    self.canSub = false;
    self.canAdd = false;
    self.canTimeout = false;
    self.canExpiration = false;
    self.canUps = false;
    self.canEdit = false;
    self.canSelect = false;
    self.expTipShow = false;
    self.upsTipShow = false;
    self.timeSub = function() {
        self.expirationTime = parseInt(self.expirationTime) - 1;
        self.expirationTimeChanged();
    };
    self.timeAdd = function() {
        self.expirationTime = parseInt(self.expirationTime) + 1;
        self.expirationTimeChanged();
    };
    self.expirationTimeChanged = function() {
        var time = self.expirationTime;
        if(!time || !parseInt(time) || parseInt(time) < 1 || parseInt(time) > 720) {
            self.canSub = true;
            self.canAdd = true;
        }else if(parseInt(time) == 1) {
            self.canSub = true;
            self.canAdd = false;
        }else if(parseInt(time) == 720) {
            self.canSub = false;
            self.canAdd = true;
        }else {
            self.canSub = false;
            self.canAdd = false;
        }
    }
    getRegionList();
    initTimeoutData();
    initRecycleTimeData();
    initUpsData();

    self.$on("recycleTimeSuccess", function(e, data) {
        self.modifyTips = $translate.instant("aws.general.modifySuccess");
        if(self.canEdit) {
            self.expTipShow = true;
        }
        if(self.canSelect) {
            self.upsTipShow = true;
        }
        $timeout(function(){
            self.expTipShow = false;
            self.upsTipShow = false;
        },2500);
        self.canSub = false;
        self.canAdd = false;
        self.canEdit = false;
        self.canSelect = false;
        self.canExpiration = false;
        self.canUps = false;
        self.expirationTimeChanged();
    });

    self.$on("recycleTimeFail", function(e, data) {
        self.modifyTips = $translate.instant("aws.general.modifyFailed");
        if(self.canEdit) {
            self.expTipShow = true;
        }
        if(self.canSelect) {
            self.upsTipShow = true;
        }
        $timeout(function(){
            self.expTipShow = false;
            self.upsTipShow = false;
        },2500);
        self.canSub = false;
        self.canAdd = false;
        self.canEdit = false;
        self.canSelect = false;
        self.canExpiration = false;
        self.canUps = false;
    });

    function getRegionList() {
        generalSrv.getRegionList().then(function(res) {
            if(res && res.data && angular.isArray(res.data)) {
                self.regionList = res.data;
                self.regionList.forEach(function(item, index) {
                    if(item.regionKey == localStorage.regionKey) {
                        self.general.dataCenter = item;
                    }
                });
            }
        });
    }

    function initTimeoutData() {
        generalSrv.getTimeoutData().then(function(res) {
            if(res && res.data && res.data.length) {
                self.timeList.forEach(function(item, index) {
                    if(item.id == res.data[0].paramValue) {
                        self.general.timeout = self.timeList[index];
                    }
                });
                self.initTimeout = res.data[0].paramValue;
                self.paramId = res.data[0].paramId;
                self.paramName = res.data[0].paramName;
            }
        });
    }

    function initRecycleTimeData(regionKey) {
        var regionKey = regionKey || localStorage.regionKey;
        generalSrv.getRecycleTimeData(regionKey).then(function(res) {
            if(res && res.data) {
                self.expirationTime = parseInt(res.data.reclaim_instance_interval / 3600);
                self.initExpirationTime = parseInt(res.data.reclaim_instance_interval / 3600);
                self.expirationTimeChanged();
            }
        });
    }

    function initUpsData(regionKey) {
        var regionKey = regionKey || localStorage.regionKey;
        generalSrv.getUpsData(regionKey).then(function(res) {
            if(res && res.data) {
                var upsType = res.data.ups_type;
                self.upsTypeList.forEach(function(item, index) {
                    if(item.id == upsType) {
                        self.general.upsType = self.upsTypeList[index];
                    }
                });
                self.initUpsType = upsType;
            }
        });
    }

    self.changeRegion = function(region, type) {
        var regionKey = region.regionKey;
        initRecycleTimeData(regionKey);
        initUpsData(regionKey);
    }

    /**
        保存按钮时间: 进入页面时存储一下初始值, 点击保存时判断三个输入框参数是否发生变化,
        有变化则调用相关API, 无变化则不调用
    **/
    self.saveGeneral = function(generalForm) {
        self.canTimeout = true;
        self.canExpiration = true;
        self.canUps = true;
        if(generalForm.$valid) {
            // 判断是否修改了系统超时时间
            if(self.general.timeout.id != self.initTimeout) {
                editTimeoutData();
            }else {
                self.canTimeout = false;
            }
            //判断是否修改了回收站资源过期时间和UPS类型
            if (self.expirationTime != self.initExpirationTime || self.general.upsType.id != self.initUpsType) {
                editRecycleTimeData();
            }else {
                self.canExpiration = false;
                self.canUps = false;
            }
        }
    }

    //修改系统超时时间
    function editTimeoutData() {
        var option = {
            paramId: self.paramId,
            enterpriseUid: localStorage.enterpriseUid,
            regionUid: "0",
            parentId: "777",
            paramName: self.paramName,
            paramValue: self.general.timeout.id
        }
        generalSrv.editTimeoutData(option).then(function(res) {
            if(res && res.status == "0") {
                
            }
        }).finally(function() {
            self.canTimeout = false;
        });
    }

    // 修改回收站资源过期时间和UPS类型
    function editRecycleTimeData() {
        var loginData = angular.fromJson(localStorage.$LOGINDATA);
        var regionUid = loginData.regionUid;
        var enterpriseUid = localStorage.enterpriseUid;
        var params = {};
        if(self.expirationTime != self.initExpirationTime) {
            params.reclaim_instance_interval = self.expirationTime * 3600;
            self.initExpirationTime = self.expirationTime;
            self.canSub = true;
            self.canAdd = true;
            self.canEdit = true;
        }
        if(self.general.upsType.id != self.initUpsType) {
            params.ups_type = self.general.upsType.id;
            self.initUpsType = self.general.upsType.id;
            self.canSelect = true;
        }
        var option = {
            regionKey: self.general.dataCenter.regionKey,
            confKey: "region",
            keyValuePairs: params
        }
        generalSrv.editRecycleTimeData(enterpriseUid, regionUid, option).then(function(res) {
            if(res && res.status == "0") {

            }else {
                self.canSub = false;
                self.canAdd = false;
                self.canEdit = false;
                self.canSelect = false;
                self.canExpiration = false;
                self.canUps = false;
                if(res && res.code == "01080305") {
                    var msg = $translate.instant("aws.statusCode.01080305");
                    alertSrv.set("", msg, "error", 5000);
                }
            }
        }).finally(function() {
            // self.canExpiration = false;
            // self.canUps = false;
        });
    }
}]);
