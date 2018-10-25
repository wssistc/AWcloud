var imageManageSrvModule = angular.module("imageManageSrvModule",[]);

imageManageSrvModule.service("imageManageSrv", ["$http", function($http){
    var static_url = "/awstack-user/v1";
    return {
        getRegionList: function() {
            return $http({
                method: "GET",
                url: static_url + "/enterprises/" + localStorage.enterpriseUid + "/available/regions"
            });
        },
        getStorage: function(headers){
            return $http({
                method: "GET",
                url: static_url + "/storage/list"
            })
        },
        transferImage: function(params) {
            return $http({
                method:"POST",
                url: static_url + "/transferImage2SharedStorage/" + params.regionKey,
                data: params
            });
        },
    };
}]);