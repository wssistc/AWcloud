import "../vpc/vpcSrv";

var buyVpcModule = angular.module("buyVpcModule", ["ngAnimate","ngSanitize","ui.bootstrap","ngTable", "ui.select","vpcSrvModule"]);

buyVpcModule.controller("buyVpcCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","NgTableParams","vpcSrv","RegionID",
function($self,$rootself,$location, $uibModal,$translate,$routeParams,NgTableParams,vpcSrv,RegionID) {
    var self = $self;
    self.existedNamesList = [];
    self.regions = {
        options:vpcSrv.regionOptions
    };
    self.queryLimit = {
        regionId:RegionID.Region()
    };
    
    self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];

    function getExistNames(){
        self.existedNamesList.splice(self.existedNamesList.length,0);
        if(vpcSrv.vpcTableData.length > 0){
            vpcSrv.vpcTableData.forEach(item => {
                self.existedNamesList.push(item.vpcName);
            });
        }else{
            vpcSrv.getVpcList({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "all":"True"
                }
            }).then(function(res){
                if(res && res.data){
                    res.data.forEach(item => {
                        self.existedNamesList.push(item.vpcName);
                    });
                }
            });
        }
    }
    getExistNames();

    self.vpcForm = {
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

    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };

    function getContinueNum(min,max){
        var numlist = [];
        for(let i=min;i<=max;i++){
            numlist.push(i);
        }
        return numlist;
    }
    self.vpcips_1 = ["10","172","192"];
    self.vpcips_5 = getContinueNum(16,28);
    self.subips_5 = getContinueNum(16,28);
    
    self.min_num = {
        vpcip_2:0
    };
    self.max_num = {
        vpcip_2:255
    };
    self.vpcip_2_range = "范围：0~255";
    self.changeVpcIp_1 = function(ip1){
        self.vpcForm.sub_cidr.ip_1 = ip1;
        $("#vpcip_2").removeAttr("readonly");
        switch(ip1){
            case "10": 
            self.min_num.vpcip_2 = 0;
            self.max_num.vpcip_2 = 255;
            self.vpcForm.vpc_cidr.ip_2 = self.vpcForm.sub_cidr.ip_2 = 0;
            self.vpcip_2_range = "范围：0~255";
            break;
            case "172":
            self.min_num.vpcip_2 = 16;
            self.max_num.vpcip_2 = 31;
            self.vpcForm.vpc_cidr.ip_2 = self.vpcForm.sub_cidr.ip_2 = 16;
            self.vpcip_2_range = "范围：16~31";
            break;
            case "192":
            self.min_num.vpcip_2 = 168;
            self.max_num.vpcip_2 = 168;
            self.vpcip_2_range = "";
            self.vpcForm.vpc_cidr.ip_2 = self.vpcForm.sub_cidr.ip_2 = 168
            $("#vpcip_2").attr("readOnly","true");
            break;
        }
    };
    
    self.checkVpcIp2 = function(value){
        var reg = new RegExp("^(0|[1-9][0-9]*)$");
        if(value && reg.test(value)){
            if(Number(value) < self.min_num.vpcip_2 || Number(value) > self.max_num.vpcip_2){
                self.vpcForm.vpc_cidr.ip_2 = self.vpcForm.sub_cidr.ip_2 = self.max_num.vpcip_2;
            }
        }else{
            self.vpcForm.vpc_cidr.ip_2 = self.vpcForm.sub_cidr.ip_2 = self.min_num.vpcip_2;
        }
    };

    self.setSubIP = function(ip2,name){
        self.vpcForm.sub_cidr[name] = ip2 ? ip2 : 0;
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

    self.changeIp_5 = function(mask,name){
        mask = Number(mask);
        if(name == "vpc"){
            self.subips_5 = getContinueNum(mask,28);
            self.vpcForm.sub_cidr.ip_5 = self.subips_5[0];
            $("#subip_3").attr("readOnly","true");
            $("#subip_4").attr("readOnly","true");
        }
        if(mask == 16){
            self.vpcForm[name + "_cidr"].ip_3 = self.vpcForm[name + "_cidr"].ip_4 = 0;
            self[name + "ip_3_range"] = self[name + "ip_4_range"] = [];
            self[name + "ip_3_range_tip"] = self[name + "ip_4_range_tip"] = "";
            $("#"+name+"ip_3").attr("readonly","true");
            $("#"+name+"ip_4").attr("readonly","true");
        }else if(mask > 16 && mask <= 24){
            self[name + "ip_3_range"] = getIpRange(mask);
            self[name + "ip_3_range_tip"] = (self[name + "ip_3_range"][0] == 0 && self[name + "ip_3_range"][1] == [255]) ? "范围：0~255" : self[name + "ip_3_range"].length<=4?self[name + "ip_3_range"]:self[name + "ip_3_range"].slice(0,3).join(",")+"..."+String(self[name + "ip_3_range"][self[name + "ip_3_range"].length-1]);
            self.vpcForm[name + "_cidr"].ip_4 = 0;
            self[name + "ip_4_range"] = [];
            self[name + "ip_4_range_tip"] = "";
            $("#"+name+"ip_3").removeAttr("readonly");
            $("#"+name+"ip_4").attr("readonly","true");
        }else if(mask > 24 && mask <= 28){
            self[name + "ip_3_range"] = [0,255];
            self[name + "ip_4_range"] = getIpRange(mask);
            self[name + "ip_3_range_tip"] = (self[name + "ip_3_range"][0] == 0 && self[name + "ip_3_range"][1] == 255) ? "范围：0~255" : self[name + "ip_3_range"];
            self[name + "ip_4_range_tip"] = (self[name + "ip_4_range"] == 0 && self[name + "ip_4_range"][1] == 255) ? "范围：0~255" : self[name + "ip_4_range"];
            $("#"+name+"ip_3").removeAttr("readonly");
            $("#"+name+"ip_4").removeAttr("readonly");
        }
    };
    self.changeIp_5(16,"vpc");

    self.checkIp34 = function(val,type,name){
        var reg = new RegExp("^(0|[1-9][0-9]*)$");
        if(reg.test(val)){
            val = Number(val);
            if( self.vpcForm[type + "_cidr"].ip_5%8 != 0 ){
                if(self[type + name + "_range"][0]== 0 && self[type + name + "_range"][1] == 255 ){
                    self[type + name + "_range"] = getContinueNum(0,255)
                }
                if(_.include(self[type + name + "_range"],val)){
                    self.vpcForm[type + "_cidr"][name] = val;
                }else{
                    self.vpcForm.vpc_cidr[name] = self.vpcForm.sub_cidr[name] = 0;
                }
            }else{
                if(val < self[type + name + "_range"][0] || val > self[type + name + "_range"][1] ){
                    self.vpcForm.vpc_cidr[name] = self.vpcForm.sub_cidr[name] = 0;
                }
            }
        }else{
            self.vpcForm.vpc_cidr[name] = self.vpcForm.sub_cidr[name] = 0;
        }
    };

    self.vpcConfirm = function(vpcModalForm){
        if(vpcModalForm.$valid){
            vpcSrv.addVpc({
                "params":{
                    //"Region":self.queryLimit.regionId,
                    "vpcName":self.vpcForm.vpcName,
                    "cidrBlock":self.vpcForm.vpc_cidr.ip_1 + "." +self.vpcForm.vpc_cidr.ip_2+"."+self.vpcForm.vpc_cidr.ip_3+"."+self.vpcForm.vpc_cidr.ip_4+"/"+self.vpcForm.vpc_cidr.ip_5,
                    "subnetSet.0.subnetName":self.vpcForm.subnetName,
                    "subnetSet.0.cidrBlock":self.vpcForm.sub_cidr.ip_1 + "." +self.vpcForm.sub_cidr.ip_2+"."+self.vpcForm.sub_cidr.ip_3+"."+self.vpcForm.sub_cidr.ip_4+"/"+self.vpcForm.sub_cidr.ip_5,
                    "subnetSet.0.zoneId":self.vpcForm.subzone
                }
            }).then(function(res){
                if(res.code==0){
                   $location.path("/vpc/vpc");
                }else{
                    self.buyFailedMsg = res.message;
                }
            });
        }else{
            self.submitted = true;
        }
    };
    
}]);



