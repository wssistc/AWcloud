
var natGatewaySrvModule = angular.module("natGatewaySrvModule",[]);
natGatewaySrvModule.service("natGatewaySrv",["$http",function($http){
    var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1"
    return {
        queryNatGateway:function(options){
            return $http({
                method: "POST",
                url: static_url + "/natgateway/list",
                data: options
            })
        },
        createNatGateway:function(options){
            return $http({
                method: "POST",
                url: static_url + "/natgateway/create",
                data: options
            })
        },
        editNatGateway:function(options){
            return $http({
                method: "POST",
                url: static_url + "/natgateway/modify",
                data: options
            })
        },
        deleteNatGateway:function(options){
            return $http({
                method: "POST",
                url: static_url + "/natgateway/delete",
                data: options
            })
        },
        //NAT网关绑定EIP
        bindEipNatGateway:function(options){
            return $http({
                method:"POST",
                url: static_url + "/natgateway/eipbind",
                data:options
            })
        },
        //NAT网关解绑EIP
        unBindEipNatGateway:function(options){
            return $http({
                method:"POST",
                url: static_url + "/natgateway/eipunbind",
                data:options
            })
        },
        queryNatPrice:function(options){
            return $http({
                method:"POST",
                url: static_url + "/natgateway/querynatprice",
                data:options
            })
        },
        queryNatGatewayProductionStatus:function(options){
            return $http({
                method:"POST",
                url: static_url + "/natgateway/querystatus",
                data:options
            })
        },
        queryTaskStatus:function(options){
            return $http({
                method:"POST",
                url: static_url + "/natgateway/gettaskresult",
                data:options
            })
        },
        upgradeNatGateway:function(options){
            return $http({
                method:"POST",
                url:static_url + "/natgateway/upgrade",
                data:options
            })
        }
    }

}]);