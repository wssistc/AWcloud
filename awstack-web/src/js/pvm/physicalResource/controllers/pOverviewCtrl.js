import pOverviewSrv from "../services/pOverviewSrv";
import "../../../user/userDataSrv";
import "../../../project/projectSrv";
import "../../../department/depviewSrv";
import "../../../monitor/alarmManagement/alarmEventSrv";
import {
	PiePanelDefault
} from "../../../chartpanel";

export function pOverviewCtrl($scope, rootScope, $location, checkedSrv, pOverviewSrv,
	NgTableParams, uibModal, $translate, $window, $timeout, userDataSrv, $routeParams, projectDataSrv, depviewsrv, alarmEventSrv) {
	var self = $scope;
	var scope = $scope;
	if(localStorage.installIronic==1){
		self.pluginSwitch=1;
	}else{
		self.pluginSwitch=2;
		return;
	}
	self.headers = {
		"name": $translate.instant("aws.users.userName"),
		"role": $translate.instant("aws.users.role")
	};
	//获取用户列表
	getProUserList();
	initMonitor();
	getProRes();
	getPhymacRes();
	function getProUserList() {
		pOverviewSrv.getProUserTableData(localStorage.projectUid).then(function (result) {
			result ? self.loadData = true : "";
			if (result && result.data) {
				result.data.map(function (item) {
					item.role = item.roleidlist[0].name;
				});
				userDataSrv.userTableAllData = result.data;
				self.tableParams = new NgTableParams({
					count: 5
				}, {
					counts: [],
					dataset: result.data
				});
			}
		});
	}
	function getProRes(){
		pOverviewSrv.getProRes().then(function(data){
			if(data && data.data){
				self.proResData = {
					success:data.data.success,
					total:data.data.total,
					error:data.data.error
				}
				self.cvmViewInsPieChart = new PiePanelDefault();
				self.cvmViewInsPieChart.panels.data = [	
					{name:"正常",value:self.proResData.success?self.proResData.success:0},
                     {name:"异常",value:self.proResData.error?self.proResData.error:0},
					
                    ];
			self.cvmViewInsPieChart.panels.pieType = "category";
			self.cvmViewInsPieChart.panels.colors = ["#1abc9c","#e74c3c"]; 
			}
		})
	}
	function getPhymacRes(){
		var postData= {
			type:"project_quota",
			targetId:localStorage.projectUid,
			enterpriseUid:localStorage.enterpriseUid
		};
		self.phyMacData = {
			inuse:0,
			total:0,
			onuse:0
		}
		pOverviewSrv.getproQuotas(postData).then(function(data){
			if(data && data.data){
				var quotaData ={};
				data.data.map(function(item){
					if(item.name =="phy_instances"){
						quotaData =item ;
					}
				})
				self.phyMacData.total = quotaData.hardLimit;
				var postData_= {
					type:"project_quota",
					domainUid:localStorage.domainUid,
					enterpriseUid:localStorage.enterpriseUid,
					projectUid:localStorage.projectUid
				};
				pOverviewSrv.getQuotasUsed(postData_).then(function(data){
					if(data && data.data){
						var quotaData ={};
						data.data.map(function(item){
							if(item.name =="phy_instances"){
								quotaData =item ;
							}
						})
						self.phyMacData.inuse = isNaN(quotaData.inUse)?0:quotaData.inUse;
						self.phyMacData.onuse = self.phyMacData.total-self.phyMacData.inuse
					}
					self.phyMacChart = new PiePanelDefault();
					self.phyMacChart.panels.data = [
							{name:"已使用",value:self.phyMacData.inuse},
							{name:"未使用",value:self.phyMacData.onuse},
						];
					self.phyMacChart.panels.pieType = "percent";
					self.phyMacChart.panels.colors = ["#51a3ff","#cacaca",]; 
				})
			}
		})
		
	
	}
	function initMonitor() {
		alarmEventSrv.getNewAlarm({
			status: "new",
			//projectId:localStorage.projectUid,
			//enterpriseId:localStorage.enterpriseUid
		}).then(function (result) {
			self.newAlarms_data = [];
			if (result && result.data) {
				if (result.data.length > 5) {
					_.map(result.data, function (item, i) {
						formateTableData(item);
						if (i > 4) {
							return;
						}
						self.newAlarms_data.push({
							hostname: item.hostname,
							_alarmType: item._alarmType,
							alarmType: item.alarmType,
							severity: item.severity,
							createtime: item.createtime
						});
					});
				} else {
					self.newAlarms_data = _.map(result.data, function (item) {
						formateTableData(item);
						return item;
					});
				}
			}
		});

	}
	function formateTableData(item){
            if(item.alarmType == "threshold"){
                item._alarmType = $translate.instant("aws.monitor.alarmModule.threshold");
            }else if(item.alarmType == "healthcheck"){
                item._alarmType = $translate.instant("aws.monitor.alarmModule.healthcheck");
            }else if(item.alarmType == "computeha"){
                item._alarmType = $translate.instant("aws.monitor.alarmModule.computeha");
            }
            if(item.severity == "critical"){
                item.severity = $translate.instant("aws.monitor.alarmModule.critical");
            }else if(item.severity == "moderate"){
                item.severity = $translate.instant("aws.monitor.alarmModule.moderate");
            }else if(item.severity == "low"){
                item.severity = $translate.instant("aws.monitor.alarmModule.low");
            }
        }
}


let ctrlList = [pOverviewCtrl];
angular.forEach(ctrlList, function (item) {
	item.$inject = ["$scope", "$rootScope", "$location", "checkedSrv", "pOverviewSrv",
		"NgTableParams", "$uibModal", "$translate", "$window", "$timeout", "userDataSrv", "$routeParams", "projectDataSrv", "depviewsrv", "alarmEventSrv"
	];
});