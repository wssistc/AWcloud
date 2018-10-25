EEService.$inject=["$http"];
export function EEService($http){
    let static_url_resource="/awstack-resource/v1/";
    let static_url_ass="/awstack-ass/v1.0/";
    return {
        getBalancersDetail:function(loadbalancerId){
            return $http({
                method:'get',
                url:static_url_resource+'lbaas/loadbalancers/'+loadbalancerId
            })
        },
        getBalancers:function(){
          return $http({
            method:'get',
            url:static_url_resource+'lbaas/loadbalancers'
          })
        },
        getListeners:function(options){
          return $http({
            method:'get',
            url: static_url_resource + 'lbaas/loadbalancers/' + options+ "/listeners"
          })
        },
        getStragegy:function(){
            return $http({
                method:'get',
                url: static_url_ass + "strategies"
            })
        },
        getSecurityGroups: function() {
            return $http({
                method: "GET",
                url: static_url_resource+"/security_groups"
            });
        },
        getFlavors: function() {
            return $http({
                method: "GET",
                url: static_url_resource+"/flavors"
            });
        },
        getNetworks: function() {
            return $http({
                method: "GET",
                url: static_url_resource + "/networks"
            });
        },
        getImages: function() {
            return $http({
                method: "GET",
                url: static_url_resource + "/images"
            });
        },
        getPools:function(loadbalancerId){
            return $http({
                method:'get',
                url: static_url_resource + 'lbaas/loadbalancers/' + loadbalancerId + "/pools"
           })
        },
        getHostList:function(eeid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/uhost/list?clusterIds='+eeid
            })
        },
        delhosts: function(ids) {
            return $http({
                method: "DELETE",
                url: static_url_ass + "uhosts",
                params: ids
            });
        },

    };
}