var tableService = angular.module("cloudSrv", []);
tableService.service("cloudSrv", function($rootScope, $http) {
    var static_url = "/awstack-user/v1/enterprises/";
    var static_dict_url = "/awstack-user/v1/";
    return {
        getClusterTableData: function() {
            return $http({
                method: "get",
                url: static_url + localStorage.enterpriseUid + "/regions"
            });
        },
        createRegion: function(options) {
            return $http({
                method: "post",
                url: static_url + localStorage.enterpriseUid + "/regions",
                data: options
            });
        },
        // getAllDict:function(){
        //  return $http({
        //      method :"get",
        //      url:static_dict_url
        //  })
        // },

        getDictData: function(options) {
            return $http({
                method: "get",
                url: static_dict_url + "dictvalues/" + options + "/datas"
            });
        },



        //查找某企业下的所有公有云配置 dict_value 固定为3
        getDictDataByEidAndDid: function() {
            return $http({
                method: "get",
                url: static_dict_url + "params",
                params:{
                    parentId:3,
                    enterpriseUid:localStorage.enterpriseUid,
                    regionUid:angular.fromJson(localStorage.$LOGINDATA).regionUid
                }

            });
        },
        addPublicCloud: function(cloudname, data) {
            return $http({
                method: "post",
                url: static_dict_url + "params/" + cloudname,
                data: data
            });
        },
        updateCloud: function(options) {
            return $http({
                method: "put",
                url: static_dict_url + "params" ,
                data: options
            });
        },
        updateEnterpriseSupportPublicClouds: function(options) {
            return $http({
                method: "put",
                url: static_url + localStorage.enterpriseUid + "/clouds/",
                data: options
            });
        },
        getSSLThumbprint: function(options) {
            return $http({
                method: "GET",
                url: "/awstack-vmware/v1/sslThumbprint",
                params: options
            })
        }
    };
});
