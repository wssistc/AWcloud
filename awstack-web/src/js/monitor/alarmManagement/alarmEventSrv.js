var alarmEventSrvModule = angular.module("alarmEventSrvModule", []);
alarmEventSrvModule.service("alarmEventSrv", function($rootScope, $http) {
    var static_url = "/awstack-monitor/v1/alarmEvents/";
    return {
        getNewAlarm:function(options){
            return $http({
                method:"GET",
                url:static_url,
                params:options
            });
        },
        getOldAlarm:function(options){
            return $http({
                method:"GET",
                url:static_url,
                params:options
            });
        },
        alarmHandelDes:function(options){
            return $http({
                method:"PUT",
                url:static_url+options.id,
                data:options.data
            });
        },
        ignoreAlarm:function(options){
            return $http({
                method:"PUT",
                url:static_url+options.id,
                data:options.data
            });
        },
        getNewAlarmEventOfPro:function(options) {
            return $http({
                method:"GET",
                url:"/awstack-monitor/v1/alarmEventList",
                params:options
            });
        }
    };
});