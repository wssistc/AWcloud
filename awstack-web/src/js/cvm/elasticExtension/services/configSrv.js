configService.$inject=["$http"];
export function configService($http){
    let static_url_ass="/awstack-ass/v1.0/";
    return {
        getConfigList:function(eeid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/config/list?solutionIds='+eeid
            })
        },
        getConfigDetail:function(configid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/config/detail?id='+configid
            })
        },
        createConfig:function(data){
            return $http({
                method:'post',
                url:static_url_ass+'configs',
                data:data
            })
        },
        updateConfig:function(id,data){
            return $http({
                method:'patch',
                url:static_url_ass+'configs/'+id,
                data:data
            })
        },
        delConfigs: function(ids) {
            return $http({
                method: "DELETE",
                url: static_url_ass + "configs",
                params: ids
            });
        },

    };
}