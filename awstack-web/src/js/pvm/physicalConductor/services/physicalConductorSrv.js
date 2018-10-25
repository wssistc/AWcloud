
export function physicalConductorSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        // 资源池物理机（非受限）
        getIronicList: function() {
            return $http({
                method: "GET",
                url: static_url + "/ironic/nodes"
            });
        },
        getIronicStatus: function() {
            return $http({
                method: "GET",
                url:static_url +  "/physical/server/os-hypervisors/status"
            });
        },
        // 纳管物理机（受限）
        getIpmiList: function() {
            return $http({
                method: "GET",
                url: static_url + "/ipmi/nodes"
            });
        },
        IronicgetPvmInfo:function(nodeId){
            return $http({
                method: "GET",
                url:static_url + "/ironic/node/"+nodeId,
            });
        },
        getPvmInfo:function(nodeId){
            return $http({
                method: "GET",
                url:static_url + "/ipmi/" + localStorage.enterpriseUid + "/node/" +nodeId,
            });
        },
        IronicPowerState:function(nodes){
            return $http({
                method: "PUT",
                url: static_url + "/ironic/nodes/powerstates",
                params:nodes
            });
        },
        powerState:function(nodes){
            return $http({
                method: "PUT",
                url: static_url + "/ipmi/"+localStorage.enterpriseUid+"/power",
                params:nodes
            });
        },
        IronicDeletePvm:function(nodes){
            return $http({
                method: "DELETE",
                url: static_url + "/ironic/nodes",
                params:nodes
            });
        },
        deletePvm:function(nodes){
            return $http({
                method: "DELETE",
                url: static_url + "/ipmi/" + localStorage.enterpriseUid +"/nodes",
                params:nodes
            });
        },
        IronicCloseMiantance:function(nodes){
            return $http({
                method: "DELETE",
                url:static_url + "/ironic/nodes/Maintenance",
                params:nodes
            });
        },
        IronicOpenMiantance:function(nodes){
            return $http({
                method: "PUT",
                url:static_url + "/ironic/nodes/Maintenance",
                params:nodes
            });
        },
        IronicProvisionstates:function(nodes){
            return $http({
                method: "PUT",
                url:static_url + "/ironic/nodes/provisionstates",
                params:nodes
            });
        },
        IronicGetImages:function(){
            return $http({
                method: "GET",
                url:static_url + "/physical/images"
            });
        },
        checkIPMI:function(data){
            return $http({
                method: "POST",
                url: static_url + "/ipmi/" + localStorage.enterpriseUid + "/check",
                data:data
            });
        },
        IronicRegisterPvm:function(data){
            return $http({
                method: "POST",
                url: static_url + "/ironic/node",
                data:data
            });
        },
        registerPvm: function(data) {
            return $http({
                method: "POST",
                url: static_url + "/ipmi/" + localStorage.enterpriseUid + "/nodes",
                data:data
            });
        },
        editFromUnlimit:function(nodeId,data){
            return $http({
                method: "PUT",
                url: static_url + "/ironic/node/" + nodeId,
                data:data
            });
        },
        editPvmFromlimit:function(nodeId,data){
            return $http({
                method: "PUT",
                url: static_url + "/ipmi/"+ localStorage.enterpriseUid +"/"+ nodeId +"/action",
                data:data
            });
        },
        
        refreshStatus:function(nodeIds){
            return $http({
                method: "GET",
                url: static_url + "/ipmi/" + localStorage.enterpriseUid + "/" + "/refresh",
                params:nodeIds
            });
        },
        // 终止初始化
        stopInit:function(params){
            return $http({
                method: "PUT",
                url: static_url + "/ironic/nodes/abort/inspect",
                params:params
            });
        },
        getInfluxdbip: function() {
            return $http({
                method: "GET",
                url: "/awstack-user/v1/enterprises/regions/" + localStorage.regionKey + "/configs/metric_repository_address"
            });
        },
        //纳管物理机详情 获取系统盘列表
        getSysDiskList:function(id){
            return $http({
                method: "GET",
                url: "/awstack-resource/v1/ironic/nodes/introspection?uuid="+id
            });
        },
        //添加系统盘
        addSysDisk:function(data){
            return $http({
                method: "POST",
                url: "/awstack-resource/v1/ironic/nodes/system/disk",
                data:data
            });
        }

    };
}

physicalConductorSrv.$inject = ["$http"];