var bandwidthSrvModule = angular.module("bandwidthSrvModule", []);
bandwidthSrvModule.service("bandwidthSrv", function($rootScope, $http) {
    var static_url = "/awstack-resource/v1/bandwidth";
    return {
        getBandwidthTableData: function() {
            return $http({
                method: "get",
                url: static_url
            });
        },
        editbandwidthAction: function(options) {
            return $http({
                method: "put",
                url: static_url+options.id,
                data: options.data
            });
        },
        bandwidthTableAllData: []
    };
});