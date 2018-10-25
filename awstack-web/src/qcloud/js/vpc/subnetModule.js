import "./subnetSrv";
import "./vpcSrv";
import "./routeSrv";

var subnetModule = angular.module("subnetModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap","ui.select","subnetSrvModule","vpcSrvModule","routeSrvModule"]);

subnetModule.controller("subnetCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","NgTableParams","subnetSrv","vpcSrv","routeSrv","RegionID",
    function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,NgTableParams,subnetSrv,vpcSrv,routeSrv,RegionID) {
    var self = $scope;
    self.existedNamesList = [];
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

    function getRelevantData(subnetData,subnetId){
        subnetData && subnetData.forEach(item => {
            if(item.subnetId == subnetId){
                self.subDetailItem.subItem = item;
            }
        })
        self.subDetailItem.subItem && self.subDetailItem.subItem.routeTableOptions.forEach(item =>{
            if(self.subDetailItem.subItem.routeTableId == item.routeTableId){
                self.routePolicyList = item.routeSet;
            }
        });
     };

    function formateSubListData(SubListData,allRoutetableData) {
        self.existedNamesList.splice(self.existedNamesList.length,0);
        SubListData && SubListData.map(item => {
            item.routeTableOptions = [];
            allRoutetableData.forEach(routetable =>{
                if(routetable.vpcId == item.vpcId){
                    item.routeTableOptions.push(routetable);
                }
            });
            if(item.vpcDevices > 0){
                item.delSubTip = "无法删除含有云服务器的子网";
            }
            if(item.routeTableOptions.length == 1){
                item.changeRoutetableTip = "无法更换路由表，该私有网络下只有一个路由表";
            }
            self.existedNamesList.push(item.subnetName);
            return item;
        });
        return SubListData;
    }

    function initSubnetList(type,subnetId){
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
        self.globalSearchTerm = "";
        routeSrv.queryRoutetable({
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }
        }).then(function(res){
            var allRoutetableData = [];
            if(res && res.data){
                allRoutetableData = res.data;
            }
            if(type == "detail"){
                self.subnetListData  = formateSubListData(self.subnetListData,allRoutetableData)
                getRelevantData(self.subnetListData,subnetId);
            }else{
                subnetSrv.getSubnetList(params).then(function(res){
                    if(res && res.data){
                        res.data  = formateSubListData(res.data,allRoutetableData)
                        self.subnetTable = new NgTableParams(
                        { count: 10 }, 
                        { counts: [], dataset: res.data });
                    }
                });
            }
        });
    }

    function getSubnetDetailData(subnetId,vpcId){
    	subnetSrv.getSubnetDetail({
            "params":{
                "Region":self.queryLimit.regionId,
                "subnetId":subnetId,
                "vpcId":vpcId
            }
        }).then(function(res){
            self.subDetailItem = res;
            self.subDetailItem.vpcId = vpcId;
            if(self.subnetTable && self.subnetTable.data){
                getRelevantData(self.subnetTable.data,subnetId);
            }else{
                initSubnetList("detail",subnetId);
            }
        })
    }
    
    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];
        self.vpcs.options.splice(1,self.vpcs.options.length);
        self.queryLimit.vpc = {"vpcName":"全部私有网络","vpcId":""};
        sessionStorage.setItem("RegionSession",regionId);
        sessionStorage.setItem("VPC",JSON.stringify(self.queryLimit.vpc));
        initSubnetList();
        getAllVpcData();
    };

    self.changeVpc = function(vpc){
        self.queryLimit.vpc = vpc;
        sessionStorage.setItem("VPC",JSON.stringify(vpc));
        initSubnetList();
    };

    self.refreshSubnetList = function(){
        initSubnetList();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.subnetTable.filter({ $: term });
    };

    self.createSubnetModal = function(){
        var scope = self.$new();
        var createSubnetModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"createSubnetModal.html",
            scope:scope
        });
        var existSubCidr = [];
        function getExistSubCidr(selectedVpc){ //私有网络可以包含多个子网，每个子网的网络块均为私有网络CIDR的子集，多个子网的CIDR网络块不可以重叠
            existSubCidr.splice(existSubCidr.length,0);
            scope.subnetTable && scope.subnetTable.data && scope.subnetTable.data.forEach(function(item){
                if(item.vpcId == selectedVpc.vpcId){
                    existSubCidr.push(item.cidrBlock);
                }
            });
        }
        /**
         * 等价于 _IP.toLong(ip)
         */
        function ipToUint(ip) {  
            ip = ip.split('.');
            return (ip[0] << 24 | ip[1] << 16 | ip[2] << 8 | ip[3]) >>> 0;
        }
        /**
         * 获取子网IP段
         * 等价于
         * function getIPZone(cidr){ //'192.168.128.0/22'
         *     var ipDetailObj = _IP.cidrSubnet(cidr);
         *     var minUintIp = _IP.toLong(ipDetailObj.firstAddress) - 1;
         *     var maxUnitIp = _IP.toLong(ipDetailObj.lastAddress) + 1;
         *     return [minUintIp, maxUnitIp];
         * }
         */
        function getIpZone(ip, maskLen) {
            var uintIp = ipToUint(ip);
            var minUintIp = (uintIp & ((Math.pow(2, maskLen) - 1) << (32 - maskLen))) >>> 0;
            var maxUnitIp = (uintIp | (Math.pow(2, 32-maskLen) - 1)) >>> 0;
            return [minUintIp, maxUnitIp];
        }
        /**
         * 判断两个地址块是否重合
         * @param {string} cidr1 "192.168.128.0/22"
         * @param {string} cidr2 "192.168.128.112/22"
         * @returns {bool} true
         * 
         * */
        function isCIDRIntersect(cidr1, cidr2) {
            cidr1 = cidr1.split('/');
            cidr2 = cidr2.split('/');
            var zone1 = getIpZone(cidr1[0], cidr1[1] || 32);
            var zone2 = getIpZone(cidr2[0], cidr2[1] || 32);
            return (zone1[0] - zone2[1]) * (zone1[1] - zone2[0]) <= 0;  
        };  

        //检验cidr是否已存在，两个地址块儿是否重合,以及子网网段是否超出vpc网段
        function checkExistCidr(index,subnetModalForm){
            var _cidrBlock = scope.subnetSet[index].sub_cidr.ip_1 + "." + scope.subnetSet[index].sub_cidr.ip_2 + "." + scope.subnetSet[index].sub_cidr.ip_3 + "." + scope.subnetSet[index].sub_cidr.ip_4 + "/" + scope.subnetSet[index].sub_cidr.ip_5;
            var _existSubCidr = angular.copy(existSubCidr);
            if(index > 0){
                for(let i=0 ; i<index;i++){
                    _existSubCidr.push(scope.subnetSet[i].sub_cidr.ip_1 + "." + scope.subnetSet[i].sub_cidr.ip_2 + "." + scope.subnetSet[i].sub_cidr.ip_3 + "." + scope.subnetSet[i].sub_cidr.ip_4 + "/" + scope.subnetSet[i].sub_cidr.ip_5)
                }
            }
            //scope.subnetSet[index].cidrExist = _.include(existSubCidr,_cidrBlock); //IP已存在
            for(let i=0; i<_existSubCidr.length;i++){
                scope.subnetSet[index].cidrIntersect = isCIDRIntersect(_existSubCidr[i],_cidrBlock); //子网网段有重叠
                if(scope.subnetSet[index].cidrIntersect){
                    break;
                }
            }
            scope.subnetSet[index].cidrSubnet = _IP.cidrSubnet(scope.subvpc.cidrBlock).contains(_IP.cidr(_cidrBlock)); //子网网段超出VPC网段
            if(subnetModalForm){
                if(!scope.subnetSet[index].cidrIntersect && scope.subnetSet[index].cidrSubnet){ //不重叠且在VPC网段内
                    subnetModalForm["sub_cidrBlock_" + index].$valid = true;
                }else{
                    subnetModalForm["sub_cidrBlock_" + index].$valid = false;
                }
            }
        }

        function getContinueNum(min,max){
            var numlist = [];
            for(let i = min ; i <= max ; i++){
                numlist.push(i);
            }
            return numlist;
        }

        function initSubnetForm(cidrBlock){
            var splitIplist = cidrBlock.split("/")[0].split(".");
            var splitIpMask = cidrBlock.split("/")[1];
            scope.subips_5 = getContinueNum(Number(splitIpMask),28);
            return {
                "subnetName":"",
                "sub_cidr":{
                    "ip_1": splitIplist[0],
                    "ip_2": splitIplist[1],
                    "ip_3": splitIplist[2],
                    "ip_4": splitIplist[3],
                    "ip_5": splitIpMask
                },
                "zoneId":self.subzones[0].value,
                "routeTableId":"" //路由一期暂时不做
            }
        }

        function tempTunc(ipRangList){
            var resultarr = [],temp = "";
            for(var i=0;i<ipRangList.length;i++){
                for(var j=i;j<ipRangList.length;j++){
                    temp = "";
                    for(var k=i;k<=j;k++){
                        temp = temp+ipRangList[k]+","
                    }
                    temp  =temp.substring(0,temp.length-1);
                    resultarr.push(temp);
                }
            }
            return resultarr;
        }

        function getIpRange(mask){ //16~28
            mask = Number(mask);
            var ipRangList;
            if(mask%8 == 0){
                ipRangList = [0,255] //0~255
            }else{
                ipRangList = [0];
                for(let i = 1; i <= mask%8 ; i++){
                    ipRangList.push(Math.pow(2,8 - i));
                }
                var tempArr = tempTunc(ipRangList);
                _.each(tempArr,function(item){
                    mask%8 > 1 && item.split(",").length>1 && ipRangList.push(_.reduce(item.split(","),function(val1,val2){
                        return Number(val1) + Number(val2);
                    }))
                })
                
            }
            return _.sortBy(_.uniq(ipRangList)) ;
        }

        scope.changeIp_5 = function(mask,index){
            mask = Number(mask);
            if(mask == 16){
                scope.subnetSet[index].sub_cidr.ip_3 = scope.subnetSet[index].sub_cidr.ip_4 = 0;
                scope.subnetSet[index].subip_3_range = scope.subnetSet[index].subip_4_range = [];
                scope.subnetSet[index].subip_3_range_tip = scope.subnetSet[index].subip_4_range_tip = "";
                scope.subnetSet[index].subip_3_readonly = scope.subnetSet[index].subip_4_readonly = true;
            }else if(mask > 16 && mask <= 24){
                scope.subnetSet[index].subip_3_range = getIpRange(mask);
                scope.subnetSet[index].subip_3_range_tip = (scope.subnetSet[index].subip_3_range[0] == 0 && scope.subnetSet[index].subip_3_range[1] == [255]) ? "范围：0~255" : scope.subnetSet[index].subip_3_range.length<=4?scope.subnetSet[index].subip_3_range:scope.subnetSet[index].subip_3_range.slice(0,3).join(",")+"..."+String(scope.subnetSet[index].subip_3_range[scope.subnetSet[index].subip_3_range.length-1]);;
                scope.subnetSet[index].sub_cidr.ip_4 = 0;
                scope.subnetSet[index].subip_4_range = [];
                scope.subnetSet[index].subip_4_range_tip = "";
                scope.subnetSet[index].subip_3_readonly = false;
                scope.subnetSet[index].subip_4_readonly = true;
            }else if(mask > 24 && mask <= 28){
                scope.subnetSet[index].subip_3_range = [0,255];
                scope.subnetSet[index].subip_4_range = getIpRange(mask);
                scope.subnetSet[index].subip_3_range_tip = (scope.subnetSet[index].subip_3_range[0] == 0 && scope.subnetSet[index].subip_3_range[1] == 255) ? "范围：0~255" : scope.subnetSet[index].subip_3_range;
                scope.subnetSet[index].subip_4_range_tip = (scope.subnetSet[index].subip_4_range[0] == 0 && scope.subnetSet[index].subip_4_range[1] == 255) ? "范围：0~255" : scope.subnetSet[index].subip_4_range;
                scope.subnetSet[index].subip_3_readonly = false;
                scope.subnetSet[index].subip_4_readonly = false;
            }
            checkExistCidr(index);
        };

        scope.checkIp34 = function(val,name,index){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            if(reg.test(val)){
                val = Number(val);
                if( scope.subnetSet[index].sub_cidr.ip_5%8 != 0 ){
                    if(scope.subnetSet[index]["sub" + name + "_range"][0]== 0 && scope.subnetSet[index]["sub" + name + "_range"][1] == 255 ){
                        scope.subnetSet[index]["sub" + name + "_range"] = getContinueNum(0,255)
                    }
                    if(_.include(scope.subnetSet[index]["sub" + name + "_range"],val)){
                        scope.subnetSet[index].sub_cidr[name] = val;
                    }else{
                        scope.subnetSet[index].sub_cidr[name] = 0;
                    }
                }else{
                    if(val < scope.subnetSet[index]["sub" + name + "_range"][0] || val > scope.subnetSet[index]["sub" + name + "_range"][1] ){
                        scope.subnetSet[index].sub_cidr[name] = 0; 
                    }
                }
            }else{
                scope.subnetSet[index].sub_cidr[name] = 0; 
            }
            checkExistCidr(index);
            
        };

        createSubnetModal.opened.then(function(){
            scope.submitted = false;
            scope.interacted = function(field,index) {
                if(field){
                    return scope.submitted || field.$dirty;
                }
            };
            scope.routeTables = [{"name":"默认","value":""}];
            scope.vpcsOptions = angular.copy(scope.vpcs.options);
            scope.vpcsOptions.splice(0,1);
            if(scope.vpcsOptions.length > 0){
                scope.subvpc = scope.vpcsOptions[0];
                getExistSubCidr(scope.subvpc);
                scope.subnetSet = [];
                scope.subnetSet.push(initSubnetForm(scope.subvpc.cidrBlock));
                scope.changeIp_5(scope.subvpc.cidrBlock.split("/")[1],0);
                checkExistCidr(0);
                scope.addsub = function(subvpc,index){
                    scope.subnetSet.push(initSubnetForm(subvpc.cidrBlock));
                    scope.changeIp_5(subvpc.cidrBlock.split("/")[1],index);
                    checkExistCidr(index);
                };

                scope.delsub = function(index){
                    scope.subnetSet.splice(index,1);
                };
                
                scope.changeSubVpc = function(subvpc){
                    scope.subvpc = subvpc;
                    existSubCidr = existSubCidr.splice(existSubCidr.length,0);
                    getExistSubCidr(scope.subvpc);
                    scope.subnetSet = scope.subnetSet.slice(scope.subnetSet.length,0);
                    scope.subnetSet.push(initSubnetForm(subvpc.cidrBlock));
                    scope.changeIp_5(subvpc.cidrBlock.split("/")[1],0);
                };

                scope.createSubConfirm = function(subnetModalForm,subnetSet){
                    var _subnetSet = [];
                    subnetSet.forEach(function(item,i){
                        _subnetSet.push({
                            "cidrBlock":item.sub_cidr.ip_1 + "." + item.sub_cidr.ip_2 + "."+ item.sub_cidr.ip_3 + "." + item.sub_cidr.ip_4 +"/" + item.sub_cidr.ip_5,
                            "subnetName":item.subnetName,
                            "zoneId":item.zoneId,
                            "routeTableId":item.routeTableId
                        });
                        checkExistCidr(i,subnetModalForm);
                    })
                    for(var i = 0;i<_subnetSet.length;i++){
                        if(!subnetModalForm["sub_cidrBlock_"+i].$valid){
                            subnetModalForm.$valid = false;
                            break;
                        }
                    }
                    if(subnetModalForm.$valid ){
                        subnetSrv.createSubnet({
                            "params":{
                                //"Region":scope.queryLimit.regionId,
                                "vpcId":scope.subvpc.vpcId,
                                "subnetSet":_subnetSet
                            }
                        }).then(function(res){
                            if(res && res.code == 0){
                                initSubnetList();
                                createSubnetModal.close();
                            }
                        });
                    }else{
                        scope.submitted = true;
                    }
                };
            }
        })
    };

    self.editSubnetModal = function(editData,type){
        var scope = self.$new();
        var editSubModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"editSubnetModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return self.submitted || field.$dirty;
        };
        scope.editSubnetForm = {
            "subnetName":editData.subnetName
        };
        scope.editSubnetConfirm = function(editSubModalForm){
            if(editSubModalForm.$valid){
                subnetSrv.editSubnet({
                    "params":{
                        //"Region":scope.queryLimit.regionId,
                        "subnetName":scope.editSubnetForm.subnetName,
                        "vpcId":editData.vpcId,
                        "subnetId":editData.subnetId
                    }
                }).then(function(res){
                    if(res && res.code == 0){
                        initSubnetList();
                        if(type == "detail"){
                            getSubnetDetailData(editData.subnetId,editData.vpcId);
                        }
                        editSubModal.close();
                    }
                })
            }else{
                scope.submitted = true;
            }
        };
    };

    self.deleteSubnet = function(deleteData){
        if(deleteData.vpcDevices == 0){
            var content = {
                target: "delSubnet",
                msg: "<span>确定删除该子网？</span>",
                data:deleteData
            };
            self.$emit("delete", content);
        }
    };
    self.$on("delSubnet",function(e,deleteData){
        subnetSrv.deleteSubnet({
            "params":{
                //"Region":self.queryLimit.regionId,
                "vpcId":deleteData.vpcId,
                "subnetId":deleteData.subnetId
            }
        }).then(function(res){
            if(res && res.code == 0){
                initSubnetList();
            }
        });
    });

    self.changeRoutetable = function(subnet,type){
        if(subnet && subnet.routeTableOptions && subnet.routeTableOptions.length > 1){
            var scope = self.$new();
            var changeRoutetableModal = $uibModal.open({
                animation:$scope.animationsEnabled,
                templateUrl:"changeRoutetableModal.html",
                scope:scope
            });
            scope.submitted = false;
            scope.interacted = function(field) {
                return self.submitted || field.$dirty;
            };
            scope.changeRoutetableForm = {
                routeTableId:subnet.routeTableId
            };
            scope.routeTableOptions = subnet.routeTableOptions;
            scope.changeRoutetableConfirm = function(formfield){
                if(formfield.$valid){
                    subnetSrv.changeRoutetable({
                        "params":{
                            //"Region":self.queryLimit.regionId,
                            "vpcId":subnet.vpcId,
                            "subnetId":subnet.subnetId,
                            "routeTableId":scope.changeRoutetableForm.routeTableId
                        }
                    }).then(function(res){
                        if(res && res.code == 0){
                            initSubnetList();
                            if(type == "detail"){
                                getSubnetDetailData(subnet.subnetId,subnet.vpcId);
                            }
                            changeRoutetableModal.close();
                        }
                    })
                }else{
                    scope.submitted = true;
                }
            }; 
        }
        
    };

    self.$watch(function () {
        return $routeParams.subnetId;
    }, function (subnetId) {
        self.animation = subnetId ? "animateIn" : "animateOut";
        if (subnetId) {
            if(self.queryLimit.vpc.vpcId == ""){
                var getVpcIdFunc = function(data){
                    var vpcId;
                    data.forEach(item => {
                        if(item.subnetId == subnetId){
                            vpcId = item.vpcId;
                        }
                    });
                    return vpcId;
                };
                if(self.subnetTable && self.subnetTable.data){
                    getSubnetDetailData(subnetId,getVpcIdFunc(self.subnetTable.data));
                }else{
                    subnetSrv.getSubnetList({
                        "params":{
                            "Region":self.queryLimit.regionId,
                            "all":"True"
                        }
                    }).then(function(res){
                        if(res && res.data){
                            self.subnetListData = res.data;
                            getSubnetDetailData(subnetId,getVpcIdFunc(res.data));
                        }
                    });
                }
            }else{
                getSubnetDetailData(subnetId,self.queryLimit.vpc.vpcId);
            }
        }else{
            getAllVpcData();
            initSubnetList();
        }
    });
    
}]);



