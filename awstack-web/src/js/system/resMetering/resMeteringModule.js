import "./resMeteringSrv";
import { PiePanelDefault } from "../../chartpanel";

var resMeteringCtrlModule = angular.module('resMeteringCtrlModule', ['resMeteringSrvModule']);
resMeteringCtrlModule.controller('resMeteringCtrl', ['$scope', '$rootScope','$timeout', function(self,$rootScope,$timeout) {
	self.clickTab = function(tabIndex) {
		if (tabIndex == 1 && !self.resMeteringStatisticRandered) {
			self.$broadcast("resMeteringStatistic");
			self.resMeteringStatisticRandered = true;
		}
		if (tabIndex == 2 && !self.resUsageRateRandered) {
			self.$broadcast("resUsageRate");
			self.resUsageRateRandered = true;
		}
	};

	self.tab = {};
	if ($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN) {
		self.tab.index = 0;
	}else{
		self.tab.index = 1;

		$timeout(function(){
			self.clickTab(self.tab.index)
		},500)
	}
}]);

resMeteringCtrlModule.controller('resMeteringViewCtrl', ['$scope', '$rootScope', 'resMeteringSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'FileSaver', 'Blob', '$translate',
	function(self, $rootScope, resMeteringSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, FileSaver, Blob, $translate) {
		if ($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN || $rootScope.PROJECT_ADMIN) {
			self.options = {
				regionList: [
				// {
				// 	"name": $translate.instant('aws.bill.allRegion'),
				// 	"value": null
				// }
				],
				domainList: [
				// {
				// 	"name": $translate.instant('aws.bill.unSelect'),
				// 	"value": null
				// },
				{
					"name": $translate.instant('aws.bill.allDomain'),
					"value": "all"
				}],
				projectList: [
				// {
				// 	"name": $translate.instant('aws.bill.unSelect'),
				// 	"value": null
				// },
				{
					"name": $translate.instant('aws.bill.allProject'),
					"value": "all"
				}],
				statisticTypeList: [{
					"name": $translate.instant('aws.bill.currentUsingAmonut'),
					"value": "0"
				}, {
					"name": $translate.instant('aws.bill.alreadyUsedAmount'),
					"value": "1"
				}],
				topTypeList: [{
					"name": $translate.instant('aws.bill.highest'),
					"value": "desc"
				}, {
					"name": $translate.instant('aws.bill.lowest'),
					"value": "asc"
				}],
				topLengthList: [{
					"name": "TOP5",
					"value": "5"
				}, {
					"name": "TOP3",
					"value": "3"
				}]
			};

			self.query = function() {
				self.resViewPieChart = {};
				self.loadTopData = true;
				self.csv_info = "";
				self.filterDataDimension = self.filterData.dimension;
				let params = {
					usingType: self.filterData.dimension,
					orderType: self.filterData.topType,
					limitCount: self.filterData.topLength
				};
				let initPanels = function(res, type) {
					res ? self.loadTopData = false : true;
					if (res && res.data) {
						for (let key in res.data) {
							let total = 0;
							let unit, csv_unitTitle;
							if (self.filterData.dimension == '0') {
								unit = $translate.instant('aws.bill.one');
								csv_unitTitle = $translate.instant('aws.bill.amount');
								if (key == "cpuRankList" || key == "pmCpuRankList") {
									unit = $translate.instant('aws.bill.core');
									csv_unitTitle = $translate.instant('aws.bill.core');
								}
								if (key == "backupRankList" || key == "memoryRankList" || key == "chdRankList" || key == "pmChdRankList" || key == "pmMemoryRankList") {
									unit = " GB";
									csv_unitTitle = $translate.instant('aws.bill.capacity');
								}
							} else {
								unit = $translate.instant('aws.bill.one') + "-" + $translate.instant('aws.bill.hour');
								csv_unitTitle = $translate.instant('aws.bill.amount') + "-" + $translate.instant('aws.bill.hour');
								if (key == "cpuRankList" || key == "pmCpuRankList") {
									unit = $translate.instant('aws.bill.core') + "-" + $translate.instant('aws.bill.hour');
									csv_unitTitle = $translate.instant('aws.bill.core') + "-" + $translate.instant('aws.bill.hour');
								}
								if (key == "backupRankList" || key == "memoryRankList" || key == "chdRankList" || key == "pmChdRankList" || key == "pmMemoryRankList") {
									unit = " GB-" + $translate.instant('aws.bill.hour');
									csv_unitTitle = $translate.instant('aws.bill.capacity') + "-" + $translate.instant('aws.bill.hour');
								}
							}

							if (type == "user") {
								self[key + "_csv_info"] = $translate.instant('aws.bill.resTopUser') + self.filterData.topLength + $translate.instant('aws.bill.resRank') + "--" + $translate.instant("aws.bill.topRes." + key) + "\n" + $translate.instant('aws.bill.userName') + "," + csv_unitTitle + "\n";
							} else if (type == "project") {
								self[key + "_csv_info"] = $translate.instant('aws.bill.resTopProject') + self.filterData.topLength + $translate.instant('aws.bill.resRank') + "--" + $translate.instant("aws.bill.topRes." + key) + "\n" + $translate.instant('aws.bill.projectName') + "," + csv_unitTitle + "\n";
							} else if (type == "domain") {
								self[key + "_csv_info"] = $translate.instant('aws.bill.resTopDomain') + self.filterData.topLength + $translate.instant('aws.bill.resRank') + "--" + $translate.instant("aws.bill.topRes." + key) + "\n" + $translate.instant('aws.bill.domainName') + "," + csv_unitTitle + "\n";
							} else if (type == "region") {
								self[key + "_csv_info"] = $translate.instant('aws.bill.resTopRegion') + self.filterData.topLength + $translate.instant('aws.bill.resRank') + "--" + $translate.instant("aws.bill.topRes." + key) + "\n" + $translate.instant('aws.bill.regionName') + "," + csv_unitTitle + "\n";
							}
							_.each(res.data[key], function(item) {
								total += Number(item.amount);
							});
							// if (res.data[key].length === 1) {
							// 	total = total * 1.25;
							// }
							self.resViewPieChart[key] = new PiePanelDefault();
							self.resViewPieChart[key].panels.pieType = "category";
							self.resViewPieChart[key].panels.total = Math.ceil(total) == total ? total : total.toFixed(2);
							_.each(res.data[key], function(item) {
								self.resViewPieChart[key].panels.data.push({
									"name": item.groupName=='default'?'默认部门':item.groupName,
									"value": Math.ceil(item.amount) == item.amount ? item.amount : item.amount.toFixed(2),
									"unit": unit
								});
								self[key + "_csv_info"] += item.groupName + ",";
								self[key + "_csv_info"] += (Math.ceil(item.amount) == item.amount ? (item.amount + unit) : (item.amount.toFixed(2) + unit)) + "\n";
							});
							self.csv_info += self[key + "_csv_info"] + "\n\n\n";
						}
					}
				};
				if (self.filterData.project) {
					if (self.filterData.project == "all") {
						params.deptId = self.filterData.domain == "all" ? null : self.filterData.domain;
						if(self.filterData.domain == "all"){
							resMeteringSrv.getProjectsResUsageRankDepts(params).then(function(res) {
								initPanels(res, "project");
							});
						}else{
							resMeteringSrv.getProjectsResUsageRank(params).then(function(res) {
								initPanels(res, "project");
							});	
						}
					} else {
						params.projectId = self.filterData.project;
						resMeteringSrv.getUsersResUsageRank(params).then(function(res) {
							initPanels(res, "user");
						});
					}
					return;
				}
				if (self.filterData.domain) {
					if (self.filterData.domain == "all") {
						params.region = self.filterData.region;
						resMeteringSrv.getDomainsResUsageRank(params).then(function(res) {
							initPanels(res, "domain");
						});
					} else {
						params.deptId = self.filterData.domain;
						resMeteringSrv.getProjectsResUsageRank(params).then(function(res) {
							initPanels(res, "project");
						});
					}
					return;
				}
				if (self.filterData.region) {
					params.region = self.filterData.region;
					resMeteringSrv.getDomainsResUsageRank(params).then(function(res) {
						initPanels(res, "domain");
					});
					return;
				}
				if (!(self.filterData.project && self.filterData.domain && self.filterData.region)) {
					resMeteringSrv.getRegionsResUsageRank(params).then(function(res) {
						initPanels(res, "region");
					});
					return;
				}
			};

			self.downloadData = function() {
				var blob = new Blob(
					[self.csv_info], {
						type: "text/csv;charset=utf-8;"
					}
				);
				FileSaver.saveAs(blob, $translate.instant('aws.bill.meteringViewDataExport') + ".csv");
			};

			self.filterData = {
				dimension: self.options.statisticTypeList[0].value,
				topType: self.options.topTypeList[0].value,
				topLength: self.options.topLengthList[0].value
			};

			// if ($rootScope.ADMIN) {
			// 	self.filterData.region = self.options.regionList[0].value;
			// 	self.filterData.domain = self.options.domainList[0].value;
			// 	self.filterData.project = self.options.projectList[0].value;
			// 	self.query();
			// }

			function getRegionData() {
				resMeteringSrv.getAllRegions().then(function(res) {
					if (res && res.data) {
						_.each(res.data, function(item) {
							self.options.regionList.push({
								name: item,
								value: item
							})
						});
						if (!$rootScope.ADMIN) {
							_.each(self.options.regionList, function(item) {
								if (item.value == $rootScope.loginData.regionName) {
									self.filterData.region = item.value;
								}
							});
						} else {
							self.filterData.region = self.options.regionList[0].value;
							self.filterData.domain = self.options.domainList[0].value;
							self.filterData.project = self.options.projectList[0].value;
							self.query();
						}
					}
				});
			}

			function getDomainData() {
				let params = {};
				if (self.filterData.region) {
					params.region = self.filterData.region;
				}
				resMeteringSrv.getDomainsList(params).then(function(res) {
					if (res && res.data) {
						self.options.domainList.splice(1, self.options.domainList.length - 1);
						_.each(res.data, function(item) {
							if (item.deptName == 'default') {
		                        item.disDomainName = '默认部门';
		                    } else {
		                        item.disDomainName = item.deptName;
		                    }
							self.options.domainList.push({
								name: item.disDomainName,
								value: item.deptId
							})
						});
						if (!$rootScope.ADMIN) {
							_.each(self.options.domainList, function(item) {
								if (item.value == $rootScope.loginData.domainUid) {
									self.filterData.domain = item.value;
								}
							});
							if ($rootScope.DOMAIN_ADMIN) {
								self.query();
							}
						} else {
							self.filterData.domain = self.options.domainList[0].value;
						}
					}
				});
			}

			function getProjectData() {
				let params = {};
				if (self.filterData.region) {
					params.region = self.filterData.region;
				}
				if (self.filterData.domain) {
					params.deptId = self.filterData.domain;
				}
				resMeteringSrv.getProjectsList(params).then(function(res) {
					if (res && res.data) {
						self.options.projectList.splice(1, self.options.projectList.length - 1);
						_.each(res.data, function(item) {
							if (item.projectName == 'admin' && item.deptId == 'default') {
		                        item.disProjectName = '默认项目';
		                    } else {
		                        item.disProjectName = item.projectName;
		                    }
							self.options.projectList.push({
								name: item.disProjectName,
								value: item.projectId
							});
						});
						if (!$rootScope.ADMIN) {
							_.each(self.options.projectList, function(item) {
								if (item.value == $rootScope.loginData.defaultProjectUid) {
									self.filterData.project = item.value;
								}
							});
							if ($rootScope.PROJECT_ADMIN) {
								self.query();
							}
						} else {
							self.filterData.project = self.options.projectList[0].value;
						}
					}
				});
			}

			getRegionData();
			getDomainData();
			getProjectData();

			self.changeRegion = function() {
				self.filterData.domain = null;
				self.filterData.project = null;
				getDomainData();
				getProjectData();
			};

			self.changeDomain = function() {
				self.filterData.project = null;
				getProjectData();
			};

			self.colList_1 = ["vmRankList", "cpuRankList", "memoryRankList"];
			self.colList_2 = ["chdRankList", "snapshotRankList", "routerRankList"];
			self.colList_3 = ["floatingipRankList", "loadbalancerRankList", "pmRankList"];
			self.colList_4 = ["pmCpuRankList", "pmMemoryRankList", "pmChdRankList"];
		}
	}
]);
resMeteringCtrlModule.controller('resMeteringStatisticCtrl', ['$scope', '$rootScope', 'resMeteringSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'FileSaver', 'Blob', '$translate',
	function(self, $rootScope, resMeteringSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, FileSaver, Blob, $translate) {
		self.filterData = {
			timeStep: "",
			col: "",
			from: null,
			to: null,
			searchTerm: "",
			definedTime:false,
			definedTimeText:$translate.instant('aws.bill.chooseDate')
		};

		if ($rootScope.ADMIN) {
			self.filterData.col = "region";
		} else if ($rootScope.DOMAIN_ADMIN) {
			self.filterData.col = "dep";
		} else if ($rootScope.PROJECT_ADMIN) {
			self.filterData.col = "pro";
		} else {
			self.filterData.col = "user";
		}

		if ($rootScope.PROJECT_ADMIN) {
			self.colsList = [
			{
				value: "pro",
				title: $translate.instant('aws.bill.belong_project'),
				show: true
			}, 
			{
				value: "user",
				title: $translate.instant('aws.bill.user'),
				show: true
			}];
		} else if (!($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN || $rootScope.PROJECT_ADMIN)){
			self.colsList = [ 
			{
				value: "user",
				title: $translate.instant('aws.bill.user'),
				show: true
			}]
		}else{
			self.colsList = [{
				value: "region",
				title: $translate.instant('aws.bill.region'),
				show: true
			}, {
				value: "dep",
				title: $translate.instant('aws.bill.belong_domain'),
				show: true
			}, {
				value: "pro",
				title: $translate.instant('aws.bill.belong_project'),
				show: true
			}, {
				value: "user",
				title: $translate.instant('aws.bill.user'),
				show: true
			}];
		}

		let colsConfigList = [{
			value: "vmSize",
			title: $translate.instant('aws.bill.vm') + "（" + $translate.instant('aws.bill.one') + "）",
			show: true
		}, {
			value: "vmUsedAmount",
			title: $translate.instant('aws.bill.vm') + "（" + $translate.instant('aws.bill.one') + "-" + $translate.instant('aws.bill.hour') + "）",
			show: true
		}, {
			value: "cpuSize",
			title: "CPU（" + $translate.instant('aws.bill.one') + "）",
			show: true
		}, {
			value: "cpuUsedAmount",
			title: "CPU" + "（" + $translate.instant('aws.bill.one') + "-" + $translate.instant('aws.bill.hour') + "）",
			show: true
		}, {
			value: "memorySize",
			title: $translate.instant('aws.bill.vmMemory') + "（GB）",
			show: true
		}, {
			value: "memoryUsedAmount",
			title: $translate.instant('aws.bill.vmMemory') + "（GB-" + $translate.instant('aws.bill.hour') + "）",
			show: true
		}, {
			value: "chdSize",
			title: $translate.instant('aws.bill.volume') + "（GB）",
			show: true
		}, {
			value: "chdUsedAmount",
			title: $translate.instant('aws.bill.volume') + "（GB-" + $translate.instant('aws.bill.hour') + "）",
			show: true
		}, {
			value: "snapshotSize",
			title: $translate.instant('aws.bill.snapshot') + "（" + $translate.instant('aws.bill.hour') + "）",
			show: false
		}, {
			value: "snapshotUsedAmount",
			title: $translate.instant('aws.bill.snapshot') + "（" + $translate.instant('aws.bill.one') + "-" + $translate.instant('aws.bill.hour') + "）",
			show: false
		}, {
			value: "floatingipSize",
			title: $translate.instant("aws.bill.cols.floationgip_unit"),
			show: false
		}, {
			value: "floatingipUsedAmount",
			title: $translate.instant("aws.bill.cols.floationgip_unit_hour"),
			show: false
		}, {
			value: "routerSize",
			title: $translate.instant("aws.bill.cols.router_unit"),
			show: false
		}, {
			value: "routerUsedAmount",
			title: $translate.instant("aws.bill.cols.router_unit_hour"),
			show: false
		}, {
			value: "loadbalancerSize",
			title: $translate.instant("aws.bill.cols.loadBalance_unit"),
			show: false
		}, {
			value: "loadblancerUsedAmount",
			title: $translate.instant("aws.bill.cols.loadBalance_unit_hour"),
			show: false
		}, {
			value: "pmSize",
			title: $translate.instant("aws.bill.cols.pm_unit"),
			show: false
		}, {
			value: "pmUsedAmount",
			title: $translate.instant("aws.bill.cols.pm_unit_hour"),
			show: false
		}, {
			value: "pmCpuSize",
			title: $translate.instant("aws.bill.cols.pmcpu_unit"),
			show: false
		}, {
			value: "pmCpuUsedAmount",
			title: $translate.instant("aws.bill.cols.pmcpu_unit_hour"),
			show: false
		}, {
			value: "pmMemorySize",
			title: $translate.instant("aws.bill.cols.pmmemory_unit"),
			show: false
		}, {
			value: "pmMemoryUsedAmount",
			title: $translate.instant("aws.bill.cols.pmmemory_unit_hour"),
			show: false
		}, {
			value: "pmChdSize",
			title: $translate.instant("aws.bill.cols.pmvolume_unit"),
			show: false
		}, {
			value: "pmChdUsedAmount",
			title: $translate.instant("aws.bill.cols.pmvolume_unit_hour"),
			show: false
		}, {
			value: "backupVolumeSize",
			title: $translate.instant("aws.bill.cols.backup_unit"),
			show: false
		}, {
			value: "backupVolumeUsedAmount",
			title: $translate.instant("aws.bill.cols.backup_unit_hour"),
			show: false
		}];

		self.colsConfigList = angular.copy(colsConfigList);

		// resMeteringSrv.getItemTotalCount().then(function(res) {
		// 	if (res && res.data) {
		// 		self.itemsCount = res.data;
		// 	}
		// });

		function getTableTmpl(tds, index) {
			let table = '';
			table = `
					<div class="table-cont scrolly">
						<!--<empty-tip empty-type="loadMeteringStatisticData" tip-id="'meteringStatistic-tip-msg'"></empty-tip>-->
				    	<table class="table table-nowrap" ng-table="resMeteringStatisticTable">
							<tr ng-repeat="item in $data track by $index">
			                    ` + tds + `
			                	<td data-title="'aws.bill.cols.vm_unit'|translate" sortable="'vmSize'" ng-if="colsConfigList[` + (0 + index) + `].show">{{item.vmSize}}</td>
			                    <td data-title="'aws.bill.cols.vm_unit_hour'|translate" sortable="'vmUsedAmount'" ng-if="colsConfigList[` + (1 + index) + `].show">{{item.vmUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.cpu_unit'|translate" sortable="'cpuSize'" ng-if="colsConfigList[ ` + (2 + index) + `].show" >{{item.cpuSize}}</td>
			                    <td data-title="'aws.bill.cols.cpu_unit_hour'|translate" sortable="'cpuUsedAmount'" ng-if="colsConfigList[` + (3 + index) + `].show" >{{item.cpuUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.memory_unit'|translate" sortable="'memorySize'" ng-if="colsConfigList[` + (4 + index) + `].show">{{item.memorySize}}</td>
			                    <td data-title="'aws.bill.cols.memory_unit_hour'|translate" sortable="'memoryUsedAmount'" ng-if="colsConfigList[` + (5 + index) + `].show">{{item.memoryUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.volume_unit'|translate" sortable="'chdSize'" ng-if="colsConfigList[` + (6 + index) + `].show" >{{item.chdSize}}</td>
			                    <td data-title="'aws.bill.cols.volume_unit_hour'|translate" sortable="'chdUsedAmount'" ng-if="colsConfigList[` + (7 + index) + `].show" >{{item.chdUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.snapshot_unit'|translate" sortable="'snapshotSize'" ng-if="colsConfigList[` + (8 + index) + `].show" >{{item.snapshotSize}}</td>
			                    <td data-title="'aws.bill.cols.snapshot_unit_hour'|translate" sortable="'snapshotUsedAmount'" ng-if="colsConfigList[ ` + (9 + index) + `].show" >{{item.snapshotUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.floationgip_unit'|translate" sortable="'floatingipSize'" ng-if="colsConfigList[` + (10 + index) + `].show" >{{item.floatingipSize}}</td>
			                    <td data-title="'aws.bill.cols.floationgip_unit_hour'|translate" sortable="'floatingipUsedAmount'" ng-if="colsConfigList[ ` + (11 + index) + `].show" >{{item.floatingipUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.router_unit'|translate" sortable="'routerSize'" ng-if="colsConfigList[` + (12 + index) + `].show" >{{item.routerSize}}</td>
			                    <td data-title="'aws.bill.cols.router_unit_hour'|translate" sortable="'routerUsedAmount'" ng-if="colsConfigList[ ` + (13 + index) + `].show" >{{item.routerUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.loadBalance_unit'|translate" sortable="'loadbalancerSize'" ng-if="colsConfigList[ ` + (14 + index) + `].show" >{{item.loadbalancerSize}}</td>
			                    <td data-title="'aws.bill.cols.loadBalance_unit_hour'|translate" sortable="'loadblancerUsedAmount'" ng-if="colsConfigList[ ` + (15 + index) + `].show" >{{item.loadblancerUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.pm_unit'|translate" sortable="'pmSize'" ng-if="colsConfigList[` + (16 + index) + `].show" >{{item.pmSize}}</td>
			                    <td data-title="'aws.bill.cols.pm_unit_hour'|translate" sortable="'pmUsedAmount'" ng-if="colsConfigList[` + (17 + index) + `].show" >{{item.pmUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.pmcpu_unit'|translate" sortable="'pmCpuSize'" ng-if="colsConfigList[` + (18 + index) + `].show" >{{item.pmCpuSize}}</td>
			                    <td data-title="'aws.bill.cols.pmcpu_unit_hour'|translate" sortable="'pmCpuUsedAmount'" ng-if="colsConfigList[` + (19 + index) + `].show" >{{item.pmCpuUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.pmmemory_unit'|translate" sortable="'pmMemorySize'" ng-if="colsConfigList[` + (20 + index) + `].show" >{{item.pmMemorySize}}</td>
			                    <td data-title="'aws.bill.cols.pmmemory_unit_hour'|translate" sortable="'pmMemoryUsedAmount'" ng-if="colsConfigList[` + (21 + index) + `].show" >{{item.pmMemoryUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.pmvolume_unit'|translate" sortable="'pmChdSize'" ng-if="colsConfigList[` + (22 + index) + `].show" >{{item.pmChdSize}}</td>
			                    <td data-title="'aws.bill.cols.pmvolume_unit_hour'|translate" sortable="'pmChdUsedAmount'" ng-if="colsConfigList[` + (23 + index) + `].show" >{{item.pmChdUsedAmount}}</td>
			                    <td data-title="'aws.bill.cols.backup_unit'|translate" sortable="'backupVolumeSize'" ng-if="colsConfigList[` + (24 + index) + `].show" >{{item.backupVolumeSize}}</td>
			                    <td data-title="'aws.bill.cols.backup_unit_hour'|translate" sortable="'backupVolumeUsedAmount'" ng-if="colsConfigList[` + (25 + index) + `].show" >{{item.backupVolumeUsedAmount}}</td>
			                </tr>
			            </table>
			            <div ng-show="loadMeteringStatisticData">{{"aws.common.loading"|translate}}</div>
			            <div ng-show="!loadMeteringStatisticData && resMeteringStatisticTable.data.length == 0">{{'aws.common.empty'|translate}}</div>
		            </div>
				`;
			return table;
		}

		function setParams(params) {
			if ($rootScope.DOMAIN_ADMIN) {
				params.deptId = $rootScope.loginData.domainUid;
			}
			if ($rootScope.PROJECT_ADMIN) {
				params.projectId = $rootScope.loginData.defaultProjectUid;
			}
			if (!($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN || $rootScope.PROJECT_ADMIN)) {
				params.userId = $rootScope.loginData.userUid;
			}
			return params;
		}

		self.selectCol = function(col) {
			if (col) {
				col = col;
				self.colsConfigList = angular.copy(colsConfigList);
				if (col == "region") {
					self.colsConfigList.unshift({
						"value": "region",
						"title": $translate.instant('aws.bill.region'),
						"show": true,
						"disable": true
					});
				} else if (col == "dep") {
					self.colsConfigList.unshift({
						"value": "domain",
						"title": $translate.instant('aws.bill.domain'),
						"show": true,
						"disable": true
					}, {
						"value": "region",
						"title": $translate.instant('aws.bill.region'),
						"show": true
					});
				} else if (col == "pro") {
					self.colsConfigList.unshift({
						"value": "project",
						"title": $translate.instant('aws.bill.project'),
						"show": true,
						"disable": true
					}, {
						"value": "region",
						"title": $translate.instant('aws.bill.region'),
						"show": true
					}, {
						"value": "domain",
						"title": $translate.instant('aws.bill.domain'),
						"show": true
					});
				} else if (col == "user") {
					self.colsConfigList.unshift({
						"value": "user",
						"title": $translate.instant('aws.bill.user'),
						"show": true,
						"disable": true
					}, {
						"value": "region",
						"title": $translate.instant('aws.bill.region'),
						"show": true
					}, {
						"value": "domain",
						"title": $translate.instant('aws.bill.domain'),
						"show": true
					}, {
						"value": "project",
						"title": $translate.instant('aws.bill.project'),
						"show": true
					});
				}
			} else {
				col = self.filterData.col;
			}
			self.filterData.col = col;
			self.csvHeader = [];
			self.filterData.colsParams = {};
			self.filterData.searchTerm = "";
			_.each(self.colsConfigList, function(item) {
				if (item.show == true) {
					self.csvHeader.push(item.title);
					if(item.value=='project'){
						self.filterData.colsParams.disProjectName = 1;
					}else if(item.value=='domain'){
						self.filterData.colsParams.disDomainName= 1;
					}else{
						self.filterData.colsParams[item.value] = 1;
					}
					
				}
			});
			$('#meteringStatisticTable').find(".table-cont").remove();
			self.loadMeteringStatisticData = true;
			self.resMeteringStatisticTable = "";
			let table = "";
			let tds = "";
			let initResMeteringStatisticTable = function(resData) {
				self.csvDownloadData = [];
				resData = _.map(resData, function(item) {
					let tempList = [];
					let searchTermList = [];
					if (item.deptName&&item.deptName == 'default') {
						item.disDomainName = '默认部门';
					} else {
						item.disDomainName = item.deptName;
					}
					if(item.projectName&&item.projectName == 'admin'){
						item.disProjectName = '默认项目';
					} else {
						item.disProjectName = item.projectName;
					}
					item.user = item.userName;
					for (let key in self.filterData.colsParams) {
						item[key] = item[key] == null ? 0 : (isNaN(item[key]) ? item[key] : (Math.ceil(item[key]) == item[key] ? item[key] : item[key].toFixed(2)));
						searchTermList.push(item[key]);
						item.searchTerm = searchTermList.join("\b");
						tempList.push(item[key]);
					}
					self.csvDownloadData.push(tempList);
					return item;
				});
				self.resMeteringStatisticTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: resData
				});
			};

			if (col == "region") {
				self.col_title = $translate.instant('aws.bill.region');
				self.fileName = $translate.instant('aws.bill.regionResMeteringStatistic') + ".csv";
				tds = `<td header="'headerDropMenu.html'" sortable="''" ng-if="colsConfigList[0].show"><a href="/#/system/resMetering?id={{item.region}}&&name={{item.region}}&&type=region" >{{item.region}}</a></td>`;
				table = getTableTmpl(tds, 1);
				let params = angular.copy(self.filterData.colsParams);
				delete params.region;
				params.startTime = self.filterData.from;
				params.endTime = self.filterData.to;
				params = setParams(params);
				resMeteringSrv.getAllRegionsResUsage(params).then(function(res) {
					res ? self.loadMeteringStatisticData = false : true;
					if (res && res.data) {
						initResMeteringStatisticTable(res.data);
					}
				});
			} else if (col == "dep") {
				self.col_title = $translate.instant('aws.bill.domain');
				self.fileName = $translate.instant('aws.bill.domainResMeteringStatistic') + ".csv";
				tds = `<td header="'headerDropMenu.html'" sortable="'disDomainName'" ng-if="colsConfigList[0].show" ><a href="/#/system/resMetering?id={{item.deptId}}&&name={{item.deptName}}&&type=domain" >{{item.disDomainName}}</a></td>
                	    <td data-title="'aws.bill.region'|translate" sortable="'region'" ng-if="colsConfigList[1].show">{{item.region}}</td>`;
				table = getTableTmpl(tds, 2);
				let params = angular.copy(self.filterData.colsParams);
				delete params.domain;
				delete params.region;
				params.startTime = self.filterData.from;
				params.endTime = self.filterData.to;
				params = setParams(params);
				resMeteringSrv.getAllDomainsResUsage(params).then(function(res) {
					res ? self.loadMeteringStatisticData = false : true;
					if (res && res.data) {
						initResMeteringStatisticTable(res.data);
					}
				});
			} else if (col == "pro") {
				self.col_title = $translate.instant('aws.bill.project');
				self.fileName = $translate.instant('aws.bill.projectResMeteringStatistic') + ".csv";
				tds = `<td header="'headerDropMenu.html'" sortable="'disProjectName'" ng-if="colsConfigList[0].show" ><a href="/#/system/resMetering?id={{item.projectId}}&&name={{item.projectName}}&&type=project">{{item.disProjectName}}</a></td>
	                	<td data-title="'aws.bill.region'|translate" sortable="'region'" ng-if="colsConfigList[1].show" >{{item.region}}</td>
	                	<td data-title="'aws.bill.domain'|translate" sortable="'disDomainName'" ng-if="colsConfigList[2].show" >{{item.disDomainName}}</td>`;
				table = getTableTmpl(tds, 3);
				let params = angular.copy(self.filterData.colsParams);
				delete params.project;
				delete params.domain;
				delete params.region;
				params.startTime = self.filterData.from;
				params.endTime = self.filterData.to;
				params = setParams(params);
				resMeteringSrv.getAllProjectsResUsage(params).then(function(res) {
					res ? self.loadMeteringStatisticData = false : true;
					if (res && res.data) {
						initResMeteringStatisticTable(res.data);
					}
				});

			} else if (col == "user") {
				self.col_title = $translate.instant('aws.bill.user');
				self.fileName = $translate.instant('aws.bill.userResMeteringStatistic') + ".csv";
				tds = `<td header="'headerDropMenu.html'" sortable="''" ng-if="colsConfigList[0].show" ><a href="/#/system/resMetering?id={{item.userId}}&&name={{item.userName}}&&type=user">{{item.userName}}</a></td>
                	   <td data-title="'aws.bill.region'|translate" sortable="''" ng-if="colsConfigList[1].show" >{{item.region}}</td>
                	   <td data-title="'aws.bill.domain'|translate" sortable="'item.disDomainName'" ng-if="colsConfigList[2].show" >{{item.disDomainName}}</td>
                	   <td data-title="'aws.bill.project'|translate" sortable="'item.disProjectName'" ng-if="colsConfigList[3].show">{{item.disProjectName}}</td>`;
				table = getTableTmpl(tds, 4);
				let params = angular.copy(self.filterData.colsParams);
				delete params.user;
				delete params.project;
				delete params.domain;
				delete params.region;
				params.startTime = self.filterData.from;
				params.endTime = self.filterData.to;
				params = setParams(params);
				resMeteringSrv.getAllUsersResUsage(params).then(function(res) {
					res ? self.loadMeteringStatisticData = false : true;
					if (res && res.data) {
						initResMeteringStatisticTable(res.data);
					}
				});
			}
			table = $compile(table)(self);
			$('#meteringStatisticTable')[0].appendChild(table[0]);
		};

		//self.selectCol(self.filterData.col);

		self.query = function() {
			self.selectCol(self.filterData.col);
		};

		self.downloadData = function() {
			return self.csvDownloadData;
		};

		self.applyGlobalSearch = function() {
			self.resMeteringStatisticTable.filter({
				searchTerm: self.filterData.searchTerm
			});
		};

		self.refresh = function() {
            self.filterData = {
				timeStep: "",
				col: self.filterData.col,
				from: null,
				to: null,
				searchTerm: "",
				definedTime:false,
				definedTimeText:$translate.instant('aws.bill.chooseDate')
			};
			self.selectCol(self.filterData.col);
		};

		self.$watch(function() {
			return $routeParams;
		}, function(value) {
			if (value && value.id) {
				self.itemAnimation = "animateIn";
				self.$emit("resUsageOfItemsDetail", value);
			} else {
				self.itemAnimation = "animateOut";
			}
		}, true);

		self.$on("resMeteringStatistic", function() {
			resMeteringSrv.getItemTotalCount().then(function(res) {
				if (res && res.data) {
					self.itemsCount = res.data;
				}
			});
			self.selectCol(self.filterData.col);
		});

	}
]);
resMeteringCtrlModule.controller('resUsageOfItemsDetailCtrl', ['$scope', '$rootScope', 'resMeteringSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', '$translate',
	function(self, $rootScope, resMeteringSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, $translate) {
		$rootScope.$on("resUsageOfItemsDetail", function(e, data) {
			if(data.name=='default'&&data.type=="domain"){
				self.itemName = '默认部门';
			}else if(data.name=='admin'&&data.type=="project"){
				self.itemName = '默认项目';
			}else{
				self.itemName = data.name;
			}
			self.itemType = data.type;

			self.filterData = {
				timeStep: "",
				from: null,
				to: null,
				searchTerm: "",
				definedTime:false,
				definedTimeText:$translate.instant('aws.bill.chooseDate')
			};
			self.timeType = {
                options: [{
                    "name": $translate.instant('aws.bill.timeType.realTime'),
                    "value": ""
                }, {
                    "name": $translate.instant('aws.bill.timeType.threeDays'),
                    "value": "3d"
                }, {
                    "name": $translate.instant('aws.bill.timeType.oneWeek'),
                    "value": "7d"
                }, {
                    "name": $translate.instant('aws.bill.timeType.oneMonth'),
                    "value": "30d"
                }]
            };
			self.csvHeader = [$translate.instant('aws.bill.name'), $translate.instant('aws.bill.currentUsingAmonut'), $translate.instant('aws.bill.unit'), $translate.instant('aws.bill.alreadyUsedAmount'), $translate.instant('aws.bill.unit')];

			function initItenResUsageTable(resData) {
				self.csvDownloadData = [];
				resData = _.map(resData, function(item) {
					item.currentUsingAmount = item.currentUsingAmount == null ? "0" : Math.ceil(item.currentUsingAmount) == item.currentUsingAmount ? item.currentUsingAmount : item.currentUsingAmount.toFixed(2);
					item.currentUsingAmountUnit == item.currentUsingAmountUnit == null ? "" : item.currentUsingAmountUnit;
					item.alreadyUsedAmount = item.alreadyUsedAmount == null ? "0" : Math.ceil(item.alreadyUsedAmount) == item.alreadyUsedAmount ? item.alreadyUsedAmount : item.alreadyUsedAmount.toFixed(2);
					item.alreadyUsedAmountUnit = item.alreadyUsedAmountUnit == null ? "" : item.alreadyUsedAmountUnit;
					item.searchTerm = [item.resourceName, item.currentUsingAmount, item.currentUsingAmountUnit, item.alreadyUsedAmount, item.alreadyUsedAmountUnit].join("\b");
					self.csvDownloadData.push([item.resourceName, item.currentUsingAmount, item.currentUsingAmountUnit, item.alreadyUsedAmount, item.alreadyUsedAmountUnit]);
					return item;
				});
				self.itemResUsageTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: resData
				});
			}

			self.query = function() {
				self.filterData.searchTerm = "";
				self.itemResUsageTableData = true;
				self.itemResUsageTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: []
				});
				if (data.type == "region") {
					self.fileName = $translate.instant('aws.bill.regionResUsageDetail') + ".csv";
					resMeteringSrv.getRegionDetailResUsage({
						startTime: self.filterData.from,
						endTime: self.filterData.to,
						region: data.id
					}).then(function(res) {
						res ? self.itemResUsageTableData = false : true;
						if (res && res.data) {
							initItenResUsageTable(res.data);
						}
					});
				} else if (data.type == "domain") {
					self.fileName = $translate.instant('aws.bill.domainResUsageDetail') + ".csv";
					resMeteringSrv.getDomainDetailResUsage({
						startTime: self.filterData.from,
						endTime: self.filterData.to,
						deptId: data.id
					}).then(function(res) {
						res ? self.itemResUsageTableData = false : true;
						if (res && res.data) {
							initItenResUsageTable(res.data);
						}
					});
				} else if (data.type == "project") {
					self.fileName = $translate.instant('aws.bill.projectResUsageDetail') + ".csv";
					resMeteringSrv.getProjectDetailResUsage({
						startTime: self.filterData.from,
						endTime: self.filterData.to,
						projectId: data.id
					}).then(function(res) {
						res ? self.itemResUsageTableData = false : true;
						if (res && res.data) {
							initItenResUsageTable(res.data);
						}
					});
				} else if (data.type == "user") {
					self.fileName = $translate.instant('aws.bill.userResUsageDetail') + ".csv";
					resMeteringSrv.getUserDetailResUsage({
						startTime: self.filterData.from,
						endTime: self.filterData.to,
						userId: data.id
					}).then(function(res) {
						res ? self.itemResUsageTableData = false : true;
						if (res && res.data) {
							initItenResUsageTable(res.data);
						}
					});
				}
			};

			self.query();

			self.downloadData = function() {
				return self.csvDownloadData;
			};

			self.applyGlobalSearch = function() {
				self.itemResUsageTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.refreshTable = function() {
				self.filterData = {
					timeStep: "",
					from: null,
					to: null,
					searchTerm: "",
					definedTime:false,
					definedTimeText:$translate.instant('aws.bill.chooseDate')
				};
				self.query();
			};
		});

	}
]);
resMeteringCtrlModule.controller('resUsageRateCtrl', ['$scope', '$rootScope','resMeteringSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'FileSaver', 'Blob', '$translate',
	function(self,$rootScope, resMeteringSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, FileSaver, Blob, $translate) {
		self.options = {
			resTypeList: [{
				"name": $translate.instant('aws.bill.vm'),
				"value": "virtual"
			}, {
				"name": $translate.instant('aws.bill.pm'),
				"value": "physical"
			}],
			statisticDimensionList: [{
				"name": $translate.instant('aws.bill.domain'),
				"value": "domain"
			}, {
				"name": $translate.instant('aws.bill.project'),
				"value": "project"
			}],
			topTypeList: [{
				"name": $translate.instant('aws.bill.highest'),
				"value": "top"
			}, {
				"name": $translate.instant('aws.bill.lowest'),
				"value": "bottom"
			}],
			topLengthList: [{
				"name": "TOP5",
				"value": "5"
			}, {
				"name": "TOP3",
				"value": "3"
			}, {
				"name": "TOP10",
				"value": "10"
			}],
			timeTypeList: [{
				"name": $translate.instant('aws.bill.recent_3d'),
				"value": "3d"
			}, {
				"name": $translate.instant('aws.bill.recent_week'),
				"value": "7d"
			}, {
				"name": $translate.instant('aws.bill.recent_month'),
				"value": "30d"
			}, {
				"name": $translate.instant('aws.bill.recent_3month'),
				"value": "90d"
			}]

		};

		self.filterData = {
			resType: self.options.resTypeList[0].value,
			depOrPro: self.options.statisticDimensionList[0].value,
			topType: self.options.topTypeList[0].value,
			topLength: self.options.topLengthList[0].value,
			timeStep: self.options.timeTypeList[0].value,
			from: "",
			to: "",
			definedTime:false,
			definedTimeText:$translate.instant('aws.bill.chooseDate')
		};

		function init_dateTimepicker() {
			angular.element(".form_date").datetimepicker({
				language: "zh-CN",
				weekStart: 1,
				todayBtn: 1,
				autoclose: 1,
				todayHighlight: 1,
				minView: "month",
				forceParse: 0,
				format: "yyyy-mm-dd hh:mm:ss",
				pickerPosition: "bottom-left"
			});
		}
		// init_dateTimepicker();

		// self.timeSelectTab = function(step) {
		// 	self.filterData.from = null;
		// 	self.filterData.to = null;
		// 	if (step != "" && step != "defined") {
		// 		let start = moment().subtract(Number(step.substring(0, step.length - 1)) - 1, step.substring(step.length - 1, step.length)).format("YYYY-MM-DD 00:00:00");
		// 		let end = moment().format("YYYY-MM-DD 23:59:59");
		// 		self.filterData.from = start;
		// 		self.filterData.to = end;
		// 	}
		// };

		self.query = function() {
			self.panels = {
				cpu: [],
				mem: [],
				disk: []
			};
			self.loadTopData = true;
			if (self.filterData.resType == "virtual") {
				self.cpu_bar_title = $translate.instant('aws.bill.cpu');
				self.mem_bar_title = $translate.instant('aws.bill.memory');
				self.disk_bar_title = $translate.instant('aws.bill.vmVolume');
			} else if (self.filterData.resType == "physical") {
				self.cpu_bar_title = $translate.instant('aws.bill.pmcpu');
				self.mem_bar_title = $translate.instant('aws.bill.pmmemory');
				self.disk_bar_title = $translate.instant('aws.bill.pmhd');
			}
			resMeteringSrv.resUsedStatisticTop({
				"regionCode": localStorage.regionKey,
				"dimension": self.filterData.depOrPro,
				"hostType": self.filterData.resType,
				"dataType": self.filterData.topType,
				"dataCount": self.filterData.topLength,
				"startTimeMills": self.filterData.from ? Date.parse(new Date(self.filterData.from)) : null, //时间戳
				"endTimeMills": self.filterData.to ? Date.parse(new Date(self.filterData.to)) : null
			}).then(function(res) {
				res ? self.loadTopData = false : true;
				if (res && res.data) {
					function handleDate(Data,type1,type2,type3,csv){
						if($rootScope.DOMAIN_ADMIN){
							_.each(Data[type1], function(item) {
								if(item.domainId==localStorage.domainUid){
									self.panels[type3].push({
										"name": item.domainName=='default'?'默认部门':item.domainName,
										"inUsed": Number(item[type2]),
										"type": "percent",
										"total": 100
									});
									self[csv] += item.domainName + ",";
									self[csv] += (item[type2] == null ? item[type2] : (item[type2].toFixed(1) + "%")) + "\n";
								}
							});
						}else{
							_.each(Data[type1], function(item) {
								self.panels[type3].push({
									"name": item.domainName=='default'?'默认部门':item.domainName,
									"inUsed": Number(item[type2]),
									"type": "percent",
									"total": 100
								});
								self[csv] += item.domainName + ",";
								self[csv] += (item[type2] == null ? item[type2] : (item[type2].toFixed(1) + "%")) + "\n";
							});
						}
					}
					if (self.filterData.depOrPro == "domain" && self.filterData.resType == "virtual") {
						self.cpu_csv_info = $translate.instant('aws.bill.vmCpuUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.domainName') + "," + $translate.instant('aws.bill.cpuUsage') + "\n";
						self.mem_csv_info = $translate.instant('aws.bill.vmMemoryUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.domainName') + "," + $translate.instant('aws.bill.memoryUsage') + "\n";
						self.disk_csv_info = $translate.instant('aws.bill.vmVolumeUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.domainName') + "," + $translate.instant('aws.bill.volumeUsage') + "\n";

						handleDate(res.data,'cpu','vCpu','cpu','cpu_csv_info')
						handleDate(res.data,'memory','vMemory','mem','mem_csv_info')
						handleDate(res.data,'disk','vDisks','disk','disk_csv_info')
					}
					if (self.filterData.depOrPro == "domain" && self.filterData.resType == "physical") {
						self.cpu_csv_info = $translate.instant('aws.bill.pmCpuUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.domainName') + "," + $translate.instant('aws.bill.cpuUsage') + "\n";
						self.mem_csv_info = $translate.instant('aws.bill.pmMemoryUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.domainName') + "," + $translate.instant('aws.bill.memoryUsage') + "\n";
						self.disk_csv_info = $translate.instant('aws.bill.pmVolumeUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.domainName') + "," + $translate.instant('aws.bill.volumeUsage') + "\n";

						handleDate(res.data,'cpu','pCpu','cpu','cpu_csv_info')
						handleDate(res.data,'memory','pMemory','mem','mem_csv_info')
						handleDate(res.data,'disk','pDisks','disk','disk_csv_info')
					}
					if (self.filterData.depOrPro == "project" && self.filterData.resType == "virtual") {
						self.cpu_csv_info = $translate.instant('aws.bill.vmCpuUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + ")\n" + $translate.instant('aws.bill.projectName') + "," + $translate.instant('aws.bill.cpuUsage') + "\n";
						self.mem_csv_info = $translate.instant('aws.bill.vmMemoryUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.projectName') + "," + $translate.instant('aws.bill.memoryUsage') + "\n";
						self.disk_csv_info = $translate.instant('aws.bill.vmVolumeUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.projectName') + "," + $translate.instant('aws.bill.volumeUsage') + "\n";

						handleDate(res.data,'cpu','vCpu','cpu','cpu_csv_info')
						handleDate(res.data,'memory','vMemory','mem','mem_csv_info')
						handleDate(res.data,'disk','vDisks','disk','disk_csv_info')
					}
					if (self.filterData.depOrPro == "project" && self.filterData.resType == "physical") {
						self.cpu_csv_info = $translate.instant('aws.bill.pmCpuUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.projectName') + "," + $translate.instant('aws.bill.cpuUsage') + "\n";
						self.mem_csv_info = $translate.instant('aws.bill.pmMemoryUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.projectName') + "," + $translate.instant('aws.bill.memoryUsage') + "\n";
						self.disk_csv_info = $translate.instant('aws.bill.pmVolumeUsageStatistic') + "（" + $translate.instant('aws.bill.top') + self.filterData.topLength + $translate.instant('aws.bill.top_name') + "）\n" + $translate.instant('aws.bill.projectName') + "," + $translate.instant('aws.bill.volumeUsage') + "\n";

						handleDate(res.data,'cpu','pCpu','cpu','cpu_csv_info')
						handleDate(res.data,'memory','pMemory','mem','mem_csv_info')
						handleDate(res.data,'disk','pDisks','disk','disk_csv_info')
					}
				}
			});

			($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN)?self.resUsagefilterData.col = self.resUsagefilterData.col:self.resUsagefilterData.col = 'project'
			initResUsageRateTable(self.resUsagefilterData.col);
		};

		//self.query();

		self.downloadData = function() {
			var csv_data = self.cpu_csv_info + "\n\n\n" + self.mem_csv_info + "\n\n\n" + self.disk_csv_info;
			var blob = new Blob(
				[csv_data], {
					type: "text/csv;charset=utf-8;"
				}
			);
			FileSaver.saveAs(blob, $translate.instant('aws.bill.resUsageRankChartExport') + ".csv");
		};

		/*******************************************************************************/

		self.resUsagefilterData = {
			timeStep: self.options.timeTypeList[0].value,
			from: "",
			to: "",
			col: "domain",
			searchTerm: "",
			colsParams: {},
			definedTime:false,
			definedTimeText:$translate.instant('aws.bill.chooseDate')
		};

		
		if($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN){
			self.colsList = [{
				value: "domain",
				title: $translate.instant('aws.bill.domain'),
				show: true
			}, {
				value: "project",
				title: $translate.instant('aws.bill.project'),
				show: true
			}];
		}else{
			self.colsList = [{
				value: "project",
				title: $translate.instant('aws.bill.project'),
				show: true
			}];
		}

		let colsConfigList = [{
			value: "domain",
			title: $translate.instant('aws.bill.domain'),
			show: true,
			disable: true
		}, {
			value: "vCpu",
			title: $translate.instant('aws.bill.cpu'),
			show: true
		}, {
			value: "vMemory",
			title: $translate.instant('aws.bill.memory'),
			show: true
		}, {
			value: "vDisks",
			title: $translate.instant('aws.bill.vmVolume'),
			show: true
		}, {
			value: "pCpu",
			title: $translate.instant('aws.bill.pmcpu'),
			show: true
		}, {
			value: "pMemory",
			title: $translate.instant('aws.bill.pmmemory'),
			show: true
		}, {
			value: "pDisks",
			title: $translate.instant('aws.bill.pmhd'),
			show: true
		}];
		self.colsConfigList = angular.copy(colsConfigList);

		function getCommonTdTmpl(index) {
			return `<td data-title="'aws.bill.cpu'|translate" sortable="'vCpu'" ng-if="colsConfigList[` + (0 + index) + `].show">{{item.vCpu}}</td>
                    <td data-title="'aws.bill.memory'|translate" sortable="'vMemory'" ng-if="colsConfigList[` + (1 + index) + `].show">{{item.vMemory}}</td>
                    <td data-title="'aws.bill.vmVolume'|translate" sortable="'vDisks'" ng-if="colsConfigList[` + (2 + index) + `].show">{{item.vDisks}}</td>
                    <td data-title="'aws.bill.pmcpu'|translate" sortable="'pCpu'" ng-if="colsConfigList[` + (3 + index) + `].show">{{item.pCpu}}</td>
                    <td data-title="'aws.bill.pmmemory'|translate" sortable="'pMemory'" ng-if="colsConfigList[` + (4 + index) + `].show">{{item.pMemory}}</td>
                    <td data-title="'aws.bill.pmhd'|translate" sortable="'pDisks'" ng-if="colsConfigList[` + (5 + index) + `].show">{{item.pDisks}}</td>`;
		}

		function initResUsageRateTable(col) {
			self.resUsagefilterData.searchTerm = "";
			self.resUsageRateTable = new NgTableParams({
				count: GLOBAL_CONFIG.PAGESIZE
			}, {
				counts: [],
				dataset: []
			});
			$('#resUsageRateTable').find(".table-cont").remove();
			let table = '';
			if (col == "domain") {
				self.col_title = $translate.instant('aws.bill.domain');
				self.fileName = $translate.instant('aws.bill.domianResUsageStatisticExport') + ".csv";
				//self.csvHeader = ['部门', '云主机CPU', '云主机内存', '云主机硬盘', '物理机CPU', '物理机内存', '物理机硬盘'];
				table = `
					<div class="table-cont">
						<!--<empty-tip empty-type="loadResUsageRateTableData" tip-id="'resUsageRate-tip-msg'"></empty-tip>-->
				    	<table class="table" ng-table="resUsageRateTable" >
							<tr ng-repeat="item in $data track by $index">
			                    <td header="'headerDropMenu.html'" sortable="'region'" ><a href="/#/system/resMetering?domainId={{item.domainId}}&&domainName={{item.domainName}}&&type=dep">{{item.domainName}}</a></td>
			                    ` + getCommonTdTmpl(1) + `
			                </tr>
			            </table>
			            <div ng-show="loadResUsageRateTableData">{{'aws.common.loading'|translate}}</div>
			            <div ng-show="resUsageRateTable.data.length == 0 && !loadResUsageRateTableData">{{'aws.common.empty'|translate}}</div>
		            </div>
				`;
			} else if (col == "project") {
				self.col_title = $translate.instant('aws.bill.project');
				self.fileName = $translate.instant('aws.bill.projectResUsageStatisticExport') + ".csv";
				//self.csvHeader = ['项目', '部门', '云主机CPU', '云主机内存', '云主机硬盘', '物理机CPU', '物理机内存', '物理机硬盘'];
				table = `
					<div class="table-cont">
						<!--<empty-tip empty-type="loadResUsageRateTableData" tip-id="'resUsageRate-tip-msg'"></empty-tip>-->
				    	<table class="table" ng-table="resUsageRateTable" >
							<tr ng-repeat="item in $data track by $index">
			                    <td header="'headerDropMenu.html'" sortable="'region'" ><a href="/#/system/resMetering?projectId={{item.projectId}}&&projectName={{item.projectName}}&&domainId={{item.domainId}}&&domainName={{item.domainName}}&&type=pro">{{item.projectName}}</a></td>
			                    <td data-title="'aws.bill.domain'|translate" sortable="'domainName'" ng-if="colsConfigList[1].show">{{item.domainName}}</td>
			                    ` + getCommonTdTmpl(2) + `
			                </tr>
			            </table>
			            <div ng-show="loadResUsageRateTableData">{{'aws.common.loading'|translate}}</div>
			            <div ng-show="resUsageRateTable.data.length == 0 && !loadResUsageRateTableData">{{'aws.common.empty'|translate}}</div>
		            </div>
				`;
			}
			table = $compile(table)(self);
			$('#resUsageRateTable')[0].appendChild(table[0]);
			getResUsageRateTable(col);

		}

		function getResUsageRateTable(col) {
			self.loadResUsageRateTableData = true;
			resMeteringSrv.resUsedStatistic({
				"regionCode": localStorage.regionKey,
				"dimension": self.resUsagefilterData.col,
				"startTimeMills": self.filterData.from ? Date.parse(new Date(self.filterData.from)) : null, //时间戳
				"endTimeMills": self.filterData.to ? Date.parse(new Date(self.filterData.to)) : null
			}).then(function(res) {
				res ? self.loadResUsageRateTableData = false : true;
				if (res && res.data) {
					if(!($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN)){
						res.data = res.data.filter(item=>{
							return item.projectId == localStorage.projectUid;
						})
					}
					if($rootScope.DOMAIN_ADMIN){
						res.data = res.data.filter(item=>{
							return item.domainId == localStorage.domainUid;
						})
					}

					self.csvDownloadData = [];
					res.data = _.map(res.data, function(item) {
						//console.log(item)
						if (item.domainName == 'default') {
                            item.domainName = '默认部门';
                        }
                        if (item.projectName == 'admin') {
                            item.projectName = '默认项目';
                        }

						let tempList = [];
						let searchTermList = [];
						item.vCpu = item.vCpu == null ? "0 %" : Math.ceil(item.vCpu) == item.vCpu ? item.vCpu + " %" : item.vCpu.toFixed(2) + " %";
						item.vMemory = item.vMemory == null ? "0 %" : Math.ceil(item.vMemory) == item.vMemory ? item.vMemory + "%" : item.vMemory.toFixed(2) + " %";
						item.vDisks = item.vDisks == null ? "0 %" : Math.ceil(item.vDisks) == item.vDisks ? item.vDisks + "%" : item.vDisks.toFixed(2) + " %";
						item.pCpu = item.pCpu == null ? "0 %" : Math.ceil(item.pCpu) == item.pCpu ? item.pCpu + "%" : item.pCpu.toFixed(2) + " %";
						item.pMemory = item.pMemory == null ? "0 %" : Math.ceil(item.pMemory) == item.pMemory ? item.pMemory + "%" : item.pMemory.toFixed(2) + " %";
						item.pDisks = item.pDisks == null ? "0 %" : Math.ceil(item.pDisks) == item.pDisks ? item.pDisks + "%" : item.pDisks.toFixed(2) + " %";
						for (let key in self.resUsagefilterData.colsParams) {
							if (key == "domain") {
								key = "domainName";
							}
							if (key == "project") {
								key = "projectName";
							}
							searchTermList.push(item[key]);
							item.searchTerm = searchTermList.join("\b");
							tempList.push(item[key]);
						}
						self.csvDownloadData.push(tempList);
						return item;
					});
					// if (col == "domain") {
					// 	res.data = _.map(res.data, function (item) {
					// 		item.searchTerm = [item.domainName, item.vCpu, item.vMemory, item.vDisks, item.pCpu, item.pMemory, item.pDisks].join("\b");
					// 		self.csvDownloadData.push([item.domainName, item.vCpu, item.vMemory, item.vDisks, item.pCpu, item.pMemory, item.pDisks]);
					// 		return item;
					// 	});
					// } else if (col == "project") {
					// 	res.data = _.map(res.data, function (item) {
					// 		item.searchTerm = [item.projectName, item.domainName, item.vCpu, item.vMemory, item.vDisks, item.pCpu, item.pMemory, item.pDisks].join("\b");
					// 		self.csvDownloadData.push([item.projectName, item.domainName, item.vCpu, item.vMemory, item.vDisks, item.pCpu, item.pMemory, item.pDisks]);
					// 		return item;
					// 	});
					// }
					self.resUsageRateTable = new NgTableParams({
						count: GLOBAL_CONFIG.PAGESIZE
					}, {
						counts: [],
						dataset: res.data
					});
				}
			});
		}

		//initResUsageRateTable(self.resUsagefilterData.col);

		self.selectCol = function(col, type) {
			if (col) {
				col = col;
				self.colsConfigList = self.colsConfigList.filter(item => {
					return item.value != "project" && item.value != "domain";
				});
				if (col == "domain") {
					self.colsConfigList.unshift({
						"value": "domain",
						"title": $translate.instant('aws.bill.domain'),
						"show": true,
						"disable": true
					});
				} else if (col == "project") {
					self.colsConfigList.unshift({
						"value": "project",
						"title": $translate.instant('aws.bill.project'),
						"show": true,
						"disable": true
					}, {
						"value": "domain",
						"title": $translate.instant('aws.bill.domain'),
						"show": true
					});
				}
			} else {
				col = self.resUsagefilterData.col
			}
			self.resUsagefilterData.col = col;
			self.csvHeader = [];
			self.resUsagefilterData.colsParams = {};
			_.each(self.colsConfigList, function(item) {
				if (item.show == true) {
					self.csvHeader.push(item.title);
					self.resUsagefilterData.colsParams[item.value] = 1;
				}
			});
			initResUsageRateTable(col);
		};
		//self.selectCol(self.resUsagefilterData.col);

		self.resUsageTableQuery = function() {
			initResUsageRateTable(self.resUsagefilterData.col);
		};

		self.downloadResUsageTableData = function() {
			return self.csvDownloadData;
		};

		self.applyGlobalSearch = function() {
			self.resUsageRateTable.filter({
				searchTerm: self.resUsagefilterData.searchTerm
			});
		};

		self.refreshResUsageTable = function() {
			self.resUsagefilterData = {
				timeStep: self.options.timeTypeList[0].value,
				from: "",
				to: "",
				col: "domain",
				searchTerm: "",
				definedTime:false,
				definedTimeText:$translate.instant('aws.bill.chooseDate')
			};
			initResUsageRateTable(self.resUsagefilterData.col);
		};

		self.$watch(function() {
			return $routeParams;
		}, function(value) {
			if (value && value.projectId && (value.type == 'depDetail' || value.type == "pro")) {
				self.proAnimation = "animateIn";
				self.$emit("proResUsageRateDetail", value);
			} else {
				self.proAnimation = "animateOut";
				if (value && value.domainId) {
					self.depAnimation = "animateIn";
					self.$emit("depResUsageRateDetail", value);
				} else {
					self.depAnimation = "animateOut";
				}
			}
			if(value){
	            $("body").addClass("animate-open");
	        }else{
	            $("body").removeClass("animate-open");
	        }
		}, true)

		self.$on("resUsageRate", function() {
			self.query();
			//self.selectCol(self.resUsagefilterData.col);
		});

	}
]);

resMeteringCtrlModule.controller('depResUsageRateDetailCtrl', ['$scope', '$rootScope', 'resMeteringSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', '$translate',
	function(self, $rootScope, resMeteringSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, $translate) {
		$rootScope.$on("depResUsageRateDetail", function(e, data) {
			self.domainName = data.domainName;

			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(2, "d").format("YYYY-MM-DD 00:00:00"),
				to: moment().format("YYYY-MM-DD 23:59:59"),
				searchTerm: "",
				colsParams: {},
				definedTime:false,
				definedTimeText:$translate.instant('aws.bill.chooseDate')
			};

			let colsConfigList = [{
				value: "project",
				title: $translate.instant('aws.bill.project'),
				show: true,
				disable: true
			}, {
				value: "vCpu",
				title: $translate.instant('aws.bill.cpu'),
				show: true
			}, {
				value: "vMemory",
				title: $translate.instant('aws.bill.memory'),
				show: true
			}, {
				value: "vDisks",
				title: $translate.instant('aws.bill.vmVolume'),
				show: true
			}, {
				value: "pCpu",
				title: $translate.instant('aws.bill.pmcpu'),
				show: true
			}, {
				value: "pMemory",
				title: $translate.instant('aws.bill.pmmemory'),
				show: true
			}, {
				value: "pDisks",
				title: $translate.instant('aws.bill.pmhd'),
				show: true
			}];
			self.colsConfigList = angular.copy(colsConfigList);

			self.fileName = $translate.instant('aws.bill.projectResUsageStatisticExport') + ".csv";
			//self.csvHeader = ['项目', '云主机CPU', '云主机内存', '云主机硬盘', '物理机CPU', '物理机内存', '物理机硬盘'];

			function getDepResUsageRateTable() {
				self.filterData.searchTerm = "";
				resMeteringSrv.resUsedStatistic({
					"regionCode": localStorage.regionKey,
					"dimension": "project",
					"domainId": data.domainId,
					"startTimeMills": self.filterData.from ? Date.parse(new Date(self.filterData.from)) : null, //时间戳
					"endTimeMills": self.filterData.to ? Date.parse(new Date(self.filterData.to)) : null
				}).then(function(res) {
					res ? self.loadDepResUsageRateTableData = true : false;
					if (res && res.data) {
						self.csvDownloadData = [];
						res.data = _.map(res.data, function(item) {
							if (item.domainName == 'default') {
	                            item.domainName = '默认部门';
	                        }
	                        if (item.projectName == 'admin') {
	                            item.projectName = '默认项目';
	                        }
							let tempList = [];
							let searchTermList = [];
							item.vCpu = item.vCpu == null ? "0 %" : Math.ceil(item.vCpu) == item.vCpu ? item.vCpu + "%" : item.vCpu.toFixed(2) + " %";
							item.vMemory = item.vMemory == null ? "0 %" : Math.ceil(item.vMemory) == item.vMemory ? item.vMemory + "%" : item.vMemory.toFixed(2) + " %";
							item.vDisks = item.vDisks == null ? "0 %" : Math.ceil(item.vDisks) == item.vDisks ? item.vDisks + "%" : item.vDisks.toFixed(2) + " %";
							item.pCpu = item.pCpu == null ? "0 %" : Math.ceil(item.pCpu) == item.pCpu ? item.pCpu + "%" : item.pCpu.toFixed(2) + " %";
							item.pMemory = item.pMemory == null ? "0 %" : Math.ceil(item.pMemory) == item.pMemory ? item.pMemory + "%" : item.pMemory.toFixed(2) + " %";
							item.pDisks = item.pDisks == null ? "0 %" : Math.ceil(item.pDisks) == item.pDisks ? item.pDisks + "%" : item.pDisks.toFixed(2) + " %";
							//item.searchTerm = [item.projectName, item.vCpu, item.vMemory, item.vDisks, item.pCpu, item.pMemory, item.pDisks].join("\b");
							//self.csvDownloadData.push([item.projectName, item.vCpu, item.vMemory, item.vDisks, item.pCpu, item.pMemory, item.pDisks]);
							for (let key in self.filterData.colsParams) {
								if (key == "domain") {
									key = "domainName";
								}
								if (key == "project") {
									key = "projectName";
								}
								searchTermList.push(item[key]);
								item.searchTerm = searchTermList.join("\b");
								tempList.push(item[key]);
							}
							self.csvDownloadData.push(tempList);
							return item;
						});
						self.depResUsageRateTable = new NgTableParams({
							count: GLOBAL_CONFIG.PAGESIZE
						}, {
							counts: [],
							dataset: res.data
						});
					}
				});
			}
			//getDepResUsageRateTable();

			self.selectCol = function() {
				self.csvHeader = [];
				self.filterData.colsParams = {};
				_.each(self.colsConfigList, function(item) {
					if (item.show == true) {
						self.csvHeader.push(item.title);
						self.filterData.colsParams[item.value] = 1;
					}
				});
				getDepResUsageRateTable();
			};
			self.selectCol();

			self.query = function() {
				getDepResUsageRateTable();
			};

			self.downloadData = function() {
				return self.csvDownloadData;
			};

			self.applyGlobalSearch = function() {
				self.depResUsageRateTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.refreshTable = function() {
				self.filterData = {
					timeStep: "3d",
					from: moment().subtract(2, "d").format("YYYY-MM-DD 00:00:00"),
					to: moment().format("YYYY-MM-DD 23:59:59"),
					searchTerm: "",
					definedTime:false,
					definedTimeText:$translate.instant('aws.bill.chooseDate')
				};
				getDepResUsageRateTable();
			};
		});

	}
]);
resMeteringCtrlModule.controller('proResUsageRateDetailCtrl', ['$scope', '$rootScope', 'resMeteringSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', '$translate',
	function(self, $rootScope, resMeteringSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, $translate) {
		$rootScope.$on("proResUsageRateDetail", function(e, data) {
			self.domainId = data.domainId;
			self.projectName = data.projectName;
			self.domainName = data.domainName;

			if (data.type == 'pro') {
				self.depDetail = false;
			} else {
				self.depDetail = true;
			}

			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(2, "d").format("YYYY-MM-DD 00:00:00"),
				to: moment().format("YYYY-MM-DD 23:59:59"),
				searchTerm: "",
				col: "virtual",
				definedTime:false,
				definedTimeText:$translate.instant('aws.bill.chooseDate')
			};

			self.colsList = [{
				value: "virtual",
				title: $translate.instant('aws.bill.vm'),
				show: true
			}, {
				value: "physical",
				title: $translate.instant('aws.bill.pm'),
				show: true
			}];
			$('#proResUsageRateTable').find(".table-cont").remove();

			function initResUsageRateTable(col) {
				self.filterData.searchTerm = "";
				self.proResUsageRateTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: []
				});
				$('#proResUsageRateTable').find(".table-cont").remove();
				let table = '';
				if (col == "virtual") {
					self.col_title = $translate.instant('aws.bill.vm');
					self.fileName = $translate.instant('aws.bill.vmResUsageStatisticExport') + ".csv";
					self.csvHeader = [$translate.instant('aws.bill.vm'), $translate.instant('aws.bill.cpu'), $translate.instant('aws.bill.memory'), $translate.instant('aws.bill.vmVolume')];
					table = `
					<div class="table-cont">
						<!--<empty-tip empty-type="loadProResUsageRateTableData" tip-id="'proResUsageRate-tip-msg'"></empty-tip>-->
				    	<table class="table" ng-table="proResUsageRateTable" >
							<tr ng-repeat="item in $data track by $index">
			                    <td header="'headerDropMenu.html'" sortable="''" >{{item.virtualName}}</td>
			                    <td data-title="'aws.bill.cpu'|translate" sortable="'vCpu'">{{item.vCpu}}</td>
                				<td data-title="'aws.bill.memory'|translate" sortable="'vMemory'">{{item.vMemory}}</td>
                   				<td data-title="'aws.bill.vmVolume'|translate" sortable="'vDisks'">{{item.vDisks}}</td>
			                </tr>
			            </table>
			            <div ng-show="loadProResUsageRateTableData"> {{'aws.common.loading'|translate}}</div>
			            <div ng-show="proResUsageRateTable.data.length==0 && !loadProResUsageRateTableData "> {{'aws.common.empty'|translate}}</div>
		            </div>
				`;
				} else if (col == "physical") {
					self.col_title = $translate.instant('aws.bill.pm');
					self.fileName = $translate.instant('aws.bill.pmResUsageStatisticExport') + ".csv";
					self.csvHeader = [$translate.instant('aws.bill.pm'), $translate.instant('aws.bill.pmcpu'), $translate.instant('aws.bill.pmmemory'), $translate.instant('aws.bill.pmhd')];
					table = `
					<div class="table-cont">
						<!--<empty-tip empty-type="loadProResUsageRateTableData" tip-id="'proResUsageRate-tip-msg'"></empty-tip>-->
				    	<table class="table" ng-table="proResUsageRateTable" >
							<tr ng-repeat="item in $data track by $index">
			                    <td header="'headerDropMenu.html'" sortable="''" >{{item.physicalName}}</td>
			                    <td data-title="'aws.bill.pmcpu'|translate" sortable="'pCpu'">{{item.pCpu}}</td>
                    			<td data-title="'aws.bill.pmmemory'|translate" sortable="'pMemory'">{{item.pMemory}}</td>
                    			<td data-title="'aws.bill.pmhd'|translate" sortable="'pDisks'">{{item.pDisks}}</td>
			                </tr>
			            </table>
			            <div ng-show="loadProResUsageRateTableData">  {{'aws.common.loading'|translate}}</div>
			            <div ng-show="proResUsageRateTable.data.length==0 && !loadProResUsageRateTableData "> {{'aws.common.empty'|translate}}</div>
		            </div>
				`;
				}
				table = $compile(table)(self);
				$('#proResUsageRateTable')[0].appendChild(table[0]);
				getProResUsageRateTable(col);
			}

			function getProResUsageRateTable(col) {
				self.loadProResUsageRateTableData = true;
				self.csvDownloadData = [];
				resMeteringSrv.resUsedStatistic({
					"regionCode": localStorage.regionKey,
					"dimension": col, //'virtual' 'physical'
					"domainId": data.domainId,
					"projectId": data.projectId,
					"startTimeMills": self.filterData.from ? Date.parse(new Date(self.filterData.from)) : null, //时间戳
					"endTimeMills": self.filterData.to ? Date.parse(new Date(self.filterData.to)) : null
				}).then(function(res) {
					res ? self.loadProResUsageRateTableData = false : true;
					if (res && res.data) {
						if (col == "virtual") {
							res.data = _.map(res.data, function(item) {
								item.vCpu = item.vCpu == null ? "0 %" : Math.ceil(item.vCpu) == item.vCpu ? item.vCpu + "%" : item.vCpu.toFixed(2) + "%";
								item.vMemory = item.vMemory == null ? "0 %" : Math.ceil(item.vMemory) == item.vMemory ? item.vMemory + "%" : item.vMemory.toFixed(2) + "%";
								item.vDisks = item.vDisks == null ? "0 %" : Math.ceil(item.vDisks) == item.vDisks ? item.vDisks + "%" : item.vDisks.toFixed(2) + "%";
								item.searchTerm = [item.virtualName, item.vCpu, item.vMemory, item.vDisks].join("\b");
								self.csvDownloadData.push([item.virtualName, item.vCpu, item.vMemory, item.vDisks]);
								return item;
							});
						} else if (col == "physical") {
							res.data = _.map(res.data, function(item) {
								item.pCpu = item.pCpu == null ? "0 %" : Math.ceil(item.pCpu) == item.pCpu ? item.pCpu + "%" : item.pCpu.toFixed(2) + "%";
								item.pMemory = item.pMemory == null ? "0 %" : Math.ceil(item.pMemory) == item.pMemory ? item.pMemory + "%" : item.pMemory.toFixed(2) + "%";
								item.pDisks = item.pDisks == null ? "0 %" : Math.ceil(item.pDisks) == item.pDisks ? item.pDisks + "%" : item.pDisks.toFixed(2) + "%";
								item.searchTerm = [item.physicalName, item.pCpu, item.pMemory, item.pDisks].join("\b");
								self.csvDownloadData.push([item.physicalName, item.pCpu, item.pMemory, item.pDisks]);
								return item;
							});
						}
						self.proResUsageRateTable = new NgTableParams({
							count: GLOBAL_CONFIG.PAGESIZE
						}, {
							counts: [],
							dataset: res.data
						});
					}
				});
			}

			initResUsageRateTable(self.filterData.col);

			self.selectCol = function(col, type) {
				self.filterData.col = col;
				initResUsageRateTable(col);
			};

			self.query = function() {
				initResUsageRateTable(self.filterData.col);
			};

			self.downloadData = function() {
				return self.csvDownloadData;
			};

			self.applyGlobalSearch = function() {
				self.proResUsageRateTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.refreshTable = function() {
				self.filterData = {
					timeStep: "3d",
					from: moment().subtract(2, "d").format("YYYY-MM-DD 00:00:00"),
					to: moment().format("YYYY-MM-DD 23:59:59"),
					searchTerm: "",
					col: "virtual",
					definedTime:false,
					definedTimeText:$translate.instant('aws.bill.chooseDate')
				};
				initResUsageRateTable(self.filterData.col);
			};

		});

	}
]);