var networksSrvModule = angular.module("networksSrvModule", []);
networksSrvModule.service("networksSrv", function($rootScope, $http) {
    var static_url = "/awstack-resource/v1";
    return {
        //交换机
        getNetworksTableData: function() {
            return $http({
                method: "GET",
                url: static_url + "/listPrivateNetworks"
            });
        },
        projectNetworks:function(){
            return $http({
                method:"GET",
                url:"awstack-resource/v1/projectNetworks"
            });
        },
        createNetworks: function(regionKey,options) {
            return $http({
                method: "POST",
                url: static_url + "/networks/"+regionKey+"/createPrivateNetwork",
                data: options
            });
        },
        addSingleNetworks: function(regionKey,options,domainProject) {
            return $http({
                method: "POST",
                url: static_url + "/networks/"+regionKey+"/createPrivateNetwork",
                data: options,
                headers:{
                    'domain_id':domainProject.depart.selected.domainUid,
                    'domain_name':encodeURI(domainProject.depart.selected.domainName),
                    'project_id':domainProject.pro.selected.projectId,
                    'project_name':encodeURI(domainProject.pro.selected.projectName),
                }
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
        getNetworksDetail: function(options,headers) {
            return $http({
                method: "GET",
                url: static_url + "/networks/" + options,
                headers:headers
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
        getUsedVlan: function(headers) {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/vlanids/inuse",
                headers:headers
            });
        },
        getPrice:function(data){
            return $http({
                method: "POST",
                url: "/awstack-boss/newResourceCharge/queryBandwidthChargingAmount",
                data:data
            });
        },
        //获取物理网络
        getAvailablePhyNets:function(enterprisesId,regionKey,headers) {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/"+regionKey+"/"+enterprisesId+"/networks/availablePrivateNetwork",
                headers:headers
            });
        },
        getNetType:function(enterprisesId,regionKey,headers){
            return $http({
                method: "GET",
                url: "awstack-resource/v1/networkSetting/"+regionKey+"/"+enterprisesId+"/getPrivateNetworkType",
                headers:headers
            });
        },
        getSubnetDetail:function(subnetId){
            return $http({
                method: "get",
                url: static_url + "/network/subnets/"+subnetId,
            });
       },
        networksTableAllData: [],
        subnetsTableAllData: [],
        editData: {},
        selectedItemsData: []
    };
});