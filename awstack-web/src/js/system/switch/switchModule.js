import "./switchSrv";
angular
    .module("switchModule",[ "ngAnimate", "ui.bootstrap","ngMessages","switchSrv"])
    .controller("switchCtrl",switchCtrl)

switchCtrl.$inject = ["$rootScope", "$scope", "NgTableParams", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter","switchSrv","$routeParams"];
function switchCtrl($rootScope, $scope, NgTableParams, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter,switchSrv,$routeParams){
	var self = $scope;
	self.Switch = {
		L3_Active:true
	}
	self.buttonSubmit=false;
	var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
	var regionKey=JSON.parse(localStorage.$LOGINDATA).regionKey;
    self.clearSpace = function() {
	    var content = {
	        target: "clearSpace",
	        msg: "<span>" + $translate.instant("aws.img.clear_space_msg") + "</span>",
	    };
	    self.$emit("delete", content);
    };
    self.$on("clearSpace", function() {
        switchSrv.delBuffer()
    });
	function switchFun(){
		switchSrv.getLimitData(regionUid).then(function(res){
			/*当没有时添加有*/
			if(res&&res.data.length!=0){
	            var switchData=JSON.parse(res.data[0].paramValue);
				self.Switch.L3_Active = switchData.L3_Active;
				self.updateLimit= function(){
					self.buttonSubmit = false;
					/*var options=[
						{
							name:"公网IP",
							description:"floating_ips",
							status:{state:self.Switch.L3_Active}
						},{
							name:"路由器",
							description:"routers",
							status:{state:self.Switch.L3_Active}
						}
					]
					options.forEach(function(item){
						switchSrv.handleMenu(item)
					});*/
					var data={
						"L3_Active":self.Switch.L3_Active
					};
					data=JSON.stringify(data);
					let option={
						"paramName":"L3_switch",
						"paramId":res.data[0].paramId,
						"enterpriseUid":localStorage.enterpriseUid,
						"paramValue":data,
						"parentId":724,
						"regionUid":regionUid
					};	
					self.buttonSubmit = true;
					switchSrv.editData(option).finally(function(){
						self.buttonSubmit=false;
					});

				};
			}else{
				self.updateLimit= function(){
					self.buttonSubmit = false;
					/*var options=[
						{
							name:"公网IP",
							description:"floating_ips",
							status:{state:self.Switch.L3_Active}
						},{
							name:"路由器",
							description:"routers",
							status:{state:self.Switch.L3_Active}
						}
					]
					options.forEach(function(item){
						switchSrv.handleMenu(item)
					});*/
					var data={
						"L3_Active":self.Switch.L3_Active
					}
					data=JSON.stringify(data);
					var option={
						"enterpriseUid":localStorage.enterpriseUid,
						"paramValue":data,
						"paramName":"L3_switch",
						"parentId":724,
						"paramLevel":2,
						"paramDesc":"开关",
						"regionKey":regionKey,
						"regionUid":regionUid
					};
					self.buttonSubmit = true;
					switchSrv.addData(option).finally(function(){
						self.buttonSubmit = false;
						switchFun()
					});
				};
			}
		});
	}
	switchFun()
}
