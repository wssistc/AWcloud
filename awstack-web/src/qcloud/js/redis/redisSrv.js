angular.module("redissrv", [])
.factory("redisSrv", ["$rootScope", "$http","$q",function($rootScope,$http,$q) {
    
    var static_url = "http://192.168.137.44:8080/awcloud-qcloud";
    return {
        getList:function(option){
            var def = {
                "Region":"gz",
                "projectIds.0": 0
            }
            var req = {
                params:$.extend(def,option)
            };
            var url="http://192.168.137.44:8080/awcloud-qcloud/v1/crs/desciberedis";
            return $http({
                url:url,
                method:"POST",
                data:req
            })
        },
        getRedisDetail:function(option){
            var req = {
                params:$.extend(def,option)
            };
            return $http({
                method:"POST",
                url: static_url + "/v1/crs/desciberedis",
                data:req
            })
        },
        getRegionList:function(option){
            let regionList = [
                {
                    regionName:"广州",
                    region:"gz"
                },
                {
                    regionName:"上海",
                    region:"sh"
                },
                {
                    regionName:"北京",
                    region:"bj"
                }
            ];
            return regionList;
        },
        getNetwork:function(option){
            return $http({
                url:static_url+"/v1/cdb/netList",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getNetNum:function(option){
            return $http({
                url:static_url+"/v1/cdb/netList",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getProductList:function(option){
            return $http({
                url:static_url+"/v1/crs/crsProduct",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        createInstan:function(option,payType){
            var url = "/v1/crs/CreateCRS";
            return $http({
                url:static_url+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getZoneList:function(option){
            return $http({
                url:static_url+"/v1/crs/crsZone",
                method:"POST",
                data:{
                    params:option
                }
            })
        },
        getPrice:function(option){
            var url = "/v1/crs/crsPrice";
            return $http({
                url:static_url+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        upgradePrice:function(option){
            var url = "/v1/crs/UpgradePrice";
            return $http({
                url:static_url+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        upgradeRedis:function(option){
            var url = "/v1/crs/UpgradeRedis";
            return $http({
                url:static_url+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        clearExa:function(option){
            var url = "/v1/crs/clearredis";
            return $http({
                url: static_url + url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        changePassword:function(option){
            var url = "/v1/crs/resetpasswd";
            return $http({
                url: static_url + url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        crsPrice:function(option){
            var url = "/v1/crs/crsPrice";
            return $http({
                url: static_url + url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        renewRedis:function(option){
            var url = "/v1/crs/RenewRedis";
            return $http({
                url: static_url + url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        setautorenew:function(option){
            var url = "/v1/crs/setautorenew";
            return $http({
                url: static_url + url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getNetNum:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/subnet/info",
                method:"POST",
                data:{
                    params:option
                }
            });
        }
    };

}]);
