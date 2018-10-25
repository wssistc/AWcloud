import  pNetworkSrv from "../services/pNetworkSrv"

export function pNetworkCtrl($scope, $window, $rootScope, $uibModal, NgTableParams, $routeParams, checkedSrv,
	$filter, $timeout, GLOBAL_CONFIG, $translate, pNetworkSrv) {
	var self = $scope;
	if(localStorage.installIronic==1){
		self.pluginSwitch=1;
	}else{
		self.pluginSwitch=2;
		return;
	}
	self.tab={};
	self.createNetwork = function () {
		var modalNetwork = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "creatNetwork.html",
			scope: $scope
		});
		$scope.submitValid = false;
		self.networkForm = {
			name: "",
			networkType: "flat",
			init_cidr: {
				ip_1: "",
				ip_2: "",
				ip_3: "",
				ip_4: "",
				ip_5: ""
			},
			gateway: "",
			shared: true,
			subnetName: "",
			enableDhcp: false,
			dnsNameserver: "",
			hostRoutes: "",
			allocationPools: [{
				start: "",
				end: ""
			}],
		};
		// self.options = [{
		// 	name: "flat",
		// 	id: "01"
		// }]
		// self.phyNetworkOptions = [{
		// 	name: "Tenant",
		// 	id: "01"
		// }]
		$scope.inStep = 1;
		$scope.inStepOneBar = 0;
		$scope.inStepTwoBar = 1;
		$scope.inStepThreeBar = 2;
		$scope.canSetAllocationPools = true;
		$scope.stepTo = function (m, createNetworkForm) {
			/*可能项目没有*/
			if (createNetworkForm) {
				if (createNetworkForm.$valid) {

					if (m == 3) {
						var allocationPools = [];
						if (self.networkForm.addressArea) {
							allocationPools = angular.copy(self.networkForm.allocationPools)
						} else {
							allocationPools = []
						}
						self.ipIsOverlap = chkIpOverlapFunc(allocationPools); //校验IP地址池是否交叉重叠
						self.ipEqToGateway = checkIpInPool(allocationPools, self.networkForm.gateway); //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
						if (!self.ipIsOverlap && !self.ipEqToGateway) {
							$scope.inStep = m
						} else {
							return;
						}
					} else {
						$scope.inStep = m
						$scope.submitValid = false;
					}

				} else {
					$scope.submitValid = true;
					return;
				}

			} else {
				$scope.inStep = m
				$scope.submitValid = false;
			}

		}
		$scope.interacted = function (field) {
			return $scope.submitValid || field.$dirty;
		};


		self.setCidr = function () {
			self.cidrVal = self.networkForm.init_cidr.ip_1 + "." + self.networkForm.init_cidr.ip_2 + "." + self.networkForm.init_cidr.ip_3 + "." + self.networkForm.init_cidr.ip_4 + "/" + self.networkForm.init_cidr.ip_5;
			var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
			reg.test(self.cidrVal) ? self.canSetAllocationPools = false : self.canSetAllocationPools = true;

		};

		self.addEditAddressRangeData = function () {
			self.networkForm.allocationPools.push({
				start: "",
				end: ""
			})
		}
		self.delEditAddressRangeData = function ($index) {
			self.networkForm.allocationPools.splice(
				$index, 1
			)
		}
		self.createNetworkConfirm = function (createNetwork_subnetInfoForm) {
			var postData = {
				"netName": self.networkForm.name,
				"networkType": self.networkForm.networkType,
				"shared": self.networkForm.shared,
				"phyNet": self.networkForm.phyNetwork,
				"external": true,
				"ipVersion": 4,
				"subName": self.networkForm.subnetName,
				"cidr": self.networkForm.init_cidr.ip_1 + "." + self.networkForm.init_cidr.ip_2 + "." + self.networkForm.init_cidr.ip_3 + "." + self.networkForm.init_cidr.ip_4 + "/" + self.networkForm.init_cidr.ip_5,
				"gateway": self.networkForm.gateway == "" ? self.networkForm.init_cidr.ip_1 + "." + self.networkForm.init_cidr.ip_2 + "." + self.networkForm.init_cidr.ip_3 + ".1" : self.networkForm.gateway,
				"enableDhcp": self.networkForm.enableDhcp,
				"dnsNameservers": self.networkForm.dnsNameserver ? self.networkForm.dnsNameserver.split("\n") : [],
				"allocationPools": [],
				"hostRoutes": []
			}
			if (self.networkForm.enableDhcp) {
				postData.hostRoutes = self.networkForm.hostRoutes ? self.networkForm.hostRoutes.split("\n") : [];
			}
			if (self.networkForm.addressArea) {
				self.networkForm.allocationPools.map(function (item) {
					var item_ = item.start + "," + item.end
					postData.allocationPools.push(item_)
				})
			}
			if (createNetwork_subnetInfoForm.$valid) {
				pNetworkSrv.createNetwork(postData).then(function () {
					modalNetwork.close();
					initTable()
				})
			} else {
				return;
			}
		}
	}
	self.editNetwork = function(data){
		var modaleditwork = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: "editNetworkModal.html",
			scope: $scope
		});
		console.log(data.id);
		var id = data.id ;
		self.editsubmitValid = false;
		self.editnetworkForm = {
			netName:data.name,
			shared:data.shared
		}
		self.editNetConfirm = function(editNetworkForm){
			
			if(editNetworkForm.$valid){
				pNetworkSrv.editNetworks(id,self.editnetworkForm).then(function(){
					modaleditwork.close();
					initTable()
				})
			}else{
				self.editsubmitValid = true;
				return ;
			}
		}
	}
	
	var checkIpInPool = function (allocationPools, ip) { //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
		let ipInPool = false;
		let poolsObj = getIpPoolsZone(allocationPools);
		for (let key in poolsObj) {
			if (_IP.toLong(ip) >= poolsObj[key][0] && _IP.toLong(ip) <= poolsObj[key][1]) {
				ipInPool = true;
				break;
			}
		}
		return ipInPool;
	};

	var chkIpOverlapFunc = function (allocationPools) { //校验IP地址池是否交叉重叠
		let poolsObj = getIpPoolsZone(allocationPools);
		let intersection = [];
		for (let key in poolsObj) {
			intersection = intersection.concat(poolsObj[key]);
		}
		if (!_.isEqual(intersection, _.uniq(_.sortBy(intersection)))) {
            return true;
        }
		return false;
	};
	var getIpPoolsZone = function (allocationPools) {
		let pools = {};
		_.each(allocationPools, function (item, i) {
			pools[i] = [_IP.toLong(item.start), _IP.toLong(item.end)];
		});
		return pools; //返回所有IP池的IP范围
	};
	self.refreshNetworkTable = function () {
		
		initTable();
	}
	self.delNetworks = function () {
		var content = {
			target: "delNetwork",
			msg: "<span>是否删除选中内容</span>"
		};
		self.$emit("delete", content);

	}
	self.$on("delNetwork", function () {
		var ids = [];
		var names = [];
		self.checkedItems.map(function (item) {
			ids.push(item.id);
			names.push(item.name);
		})
		pNetworkSrv.delNetworks(ids, names).then(function () {
			initTable();
		})
	});


	function removeByValue(arr, val) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == val) {
				arr.splice(i, 1);
				break;
			}
		}
	}

	initTable();

	function initTable() {
		pNetworkSrv.getNetworks().then(function (data) {
			self.globalSearchTerm = "";
			if (data && data.data && data.data.length>=0) {
				data ? self.loadData = true : "";
				self.networkTableData = data.data;
				self.networkTableData.map(function (item) {
					item.status = item.status.toUpperCase()
					if (item.status.toUpperCase() == "ACTIVE") {
						item.state = $translate.instant("aws.networks.run");
					} else {
						item.state = $translate.instant("aws.networks.stop");
					}
					item._shared = item.shared == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
					item._external = item.external == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
					item._network_type = (item.provider.network_type).toUpperCase();
					item._subnets = "";
					if (item.subnets[0]) {
						_.each(item.subnets, function (value) {
							item._subnets += value.name + value.cidr;
						})
					}
					item.searchTerm = [item.name, item._subnets, item.state].join("\b");
					// + item._shared + item._external + item._network_type

				})
				self.tableParams = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: self.networkTableData
				});

				checkedSrv.checkDo(self, "", "id", "tableParams");
				self.applyGlobalSearch = function () {
					var term = self.globalSearchTerm;
					self.tableParams.filter({
						searchTerm: term
					});
				};
			}
		});
	}



	self.$on("getDetail", function (event, networkId) {
		self.networkId = networkId;
		initDetailView();
		self.portInfoTable = new NgTableParams({
			count: GLOBAL_CONFIG.PAGESIZE
		}, {
			counts: [],
			dataset: self.portInfoData
		});
		self.choseTab = function (type) {
			self.networkType = type;
			if (type == 'baseInfo') {
                self.tab.isShow=0;
				initBaseInfoTab();
			}
			if (type == 'portInfo') {
				self.tab.isShow=1;
				initPortInfoTab();
			}
			if (type == 'subnetManage') {
				self.tab.isShow=2;
				initSubnetInfoTab();
			}
		};
		self.choseTab('baseInfo');
	});
	//初始化详情页  基础信息列表
	function initBaseInfoTab() {
		pNetworkSrv.getNetworkDetail(self.networkId).then(function (data) {
			if (data && data.data) {
				self.baseInfo = {
					name: data.data.name,
					shared: data.data.shared ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no"),
					networkType: data.data["provider:network_type"].toUpperCase(),
					physical_network: data.data["provider:physical_network"]
				}
			}

		})
	}
	//初始化详情页  端口信息列表
	function initPortInfoTab() {

		pNetworkSrv.getPortInfo(self.networkId).then(function (data) {
			data ? self.portData = true : "";

			if (data) {
				if (data.data == null) {
					data.data = []
				}
				self.portInfoData = data.data;
				self.portInfoData.map(function (item) {
					item._status = item.status.toUpperCase() == "ACTIVE" ? $translate.instant("aws.common.active") : $translate.instant("aws.common.down");
					item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
				})
				self.portInfoTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: self.portInfoData
				});

			}

		})

	}
	//因为初始化子网列表控制器内 会多次触发
	self.$on("delSubnets", function () {
			var ids = [];
			var names = [];
			var delData = self.subnetTable.checkedItems;
			delData.map(function (item) {
				ids.push(item.id);
				names.push(item.name);
			})
			pNetworkSrv.delSubnets(ids, names).then(function () {
				 initSubnetInfoTab();
				 initTable();
			})
		});
	//初始化详情页  子网管理列表
	
	function initSubnetInfoTab() {
		console.log("子网信息列表");
		self.subnetCheckboxes = {
			checked: false,
			items: {}
		};
		self.canEdit = false;
		self.candel = false;
		self.titleName="pNetworkSubnet";
		if(sessionStorage["pNetworkSubnet"]){
			self.titleData=JSON.parse(sessionStorage["pNetworkSubnet"]);
		}else{
			self.titleData=[
				{name:'networks.subnetName',value:true,disable:true,search:"name"},
				{name:'networks.subnetCidr',value:true,disable:false,search:"cidr"},
				{name:'networks.gateway',value:true,disable:false,search:"gateway_ip"},
				{name:'networks.address_range',value:true,disable:false,search:"allocation_pools"},
				{name:'networks.IPvision',value:true,disable:false,search:"ip_version"},
				{name:'networks.enableDhcp',value:true,disable:false,search:"_enable_dhcp"},
				{name:'networks.hostRoutes',value:true,disable:false,search:"host_routes"},
				{name:'networks.dnsNameserver',value:true,disable:false,search:"dns_nameservers"},
			];
		}
	
		pNetworkSrv.getNetworkDetail(self.networkId).then(function (data) {
			
			data ? self.subnetData = true : "";
			if (data && data.data) {
				self.subNetTableData = data.data.neutronSubnets;
				
				self.subNetTableData.map(function (item) {
					item._enable_dhcp = item.enable_dhcp ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
					item.allocationPoors = "";
					if (item.allocation_pools[0]) {
						_.each(item.allocation_pools, function (value) {
							item.allocationPoors += value.start + "," + value.end + ",";
						})
					}
					item.hostRoutes = "";
					item.DNS = item.dns_nameservers.toString();
					item.searchTerm = [item.name, item.cidr, item.gateway_ip, item.allocationPoors,item.ip_version,item._enable_dhcp,item.hostRoutes,item.DNS].join("\b") //+ item._enable_dhcp + item._network_type;


				})
				networkSearchTearm({tableData:self.subNetTableData,titleData:self.titleData});
				self.subnetTable = new NgTableParams({
					count: GLOBAL_CONFIG.PAGESIZE
				}, {
					counts: [],
					dataset: self.subNetTableData
				});
				//checkedSrv.checkDo(self, "", "id", "subnetTable");
				self.applyGlobalSearch_ = function (globalSearchTerm_) {
					var term = globalSearchTerm_;
					self.globalSearchTerm_ = globalSearchTerm_;
					self.subnetTable.filter({
						searchTerm: term
					});
				};
				self.$watch(function () {
					return self["subnetTable"].page();
				}, function () {
					self.subnetCheckboxes.checked = false;
					self.subnetCheckboxes.items = {};
				});
				self.$watch(function () {
					return self["subnetTable"].data.length;
				}, function (cur, old) {
					if (cur != old && cur == 0) {
						self["subnetTable"].page(1);
					}
				});
				self.$watch(function () {
					return self.subnetCheckboxes.checked;
				}, function (value) {
					if (!angular.isUndefined(value)) {
						angular.forEach(self["subnetTable"].data, function (item) {
							if (!item.unChecked) {
								self.subnetCheckboxes.items[item["id"]] = value;
							}
						});
					}

				});
				self.$watch(function () {
					return self.subnetCheckboxes.items;
				}, function (values) {
					if (values && JSON.stringify(values) != "{}") {
						if (self["subnetTable"].data && self["subnetTable"].data.length) {
							chkDo(values);
						}
					} else {
						// self.isDisabled = true;
						// self.delisDisabled = true;
					}
				}, true);
				var chkDo = function () {
					var checked = 0,
						unchecked = 0,
						total = self["subnetTable"].data.length;
					self["subnetTable"].checkedItems = [];
					angular.forEach(self["subnetTable"].data, function (item) {
						checked += (self.subnetCheckboxes.items[item["id"]]) || 0;
						unchecked += (!self.subnetCheckboxes.items[item["id"]]) || 0;
						if (self.subnetCheckboxes.items[item["id"]]) {
							self.editData = angular.copy(item);
							self["subnetTable"].checkedItems.push(item);
						}
					});

					if ((unchecked == 0) || (checked == 0)) {
						if (total > 0) {
							self.subnetCheckboxes.checked = (checked == total);
						}
					}
					if (checked === 0) {
						self.canEdit = false;
						self.candel = false;
					} else if (checked === 1) {
						self.canEdit = true;
						self.candel = true;
					} else {
						self.canEdit = false;
						self.candel = true;
					}
					angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
				};
				
				// self.$watch(function () {
				// 	return self.titleData;
				// }, function (values) {
				// 	var data = angular.copy(self.subNetTableData)
				// 	if (values) {
				// 		data.map(function (item) {
				// 			item.searchTerm = [];
				// 			// for (var obj in values) {
				// 			// 	if (values[obj].value) {
				// 			// 		item.searchTerm.push(item[obj.search]);

				// 			// 	} else {
				// 			// 		removeByValue(item.searchTerm, item[obj]);
				// 			// 	}
				// 			// }
				// 			values.map(function(obj){
				// 				if(obj.value){
				// 					item.searchTerm.push(item[obj.search]);
				// 				}
				// 			})
				// 			item.searchTerm = item.searchTerm.join(",");
				// 			sessionStorage.setItem("phySubnetCtrl",JSON.stringify(self.showSubnetInfoCtrl));
				// 		})
				// 	self.subnetTable.data = data
				// 	console.log(self.subnetTable.data)
				// 	}
				// }, true)
			}
		})
		self.createSubnet = function () {
			var modalSubnet = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: "createSubnet.html",
				scope: self
			});
			self.submitted = false;
			self.subnetForm = {
				name: "",
				networkType: "",
				init_cidr: {
					ip_1: "",
					ip_2: "",
					ip_3: "",
					ip_4: "",
					ip_5: ""
				},
				gateway: "",
				shared: false,
				subnetName: "",
				enableDhcp: false,
				dnsNameserver: "",
				hostRoutes: "",
				allocationPools: [{
					start: "",
					end: ""
				}],
			}
			self.interacted = function (field) {
				return self.submitted || field.$dirty;
			};
			self.canSetAllocationPools = true;
			self.setCidr_ = function () {
				self.cidrVal = self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5;
				var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
				reg.test(self.cidrVal) ? self.canSetAllocationPools = false : self.canSetAllocationPools = true;
			}
			self.addEditAddressRangeData = function () {
				self.subnetForm.allocationPools.push({
					start: "",
					end: ""
				})
			}
			self.delEditAddressRangeData = function ($index) {
				self.subnetForm.allocationPools.splice(
					$index, 1
				)
			}
			self.createSubnetCfm = function (createSubnetForm) {
				if (createSubnetForm.$valid) {
					var allocationPools = [];
					if (self.subnetForm.addressArea) {
						allocationPools = angular.copy(self.subnetForm.allocationPools)
					} else {
						allocationPools = []
					}
					self.subnet_ipIsOverlap = chkIpOverlapFunc(allocationPools); //校验IP地址池是否交叉重叠
					self.subnet_ipEqToGateway = checkIpInPool(allocationPools, self.subnetForm.gateway); //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
					if (!self.subnet_ipIsOverlap && !self.subnet_ipEqToGateway) {
						var postData = {
							"networkId": self.networkId,
							"ipVersion": 4,
							"subName": self.subnetForm.name,
							"cidr": self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5,
							"gateway": self.subnetForm.gateway == "" ? self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + ".1" : self.subnetForm.gateway,
							"enableDhcp": self.subnetForm.enableDhcp,
							"dnsNameservers": self.subnetForm.dnsNameserver ? self.subnetForm.dnsNameserver.split("\n") : [],
							"allocationPools": [],
							"hostRoutes": []
						}
						if (self.subnetForm.enableDhcp) {
							postData.hostRoutes = self.subnetForm.hostRoutes ? self.subnetForm.hostRoutes.split("\n") : [];
						}
						if (self.subnetForm.addressArea) {
							self.subnetForm.allocationPools.map(function (item) {
								var item_ = item.start + "," + item.end
								postData.allocationPools.push(item_)
							})
						}
						pNetworkSrv.createSubnet(postData).then(function () {
							initSubnetInfoTab();
							initTable();
							modalSubnet.close()
						})
					}
				} else {
					self.submitted = true;
					return;
				}
			}
		}
		self.delSubnet = function () {
			var contents = {
				target: "delSubnets",
				msg: "<span>是否删除选中内容</span>"
			};
			self.$emit("delete", contents);
		}
		
		self.refreshSubnetTable = function () {
			self.globalSearchTerm_ ="";
			initSubnetInfoTab();
		}
		function networkSearchTearm(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
               item.searchTerm="";
               titleData.forEach(function(showTitle){
                     if(showTitle.value){
                        if(showTitle.search=='subnets'){
                           item.subnets.forEach(function(subnet){
                              item.searchTerm+=subnet.cidr; 
                           });
                        }else{
                           item.searchTerm+=item[showTitle.search];
						}
						
					 }
               });
            });
		}
		self.networkSearchTearm = networkSearchTearm;
		self.editSubnet = function () {
			var modalEditSubnet = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: "editSubnet.html",
				scope: self
			});
			self.submitted_ = false;
			self.editsubnet_ipIsOverlap = false;
			var editData = angular.copy(self.subnetTable.checkedItems[0]);
			var id = editData.id ;
			self.cidrVal = angular.copy(self.subnetTable.checkedItems[0].cidr);
			//后排Ip池 返回重新排序一次 _IP.toLong
			var allocation_pools_sort = editData.allocation_pools;
			allocation_pools_sort.sort(function(a,b){
				return _IP.toLong(a.start)- _IP.toLong(b.start)
			})
			self.editSubnetData = {                                                                                                                                                                                                               
				allocationPools:allocation_pools_sort,
				name:editData.name,
				cidr:editData.cidr,

			}
			self.interacted = function (field) {
				return self.submitted_ || field.$dirty;
			};
		

			self.addEditAddressRangeData = function () {
				self.editSubnetData.allocationPools.push({
					start: "",
					end: ""
				})
			}
			self.delEditAddressRangeData = function ($index) {
				self.editSubnetData.allocationPools.splice(
					$index, 1
				)
			}
			self.editSubnetCfm = function(editSubnetForm){
				var postData = {
					allocation_pools:self.editSubnetData.allocationPools,
					name:self.editSubnetData.name,
					cidr:self.editSubnetData.cidr,
				}
				
				if (editSubnetForm.$valid){
					self.editsubnet_ipIsOverlap = chkIpOverlapFunc(postData.allocation_pools); //校验IP地址池是否交叉重叠
					if(!self.editsubnet_ipIsOverlap){
						pNetworkSrv.editSubnet(postData,id).then(function(){
							modalEditSubnet.close();
							initSubnetInfoTab();
							initTable();
						})
					}
				}else{
					self.submitted_ = true;
					return ;
				}
			}
	
		}

	}

	function initDetailView() {

		initPortInfoTab()
		initSubnetInfoTab()
		initBaseInfoTab()
	}


}


let ctrlList = [pNetworkCtrl];
angular.forEach(ctrlList, function (item) {
	item.$inject = ["$scope", "$window", "$rootScope", "$uibModal", "NgTableParams", "$routeParams",
		"checkedSrv", "$filter", "$timeout", "GLOBAL_CONFIG", "$translate", "pNetworkSrv"
	];
});
