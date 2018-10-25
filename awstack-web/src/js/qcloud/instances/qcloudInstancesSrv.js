var tableService = angular.module("qcloudInstancesSrv",[]);
tableService.service("qcloudInstancesSrv", function($rootScope,$http,backendSrv){
  return {
    getData:function(options){
        return backendSrv.get("awstack-qcloud/v1/qcloud/instances/",options);
    },
    getServerDetail:function(options){
        return backendSrv.get("awstack-qcloud/v1/qcloud/instance/" + options);
    },
    startServer:function(options){
        return backendSrv.post("awstack-qcloud/v1/qcloud/instances/StartInstances",options);
    },
    stopServer:function(options){
        return backendSrv.post("awstack-qcloud/v1/qcloud/instances/StopInstances",options);
    },
    rebootServer:function(options){
        return backendSrv.post("awstack-qcloud/v1/qcloud/instances/RestartInstances",options);
    },
    editServer:function(options){
        return backendSrv.post("awstack-qcloud/v1/qcloud/instances/ModifyInstanceAttributes",options);
    },
    getAllfloalingIp:function(){
        return backendSrv.get("awstack-qcloud/v1/qcloud/eips/");
    },
    getImages:function(options){
        return backendSrv.get("awstack-qcloud/v1/qcloud/images/" + options);
    }
  };
});
