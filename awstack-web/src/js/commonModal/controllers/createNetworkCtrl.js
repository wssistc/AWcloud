createNetworkCtrl.$inject = ["$scope", "$rootScope","$location", "networksSrv","singleway", "checkQuotaSrv", "$uibModalInstance", "$translate", "bandWidthSrv", "$timeout", "ipSrv"];
export function createNetworkCtrl($scope, $rootScope,$location, networksSrv,singleway, checkQuotaSrv, $uibModalInstance, $translate, bandWidthSrv, $timeout, ipSrv) {
	var self = $scope;
	self.singlePassageway = singleway;
	self.domainproject = {};
	self.firstLoginCopy = true;
	self.inStepZero = false;
	self.inStepOne = true;
	self.inStepTwo = false;
	self.inStepThree = false;
	self.inStepOneBar = true;
	self.networkSubmitInValid = false;
	self.subnetSubmitInValid = false;
	self.subDetailSubmitInValid = false;
	self.startRangeInCidr=true;
	self.endRangeInCidr=true;
	self.showPrice = $rootScope.billingActive;
	//vlanId的初始化错误提示信息
	self.vlanIdOverRangeMsg = $translate.instant("aws.physicalNetworks.vlanIdInteger");
	//验证子网和网络的配额
	
	if(singleway){
		self.$watch(function(){
			return self.domainproject
		},function(res){
			if(JSON.stringify(res)!='{}'&&
				res.deparList.length>0&&
				res.depart.selected.domainUid
				){
				var domainUid = res.depart.selected.domainUid;
				var projectUid = res.pro.selected.projectId;
				checkQuotaSrv.checkQuota(self, "network",domainUid,projectUid);
				checkQuotaSrv.checkQuota(self, "subnet",domainUid,projectUid);	
			}
		},true)
	}else{
		checkQuotaSrv.checkQuota(self, "network");
		checkQuotaSrv.checkQuota(self, "subnet");
	}

	self.interactedNetwork = function(field) {
		if (field) {
			return self.networkSubmitInValid || field.$dirty;
		}
	}
	self.interactedSubnet = function(field) {
		if (field) {
			return self.subnetSubmitInValid || field.$dirty;
		}
	}

	self.interactedSubDetail = function(field) {
		if (field) {
			return self.subDetailSubmitInValid || field.$dirty;
		}
	}

	function stepsStatus(one, two, three, oneBar, twoBar, threeBar) {
		self.inStepOne = one;
		self.inStepTwo = two;
		self.inStepThree = three;
		self.inStepOneBar = oneBar;
		self.inStepTwoBar = twoBar;
		self.inStepThreeBar = threeBar;
		self.inStepZero = false;
	}

	function getPrice(netBandValue) {
		if (!$rootScope.billingActive) {
			return;
		}
		var postData = {
			"region": localStorage.regionName ? localStorage.regionName : "default",
			"bandwidthSize": netBandValue
		}
		networksSrv.getPrice(postData).then(function(data) {
			if (data && !isNaN(data.data)) {
				self.showPrice = true;
				self.price = data.data;
				self.priceFix = self.price.toFixed(2)
				self.totalPrice = (self.price * 30 * 24).toFixed(2)
			} else {
				self.showPrice = true;
				self.price = "N/A";
				self.priceFix = "N/A";
				self.totalPrice = "N/A"

			}

		})
	}
	//cidr的验证
	self.setCidr = function() {
		self.cidrVal = self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5;
		var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
		reg.test(self.cidrVal) ? self.canSetAllocationPools = false : self.canSetAllocationPools = true;
		if (!self.canSetAllocationPools) {
			self.networkAddress = _IP.cidrSubnet(self.cidrVal).networkAddress;
			self.broadcastAddress = _IP.cidrSubnet(self.cidrVal).broadcastAddress;
		}
	};

	self.setIpIsOverlap = function() {
		self.ipIsOverlap = false;
		self.ipEqToGateway = false;
		self.ipNotInSubCidr = false;
		self.startIpgtEndIp = false;

	};

	//判断是否是admin
	switch (localStorage.managementRole) {
		case "2":
			self.isSuperAdmin = true; //是否是超级管理员
			break;
		default:
			self.isSuperAdmin = false; //是否是超级管理员
	}

	self.limitData = {
		limitType: {
			fixType: {}
		}
	};
    
    //input框改变带宽的值
    self.changeBindWidth=function(value){
        var bindBar=$("#bindBar").data("ionRangeSlider");
        bindBar.update({
		    min: 1,
			max: 10000,
			type: 'single',//设置类型
			from:value,
			step: 1,
			prefix: "",//设置数值前缀
			postfix: "Mbps",//设置数值后缀
			prettify: true,
			hasGrid: true,
			grid:true,
		});
    };

	//带宽相关数据
	bandWidthSrv.getLimitData().then(function(res) {
		if (res && res.data && res.data.length != 0) {
			self.limitData = JSON.parse(res.data[0].paramValue);
            if(self.limitData.limitActive && self.limitData.typeActive == '1' ){
            	self.$watch(function() {
					return self.networkForm.netBandValue;
				}, function(netBandValue) {
					if (netBandValue) {
						getPrice(netBandValue);
					}
				});
            }
			//带宽初始化
			$timeout(function(){
				if(self.isSuperAdmin){
                    self.networkForm.netBandValue = self.limitData.limitType.fixType.networkBandwidth;
			        $("#bindBar").ionRangeSlider({
						min: 1,
						max: 10000,
						type: 'single',//设置类型
						from:self.networkForm.netBandValue,
						step: 1,
						prefix: "",//设置数值前缀
						postfix: "Mbps",//设置数值后缀
						prettify: true,
						hasGrid: true,
						grid:true,
						onChange:function(data){
							self.networkForm.netBandValue=data.from;
							self.$apply();
						}
					});
				}else if(!self.isSuperAdmin){
                    self.networkForm.netBandValue = self.limitData.limitType.fixType.networkBandwidth;
				}
			},100);
		}
	});

	//network init
	self.networkForm = {
		name: "",
		selectedNetType: "",
		//物理网络
		selectedPhysicalNet: "",
		external: false,
		shared: false
	};
	//subnet init 
	self.getIPv6TypeList=[
	    {
	    	name:"slaac",
	    	value:"slaac"
	    },
	    {
	    	name:"dhcpv6-stateful",
	    	value:"dhcpv6-stateful"
	    },
	    {
	    	name:"dhcpv6-stateless",
	    	value:"dhcpv6-stateless"
	    }
	];
	self.subnetForm = {
		name: "",
		init_cidr: {
			ip_1: "",
			ip_2: "",
			ip_3: "",
			ip_4: "",
			ip_5: ""
		},
		gateway: "",
		enableDhcp: true,
		enableGateway: true, //默认启用网关
		dnsNameserver: "",
		hostRoutes: "",
		allocationPools: [{
			start: "",
			end: ""
		}],
		//ipv6相关参数
		enableIPv6:false,
		IPv6_cidr:{
			ip_1: "",
			ip_2: "",
			ip_3: "",
			ip_4: "",
			ip_5: "",
			ip_6: "",
			ip_7: "",
			ip_8: "",
			ip_9: ""
		},
		ipv6_address_mode:self.getIPv6TypeList[0],
		IPv6AddressArea:false,
        IPv6allocationPools: [{
			start:{
				ip_1: "",
				ip_2: "",
				ip_3: "",
				ip_4: "",
				ip_5: "",
				ip_6: "",
				ip_7: "",
				ip_8: "",
			},
			end:{
				ip_1: "",
				ip_2: "",
				ip_3: "",
				ip_4: "",
				ip_5: "",
				ip_6: "",
				ip_7: "",
				ip_8: "",
			},
		}],
	};

	//第一步初始化
	//self.networkForm.netBandValue = 0;

	self.addAllocationPools = function() {
		self.subnetForm.allocationPools.push({
			start: "",
			end: ""
		})
		self.setIpIsOverlap()
	}

	self.delAllocationPools = function(index, allocationPools) {
		self.subnetForm.allocationPools.splice(index, 1)
		self.setIpIsOverlap()
	}

	self.getVlanIdRange = function(selectedPhysicalNet) {
		if (selectedPhysicalNet) {
			//每个物理网络中vlanid的范围
			let selectPhyNetName = selectedPhysicalNet.networkName.split(":")[0];
			self.min_num = Number(selectedPhysicalNet.networkName.split(":")[1]);
			self.max_num = Number(selectedPhysicalNet.networkName.split(":")[2]);
			self.existedVlanIds = [];
			//获取所有被使用得vlanid
			networksSrv.getUsedVlan().then(function(res) {
				if (res && res.data) {
					let resData = JSON.parse(res.data);
					if (resData.segment_vlan_availabilities && resData.segment_vlan_availabilities[0] && resData.segment_vlan_availabilities[0].vlan_id_used) {
						self.allExistedVlanIds = resData.segment_vlan_availabilities;
						//每个物理网络中被占用的vlanid
						self.allExistedVlanIds.forEach(function(item) {
							if (item && item.vlan_id_used && item.physical_network == selectPhyNetName) {
								self.existedVlanIds = item.vlan_id_used;
							}
						});
					}
				}
			});
			self.vlanIdOverRangeMsg = $translate.instant("aws.errors.toInput") + self.min_num + "~" + self.max_num + $translate.instant("aws.errors.toNum");
		} else {
			self.vlanIdOverRangeMsg = $translate.instant("aws.physicalNetworks.vlanIdInteger");
		}
	}

	//ipv6相关的逻辑
	self.isAllocateV6Pool = function() {
        let cidr_1=(self.subnetForm.IPv6_cidr.ip_1+"")?(self.subnetForm.IPv6_cidr.ip_1+":"):"";
        let cidr_2=(self.subnetForm.IPv6_cidr.ip_2+"")?(self.subnetForm.IPv6_cidr.ip_2+":"):"";
        let cidr_3=(self.subnetForm.IPv6_cidr.ip_3+"")?(self.subnetForm.IPv6_cidr.ip_3+":"):"";
        let cidr_4=(self.subnetForm.IPv6_cidr.ip_4+"")?(self.subnetForm.IPv6_cidr.ip_4+":"):"";
        let cidr_5=(self.subnetForm.IPv6_cidr.ip_5+"")?(self.subnetForm.IPv6_cidr.ip_5+":"):"";
        let cidr_6=(self.subnetForm.IPv6_cidr.ip_6+"")?(self.subnetForm.IPv6_cidr.ip_6+":"):"";
        let cidr_7=(self.subnetForm.IPv6_cidr.ip_7+"")?(self.subnetForm.IPv6_cidr.ip_7+":"):"";
        let cidr_8=(self.subnetForm.IPv6_cidr.ip_8+"")?(self.subnetForm.IPv6_cidr.ip_8):"";
        self.IPv6Val=cidr_1+cidr_2+cidr_3+cidr_4+cidr_5+cidr_6+cidr_7+cidr_8;
        var reg=/^(([1-9])|([1-9][0-9])|(1[0-1][0-9])|(12[0-8]))$/;
        if(_IPAddr.isValid(self.IPv6Val)&&self.subnetForm.IPv6_cidr.ip_9&&reg.test(self.subnetForm.IPv6_cidr.ip_9)){
            self.canSetV6AllocationPools = true;
        }else{
            if(self.subnetForm.IPv6AddressArea){
               self.canSetV6AllocationPools = true;
            }else{
               self.canSetV6AllocationPools = false;
            }
        }
    };
	//初始化需要判断一次
	self.isAllocateV6Pool();

	self.changeIpv6Type=function(mode){
        if(mode.value=='slaac'||mode.value=='dhcpv6-stateless'){
           self.subnetForm.IPv6_cidr.ip_9=64;
           self.disabledV6CidrMask=true;
        }else{
           self.disabledV6CidrMask=false;
           self.subnetForm.IPv6_cidr.ip_9="";
        }
        self.isAllocateV6Pool();
	};
	self.changeIpv6Type(self.getIPv6TypeList[0]);

	//获取物理网络列表
	self.phyNetworks = {
		options: []
	}
	//网络类型(根据API返回安装部署时选择的网络类型)
	networksSrv.getNetType(localStorage.enterpriseUid, localStorage.regionKey).then(function(res) {
		if (res && res.data) {
			self.netTypes = {
				options: [res.data.type],
				selected: res.data.type
			};
			self.networkForm.selectedNetType = self.netTypes.selected;
			if (self.networkForm.selectedNetType == 'vxlan') {
				self.vxlan_min_num = Number(res.data.start);
				self.vxlan_max_num = Number(res.data.end);
			}
			//vlan才有对应显示的物理网络
			if (self.networkForm.selectedNetType == 'vlan') {
				networksSrv.getAvailablePhyNets(localStorage.enterpriseUid, localStorage.regionKey).then(function(result) {
					if (result && angular.isArray(result.data) && result.data.length) {
						result.data.forEach(function(item) {
							let index = item.networkName.lastIndexOf(":");
							item.showName = item.networkName.slice(0, index) + "-" + item.networkName.slice(index + 1);
							self.phyNetworks.options.push(item);
						})
						self.networkForm.selectedPhysicalNet = self.phyNetworks.options[0];
						//根据初始选择的物理网络初始化vlanId的范围
						self.getVlanIdRange(self.networkForm.selectedPhysicalNet);
					}
				});
			}
		}
	});

	//一到二
	self.stepToTwo = function(createNetworkForm) {
			if (createNetworkForm.$valid) {
				stepsStatus(false, true, false, true, true, false)
				//子网中cidr的验证
				self.setCidr()
			} else {
				self.networkSubmitInValid = true;
			}
		}
		//二到一
	self.stepToOne = function() {
		stepsStatus(true, false, false, true, false, false)
	}
	self.stepToThree = function(createSubnetForm) {
			if (createSubnetForm.$valid) {
				self.postData = {
					"netName": self.networkForm.name,
					"shared": self.networkForm.shared,
					"external": false,
					"subName": self.subnetForm.name,
					"ipVersion": 4,
					"cidr": self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5,
					"gateway": self.subnetForm.enableGateway ? (self.subnetForm.gateway ? self.subnetForm.gateway : "") : null,
					"enableDhcp": self.subnetForm.enableDhcp,
					"dnsNameservers": [],
					"allocationPools": [],
					"hostRoutes": [],
					"admin": self.isSuperAdmin
				};
				if (self.networkForm.selectedNetType == 'vlan') {
					self.postData.phyNetworkName = self.networkForm.selectedPhysicalNet.networkName.split(":")[0];
				}
				//admin和非admin都要传(界面不显示)
				self.postData.networkType = self.networkForm.selectedNetType;
				if (self.isSuperAdmin) {
					//vlanid/vxlanid
					self.postData.segmentId = self.networkForm.segment_id;
				}
				if (self.limitData && self.limitData.limitActive && self.limitData.typeActive == '1') {
					self.postData.tags = "qos_limit:" + Number(self.networkForm.netBandValue) * 128;
				}
				var allocationPools = [];
				//可用地址范围
				if (self.subnetForm.addressArea) {
					self.subnetForm.allocationPools.map(item => {
						self.postData.allocationPools.push(item.start + "," + item.end)
					})
					allocationPools = angular.copy(self.subnetForm.allocationPools)
				} else {
					allocationPools = []
				}
				//ipv6参数组合
				if(self.subnetForm.enableIPv6){
                   self.postData.ipv6SubName=self.subnetForm.name+"_ipv6";
                   self.postData.ipv6AddressMode=self.subnetForm.ipv6_address_mode.value;
				   self.postData.ipv6RaMode=self.subnetForm.ipv6_address_mode.value;
				   self.postData.ipv6Cidr=self.subnetForm.IPv6_cidr.ip_1 + ":" + self.subnetForm.IPv6_cidr.ip_2 + ":" + self.subnetForm.IPv6_cidr.ip_3 + ":" + self.subnetForm.IPv6_cidr.ip_4 + ":" + self.subnetForm.IPv6_cidr.ip_5+ ":" + self.subnetForm.IPv6_cidr.ip_6+ ":" + self.subnetForm.IPv6_cidr.ip_7+ ":" + self.subnetForm.IPv6_cidr.ip_8+"/"+self.subnetForm.IPv6_cidr.ip_9;
				   self.postData.ipv6AllocationPools=[];
				   if(self.subnetForm.IPv6AddressArea){
					   self.subnetForm.IPv6allocationPools.map(function(item){
	                       let startV6Ip=item.start.ip_1+":" + item.start.ip_2+":" + item.start.ip_3+":" + item.start.ip_4+":" + item.start.ip_5+":" + item.start.ip_6+":" + item.start.ip_7+":" + item.start.ip_8;
	                       let endV6Ip=item.end.ip_1+":" + item.end.ip_2+":" + item.end.ip_3+":" + item.end.ip_4+":" + item.end.ip_5+":" + item.end.ip_6+":" + item.end.ip_7+":" + item.end.ip_8;
					       self.postData.ipv6AllocationPools.push(startV6Ip + "," +endV6Ip);
					   });
					   //选择了ipv6地址范围需要进行校验（地址范围是否在cidr里面）
                       self.startRangeInCidr=ipSrv.isInV6Cidr(self.postData.ipv6Cidr,self.postData.ipv6AllocationPools[0].split(",")[0]);
                       self.endRangeInCidr=ipSrv.isInV6Cidr(self.postData.ipv6Cidr,self.postData.ipv6AllocationPools[0].split(",")[1]);
				       if(!self.startRangeInCidr){
                          $timeout(function(){
                             self.startRangeInCidr=true;
                          },2500);
				       }
				       if(!self.endRangeInCidr){
                          $timeout(function(){
                             self.endRangeInCidr=true;
                          },2500);
				       }
				   }
				}
				//对于ipv4的各种校验
				self.startIpgtEndIp = ipSrv.checkGtIp(allocationPools); //校验IP地址池中的结束IP必须大于起始IP
				self.ipNotInSubCidr = ipSrv.checkIpInCidr(self.postData.cidr, allocationPools); //校验IP地址池中的IP是否在子网的cidr内
				if (!self.startIpgtEndIp && !self.ipNotInSubCidr) { //每一个IP池的结束IP大于起始IP，IP在子网的cidr内时,再去校验IP池是否交叉重叠，每个IP池中是否含有网关IP
					self.ipIsOverlap = ipSrv.chkIpOverlapFunc(allocationPools); //校验IP地址池是否交叉重叠
					if (self.postData.gateway) {
						self.ipEqToGateway = ipSrv.checkIpInPool(allocationPools, self.postData.gateway); //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
					} else {
						self.defaultGatewayIp = _IP.cidrSubnet(self.postData.cidr).firstAddress;
						self.ipEqToGateway = ipSrv.checkIpInPool(allocationPools, _IP.cidrSubnet(self.postData.cidr).firstAddress); //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
					}
				}
				if (!self.ipIsOverlap && !self.ipEqToGateway && !self.ipNotInSubCidr && !self.startIpgtEndIp&&self.startRangeInCidr&&self.endRangeInCidr) {
					stepsStatus(false, false, true, true, true, true)
				}
			} else {
				self.subnetSubmitInValid = true;
			}

	}
	//新建改造网络
	self.create = function(subnetDetailForm) {
		if (subnetDetailForm.$valid) {
			self.formSubmitted=true;
			//dns
			self.postData.dnsNameservers = self.subnetForm.dnsNameserver ? self.subnetForm.dnsNameserver.split("\n") : []; //数组
			//附加路由
			self.postData.hostRoutes = self.subnetForm.hostRoutes ? self.subnetForm.hostRoutes.split("\n") : [];
			$uibModalInstance.close();
			$timeout(function() {
				if(singleway){
					networksSrv.addSingleNetworks(localStorage.regionKey, self.postData,self.domainproject).then(function() {
						// if($location.path() == "/cvm/netTopo"){
						// 	$rootScope.initEditedTopo();
						// }
						// else{
						// 	$rootScope.refreshNetworksTable();
						// }
					});
				}else{
					networksSrv.createNetworks(localStorage.regionKey, self.postData).then(function() {
						if($location.path() == "/cvm/netTopo"){
							$rootScope.initEditedTopo();
						}else{
							$rootScope.refreshNetworksTable();
						}
					});
				}
			}, 0);
		} else {
			self.subDetailSubmitInValid = true;
		}

	};

	self.cancelCreateNetModal = function(){
		$uibModalInstance.close();
		if($location.path() == "/cvm/netTopo"){
			$rootScope.editTopo();
		}
	}

}