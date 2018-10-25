var  routerMonitorSrv= angular.module("routerMonitorSrv",[]);
routerMonitorSrv.service("routerMonitorSrv", function ($http) {
    var static_url = "awstack-monitor/v1";
    return {
        getDatas: function() {
            return $http({
                method: "get",
                url: static_url + "/serviceList"
            });
        }
    };
});