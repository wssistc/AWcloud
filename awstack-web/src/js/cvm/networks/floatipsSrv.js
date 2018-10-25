var floatipsSrvModule = angular.module("floatipsSrvModule", []);
floatipsSrvModule.service("floatipsSrv", function($rootScope, $http) {
    var static_url = "awstack-resource/v1/floating_ips";
    return {
        getFloatipsTableData: function() {
            return $http({
                method: "get",
                url: static_url
            });
        },
        addFloatipAction: function(options) {
            return $http({
                method: "POST",
                url: static_url,
                data: options
            });
        },
        getInstanceInfo: function(options) {
            return $http({
                method: "get",
                url: "awstack-resource/v1/projects/" + options + "/instanceIPs"
            });
        },
        bindFloatipAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/association",
                data: options
            });
        },
        unBindFloatipAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/disassociation",
                data: options
            });
        },
        delFloatipAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url,
                data: options
            });
        },
        getPrice:function(data){
            return $http({
                method: "POST",
                url: "/awstack-boss/newResourceCharge/queryFloatingIpChargingAmount",
                data:data
            })
        },
        floatipsTableAllData: [],
        editData: {},
        selected_items: [],
        selectedItemsData: []
    };
});