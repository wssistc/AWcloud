
export function backupsSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        getBackups:function(){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/backups"
            })
        },
        getBackupsDetail:function(id){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/backups/"+id
            })
        },
        exportBackups:function(params) {
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/backups/export/url",
                params:params,
            })
        },
        delBackups:function(data){
            return $http({
                method:"DELETE",
                url:"/awstack-resource/v1/backups",
                params:data,
            })
        },
        getVolumeBackups:function(volumeId){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/backups/volume/" + volumeId
            })
        },
        isVolumeExist:function(volumeId){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/volume/"+ volumeId +"/servers",
            })
        },
        restoreBackup:function(backupId,volumeId,volumeName){ 
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/backups/"+ backupId + "/restore/volume/"+volumeId +"?backName="+ volumeName,
            })
        },
        resetBackup:function(backupId,params){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/backups/"+backupId+"/os-reset",
                params:params
            })
        },
        delBackupChain:function(data){
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/backups/chain",
                data:data
            })
        },
        checkSheduleJob:function(options){
            return $http({
                method:"GET",
                url:"awstack-schedule/v1/check/schedule/job",
                params:options
            })
        },
    };
}

backupsSrv.$inject = ["$http"];