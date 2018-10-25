var tableService = angular.module("clusterSrv", []);
tableService.service("clusterSrv", function($rootScope, $http) {
    var static_url = "awstack-user/v1/enterprises/";
    var enterpriseUid = localStorage.enterpriseUid;
    return {
        getClusterTableData: function() {
            return $http({
                method: "get",
                url: static_url + localStorage.enterpriseUid + "/regions"
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
                url: static_url + localStorage.enterpriseUid+"/regions",
                data: options
            });
        },
        delRegion:function(regionUid){
            return $http({
                method: "delete",
                url: static_url + localStorage.enterpriseUid+"/regions/"+regionUid
            });
        },
        getCurRegNodeList: function(enterpriseUid) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+enterpriseUid+"/nodes/list"
            });
        },
        checkUserName:function(data,enterpriseUid){
            var loginsData = localStorage.LOGINS ? JSON.parse(localStorage.LOGINS) : "";
            //var enterpriseUid = loginsData.enterpriseUid;
            return $http({
                method: "POST",
                url: "awstack-user/v1/enterprises/" + enterpriseUid + "/chkusername",
                data:data
            });
        },
        postDeploy:function(data,enterpriseUid){
            return $http({
                method: "PUT",
                url: "awstack-user/v1/enterprises/" + enterpriseUid + "/clusters/configurations",
                data: data
            });
        },
        getDeployDetail:function(regionKey){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/regions/regionkeys/"+regionKey
            })
        },
        resetDeploy:function(data,enterpriseUid){
            return $http({
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json"
                },
                url:"/awstack-user/v1/enterprises/"+enterpriseUid+"/clusters/configurations",
                data:data
        })
        }
    };
});