angular.module("recycleSrvModule", [])
    .service("recycleSrv", function($http) {
        return {
            getSoftDel: function() {
                return $http({
                    method: "GET",
                    url: "awstack-resource/v1/servers-soft-delete"    
                });
            },
            osRestore: function(option) {
                return $http({
                    method: "POST",
                    url: "awstack-resource/v1/server/os-restore",
                    params:option
                });
            },
            osForceDel:function(option){
                return $http({
                    method: "POST",
                    url: "awstack-resource/v1/server/os-force-delete",
                    params:option
                });
            },
            osForceDelVm:function(option,name){
                return $http({
                    method: "DELETE",
                    url: "awstack-resource/v1/server/"+ option +"/os-force-delete",
                    params:name
                });
            }
        };
    });
