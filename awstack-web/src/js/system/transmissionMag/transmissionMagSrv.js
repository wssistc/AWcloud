var tableService = angular.module("TransMagaApi", []);
tableService.service("TransMagaSrv", function($http,$q) {
    var static_url = "awstack-resource/v1";
    var static_quota_url = "awstack-user/v1";
    return {
        //已加载设备的列表
        gitInstanceList:function(){
            return $http({
                method: "GET",
                url: static_url + "/servers/os-usb-dev/attached",
            })
        },       
        // usb透传设备详情列表
        getTtequipmentList:function(serverId){
            return $http({
                method: "GET",
                url: static_url + "/servers/" + serverId + "/os-usb-dev/available",
            })
        },
        // 加载usb设备
        addTtEquipment:function(serverId,data){
            return $http({
                method: "POST",
                url: static_url + "/servers/" + serverId + "/loadUsbDevice",
                data:data
            })
        },
        //卸载usb设备
        unloadTtEquipment:function(serverId,data){
            return $http({
                method: "POST",
                url: static_url + "/servers/" + serverId + "/unloadUsbDevice",
                data:data
            })
        },
        // hasTtEquipmentList:function(serverId){
        //     return $http({
        //         method: "GET",
        //         url: static_url + "/servers/" + serverId + "/os-usb-dev/attached",
        //     })
        // },
        //云主机列表
        getInstancesList:function(){
            return $http({
                method: "GET",
                url: static_url + "/servers/details",
            })
        },
        //详情
        getInstancesDetails:function(params,id,serverId){
            return $http({
                method: "GET",
                url: static_url + "/servers/" + serverId + "/os-usb-dev/" + id + "/details?enterpriseUid=" + params,
            })
        },
        // gpu卸载
        unloadGpuTtEquipment:function(serverId,data){
            return $http({
				method: "POST",
                url: static_url + "/servers/" + serverId + "/detachgpu/action",
                data:data
			})
        },
        // gpu加载
        addGpuTtEquipment:function(serverId,data){
            return $http({
                method: "POST",
				url: static_url + "/servers/" + serverId + "/attachgpu/action",
				data:data
			})
        },
        // 可加载的gpu设备列表
        getGpuTtequipmentList:function(serverId){
            return $http({
                method: "GET",
                url: static_url + "/servers/" + serverId + "/os-gpu-device/list_gpus",
            })
        },
    }
})