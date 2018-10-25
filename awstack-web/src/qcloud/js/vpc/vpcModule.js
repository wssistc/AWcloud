import "./vpcSrv";

var vpcModule = angular.module("vpcModule", ["ngAnimate","ngSanitize","ui.bootstrap","ngTable", "ui.select","vpcSrvModule"]);

vpcModule.controller("vpcCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","NgTableParams","vpcSrv","RegionID",
function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,NgTableParams,vpcSrv,RegionID) {
    var self = $scope;
    self.existedNamesList = [];
    self.regions = {
        options:vpcSrv.regionOptions
    };
    self.queryLimit = {
        regionId:RegionID.Region()
    };

    self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];

    function initVpcList(){
        self.globalSearchTerm = "";
        vpcSrv.getVpcList({
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }
        }).then(function(res){
            if(res && res.data){
                self.existedNamesList.splice(self.existedNamesList.length,0);
                res.data.map(function(item){
                    if(item.subnetNum > 0){
                        item.delVpcTip = "无法删除含有子网的私有网络";
                    }
                    if(item.vpgNum > 0){
                        item.delVpcTip = "无法删除含有专线网关的私有网络";
                    }
                    if(item.natNum > 0){
                        item.delVpcTip ="VPC下存在NAT网关";
                    }
                    self.existedNamesList.push(item.vpcName);
                    return item;
                });
                vpcSrv.vpcTableData = res.data;
                self.vpcTable = new NgTableParams(
                { count: 10 }, 
                { counts: [], dataset: res.data });

            }
        });
    }
    initVpcList();

    function getVpcDetailData(vpcId){
        vpcSrv.getVpcDetail({
            "params":{
                //"Region":self.queryLimit.regionId,
                "vpcId":vpcId
            }
        }).then(function(res){
            self.vpcDetailItem = res;
            _.each(self.vpcTable.data,function(item){
                if(item.vpcId == vpcId){
                    self.vpcDetailItem.vpcItem = item;
                }
            })
        })
    }

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.vpcTable.filter({ $: term });
    };

    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];
        sessionStorage.setItem("RegionSession",regionId);
        initVpcList();
    };

    self.refreshVpcList = function(){
        initVpcList();
    };

    self.addVpcModal = function(){
        var scope = self.$new();
        var vpcModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"addVpcModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        function getContinueNum(min,max){
            var numlist = [];
            for(let i=min;i<=max;i++){
                numlist.push(i);
            }
            return numlist;
        }
        scope.vpcips_1 = ["10","172","192"];
        scope.vpcips_5 = getContinueNum(16,28);
        scope.subips_5 = getContinueNum(16,28);
        scope.vpcForm = {
            region:self.queryLimit.regionId,
            vpcName:"",
            vpc_cidr:{
                ip_1:"10",
                ip_2:"0",
                ip_3:"0",
                ip_4:"0",
                ip_5:"16"
            },
            subnetName:"",
            sub_cidr:{
                ip_1:"10",
                ip_2:"0",
                ip_3:"0",
                ip_4:"0",
                ip_5:"16"
            },
            subzone:self.subzones[0].value
        };
        scope.min_num = {
            vpcip_2:0
        };
        scope.max_num = {
            vpcip_2:255
        };
        scope.vpcip_2_range = "范围：0~255";
        scope.changeVpcIp_1 = function(ip1){
            scope.vpcForm.sub_cidr.ip_1 = ip1;
            $("#vpcip_2").removeAttr("readonly");
            switch(ip1){
                case "10": 
                scope.min_num.vpcip_2 = 0;
                scope.max_num.vpcip_2 = 255;
                scope.vpcForm.vpc_cidr.ip_2 = scope.vpcForm.sub_cidr.ip_2 = 0;
                scope.vpcip_2_range = "范围：0~255";
                break;
                case "172":
                scope.min_num.vpcip_2 = 16;
                scope.max_num.vpcip_2 = 31;
                scope.vpcForm.vpc_cidr.ip_2 = scope.vpcForm.sub_cidr.ip_2 = 16;
                scope.vpcip_2_range = "范围：16~31";
                break;
                case "192":
                scope.min_num.vpcip_2 = 168;
                scope.max_num.vpcip_2 = 168;
                scope.vpcip_2_range = "";
                scope.vpcForm.vpc_cidr.ip_2 = scope.vpcForm.sub_cidr.ip_2 = 168
                $("#vpcip_2").attr("readOnly","true");
                break;
            }
        };
        
        scope.checkVpcIp2 = function(value){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            if(value && reg.test(value)){
                if(Number(value) < scope.min_num.vpcip_2 || Number(value) > scope.max_num.vpcip_2){
                    scope.vpcForm.vpc_cidr.ip_2 = scope.vpcForm.sub_cidr.ip_2 = scope.max_num.vpcip_2;
                }
            }else{
                scope.vpcForm.vpc_cidr.ip_2 = scope.vpcForm.sub_cidr.ip_2 = scope.min_num.vpcip_2;
            }
        };

        scope.setSubIP = function(ip2,name){
            scope.vpcForm.sub_cidr[name] = ip2 ? ip2 : 0;
        };

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

        scope.changeIp_5 = function(mask,name){
            mask = Number(mask);
            if(name == "vpc"){
                scope.subips_5 = getContinueNum(mask,28);
                scope.vpcForm.sub_cidr.ip_5 = scope.subips_5[0];
                $("#subip_3").attr("readOnly","true");
                $("#subip_4").attr("readOnly","true");
            }
            if(mask == 16){
                scope.vpcForm[name + "_cidr"].ip_3 = scope.vpcForm[name + "_cidr"].ip_4 = 0;
                scope[name + "ip_3_range"] = scope[name + "ip_4_range"] = [];
                scope[name + "ip_3_range_tip"] = scope[name + "ip_4_range_tip"] = "";
                $("#"+name+"ip_3").attr("readonly","true");
                $("#"+name+"ip_4").attr("readonly","true");
            }else if(mask > 16 && mask <= 24){
                scope[name + "ip_3_range"] = getIpRange(mask);
                scope[name + "ip_3_range_tip"] = (scope[name + "ip_3_range"][0] == 0 && scope[name + "ip_3_range"][1] == [255]) ? "范围：0~255" : scope[name + "ip_3_range"].length<=4?scope[name + "ip_3_range"]:scope[name + "ip_3_range"].slice(0,3).join(",")+"..."+String(scope[name + "ip_3_range"][scope[name + "ip_3_range"].length-1]);
                scope.vpcForm[name + "_cidr"].ip_4 = 0;
                scope[name + "ip_4_range"] = [];
                scope[name + "ip_4_range_tip"] = "";
                $("#"+name+"ip_3").removeAttr("readonly");
                $("#"+name+"ip_4").attr("readonly","true");
            }else if(mask > 24 && mask <= 28){
                scope[name + "ip_3_range"] = [0,255];
                scope[name + "ip_4_range"] = getIpRange(mask);
                scope[name + "ip_3_range_tip"] = (scope[name + "ip_3_range"][0] == 0 && scope[name + "ip_3_range"][1] == 255) ? "范围：0~255" : scope[name + "ip_3_range"];
                scope[name + "ip_4_range_tip"] = (scope[name + "ip_4_range"] == 0 && scope[name + "ip_4_range"][1] == 255) ? "范围：0~255" : scope[name + "ip_4_range"];
                $("#"+name+"ip_3").removeAttr("readonly");
                $("#"+name+"ip_4").removeAttr("readonly");
            }
        };

        scope.checkIp34 = function(val,type,name){
            var reg = new RegExp("^(0|[1-9][0-9]*)$");
            if(reg.test(val)){
                val = Number(val);
                if( scope.vpcForm[type + "_cidr"].ip_5%8 != 0 ){
                    if(scope[type + name + "_range"][0]== 0 && scope[type + name + "_range"][1] == 255 ){
                        scope[type + name + "_range"] = getContinueNum(0,255)
                    }
                    if(_.include(scope[type + name + "_range"],val)){
                        scope.vpcForm[type + "_cidr"][name] = val;
                    }else{
                        scope.vpcForm.vpc_cidr[name] = scope.vpcForm.sub_cidr[name] = 0;
                    }
                }else{
                    if(val < scope[type + name + "_range"][0] || val > scope[type + name + "_range"][1] ){
                        scope.vpcForm.vpc_cidr[name] = scope.vpcForm.sub_cidr[name] = 0;
                    }
                }
            }else{
                scope.vpcForm.vpc_cidr[name] = scope.vpcForm.sub_cidr[name] = 0;
            }
        };

        scope.vpcConfirm = function(vpcModalForm){
            if(vpcModalForm.$valid){
                vpcSrv.addVpc({
                    "params":{
                        //"Region":scope.queryLimit.regionId,
                        "vpcName":scope.vpcForm.vpcName,
                        "cidrBlock":scope.vpcForm.vpc_cidr.ip_1 + "." +scope.vpcForm.vpc_cidr.ip_2+"."+scope.vpcForm.vpc_cidr.ip_3+"."+scope.vpcForm.vpc_cidr.ip_4+"/"+scope.vpcForm.vpc_cidr.ip_5,
                        "subnetSet.0.subnetName":scope.vpcForm.subnetName,
                        "subnetSet.0.cidrBlock":scope.vpcForm.sub_cidr.ip_1 + "." +scope.vpcForm.sub_cidr.ip_2+"."+scope.vpcForm.sub_cidr.ip_3+"."+scope.vpcForm.sub_cidr.ip_4+"/"+scope.vpcForm.sub_cidr.ip_5,
                        "subnetSet.0.zoneId":scope.vpcForm.subzone
                    }
                }).then(function(res){
                    initVpcList();
                    vpcModal.close();
                });
            }else{
                scope.submitted = true;
            }
        };
    };

    self.editVpcModal = function(editData,type){
        var scope = self.$new();
        var editVpcModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"editVpcModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return self.submitted || field.$dirty;
        };
        scope.editVpcForm = {
            "vpcName":editData.vpcName
        };
        scope.editVpcConfirm = function(editVpcModalForm){
            if(editVpcModalForm.$valid){
                vpcSrv.editVpc({
                    "params":{
                        //"Region":scope.queryLimit.regionId,
                        "vpcName":scope.editVpcForm.vpcName,
                        "vpcId":editData.vpcId
                    }
                }).then(function(){
                    initVpcList();
                    if(type == "detail"){
                        getVpcDetailData(editData.vpcId)
                    }
                    editVpcModal.close();
                })
            }else{
                scope.submitted = true;
            }
        };
    };

    self.deleteVpc = function(deleteData){
        if(deleteData.subnetNum == 0 && deleteData.vpgNum == 0 && deleteData.natNum == 0){
            var content = {
                target: "delVpc",
                msg: "<span>确定删除该私有网络？</span>",
                data:deleteData
            };
            self.$emit("delete", content);
        }
    };
    self.$on("delVpc",function(e,deleteData){
        vpcSrv.deleteVpc({
            "params":{
                //"Region":self.queryLimit.regionId,
                "vpcId":deleteData.vpcId
            }
        }).then(function(){
            initVpcList();
        })
    });

    self.$watch(function () {
        return $routeParams.vpcId;
    }, function (vpcId) {
        self.animation = vpcId ? "animateIn" : "animateOut";
        if (vpcId) {
            getVpcDetailData(vpcId)
        }
    });
    
}]);



