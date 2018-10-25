var tableService = angular.module("paasSrv", []);
tableService.service("paasSrv", function($rootScope, $http) {
    var static_url = "/awstack-user/v1/enterprises/";
    var static_dict_url = "/awstack-user/v1/";
    return {
        getDictDataByEidAndDid: function() {
            return $http({
                method: "get",
                url: static_dict_url + "params",
                params:{
                    parentId:937,
                    enterpriseUid:localStorage.enterpriseUid,
                    regionUid:angular.fromJson(localStorage.$LOGINDATA).regionUid
                }

            });
        },
    };
});
