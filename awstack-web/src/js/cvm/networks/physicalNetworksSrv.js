var physicalNetworksSrvModule = angular.module("physicalNetworksSrvModule", []);
physicalNetworksSrvModule.service("physicalNetworksSrv", function($rootScope, $http) {
    var static_url = "/awstack-resource/v1";
    return {
        //交换机
        getNetworksTableData: function() {
            return $http({
                method: "GET",
                url: static_url + "/getExternalNetworks"
            });
        },
        createNetworks: function(regionKey,options) {
            return $http({
                method: "POST",
                url: static_url + "/networks/"+regionKey+"/createExternalNetwork",
                data: options
            });
        },
        addNetworkAction: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/networks",
                data: options
            });
        },
        addProjectNetworkAction: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/projectNetworks",
                data: options
            });
        },
        editNetworkAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/networks/" + options.network_id,
                data: options.network_name
            });
        },
        delNetworkAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/networks",
                data: options
            });
        },
        getNetworksDetail: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/networks/" + options
            });
        },
        getNetworksSubnet: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/network/" + options+"/getExternalNetWorkSubnet"
            });
        },
        //子网
        getSubnetsTableData: function() {
            return $http({
                method: "GET",
                url: static_url + "/subnets"
            });
        },
        addSubnetAction: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/subnets",
                data: options
            });
        },
        editSubnetAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/subnets/" + options.subnet_id,
                data: options.subnet
            });
        },
        delSubnetAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/subnets",
                data: options
            });
        },
        getDomianQuota: function(options) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/quotas/",
                params: options
            });
        },
        getQuotaUsed: function(options) {
            return $http({
                method: "get",
                url: "awstack-user/v1/projectsofquotas/" + localStorage.domainUid,
                params: options
            });
        },
        getProQuotasUsages: function(options) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/quotas_Usages/",
                params: options
            });
        },
        getRegionInfo: function(options) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/enterprises/" + options + "/regions"
            });
        },
        getUsedVlan: function() {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/vlanids/inuse"
            });
        },
        getPhyNetworks: function(regionKey,enterpriseUid) {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/"+regionKey+"/"+enterpriseUid+"/networks/availableExternalNetwork"
            });
        },

        networksTableAllData: [],
        subnetsTableAllData: [],
        editData: {},
        selectedItemsData: []
    };
});