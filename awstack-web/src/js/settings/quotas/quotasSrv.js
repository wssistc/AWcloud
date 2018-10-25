var tableService = angular.module("quotaSrv", []);
tableService.service("quotaSrv", function($rootScope, $http) {
    var static_url = "awstack-user/v1/quotas";
    return {
        getQuotasList: function(type) {
            return $http({
                method: "get",
                url: static_url + "/default/" + localStorage.enterpriseUid + "?type=" + type
            });
        },
        updataQuota: function(options) {
            return $http({
                method: "put",
                url: static_url + "/default",
                data: options
            });
        }
    };
});
