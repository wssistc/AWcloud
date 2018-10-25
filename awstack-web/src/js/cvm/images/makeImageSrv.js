 var tableService = angular.module("makeImageSrvModule", []);
tableService.service("makeImageSrv", function($rootScope, $http) {
    var static_user_url = "awstack-user/v1";
    var static_resource_url = "awstack-resource/v1";
    return {
        getOSversion: function() {
            return $http({
                method: "get",
                url: static_user_url + "/params",
                params:{
                    parentId:26 
                }
            });       
        },
        getNetwork: function() {
            return $http({
                method: "get",
                url: static_resource_url + "/projectNetworks"
            });       
        },
        getImageDefs: function() {
            return $http({
                method: "get",
                url: static_resource_url + "/enterprises/"+localStorage.enterpriseUid+"/imagedefs"
            });       
        },
        createImage: function(data) {
            return $http({
                method: "post",
                url: static_resource_url + "/enterprises/"+localStorage.enterpriseUid+"/imagedef",
                data: data
            });
        },
        uploadImage: function(data) {
            return $http({
                method: "PUT",
                url:static_resource_url+"/enterprises/"+localStorage.enterpriseUid+"/uploadToImage",
                data:data
            });
        },
        updateImage: function(data) {
            return $http({
                method: "PUT",
                url:static_resource_url + "/enterprises/"+localStorage.enterpriseUid+"/imagedef",
                data:data
            });
        },
        delImage: function(data) {
            return $http({
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                url:static_resource_url + "/enterprises/"+localStorage.enterpriseUid+"/imagedef",
                data:data
            });
        }
    };
});