
var accessFunctionSrvModule = angular.module("accessFunctionSrvModule",[]);

accessFunctionSrvModule.service("accessSrv",["$http",function($http){
    var static_url = "awstack-user/v1/enterprises/regions/"+localStorage.regionKey+"/configs"
    return {
        getIps:function(options){
            return $http({
                method:"GET",
                url:static_url+"?configName=floating_cidr&configName=floating_gateway&configName=floating_start&configName=floating_end"
            });
        },
        addFunData:function(options){
            return $http({
                method:"POST",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/plugin/add",
                data:options
            });
        },
        getFunData:function(){
            return $http({
                method:"get",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/plugins/list"
            });
        },
        deleteFunData:function(pluginId){
            return $http({
                method:"delete",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/plugin/delete/"+pluginId,
            });
        },
        checkedFunStatus:function(){
            return $http({
                method:"get",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/check-bob-region-status"
            });
        },
        getContentList:function(){
            return $http({
                method:"GET",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/plugins/all"
            });
        },
        deleteContent:function(options){
            return $http({
                method:"post",
                url:"awstack-user/v1/enterprises/regions/plugins/kubernetes/del",
                data:options
            });
        },
        addContent:function(options){
            return $http({
                method:"post",
                url:"awstack-user/v1/enterprises/regions/plugins/kubernetes",
                data:options
            });
        },
        installContent:function(options){
            return $http({
                method:"post",
                url:"awstack-user/v1/k8s/install-env",
                data:options
            });
        },
        clearContent:function(options){
            return $http({
                method:"post",
                url:"awstack-user/v1/k8s/clean-env",
                data:options
            });
        },
        installPhy:function(pluginUid){
            return $http({
                method:"post",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/plugin/phy/"+pluginUid
            });
        },
        clearPhy:function(pluginUid){
            return $http({
                method:"delete",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/"+pluginUid+"/dropPlugin/phy"
            });
        },
        getCluster:function(){
            return $http({
                method:"get",
                url:"awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+JSON.parse(localStorage.$LOGINDATA).regionUid+"/networkCheck"
            });
        },
        getCephStatus:function(){
            return $http({
                method:"get",
                url:"awstack-user/v1/storage"
            });
        },
        getPLuginLog:function(options){
            return $http({
                method:"post",
                url:"awstack-user/v1/bob/logs",
                data:options
            });
        },
        addPaas:function(options){
            return $http({
                method:"post",
                url:"awstack-user/v1/plugin/paas/add",
                data:options
            });
        },
        editPaas:function(data){
            return $http({
                method:"put",
                url:"awstack-user/v1/plugin/paas/update",
                data:data
            });
        },
        deletePaas:function(id){
            return $http({
                method:"delete",
                url:"awstack-user/v1/plugin/paas/delete/" + id,
            });
        },
        syncCOC:function(){
            return $http({
                method:"GET",
                url:" /awstack-user/v1/synchronize/zhiyun",
            });
        },
        syncSkyCloudSecurity:function(){
            return $http({
                method:"POST",
                url:" /awstack-user/v1/syncuserinfo",
            });
        }
    };
}]);