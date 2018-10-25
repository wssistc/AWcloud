var tableService = angular.module("policySrv", []);
tableService.service("policySrv", function($rootScope, $http) {
    var static_monitor_url="awstack-monitor/v1/";
    var static_resource_url="awstack-resource/v1/"
    return {
        getPolicy: function() {
            return $http({
                method: "get",
                url: static_resource_url + "scalePolicies"
            });       
        },
        createPolicy: function(data) {
            return $http({
                method: "post",
                url: static_resource_url + "scalePolicies",
                data: data
            });
        },
        delPolicy: function(params) {
            return $http({
                method: "DELETE",
                url: static_resource_url + "scalePolicies",
                params:params
            });
        }
    }
})