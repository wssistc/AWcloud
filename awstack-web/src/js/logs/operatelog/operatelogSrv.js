var tableService = angular.module("operatelogSrv", []);
tableService.service("operatelogSrv", ["$http", "$rootScope", function($http) {
    var static_url = "awstack-log/v1/enterprises/" + localStorage.enterpriseUid + "/logs/sqls";
    return {
        getoperateLogsData: function(options) {
            return $http({
                method: "POST",
                url: "awstack-log/v1/enterprises/" + localStorage.enterpriseUid + "/logs/sqls",
                data: options
            });
        },
        deleteLogsData:function(options){
            return $http({
                method: "DELETE",
                url:"awstack-log/v1/enterprises/" + localStorage.enterpriseUid+"/deletelogs",
                params: options
            });
        }
    };
}]);