alarmService.$inject=["$http"];
export function alarmService($http){
    let static_url_resource="/awstack-resource/v1/";
    let static_url_ass="/awstack-ass/v1.0/";
    return {
        getAlarms:function(loadbalancerId){
            return $http({
                method:'get',
                url:static_url_resource+'lbaas/loadbalancers/'+loadbalancerId
            })
        }

    };
}