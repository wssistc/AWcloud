
var initTransferSettingModule = angular.module("initTransferSettingModule", []);

initTransferSettingModule.controller("initTransferSettingCtrl", ["$scope", "$rootScope", "$uibModal", "initSettingSrv", "alertSrv", "$translate",
    function($scope, $rootScope, $uibModal, initSettingSrv, alertSrv, $translate) {

    var self = $scope;
    var context = initSettingSrv.context;
    var mainScope = initSettingSrv.mainScope;
    self.submitValid = false;
    self.showLoading = false;
    self.showProgress = false;

    self.progess = {
        number: "0%",
        tips: $translate.instant("aws.initSetting.transferImage.transferInitTips"),
        status: true
    }

    // self.deviceList = [
    //     { id:"insideCeph", name:"超融合ceph存储" },
    //     { id:"outsideCeph", name:"外部ceph存储" },
    //     { id:"nfs", name:"NFS" },
    //     { id:"iscsi", name:"通用ISCSI" },
    //     { id:"fc", name:"通用FC" },
    //     { id:"ruijie", name:"锐捷" },
    //     { id:"toyou", name:"同有"}
    // ];

    // self.transfer = {
    //     device: self.deviceList[0]
    // }

    initSettingSrv.getStorage(context.initSetting_headers).then(function(result) {
        if(result && result.data && result.data.length) {
            self.deviceList = result.data;
            self.transfer = {
                device: self.deviceList[0]
            }
        }
    });

    self.startTransfer = function(transferForm) {
        if(transferForm.$valid) {
            $uibModal.open({
                animation: true,
                templateUrl: "transferAlert.html",
                controller: "transferAlertController",
                resolve: {
                    transferConfirm: function() {
                        return self.transferConfirm;
                    }
                }
            });
        }else {
            self.submitValid = true;
        }
    }

    self.transferConfirm = function() {
        context.transferDisabled = true;
        self.showProgress = true;
        self.progess.number = "0%";
        self.progess.tips = $translate.instant("aws.initSetting.transferImage.transferInitTips");
        self.progess.status = true;
        var regionKey = context.setting.region.regionKey;
        var loginData = angular.fromJson(localStorage.$LOGINDATA);
        var regionUid = loginData.regionUid;
        var params = {
            volumeType: self.transfer.device.capabilities.volume_backend_name,
            regionKey: context.setting.region.regionKey,
            regionUid: regionUid,
            enterpriseUid: localStorage.enterpriseUid
        }
        initSettingSrv.transferImage(regionKey, params,context.initSetting_headers).then(function(result) {
            if(result && result.status == "0") {
                context.getSettingStatus();
                // 结果通过推送消息处理
            }else {
                self.showProgress = false;
                context.transferDisabled = false;
                if(result && result.code == "01080305") {
                    var msg = $translate.instant("aws.system.storagement.storageTranslate.clusterLimitOperation");
                    alertSrv.set("", msg, "error", 5000);
                }
            }
        });
    }

    self.$on("transferProgress", function(e, data) {
        var data = angular.fromJson(data);
        var process = data.process.stdout.split(" ")[0];
        var current = process.split("/")[0];
        var total = process.split("/")[1];
        if(parseInt(current) >= 0 && parseInt(total) >= 0) {
            if(total == "0") {
                self.progess.number = "90%";
            }else {
                var number = parseInt(current / total * 100);
                if(number < 100) {
                    self.progess.number = number + "%";
                }
            }
            self.progess.tips = $translate.instant("aws.initSetting.transferImage.startTransfer");
            self.showProgress = true;
            self.$apply();
        }
    });

    self.$on("transferSuccess", function(e, data) {
        context.getSettingStatus();
        self.progess.number = "100%";
        self.progess.tips = $translate.instant("aws.initSetting.transferImage.transferSuccess");
        self.progess.status = true;
        self.$apply();
    });

    
    self.$on("transferFailed", function(e, data) {
        context.transferDisabled = false;
        context.getSettingStatus();
        self.progess.number = "100%";
        self.progess.tips = $translate.instant("aws.initSetting.transferImage.transferFailed");
        self.progess.status = false;
        self.$apply();
    });

}]);

initTransferSettingModule.controller('transferAlertController', ["$scope", "$uibModalInstance", "transferConfirm", function($scope, $uibModalInstance, transferConfirm) {
    var self = $scope;
    self.transConfirm = function() {
        $uibModalInstance.close();
        transferConfirm();
    }
    
}]);