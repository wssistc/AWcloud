var tableService = angular.module("cephSrv", []);
tableService.service("cephSrv", function($rootScope, $http) {
    var static_url = "http://192.168.138.134:9080/awstack-resource/v1/ceph";
    return {
        //获取PG状态
        getPgStatus: function() {
            return $http({
                method: "GET",
                url: static_url + "/pgStatus"
            });
        },

        //获取磁盘使用状态
        getDiskUsage: function() {
            return $http({
                method: "GET",
                url: static_url + "/diskUsage"
            });
        },

        //获取monitor状态
        getMonitorStatus: function() {
            return $http({
                method: "GET",
                url: static_url + "/monitors"
            });
        },
        //获取monitor状态
        getCephStatus: function() {
            return $http({
                method: "GET",
                url: static_url + "/health"
            });
        },
        getCephWarnig: function() {
            return $http({
                method: "GET",
                url: static_url + "/warning"
            });
        },

        //获取pools表格数据
        getData: function() {
            return $http({
                method: "GET",
                url: static_url + "/pools"
            });
        },

        //获取osd表格数据
        getOsdData: function() {
            return $http({
                method: "GET",
                url: static_url + "/osd"
            });
        }

    };

});
