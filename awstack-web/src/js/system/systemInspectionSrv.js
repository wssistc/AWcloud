angular.module("systemInspectionSrvModule", [])
    .service("systemInspectionSrv", function ($http) {
        return {
            //获取检查项接口
            getCheckList:function(){
                return $http({
                    method: "GET",
                    url: "awstack-monitor/api/awstack/check_groups?item_enable=true",
                });
            },
            getCheckItemResult:function(regionKey,options){
                return $http({
                    method: "POST",
                    url: "awstack-monitor/api/regions/"+regionKey+"/system_check_tasks",
                    data:options
                });
            },
            stopCheck:function(regionKey,tasckId){
                return $http({
                    method: "DELETE",
                    url: "awstack-monitor/api/regions/"+regionKey+"/system_check_tasks/"+tasckId,
                });
            },
            getSystemcheckStatus:function(regionKey){
                return $http({
                    method: "GET",
                    url: "awstack-monitor/api/regions/"+regionKey+"/system_check_tasks/result",
                }); 
            },
            getLastSystemCheckResult:function(regionKey,tasckId){
                return $http({
                    method: "GET",
                    url: "awstack-monitor/api/regions/"+regionKey+"/system_check_tasks/"+tasckId+"/details",
                }); 
            },
        };
    });
