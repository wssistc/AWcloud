vmService.$inject=["$http"];
export function vmService($http){
    let static_url="/awstack-vmware/v1/";
    return {
        getToken: function() {
            return $http({
                method: "get",
                url: static_url+"enterprises/eb44033ff0fb42128219b2a36872b5e2/login"
            });       
        },
        getConsoleUrl:function(options){
            return $http({
                method: "post",
                data:options,
                url: static_url+"servers/console"
            })
        },
        getVmList:function(){
            return $http({
                method:"get",
                url:static_url + "servers"
            })
        },
        getVmListByDCName: function(dcName) {
            return $http({
                method: "get",
                url: static_url+"datacenter/servers?dcName="+dcName
            });       
        },
        getVmListByClusterName: function(clusterName) {
            return $http({
                method: "get",
                url: static_url+"cluster/servers?clusterName="+clusterName
            });       
        },
        getVmListByHostName: function(hostName) {
            return $http({
                method: "get",
                url: static_url+"host/servers?hostName="+hostName
            });       
        },
        getDCList: function() {
            return $http({
                method: "get",
                url: static_url+"datacenters"
            });       
        },
        getClusterListByDCName: function(dcName) {
            return $http({
                method: "get",
                url: static_url+"datacenter/clusters?dcName="+dcName
            });       
        },
        getHostListByDCName: function(dcName) {
            return $http({
                method: "get",
                url: static_url+"datacenter/hosts?dcName="+dcName
            });       
        },
        getHostListByClusterName: function(cluster) {
            return $http({
                method: "get",
                url: static_url+"cluster/hosts?cluster="+cluster
            });       
        },
        getFolders: function(rootFolder) {
            return $http({
                method: "post",
                url: static_url+"datacenter/folders",
                data:rootFolder
            });       
        },
        getDSList: function(info) {
            return $http({
                method: "get",
                url: static_url+info.type+"/dss?"+info.parameter+"="+info.name
            });       
        },
        getBrowserList: function(data) {
            return $http({
                method: "POST",
                url: static_url+"ds/browser",
                data:data
            });       
        },
        getNetworkList: function(info) {
            return $http({
                method: "post",
                url:static_url+info.type+"/networks",
                data:info.obj
            });       
        },
        createVM: function(data) {
            return $http({
                method: "post",
                url: static_url+"servers",
                data:data
            });       
        },
        powerVM:function(options){
            return $http({
                method:"PUT",
                url: static_url + "servers/power",
                data:options
            });
        },
        createSnapshot:function(options){
            return $http({
                method:"POST",
                url: static_url + "servers/snapshot",
                data:options
            });
        },
        destroyVM: function(data) {
            return $http({
                method: "POST",
                url: static_url + "servers/destroy",
                data:data
            });
        },
        relocateVM: function(data) {
            return $http({
                method: "post",
                url: static_url+"servers/relocate",
                data:data
            });       
        },
        listSnapshotByVm: function(data) {
            return $http({
                method: "POST",
                url: static_url+"servers/snapshotlist",
                data:data
            });       
        },
        verifyName:function(data){
            return $http({
                method: "POST",
                url: static_url+"servers/verify",
                data:data
            });
        },
        delSnap:function(data){
            return $http({
                method: "DELETE",
                url: static_url+"servers/snapshot",
                data:data
            });
        },
        delAllSnap:function(data){
            return $http({
                method: "DELETE",
                url: static_url+"servers/allsnapshot",
                data:data
            });
        },
        revertVM:function(data){
            return $http({
                method: "POST",
                url: static_url+"servers/snapshot/revert",
                data:data
            });
        },
        revertCurrent:function(data){
            return $http({
                method: "POST",
                url: static_url+"servers/snapshot/revert/current",
                data:data
            });
        },
        getOS:function(data){
            return $http({
                method: "GET",
                url: static_url+"guestOS",
                //data:data
            });
        },
        getvmDetail:function(data){
            return $http({
                method: "POST",
                url: static_url+"servers/detail",
                data:data
            });
        },
    };
}