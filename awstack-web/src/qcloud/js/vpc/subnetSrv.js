
var subnetSrvModule = angular.module("subnetSrvModule",[]);
subnetSrvModule.service("subnetSrv",["$http",function($http){
    var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1"
    return {
        getSubnetList:function(options){
            return $http({
                method: "POST",
                url: static_url + "/subnet/list",
                data: options
            })
        },
        createSubnet:function(options){
            return $http({
                method: "POST",
                url: static_url + "/subnet/create",
                data: options
            })
        },
        editSubnet:function(options){
            return $http({
                method: "POST",
                url: static_url + "/subnet/modifyattr",
                data: options
            })
        },
        deleteSubnet:function(options){
            return $http({
                method: "POST",
                url: static_url + "/subnet/delete",
                data: options
            })
        },
        getSubnetDetail:function(options){
            return $http({
                method:"POST",
                url: static_url + "/subnet/info",
                data:options
            })
        },
        changeRoutetable:function(options){
            return $http({
                method:"post",
                url:static_url + "/routetable/associatesubnet",
                data:options
            })
        }
    }

}])
