
var tasklistSrvModule = angular.module("tasklistSrvModule",[]);
tasklistSrvModule.service("tasklistSrv",["$http",function($http){
    var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1"
    
    return {
        queryTasklist:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/JobList",
                data: options
            })
        },
        //查询初始化任务详情
        getCdbInitInfo:function(options){ 
            return $http({
                method: "POST",
                url: static_url + "/cdb/GetCdbInitInfo",
                data: options
            })
        },
        //查询修改参数任务详情
        getCdbModifyParamsJobTask:function(options){ 
            return $http({
                method: "POST",
                url: static_url + "/cdb/GetCdbModifyParamsJobTask",
                data: options
            })
        },
        //查询回档任务详情
        getCdbRollbackJobTask:function(options){ 
            return $http({
                method: "POST",
                url: static_url + "/cdb/GetCdbRollbackJobTask",
                data: options
            })
        },
        //根据cdbID查询cdbName
        getInstanceName:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/instances",
                data:options
            })
        },
        //查询升级任务详情   只读实例升级和主实例升级
        getCdbUpgradeJobInfo:function(options){ 
            return $http({
                method: "POST",
                url: static_url + "/cdb/GetCdbUpgradeJobInfo",
                data: options
            })
        }
    }

}])
