var tableService = angular.module("instancesSrv", []);
tableService.service("instancesSrv", function($rootScope, $http, backendSrv) {
    var static_resource_url = "awstack-resource/v1";
    return {
        makeImage: function(data) {
            return $http({
                method: "PUT",
                url:static_resource_url+"/enterprises/"+localStorage.enterpriseUid+"/makeImage",
                data:data
            });
        },
        getData: function() {
            return backendSrv.get("awstack-resource/v1/projectservers");
        },
        getAllData: function() {
            return backendSrv.get("awstack-resource/v1/users/servers");
        },
        getImage: function() {
            return backendSrv.get("awstack-resource/v1/images");
        },
        getServerDetail: function(options) {
            return backendSrv.get("awstack-resource/v1/server/" + options);
        },
        getServerDetailNew: function(options) {
            return backendSrv.get("awstack-resource/v1/server/" + options + "/volume");
        },
        getServerLog: function(options) {
            return backendSrv.get("awstack-resource/v1/server/" + options + "/os-log");
        },
        getFlavors: function() {
            return backendSrv.get("awstack-resource/v1/flavors");
        },
        createServer: function(options) {
            return backendSrv.post("awstack-resource/v1/server", options);
        },
        createIsoServer: function(options) {
            return backendSrv.post("awstack-resource/v1/iso-server", options);
        },
        startServer: function(options) {
            return backendSrv.post("awstack-resource/v1/server/os-start", "", options);
        },
        stopServer: function(options) {
            return backendSrv.post("awstack-resource/v1/server/os-stop", "", options);
        },
        suspendServer: function(options) {
            return backendSrv.post("awstack-resource/v1/pauseServer/","", options);
        },
        unPauseServer: function(options) {
            return backendSrv.post("awstack-resource/v1/unPauseServer/","", options);
        },
        hangServer: function(options) {
            return backendSrv.post("awstack-resource/v1/sunpendServer/","",options);
        },
        upHangServer: function(options) {
            return backendSrv.post("awstack-resource/v1/resumeServer/","",options);
        },
        getProjectNetwork: function(headers) {
            return backendSrv.get("awstack-resource/v1/projectNetworks","","",headers);
        },
        getServerNetwork: function(options) {
            return backendSrv.get("awstack-resource/v1/server/" + options + "/os-interface");
        },
        getKeypairs: function() {
            return backendSrv.get("awstack-resource/v1/os-keypairs");
        },
        getSecurity: function() {
            return backendSrv.get("awstack-resource/v1/security_groups");
        },
        listServerSecGroup: function(serverid) {
            return backendSrv.get("awstack-resource/v1/server/" + serverid + "/os-secgroup");
        },
        updateServerSecGroup: function(serverid, options) {
            return backendSrv.put("awstack-resource/v1/server/" + serverid + "/os-secgroup", options);
        },
        delServer: function(options,flag) {
            return backendSrv.post("awstack-resource/v1/server/os-delete?flag="+flag, "", options);
        },
        addNetwork: function(server_id, data,options) {
            return backendSrv.post("awstack-resource/v1/server/" + server_id + "/os-interface", data, options);
        },
        removeNetwork: function(server_id, options) {
            return backendSrv.delete("awstack-resource/v1/server/" + server_id + "/os-interface", "", options);
        },
        rebootServer: function(options) {
            return backendSrv.post("awstack-resource/v1/server/os-reboot", "", options);
        },
        shutdownServer: function(options) {
            return backendSrv.post("awstack-resource/v1/server/os-force-stop", "", options);
        },
        editServer: function(serverid, options) {
            return backendSrv.put("awstack-resource/v1/server/" + serverid, options);
        },
        bind_floatingip: function(options) {
            return backendSrv.put("awstack-resource/v1/floating_ips/association", options);
        },
        relieve_floatingip: function(options) {
            return backendSrv.put("awstack-resource/v1/floating_ips/disassociation", options);
        },
        getAllfloalingIp: function() {
            return backendSrv.get("awstack-resource/v1/floating_ips");
        },
        getOsNet: function(serverid) {
            return backendSrv.get("awstack-resource/v1/server/" + serverid + "/os-interface");
        },
        osInterfaceFips: function(options) {
            return backendSrv.get("awstack-resource/v1/server/" + options + "/os-interface-fips");
        },
        getVallDisk: function() {
            return backendSrv.get("awstack-resource/v1/volumes/canattach");
        },
        os_loading_disk: function(options) {
            return backendSrv.put("awstack-resource/v1/volumes/attach", options);
        },
        os_detach_disk: function(options) {
            return backendSrv.put("awstack-resource/v1/volumes/detach", options);
        },
        os_console: function(options) {
            return backendSrv.get("awstack-resource/v1/server/" + options + "/os-console");
        },
        mkImg: function(serverId, options) {
            return backendSrv.post("awstack-resource/v1/server/" + serverId + "/os-image", options);
        },
        os_backup: function(serverId, options) {
            return backendSrv.post("awstack-resource/v1/server/" + serverId + "/backup", options);
        },
        os_migrate: function(serverId, options) {
            return backendSrv.post("awstack-resource/v1/server/" + serverId + "/live-migrate", options);
        },
        os_upgrade: function(serverId, options) {
            return backendSrv.post("awstack-resource/v1/server/resize/" + serverId, options);
        },
        os_upgradeConfirm: function(serverId, options) {
            return backendSrv.get("awstack-resource/v1/server/confirmResize/" + serverId, options);
        },
        getZone:function(){
            return backendSrv.get("awstack-resource/v1/os-availability-zone/");
        },
        os_mac:function(serverId,options){
            return backendSrv.put("/awstack-resource/v1/server/"+serverId+"/os-mac",options);
        },
        os_snap:function(options){
            return backendSrv.post("awstack-resource/v1/snapshots/", options);
        },
        getOsRootVol:function(options){
            return backendSrv.get("/awstack-resource/v1/server/",options);
        },
        getHotgrade:function(options){
            return $http({
                url:"/awstack-resource/v1/server/"+options+"/os-live-resize/current_usage",
                method:"GET"
            });
        },
        postHotgrade:function(data,options){
            return $http({
                url:"/awstack-resource/v1/server/"+options+"/os-live-resize/live_resize",
                method:"POST",
                data:data
            });
        },
        evacuateServer:function(options){
            return $http({
                url:"/awstack-resource/v1/server/evacuate",
                method:"POST",
                params:options
            });
        },
        mountISO:function(options){
            return $http({
                url:"/awstack-resource/v1/volumes/attach-iso",
                method:"PUT",
                data:options
            });
        },
        unmountISO:function(options){
            return $http({
                url:"/awstack-resource/v1/volumes/detach-iso",
                method:"PUT",
                data:options
            });
        },
        osForceDel:function(option,flag){
            return $http({
                method: "POST",
                url: "awstack-resource/v1/server/os-force-delete",
                params:option
            });
        },
        /*,
        add flavor max module
        getAggregates:function(){
            return backendSrv.get("awstack-resource/v1/os-aggregates/");
        },*/
        checkTenantIP:function(options){
            return backendSrv.post("/awstack-resource/v1/usedIPList",options);
        },
        getvolumeTypes:function(){
            return $http({
                method: "GET",
                url: "awstack-resource/v1/volumeTypes"
            });
        },
        modifyInterface:function(options){
            return $http({
                method:"POST",
                url:"awstack-resource/v1/modifyinterface",
                data:options
            })
        },
        getPortDetail:function(options){
            return $http({
                method:"POST",
                url:"awstack-resource/v1/getPortDetail",
                data:options
            })
        },
        updatePortSecurity:function(options){
            return $http({
                method:"PUT",
                url:"awstack-resource/v1/portsSec",
                data:options
            })
        },
        getVolumeSnapshots:function(options){
            return $http({
                method:"POST",
                url:"awstack-resource/v1/snapshots/detail",
                params:options
            })
        },
        checkSheduleJob:function(options){
            return $http({
                method:"GET",
                url:"awstack-schedule/v1/check/schedule/job",
                params:options
            })
        },
        editNICBandwidth:function(options){
            return $http({
                method:"PUT",
                url:"awstack-resource/v1/server/" + options.serverId + "/bandwidth?serverName=" + options.serverName,
                data:options.data
            })
        },
        getNetcardBandwidth:function(options){
            return $http({
                method:"GET",
                url:"awstack-resource/v1/server/" + options + "/bandwidth"
            })
        },
        snapshotRollback:function(options){
            return $http({
                method:"POST",
                url:"awstack-resource/v1/snapshot/rollback",
                data:options
            })
        },
        getImageCacheVol:function(imageId,data){
            return $http({
                method:"POST",
                url:"awstack-resource/v1/volume/images/"+imageId+"/cache",
                data:data
            })
        },
        resetVm:function(data){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/server/os-reset",
                params:data
            })
        },

        editPsw:function(id,data){
             return $http({
                method:"PUT",
                url:"/awstack-resource/v1/server/"+id+"/os-change",
                data:data
            })
        },
        rebuildHost:function(id){
            return $http({
                method:"PUT",
                url:" /awstack-resource/v1/server/"+id+"/os-rebuild",
            })
        },
        setNetworkConfig:function(id,data){
            return $http({
                method:"PUT",
                url:"/awstack-resource/v1/updatePortSecPolicy/"+id,
                data:data
            })
        },
        openOrCloseNetwork:function(port_id){
            return $http({
                method:"GET",
                url:"awstack-resource/v1//ports/"+port_id
            })
        },
        getSnapAmount: function(data) {
            return $http({
                method:"POST",
                url:"/awstack-boss/newResourceCharge/querySnapshotChargingAmount",
                data:data
            })
        },
        getCDTableData:function(imageId) {
            return $http({
                method: "GET",
                url: static_resource_url + "/servers/"+ imageId + "/os-volume_attachments"
            });
        },
        getISOList: function(params) {
            return $http({
                method: "GET",
                url: static_resource_url + "/images/isolist",
                params: params
            })
        },
        makeVolume: function(data) {
            return $http({
                method: "POST",
                url: static_resource_url + "/images/isoMakeVolume",
                data: data
            })
        },
        createVolume: function(data) {
            return $http({
                method: "POST",
                url: static_resource_url + "/images/attachVolume",
                data: data
            })
        },
        createIsoVolume: function(data) {
            return $http({
                method: "POST",
                url: static_resource_url + "/images/createIsoVolume",
                data: data
            })
        },
        attachVolume: function(imageId, data) {
            return $http({
                method: "POST",
                url: static_resource_url + "/servers/" + imageId + "/os-volume_attachments",
                params: data
            })
        },
        uninstallISO: function(imageId, volumeId) {
            return $http({
                method: "DELETE",
                url: static_resource_url + "/servers/" + imageId + "/attachments",
                params:{volumeIds:volumeId}
            })
        },
        deleteVolume: function(volumeId) {
            return $http({
                method: "DELETE",
                url: static_resource_url + "/resource/volumes/" + volumeId
            })
        },
        //卷存储云硬盘核存储设备的列表
        stockTransferList:function(id){
            return $http({
                method: "GET",
                url: static_resource_url + "/volume/" + id + "/listVolumes"
            })
        },
        //确认
        stockTransfer:function(data){
            return $http({
                method: "POST",
                url: static_resource_url + "/volume/migrateVolume",
                data: data
            }) 
        },
        // 磁盘QoS
        volumesQoS:function(id){
            return $http({
                method: "GET",
                url: static_resource_url + "/server/" + id + "/volumeInfo"
            })
        },
        // 编辑磁盘QoS参数
        editVolumesQoS:function(data,serverId){
            return $http({
                method: "POST", 
                url: static_resource_url + "/servers/" + serverId + "/os-qos-instance",
                data: data
            })  
        },
        getPrice:function(data){
			return $http({
				method: "POST",
				url: "/awstack-boss/newResourceCharge/queryVmChargingAmount",
				data:data
			})
        },
        getStorage:function(){
            return $http({
				method: "GET",
                url: "/awstack-user/v1/storage/list",
			})
        },
        nodeList:[],
        // 可用usb列表
        getTtequipmentList:function(serverId){
            return $http({
				method: "GET",
                url: static_resource_url + "/servers/" + serverId + "/os-usb-dev/available",
			})
        },
        // 可用gpu列表
        getGpuTtequipmentList:function(serverId){
            return $http({
                method: "GET",
                url: static_resource_url + "/servers/" + serverId + "/os-gpu-device/list_gpus",
			})
        },
        // usb加载
        addTtEquipment:function(serverId,data){
            return $http({
				method: "POST",
				url: static_resource_url + "/servers/" + serverId + "/loadUsbDevice",
				data:data
			})
        },
        // gpu加载
        addGpuTtEquipment:function(serverId,data){
            return $http({
                method: "POST",
				url: static_resource_url + "/servers/" + serverId + "/attachgpu/action",
				data:data
			})
        },
        //usb卸载
        unloadTtEquipment:function(serverId,data){
            return $http({
				method: "POST",
                url: static_resource_url + "/servers/" + serverId + "/unloadUsbDevice",
                data:data
			})
        },
        //gpu卸载
        unloadGpuTtEquipment:function(serverId,data){
            return $http({
				method: "POST",
                url: static_resource_url + "/servers/" + serverId + "/detachgpu/action",
                data:data
			})
        },
        //获取云主机已经加载的usb设备
        hasTtEquipmentList:function(serverId){
            return $http({
				method: "GET",
                url: static_resource_url + "/servers/" + serverId + "/os-usb-dev/attached",
			})
        },
        //获取云主机已经加载的gpu设备
        hasGpuTtequipmentList:function(serverId){
            return $http({
				method: "GET",
                url: static_resource_url + "/servers/" + serverId + "/os-gpu-dev/attached",
			})
        },
        //全部类型的已加载设备
        allHasTtEquipmentList:function(serverId){
            return $http({
				method: "GET",
                url: static_resource_url + "/servers/" + serverId + "/attached",
			})
        },
        //异常重启
        errorStart:function(serverId,data){
            return $http({
                method: "POST",
                url: static_resource_url + "/servers/" + serverId + "/os-abnormalrestart?action=" + data,
			})
        },
        getVlomesPrice:function(data){
			return $http({
				method: "POST",
				url: "/awstack-boss/newResourceCharge/queryChdChargingAmount",
				data:data
			})
        },
        getRestoringVolServer:function(data){
            return $http({
				method: "POST",
				url: "/awstack-resource/v1/volume/servers",
				data:data
			})
            
        }
    };
});
