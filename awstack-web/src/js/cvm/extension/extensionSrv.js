var tableService = angular.module("extensionSrv", []);
tableService.service("extensionSrv", function($rootScope, $http) {
    var static_monitor_url="awstack-monitor/v1/";
    var static_resource_url="awstack-resource/v1/"
    return {
        getAlarmTemps: function() {
            return $http({
                method: "get",
                url: static_monitor_url + "alarmTemps"
            });
        },
        createExtension: function(data) {
            return $http({
                method: "post",
                url: static_resource_url + "scaleclusters",
                data: data
            });
        },
        getScaleClusters: function() {
            return $http({
                method: "get",
                url: static_resource_url + "scaleclusters"
            });
        },
        getClusterDetail: function(id) {
            return $http({
                method: "get",
                url: static_resource_url + "scaleclusters/"+id
            });
        },
        getInsDetail: function(id) {
            return $http({
                method: "get",
                url: "awstack-resource/auto-scaling-clusters/"+id+"/servers"
            });
        },
        getLBDetail: function(id) {
            return $http({
                method: "get",
                url: static_resource_url + "scalecluster/"+id+"/lb"
            });
        },
        getScaleRules: function(id) {
            return $http({
                method: "get",
                url: static_resource_url +id+"/scaleRules"
            });
        },
        getAlarmEventProcessDetail: function(clusterId) {
                return $http({
                    method: "get",
                    url: static_resource_url + "scaleAlarmEventProcesses/" + clusterId
                });
        },
        delCluster: function(id) {
            return $http({
                method: "DELETE",
                url: static_resource_url + "scaleclusters/" + id
            });
        },
        delClusters: function(params) {
            return $http({
                method: "DELETE",
                url: static_resource_url + "scaleclusters",
                params:params
            });
        },
        getKeyPairs: function() {
            return $http({
                method: "GET",
                url: static_resource_url + "/os-keypairs"
            });
        },
        addInstanses:function(clusterId,options){
            return $http({
                method: "POST",
                url: "awstack-resource/auto-scaling-clusters/"+clusterId+"/scaling-tasks",
                data:options
            });
        },
        addInstansesTiming:function(clusterId,options){
            return $http({
                method: "POST",
                url: "awstack-resource/auto-scaling-clusters/"+clusterId+"/timing-scaling-tasks",
                data:options
            });
        },
        getClusterDetailOfAddIns: function(clusterId) {
            return $http({
                method: "get",
                url: "awstack-resource/auto-scaling-clusters/"+clusterId
            });
        },
    }
})