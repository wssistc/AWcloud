import "./billingSrv";
import {
	PiePanelDefault
} from "../../chartpanel";

var billingCtrlModule = angular.module("billingCtrlModule", ["billingSrvModule"]);

billingCtrlModule.controller('billingCtrl', ['$scope', '$rootScope', '$translate', 'billingSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'resize',
	function(self, $rootScope, $translate, billingSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, resize) {
		let billingStatusRes = {};
		self.billingPage = false;
		self.billingStartTime = localStorage.billingStartTime;
		$rootScope.inBillingModule = true;

		function getBillingStatus() {
			billingSrv.getBillingStatus().then(function(res) {
				if (res && res.data && res.data[0]) {
					billingStatusRes = res.data[0];
					if (res.data[0].paramValue == "1") { //1 打开 0 关闭
						self.billingActive = true;
						self.billingPage = true;
						let startTime = new Date(res.data[0].updateTime);
						let hh = startTime.getHours();
						let mm = startTime.getMinutes();
						if (mm > 0) {
							hh = hh + 1;
						}
						startTime = moment(new Date(res.data[0].updateTime)).format("YYYY-MM-DD  ") + hh + ":00";
						self.billingStartTime = startTime;
					} else {
						self.billingActive = false;
						self.billingSwitchPage = true;
					}
				}
			});
		}
		getBillingStatus();

		self.billingSwitch = function() {
			billingStatusRes.paramValue = self.billingActive ? "1" : "0";
			billingSrv.updateBillingStatus(billingStatusRes).then(function(res) {
				if (res.status == "0") {
					if (self.billingActive) {
						$rootScope.billingActive = true;
						self.billingPage = true;
						self.billingSwitchPage = false;
						getBillingStatus();
						billingSrv.getLoginAccountConsumeData().then(function(res) {
							if (res) {
								$rootScope.loginAccountConsumeData = res.data;
							}
						});
					} else {
						$rootScope.billingActive = false;
						self.billingPage = false;
						self.billingSwitchPage = true;
					}
				}
			});
		};

	}
]);

