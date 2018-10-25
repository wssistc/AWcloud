
var storageManagementSrvModule = angular.module("storageManagementSrvModule", [])
 storageManagementSrvModule.service("storageManagementSrv", ["$http", function($http){
    var static_user_url = "/awstack-user/v1";
    return {
        getStorageTableData: function(option) {
            return $http({
                method: "GET",
                url: static_user_url + "/storage"
            });
        },
        getNodeDisk: function(option) {
            return $http({
                method: "GET",
                url: static_user_url + "/region/"+localStorage.regionKey+"/fetch/fc",
                params:option
            });
        },
        getStorageDetail: function(id) {
            return $http({
                method: "GET",
                url: static_user_url + "/storage/detail/" + id
            });
        },
        initVolumeType: function(headers) {
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/volume_type_initialize_all_in",
                data: {},
                headers:headers
            });
        },
        createStorageData: function(option,headers) {
            return $http({
                method: "POST",
                url: static_user_url + "/storage",
                data: option,
                headers:headers
            });
        },
        editStorageData: function(option) {
            return $http({
                method: "PUT",
                url: static_user_url + "/storage",
                data: option
            });
        },
        deleteStorageData: function(enterpriseUid, regionUid, option) {
            return $http({
                method: "PUT",
                url: static_user_url + "/enterprises/" + enterpriseUid + "/region/" + regionUid + "/storage",
                data: option
            });
        },
        getStoragePoolList: function() {
            return $http({
                method: "GET",
                url: static_user_url + "/storage/" + localStorage.regionKey + "/pool"
            });
        },
        checkNfsAddr: function(option) {
            return $http({
                method: "GET",
                url: static_user_url + "/nfs/sharedir",
                params: option
            });
        },
        checkManageAddr: function(option) {
            return $http({
                method: "GET",
                url: static_user_url + "/storage/checkout/Ips",
                params: option
            });
        },
        restartIscsi: function(option,headers) {
            return $http({
                method: "PUT",
                url: static_user_url + "/region/" + localStorage.regionKey + "/restart/iscsi",
                data: option,
                headers:headers
            });
        },
        discoveryIscsi: function(option) {
            return $http({
                method: "GET",
                url: static_user_url + "/region/" + localStorage.regionKey + "/discovery/iscsi",
                params: option
            });
        },
        loginIscsi: function(regionKey, option,headers) {
            return $http({
                method: "POST",
                url: static_user_url + "/region/" + regionKey + "/fetch/iscsi",
                data: option,
                headers:headers
            });
        },
        getAllNode: function(regionUides) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+regionUides+"/nodes/list"
            });
        },
        configStorageData: function(option,headers) {
            return $http({
                method: "POST",
                url: static_user_url + "/network/config/storage",
                data:option,
                headers:headers
            });
        },
        checkStorageData: function(option,headers) {
            return $http({
                method: "POST",
                url: static_user_url + "/network/check/storage",
                data:option,
                headers:headers
            });
        },
        checkResultData: function(params) {
            return $http({
                method: "GET",
                url: static_user_url + "/network/check/result/storage",
                params: params
            });
        },
        getStorageIp: function(regionKey){
            return $http({
                method:"GET",
                url: "awstack-user/v1/region/"+regionKey+"/iprange",
            });
        },
        getStorage: function(headers){
            return $http({
                method: "GET",
                url: static_user_url + "/storage/list"
            })
        },
        getAvailableDisks:function(regionKey,headers){
            return $http({
                method:"GET",
                url: "awstack-user/v1/region/"+regionKey+"/disk/ceph",
                headers:headers
            });
        },
        isHealthAction: function (options,regionUid) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/health",
                params: options
            });
        },
    };
}]);
