
export function pInstancesSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        getServers:function(){
            return $http({
                method: "GET",
                url: static_url + "/physical/servers",
            });
        },
        createServer: function(options) {
            return $http({
                method: "POST",
                url: static_url + "/physical/server",
                data:options
            });
        },
        getImage: function() {
            return $http({
                method: "GET",
                url: static_url + "/physical/images",
            });
        },
        editDesc:function(id,params){
            return $http({
                method: "PUT",
                url: static_url + "/physical/server/"+id+"/description",
                params:params
            });
        },
        getDetail:function(id){
            return $http({
                method: "GET",
                url: static_url + "/physical/server/"+id,
            });
        },
        getFlavors: function() {
            return $http({
                method: "GET",
                url: static_url + "/physical/flavors",
            });
        },
        getProjectNetwork: function() {
            return $http({
                method: "GET",
                url: static_url + "/physical/networks",
            });
        },
        getNetworksDetail: function(options) {
            return $http({
                method: "GET",
                url: static_url + "/networks/" + options
            });
        },
        bootServer:function(option){
            return $http({
                method:"POST",
                url: static_url + "/physical/server/os-start",
                params:option
            })
        },
        shutdownServer:function(option){
            return $http({
                method:"POST",
                url: static_url + "/physical/server/os-stop",
                params:option
            })
        },
        rebootServer:function(option){
            return $http({
                method:"POST",
                url: static_url + "/physical/server/os-reboot",
                params:option
            })
        },
        delServer:function(option){
            return $http({
                method:"DELETE",
                url: static_url + "/physical/server/os-delete",
                params:option
            })
        },
        lockServer:function(option){
            return $http({
                method:"POST",
                url: static_url + "/physical/server/os-lock",
                params:option
            })
        },
        unlockServer:function(option){
            return $http({
                method:"POST",
                url: static_url + "/physical/server/os-unlock",
                params:option
            })
        },
        getPrice:function(data){
            return $http({
                method: "POST",
                url: "/awstack-boss/newResourceCharge/queryPmChargingAmount",
                data:data
            });
        },
        getInsImage:function(id){
            return $http({
                method: "GET",
                url: static_url + "/physical/server/" + id+"/image"
            });
        }
    };
}

pInstancesSrv.$inject = ["$http"];