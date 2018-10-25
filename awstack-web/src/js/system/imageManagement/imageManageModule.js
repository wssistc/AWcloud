import "./imageManageSrv";

var imageManageModule = angular.module("imageManageModule", ["imageManageSrvModule"]);
imageManageModule.controller('imageManageCtrl', ["$scope", "$uibModal", "$translate", "alertSrv", "imageManageSrv", function($scope, $uibModal,
	$translate, alertSrv, imageManageSrv) {
	var self = $scope;
    self.submitValid = false;
    self.showProgress = false;
    self.storageChange = false;
    self.transferDisabled = false;

    self.transfer = {
    	region: "",
        device: ""
    }
    self.progess = {
        number: "0%",
        tips: $translate.instant("aws.initSetting.transferImage.transferInitTips"),
        status: true
    }

    getRegionList();
    getStorageList();

    function getRegionList() {
	    imageManageSrv.getRegionList().then(function(res) {
	        if(res && res.data && angular.isArray(res.data)) {
	            self.regionList = res.data;
	            self.regionList.forEach(function(item, index) {
	                if(item.regionKey == localStorage.regionKey) {
	                    self.transfer.region = item;
	                }
	            });
	        }
	    });
	}

	function getStorageList() {
	    imageManageSrv.getStorage().then(function(result) {
	        if(result && result.data && result.data.length) {
	            self.deviceList = result.data;
	            self.deviceList = self.deviceList.filter(item => !(item.migrateGlanceStatus == "1"));
                self.deviceList.map(item => {
                    if(item.migrateGlanceStatus == "2") {
                        self.transfer.device = item;
                        self.transferDisabled = true;
                        self.storageChange = true;
                    }
                })
	        }
	    });
	}

	self.changeStorage = function() {
		self.showProgress = false;
		self.transferDisabled = false;
	}

    self.startTransfer = function(transferForm) {
        if(transferForm.$valid) {
            var content = {
                target: "transferConfirm",
                msg: "<span>" + $translate.instant("aws.initSetting.transferImage.transferTips3") + "</span>",
                type: "warning",
                btnType: "btn-info",
                data: ""
            };
            self.$emit("delete", content);
        }else {
            self.submitValid = true;
        }
    }

    self.$on("transferConfirm", function(e, data) {
        self.transferDisabled = true;
        self.storageChange = true;
        self.showProgress = true;
        self.progess.number = "0%";
        self.progess.tips = $translate.instant("aws.initSetting.transferImage.transferInitTips");
        self.progess.status = true;
        var loginData = angular.fromJson(localStorage.$LOGINDATA);
        var regionUid = loginData.regionUid;
        var params = {
            volumeType: self.transfer.device.capabilities.volume_backend_name,
            regionKey: localStorage.regionKey,
            regionUid: regionUid,
            enterpriseUid: localStorage.enterpriseUid
        }
        imageManageSrv.transferImage(params).then(function(result) {
            if(result && result.status == "0") {
                // 结果通过推送消息处理
            }else {
                self.showProgress = false;
                self.transferDisabled = false;
                self.storageChange = false;
                if(result && result.code == "01080305") {
                    var msg = $translate.instant("aws.system.storagement.storageTranslate.clusterLimitOperation");
                    alertSrv.set("", msg, "error", 5000);
                }
            }
        });
    });

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
    	getStorageList();
    	self.storageChange = false;
        self.progess.number = "100%";
        self.progess.tips = $translate.instant("aws.initSetting.transferImage.transferSuccess");
        self.progess.status = true;
        self.showProgress = true;
        self.$apply();
    });

    
    self.$on("transferFailed", function(e, data) {
        self.transferDisabled = false;
        self.storageChange = false;
        self.progess.number = "100%";
        self.progess.tips = $translate.instant("aws.initSetting.transferImage.transferFailed");
        self.progess.status = false;
        self.showProgress = true;
        self.$apply();
    });
}]);