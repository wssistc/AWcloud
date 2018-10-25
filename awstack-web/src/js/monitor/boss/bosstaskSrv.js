var tableService = angular.module("bosstaskSrv", []);
tableService.service("bosstaskSrv", function($rootScope, $http) {

	// var static_url = "http://192.168.138.134:8080/awstack-user/v1/quotas";
    var static_url = "http://192.168.138.134:9080/awstack-user/v1/dictionarys/dictvalues/7/datas";
    var static_url_post = "http://192.168.138.134:9080/awstack-user/v1/dictionarys/7/datas";
    var static_url_base = "http://192.168.138.134:9080/awstack-user/v1";
    var enterpriseUid = localStorage.enterpriseUid;
    return {
        getMonitor: function() {
            return $http({
                method: "get",
                url: static_url
            });
        },
        updataMonitor: function(options) {
            return $http({
                method: "put",
                url: static_url_post + "/" + options.dataDsc,
                data: options
            });
        },
        createMonitor: function(options) {
            return $http({
                method: "post",
                url: static_url_post + "/" + options.dataDsc,
                data: options
            });
        },
        delMonitor: function(options) {
            return $http({
                method: "DELETE",
                url: static_url_post + "/" + options.dataDsc
            });
        },
        getRegion: function() {
            return $http({
                method: "get",
                url: static_url_base + "/enterprises/" + enterpriseUid + "/regions"
            });
        }
    };
});