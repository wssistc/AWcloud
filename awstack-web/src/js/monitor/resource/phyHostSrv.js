var phyHostSrvModule = angular.module("phyHostSrv", []);
phyHostSrvModule.service("phyhostSrv", function($rootScope, $http) {
    return {
        sqlQuery: function(options) {
            return $http({
                method: "POST",
                url: "awstack-monitor/v1/current/statistics/query",
                data: options
            });
        },
        chartQuery:function(options){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/projects/awstack/dataviews/chart",
                params:options
            })
        },
        //
        chartQueryTest:function(options){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/projects/awstack/dataviews/chart",
                params:options
            })
        },
        getInstancesList:function(){
            return $http({
                method:"GET",
                url:"awstack-monitor/v1/projects/awstack/regions/"+localStorage.regionKey+"/tsdb/clustername"
            })
        },
        getIpmi: function(regionKey, node_id) {
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/current/ipmi/" + regionKey + "/" + node_id
            });
        },

        // 物理机磁盘分区
        getDiskPartition: function(regionKey, node_id) {
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/current/diskPartition/" + regionKey + "/" + node_id
            });
        },

        // 获取磁盘分区（物理机、虚拟机通用）
        getHostDiskPartition: function(regionKey, host_id) {
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/projects/awstack/regions/"+regionKey+"/hosts/"+host_id+"/disks/partitions",
                params:{
                    exclude_file_system_types:"rootfs,CDFS"
                }
            });
        },
        // 获取主机网卡
        getHostNetcard: function(regionKey, host_id) {
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/projects/awstack/regions/"+regionKey+"/hosts/"+host_id+"/nics"
            });
        },
        // 
        getHostdisk: function(regionKey, host_id) {
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/projects/awstack/regions/"+regionKey+"/hosts/"+host_id+"/disks"
            });
        },
        getDiskPartitionTube: function(regionKey, node_id) {
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/current/diskPartition/" + regionKey + "/tube/" + node_id
            });
        },
        processCpu:function(options,node_id){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/physical/process/cpu/"+node_id
            });
        },
        processCpuTube:function(options,node_id){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/physical/process/cpu/tube/"+node_id
            });
        },
        processMem:function(options,node_id){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/physical/process/mem/"+node_id
            });
        },
        processMemTube:function(options,node_id){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/physical/process/mem/tube/"+node_id
            });
        },
        processDetail:function(options,node_id){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/physical/process/detail/"+node_id
            });
        },
        processDetailTube:function(options,node_id){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/physical/process/detail/tube/"+node_id
            });
        },
        TubePhyHost:function(options){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/"+options+"/TubePhyHost"
            });
        },
        // 资源池物理机（非受限）
        getIronicNodes: function() {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/ironic/nodes"
            });
        },
        // 纳管物理机（受限）
        getIpmiNodes: function() {
            return $http({
                method: "GET",
                url:"awstack-resource/v1/ipmi/nodes"
            });
        },
        //物理机资源池
        getResPoolPhyNodes: function() {
            return $http({
                method: "GET",
                url: "awstack-resource/v1/physical/servers"
            });
        },
        getPhyMem:function(options){
            return $http({
                method: "GET",
                url: "awstack-monitor/v1/regions/"+options.regionKey+"/hosts/"+options.hostId+"/memories/last "
            })
        },
        TubehostList:[],
        zonehosts:[],
        queryLimit:{}
        
    };
});
