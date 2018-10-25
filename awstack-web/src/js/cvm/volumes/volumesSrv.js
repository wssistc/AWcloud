var tableService = angular.module("volumessrv", []);
tableService.service("volumesDataSrv", function($rootScope, $http) {
    var static_url = "awstack-resource/v1/";
    var static_quota_url = "awstack-user/v1";
    return {
        getQuotaTotal: function(type) {
            return $http({
                method: "get",
                url: static_quota_url + "/quotas?type=domain_quota&targetId=" + localStorage.domainUid + "&enterpriseUid=" + localStorage.enterpriseUid + "&name=" + type
            });
        },
        getQuotaUsed: function(type) {
            return $http({
                method: "get",
                url: static_quota_url + "/projectsofquotas/" + localStorage.domainUid + "?enterpriseUid=" + localStorage.enterpriseUid + "&name=" + type
            });
        },
        /*getProHave: function(type) {
            return $http({
                method: "get",
                url: static_quota_url + "/getNewQuotas?type=project_quota&targetId="+projectUid+"&name="+type+"&enterpriseUid="+enterpriseUid
            });       
        },*/
        getProHave: function(type) {
            return $http({
                method: "get",
                url: static_quota_url + "/quotas?type=project_quota&targetId=" + localStorage.projectUid + "&name=" + type + "&enterpriseUid=" + localStorage.enterpriseUid
            });
        },
        getProUsed: function(type) {
            return $http({
                method: "get",
                url: static_quota_url + "/quotas_Usages?type=project_quota&domainUid=" + localStorage.domainUid + "&projectUid=" + localStorage.projectUid + "&name=" + type + "&enterpriseUid=" + localStorage.enterpriseUid
            });
        },
        updateQuotaUse: function(id, data) {
            return $http({
                method: "PUT",
                url: "awstack-user/v1/quotas_Usages/" + id,
                data: data
            });
        },
        getVolumesTableData: function() {
            return $http({
                method: "get",
                url: static_url + "volumes"
            });
        },
        addVolumesAction: function(options) {
            return $http({
                method: "post",
                url: static_url + "volumes",
                data: options
            });
        },
        addSingleVolumesAction: function(options,domainProject) {
            return $http({
                method: "post",
                url: static_url + "volumes",
                data: options,
                headers:{
                    'domain_id':domainProject.depart.selected.domainUid,
                    'domain_name':encodeURI(domainProject.depart.selected.domainName),
                    'project_id':domainProject.pro.selected.projectId,
                    'project_name':encodeURI(domainProject.pro.selected.projectName),
                }
            });
        },
        delOneVolumeAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "volumes/" + options
            });
        },
        cpDelOneVolumeAction: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "volumes/force/" + options
            });
        },
        delVolumes: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "volumes",
                params: options
            });
        },
        cpDelVolumes: function(options) {
            return $http({
                method: "DELETE",
                url: static_url + "volumes/force",
                params: options
            });
        },
        editVolumeAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "volumes",
                data: options
            });
        },
        expandVolumeSizeAction: function(options) {
            return $http({
                method: "PUT",
                url: static_url + "volumes/extend",
                data: options
            });
        },
        getHostAction: function() {
            return $http({
                method: "get",
                url: static_url + "projectservers"
            });
        },
        loadingVolumeAction: function(options) {
            return $http({
                method: "put",
                url: static_url + "volumes/attach",
                data: options
            });
        },
        uninstallVolumeAction: function(options) {
            return $http({
                method: "put",
                url: static_url + "volumes/detach",
                data: options
            });
        },
        createSnapshotAction: function(options) {
            return $http({
                method: "post",
                url: static_url + "snapshots",
                data: options
            });
        },
        detailVolumeData: function(options) {
            return $http({
                method: "get",
                url: static_url + "volumes/" + options
            });
        },
        getCapabilitiesHost:function(options){
            return $http({
                method: "get",
                url:  static_url + "/host/capabilities?host=" + options
            });
        },
        // 获取存储设备列表
        stockTransferList:function(){
            return $http({
                method: "GET",
                url: static_url + "volumeTypes"
            })
        },
        // 确认
        stockTransfer:function(data){
            return $http({
                method: "POST",
                url: static_url + "volume/migrateVolume",
                data: data
            })
        },
        createBackups:function(data){
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/backups",
                data:data
            })
        },
        getVolumeAmount: function(data) {
            return $http({
                method:"POST",
                url:"/awstack-boss/newResourceCharge/queryChdChargingAmount",
                data:data
            })
        },
        formBackupVolume:function(data,backupId){
            return $http({
                method:"POST",
                url:" /awstack-resource/v1/backups/" + backupId + "/restore-volume",
                data:data
            })
        }
    };

});
