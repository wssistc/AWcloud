 angular.module("snapshotsrv", [])
.service("snapshotsrv", function($rootScope, $http) {
    var static_snap_url= "http://192.168.137.33:8080/awcloud-qcloud/v1/cbs/";
    /*var static_vms_url="http://192.168.137.33:8080/awcloud-qcloud/v1/vms/";*/
    return {
        getSnapshot: function(data) {
            return $http({
                method: "POST",
                url: static_snap_url + "snap-list",
                data:data
            });       
        },
        editSnapName: function(data) {
            return $http({
                method: "POST",
                url: static_snap_url + "snap-modify",
                data:data
            });       
        },
        delSnap: function(data) {
            return $http({
                method: "POST",
                url: static_snap_url + "snap-delete",
                data:data
            });       
        },
        rollBack: function(data) {
            return $http({
                method: "POST",
                url: static_snap_url + "snap-rollback",
                data:data
            });       
        }
    };

});
