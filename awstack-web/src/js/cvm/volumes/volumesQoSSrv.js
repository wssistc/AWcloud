var tableService = angular.module("volumesQoSApi", []);
tableService.service("volumesQoSSrv", function($rootScope, $http) {
    var static_url = "awstack-resource/v1";
    var static_quota_url = "awstack-user/v1";
    return {
        getVolumesQoS: function() {
            return $http({
                method: "GET",
                url: static_url + "/qos-specs"
            });
        },
        delVolumesQoS: function(data) {
            return $http({
                method: "DELETE",
                url: static_url + "/qos-specs?qosIds=" + data ,
                params:data
            });
        },
        createVolumesQoS:function(data){
            return $http({
                method: "POST",
                url: static_url + "/qos-specs",
                data:data
            });
        },
        getHasAssociatedStorageList:function(){
            return $http({
                method: "GET",
                url: static_quota_url + "/storage/list"
            });
        },
        // 关联
        associateStorage:function(volTypeId,qosId){
            return $http({
                method: "POST",
                url: static_url + "/qos-specs/" + qosId + "/associate",
                data:volTypeId
            }); 
        },
        // 取消关联
        disassociateStorage:function(volTypeId,qosId){
            return $http({
                method: "POST",
                url: static_url + "/qos-specs/" + qosId + "/disassociate",
                data:volTypeId
            }); 
        },
        // 关联列表
        disassociateStorageList:function(qosId){
            return $http({
                method: "GET",
                url: static_quota_url + "/qos-specs/" + qosId + "/associations"
            });
        }
    }
})