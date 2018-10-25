var  tableService= angular.module("serviceMonitorSrv",[]);
tableService.service("serviceMonitorSrv", function ($rootScope, $http) {
    // var static_url = "http://192.168.138.134:8080/awstack-user/v1/quotas";
    var static_url = "http://192.168.138.134:9080/awstack-monitor/v1";
    return {
        getDatas: function() {
            return $http({
                method: "get",
                url: static_url + "/serviceList"
            });
        },

        mysqlData: function(options) {
            return $http({
                method: "get",
                url: static_url + "/statistics/regions/" + options + "/mysqls/hostinfos"
            });
        },

        memcachedData: function(options) {
            return $http({
                method: "get",
                url: static_url + "/statistics/regions/" + options + "/memcacheds/hostinfos"
            });
        },

        rabbitmqData: function(options) {
            return $http({
                method: "get",
                url: static_url + "/statistics/regions/" + options + "/mqs/hostinfos"
            });
        }

    };
});