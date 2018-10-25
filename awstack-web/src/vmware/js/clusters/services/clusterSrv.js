
export function clusterSrv($http){
    var static_url = "/awstack-vmware/v1"
    return {
        getClusterList: function() {
            return $http({
                method: "get",
                url:static_url + "/clusters"
            });
        },
        getClusterListByDCName:function(options){
            return $http({
                method:"GET",
                url:static_url + "/datacenter/clusters",
                params:options
            })
        },
        testSrv:function(){
        	return ["testclusterSrv"];
        }
    };
}

clusterSrv.$inject = ["$http"];