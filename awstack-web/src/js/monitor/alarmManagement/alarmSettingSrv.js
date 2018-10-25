var alarmSettingSrvModule = angular.module("alarmSettingSrvModule", []);
alarmSettingSrvModule.service("alarmSettingSrv", function($rootScope, $http) {
    var static_url = "/awstack-monitor/v1";
    return {
        getAlarmSettings:function(){
            return $http({
                method:"GET",
                url:static_url+"/alarms"
            });
        },
        getNodes:function(){
            return $http({
                method: "GET",
                url: "/awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/nodes/list"
            });
        },
        TubePhyHost:function(options){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/TubePhyHost"
            });
        },
        getVmHost:function(options){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/projectservers",
                headers: {
                    "domain_id":options.domainUid,
                    "domain_name":encodeURI(options.domainName),
                    "project_id":options.projectUid,
                    "project_name":encodeURI(options.projectName)
                }
            });
        },
        getAllProjects:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/user/projects"
            });
        },
        createAlarm:function(options){
            return $http({
                method:"POST",
                url:static_url+"/alarms",
                data:options 
            });
        },
        editAlarm:function(options){
            return $http({
                method:"PUT",
                url:static_url+"/alarms/"+options.id,
                data:options.data 
            });
        },
        copyAlarm:function(options){
            return $http({
                method:"POST",
                url:static_url+"/alarms",
                data:options     
            }); 
        },
        enableAlarm:function(options){
            return $http({
                method:"PUT",
                url:static_url+"/alarms/"+options.id+"/"+options.states
            });
        },
        multiAlarm:function(options){
            return $http({
                method:"PUT",
                url: static_url+"/multialarm/"+options.states,
                params:options.ids
            })
        },
        delAlarm:function(options){
            return $http({
                method:"DELETE",
                url:static_url+"/alarms/",
                params:options
            });
        },
        getHardwareMonitirItems:function(options){
            return $http({
                method:"GET",
                url:static_url+"/meters/hardware"
            });
        },
        getOperators:function(options){
            return $http({
                method:"GET",
                url:"/awstack-monitor"+"/alarms_conditions/operators"
            });
        },
        getAllNode: function(regionUides) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+regionUides+"/nodes/list"
            });
        },
    };
});