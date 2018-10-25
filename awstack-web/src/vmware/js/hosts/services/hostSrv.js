
export function hostSrv($http){
    var static_url = "/awstack-vmware/v1"
    return {
        getHostList: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/hosts"
            });
        },
        getHostListByDCName: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/datacenter/hosts",
                params: options
            });
        },
        getHostListByClusterName: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/cluster/hosts",
                params: options
            });
        },
        testSrv:function(){
        	return ["testhostSrv"];
        }
    };
}

hostSrv.$inject = ["$http"];