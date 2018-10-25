var billingSrvModule = angular.module("billingSrvModule", []);
billingSrvModule.service('billingSrv', ['$http', function($http) {
	return {
		getBillingStatus: function() {
			return $http({
				method: "GET",
				url: "awstack-user/v1/params?enterpriseUid=" + localStorage.enterpriseUid + "&parentId=80"
			})
		},
		updateBillingStatus: function(options) {
			return $http({
				method: "PUT",
				url: "awstack-user/v1/params",
				data: {
					"enterpriseUid": options.enterpriseUid,
					"regionUid": options.regionUid,
					"parentId": options.parentId,
					"paramName": options.paramName,
					"paramId": options.paramId,
					"paramValue": options.paramValue
				}
			})
		},
		//获取数据中心消费列表
		getRegionConsumeData:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/consumptionSatistics/findConsumptionAmountOfRegions",
				data:options?options:{}
			})
		},
		//获取部门消费金额列表
		getDepConsumeData:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/consumptionSatistics/findConsumptionAmountOfDepts",
				data:options
			})
		},
		//获取项目消费金额列表
		getProConsumeData:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/consumptionSatistics/findConsumptionAmountOfProjects",
				data:options
			})
		},
		//获取用户消费金额列表
		getUserConsumeData:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/consumptionSatistics/findConsumptionAmountOfUsers",
				data:options
			})
		},
		//获取各种资源类型的消费金额及占比
		getResConsumeData:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/consumptionSatistics/findConsumptionAmountProportionOfResources",
				data:options?options:{}
			})
		},
		//获取用户某种类型资源的消费记录
		getResConsumeDataOfUser:function(options){
			return $http({
				method:"GET",
				url:"awstack-boss/consumptionSatistics/findUserResourcesChargeRecords",
				params:options
			})
		},
		getPriceManageData:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/priceManager/findChargeItems",
				data:options
			})
		},
		addChargingItem:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/priceManager/addChargeItem",
				data:options
			})
		},
		editChargingItem:function(options){
			return $http({
				method:"POST",
				url:"awstack-boss/priceManager/editChargeItem",
				data:options
			})
		},
		deleteChargingItem:function(options){
			return $http({
				method:"DELETE",
				url:"awstack-boss/priceManager/deleteChargeItem",
				data:options,
				headers: {
                    "Content-Type":"application/json"
                }
			})
		},
		getRegion:function(options){
			return $http({
				method:"GET",
				url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions"
			})
		},
		getLoginAccountConsumeData: function() {
			return $http({
				method: "GET",
				url: "awstack-boss/consumptionSatistics/queryLoginAccountConsumptionAmount",
				params: {
					userId: localStorage.userUid
				}
			})
		}

	}
}]);

billingSrvModule.service('billingHeaderSrv', ["$rootScope", "$translate", "billingSrv", function($rootScope, $translate, billingSrv) {
	this.getRegionList = function(self) {
		billingSrv.getRegionConsumeData().then(function(res) {
			if (res && res.data) {
				var regionsList = [];
				_.map(res.data, function(item) {
					regionsList.push({
						name: item.region,
						id: item.region
					});
				});
				$rootScope.billOptions.regionsList = regionsList;
				_.each(regionsList, item => {
					if (item.id == self.regionName) {
						self.filterData.region = item;
					}
				});
			}
		});
	}

	this.getDomainList = function(self) {
		var params = {
			region: self.regionName
		}
		billingSrv.getDepConsumeData(params).then(function(res) {
			if (res && res.data) {
				var domainsList = [];
				_.map(res.data, function(item) {
					if (item.deptName == 'default') {
                        item.disDomainName = '默认部门';
                    } else {
                        item.disDomainName = item.deptName;
                    }
					domainsList.push({
						name: item.disDomainName,
						id: item.deptId,
					});
				});
				domainsList.unshift({
					name: "所有部门",
					id: "allDomain"
				});
				domainsList.unshift({
					name: "返回数据中心",
					id: "backRegion"
				});
				$rootScope.billOptions.domainsList = domainsList;
				_.each(domainsList, item => {
					if (item.id == self.deptId) {
						self.filterData.domain = item;
					}
				});
			}
		});
	}

	this.getProjectList = function(self) {
		var params = {
			deptId: self.deptId
		}
		billingSrv.getProConsumeData(params).then(function(res) {
			if (res && res.data) {
				var projectsList = [];
				_.map(res.data, function(item) {
					if (item.projectName == 'admin' && item.deptId == 'default') {
                        item.disProjectName = '默认项目';
                    } else {
                        item.disProjectName = item.projectName;
                    }
					projectsList.push({
						name: item.disProjectName,
						id: item.projectId
					});
				});
				projectsList.unshift({
					name: "所有项目",
					id: "allProject"
				});
				projectsList.unshift({
					name: "返回部门",
					id: "backDomain"
				});
				$rootScope.billOptions.projectsList = projectsList;
				_.each(projectsList, item => {
					if (item.id == self.projectId) {
						self.filterData.project = item;
					}
				});
			}
		});
	}

	this.getUserList = function(self) {
		var params = {
			projectId: self.projectId
		}
		billingSrv.getUserConsumeData(params).then(function(res) {
			if (res && res.data) {
				var usersList = [];
				_.map(res.data, function(item) {
					usersList.push({
						name: item.userName,
						consumeUserId: item.userId
					});
				});
				usersList.unshift({
					name: "所有用户",
					id: "allUser"
				});
				usersList.unshift({
					name: "返回项目",
					id: "backProject"
				});
				$rootScope.billOptions.usersList = usersList;
				_.each(usersList, item => {
					if (item.consumeUserId == self.userId) {
						self.filterData.user = item;
					}
				});
			}
		});
	}

	this.getResList = function(self) {
		var params = {
			userId: self.userId,
		}
		billingSrv.getResConsumeData(params).then(function(res) {
			if (res && res.data) {
				var resList = [];
				_.map(res.data, function(item) {
					resList.push({
						name: $translate.instant("aws.bill." + (item.resourceName).toLowerCase()),
						resName: item.resourceName
					});
				});
				resList.unshift({
					name: "所有资源",
					id: "allRes"
				});
				$rootScope.billOptions.resList = resList;
				_.each(resList, item => {
					if (item.resName == self.resName) {
						self.filterData.userRes = item;
					}
				});
			}
		});
	}
}]);