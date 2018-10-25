
export function physicalConductorMonitorSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        
        editPvm:function(nodeId,data){
            return $http({
                method: "PUT",
                url: static_url + "/ipmi/"+ localStorage.enterpriseUid +"/"+ nodeId +"/action",
                data:data
            });
        },
        getPvmInfo:function(nodeId){
            return $http({
                method: "GET",
                url: static_url + "/ipmi/" + localStorage.enterpriseUid +"/"+ nodeId +"/sdr",
            });
        },
        refreshStatus:function(nodeIds){
            return $http({
                method: "GET",
                url: static_url + "/ipmi/" + localStorage.enterpriseUid + "/" + "/refresh",
                params:nodeIds
            });
        }
    };
}

physicalConductorMonitorSrv.$inject = ["$http"];