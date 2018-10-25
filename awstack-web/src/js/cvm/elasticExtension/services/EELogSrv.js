EELogService.$inject=["$http"];
export function EELogService($http){
    let static_url_ass="/awstack-ass/v1.0/";
    return {
        getLogList:function(eeid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/activity/list?clusterIds='+eeid
            })
        },
        getLogDetail:function(logid){
            return $http({
                method:'get',
                url:static_url_ass+'cmp/activity/detail?id='+logid
            })
        }

    };
}