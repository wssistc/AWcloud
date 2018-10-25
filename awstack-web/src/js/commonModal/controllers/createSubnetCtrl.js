createSubnetCtrl.$inject = ["$scope", "$rootScope", "$location", "networksSrv", "checkQuotaSrv", "$uibModalInstance", "$translate", "$timeout", "context", "ipSrv","createPhySub"];

export function createSubnetCtrl($scope, $rootScope, $location, networksSrv, checkQuotaSrv, $uibModalInstance, $translate, $timeout, context, ipSrv,createPhySub) {
    var self = $scope;
    self.createPhySub=createPhySub;//判断是新建私有子网还是外部子网，外部子网没有ipv6
    self.startRangeInCidr=true;
    self.endRangeInCidr=true;
    if ($location.path() == "/cvm/netTopo") {
        self.topoPage = true;
    }
    checkQuotaSrv.checkQuota(self, "subnet"); //子网配额校验
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
        addressArea: false,
        gateway: "",
        enableDhcp: true,
        enableGateway: true,
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

    //网络拓扑中的新建子网，首先要选择网络，根据是否为外部网络来展示ipv6
    self.changeNetwork=function(network){  
        if(network.external){
           self.createPhySub=true;
        }else{
           self.createPhySub=false;
        }
    };

    self.setIpIsOverlap = function() {
        self.ipIsOverlap = false;
        self.ipEqToGateway = false;
        self.ipNotInSubCidr = false;
        self.startIpgtEndIp = false;
    };

    self.subnetSubmitInValid = false;
    self.interactedSubnet = function(field) {
        if (field) {
            return self.subnetSubmitInValid || field.$dirty;
        }
    };

    self.addAllocationPools = function() {
        self.subnetForm.allocationPools.push({
            start: "",
            end: ""
        })
        self.setIpIsOverlap()
    };

    self.delAllocationPools = function(index, allocationPools) {
        self.subnetForm.allocationPools.splice(index, 1)
        self.setIpIsOverlap()
    };

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
    //一进来就要判断分配地址池是否可以点击
    self.setCidr();

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

    if (self.topoPage) {
        networksSrv.projectNetworks().then(function(res) {
            if (res && res.data) {
                self.networksList = res.data;
                self.subnetForm.network = self.networksList[0];
                self.changeNetwork(self.networksList[0]);
            }
        });
    }

    self.createSubnetCfm = function(createSubnetForm) {
        if (createSubnetForm.$valid) {
            self.postData = {
                "name": self.subnetForm.name,
                "network_id": self.topoPage ? self.subnetForm.network.id : context.network_id,
                "ip_version": 4,
                "cidr": self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5,
                //子网网关
                "forbiddenGateway": self.subnetForm.gateway ? false : true,
                "gateway": self.subnetForm.enableGateway ? (self.subnetForm.gateway ? self.subnetForm.gateway : "") : null,
                "enable_dhcp": self.subnetForm.enableDhcp,
                "dns_nameservers": [],
                "allocation_pools": [],
                "host_routes": [],
            }
            if (self.subnetForm.enableDhcp == true) {
                self.postData.host_routes = self.subnetForm.hostRoutes ? self.subnetForm.hostRoutes.split("\n") : [];
            }
            self.postData.dns_nameservers = self.subnetForm.dnsNameserver ? self.subnetForm.dnsNameserver.split("\n") : []; //数组
            var allocationPools = [];
            //可用地址范围
            if (self.subnetForm.addressArea) {
                self.subnetForm.allocationPools.map(item => {
                    self.postData.allocation_pools.push(item.start + "," + item.end)
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
                self.formSubmitted=true;
                $uibModalInstance.close();
                $timeout(function() {
                    networksSrv.addSubnetAction(self.postData).then(function(res) {
                        if (self.topoPage) {
                            $timeout(function() {
                                $rootScope.initEditedTopo();
                            }, 1000);
                        } else {
                            //$rootScope.refreshSubnetsTable();
                            $rootScope.refreshNetworksTable();
                        }
                    });
                }, 0);
            }
        } else {
            self.subnetSubmitInValid = true;
        }
    };

    self.cancelCreateSubnetModal = function() {
        $uibModalInstance.close();
        if (self.topoPage) {
            $rootScope.editTopo();
        }
    };

}