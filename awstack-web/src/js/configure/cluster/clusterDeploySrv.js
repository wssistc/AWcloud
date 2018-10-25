angular.module("clusterDeploySrv", [])
.service("clusterDeploySrv", function($rootScope, $http) {
    var static_url = "awstack-user/v1/enterprises/";
    return {
        getClusterTableData: function() {
            return $http({
                method: "get",
                url: static_url + enterpriseUid + "/regions"
            });
        },
        getNode: function(regionUid) {
            return $http({
                method: "get",
                url: "awstack-user/v1/regions/"+regionUid+"/nodes"
            });
        },
        createRegion: function(options) {
            return $http({
                method: "post",
                url: static_url + enterpriseUid+"/regions",
                data: options
            });
        },
        delRegion:function(regionUid){
            return $http({
                method: "delete",
                url: static_url + enterpriseUid+"/regions/"+regionUid
            });
        }
    };
});