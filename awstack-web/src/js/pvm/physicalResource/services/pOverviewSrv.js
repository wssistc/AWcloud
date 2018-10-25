
export function pOverviewSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        
        getProUserTableData: function(options) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/project/" +options+"/users",
            });
        },
        
        editPvm:function(nodeId,data){
            return $http({
                method: "PUT",
                url: static_url + "/ipmi/"+ localStorage.enterpriseUid +"/"+ nodeId +"/action",
                data:data
            });
        },
        getProRes:function(){
            return $http({
                method: "GET",
                url: static_url+"/physical/projectserverscount",
            });
        },
        getQuotasUsed: function(options) {
            return $http({
                method: "GET",
                url: "/awstack-user/v1/quotas_Usages",
                params:options
            });
        },
        getproQuotas:function(options){
            return $http({
                method: "GET",
                url: "/awstack-user/v1/quotas",
                params:options
            });
        }
    };
}

pOverviewSrv.$inject = ["$http"];