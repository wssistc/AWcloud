var securityGroupSrvModule = angular.module("securityGroupSrvModule", []);
securityGroupSrvModule.service("securityGroupSrv", function($rootScope, $http) {
    var static_url = "/awstack-resource/v1";
    return {
        getFirewallTableData: function() {
            return $http({
                method: "GET",
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
        }
    };
});