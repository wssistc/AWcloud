var viewSrvModule = angular.module("viewSrv", []);
viewSrvModule.service("viewSrv", function($rootScope, $http) {
    var static_url = "http://192.168.138.134:9080/awstack-monitor/v1";
    return {
        //获取告警物理服务器以及虚拟机数量
        nodeCounts: function() {
            return $http({
                method: "GET",
                url: static_url + "/alarmEvents/nodecounts?status=new"
            });
        },

        //获取物理机cpu使用top5
        phyTop: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/statistics/regions/" + options + "/physicalhosts/topncpus"
            });
        },

        //获取虚拟机cpu使用top5
        virtualTop: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/statistics/regions/" + options + "/virtualhosts"
            });
        },

        //历史数据监控(目前写死，以后需要修改)
        getHistoryDetail: function(options) {
            return $http({
                method: "get",
                // url: static_url + "/history/statistics/query",
                // data:options
                url: static_url + "/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params: options
            });
        },
        // 2.6.1新UI改造
        getHistoryDetailNew: function(options) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v2/history/resource/allocation",
                data: options
            });
        },
        getInsInfo:function(){
            return $http({
                method:"GET",
                // url:"/awstack-resource/v1/servers"
                url:"/awstack-resource/v1/users/servers"
            });
        }

    };
});
