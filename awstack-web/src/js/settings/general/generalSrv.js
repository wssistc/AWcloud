var generalService = angular.module("generalSrv", []);
generalService.service("generalSrv", ["$http", function($http){
    var static_user_url = "/awstack-user/v1";
    return{
        
        editTimeoutData:function(option) {
            return $http({
                method: "PUT",
                url: static_user_url + "/params",
                data: option
            });
        },
        getRecycleTimeData: function(regionKey) {
            return $http({
                method: "GET",
                url: static_user_url + "/enterprises/regions/" + regionKey + "/configs",
                params: {
                    "configName": "reclaim_instance_interval"
                }
            });
        },
        editRecycleTimeData: function(enterpriseUid, regionUid, option) {
            return $http({
                method: "POST",
                url: static_user_url + "/enterprises/" + enterpriseUid + "/region/"+ regionUid + "/confVersion",
                data: option
            });
        },
        getUpsData: function(regionKey) {
            return $http({
                method: "GET",
                url: static_user_url + "/enterprises/regions/" + regionKey + "/configs",
                params: {
                    "configName": "ups_type"
                }
            });
        },
        editUpsData: function(enterpriseUid, regionUid, option) {
            return $http({
                method: "POST",
                url: static_user_url + "/enterprises/" + enterpriseUid + "/region/"+ regionUid + "/confVersion",
                data: option
            });
        },
        saasConfInfo:function(parentId) {
            return $http({
                method: "GET",
                url: static_user_url + "/params",
                params: {
                    "parentId": parentId,
                    "enterpriseUid": localStorage.enterpriseUid,
                    "regionUid": 0
                }
            });
        },
        getRegionConfigs: function() {
            return $http({
                method: "GET",
                url: static_user_url + "/enterprises/" + localStorage.enterpriseUid + "/regions"
            });
        },
        confVersion:function(data,regionUid){
            return $http({
                method: "POST",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/region/" + regionUid +"/confVersion",
                data: data

            });
        },
        saasCofSet:function(option){
            return $http({
                method: "PUT",
                url: static_user_url + "/params",
                data: option
            });
        },
        getConfStatus:function(){
            return $http({
                method: "GET",
                url: static_user_url + "/enterprises/" + localStorage.enterpriseUid + "/region/" + localStorage.regionKey + "/confVersion/status",
            });
        }

    };
}]);
