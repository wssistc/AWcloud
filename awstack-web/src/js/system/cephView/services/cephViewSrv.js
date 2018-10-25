
cephViewSrv.$inject = ["$http"];
export function cephViewSrv($http){
    return{
        getCephList:function(){
            return $http({
                method: "GET",
                url: "/awstack-user/v1/region/"+ localStorage.regionKey+"/ceph",
            });
        },
        rebootOSD:function(options){
            return $http({
                method: "PUT",
                url: "/awstack-user/v1/region/"+ localStorage.regionKey+"/node/"+options.nodeName+"/osd/"+options.osdNum,
            });
        },
        getCephTasks:function(){
            return $http({
                method: "GET",
                url:  "/awstack-schedule/v1/ceph/jobs?regionKey="+localStorage.regionKey
            });
        },
        delTasks:function(ids){
            return $http({
                method: "DELETE",
                url:  "/awstack-schedule/v1/ceph/jobs",
                params:ids
            });
        },
        balanceData:function(data){
            return $http({
                method: "POST",
                url:  "/awstack-schedule/v1/ceph/jobs",
                data:data
            });
        },
        delMissOSD:function(data){
            return $http({
                method: "DELETE",
                url:  "/awstack-user/v1/region/"+localStorage.regionKey + "/node/" + data.nodeName+"/osd/"+data.osdNum,
            });
        },
        getPGstatus:function(){
            return $http({
                method: "GET",
                url:  "/awstack-schedule/v1/ceph/check/pgstatus",
            });
        }
    }

}