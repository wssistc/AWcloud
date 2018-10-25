createPhyNetworkCtrl.$inject = ["$scope","$rootScope","physicalNetworksSrv", "checkQuotaSrv", "$uibModalInstance", "$translate", "type", "bandWidthSrv", "$timeout", "ipSrv", "$location"];
export function createPhyNetworkCtrl($scope,$rootScope, networksSrv, checkQuotaSrv, $uibModalInstance, $translate, type, bandWidthSrv, $timeout, ipSrv, $location) {
    var self = $scope;
    self.firstLoginCopy = type;
    self.inStepZero = !type;
    self.inStepOne = type;
    self.inStepTwo = false;
    self.inStepThree = false;
    self.inStepOneBar = true;
    self.networkSubmitInValid = false;
    self.subnetSubmitInValid = false;
    self.subDetailSubmitInValid = false;
    //vlanId的初始化错误提示信息
    self.vlanIdOverRangeMsg = $translate.instant("aws.physicalNetworks.vlanIdInteger");
    //验证子网和网络的配额
    checkQuotaSrv.checkQuota(self, "network");
    checkQuotaSrv.checkQuota(self, "subnet");

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

    //vlanID的范围
    self.getVlanIdRange = function(selectedPhysicalNet) {
        //vlan类型的物理网络才有vlanId的范围
        if (self.networkForm.selectedNetType == 'VLAN') {
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
                        if (resData.segment_vlan_availabilities && angular.isArray(resData.segment_vlan_availabilities)) {
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
    }

    //判断是否是admin
    switch (localStorage.managementRole) {
        case "2":
            self.isSuperAdmin = true; //是否是超级管理员
            break;
        default:
            self.isSuperAdmin = false; //是否是超级管理员
    }

    //network init
    self.networkForm = {
        name: "",
        selectedNetType: "",
        //物理网络
        selectedPhysicalNet: "",
        external: true,
        shared: false
    };
    self.phyNetworks = {
            options: [],
            vlan: [],
            flat: [],
        }
        //网络类型初始化
    self.netTypes = {
        options: ["VLAN", "FLAT"],
        selected: "VLAN"
    };
    //外部网络共享默认勾选
    self.networkForm.shared = true;
    self.networkForm.selectedNetType = self.netTypes.selected;

    //获取物理网络列表
    networksSrv.getPhyNetworks(localStorage.regionKey, localStorage.enterpriseUid).then(function(result) {
        if (result && angular.isArray(result.data) && result.data.length) {
            result.data.forEach(function(item) {
                    if (item.networkType == 'VLAN') {
                        let index = item.networkName.lastIndexOf(":");
                        item.showName = item.networkName.slice(0, index) + "-" + item.networkName.slice(index + 1);
                        self.phyNetworks.vlan.push(item);
                    } else if (item.networkType == 'FLAT') {
                        item.showName = item.networkName;
                        self.phyNetworks.flat.push(item);
                    }
                })
                //网络类型默认vlan,则物理网络默认vlan
            self.phyNetworks.options = self.phyNetworks.vlan;
            self.networkForm.selectedPhysicalNet = self.phyNetworks.options[0];
            //根据初始选择的物理网络初始化vlanId的范围
            self.getVlanIdRange(self.networkForm.selectedPhysicalNet);
        }
    });

    self.changeNetType = function(selectedNetType) {
            if (selectedNetType == 'VLAN') {
                self.phyNetworks.options = self.phyNetworks.vlan;
            } else if (selectedNetType == 'FLAT') {
                self.phyNetworks.options = self.phyNetworks.flat;
            }
            self.networkForm.selectedPhysicalNet = self.phyNetworks.options[0];
            //根据初始选择的物理网络初始化vlanId的范围
            self.getVlanIdRange(self.networkForm.selectedPhysicalNet);
        }
        //subnet init 
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
        dnsNameserver: "",
        hostRoutes: "",
        allocationPools: [{
            start: "",
            end: ""
        }]
    };

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

    //第一步初始化
    self.networkForm.netBandValue = 0;
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
            //
        if (createSubnetForm.$valid) {
            self.postData = {
                "netName": self.networkForm.name,
                "shared": self.networkForm.shared,
                "external": true,
                "subName": self.subnetForm.name,
                "ipVersion": 4,
                //子网cidr
                "cidr": self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5,
                //子网网关
                "gateway": self.subnetForm.gateway ? self.subnetForm.gateway : "",
                "enableDhcp": self.subnetForm.enableDhcp,
                "dnsNameservers": [],
                "allocationPools": [],
                "hostRoutes": [],
                "admin": self.isSuperAdmin
            }
            if (self.isSuperAdmin) { //是否为超级管理员
                self.postData.networkType = self.networkForm.selectedNetType;
                //vlanid
                self.postData.segmentId = self.networkForm.segment_id;
                self.postData.phyNetworkName = self.networkForm.selectedPhysicalNet.networkName.split(":")[0];
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
            if (!self.ipIsOverlap && !self.ipEqToGateway && !self.ipNotInSubCidr && !self.startIpgtEndIp) {
                stepsStatus(false, false, true, true, true, true)
            }
        } else {
            self.subnetSubmitInValid = true;
        }

    }
    //新建改造网络
    self.create = function(subnetDetailForm) {
        if (subnetDetailForm.$valid) {
            scope.formSubmitted = true;
            //dns
            self.postData.dnsNameservers = self.subnetForm.dnsNameserver ? self.subnetForm.dnsNameserver.split("\n") : []; //数组
            //附加路由
            self.postData.hostRoutes = self.subnetForm.hostRoutes ? self.subnetForm.hostRoutes.split("\n") : [];
            $uibModalInstance.close();
            $timeout(function() {
                networksSrv.createNetworks(localStorage.regionKey, self.postData).then(function() {
                    if ($location.path() == "/cvm/netTopo") {
                        $rootScope.initEditedTopo();
                    } else {
                        $rootScope.refreshPhyNetworksTable();
                    }
                });
            }, 0);
        } else {
            self.subDetailSubmitInValid = true;
        }
    };

    self.cancelCreatePhyNetModal = function() {
        $uibModalInstance.close();
        if ($location.path() == "/cvm/netTopo") {
            $rootScope.editTopo();
        }
    };

}