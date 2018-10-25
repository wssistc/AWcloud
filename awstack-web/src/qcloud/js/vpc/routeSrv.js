var routeSrvModule = angular.module("routeSrvModule",[]);
routeSrvModule.service("routeSrv",["$http",function($http){
	var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1"
    return {
        queryRoutetable:function(options){
            return $http({
                method: "POST",
                url: static_url + "/routetable/list",
                data: options
            })
        },
        createRoutetable:function(options){
            return $http({
                method: "POST",
                url: static_url + "/routetable/create",
                data: options
            })
        },
        editRoutetable:function(options){
            return $http({
                method: "POST",
                url: static_url + "/routetable/modifyattr",
                data: options
            })
        },
        deleteRoutetable:function(options){
            return $http({
                method: "POST",
                url: static_url + "/routetable/delete",
                data: options
            })
        },
        /*路由表关联/解关联子网*/
        associateSubnet:function(options){
            return $http({
                method:"POST",
                url:static_url + "/routetable/associatesubnet",
                data:options
            })
        }
    }
}])