var overviewSrvModule = angular.module("overviewSrvModule", ["ngResource"]);
overviewSrvModule.service("overviewSrv", ["$rootScope", "$http",function($rootScope, $http) {
    var static_url = "/awstack-user/v1/enterprises/" + localStorage.enterpriseUid;
    return {
        getalarmEvents:function(){
            return $http({
                method:"GET",
                url:"/awstack-monitor/v1/alarmEvents/?status=new"
            });
        },
        getDomainIns:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/usageofdomainquotas/"+localStorage.enterpriseUid
            });
        },
        getDomainProTotal:function(){
            return $http({
                method:"GET",
                url:static_url+"/domains/projects/sysinfos"
            });
        },
        getHostInfo:function(){
            return $http({
                method:"GET",
                url:static_url+"/nodes/sysinfos"
            });
        },
        //获取已分配配额（已使用）
        getAllocatedQuatas:function(options){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/domainsofquotas/"+localStorage.enterpriseUid,
                params:options //{type:"domian_quota"}
            });
        },
        //获取物理主机
        getNodes:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+localStorage.enterpriseUid + "/nodes"
            });
        },
        //获取每个物理主机下虚拟机个数
        getNodeInsNum:function(options){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/serverscount/",
                params:options
            });
        },
        getUsageOfDomainQuotas:function(options){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/usageofdomainquotas/"+localStorage.enterpriseUid,
                params:options
            });
        },
        getDictValues:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/dictionarys/dictvalues/24/enterprises/0/datas"
            });
        },
        getConfigValues:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/regions/"+localStorage.regionKey+"/configs?configName=cpu_allocation_ratio&configName=ram_allocation_ratio&configName=disk_allocation_ratio",
            })
        },
        getOshypervisorsStatistics:function(){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/os-hypervisors/statics"
            })
        },
        //获取各资源池的使用情况
        getPoolsDetail:function(){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/scheduler-stats/get_pools"
            })
        },
        //获取云主机状态
        // getVmStatus:function(){
        //     return $http({
        //         method:"GET",
        //         url:"/awstack-resource/v1/systemserverscount"
        //     })
        // },
        getVmStatus:function(){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/region/serverscount"
            })
        },
        //获取region下资源情况
        getRegionStatus:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains/projects/sysinfos"
            })
        },
        //获取region下云主机情况
        getRegionVm:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/system/serverscount"
            })
        },
        //获取region下物理主机情况
        getRegionPhy:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/system/physical/serverscount"
            })
        },
        //获取region下网络情况
        getExternalNetworks:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/getExternalNetworks"
            })
        },
        getVlanData:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/system/vlanids/inuse"
            })
        },
        //获取region
        getRegions:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions"
            })
        },
        //折线图
        getCpuFold:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'cpu'}
            })
        },
        getMenFold:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'mem'}
            })
        },
        getStoFold:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'disk'}
            })
        },
        getNetFold:function(){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/system/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:'floatingip'}
            })
        },
        getVlanFold:function(type){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/history/enterprise/"+localStorage.enterpriseUid+"/query",
                params:{enterpriseUid:localStorage.enterpriseUid,resourceName:type}
            })
        },
        getStoData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/storage/list",
            })
        },
        getIpData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/getExternalNetworks",
            })
        },
        getCpuMemData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/os-hypervisors/statics",
            })
        },
        getalloData:function(){
            return $http({
                method: "GET",
                url: "awstack-user/v1/system/enterprises/"+localStorage.enterpriseUid+"/configs?configName=cpu_allocation_ratio&configName=ram_allocation_ratio&configName=disk_allocation_ratio",
            })
        },
        changeRegion:function(data){
            return $http({
                method: "post",
                url: "/awstack-user/v1/newregion",
                data:data
            })
        },
        getVlanType:function(){
            return $http({
                method: "get",
                url: "awstack-resource/v1/networkSetting/"+localStorage.regionKey+"/"+localStorage.enterpriseUid+"/getPrivateNetworkType"
            })
        }
    };
}]);
