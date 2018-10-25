clusterService.$inject=["$http"];
export function clusterService($http){
    let static_url_ass="/awstack-ass/v1.0/";
    return {
        getClusterList:function(eeid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/solution/list',
                data:eeid
            })
        },
        getClusterDetail:function(clusterid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/solution/detail?solutionId='+clusterid
            })
        },
        createCluster:function(data){
            return $http({
                method:'post',
                url:static_url_ass+'solutions',
                data:data
            })
        },
        updateCluster:function(id,data){
            return $http({
                method:'patch',
                url:static_url_ass+'solutions/'+id,
                data:data
            })
        },
        delClusters: function(ids) {
            return $http({
                method: "DELETE",
                url: static_url_ass + "solutions",
                params: ids
            });
        },

    };
}