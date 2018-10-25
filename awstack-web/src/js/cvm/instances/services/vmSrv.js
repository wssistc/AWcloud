export function vmSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        getVmDisks:function(id,jobType){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/server/"+id+"/volume",
                params:jobType
            })
        },
        createBackups:function(data){
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/backups",
                data:data
            })
        },
        coldMigrate:function(id,data){
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/coldMigrate/servers/" + id + "/action",
                data:data
            })
        },
        osBootMenu:function(id){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/servers/" + id +"/os-boot-menu",
            })
        },
        osBootMenuPut:function(id,parma){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/servers/"+ id +"/os-boot-menu",
                params:parma
            })
        },
        getRestoreBackup:function(id){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/backups/server/"+id,
            })
        },
        vmRestoreBackup:function(data){ 
            return $http({
                method:"POST",
                url:"/awstack-resource/v1/backups/server/restore/volume",
                data:data
            })
        }
    };
}
vmSrv.$inject = ["$http"];