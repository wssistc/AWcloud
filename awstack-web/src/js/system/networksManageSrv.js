/**
 * Created by Weike on 2016/6/16.
 */
angular.module("networksManageSrvModule", [])
    .service("networksManageSrv", function ($http) {
        return {
            getTenantPhyNetList:function(regionKey,enterpriseUid){
                return $http({
                    method: "GET",
                    url: "/awstack-resource/v1/networkSetting/"+regionKey+"/"+enterpriseUid+"/ListExternalTenantNetwork",
                });
            },
            getExternalPhyNetList:function(regionKey,enterpriseUid){
                return $http({
                    method: "GET",
                    url: "/awstack-resource/v1/networkSetting/"+regionKey+"/"+enterpriseUid+"/ListExternalPhyNetwork",
                });
            },
            getUnassignedNetList:function(regionKey,enterpriseUid){
                return $http({
                    method: "GET",
                    url: "/awstack-resource/v1/networkSetting/"+regionKey+"/"+enterpriseUid+"/ListUnusedNetwork",
                });
            },
            getVlanType:function(regionKey,enterpriseUid){
                return $http({
                    method: "GET",
                    url: "awstack-resource/v1/networkSetting/"+regionKey+"/"+enterpriseUid+"/getPrivateNetworkType",
                });
            },
            updatePhyNetList: function (regionKey,enterpriseUid,options) {
                return $http({
                    method: "POST",
                    url: "/awstack-resource/v1/networkSetting/"+regionKey+"/"+enterpriseUid+"/addPhyNetwork",
                    data:options
                });
            },
        };
    });
