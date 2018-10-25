import "./bandWidthSrv";
angular
    .module("bandWidthModule",[ "ngAnimate", "ui.bootstrap","ngMessages","bandWidthSrv"])
    .controller("bandWidthCtrl",bandWidthCtrl)

bandWidthCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","bandWidthSrv","$routeParams"];
function bandWidthCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,bandWidthSrv,$routeParams){
	var self = $scope;
	self.submitValid = false;
	self.fixTips=false;
	self.limitType = {
		fixType:{
			"ipBandwidth":"",
			"routerBandwidth":"",
			"networkBandwidth":$translate.instant("aws.bandwidths.unlimited")
		},
		cusotmType:{
			"ipBandwidthstart":"",
			"ipBandwidthend":"",
			"routerBandwidthstart":"",
			"routerBandwidthend":""
		}
	}

	self.limitBandWidth = {
		limitActive:false,
		typeActive:1,
		limitType:self.limitType	
	}
	self.buttonSubmit=false;
	self.limitFun=function(item){
		if(item==false){
			self.limitType.fixType.networkBandwidth=$translate.instant("aws.bandwidths.unlimited");

		}else{
			if(self.limitType.fixType.networkBandwidth==$translate.instant("aws.bandwidths.unlimited")){
				self.limitType.fixType.networkBandwidth=5;
			}
		}
	}
	function handleBandWidth(){
		bandWidthSrv.getLimitData().then(function(res){
			/*当没有时添加有*/
			if(res&&res.data.length!=0){
	            var limitData=JSON.parse(res.data[0].paramValue);
	            self.limitBandWidth={
					limitActive:limitData["limitActive"],
					typeActive:limitData["typeActive"],
					limitType:limitData["limitType"]
				};
				self.limitType = limitData["limitType"];
				self.updateLimit= function(LimitForm){
					self.submitValid =false;
					self.buttonSubmit = false;
					if(LimitForm.$valid){
						var data={
							"limitActive":self.limitBandWidth.limitActive,
							"typeActive":self.limitBandWidth.typeActive,
							"limitType":self.limitType
						};
						data=JSON.stringify(data);
						let option={
							"paramName":"limitBandWidth",
							"paramId":res.data[0].paramId,
							"enterpriseUid":localStorage.enterpriseUid,
							"paramValue":data,
							"parentId":707,
							"regionUid":0
						};	
						self.buttonSubmit = true;
						bandWidthSrv.editData(option).finally(function(){
							self.buttonSubmit=false;
						})
					}else{
						$scope.submitValid = true;
					}
				};
			}else{
				self.updateLimit= function(LimitForm){
					self.submitValid =false;
					self.buttonSubmit = false;
					if(LimitForm.$valid){
						var data={
							"limitActive":self.limitBandWidth.limitActive,
							"typeActive":self.limitBandWidth.typeActive,
							"limitType":self.limitType
						};
						data=JSON.stringify(data);
						var option={
							"enterpriseUid":localStorage.enterpriseUid,
							"paramValue":data,
							"paramName":"limitBandWidth",
							"parentId":707,
							"paramLevel":2,
							"paramDesc":"带宽限制",
							"regionKey":0,
							"regionUid":0
						};
						self.buttonSubmit = true;
						bandWidthSrv.addData(option).finally(function(){
							self.buttonSubmit = false;
							handleBandWidth();
						});
					}else{
						self.submitValid =true;
					}
				};
			}
		});
	}
	handleBandWidth()
}
