resourceSrv.$inject=["$http"];
export function resourceSrv($http){
    return {
        getCpuSeries:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'cpu'}
            })
        },
        getMemSeries:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'mem'}
            })
        },
        getDiskSeries:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'disk'}
            })
        },
        sqlQuery: function(sql) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v1/current/statistics/query",
                data: sql
            });
        },
        getCurRegNodeList: function() {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/nodes/list"
            });
        },
        getSystemserverscount:function(){
            return $http({
                method: "get",
                url: "awstack-resource/v1/systemserverscount"
            });
        },
        getSysinfo:function(){
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains/projects/sysinfos"
            });
            
        },
        isHealthAction:function (options,regionUid) {
            return $http({
                method: "GET",
                url: "awstack-user/v1/enterprises/"+ localStorage.enterpriseUid+"/regions/"+regionUid+"/nodes/health",
                params: options
            });
        },
        phycpuTop :function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/statistics/regions/"+localStorage.regionKey+"/physicalhosts/topncpus",
            });
        },
        vmcpuTop:function(){
            return $http({
                method: "GET",
                url: "/awstack-monitor/v1/statistics/regions/" + localStorage.regionKey +"/virtualhosts",
            });
        },
        getOshypervisorsStatistics:function(){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/os-hypervisors/statics"
            })
        },
        getConfigValues:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/regions/"+localStorage.regionKey+"/configs?configName=cpu_allocation_ratio&configName=ram_allocation_ratio&configName=disk_allocation_ratio",
            })
        },
        getStorage:function(){
            return $http({
				method: "GET",
                url: "/awstack-user/v1/storage/list",
			})
        },
        getalloData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/enterprises/"+localStorage.enterpriseUid+"/configs?configName=cpu_allocation_ratio&configName=ram_allocation_ratio&configName=disk_allocation_ratio",
            })
        },
        getCpuMemData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/os-hypervisors/statics",
            })
        },
        getStoData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/storage/list",
            })
        },
        checkToken:function(){
            return $http({
				method: "GET",
                url: "/awstack-user/back/v1/user/token/check",
			})
        },
        getToken:function(){
            return $http({
				method: "GET",
                url: "/awstack-user/back/v1/user/token",
			})
        }
    };
}