var  memcachedSrv= angular.module("memcachedSrv",[]);
memcachedSrv.service("memcachedSrv", function ($http) {
    return {
        sqlQuery:function(options) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v1/current/statistics/query",
                data: options
            });
        },
        getMemcachedBasicInfo:function(options){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/"+options+"/memcached/node"
            })
        }
    };
});