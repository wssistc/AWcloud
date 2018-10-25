var loadBalanceSrvModule = angular.module("loadBalanceSrvModule", []);
loadBalanceSrvModule.service('loadBalanceSrv', ["$http", function($http) {
    var static_url = '/awstack-resource/v2/';
    // var static_url_v1 = '/awstack-resource/v1/';
    return {
        getBlanceTableData: function() {
            return $http({
                method: "GET",
                url: static_url + 'lbaas/loadbalancers'
            });
        },
        getsubnets:function(){
            return $http({
                method: 'GET',
                url: static_url + "subnets"
            });
        },
        createBalancer: function (options) {
            return $http({
                method: "POST",
                url: static_url + "lbaas/loadbalancers",
                data: options
            });
        },
        editBalancer: function (options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + options.id,
                data: options
            });
        },
        deleteBalance: function (options) {
            return $http({
                method: "DELETE",
                url: static_url + "lbaas/loadbalancers",
                params: options
            });
        },
        modifyBalanceStatus: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + options.id + "/" + options.status
            });
        },
        getBalanceDetail:function(loadbalancerId) {
            return $http({
                method:'GET',
                url:static_url + 'lbaas/loadbalancers/'+ loadbalancerId
            });
        },
        getListenerTableData:function(id) {
            return $http({
                method:'GET',
                url: static_url + 'lbaas/loadbalancers/' + id + "/listeners"
            });
        },
        createListener: function(loadbalancerId, options) {
            return $http({
                method: "POST",
                url: static_url + "lbaas/loadbalancers/" + loadbalancerId + "/listener",
                data: options
            });
        },
        editListener: function(loadbalancerId, listenerId, options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + loadbalancerId + "/listeners/" + listenerId,
                data: options
            });
        },
        modifyListenerStatus: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + options.lbId + "/listeners/" + options.lisId + "/" + options.status
            });
        },
        // deleteListener: function (loadBalancerId,ids) {
        //     return $http({
        //         method: "DELETE",
        //         url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/listeners",
        //         params: ids
        //     });
        // },
        deleteListener: function (loadBalancerId,options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/deleteListeners",
                data: options
            });
        },
        getListenerDetail: function(loadbalancerId, listenerId) {
            return $http({
                method: 'GET',
                url: static_url + "lbaas/loadbalancers/" + loadbalancerId +"/listeners/" + listenerId
            });
        },
        getMemberTableData: function(loadbalancerId, poolId) {
            return $http({
                method: "GET",
                url: static_url + "lbaas/loadbalancers/" + loadbalancerId + "/pools/" + poolId + "/members"
            });
        },
        createMember: function(loadbalancerId, poolId, options) {
            return $http({
                method: "POST",
                url: static_url + "lbaas/loadbalancers/" + loadbalancerId + "/pools/" + poolId + "/addMembers",
                data: options
            });
        },
        editMember: function(loadbalancerId, poolId, memberId, options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + loadbalancerId + "/pools/" + poolId + "/members/" + memberId,
                data: options
            });
        },
        modifyMemberStatus: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "lbaas/loadbalancers/" + options.lbId + "/pools/" + options.poolId + "/members/" + options.memId + "/" + options.status
            });
        },
        deleteMember: function (loadBalancerId, poolId, ids) {
            return $http({
                method: "DELETE",
                url: static_url + "lbaas/loadbalancers/" + loadBalancerId + "/pools/" + poolId + "/members",
                params: ids
            });
        },

        getBalanceAmount: function(data) {
            return $http({
                method: "POST",
                url: "/awstack-boss/newResourceCharge/queryLoadbalancerChargingAmount",
                data: data
            });
        }
    };
}]);