billingCtrlModule.controller('billingStatisticCtrl', ['$scope', '$rootScope', '$translate', 'billingSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$compile', '$routeParams', '$location', 'resize', 'FileSaver', 'Blob',
	function(self, $rootScope, $translate, billingSrv, NgTableParams, GLOBAL_CONFIG, $compile, $routeParams, $location, resize, FileSaver, Blob) {
		self.filterData = {
			timeStep: "",
			col: "region",
			from: null,
			to: null,
			searchTerm: "",
			definedTime: false,
			definedTimeText: $translate.instant('aws.bill.chooseDate')
		};
		$rootScope.billOptions = {
			regionsList: [],
			domainsList: [],
			projectsList: [],
			usersList: [],
			resList: []
		};
		billingSrv.billOptions = $rootScope.billOptions;

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

		self.$watch(function() {
			return self.billingPage;
		}, function(billingPage) {
			if (billingPage) {
				$('#consumeStatisticTable').find(".table-cont").remove();
				self.tb_csv_info = {};

				function getResConsumeData() {
					let params = {
						"startTime": self.filterData.from,
						"endTime": self.filterData.to
					};
					params = setParams(params);
					self.res_csv_info = "资源类型" + "," + "费用（元）" + "," + "比例" + "\n";
					billingSrv.getResConsumeData(params).then(function(res) {
						if (res && res.data) {
							self.resConsumeChart = new PiePanelDefault();
							self.resConsumeChart.panels.pieType = "category";
							self.resConsumeChart.panels.data = [];
							self.resConsumeTotal = 0;
							_.each(res.data, function(item) {
								self.resConsumeChart.panels.data.push({
									name: item.resourceName,
									value: item.consumptionAmount,
									percent: item.proportion
								});
								self.resConsumeTotal += item.consumptionAmount;
							});
							self.resConsumeChart.panels.data = _.map(self.resConsumeChart.panels.data, item => {
								item.name = $translate.instant("aws.bill." + (item.name).toLowerCase());
								item.percent = (Number(item.percent) * 100).toFixed(2) + "%";
								item.value = item.value.toFixed(2);
								self.res_csv_info += item.name + "," + item.value + "," + item.percent + "\n";
								return item;
							});
							self.resConsumeTotal = $rootScope.miliFormat(self.resConsumeTotal.toFixed(2));
						}
					});
				}


				if ($rootScope.PROJECT_ADMIN || !($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN || $rootScope.PROJECT_ADMIN)) {
					self.colsList = [{
						value: "region",
						title: $translate.instant("aws.bill.region"),
						show: true
					}, {
						value: "pro",
						title: $translate.instant("aws.bill.belong_project"),
						show: true
					}, {
						value: "user",
						title: $translate.instant("aws.bill.user"),
						show: true
					}];
				} else {
					self.colsList = [{
						value: "region",
						title: $translate.instant("aws.bill.region"),
						show: true
					}, {
						value: "dep",
						title: $translate.instant("aws.bill.belong_domain"),
						show: true
					}, {
						value: "pro",
						title: $translate.instant("aws.bill.belong_project"),
						show: true
					}, {
						value: "user",
						title: $translate.instant("aws.bill.user"),
						show: true
					}];
				}

				function getTableTmpl(tds) {
					let table = '';
					table = `
						<div class="table-cont">
							<empty-tip empty-type="loadconsumeTableData" tip-id="'consume-tip-msg'"></empty-tip>
					    	<table class="table table-nowrap" ng-table="consumeStatisticTable" >
								<tr ng-repeat="item in $data track by $index">
				                    ` + tds + `
				                    <td data-title="'aws.bill.cost'|translate" sortable="'consumptionAmount'">{{miliFormat(item.consumptionAmount)}}</td>
				                </tr>
				            </table>
			            </div>
					`;
					return table;
				}

				function initRegionConsumeTableTmpl() {
					self.col_title = $translate.instant("aws.bill.region");
					self.fileName = $translate.instant("aws.bill.regionConsumeStatistic") + ".csv";
					self.csvHeader = [$translate.instant("aws.bill.region"), $translate.instant("aws.bill.cost")];
					let tds = `
						<td header="'headerDropMenu.html'" sortable="'region'" ><a href="/#/system/billingManagement?id={{item.region}}&&type=region">{{item.region}}</a></td>
				    `;
					table = getTableTmpl(tds);
				}

				function initDepConsumeTableTmpl() {
					self.col_title = $translate.instant("aws.bill.belong_domain");
					self.fileName = $translate.instant("aws.bill.domainConsumeStatistic") + ".csv";
					self.csvHeader = [$translate.instant("aws.bill.belong_domain"), $translate.instant("aws.bill.region"), $translate.instant("aws.bill.cost")];
					let tds = `
						<td header="'headerDropMenu.html'" sortable="'disDomainName'"><a href="/#/system/billingManagement?id={{item.deptId}}&&name={{item.deptName}}&&regionName={{item.region}}&&type=dep" >{{item.disDomainName}}</a></td>
                        <td data-title="'aws.bill.region'|translate" sortable="'region'">{{item.region}}</td>
				    `;
					table = getTableTmpl(tds);
				}

				function initProConsumeTableTmpl() {
					self.col_title = $translate.instant("aws.bill.belong_project");
					self.fileName = $translate.instant("aws.bill.projectConsumeStatistic") + ".csv";
					self.csvHeader = [$translate.instant("aws.bill.belong_project"), $translate.instant("aws.bill.region"), $translate.instant("aws.bill.belong_domain"), $translate.instant("aws.bill.cost")];
					let tds = `
						<td header="'headerDropMenu.html'" sortable="'disProjectName'"><a href="/#/system/billingManagement?id={{item.projectId}}&&name={{item.projectName}}&&regionName={{item.region}}&&deptId={{item.deptId}}&&type=pro" >{{item.disProjectName}}</a></td>
                        <td data-title="'aws.bill.region'|translate" sortable="'region'">{{item.region}}</td>
                        <td data-title="'aws.bill.belong_domain'|translate" sortable="'disDomainName'">{{item.disDomainName}}</td>
				    `;
					table = getTableTmpl(tds);
				}

				function initUserConsumeTableTmpl() {
					self.col_title = $translate.instant("aws.bill.user");
					self.fileName = $translate.instant("aws.bill.userConsumeStatistic") + ".csv";
					self.csvHeader = [$translate.instant("aws.bill.user"), $translate.instant("aws.bill.region"), $translate.instant("aws.bill.belong_domain"), $translate.instant("aws.bill.belong_project"), $translate.instant("aws.bill.cost")];
					let tds = `
						<td header="'headerDropMenu.html'" sortable="'userName'" ><a href="/#/system/billingManagement?consumeUserId={{item.userId}}&&name={{item.userName}}&&regionName={{item.region}}&&deptId={{item.deptId}}&&projectId={{item.projectId}}&&type=user">{{item.userName}}</a></td>
	                    <td data-title="'aws.bill.region'|translate" sortable="'region'">{{item.region}}</td>
	                    <td data-title="'aws.bill.belong_domain'|translate" sortable="'disDomainName'">{{item.disDomainName}}</td>
	                    <td data-title="'aws.bill.belong_project'|translate" sortable="'disProjectName'">{{item.disProjectName}}</td>
				    `;
					table = getTableTmpl(tds);
				}

				function initConsumeStatisticTable(tableData) {
					self.consumeStatisticTable = new NgTableParams({
						count: GLOBAL_CONFIG.PAGESIZE
					}, {
						counts: [],
						dataset: tableData
					});
				}

				function getRegionConsumeData() {
					let params = {
						"startTime": self.filterData.from,
						"endTime": self.filterData.to
					};
					params = setParams(params);

					self.region_csv_info = "数据中心,费用（元）,比例\n";
					billingSrv.getRegionConsumeData(params).then(function(res) {
						res ? self.loadconsumeTableData = true : false;
						if (res && res.data) {
							self.regionConsumeChart = new PiePanelDefault();
							self.regionConsumeChart.panels.pieType = "category";
							self.regionConsumeChart.panels.data = [];
							self.regionConsumeTotal = 0;
							//self.csvDownloadData = [];
							self.tb_csv_info = "数据中心,费用（元）\n";
							billingSrv.billOptions.regionsList = [];
							res.data = _.map(res.data, function(item) {
								billingSrv.billOptions.regionsList.push({
									name: item.region,
									id: item.region
								});
								self.regionConsumeChart.panels.data.push({
									name: item.region,
									value: item.consumptionAmount
								});
								item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
								self.regionConsumeTotal += Number(item.consumptionAmount);
								item.searchTerm = [item.region, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
								//self.csvDownloadData.push([item.region, $rootScope.miliFormat(item.consumptionAmount)]);
								self.tb_csv_info += item.region + "," + item.consumptionAmount + "\n";
								return item;
							});
							_.map(self.regionConsumeChart.panels.data, item => {
								let org_percent = Number(self.regionConsumeTotal) == 0 ? 0 : (Number(item.value) / Number(self.regionConsumeTotal)) * 100;
								item.percent = org_percent.toFixed(2) + "%";
								item.value = item.value.toFixed(2);
								self.region_csv_info += item.name + "," + item.value + "," + item.percent + "\n";
								return item;
							});
							self.regionConsumeTotal = self.regionConsumeTotal.toFixed(2);

							if ($rootScope.ADMIN) {
								initConsumeStatisticTable(res.data);
							}
						}
					});
				}

				self.selectCol = function(col) {
					self.filterData.col = col;
					self.filterData.searchTerm = "";
					$('#consumeStatisticTable').find(".table-cont").remove();
					let params = {
						"startTime": self.filterData.from,
						"endTime": self.filterData.to
					};
					params = setParams(params);
					if (col == 'region') {
						initRegionConsumeTableTmpl();
						billingSrv.getRegionConsumeData(params).then(function(res) {
							res ? self.loadconsumeTableData = true : false;
							if (res && res.data) {
								//self.csvDownloadData = [];
								self.tb_csv_info = "数据中心,费用（元）\n";
								res.data = _.map(res.data, item => {
									item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
									item.searchTerm = [item.region, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
									//self.csvDownloadData.push([item.region, $rootScope.miliFormat(item.consumptionAmount)]);
									self.tb_csv_info += item.region + "," + item.consumptionAmount + "\n";
									return item;
								});
								initConsumeStatisticTable(res.data);
							}
						});
					} else if (col == 'dep') {
						initDepConsumeTableTmpl();
						billingSrv.getDepConsumeData(params).then(function(res) {
							res ? self.loadconsumeTableData = true : false;
							if (res && res.data) {
								//self.csvDownloadData = [];
								self.tb_csv_info = "所属部门,数据中心,费用（元）\n";
								res.data = _.map(res.data, item => {
									if (item.deptName == 'default') {
										item.disDomainName = '默认部门';
									} else {
										item.disDomainName = item.deptName;
									}
									item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
									item.searchTerm = [item.region, $rootScope.miliFormat(item.consumptionAmount), item.disDomainName].join("\b");
									//self.csvDownloadData.push([item.deptName, item.region, $rootScope.miliFormat(item.consumptionAmount)]);
									self.tb_csv_info += item.deptName + "," + item.region + "," + item.consumptionAmount + "\n";
									return item;
								});
								initConsumeStatisticTable(res.data);
							}
						});
					} else if (col == 'pro') {
						initProConsumeTableTmpl();
						billingSrv.getProConsumeData(params).then(function(res) {
							res ? self.loadconsumeTableData = true : false;
							if (res && res.data) {
								//self.csvDownloadData = [];
								self.tb_csv_info = "所属项目,数据中心,所属部门,费用（元）\n";
								res.data = _.map(res.data, item => {
									if (item.projectName == 'admin'&&item.deptName == 'default') {
                                        item.disProjectName = '默认项目';
                                        item.disDomainName = '默认部门';
                                    } else {
                                        item.disProjectName = item.projectName;
                                        item.disDomainName = item.deptName;
                                    }
									item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
									item.searchTerm = [item.region, $rootScope.miliFormat(item.consumptionAmount), item.disDomainName, item.disProjectName].join("\b");
									//self.csvDownloadData.push([item.projectName, item.region, item.deptName, $rootScope.miliFormat(item.consumptionAmount)]);
									self.tb_csv_info += item.projectName + "," + item.region + "," + item.deptName + "," + item.consumptionAmount + "\n";
									return item;
								});
								initConsumeStatisticTable(res.data);
							}
						});
					} else if (col == 'user') {
						initUserConsumeTableTmpl();
						billingSrv.getUserConsumeData(params).then(function(res) {
							res ? self.loadconsumeTableData = true : false;
							if (res && res.data) {
								//self.csvDownloadData = [];
								self.tb_csv_info = "用户,数据中心,所属部门,所属项目,费用（元）\n";
								res.data = _.map(res.data, item => {
									if (item.projectName == 'admin'&&item.deptName == 'default') {
                                        item.disProjectName = '默认项目';
                                        item.disDomainName = '默认部门';
                                    } else {
                                        item.disProjectName = item.projectName;
                                        item.disDomainName = item.deptName;
                                    }
									item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
									item.searchTerm = [item.region, $rootScope.miliFormat(item.consumptionAmount), item.disDomainName, item.disProjectName, item.userName].join("\b");
									//self.csvDownloadData.push([item.userName, item.region, item.deptName, item.projectName, $rootScope.miliFormat(item.consumptionAmount)]);
									self.tb_csv_info += item.userName + "," + item.region + "," + item.deptName + "," + item.projectName + "," + item.consumptionAmount + "\n";
									return item;
								});
								initConsumeStatisticTable(res.data);
							}
						});
					}
					table = $compile(table)(self);
					$('#consumeStatisticTable')[0].appendChild(table[0]);
				};

				//搜索
				self.applyGlobalSearch = function() {
					self.consumeStatisticTable.filter({
						searchTerm: self.filterData.searchTerm
					});
				};

				self.query = function() {
					// if (self.filterData.col != "region") {
						getRegionConsumeData();
					// }
					getResConsumeData();
					self.selectCol(self.filterData.col);
				};

				self.refreshConsumeStatisticTable = function() {
					// self.filterData.definedTime = false,
					// self.filterData.definedTimeText = "选择日期";
					self.selectCol(self.filterData.col);
				};

				self.downloadConsumeData = function() {
					let csv_info = self.region_csv_info + "\n\n\n" + self.res_csv_info + "\n\n\n" + self.tb_csv_info + "\n\n\n";
					let blob = new Blob(
						[csv_info], {
							type: "text/csv;charset=utf-8;"
						}
					);
					FileSaver.saveAs(blob, "消费统计数据导出.csv");
					//return self.csvDownloadData;
				};

				let table = '';
				initRegionConsumeTableTmpl();
				table = $compile(table)(self);
				$('#consumeStatisticTable')[0].appendChild(table[0]);
				getRegionConsumeData();
				getResConsumeData();
				if ($rootScope.DOMAIN_ADMIN) {
					self.selectCol('dep');
				} else if ($rootScope.PROJECT_ADMIN) {
					self.selectCol('pro');
				} else if (!($rootScope.ADMIN || $rootScope.DOMAIN_ADMIN || $rootScope.PROJECT_ADMIN)) {
					self.selectCol('user');
				}

			}
		});

		self.$watch(function() {
			return $routeParams;
		}, function(value) {
			self.currPage = "region";
			if (value && (value.id || value.consumeUserId)) {
				self.animation = "animateIn";
				self.currPage = value.type;
				if ($location.path() == "/system/billingManagement") {
					if (value.from == "global") {
						$rootScope.inBillingModule = false;
					} else {
						$rootScope.inBillingModule = true;
					}
				}
			} else {
				self.animation = "animateOut";
			}
			if (value.id && value.type == "region") {
				self.$emit("regionConsumeDetail", value);
			}
			if (value.id && value.type == "dep") {
				self.$emit("depConsumeDetail", value);
			}
			if (value.id && value.type == "pro") {
				self.$emit("proConsumeDetail", value);
			}
			if (value.consumeUserId && value.type == "user" && value.resName) {
				$rootScope.userResAnimation = "animateIn";
				self.$emit("userResConsumeDetail", value);
			} else {
				$rootScope.userResAnimation = "animateOut";
				if (value.consumeUserId && value.type == "user") {
					$rootScope.userAnimation = "animateIn";
					self.$emit("userConsumeDetail", value);
				} else {
					$rootScope.userAnimation = "animateOut";
				}
			}
			if(value.type){
	            $("body").addClass("animate-open")
	        }else{
	            $("body").removeClass("animate-open")
	        }
		}, true);

		resize().call(function() {
			if (document.body.clientWidth < 1680) {
				self.resMedia = true;
			} else {
				self.resMedia = false;
			}
		});
	}
]);

billingCtrlModule.controller('regionConsumeDetailCtrl', ['$scope', '$compile', '$translate', '$rootScope', '$routeParams', 'billingSrv', 'billingHeaderSrv', 'NgTableParams', 'GLOBAL_CONFIG',
	function($scope, $compile, $translate, $rootScope, $routeParams, billingSrv, billingHeaderSrv, NgTableParams, GLOBAL_CONFIG) {
		var self = $scope;
		$rootScope.$on("regionConsumeDetail", function(e, data) {
			// $rootScope.billOptions.regionsList = billingSrv.billOptions.regionsList;
			self.regionName = data.id;
			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(3, "d").format("YYYY-MM-DD"),
				to: moment().format("YYYY-MM-DD"),
				searchTerm: "",
				definedTime: false,
				definedTimeText: $translate.instant('aws.bill.chooseDate')
			};

			// function initRegion(regionsList) {
			// 	$rootScope.billOptions.regionsList = regionsList;
			// 	_.each(regionsList, item => {
			// 		if (item.id == data.id) {
			// 			self.filterData.region = item;
			// 		}
			// 	});
			// }
			billingHeaderSrv.getRegionList(self);

			self.changeBillFilter = function(data, type) {
				self.regionName = data.id;
				self.query();
			};

			self.fileName = $translate.instant("aws.bill.regionResConsumeStatistic") + ".csv";
			self.csvHeader = [$translate.instant("aws.bill.name"), $translate.instant("aws.bill.cost")];

			function initConsumeStatisticTable(tableData) {
				self.resOfRegionConsumeStatisticTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: tableData
				});
			}

			function getRegionDepConsumeData() {
				billingSrv.getDepConsumeData({
					region: self.regionName,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					if (res && res.data) {
						self.depConsumeChart = new PiePanelDefault();
						self.depConsumeChart.panels.pieType = "category";
						self.depConsumeChart.panels.data = [];
						self.depConsumeTotal = 0;
						billingSrv.billOptions.domainsList = [];
						_.map(res.data, function(item) {
							billingSrv.billOptions.domainsList.push({
								name: item.deptName,
								id: item.deptId,
							});
							self.depConsumeChart.panels.data.push({
								name: item.deptName=='default'?'默认部门':item.deptName,
								deptId: item.deptId,
								region: item.region,
								value: item.consumptionAmount
							});
							item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
							self.depConsumeTotal += Number(item.consumptionAmount);
							return item;
						});
						_.map(self.depConsumeChart.panels.data, item => {
							let org_percent = Number(self.depConsumeTotal) == 0 ? 0 : (Number(item.value) / Number(self.depConsumeTotal)) * 100;
							item.percent = org_percent.toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.depConsumeTotal = self.depConsumeTotal.toFixed(2);
					}
				});
			}

			function getRegionResConsumeData() {
				billingSrv.getResConsumeData({
					region: self.regionName,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					res ? self.loadResofRegionConsumeTableData = true : false;
					if (res && res.data) {
						self.dep_resConsumeChart = new PiePanelDefault();
						self.dep_resConsumeChart.panels.pieType = "category";
						self.dep_resConsumeChart.panels.data = [];
						self.dep_resConsumeTotal = 0;
						self.csvDownloadData = [];
						res.data = _.map(res.data, item => {
							self.dep_resConsumeChart.panels.data.push({
								name: item.resourceName,
								value: item.consumptionAmount,
								percent: item.proportion
							});
							item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
							item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
							item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
							self.dep_resConsumeTotal += Number(item.consumptionAmount);
							self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
							return item;
						});
						self.dep_resConsumeChart.panels.data = _.map(self.dep_resConsumeChart.panels.data, item => {
							item.name = $translate.instant("aws.bill." + (item.name).toLowerCase());
							item.percent = (Number(item.percent) * 100).toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.dep_resConsumeTotal = self.dep_resConsumeTotal.toFixed(2);

						initConsumeStatisticTable(res.data);
					}
				});
			}

			//搜索
			self.applyGlobalSearch = function() {
				self.resOfRegionConsumeStatisticTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.query = function() {
				self.filterData.searchTerm = "";
				// billingSrv.getResConsumeData({
				// 	region: data.id,
				// 	startTime: self.filterData.from,
				// 	endTime: self.filterData.to
				// }).then(function(res) {
				// 	res ? self.loadResofRegionConsumeTableData = true : false;
				// 	if (res && res.data) {
				// 		self.csvDownloadData = [];
				// 		res.data = _.map(res.data, item => {
				// 			item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
				// 			item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
				// 			self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
				// 			return item;
				// 		});
				// 		initConsumeStatisticTable(res.data);
				// 	}
				// });
				getRegionDepConsumeData();
				getRegionResConsumeData();
			};
			self.query();

			self.refreshConsumeStatisticTable = function() {
				self.filterData = {
					timeStep: "",
					from: null,
					to: null,
					searchTerm: "",
					definedTime: false,
					definedTimeText: $translate.instant('aws.bill.chooseDate')
				};
				self.query();
			};

			self.downloadConsumeData = function() {
				return self.csvDownloadData;
			};

		});
	}
]);

billingCtrlModule.controller('depConsumeDetailCtrl', ['$scope', '$translate', '$rootScope', '$location', 'billingSrv', 'billingHeaderSrv', 'NgTableParams', 'GLOBAL_CONFIG',
	function($scope, $translate, $rootScope, $location, billingSrv, billingHeaderSrv, NgTableParams, GLOBAL_CONFIG) {
		var self = $scope;
		$rootScope.$on("depConsumeDetail", function(e, data) {
			self.regionName = data.regionName;
			self.deptId = data.id;
			self.depName = data.name;
			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(3, "d").format("YYYY-MM-DD"),
				to: moment().format("YYYY-MM-DD"),
				searchTerm: "",
				definedTime: false,
				definedTimeText: $translate.instant('aws.bill.chooseDate')
			};
			self.fileName = $translate.instant("aws.bill.domainResConsumeStatistic") + ".csv";
			self.csvHeader = [$translate.instant("aws.bill.name"), $translate.instant("aws.bill.cost")];

			// $rootScope.billOptions.domainsList = billingSrv.billOptions.domainsList;
			// _.each($rootScope.billOptions.domainsList, item => {
			// 	if (item.id == data.id) {
			// 		self.filterData.domain = item;
			// 	}
			// });
			// billingSrv.domain = self.filterData.domain;
			billingHeaderSrv.getRegionList(self);
			billingHeaderSrv.getDomainList(self);

			self.changeBillFilter = function(data, type) {
				if(type == "region" || data.id == "backRegion") {
					$location.path($location.path()).search({
		                "id": self.filterData.region.id,
		                "type":"region"
		            });
				}else if(type == "domain") {
					self.deptId = data.id!='allDomain'?data.id:null;
					self.query();
				}
			};

			function initConsumeStatisticTable(tableData) {
				self.resOfDepConsumeStatisticTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: tableData
				});
			}

			function getDepProConsumeData() {
				billingSrv.getProConsumeData({
					deptId: self.deptId,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					if (res && res.data) {
						self.proConsumeChart = new PiePanelDefault();
						self.proConsumeChart.panels.pieType = "category";
						self.proConsumeChart.panels.data = [];
						self.proConsumeTotal = 0;
						billingSrv.billOptions.projectsList = [];
						_.each(res.data, function(item) {
							billingSrv.billOptions.projectsList.push({
								name: item.projectName,
								id: item.projectId
							});
							self.proConsumeChart.panels.data.push({
								name: item.projectName=='admin'?'默认项目':item.projectName,
								projectId: item.projectId,
								region: item.region,
								deptId: item.deptId,
								value: item.consumptionAmount
							});
							self.proConsumeTotal += item.consumptionAmount;
						});
						_.map(self.proConsumeChart.panels.data, item => {
							let org_percent = Number(self.proConsumeTotal) == 0 ? 0 : (Number(item.value) / Number(self.proConsumeTotal)) * 100;
							item.percent = org_percent.toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.proConsumeTotal = self.proConsumeTotal.toFixed(2);
					}
				});
			}

			function getDepResConsumeData() {
				billingSrv.getResConsumeData({
					deptId: self.deptId,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					if (res && res.data) {
						self.pro_resConsumeChart = new PiePanelDefault();
						self.pro_resConsumeChart.panels.pieType = "category";
						self.pro_resConsumeChart.panels.data = [];
						self.pro_resConsumeTotal = 0;
						self.csvDownloadData = [];
						res ? self.loadResofDepConsumeTableData = true : false;
						res.data = _.map(res.data, item => {
							self.pro_resConsumeChart.panels.data.push({
								name: item.resourceName,
								value: item.consumptionAmount,
								percent: item.proportion
							});
							item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
							self.pro_resConsumeTotal += Number(item.consumptionAmount);
							item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
							item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
							self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
							return item;
						});
						self.pro_resConsumeChart.panels.data = _.map(self.pro_resConsumeChart.panels.data, item => {
							item.name = $translate.instant("aws.bill." + (item.name).toLowerCase());
							item.percent = (Number(item.percent) * 100).toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.pro_resConsumeTotal = self.pro_resConsumeTotal.toFixed(2);

						initConsumeStatisticTable(res.data);
					}
				});
			}

			//搜索
			self.applyGlobalSearch = function() {
				self.resOfDepConsumeStatisticTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.query = function() {
				self.filterData.searchTerm = "";
				// billingSrv.getResConsumeData({
				// 	deptId: data.id,
				// 	startTime: self.filterData.from,
				// 	endTime: self.filterData.to
				// }).then(function(res) {
				// 	res ? self.loadResofDepConsumeTableData = true : false;
				// 	if (res && res.data) {
				// 		self.csvDownloadData = [];
				// 		res.data = _.map(res.data, item => {
				// 			item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
				// 			item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
				// 			item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
				// 			self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
				// 			return item;
				// 		});
				// 		initConsumeStatisticTable(res.data);
				// 	}
				// });
				getDepProConsumeData();
				getDepResConsumeData();
			};

			if(self.deptId=='allDomain'){
				self.deptId = null;
				self.filterData.domain = {
					name: "所有部门",
					id: "allDomain"
				}
			}
			
			self.query();

			self.refreshConsumeStatisticTable = function() {
				self.filterData = {
					timeStep: "3d",
					from: moment().subtract(3, "d").format("YYYY-MM-DD"),
					to: moment().format("YYYY-MM-DD"),
					searchTerm: "",
					definedTime: false,
					definedTimeText: $translate.instant('aws.bill.chooseDate')
				};
				self.query();
			};

			self.downloadConsumeData = function() {
				return self.csvDownloadData;
			};
		});
	}
]);

billingCtrlModule.controller('proConsumeDetailCtrl', ['$scope', '$translate', '$rootScope', '$location','billingSrv', 'billingHeaderSrv', 'NgTableParams', 'GLOBAL_CONFIG',
	function($scope, $translate, $rootScope, $location, billingSrv, billingHeaderSrv, NgTableParams, GLOBAL_CONFIG) {
		var self = $scope;
		$rootScope.$on("proConsumeDetail", function(e, data) {
			self.regionName = data.regionName;
			self.deptId = data.deptId;
			self.projectId = data.id;
			self.proName = data.name;
			// $rootScope.billOptions.projectsList = billingSrv.billOptions.projectsList;
			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(3, "d").format("YYYY-MM-DD"),
				to: moment().format("YYYY-MM-DD"),
				searchTerm: "",
				definedTime: false,
				definedTimeText: $translate.instant('aws.bill.chooseDate')
			};
			self.fileName = $translate.instant("aws.bill.projectResConsumeStatistic") + ".csv";
			self.csvHeader = [$translate.instant("aws.bill.name"), $translate.instant("aws.bill.cost")];

			// self.filterData.region = billingSrv.region;
			// self.filterData.domain = billingSrv.domain;
			// _.each($rootScope.billOptions.projectsList, item => {
			// 	if (item.id == data.id) {
			// 		self.filterData.project = item;
			// 	}
			// });
			// billingSrv.project = self.filterData.project;
			billingHeaderSrv.getRegionList(self);
			billingHeaderSrv.getDomainList(self);
			billingHeaderSrv.getProjectList(self);

			self.changeBillFilter = function(data, type) {
				if(type == "region" || data.id == "backRegion") {
					$location.path($location.path()).search({
		                "id": self.filterData.region.id,
		                "type":"region"
		            });
				}else if(type == "domain" || data.id == "backDomain") {
					$location.path($location.path()).search({
		                "id": self.filterData.domain.id,
		                "name": self.filterData.domain.name,
		                "regionName": self.filterData.region.id,
		                "type":"dep"
		            });
				}else if(type == "project") {

					self.projectId = data.id;
					if(data.id=='allProject'){
						self.projectId = null;
						// self.filterData.domain = {
						// 	name: "所有部门",
						// 	id: "allDomain"
						// }
					}
					self.query();
				}
			};

			function initConsumeStatisticTable(tableData) {
				self.resOfProConsumeStatisticTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: tableData
				});
			}

			function getProUserConsumeData() {
				billingSrv.getUserConsumeData({
					projectId: self.projectId,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					if (res && res.data) {
						self.usersConsumeChart = new PiePanelDefault();
						self.usersConsumeChart.panels.pieType = "category";
						self.usersConsumeChart.panels.data = [];
						self.users_resConsumeTotal = 0;
						billingSrv.billOptions.usersList = [];
						_.each(res.data, function(item) {
							billingSrv.billOptions.usersList.push({
								name: item.userName,
								consumeUserId: item.userId
							});
							self.usersConsumeChart.panels.data.push({
								name: item.userName,
								userId: item.userId,
								value: item.consumptionAmount
							});
							self.users_resConsumeTotal += item.consumptionAmount;
						});
						_.map(self.usersConsumeChart.panels.data, item => {
							let org_percent = Number(self.users_resConsumeTotal) == 0 ? 0 : (Number(item.value) / Number(self.users_resConsumeTotal)) * 100;
							item.percent = org_percent.toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.users_resConsumeTotal = self.users_resConsumeTotal.toFixed(2);
					}
				});
			}

			function getProResConsumeData() {
				billingSrv.getResConsumeData({
					projectId: self.projectId,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					res ? self.loadResofProConsumeTableData = true : false;
					if (res && res.data) {
						self.users_resConsumeChart = new PiePanelDefault();
						self.users_resConsumeChart.panels.pieType = "category";
						self.users_resConsumeChart.panels.data = [];
						self.users_resConsumeTotal = 0;
						self.csvDownloadData = [];
						res.data = _.map(res.data, item => {
							self.users_resConsumeChart.panels.data.push({
								name: item.resourceName,
								value: item.consumptionAmount,
								percent: item.proportion
							});
							item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
							self.users_resConsumeTotal += Number(item.consumptionAmount);
							item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
							item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
							self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
							return item;
						});
						self.users_resConsumeChart.panels.data = _.map(self.users_resConsumeChart.panels.data, item => {
							item.name = $translate.instant("aws.bill." + (item.name).toLowerCase());
							item.percent = (Number(item.percent) * 100).toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.users_resConsumeTotal = self.users_resConsumeTotal.toFixed(2);

						initConsumeStatisticTable(res.data);
					}
				});
			}

			//搜索
			self.applyGlobalSearch = function() {
				self.resOfProConsumeStatisticTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.query = function() {
				self.filterData.searchTerm = "";
				// billingSrv.getResConsumeData({
				// 	projectId: data.id,
				// 	startTime: self.filterData.from,
				// 	endTime: self.filterData.to
				// }).then(function(res) {
				// 	res ? self.loadResofProConsumeTableData = true : false;
				// 	if (res && res.data) {
				// 		self.csvDownloadData = [];
				// 		res.data = _.map(res.data, item => {
				// 			item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
				// 			item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
				// 			item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
				// 			self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
				// 			return item;
				// 		});
				// 		initConsumeStatisticTable(res.data);
				// 	}
				// });
				getProUserConsumeData();
				getProResConsumeData();
			};

			if(self.projectId=='allProject'){
				self.projectId = null;
				self.filterData.project = {
					name: "所有项目",
					id: "allProject"
				}
			}
			
			self.query();

			self.refreshConsumeStatisticTable = function() {
				self.filterData = {
					timeStep: "3d",
					from: moment().subtract(3, "d").format("YYYY-MM-DD"),
					to: moment().format("YYYY-MM-DD"),
					searchTerm: "",
					definedTime: false,
					definedTimeText: $translate.instant('aws.bill.chooseDate')
				};
				self.query();
			};

			self.downloadConsumeData = function() {
				return self.csvDownloadData;
			};

		});
	}
]);

billingCtrlModule.controller('userConsumeDetailCtrl', ['$scope', '$location', '$translate', '$rootScope', 'billingSrv', 'billingHeaderSrv', 'NgTableParams', 'GLOBAL_CONFIG', '$routeParams',
	function($scope, $location, $translate, $rootScope, billingSrv, billingHeaderSrv, NgTableParams, GLOBAL_CONFIG, $routeParams) {
		var self = $scope;
		$rootScope.$on("userConsumeDetail", function(e, data) {
			self.regionName = data.regionName;
			self.deptId = data.deptId;
			self.projectId = data.projectId;
			self.userName = data.name;
			self.userId = data.id || data.consumeUserId;
			// $rootScope.billOptions.usersList = billingSrv.billOptions.usersList;
			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(3, "d").format("YYYY-MM-DD"),
				to: moment().format("YYYY-MM-DD"),
				searchTerm: "",
				definedTime: false,
				definedTimeText: $translate.instant('aws.bill.chooseDate')
			};
			self.fileName = $translate.instant("aws.bill.userResConsumeStatistic") + ".csv";
			self.csvHeader = [$translate.instant("aws.bill.name"), $translate.instant("aws.bill.cost")];

			// self.filterData.region = billingSrv.region;
			// self.filterData.domain = billingSrv.domain;
			// self.filterData.project = billingSrv.project;
			// _.each($rootScope.billOptions.usersList, item => {
			// 	if (item.consumeUserId == self.userId) {
			// 		self.filterData.user = item;
			// 	}
			// });
			// billingSrv.user = self.filterData.user;
			if(!data.from) {
				billingHeaderSrv.getRegionList(self);
				billingHeaderSrv.getDomainList(self);
				billingHeaderSrv.getProjectList(self);
				billingHeaderSrv.getUserList(self);
			}

			self.changeBillFilter = function(data, type) {
				if(type == "region" || data.id == "backRegion") {
					$location.path($location.path()).search({
		                "id": self.filterData.region.id,
		                "type":"region"
		            });
				}else if(type == "domain" || data.id == "backDomain") {
					$location.path($location.path()).search({
		                "id": self.filterData.domain.id,
		                "name": self.filterData.domain.name,
		                "regionName": self.filterData.region.id,
		                "type":"dep"
		            });
				}else if(type == "project" || data.id == "backProject") {
					// if(data.id == "allProject"){
					// 	self.filterData.domain = {
					// 		name: "所有部门",
					// 		id: "allDomain"
					// 	}
					// }
					$location.path($location.path()).search({
		                "id": self.filterData.project.id,
		                "name": self.filterData.project.name,
		                "regionName": self.filterData.region.id,
		                "deptId": self.filterData.domain.id,
		                "type":"pro"
		            });
				}else if(type == "user") {
					self.userId = data.consumeUserId!='allUser'?data.consumeUserId:null;
					self.query();
				}
			};

			self.$watch(function() {
				return $routeParams;
			}, function(value) {
				if (value && (value.id || value.consumeUserId)) {
					self.currPage = value.type;
				}
			});

			function initConsumeStatisticTable(tableData) {
				self.resOfUserConsumeStatisticTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: tableData
				});
			}

			function getUserResConsumeData() {
				billingSrv.getResConsumeData({
					projectId: $location.search().projectId?$location.search().projectId:null,
					userId: self.userId,
					startTime: self.filterData.from,
					endTime: self.filterData.to
				}).then(function(res) {
					res ? self.loadResofUserConsumeTableData = true : false;
					if (res && res.data) {
						self.user_resConsumeChart = new PiePanelDefault();
						self.user_resConsumeChart.panels.pieType = "category";
						self.user_resConsumeChart.panels.data = [];
						self.user_resConsumeTotal = 0;
						self.csvDownloadData = [];
						// billingSrv.billOptions.resList = [];
						res.data = _.map(res.data, item => {
							// billingSrv.billOptions.resList.push({
							// 	name: $translate.instant("aws.bill." + (item.resourceName).toLowerCase()),
							// 	resName: item.resourceName
							// });
							self.user_resConsumeChart.panels.data.push({
								name: item.resourceName,
								value: item.consumptionAmount,
								percent: item.proportion
							});
							item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
							self.user_resConsumeTotal += Number(item.consumptionAmount);
							item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
							item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
							self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
							return item;
						});
						self.user_resConsumeChart.panels.data = _.map(self.user_resConsumeChart.panels.data, item => {
							item.name = $translate.instant("aws.bill." + (item.name).toLowerCase());
							item.percent = (Number(item.percent) * 100).toFixed(2) + "%";
							item.value = item.value.toFixed(2);
							return item;
						});
						self.user_resConsumeTotal = self.user_resConsumeTotal.toFixed(2);

						initConsumeStatisticTable(res.data);
					}
				});
			}

			//搜索
			self.applyGlobalSearch = function() {
				self.resOfUserConsumeStatisticTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.query = function() {
				self.filterData.searchTerm = "";
				// billingSrv.getResConsumeData({
				// 	userId: self.userId,
				// 	startTime: self.filterData.from,
				// 	endTime: self.filterData.to
				// }).then(function(res) {
				// 	res ? self.loadResofUserConsumeTableData = true : false;
				// 	if (res && res.data) {
				// 		self.csvDownloadData = [];
				// 		res.data = _.map(res.data, item => {
				// 			item.consumptionAmount = item.consumptionAmount ? item.consumptionAmount.toFixed(2) : 0;
				// 			item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
				// 			item.searchTerm = [item._resourceName, $rootScope.miliFormat(item.consumptionAmount)].join("\b");
				// 			self.csvDownloadData.push([item._resourceName, $rootScope.miliFormat(item.consumptionAmount)]);
				// 			return item;
				// 		});
				// 		initConsumeStatisticTable(res.data);
				// 	}
				// });
				getUserResConsumeData();
			};
			if(!self.projectId){
				self.projectId = null;
				self.filterData.project = {
					name: "所有项目",
					id: "allProject"
				}
				self.filterData.user = {
					consumeUserId:$location.search().consumeUserId,
					name : $location.search().name
				}
			}
			self.query();

			self.refreshConsumeStatisticTable = function() {
				self.filterData = {
					timeStep: "3d",
					from: moment().subtract(3, "d").format("YYYY-MM-DD"),
					to: moment().format("YYYY-MM-DD"),
					searchTerm: "",
					definedTime: false,
					definedTimeText: $translate.instant('aws.bill.chooseDate')
				};
				self.query();
			};

			self.downloadConsumeData = function() {
				return self.csvDownloadData;
			};
		});
	}
]);

billingCtrlModule.controller('userResConsumeDetailCtrl', ['$scope', '$routeParams', '$translate', '$rootScope', '$location', 'billingSrv', 'billingHeaderSrv', 'NgTableParams', 'GLOBAL_CONFIG',
	function($scope, $routeParams, $translate, $rootScope, $location, billingSrv, billingHeaderSrv, NgTableParams, GLOBAL_CONFIG) {
		var self = $scope;
		$rootScope.$on("userResConsumeDetail", function(e, data) {
			self.regionName = data.regionName;
			self.deptId = data.deptId;
			self.projectId = data.projectId;
			self.userName = data.name;
			self.userId = data.id || data.consumeUserId;
			self.resName = data.resName;
			self.filterData = {
				timeStep: "3d",
				from: moment().subtract(3, "d").format("YYYY-MM-DD"),
				to: moment().format("YYYY-MM-DD"),
				searchTerm: "",
				definedTime: false,
				definedTimeText: $translate.instant('aws.bill.chooseDate')
			};
			self.fileName = $translate.instant("aws.bill.userResBillDetailExport") + ".csv";
			self.csvHeader = [$translate.instant("aws.bill.productName"), $translate.instant("aws.bill.region"), $translate.instant("aws.bill.domain"), $translate.instant("aws.bill.project"), $translate.instant("aws.price.price_unit_hour"), $translate.instant("aws.bill.moneyAmount"), $translate.instant("aws.bill.billStartTime")];

			// self.filterData.region = billingSrv.region;
			// self.filterData.domain = billingSrv.domain;
			// self.filterData.project = billingSrv.project;
			// self.filterData.user = billingSrv.user;
			// _.each($rootScope.billOptions.resList, item => {
			// 	if (item.resName == data.resName) {
			// 		self.filterData.userRes = item;
			// 	}
			// });
			// billingSrv.userRes = self.filterData.userRes;
			if(!data.from) {
				billingHeaderSrv.getRegionList(self);
				billingHeaderSrv.getDomainList(self);
				billingHeaderSrv.getProjectList(self);
				billingHeaderSrv.getUserList(self);
				billingHeaderSrv.getResList(self);
			}

			self.changeBillFilter = function(data, type) {
				if(type == "region" || data.id == "backRegion") {
					$location.path($location.path()).search({
		                "id": self.filterData.region.id,
		                "type":"region"
		            });
				}else if(type == "domain" || data.id == "backDomain") {
					$location.path($location.path()).search({
		                "id": self.filterData.domain.id,
		                "name": self.filterData.domain.name,
		                "regionName": self.filterData.region.id,
		                "type":"dep"
		            });
				}else if(type == "project" || data.id == "backProject") {
					$location.path($location.path()).search({
		                "id": self.filterData.project.id,
		                "name": self.filterData.project.name,
		                "regionName": self.filterData.region.id,
		                "deptId": self.filterData.domain.id,
		                "type":"pro"
		            });
				}else if(type == "user" || data.id == "allRes") {
					$location.path($location.path()).search({
		                "consumeUserId": self.filterData.user.consumeUserId,
		                "name": self.filterData.project.name,
		                "regionName": self.filterData.region.id,
		                "deptId": self.filterData.domain.id,
		                "projectId": self.filterData.project.id,
		                "type":"user"
		            });
				}else if(type == "userRes") {
					self.resName = data.resName;
					self.query();
				}
			};

			self.$watch(function() {
				return $routeParams;
			}, function(value) {
				if (value && (value.id || value.consumeUserId)) {
					self.currPage = value.type;
				}
			});

			// self.changeBillFilter = function(){
			// 	self.resName = self.filterData.userRes.resName;
			// 	self.query();
			// };

			//搜索
			self.applyGlobalSearch = function() {
				self.resBillDetailTable.filter({
					searchTerm: self.filterData.searchTerm
				});
			};

			self.query = function() {
				self.filterData.searchTerm = "";
				var localSearchData = angular.copy($location.search())
				billingSrv.getResConsumeDataOfUser({
					userId: self.userId,
					deptId:localSearchData.deptId,
					projectId:localSearchData.projectId,
					startTime: self.filterData.from,
					endTime: self.filterData.to,
					resTypeName: self.resName
				}).then(function(res) {
					res ? self.loadResBillDetailTableData = true : false;
					if (res && res.data) {
						self.csvDownloadData = [];
						res.data = _.map(res.data, function(item) {
							item.unitPrice = item.unitPrice ? item.unitPrice.toFixed(2) : 0;
							item.amount = item.amount ? item.amount.toFixed(2) : 0;
							item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
							item.chargeTime = moment(new Date(item.chargeTime)).format("YYYY-MM-DD HH:mm:ss"); //1512994762000 时间戳格式化
							item.searchTerm = [item._resourceName, item.region, item.deptName, item.projectName, $rootScope.miliFormat(item.unitPrice), $rootScope.miliFormat(item.amount), item.chargeTime].join("\b");
							self.csvDownloadData.push([item._resourceName, item.region, item.deptName, item.projectName, $rootScope.miliFormat(item.unitPrice), $rootScope.miliFormat(item.amount), item.chargeTime]);
							return item;
						});
						self.resBillDetailTable = new NgTableParams({
							count: GLOBAL_CONFIG.PAGESIZE
						}, {
							counts: [],
							dataset: res.data
						});
					}
				});
			};
			self.query();

			self.refreshConsumeStatisticTable = function() {
				self.filterData.timeStep = "3d";
				self.filterData.from = moment().subtract(3, "d").format("YYYY-MM-DD");
				self.filterData.to = moment().format("YYYY-MM-DD");
				self.filterData.searchTerm = "";
				self.filterData.definedTime = false;
				self.filterData.definedTimeText = $translate.instant('aws.bill.chooseDate');
				self.query();
			};

			self.downloadConsumeData = function() {
				return self.csvDownloadData;
			};

		});
	}
]);

billingCtrlModule.controller('priceManageCtrl', ['$scope','$routeParams', '$rootScope', '$translate', 'billingSrv', 'NgTableParams', 'GLOBAL_CONFIG', 'checkedSrv', '$uibModal',
	function(self,$routeParams, $rootScope, $translate, billingSrv, NgTableParams, GLOBAL_CONFIG, checkedSrv, $uibModal) {
		if ($rootScope.ADMIN) {
			self.colsList = [{
				value: "order",
				title: $translate.instant("aws.price.serialNumber"),
				show: true,
				disable: true
			}, {
				value: "region",
				title: $translate.instant("aws.price.region"),
				show: true,
				disable: true
			}, {
				value: "productType",
				title: $translate.instant("aws.price.prodType"),
				show: true
			}, {
				value: "unit",
				title: $translate.instant("aws.price.unit"),
				show: true
			}, {
				value: "chargeType",
				title: $translate.instant("aws.price.billingType"),
				show: true
			}, {
				value: "unitPrice",
				title: $translate.instant("aws.price.price_unit"),
				show: true
			}];

			self.options = {
				regionList: [{
					name: $translate.instant("aws.price.allRegion"),
					value: null
				}],
				productTypeList: [{
					name: $translate.instant("aws.price.allType"),
					value: null
				}, {
					name: $translate.instant("aws.bill.cpu"),
					value: "cpu"
				}, {
					name: $translate.instant("aws.bill.memory"),
					value: "memory"
				}, {
					name: $translate.instant("aws.bill.volume"),
					value: "volume"
				}, {
					name: $translate.instant("aws.bill.snapshot"),
					value: "snapshot"
				}, {
					name: $translate.instant("aws.bill.router"),
					value: "router"
				}, {
					name: $translate.instant("aws.bill.floatingip"),
					value: "floatingip"
				}, {
					name: $translate.instant("aws.bill.loadbalancer"),
					value: "loadbalancer"
				}, {
					name: $translate.instant("aws.bill.bandwidth"),
					value: "bandwidth"
				}, {
					name: $translate.instant("aws.bill.pmcpu"),
					value: "pmCpu"
				}, {
					name: $translate.instant("aws.bill.pmmemory"),
					value: "pmMemory"
				}, {
					name: $translate.instant("aws.bill.pmhd"),
					value: "pmVolume"
				}, {
					name: $translate.instant("aws.bill.backupvolume"),
					value: "backupvolume"
				}],
				chargingTypeList: [{
					name: $translate.instant("aws.price.allPriceType"),
					value: null
				}, {
					name: $translate.instant("aws.price.hour"),
					value: "perHour"
				}
				// , {
				// 	name: $translate.instant("aws.price.month"),
				// 	value: "perMonth"
				// }
				],
				unitsList: []
			};

			self.globalSearchTerm = {
				"chargeItemTerm": ""
			};

			self.$watch(function() {
				return $routeParams;
			}, function(value) {
				if (value && (value.id || value.consumeUserId)) {
					self.currPage = value.type;
				}
			});

			function getRegionData() {
				billingSrv.getRegion().then(function(res) {
					if (res && res.data) {
						_.each(res.data, function(item) {
							self.options.regionList.push({
								name: item.regionName,
								value: item.regionName
							});
						})
					}
				});
			}
			getRegionData();

			function queryParamInit() {
				self.queryLimit = {
					// chargingType: self.options.chargingTypeList[0].value,
					// productType: self.options.productTypeList[0].value,
					// region: self.options.regionList[0].value
				};
			}
			queryParamInit();

			self.query = function() {
				self.globalSearchTerm = {
					"chargeItemTerm": ""
				};
				billingSrv.getPriceManageData({
					"region": self.queryLimit.region,
					"resName": self.queryLimit.productType,
					"priceType": self.queryLimit.chargingType
				}).then(function(res) {
					res ? self.loadPriceManageTableData = true : false;
					if (res && res.data) {
						res.data = res.data.map(item => {
							item.unitPrice = item.unitPrice ? item.unitPrice.toFixed(2) : 0;
							item._resourceName = $translate.instant("aws.bill." + (item.resourceName).toLowerCase());
							item._priceType = $translate.instant("aws.bill." + (item.priceType).toLowerCase());
							item._region = item.region == "default" ? item.region : $translate.instant("aws.bill.region." + (item.region).toLowerCase());
							item.searchTerm = [item.id, item.region, item._resourceName, item.unit, item._priceType, $rootScope.miliFormat(item.unitPrice)].join('\b');
							return item;
						});
						self.priceManageTable = new NgTableParams({
							count: GLOBAL_CONFIG.PAGESIZE
						}, {
							counts: [],
							dataset: res.data
						});
						checkedSrv.checkDo(self, "", "id", "priceManageTable");
					}
				});
			}
			self.query();

			self.refreshChargingItem = function() {
				self.globalSearchTerm = {
					"chargeItemTerm": ""
				};
				queryParamInit();
				self.query();
			};


			self.applyGlobalSearch = function(table, term) {
				self[table].filter({
					searchTerm: self.globalSearchTerm[term]
				});
			};

			self.priceManageModal = function(type, editData) {
				let scope = self.$new();
				let priceManageInstance = $uibModal.open({
					animation: true,
					templateUrl: type == "new" ? "createPriceManageModal.html" : "editPriceManageModal.html",
					scope: scope
				});

				switch (type) {
					case 'new':
						scope.modal_title = $translate.instant("aws.action.create");
						scope.addPriceManage = true;
						scope.priceManageForm = {};
						scope.regionList = angular.copy(scope.options.regionList).splice(1, scope.options.regionList.length - 1);
						scope.productTypeList = angular.copy(scope.options.productTypeList).splice(1, scope.options.productTypeList.length - 1);
						scope.changeProductType = function(productType) {
							scope.priceManageForm.unit = "";
							let coreList = ["cpu", "pmCpu"];
							let numlist = ["snapshot", "router", "floatingip", "loadbalancer"];
							let gbList = ["memory", "volume", "pmMemory", "pmVolume", "backupvolume"];
							let mbpsList = ["bandwidth"];
							if (_.include(coreList, productType)) {
								scope.options.unitsList = [{
									name: $translate.instant("aws.bill.core"),
									value: $translate.instant("aws.bill.core"),
								}];
								scope.priceManageForm.unit=scope.options.unitsList[0].value;
							}
							if (_.include(numlist, productType)) {
								scope.options.unitsList = [{
									name: $translate.instant("aws.bill.one"),
									value: $translate.instant("aws.bill.one"),
								}];
								scope.priceManageForm.unit=scope.options.unitsList[0].value;
							}
							if (_.include(gbList, productType)) {
								scope.options.unitsList = [{
									name: "GB",
									value: "GB"
								}];
								scope.priceManageForm.unit=scope.options.unitsList[0].value;
							}
							if (_.include(mbpsList, productType)) {
								scope.options.unitsList = [{
									name: "Mbps",
									value: "Mbps"
								}];
								scope.priceManageForm.unit=scope.options.unitsList[0].value;
							}
						};
						scope.chargingTypeList = angular.copy(scope.options.chargingTypeList).splice(1, scope.options.chargingTypeList.length - 1);
						break;
					case 'edit':
						scope.modal_title = $translate.instant("aws.action.edit");
						scope.addPriceManage = false;
						scope.priceManageForm = angular.copy(editData);
						break;
				}
				priceManageInstance.rendered.then(function() {
					scope.submitted = false;
					scope.interacted = function(field) {
						return scope.submitted || field.$dirty;
					};
					scope.priceManageCfm = function(form, data) {
						if (form.$valid) {
							if (type == "new") {
								let params = {
									"region": data.region,
									"resName": data.productType,
									"unit": data.unit,
									"unitPrice": data.unitPrice,
									"priceType": data.chargingType
								};
								billingSrv.addChargingItem(params).then(function(res) {
									self.query();
								});

							} else {
								billingSrv.editChargingItem({
									"id": editData.id,
									"unitPrice": data.unitPrice
								}).then(function(res) {
									self.query();
								});
							}
							priceManageInstance.close();
						} else {
							scope.submitted = true;
						}
					};
				});
			};

			self.deleteChargingItem = function(checkedItems) {
				var content = {
					target: "delChargingItem",
					msg: "<span>" + $translate.instant("aws.bill.deleteTip") + "</span>",
					data: checkedItems
				};
				self.$emit("delete", content);
			};
			self.$on("delChargingItem", function(e, data) {
				var del_obj_ids = [];
				_.forEach(data, function(item) {
					del_obj_ids.push(item.id);
				});
				billingSrv.deleteChargingItem(
					del_obj_ids
				).then(function() {
					self.query();
				});
			});
		}
	}
]);