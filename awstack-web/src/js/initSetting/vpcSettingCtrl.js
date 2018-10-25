
var initVpcSettingModule = angular.module("initVpcSettingModule", []);

initVpcSettingModule.controller("initVpcSettingCtrl", ["$scope", "$rootScope", "$uibModal", "$translate", "routersSrv", "networksSrv", "$timeout", "$location",
"checkQuotaSrv","bandWidthSrv","$route", "easyNetworkSrv","commonFuncSrv", "initSettingSrv", "alertSrv", function($scope, $rootScope, $uibModal, $translate,
routersSrv, networksSrv, $timeout, $location, checkQuotaSrv, bandWidthSrv, $route, easyNetworkSrv, commonFuncSrv, initSettingSrv, alertSrv) {
    var self = $scope;
    var context = initSettingSrv.context;

    self.firstLoginCopy = true;
    self.inStepZero = false;
    self.routerSubmitInValid = false;
    self.networkSubmitInValid = false;
    self.subnetSubmitInValid = false;
    //vlanId的初始化错误提示信息
    self.vlanIdOverRangeMsg=$translate.instant("aws.physicalNetworks.vlanIdInteger");
    self.limitData = {
        limitType:{
            fixType:{}
        }
    };
    bandWidthSrv.getLimitData(context.initSetting_headers).then(function(res) {
        if (res && res.data && res.data.length != 0) {
            self.limitData = JSON.parse(res.data[0].paramValue);
        }
    });
    self.toView = function(){
        $rootScope.isfirstLogin = false;
        commonFuncSrv.setLoginViewPage($rootScope.loginInfoResult)
    }
    
    //路由init
    self.routerForm = {
        name: "",
        selectedNet: "",
        selectedSubPool: "",
        assignIP: false,
        init_cidr: {
            ip_0: "",
            ip_1: "",
            ip_2: "",
            ip_3: ""
        },
        selectedTenantSub: "",
        repeatIp:false
    };
    self.extNets = {
        options: []
    };
    self.field_form = {};

    //network init
    self.networkForm = {
        name: "",
        selectedNetType: "",
        //物理网络
        selectedPhysicalNet:"",
        external: false
    };

    self.getVlanIdRange=function(selectedPhysicalNet){
        if(selectedPhysicalNet){
            //每个物理网络中vlanid的范围
            let selectPhyNetName=selectedPhysicalNet.networkName.split(":")[0];
            self.min_num=Number(selectedPhysicalNet.networkName.split(":")[1]);
            self.max_num=Number(selectedPhysicalNet.networkName.split(":")[2]);
            self.existedVlanIds = [];
            //获取所有被使用得vlanid
            networksSrv.getUsedVlan(context.initSetting_headers).then(function(res) {
                if (res && res.data) {
                    let resData = JSON.parse(res.data);
                    if (resData.segment_vlan_availabilities && resData.segment_vlan_availabilities[0] && resData.segment_vlan_availabilities[0].vlan_id_used) {
                        self.allExistedVlanIds = resData.segment_vlan_availabilities;
                        //每个物理网络中被占用的vlanid
                        self.allExistedVlanIds.forEach(function(item){
                             if(item&&item.vlan_id_used&&item.physical_network==selectPhyNetName){
                                self.existedVlanIds=item.vlan_id_used;
                             }
                        });
                    }
                }
            });
            self.vlanIdOverRangeMsg=$translate.instant("aws.errors.toInput")+self.min_num+"~"+self.max_num+$translate.instant("aws.errors.toNum");
        }else{
            self.vlanIdOverRangeMsg=$translate.instant("aws.physicalNetworks.vlanIdInteger");
        }
    };

    //获取物理网络列表
    self.phyNetworks={
        options:[]
    };
    //网络类型(根据API返回安装部署时选择的网络类型)
    networksSrv.getNetType(localStorage.enterpriseUid,localStorage.regionKey,context.initSetting_headers).then(function(res){
        if(res&&res.data){
           self.netTypes = {
                options: [res.data.type],
                selected: res.data.type
           };
           self.networkForm.selectedNetType = self.netTypes.selected;
           if(self.networkForm.selectedNetType=='vxlan'){
                self.vxlan_min_num=Number(res.data.start);
                self.vxlan_max_num=Number(res.data.end);
           }
           //vlan才有对应显示的物理网络
           if(self.networkForm.selectedNetType=='vlan'){
                networksSrv.getAvailablePhyNets(localStorage.enterpriseUid,localStorage.regionKey,context.initSetting_headers).then(function(result){
                    if(result&&angular.isArray(result.data)&&result.data.length){
                       result.data.forEach(function(item){
                          let index=item.networkName.lastIndexOf(":");
                          item.showName=item.networkName.slice(0,index)+"-"+item.networkName.slice(index+1);
                          self.phyNetworks.options.push(item);
                       })
                       self.networkForm.selectedPhysicalNet=self.phyNetworks.options[0];
                       //根据初始选择的物理网络初始化vlanId的范围
                       self.getVlanIdRange(self.networkForm.selectedPhysicalNet);
                    }
                });
           }
        }
    });

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
        allocationPools:[{start:"",end:""}]
    };
    self.interactedRouter = function(field) {
        if (field) {
            self.field_form.createrouterForm = field;
            return self.routerSubmitInValid || field.project.$dirty || field.domain.$dirty || field.name.$dirty || field.extnet.$dirty  || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
        }
    };
    self.interactedNetwork = function(field){
        if (field) {
            return self.networkSubmitInValid || field.$dirty ;
        }
    }
    self.interactedSubnet = function(field){
        if (field) {
            return self.subnetSubmitInValid || field.$dirty;
        }
    }
    self = commonFuncSrv.settingDomainPRoject(self,"easy","initSetting");
    self = commonFuncSrv.setAssignIpFun(self, "routerForm","createrouterForm","external");
    self.setSubPoolFunc = function() {
        self.selectedSubPoolList.splice(0, self.selectedSubPoolList.length);
        self.selectedSubPoolList = self.getExtendSubList(self["routerForm"].selectedNet.subnets);
        self["routerForm"].selectedSubPool = self.selectedSubPoolList[0];

        let subnet = self["routerForm"].selectedSubPool;
        let startIp = subnet.allocationPools[subnet.allocationPool_key].start;
        let endIp = subnet.allocationPools[subnet.allocationPool_key].end;

        let startIp_list = startIp.split(".");
        let endIp_list = endIp.split(".");
        self.compareIpFun(startIp_list, endIp_list);
    };
    switch(localStorage.managementRole){
        case"2":
            self.canSelectDomain = true;//true:可以选择部门,false:部门只读
            self.isSuperAdmin = true;//是否是超级管理员
            self.changeCvmView();
            break;
        case"3":
        case"4":
        case"5":
            self.canSelectDomain = false;//true:可以选择部门,false:部门只读
            self.isSuperAdmin = false;//是否是超级管理员
            if(localStorage.domainName == 'default'){
                self.topDomian = "默认部门";
            }else{
                self.topDomian = localStorage.domainName;
            }
            self.changeCvmView();
            break;
    }
    self.setCheckvalueFunc = function(){
        let subnet = self.routerForm.selectedSubPool;
        let startIp = subnet.allocationPools[subnet.allocationPool_key].start;
        let endIp = subnet.allocationPools[subnet.allocationPool_key].end;
        self.checkValue(startIp,endIp);
    };
    function stepsStatus(one,two,three,oneBar,twoBar,threeBar){
        context.inStepOne = one;
        context.inStepTwo = two;
        context.inStepThree = three;
        context.inStepOneBar = oneBar;
        context.inStepTwoBar = twoBar;
        context.inStepThreeBar = threeBar;
        self.inStepZero = false;
    }
    self.setCidr = function() {
        self.cidrVal = self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5;
        var reg = /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))[\/]([1-9]|[1-2][0-9]|[3][0]|[3][1])$/;
        reg.test(self.cidrVal)?self.canSetAllocationPools = false:self.canSetAllocationPools = true;
        if(!self.canSetAllocationPools){
            self.networkAddress=_IP.cidrSubnet(self.cidrVal).networkAddress;
            self.broadcastAddress=_IP.cidrSubnet(self.cidrVal).broadcastAddress;
        }
    };

    self.setIpIsOverlap = function() {
        self.ipIsOverlap = false;
        self.ipEqToGateway = false;
        self.ipNotInSubCidr = false;
        self.startIpgtEndIp = false;
    }; 

    self.addAllocationPools = function(){
        self.subnetForm.allocationPools.push({
            start:"",
            end:""
        })
        self.setIpIsOverlap()
    }

    self.delAllocationPools = function(index,allocationPools){
        self.subnetForm.allocationPools.splice(index,1)
        self.setIpIsOverlap()
    }

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

    function chekstepOne(){
        if (self.field_form.createrouterForm.$valid){
            stepsStatus(false,true,false,true,true,false)
            //self.networkForm.netBandValue = 0;
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
                    self.networkForm.netBandValue =self.limitData.limitType.fixType.networkBandwidth;
                }
            },100);
        } else {
            self.routerSubmitInValid = true;
        } 
    }

    self.stepToTwoZero = function(){
        stepsStatus(false,false,false,false,false,false)
        self.inStepZero = true;
    };
    context.stepToOne = function(){
        stepsStatus(true,false,false,true,false,false);
    };

    context.stepToTwo = function(){
        if(self.createrouterForm.$valid && !self.beyondQuota_dep.router && !self.beyondQuota_pro.router){
            let externalFixedIps = {};
            self.external_fixed_ips = []; 
            if (self.routerForm.assignSub) {
                if(self.routerForm.selectedSubnet){
                   externalFixedIps.subnet_id = self.routerForm.selectedSubnet.id;
                }
                if (self.routerForm.assignIP){
                    let existedIps = [];
                    let gatewayIp = self.routerForm.init_cidr.ip_0 + "." +
                    self.routerForm.init_cidr.ip_1 + "." +
                    self.routerForm.init_cidr.ip_2 + "." +
                    self.routerForm.init_cidr.ip_3; 
                    externalFixedIps.ip_address = gatewayIp;
                    delete externalFixedIps.subnet_id;
                    self.setCheckvalueFunc();
                    if(self.field_form.createrouterForm.$valid){
                        //self.external_fixed_ips.push(externalFixedIps);
                        networksSrv.getNetworksDetail(self.routerForm.selectedNet.id,context.initSetting_headers).then(function(res) {
                            if (res && res.data) {
                                _.each(res.data, function(item) {
                                    _.each(item.subnetIps, function(sub) {
                                        existedIps.push(sub.ip_address);
                                    });
                                });
                                if (!_.include(existedIps, gatewayIp)) {
                                    self.routerForm.repeatIp = false;
                                    chekstepOne();
                                } else {
                                    self.routerForm.repeatIp = true;
                                    self.validForm = false;
                                }
                            }
                        }); 
                    }else{
                        self.routerSubmitInValid = true;
                    }
                }else{
                    chekstepOne();
                }
                self.external_fixed_ips.push(externalFixedIps);
            }else{
                chekstepOne();
            }
        }else{
            self.routerSubmitInValid = true;
        }   
    };

    context.stepThreeToTwo=function(){
        stepsStatus(false,true,false,true,false,false);
    };

    context.stepToThree = function(){
        if(self.createNetworkForm.$valid && !self.beyondQuota_dep.network && !self.beyondQuota_pro.network){
            stepsStatus(false,false,true,true,true,true);
            self.setCidr();
        }else{
            self.networkSubmitInValid = true;
        }
        
    };

    var getIpPoolsZone = function(allocationPools) {
        let pools = {};
        _.each(allocationPools, function(item, i) {
            pools[i] = [_IP.toLong(item.start), _IP.toLong(item.end)];
        });
        return pools; //返回所有IP池的IP范围
    };

    var checkIpInCidr = function(subCidr, allocationPools) { //校验IP地址池中的IP是否在子网的cidr内
        let poolBoundaryIpSet = [];
        let ipNotInCidr = false;
        _.each(allocationPools, function(item) {
            poolBoundaryIpSet.push(item.start);
            poolBoundaryIpSet.push(item.end);
        });
        for (let i = 0; i < poolBoundaryIpSet.length; i++) {
            if (!_IP.cidrSubnet(subCidr).contains(poolBoundaryIpSet[i])) {
                ipNotInCidr = true;
                break;
            }
        }
        return ipNotInCidr;
    };

    var checkGtIp = function(allocationPools) { //校验IP地址池中的结束IP必须大于起始IP
        let startIpgtEndIp = false;
        for (let i = 0; i < allocationPools.length; i++) {
            if (_IP.toLong(allocationPools[i].start) >= _IP.toLong(allocationPools[i].end)) {
                startIpgtEndIp = true;
                break;
            }
        }
        return startIpgtEndIp;
    };

    var checkIpInPool = function(allocationPools, ip) { //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
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

    var chkIpOverlapFunc = function(allocationPools) { //校验IP地址池是否交叉重叠
        let targetNetOverlap=false;
        let startArr=[];
        let endArr=[];
        allocationPools.forEach(function(item){
            startArr.push(_IP.toLong(item.start));
            endArr.push(_IP.toLong(item.end));
        });
        let startSortArr=startArr.sort(function(a,b){return a-b});
        let endSortArr=endArr.sort(function(a,b){return a-b});
        for(var k=1;k<startSortArr.length;k++){
            if (startSortArr[k] <= endSortArr[k-1]){
                targetNetOverlap=true;
                break;
            }
        }
        return targetNetOverlap;
    };
    
    self.create = function(){
        if(self.createSubnetForm.$valid && !self.beyondQuota_dep.subnet && !self.beyondQuota_pro.subnet && !self.formSubmitted){
            var postData = {
                "routerName":self.routerForm.name,
                "externalNetId":self.routerForm.selectedNet.id,
                "netName":self.networkForm.name,
                "shared":false,
                "external":false,
                "subName":self.subnetForm.name,
                "ipVersion":4,
                "cidr": self.subnetForm.init_cidr.ip_1 + "." + self.subnetForm.init_cidr.ip_2 + "." + self.subnetForm.init_cidr.ip_3 + "." + self.subnetForm.init_cidr.ip_4 + "/" + self.subnetForm.init_cidr.ip_5,
                "gateway":self.subnetForm.gateway?self.subnetForm.gateway:"",
                "enableDhcp":self.subnetForm.enableDhcp,
                "dnsNameservers":[],
                "allocationPools":[],
                "hostRoutes":[],
                "admin":self.isSuperAdmin
            }
            //gatewayIp信息的展示
            self.postData={};
            self.postData.gateway=self.subnetForm.gateway?self.subnetForm.gateway:"";
            if(self.networkForm.selectedNetType=='vlan'){
                postData.phyNetworkName = self.networkForm.selectedPhysicalNet.networkName.split(":")[0]; 
            }
            postData.networkType = self.networkForm.selectedNetType;
            if(self.isSuperAdmin){//是否为超级管理员
                postData.segmentId = self.networkForm.segment_id;
                if(self.routerForm.assignSub){
                    postData.externalFixedIps = angular.toJson(self.external_fixed_ips);
                }
            }
            if (self.limitData && self.limitData.limitActive && self.limitData.typeActive == '1') {
                postData.tags = "qos_limit:" + Number(self.networkForm.netBandValue) * 128;
            }
            var headers = {
                "domain_id":self.tops.depart.selected.domainUid,
                "domain_name":encodeURI(self.tops.depart.selected.domainName),
                "project_id":self.tops.pro.selected.projectId,
                "project_name":encodeURI(self.tops.pro.selected.projectName),
                "X-Auth-Token":context.initSettingRegion_token
            };
            postData.dnsNameservers = self.subnetForm.dnsNameserver ? self.subnetForm.dnsNameserver.split("\n") : []; //数组
            postData.hostRoutes = self.subnetForm.hostRoutes ? self.subnetForm.hostRoutes.split("\n") : [];
            var allocationPools = [];
            if(self.subnetForm.addressArea){
                self.subnetForm.allocationPools.map(item =>{
                    postData.allocationPools.push(item.start+","+item.end)
                })
                allocationPools = angular.copy(self.subnetForm.allocationPools)
            }else{
                allocationPools =[]
            }
            self.startIpgtEndIp = checkGtIp(allocationPools);  //校验IP地址池中的结束IP必须大于起始IP
            self.ipNotInSubCidr = checkIpInCidr(postData.cidr, allocationPools); //校验IP地址池中的IP是否在子网的cidr内
            if (!self.startIpgtEndIp && !self.ipNotInSubCidr) { //每一个IP池的结束IP大于起始IP，IP在子网的cidr内时,再去校验IP池是否交叉重叠，每个IP池中是否含有网关IP
                self.ipIsOverlap = chkIpOverlapFunc(allocationPools); //校验IP地址池是否交叉重叠
                if(postData.gateway){
                    self.ipEqToGateway = checkIpInPool(allocationPools,postData.gateway); //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
                }else{
                    self.defaultGatewayIp=_IP.cidrSubnet(postData.cidr).firstAddress;
                    self.ipEqToGateway = checkIpInPool(allocationPools, _IP.cidrSubnet(postData.cidr).firstAddress); //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
                }
            }
            if (!self.ipIsOverlap && !self.ipEqToGateway && !self.ipNotInSubCidr && !self.startIpgtEndIp) {
                self.formSubmitted = true;
                easyNetworkSrv.easyNetwork(postData,headers,localStorage.regionKey).then(function(result){
                    if(result && result.status == "0") {
                        context.getSettingStatus();
                    }else {
                        self.formSubmitted = false;
                    }
                    if($location.path() == "/quickconfig/createins"){
                        commonFuncSrv.reGetNetList = true;
                    }
                })
                if(!$rootScope.ADMIN) {
                    context.closeInitModel();
                }
                if(!self.firstLoginCopy){
                    self.toView()
                }
            }
            
        }else{
            self.subnetSubmitInValid = true;
        }
    }

    context.createVpc = self.create;

}]);