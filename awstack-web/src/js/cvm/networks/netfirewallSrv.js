var netfirewallSrvModule = angular.module("netfirewallSrvModule", []);
netfirewallSrvModule.service("netfirewallSrv", function($http) {
    var static_url = "/awstack-resource/v1";
    return {
        //firewall
        getFirewallList: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/firewall/listFirewall"
            })
        },
        addFirewall: function(data) {
            return $http({
                method: "POST",
                url: static_url + "/firewall/addFirewall",
                data: data
            })
        },
        updateFirewall: function(id,data) {
            return $http({
                method: "PUT",
                url: static_url + "/firewall/" + id + "/updateFirewall",
                data: data
            })
        },
        deleteFirewall: function(data) {
            return $http({
                method: "DELETE",
                url: static_url + "/firewall/deleteFirewall",
                data: data
            })
        },
        getFirewallDetails: function(id) {
            return $http({
                method: "GET",
                url: static_url + "/firewall/" + id + "/getFirewallDetail"
            })
        },
        //firewallrule
        getFirewallRuleList: function(firewallid) {
            return $http({
                method: "GET",
                url: static_url + "/firewall/" + firewallid + "/listFirewallRule"
            })
        },
        // 新建
        createFirewallRule: function(firewallPolicyId,data) {
            return $http({
                method: "POST",
                url: static_url + "/firewall/" + firewallPolicyId + "/addFirewallRule",
                data:data
            })
        },
        // 启用
        enableFirewallRule: function(data) {
            return $http({
                method: "PUT",
                url: static_url + "/firewall/enableFirewallRule",
                data: data
            })
        },
        // 禁用
        disableFirewallRule: function(data) {
            return $http({
                method: "PUT",
                url: static_url + "/firewall/disableFirewallRule",
                data: data
            })
        },
        // 删除
        deleteFirewallRule: function(data,id) {
            return $http({
                method: "DELETE",
                url: static_url + "/firewall/" + id + "/deleteFirewallRule",
                data: data
            });
        },
        associateRouter: function(firewallid,data) {
            return $http({
                method: "PUT",
                url: static_url + "/firewall/" + firewallid + "/updateFirewall",
                data: data
            });
        },
        getRouterOfFireWall:function(firewallid){
            return $http({
                method: "GET",
                url: static_url + "/firewall/" + firewallid + "/listRouterByFirewallid"
            });
        },
        getUnrelateRouterOfFireWall:function(firewallid){
            return $http({
                method: "GET",
                url: static_url + "/firewall/listUnusedRouter"
            });
        },
        getStatus:function(data){
            return $http({
                method: "PUT",
                url: static_url + "/firewall/askFirewallStatus",
                data:data
            });
        }
    };
});