var  rabbitmqSrv= angular.module("rabbitmqSrv",[]);
rabbitmqSrv.service("rabbitmqSrv", function ($http) {
    return {
        sqlQuery:function(options) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v1/current/statistics/query",
                data: options
            });
        },
        getRabbitmqBasicData:function(options){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/"+options+"/rabbitmq/basic"
            })
        },
        getRabbitmqNodesData:function(options){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/"+options+"/rabbitmq/nodes"
            })
        }
    };
});