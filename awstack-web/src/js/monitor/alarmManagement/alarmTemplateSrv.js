var alarmTmplSrvModule = angular.module("alarmTmplSrvModule", []);
alarmTmplSrvModule.service("alarmTemplateSrv", function($rootScope, $http) {
    var static_url = "/awstack-monitor/v1";
    return {
        getAlarmTmpls:function(options){
            return $http({
                method:"GET",
                url:static_url+"/alarmTemps",
                params:options
            });
        },
        addAlarmTmpl:function(options){
            return $http({
                method:"POST",
                url:static_url+"/alarmTemps",
                data:options
            });
        },
        editAlarmTmpl:function(options){
            return $http({
                method:"PUT",
                url:static_url+"/alarmTemps/"+options.id,
                data:options.data
            });
        },
        delAlarmTmpl:function(options){
            return $http({
                method:"DELETE",
                url:static_url+"/alarmTemps",
                params:options
            });
        },
        getTmplRules:function(options){
            return $http({
                method:"GET",
                url:static_url+"/temps/"+options+"/rules"

            });
        },
        delTmplRule:function(options){
            return $http({
                method:"DELETE",
                url:static_url+"/alarmRules/"+options
            });
        },
        getTmplRulesName:function(options){
            return $http({
                method:"GET",
                url:static_url+"/meters/"+options
            });
        },
        addTmplRules:function(options){
            return $http({
                method:"PUT",
                url:static_url+"/temps/"+options.tempId+"/rules",
                data:options.data
            });
        }
    };
});