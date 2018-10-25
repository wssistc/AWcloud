var vmHostSrvModule = angular.module("vmHostSrv",[]);
vmHostSrvModule.service("vmhostSrv", function ($rootScope, $http) {
    return {
        sqlQuery:function(options) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v1/current/statistics/query",
                data: options
            });
        }

    };
});