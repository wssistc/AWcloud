let securityGroupSrvModule = angular.module("securityGroupSrvModule", []);
securityGroupSrvModule.service("securityGroupSrv", ["$http", function($http) {
	var static_url = "/awstack-resource/v1";
    return {
        getFirewallTableData: function(headers) {
            return $http({
                method: "GET",
                headers:headers,
                url: static_url + "/security_groups"
            });
        },
        addFirewallAction: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/security_groups",
                data: options
            });
        },
        editFirewallAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "/security_groups",
                data: options
            });
        },
        delFirewallAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/security_groups",
                params: options
            });
        },
        getFirewallRuleDetail: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/security_groups/rule/" + options
            });
        },
        addFirewallRule: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/security_groups/rule",
                data: options
            });
        },
        firewallRuleRemove: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "/security_groups/rule",
                params: options
            });
        },
        getDomianQuota: function(options) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/quotas/",
                params: options
            });
        },
        getQuotaUsed: function(options,domainUid) {
            return $http({
                method: "get",
                url: "awstack-user/v1/projectsofquotas/" + domainUid,
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
        createSecurityGroups:function(options,headers){
            return $http({
                headers:headers,
                method: "post",
                url: "awstack-resource/v1/fast/security_groups",
                data: options
            });
        }

    };
}])