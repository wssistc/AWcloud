import "./routeSrv";
import "./vpcSrv";

var routeModule = angular.module("routeModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap","ui.select","routeSrvModule","vpcSrvModule","natGatewaySrvModule","subnetSrvModule"]);

routeModule.controller("routeCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","NgTableParams","routeSrv","vpcSrv","natGatewaySrv","subnetSrv","checkedSrv","RegionID",
function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,NgTableParams,routeSrv,vpcSrv,natGatewaySrv,subnetSrv,checkedSrv,RegionID) {
    var self = $scope;

    self.regions = {
        options:vpcSrv.regionOptions
    };
    self.vpcs = {
        options:[{"vpcName":"全部私有网络","vpcId":""}]
    };
    self.queryLimit = {
        regionId:RegionID.Region()
    };
    var vpcData = JSON.parse(sessionStorage.getItem("VPC"));
    self.queryLimit.vpc = vpcData?vpcData:self.vpcs.options[0];
    sessionStorage.setItem("VPC",JSON.stringify(self.queryLimit.vpc));
    self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];
    
    function getAllVpcData(){
        vpcSrv.getVpcList({
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }    
        }).then(function(res){
             if(res && res.data){
                res.data.forEach(item => self.vpcs.options.push(item));
                if($routeParams.vpcId){
                    self.vpcs.options.forEach(item => {
                        if($routeParams.vpcId == item.vpcId){
                            self.queryLimit.vpc = item;
                        }
                    })
                }
            }
        });
    }

    function initRoutetableList(){
        self.globalSearchTerm = "";
        var params = {
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }
        };
        if($routeParams.vpcId){
            params.params.vpcId = $routeParams.vpcId
        }else if(self.queryLimit.vpc.vpcId){
            params.params.vpcId = self.queryLimit.vpc.vpcId;
        }
        routeSrv.queryRoutetable(params).then(function(res){
            if(res && res.data){
                res.data = res.data.map(function(item){
                    if(item.routeTableType == 1){
                        item.delRoutetableTip = "无法删除默认路由表";
                    }else{
                        if(item.subnetNum > 0){
                            item.delRoutetableTip = "无法删除有子网关联的路由表";
                        }
                    }
                    return item;
                })
                self.routeTable = new NgTableParams(
                { count: 10 }, 
                { counts: [], dataset: res.data });
            }
        })
    }

    function getRoutetableDetail(routeTableId){
        var params = {
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }
        };
        if(self.queryLimit.vpc.vpcId){
            params.params.vpcId = self.queryLimit.vpc.vpcId;
        }
        routeSrv.queryRoutetable(params).then(function(res){
            res && res.data && res.data.forEach(item => {
                if(item.routeTableId == routeTableId){
                    self.routetableDetailItem = item;
                    self.routePolicyList = item.routeSet;
                }
            })
        });
    }

    function getAssociatedSubnetData(routeTableId){
        subnetSrv.getSubnetList({
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }    
        }).then(function(res){
            if(res && res.data){
                self.allSubnetData = res.data;
                res.data.forEach(item =>{
                    if(item.routeTableId == routeTableId){
                        self.associatedSubList.push(item);
                    }
                })
            }
        });
    }

    getAllVpcData();
    initRoutetableList();

    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];
        self.vpcs.options.splice(1,self.vpcs.options.length);
        self.queryLimit.vpc = {"vpcName":"全部私有网络","vpcId":""};
        sessionStorage.setItem("RegionSession",regionId);
        sessionStorage.setItem("VPC",JSON.stringify(self.queryLimit.vpc));
        getAllVpcData();
        initRoutetableList();
    };

    self.changeVpc = function(vpc){
        self.queryLimit.vpc = vpc;
        sessionStorage.setItem("VPC",JSON.stringify(vpc));
        initRoutetableList();
    };

    self.refreshRoutetableList = function(){
        initRoutetableList();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.routeTable.filter({ $: term });
    };

    self.creatRoutetableModal = function(type,editData){
        var scope = self.$new();
        var creatRoutetableModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"createRoutetableModal.html",
            scope:scope
        });
        var allNatGatewayData = [];
        scope.existedNamesList = [];
        scope.existedCidrList = [];
        function getExistRouteTableName(selectedVpcId){ //不得超过60个字符。同一个VPC下名称不可重复。
            scope.existedNamesList.splice(scope.existedNamesList.length,0);
            scope.routeTable && scope.routeTable.data && scope.routeTable.data.forEach(function(item){
                if(item.vpcId == selectedVpcId){
                    scope.existedNamesList.push(item.routeTableName);
                }
            });
            if(editData && editData.routeTableName){ //如果为修改则过滤掉修改前的name
               scope.existedNamesList = scope.existedNamesList.filter(item => {
                    return item != editData.routeTableName;
               }) 
            }
        }
        function getExistCidr(cidrBlock){
            scope.existedCidrList.splice(scope.existedCidrList.length,0);
            scope.existedCidrList.push(_IP.cidr(cidrBlock));
        }
        scope.submitted = false;
        scope.interacted = function(field) {
            if(field){
                return scope.submitted || field.$dirty;
            }
        };

        scope.vpcsOptions = angular.copy(scope.vpcs.options);
        scope.vpcsOptions.splice(0,1);
        scope.nextTypeOptions = [
            {"name":"NAT网关","value":8},
            {"name":"公共网关","value":0},
            {"name":"VPN网关","value":1},
            {"name":"专线网关","value":3},
            {"name":"对等连接","value":4},
            {"name":"SSLVPN网关","value":7},
            
        ];

        scope.nextHubOptions = { //nextHub的option需要根据nextType请求对应的api
            "8":[],  //natGatewayData nat网关
            "0":[],  //pubGatewayData 公共网关
            "1":[],  //vpnGatewayData VPN网关
            "3":[],  //specialGatewayData 专线网关
            "4":[],  //p2pData 对等连接
            "7":[]   //sslvpnGatewayData sslvpn网关
        };

        scope.nextHubHolder = {
            "8":"无可用NAT网关",  //allNatGatewayData nat网关
            "0":"无可用公共网关",  //pubGatewayData 公共网关
            "1":"无可用VPN网关",  //vpnGatewayData VPN网关
            "3":"无可用专线网关",  //specialGatewayData 专线网关
            "4":"无可用对等连接",  //p2pData 对等连接
            "7":"无可用SSLVPN网关"   //sslvpnGatewayData sslvpn网关
        };

        function getNatGatewayData(){
            natGatewaySrv.queryNatGateway({
                "params":{
                    //"Region":self.queryLimit.region.value
                }
            }).then(function(res){
                if(res && res.data){
                    allNatGatewayData = _.map(res.data,function(item){
                        item.vpcId = self.queryLimit.regionId + "_vpc_" + item.vpcId;
                        return item;
                    });
                    //nextHub的option需要随着nextType的变化请求对应的api
                    scope.nextHubOptions[8] = allNatGatewayData.filter(item => item.vpcId == scope.routeTableForm.vpc.vpcId);
                }
            })
        }

        function getPubGatewayData(){
            //获取公共网关
        }
        function getVPNGatewayData(){
            //获取VPN网关
        }
        function getSpecialGatewayData(){
            //获取专线网关
        }
        function getP2PData(){
            //获取对等连接
        }
        function getSSLVPNGatewayData(){
            //获取sslvpn网关
        }

        function getNextHubOptions(){
            getNatGatewayData();
            getPubGatewayData();
            getVPNGatewayData();
            getSpecialGatewayData();
            getP2PData();
            getSSLVPNGatewayData();
        }

        function initRoutePolicySet(){
            return {
                "destinationCidrBlock":"",  // "123.9.0.0/24" 目的网段，取值不能在私有网络网段内
                "nextType":scope.nextTypeOptions[0].value,  // "8" 下一跳类型，目前为NAT网关
                "nextHub":scope.nextHubOptions[scope.nextTypeOptions[0].value][0]?scope.nextHubOptions[scope.nextTypeOptions[0].value][0].natId:"",               // "nat-mu29u5jt" 下一跳地址，一般为网关ID，如果是NAT网关，即在NAT网关里创建的ID。系统会自动匹配到下一跳地址。
                "description": ""  // "aa" 路由描述，支持60内个字符。
            }
        }

        switch(type){
            case "new":
            scope.creatRoutetableModal_title = "新建路由表";
            scope.routeTableForm = {
                "routeTableName":"",   //不得超过60个字符,同一个VPC下名称不可重复
                "vpc":scope.vpcsOptions[0],
            };

            scope.createRoutetable = true;
            scope.creRoutePolicySet = [];
            getExistRouteTableName(scope.routeTableForm.vpc.vpcId);
            getExistCidr(scope.vpcsOptions[0].cidrBlock);
            getNextHubOptions();
            scope.changeVpc = function(vpc){
                scope.routeTableForm.routeTableName = "";
                scope.creRoutePolicySet = [];
                scope.nextHubOptions[8] = allNatGatewayData.filter(item => item.vpcId == vpc.vpcId);
                scope.creRoutePolicySet.push(initRoutePolicySet());
                getExistRouteTableName(vpc.vpcId);
                getExistCidr(vpc.cidrBlock);
            };
            break;

            case "editname":
            scope.routeTableForm = angular.copy(editData);
            scope.creRoutePolicySet = angular.copy(editData.routeSet);
            scope.creatRoutetableModal_title = "编辑名称";
            scope.editname = true;
            getExistRouteTableName(editData.vpcId);
            break;

            case "editRoutePolicy":
            var _editData = angular.copy(editData)
            scope.routeTableForm = {
                "routeTableName":_editData.routeTableName,
                "vpc":scope.vpcsOptions.filter(item => {
                    return item.vpcId == _editData.vpcId;
                })
            };
            editData.routeSet = _editData.routeSet.filter(item => {
                return item.nextHub != "Local";
            });
            scope.creRoutePolicySet = editData.routeSet.map(item =>{
                item.nextHub = item.unNextHub;
                return item
            });
            scope.creatRoutetableModal_title = "编辑路由策略";
            scope.editname = false;
            scope.editRoutePolicy = true;
            getNextHubOptions();
        };

        scope.changeNextType = function(nextType,index){
            scope.nextHubOptions[nextType] = (angular.copy(scope.nextHubOptions[nextType])).splice(0,scope.nextHubOptions[nextType].length);
            scope.creRoutePolicySet[index].nextHub = ""; 
            if(scope.nextHubOptions[nextType].length > 0){
                scope.creRoutePolicySet[index].nextHub = scope.nextHubOptions[nextType][0].natId; 
            }
        };

        scope.addRoutePolicy = function(){
            scope.creRoutePolicySet.push(initRoutePolicySet());
        };

        scope.delRoutePolicy = function(index){
            scope.creRoutePolicySet.splice(index,1);
        };

        scope.createRoutetableConfirm = function(routetableModalForm,routeSet){
            if(routetableModalForm.$dirty){
                if(routetableModalForm.$valid){
                    if(type == "new"){
                        var params = {
                            //"Region":scope.queryLimit.regionId,
                            "vpcId":scope.routeTableForm.vpc.vpcId,
                            "routeTableName":scope.routeTableForm.routeTableName,
                            "routeSet":[]
                        };
                        if(routeSet.length > 0){
                            params.routeSet = routeSet;
                        }
                        routeSrv.createRoutetable({
                            "params":params
                        }).then(function(){
                            initRoutetableList();
                            creatRoutetableModal.close();
                        });
                    }else{
                        var params = {
                            //"Region":scope.queryLimit.region.regionId,
                            "vpcId":editData.vpcId,
                            "routeTableId":editData.routeTableId,
                            "routeTableName":scope.routeTableForm.routeTableName/*,
                            "routeSet":editData.routeSet*/
                        };
                        if(type == "editRoutePolicy"){
                            params.routeSet = routeSet;
                        }
                        routeSrv.editRoutetable({
                            "params":params
                        }).then(function(){
                            initRoutetableList();
                            getRoutetableDetail(editData.routeTableId);
                            creatRoutetableModal.close();
                        });
                    }
                }else{
                    scope.submitted = true;
                }
            }else{
                 creatRoutetableModal.close();
            }
        };
    };

    self.deleteRoutetable = function(deleteData){
        if(deleteData.routeTableType !=1 && deleteData.subnetNum == 0){
            var content = {
                target: "deleteRoutetable",
                msg: "<span>确定删除该路由表？</span>",
                data:deleteData
            };
            self.$emit("delete", content);
        }
    };

    self.$on("deleteRoutetable",function(e,deleteData){
        routeSrv.deleteRoutetable({
            "params":{
                //"Region":self.queryLimit.regionId,
                "vpcId":deleteData.vpcId,
                "routeTableId":deleteData.routeTableId
            }
        }).then(function(){
            initRoutetableList();
        })
    });

    self.$watch(function () {
        return $routeParams.routeTableId;
    }, function (routeTableId) {
        self.animation = routeTableId ? "animateIn" : "animateOut";
        if (routeTableId) {
            if($routeParams.unRouteTableId){
                self.basicInfoTab = false;
                self.associateSubTab = true;
            }else{
                self.basicInfoTab = true;
                self.associateSubTab = false;
            }
            self.associatedSubList = [];
            getRoutetableDetail(routeTableId);
            getAssociatedSubnetData(routeTableId);
        }
    });

    self.routetableDetailTab = function(tab){
        self.basicInfoTab = tab == "basic" ? true : false;
        self.associateSubTab = tab == "associateSub" ? true : false;
    };

    self.refreshAssociatedSubList = function(routeTableId){
        self.associatedSubList && self.associatedSubList.splice(0,self.associatedSubList.length);
        getAssociatedSubnetData(routeTableId);
        initRoutetableList();
    };

    self.associateSub = function(routetableDetailItem,type){
        var scope = self.$new();
        var associateSubnetModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"associateSubnetModal.html",
            scope:scope
        });
        
        function initAssociateSubTable(){
            scope.canAssociateSubList = [];
            scope.allSubnetData && scope.allSubnetData.forEach(item =>{
                if(routetableDetailItem && routetableDetailItem.vpcId == item.vpcId){  //路由表和子网必须属于同一网络
                    if(item.unRouteTableId == routetableDetailItem.unRouteTableId){
                        item.cannotBeCheck = true;
                        item.cannotBeCheckTip = "已关联该路由表";
                    }
                    scope.canAssociateSubList.push(item);
                    scope.associateSubTable = new NgTableParams(
                        { count: 10 }, 
                        { counts: [], dataset: scope.canAssociateSubList }
                    );
                    checkedSrv.checkDo(scope,scope.canAssociateSubList, "subnetId","associateSubTable");
                }
            });
        }

        if(type == "detail"){
            initAssociateSubTable();
        }else{
            subnetSrv.getSubnetList({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "all":"True"
                }    
            }).then(function(res){
                if(res && res.data){
                    scope.allSubnetData = res.data;
                    initAssociateSubTable();
                }
            })
        }
        scope.associateSubnetConfirm = function(){
            var subnetIds = [];
            scope.checkedItems && scope.checkedItems.forEach(item => {
                subnetIds.push(item.subnetId);
            });
            if(subnetIds.length > 0){
                routeSrv.associateSubnet({
                    "params":{
                        //"Region":self.queryLimit.regionId,
                        "vpcId":routetableDetailItem.vpcId,
                        "routeTableId":routetableDetailItem.routeTableId,
                        "subnetIds":subnetIds
                    }
                }).then(function(res){
                    if(res && res.code == 0){
                        if(type == "detail"){
                            self.refreshAssociatedSubList(routetableDetailItem.routeTableId);
                        }else{
                            initRoutetableList();
                        }
                        associateSubnetModal.close(); 
                    }
                });
            }else{
                scope.subnetChkedNone = true;
            }
        };
    };

    self.dissociateSubnet = function(subnet){
        var scope = self.$new();
        var dissociateSubnetModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"dissociateSubnetModal.html",
            scope:scope
        });
        scope.dissociateRoutetable = [];
        scope.checkedRoutetable = {
            "routeTableId":""
        };
        routeSrv.queryRoutetable({
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }
        }).then(function(res){
            res && res.data && res.data.forEach(item => {
                if(subnet.vpcId == item.vpcId){
                    scope.dissociateRoutetable.push(item);
                }
            })
        });
        scope.associateSubnetConfirm = function(){
            if(scope.checkedRoutetable.routeTableId){
                routeSrv.associateSubnet({
                    "params":{
                        //"Region":self.queryLimit.regionId,
                        "vpcId":subnet.vpcId,
                        "subnetId":subnet.subnetId,
                        "routeTableId":scope.checkedRoutetable.routeTableId
                    }
                }).then(function(){
                    //init
                    self.refreshAssociatedSubList(scope.routetableDetailItem.routeTableId);
                    dissociateSubnetModal.close();
                });
            }else{
                scope.noRouteTableChkTip = true;
            }
        };
    };

}]);