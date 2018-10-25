
export function volumesSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        getBackups:function(){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/backups"
            })
        },
        resetStatus:function(id){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/volume/"+id + "/os-reset"
            })
        },
        serversVolumes:function(ids){
            return $http({
                method:"post",
                url:"/awstack-resource/v1/allserver/volumeInfos",
                data:ids
            })
        }
        
    };
}

volumesSrv.$inject = ["$http"];