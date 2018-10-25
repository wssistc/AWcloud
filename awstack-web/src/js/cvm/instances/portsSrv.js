import "../../common/services/commonFuncSrv";

var tableService = angular.module("portsSrvModule", []);
tableService.service("portsSrv", function($rootScope, $http) {
    var static_url = "/awstack-resource/v1";
    return {
       getPortList:function(){
            return $http({
                method: "GET",
                url: static_url + "/ports"
            });
       },
       getNetworks: function() {
            return $http({
                method: "GET",
                url: static_url + "/networks"
            });
        },
       createPort:function(options){
            return $http({
                method: "POST",
                url: static_url + "/ports",
                data: options
            });
       },
       updatePort:function(portId,options){
            return $http({
                method: "PUT",
                url: static_url + "/updatePorts/"+portId,
                data: options
            });
       },
       createInterface:function(serverId,options,params){
            return $http({
                method: "POST",
                url: static_url + "/servers/"+serverId+"/os-interface",
                data: options,
                params:params
            });
       },
       detachInterface:function(serverId,portId){
            return $http({
                method: "DELETE",
                url: static_url + "/servers/"+serverId+"/os-interface/"+portId
            });
       },
       deletePort:function(options){
            return $http({
                method: "DELETE",
                url: static_url + "/ports",
                params:options
            });
       },
       getSubnetDetail:function(subnetId){
            return $http({
                method: "get",
                url: static_url + "/network/subnets/"+subnetId,
            });
       }
        
    };
});
tableService.service("portsIpSettingSrv", function(commonFuncSrv,$rootScope) {
    return {
        setAssignIpFun: function(scope, form, portsSrv,formName) {
            let subnetsList_extend = [];
            let startIp = "";
            let endIp = "";
            scope.selectedSubPoolList = [];

            scope = commonFuncSrv.settingIpFunc(scope,form,formName)

            scope.getExtendSubList = function(subnets) {
                let subnets_extend = [];
                _.each(subnets, function(item) {
                    for (let i = 0; i < item.allocationPools.length; i++) {
                        item.sub_pool = item.name + " : " + item.allocationPools[i].start + " ~ " + item.allocationPools[i].end;
                        item.allocationPool_key = i;
                        subnets_extend.push(angular.copy(item));
                    }
                });
                return subnets_extend;
            };

            scope.setSubPoolFunc = function() {
                scope.selectedSubPoolList.splice(0, scope.selectedSubPoolList.length);
                _.each(subnetsList_extend, item => {
                    if (item.id == scope[form].selectedSubnet.id) {
                        scope.selectedSubPoolList.push(item);
                    }
                });
                scope[form].selectedSubPool = scope.selectedSubPoolList[0];
                let subnet = scope[form].selectedSubPool;
                if(subnet){
                    startIp = subnet.allocationPools[subnet.allocationPool_key].start;
                    endIp = subnet.allocationPools[subnet.allocationPool_key].end;
                    let startIp_list = startIp.split(".");
                    let endIp_list = endIp.split(".");
                    scope.compareIpFun(startIp_list, endIp_list);
                }
            };
            //更换公网
            scope.changeExtNet = function(extNet) {
                //更新子网
                scope.subnets = extNet.subnets;
                scope[form].selectedSubnet = extNet.subnets[0];
                //如果没有子网，取消ip勾选
                if(!scope[form].selectedSubnet){
                   scope[form].assignIP=false;
                }
                //更新子网网段
                subnetsList_extend = scope.getExtendSubList(scope[form].selectedExtNet.subnets);
                scope.setSubPoolFunc();
                scope.checkValue(startIp,endIp);
            };
            //更新子网
            scope.changeSubnet = function(subnet) {
                scope.setSubPoolFunc();
                scope.checkValue(startIp,endIp);
            };
            //更新子网网段
            scope.changeSubPool = function(subnet) {
                let startIp = subnet.allocationPools[subnet.allocationPool_key].start;
                let endIp = subnet.allocationPools[subnet.allocationPool_key].end;
                scope.compareIpFun(startIp.split("."), endIp.split("."));
                scope.checkValue(startIp,endIp);
            };

            scope.mouseSub = function(sub, type) {
                scope.subPool_detail = angular.copy(subnetsList_extend);
                _.map(scope.subPool_detail, item => {
                    if (item.id == sub.id) {
                        if (type == "over") {
                            item.showSubSegDetail = true;
                        } else {
                            item.showSubSegDetail = false;
                        }
                        return item;
                    }
                })
            };
           //获取所有网络列表
           portsSrv.getNetworks().then(function(res) {
                if (res && res.data) {
                    res.data.forEach(function(item){
                        item.subnets=item.subnets.filter(function(subnet){
                            return subnet.ipVersion=='4';
                        });
                    });
                    scope.extNets.options = res.data.filter(function(item){
                         return item.subnets.length!=0;
                    });
                    //定制开发，如果为非admin用户，添加网卡过滤掉公网
                    if(!$rootScope.customizedIsAdmin){
                        scope.extNets.options = scope.extNets.options.filter(function(item) {
                            return !item.external; 
                        });
                    }
                    scope[form].selectedExtNet = scope.extNets.options[0];
                    scope.subnets = scope[form].selectedExtNet.subnets;
                    scope[form].selectedSubnet = scope.subnets[0];
                    subnetsList_extend = scope.getExtendSubList(scope[form].selectedExtNet.subnets);
                    scope.setSubPoolFunc();
                }
            });

            return scope;
        }
    }
})
