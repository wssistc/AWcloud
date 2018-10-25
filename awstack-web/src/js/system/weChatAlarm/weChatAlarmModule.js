import "./weChatAlarmSrv";

var weChatAlarmModule = angular.module("weChatAlarmModule",["ngMessages","weChatAlarmSrvModule"]);
weChatAlarmModule.controller('weChatAlarmCtrl', ["$scope", "$uibModal", "$translate", "alertSrv", "weChatAlarmSrv", function($scope, $uibModal,
	$translate, alertSrv, weChatAlarmSrv) {
	$scope.weChat = {
		app_id: "",
		app_secret: "",
		url: "",
		token: "",
		encoding_aes_key: "",
		encryption: "aes",
		isUse: false
	};
	$scope.canSubmit = false;
	$scope.submitValid = false;
	$scope.showQRCodeText = false;
	$scope.saveWeChat = saveWeChat;
	$scope.openQRCodeModel = openQRCodeModel;

	getWeChatData();

	function getWeChatData() {
		weChatAlarmSrv.getWeChatData().then(function(res) {
			if(res && res.data && angular.isArray(res.data) && res.data.length !=0) {
				$scope.hasAdd = true;
	            var weChatData=JSON.parse(res.data[0].paramValue);
	            var weChatPassword=weChatData["weixin.app_secret"].split(",").map(item=>{return String.fromCharCode(item)}).join("");
	            $scope.weChat = {
					app_id: weChatData["weixin.app_id"],
					//app_secret: weChatData["weixin.app_secret"],
					app_secret: weChatPassword,
					url: weChatData["weixin.url"],
					token: weChatData["weixin.token"],
					encoding_aes_key: weChatData["weixin.encoding_aes_key"],
					encryption: weChatData["weixin.encryption"],
					isUse: weChatData["weixin.isUse"] == "1" ? true : false
				};
				$scope.paramId = res.data[0].paramId;
			}else {
				$scope.hasAdd = false;				
			}
		});
	}

	function saveWeChat(weChat, weChatAlarmForm) {
		$scope.canSubmit = true;
		if(weChatAlarmForm.$valid){
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
			switch ($scope.hasAdd){
				case true:
					option.paramId = $scope.paramId;
					weChatAlarmSrv.editData(option).then(function(res) {
						if(res && res.status == "0"){
							checkWeChat(weChat);
						}
					}).finally(function(res) {
						$scope.canSubmit = false;
					});
					break;
				case false:
					option.paramLevel = 2;
					option.paramDesc = "微信配置";
					option.regionKey = 0;
					weChatAlarmSrv.addData(option).then(function(res) {
						if(res && res.status == "0"){
							$scope.hasAdd = true;
							$scope.paramId = res.data.paramId;
							checkWeChat(weChat);
						}
					}).finally(function() {
						$scope.canSubmit = false;
					});
					break;
			}
		}else{
			$scope.submitValid = true;
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
			"paramId": $scope.paramId
		};
		weChatAlarmSrv.weChatProxyInit(option).then(function(res) {
			if(res && res.status == "0") {
				var msg = $translate.instant("aws.system.weChatAlarm.saveSuccess");
				alertSrv.set("", msg, "success", 5000);
			}else {
				getWeChatData();
			}
		});
	}

	function openQRCodeModel() {
		$uibModal.open({
            animation: true,
            templateUrl: "QRCode.html",
            controller: "QRCodeController",
            resolve: {
                QRCodeSrc: function() {
                    return $scope.QRCodeSrc;
                }
            }
        });
	}
}]);

weChatAlarmModule.controller('QRCodeController', function($scope, QRCodeSrc) {
	$scope.QRCodeImg = QRCodeSrc;
});