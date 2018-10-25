var  mysqlSrv= angular.module("mysqlSrv",[]);
mysqlSrv.service("mysqlSrv", function ($http) {
    return {
        sqlQuery:function(options) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v1/current/statistics/query",
                data: options
            });
        },
        getMysqlBasicData:function(options){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/"+options+"/mysql/basic"
            })
        }
    };
});