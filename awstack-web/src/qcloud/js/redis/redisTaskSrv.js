
var redisTaskSrvModule = angular.module("redisTaskSrvModule",[]);
redisTaskSrvModule.service("redisTaskSrv",["$http",function($http){
    var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1"
    
    return {
        queryRedisTask:function(options){
            return $http({
                method: "POST",
                url: static_url + "/crs/GetRedisTaskList",
                data: options
            })
        }
    }

}])
