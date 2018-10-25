/**
 * Created by Administrator on 2017/3/4 0004.
 */

var resourcePriceSrvModule = angular.module("resourcePriceSrvModule",[]);
resourcePriceSrvModule.service("resourcePriceSrv",["$http",function($http){
    return {
        getResourcePriceList:function(options){
            return $http({
                method:"GET",
                url:"awcloud-boss/price/resourcePriceList",
                params:options
            });
        },
        editResourcePrice:function(options){
            return $http({
                method:"PUT",
                url:"awcloud-boss/price/resourcePriceEdit",
                data:options
            });
        },
        getResourceTypeList:function(options){
            return $http({
                method:"GET",
                url:"awcloud-boss/price/resourceTyptList",
                params:options
            });
        },
    };
}]);