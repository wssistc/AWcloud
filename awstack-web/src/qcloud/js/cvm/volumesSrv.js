angular.module("volumessrv", [])
.service("volumesDataSrv", function($rootScope, $http) {
    var static_cbs_url= "http://192.168.137.33:8080/awcloud-qcloud/v1/cbs/";
    var static_vms_url="http://192.168.137.33:8080/awcloud-qcloud/v1/vms/";
    /*var getTokenData = {
        "secretId":"AKID1ueDcqHvjMo5C6qQqCMOGwOjsoY8nmod",
        "secretKey":"nSvcBj9Ol5EAuSoyymNm13TlsqcCVfeQ"
    };*/
    return {
        getToken: function(data) {
            return $http({
                method: "POST",
                url: "http://192.168.138.41:9080/awcloud-qcloud/exclude/login",
                data:data
            });       
        },
        getCbsList: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "cbsStoragesList",
                data:data
            });       
        },
        getCbsDetail: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "vol-show",
                data:data
            });       
        },
        createVolume: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "createCbsStorages",
                data:data
            });       
        },
        editVolumeName: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "vol-modify",
                data:data
            });       
        },
        mountVolume: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "vol-attach",
                data:data
            });       
        },
        unmountVolume: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "vol-detach",
                data:data
            });       
        },
        getZone: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "zones",
                data:data
            });       
        },
        getProject: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "projects",
                data:data
            });       
        },
        getNewPrice: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "inquiryStoragePrice",
                data:data
            });       
        },
        renewalVolume: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "renewCbsStorage",
                data:data
            });       
        },
        extendVolume: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "resizeCbsStorage",
                data:data
            });       
        },
        getVms: function(data) {
            return $http({
                method: "POST",
                url: static_vms_url + "DescribeInstances",
                data:data
            });       
        },
        createSnapshot: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "snap-create",
                data:data
            });       
        },
        allocateVolume: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "vol-modify",
                data:data
            });       
        },
        getVolumesOfins: function(data) {
            return $http({
                method: "POST",
                url: static_cbs_url + "vol-attachnum",
                data:data
            });       
        }
    };

});
