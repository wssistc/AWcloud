import "./instancesSrv";
import "../../system/storage/storageSrv";
import "../../overview/overviewSrv";
import "../volumes/volumesSrv";
import "../volumes/regularSnapSrv";
import "../../system/limitband/bandWidthModule";
import "../../common/services/commonFuncSrv";
import {createInstanceCtrl as instancesModelCtrl}  from "./createInstanceCtrl";
import "../../monitor/resource/vmHostSrv";
import { PiePanelDefault } from "../../chartpanel";
import { AreaPanelDefault } from "../../chartpanel";
import { vmInsDetailChartDefault } from "../../chartpanel";
import { hostAreaChartSqlParams } from "../../chartpanel";

angular.module("instancesModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "instancesSrv", "ui.select", "aggregatesSrvModule","regularSnapSrvModule","bandWidthSrv","commonFuncModule"])
    .controller("InstancesCtrl", ["$routeParams","$scope", "$rootScope", "NgTableParams", "$uibModal", "instancesSrv","vmhostSrv","userDataSrv", "$translate", "checkedSrv", "cvmViewSrv", 
    "$timeout", "GLOBAL_CONFIG", "depviewsrv", "alertSrv", "alarmSettingSrv", "alarmTemplateSrv", "contactGroupSrv",
     "$filter","networksSrv","regularSnapSrv","bandWidthSrv","$window","commonFuncSrv","floatipsSrv","TableCom",
     "modalCom","$sce","vmFuncSrv","dataclusterSrv","nodeSrv",
     function($routeParams,$scope, $rootScope, NgTableParams, $uibModal, instancesSrv,vmhostSrv,userDataSrv, $translate,
         checkedSrv, cvmViewSrv, $timeout, GLOBAL_CONFIG, depviewsrv, alert, alarmSettingSrv, alarmTemplateSrv, 
         contactGroupSrv, $filter,networksSrv,regularSnapSrv,bandWidthSrv,$window,commonFuncSrv,floatipsSrv,
         TableCom,modalCom,$sce,vmFuncSrv,dataclusterSrv,nodeSrv) {
        var self = $scope;
        self.context = self;
        self.activeEnable = true;
        self.stopEnable = true;
        self.errorEnable = true;
        self.delisDisabled = true;
        self.maxSizeLimit = false;
        self.model = {};
        self.headers = {
            name:$translate.instant("aws.instances.cloudInstanceName"),
            status:$translate.instant('aws.instances.status'),
            imgName:$translate.instant('aws.instances.imgName'),
            IPaddress:$translate.instant('aws.instances.IPaddress'),
            privateIP:$translate.instant('aws.instances.privateIP'),
            publicIP:$translate.instant('aws.instances.publicIP'),
            create_at:$translate.instant('aws.instances.create_at'),
            hostName:$translate.instant('aws.instances.hostName'),
        }
        
        self.searchList = [
            {name:"全部",key:""},
            {name:$translate.instant('aws.instances.table.status.active'),value:$translate.instant('aws.instances.table.status.active'),key:"status_ori"},
            {name:$translate.instant('aws.instances.table.status.shutoff'),value:$translate.instant('aws.instances.table.status.shutoff'),key:"status_ori"},
            {name:$translate.instant('aws.instances.table.status.error'),value:$translate.instant('aws.instances.table.status.error'),key:"status_ori"},
            {name:$translate.instant('aws.instances.table.status.paused'),value:$translate.instant('aws.instances.table.status.paused'),key:"status_ori"},
            {name:$translate.instant('aws.instances.table.status.suspended'),value:$translate.instant('aws.instances.table.status.suspended'),key:"status_ori"},
        ]
        
        self.titleName="instances";
        if(sessionStorage["instances"]){
            self.tableCols=JSON.parse(sessionStorage["instances"]);
            self.tableCols = self.tableCols.filter(item => item.field!="hostName")
         }else{
             self.tableCols = [
                 { field: "check", title: "",headerTemplateURL:"headerCheckbox.html",show: true },
                 { field: "name", title: self.headers.name,sortable: "name",show: true,disable:true},
                 { field: "status_ori", title: self.headers.status,sortable: "status",show: true,disable:false},
                 { field: "imageName", title: self.headers.imgName,sortable: "imageName",show: true,disable:false},
                 { field: "fixedIps", title: self.L3?self.headers.privateIP:self.headers.IPaddress,sortable: "fixedIps_long",show: true,disable:false},
                 { field: "floatingIps", title: self.headers.publicIP,sortable: "floatingIps_long",show: true,disable:false},
                 { field: "createtime", title: self.headers.create_at,sortable: "createtime",show: true,disable:false},
             ];
         }
         if(self.ADMIN) self.tableCols.push({ field: "hostName", title: self.headers.hostName,sortable: "hostName",show: true,disable:false})
         self.configSearch = function(data,tableCols){
            var tableData =  data;
            tableData.map(item => {
                editSearch(item,tableCols)
            })
            return tableData;
        }
        function editSearch(item,tableCols){
            var searchTerm = []
            tableCols.map(search => {
                if(search.title && search.show){
                    searchTerm.push(item[search.field])
                }
            })
            item.searchTerm =searchTerm.join("\b") ;
            return item;
        }
     

         //处理数据
        function operateData(data) {
            var buidingis = [];
            _.forEach(data, function(item) {
                item.createtime = $filter("date")(item.createtime, "yyyy-MM-dd HH:mm:ss");
                item.status = item.status.toLowerCase();
                item.status = item.task_state?item.task_state:item.status;
                item.status_ori = $translate.instant("aws.instances.table.status." + item.status);
                item.searchTerm = [item.name, item.hostName ,item.imageName ,item.fixedIps.join("\b"), item.floatingIps , item.status_ori , item.createtime].join("\b");
                item.fixedIps_long = item.fixedIps.map(ip => _IP.toLong(ip)) ;
                item.floatingIps_long = item.floatingIps.map(ip => _IP.toLong(ip));
                if(item.status == "build" || item.status == "building" || item.status == "block_device_mapping"){
                    buidingis.push(item.uid);
                }
            });
            //获取列表中所有创建中的虚拟机id
            checkedSrv.setChkIds(buidingis,"create")
            return data;
        }

        function successFunc(data) {
            //初始化表格
            self.tabledata = self.configSearch(data,self.tableCols);
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata });
            var tableId = "uid";
            checkedSrv.checkDo(self, data, tableId);
        }


        function getInstance() {
            instancesSrv.getData().then(function(result) {
                self.globalSearchTerm = "";
                if (result && result.data) {
                    var deliverData = result.data;
                    deliverData = deliverData.filter(inst => inst.name != "fixedImageInstanceName");
                    deliverData = operateData(deliverData);
                    successFunc(deliverData);
                    tableResize(deliverData)
                    
                }
                result ? self.loadData = true : "";
            });
        }
        self.refreshIns = function() {
            getInstance();
        };

        function tableResize(data){
            var resizing = [];
            data.map(x => {
                if(x.status == "verify_resize" || x.status == "resized"){
                    resizing.push(x.uid)
                }
            })
            if(resizing.length){
                resizing.map(id => {$window.IntervalResize(id)})
            }
        }

        bandWidthSrv.getLimitData().then(function(res) {
            if (res && res.data && res.data.length != 0) {
                self.limitData = JSON.parse(res.data[0].paramValue);
            }
            getInstance();
        });
        

        //不同状态下某些按钮的可操作性
        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            self.conIsEnable = true;
            self.activeEnable = true;
            self.stopEnable = true;
            self.errorEnable = true;
            self.activeIsEnable = true;
            self.addfixIp = true;
            self.removefixIpDis = true;
            self.modifyFixdIpBtn = true;
            self.bindfloatingIps = true;
            self.removefloatIpDis = true;
            self.migrate = true;
            self.suspend = true;
            self.upSuspend = true;
            self.hang = true;
            self.upHang = true;
            self.upgrade = true;
            self.detackDisk = true;
            self.canBak = true;
            self.loading_Disk = true;
            self.loadIptable = true;
            self.change_Mac = true;
            self.edit_Sever = true;
            self.evaDisabled = true;
            self.alarmDisabled = true;
            self.CDdisabled = true;
            self.mountISODis = true;
            self.unmountISODis = true;
            self.oshotgrade = true;
            self.vmSnap = true;
            self.canBackups = true;
            self.vmdiskIdget = true;
            self.vmSnapRollBack = true;
            self.setNICBandDisabled = true;
            self.showSnapRollBack = false;
            self.resetDisabled = true;
            self.canEditPsw = true;
            self.canRebuild = true;
            self.canStockTransfer = true;
            self.coldMigrateBtn = true;
            self.canDoItAnyTime = true ;
            self.canBootMenu = true;
            self.canBackupRestore = true;
            self.canttEquiment = true;
            self.errorStartDisabled = true;
            self.volumeStatusDis = true;
            self.storageLimitImage = true;
            self.limitImageSize = true;
            self.storageLimitMigrate = true;
            self.storageLimitColdMig = true;
            self.canDelSysDistRedio = true;    //只要有一个是本地盘，删除页面单选按钮不可勾选
            self.unhotgrade = true;
            self.canStockTransfer = true;
            self.snapshotRollbackTip = $translate.instant("aws.instances.tip.snapshot_rollback_tip");//快照回滚需要在关机状态
            self.migrateTip = $translate.instant("aws.instances.tip.migrateTip2");
            self.coldMigrateTip = $translate.instant("aws.instances.tip.coldMigrateTip2");
            self.upgradeTip = $translate.instant("aws.instances.tip.resize_tip2");
            self.rebuildTipTip = $translate.instant("aws.instances.tip.rebuildTip");
            self.forceStopTip = $translate.instant("aws.instances.tip.forceStopTip");
            self.errorStartTip = $translate.instant("aws.instances.tip.shutdownTip");
            self.loading_Disk_Tip = $translate.instant("aws.instances.tip.loading_Disk_Tip");
            self.stock_transferTip = $translate.instant("aws.instances.tipMsg.stock_transferTip");
            var activeChk = 0,
                stopChk = 0,
                errorChk = 0,
                paushChk = 0,
                suspendChk = 0,
                rebootChk = 0,
                resizeChk = 0,
                restoreChk = 0;
            if(!value) return;

            //只要有一个是本地盘，删除页面单选按钮不可勾选
            self.canDelSysDistRedio = value.some(function(item){
                return item.startStyle == "Local"
            })

            value.map(function(item) {
                //开机状态的个数
                activeChk += (item.status === "active") || 0;
                //关机状态的个数
                stopChk += (item.status === "shutoff" || item.status === "stopped") || 0;
                //错误状态的个数
                errorChk += (item.status === "error") || 0;
                //暂停状态的个数
                paushChk += (item.status === "paused") || 0;
                //挂起状态的个数
                suspendChk += (item.status === "suspended") || 0;
                //重启状态个数
                rebootChk += (item.status === "reboot_pending" || item.status === "reboot") || 0;
                //调整配置中个数
                resizeChk += (item.status === "resize" || item.status === "resize_prep" || item.status === "resize_migrating" || item.status === "resize_finish" || item.status === "verify_resize" || item.status === "resized") || 0;
            });
            var values = [activeChk, stopChk, errorChk, paushChk, suspendChk,resizeChk];
            if (value.length == 1) {
                //重建云主机操作
                if(((values[0] == 1) || (values[1] == 1)) && value[0].imageName !="" && value[0].task_state == null){
                    self.canRebuild = false;
                } 
                //修改密码操作
                if((values[0] == 1)){
                    self.canEditPsw = false ;
                }
                //关机和开机有关的网络操作
                if ((values[0] == 1) || (values[1] == 1)  || (values[3] == 1)  || (values[4] == 1)) {
                    self.canDoItAnyTime = false ;
                    self.canttEquiment = false;

                    if (value[0].floatingIps) {
                        value[0].floatingIps.length > 0 ? self.removefloatIpDis = false : self.removefloatIpDis = true; //有公网ip时允许操作
                    }
                    if (value[0].fixedIps) {
                        if(value[0].fixedIps.length>0){
                           self.modifyFixdIpBtn = false;
                        }
                        self.setNICBandDisabled = false;
                        value[0].fixedIps.length > 1 ? self.removefixIpDis = false : self.removefixIpDis = true; //私网ip数为1时不允许删除操作。
                        value[0].fixedIps.length <8 ? self.addfixIp = false : self.addfixIp = true; //私网ip数小于8才可进行添加网卡操作
                        value[0].fixedIps.length != value[0].floatingIps.length ? self.bindfloatingIps = false : self.bindfloatingIps = true; //私网ip不等于公网IP数时可以天剑公网ip
                    }
                    //获取详情中云硬盘的各个，判断按钮的状态
                    instancesSrv.getServerDetail(value[0].uid).then(function(result) {
                        if(result && result.data && angular.isArray(result.data.diskInfo)){
                            //企业版系统盘不能卸载
                            if(self.editData.uid ==  result.data.uid){
                                self.editDataCopy = result.data;
                                self.vmdiskInfo = result.data.diskInfo;
                                self.vmdiskIdget = false;
                                self.showSnapRollBack = false;
                                if(values[0] == 1){
                                    // 设备透传的时候，热迁移不可操作
                                   if((!result.data.passthroughDevices)||(result.data.passthroughDevices&&result.data.passthroughDevices.length==0)){
                                       self.migrate = false;
                                   }else{
                                        self.migrateTip = $translate.instant("aws.instances.tip.migrateTip");
                                   }
                               }
                               if(values[1] == 1){
                                   // 设备透传的时候，冷迁移、调整配置不可操作
                                   if((!result.data.passthroughDevices)||(result.data.passthroughDevices&&result.data.passthroughDevices.length==0)){  
                                       self.coldMigrateBtn = false;
                                       self.upgrade = false;
                                   }else{
                                        self.coldMigrateTip = $translate.instant("aws.instances.tip.coldMigrate");
                                        self.upgradeTip = $translate.instant("aws.instances.tip.resize_tip");
                                   }
                               }
                               if(result.data.startStyle == "Local"){
                                    self.upgradeTip = $translate.instant("aws.instances.tip.localTip");
                                    self.migrateTip = $translate.instant("aws.instances.tip.localTip");
                                    //self.makImageTip = $translate.instant("aws.instances.tip.localTip");
                               }
                                if((result.data.startStyle == "EBS" && result.data.diskInfo.length-1) || result.data.startStyle == "Local" ){
                                    self.detackDisk = false;
                                }
                               chktip( result.data);
                               chkRetyping(self.vmdiskInfo);
                               chkTransferRetyping(self.vmdiskInfo);
                                
                            }
                        }else{
                            self.detackDisk = true;
                        }
                    });
                }
                //获取vnc地址
                if (value[0].status == "active") {
                    getConsole(value[0].uid)
                    if(value[0].startStyle != "Local"){
                        self.oshotgradeTip = $translate.instant("aws.instances.tip.not_get_info");
                        getoshotupgrade(value[0].uid)
                    }else{
                        self.oshotgradeTip = $translate.instant("aws.instances.tip.localTip");
                    }
                }
                //备份和制作镜像
                if (value[0].status == "active" 
                || value[0].status == "stopped" 
                || value[0].status == "shutoff" 
                || value[0].status == "paused" 
                || value[0].status == "suspended") {
                    self.canBak = false;
                    self.vmSnap = false;
                    self.canBackups = false;
                    self.makImageTip = $translate.instant("aws.instances.tip.not_get_vmVolume");
                }else{
                    self.makImageTip = $translate.instant("aws.instances.tip.normalStatusTip");
                }
                // 只有错误状态不可操作
                if(((values[0] == 1) || (values[1] == 1) || (values[3] == 1) || (values[4] == 1)|| (values[5] == 1))){
                    self.canDoItAnyTime = false;
                }
            }

            if (rebootChk > 0) {
                self.delsDisabled = true;
            } else {
                self.delsDisabled = false;
            }

            if (value.length != 0) { 
                if (values[0] == value.length) { //开机可操作
                    self.activeEnable = false;
                    self.activeIsEnable = false;
                    self.suspend = false;
                    self.hang = false;
                    if (values[0] == 1) { //单选操作
                        self.loading_Disk = false;
                        self.loadIptable = false;
                        self.edit_Sever = false;
                        self.alarmDisabled = false;
                        self.oshotgrade = false;
                        self.canStockTransfer = false;
                        self.migrateTip = $translate.instant("aws.instances.tip.migrateTip");
                        self.loading_Disk_Tip  = $translate.instant("aws.instances.tip.not_get_vmVolume");
                    }
                } else if (values[1] == value.length) {
                    self.stopEnable = false; //关机允许的操作
                    self.evaDisabled = false;
                    if (values[1] == 1) {
                        self.loading_Disk = false;
                        self.edit_Sever = false;
                        self.alarmDisabled = false;
                        self.CDdisabled = false;
                        self.mountISODis = false;
                        self.unmountISODis = false;
                        self.change_Mac = false;
                        self.vmSnapRollBack = false;
                        self.canBootMenu = false;
                        self.canBackupRestore = false;
                        self.errorStartDisabled = false;
                        self.snapshotRollbackTip = $translate.instant("aws.instances.tip.not_get_vmVolume");//快照回滚需要云主机下云硬盘
                        self.coldMigrateTip = $translate.instant("aws.instances.tip.not_get_vmVolume");
                        self.upgradeTip = $translate.instant("aws.instances.tip.not_get_vmVolume");
                        self.loading_Disk_Tip  = $translate.instant("aws.instances.tip.not_get_vmVolume");
                    }
                } else if (values[2] == value.length) {
                    self.hashost = true;
                    self.checkedItems.map(function(item) {
                        if (!item.hostId) {
                            self.errorEnable = true; 
                            self.hashost = false;
                        }
                    });
                    if (self.hashost) {
                        self.errorEnable = false; //
                    }
                } else if (values[3] == value.length) {
                    self.upSuspend = false; //暂停状态时允许操作
                } else if (values[4] == value.length) {
                    self.upHang = false; //挂起状态时允许操作
                } else if (values[5] > 0){
                    self.delsDisabled = true;
                }
                if(value.length==errorChk){
                    self.resetDisabled = false;
                }
            }

        });

        function getConsole(uid){
            instancesSrv.os_console(uid).then(function(result) {
                self.consoleUrl = encodeURI(result.data);
                var hostname = result.data.split("&");
                var conwatch=self.$watch(function(){
                    return self.checkedItems;
                },function(value){
                    if(value&&value.length == 1 && value[0].name== hostname[1].split("=")[1]){
                        self.conIsEnable = false;
                    }else{
                        self.conIsEnable = true;
                    }
                    conwatch();
                });
            });
        }

        function getoshotupgrade(uid){
            instancesSrv.getHotgrade(uid).then(function(res) {
                if (res && res.data) {
                    self.unhotgrade = !res.data.qga_support;
                    self.hotgradeData = res.data;
                }
                if(self.unhotgrade){
                    self.oshotgradeTip = $translate.instant("aws.instances.tip.oshotgradeTip1");
                } 
            });
        }

        function chkVolSize(){
            var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
            dataclusterSrv.getAllNode(regionUid).then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    res.data.map(item => {
                        item.hostInfo = JSON.parse(item.hostInfo)
                        if(item.hostInfo && item.hostInfo.var_data_size<300 ){
                            self.maxSizeLimit = true;
                        }
                    })
                }
            })
        }
        chkVolSize()

        function chkTransferRetyping(vmdisk){
            if(self.canStockTransfer) return ;
            vmdisk.map(item => {
                if(item.status == "retyping"){
                    self.canStockTransfer = true;
                    self.stock_transferTip = $translate.instant("aws.instances.tipMsg.stock_transferTip1");
                }
            })
        }

        function chkRetyping(vmdisk){
            if(self.loading_Disk) return ;
            vmdisk.map(item => {
                if(item.status == "retyping"){
                    self.loading_Disk = true;
                    self.loading_Disk_Tip = $translate.instant("aws.instances.tip.loading_Disk_Tip1")
                }
            })
        }

        function chktip(editData){
            if(editData.startStyle == "Local"){
                self.volumeStatusDis = false;
                self.storageLimitImage = false;
                self.limitImageSize = false;
                return

            }
            self.vmdiskInfo.map(x => {
                if(x.bootable=="true" && x.root_device == "true" && x.diskFormat !="iso" &&
                 x.associatedHost.indexOf('toyou')>-1 ){
                   self.showSnapRollBack = true;
                }
                if(x.bootable=="true" && x.root_device == "true" && x.diskFormat !="iso"){
                    if(x.status == "in-use"){
                        self.volumeStatusDis = false;
                        if(!self.canBackups && x.storageLimit && !x.storageLimit["os-volume_upload_image"]){
                            self.makImageTip = $translate.instant("aws.instances.tip.storageTypeTip");
                        }else{
                            self.storageLimitImage = false;
                            if(self.maxSizeLimit){
                                if(x.size > 50){
                                    self.makImageTip = $translate.instant("aws.instances.tip.maxSizeTip");
                                }else{
                                    self.limitImageSize = false;
                                }
                            }else{
                                self.limitImageSize = false;
                            }
                        }
                        if(!self.migrate && x.storageLimit && !x.storageLimit["os_hot_migrate"]){
                            self.migrateTip = $translate.instant("aws.instances.tip.storageTypeTip");
                        }else{
                            self.storageLimitMigrate = false;
                        }
                        if(!self.coldMigrateBtn && x.storageLimit && !x.storageLimit["os_cold_migrate"]){
                            self.coldMigrateTip = $translate.instant("aws.instances.tip.storageTypeTip");
                        }else{
                            self.storageLimitColdMig = false;
                        } 
                    }else{
                        if(!self.canBackups && x.status != "in-use"){
                            self.makImageTip = $translate.instant("aws.instances.tip.makImgTip");
                        }
                        if(!self.canRebuild && x.status != "in-use" ){
                            self.rebuildTipTip = $translate.instant("aws.instances.tip.rebuildTip1");
                        }
                        if(!self.migrate && x.status != "in-use"){
                            self.migrateTip = $translate.instant("aws.instances.tip.migrateTip1");
                        }
                        if(!self.coldMigrateBtn && x.status != "in-use"){
                            self.coldMigrateTip = $translate.instant("aws.instances.tip.coldMigrateTip1");
                        }
    
                    }
                }
                
                
            })
           
            self.vmdiskInfoRollBack = self.vmdiskInfo.filter(item => item.associatedHost.indexOf('toyou') == -1);
        }
        //server socket
        self.$on("serverSocket", function(e, data) {
            if (self.tabledata && self.tabledata.length) {
                self.tabledata.map(function(obj) {
                    if (data.eventMata.instance_id) {
                        if (obj.uid === data.eventMata.instance_id) {
                            obj.task_state = data.eventMata.status;
                            obj.status = obj.task_state?obj.task_state:obj.status;
                            if(data.eventMata.host && (data.eventType == "compute.instance.create.end" || data.eventType == "compute.instance.resize.confirm.end")){
                                obj.hostName = data.eventMata.host;
                            }
                            if (data.eventType == "compute.instance.create.end") {
                                data.eventMata.fixed_ips = angular.fromJson(data.eventMata.fixed_ips);
                                var addfixed_ip = data.eventMata.fixed_ips[0].address;
                                obj.fixedIps[0] ? "" : obj.fixedIps.push(addfixed_ip);
                            }
                            if (data.eventType == "compute.instance.soft_delete.end") { //删除
                                _.remove(self.tabledata, function(val) {
                                    return ((val.status == "soft-delete" || val.status == "error" || val.status == "deleted") && val.uid === data.eventMata.instance_id);
                                });
                            }
                            if (data.eventType == "compute.instance.delete.end") { //删除
                                _.remove(self.tabledata, function(val) {
                                    return ((val.status == "error" || val.status == "deleted") && val.uid === data.eventMata.instance_id);
                                });
                            }
                            //热迁移
                            if (data.eventType == "compute.instance.live_migration.post.dest.end") { //确认热迁移
                                obj.hostName = data.eventMata.host;
                            }
                            if(data.eventType == "compute.instance.finish_resize.end" && !self.ADMIN){
                                $window.IntervalResize(data.eventMata.instance_id)
                            }
                        }
                    }

                    //更新公网IP
                    if (data.eventMata.floatingip_id) {
                        if (self.relieveIp && obj.uid == self.relieveIp_uid) {
                            obj.floatingIps = obj.floatingIps.filter(function(item) {
                                return item != self.relieveIp;
                            });
                            self.relieveIp = "";
                            self.relieveIp_uid = "";
                        } else if (self.bindFip && obj.uid == self.bindFip_uid) {
                            obj.floatingIps.push(self.bindFip);
                            self.bindFip = "";
                            self.bindFip_uid = "";
                        }
                    }
                    //更新网卡
                    if (self.removefixedIp && obj.uid == self.removefixedIp_uid) {
                        let tipMsg = $translate.instant("aws.sockets.opLog." + "port.delete.end");
                        alert.set(data.requestId, tipMsg, "success", 5000);
                        
                        //去除掉被移除的网卡
                        let removeAddr=self.removefixedIp.mac_addr;
                        let removeArr=[];
                        obj.netAddresses.forEach(function(item){
                            item.novaAddressList.forEach(function(addr){
                                if(addr['OS-EXT-IPS-MAC:mac_addr']==removeAddr){
                                   removeArr.push(addr.addr);
                                }
                            });
                        });
                        //找到obj.fixedIps与removeArr的不同
                        obj.fixedIps=_.difference(obj.fixedIps,removeArr);
                        obj.floatingIps = obj.floatingIps.filter(function(item) {
                            return item != self.rmfip;
                        });
                        //如果网卡绑定了公网IP，则同时要移除列表中与之对应的公网ip localStorage.rmfip
                        self.removefixedIp = "";
                        self.removefixedIp_uid = "";
                        self.rmfip = "";
                    } else if (self.addFixed_Ip && obj.uid == self.addFixed_uid) {
                        let tipMsg_a = $translate.instant("aws.sockets.opLog." + "port.create.end");
                        alert.set(data.requestId, tipMsg_a, "success", 5000);
                        self.addFixed_Ip = "";
                        self.addFixed_uid = "";
                    } else if (self.updateFixedIp && obj.uid == self.updateFixedIp_uid) {
                        let tipMsg_a = $translate.instant("aws.sockets.opLog." + "fixedip.update.end");
                        alert.set(data.requestId, tipMsg_a, "success", 5000);
                        let ipIndex = _.findIndex(obj.fixedIps,function(ip){
                            return ip == self.updateFixedIp_data.oldIp;
                        });
                        obj.fixedIps.splice(ipIndex,1); //移除修改前的IP（云主机会有不同网络下相同的IP）
                        obj.fixedIps.push(self.updateFixedIp_data.newIp); //底层反应延迟，手动更新
                        self.updateFixedIp = "";
                        self.updateFixedIp_uid = "";
                    }
                });
                
                
                self.tabledata = operateData(self.tabledata);
                self.tableParams.reload();
                self.checkboxes.items = {};
            }
            if(data.eventType == "compute.instance.create.start" 
            || data.eventType == "compute.instance.create.error" 
            || data.eventType == "compute_task.build_instances"    //重建完成后刷新列表
            || data.eventType == "compute.instance.rebuild.end"
            ){  //解决api响应慢，websocket相应快。导致创建失败的时候有个别创建中的状态没有及时更新
                    $timeout(function(){
                        getInstance();
                    },2000)
                }
            
        });
        self.$on("backupSocket", function(e, data){
            if (self.tabledata && self.tabledata.length){
                self.checkboxes.items = {};
            }
        })

        $window.IntervalResize = function(id){
            var flag=false;
            var timer = $timeout(function(){
                instancesSrv.getServerDetail(id).then(function(result){
                    if (result && result.data){
                        result.data.status = result.data.status.toLowerCase();
                        if(result.data.status == "shutoff"){
                            flag = true;
                        }
                        if (self.tabledata && self.tabledata.length){
                            self.tabledata.map(function(obj){
                                if(obj.uid == id){
                                    obj.status = result.data.status;
                                }
                            })
                        }
                    }
                }).finally(function(){
                    if(!flag){
                        $window.IntervalResize(id);
                    }else{
                        $timeout.canel(timer);
                    }
                })
            },5000)
            
            
        }
        $scope.$watch(function() {
            return $routeParams.id;
        }, function(value) {
            $scope.detailIn = value ? true : false;
        });
        $scope.$on("getDetail", function(event, insUid) {

            self.insConfigData = {};
            self.panels = {};
            self.collectCycleList = [
                {name: "5分钟", value: 300},
                {name: "1小时", value: 3600},
                {name: "1天", value: 86400}
            ];
            self.filterData = {
                insUid:insUid,
                timeStep: "",
                from: null,
                to: null,
                precision: self.collectCycleList[0].value,
                definedTimeText: $translate.instant('aws.bill.chooseDate'),
                rangeHours:""
            };
            self.timeType = {
                options: [{
                    "name": $translate.instant('aws.bill.timeType.realTime'),
                    "value": ""
                }, {
                    "name": $translate.instant('aws.bill.timeType.sixHours'),
                    "value": "6h"
                }, {
                    "name": $translate.instant('aws.bill.timeType.oneDay'),
                    "value": "1d"
                }, {
                    "name": $translate.instant('aws.bill.timeType.threeDays'),
                    "value": "3d"
                }, {
                    "name": $translate.instant('aws.bill.timeType.oneWeek'),
                    "value": "7d"
                }]
            };
            self.fliterCard = function(data) {
                if(data && data.length) {
                    var netCard = data.filter(item => item.priority != "c0");
                    return netCard;
                }
            }
            self.tab = {
                active : 0
            }
            self.chartDisplay = function(i) {
                self.tab.active = i
            }
            $("#vmDetailLoadingChart").html("");
            vmFuncSrv.getHostAreaChartFunc(self, hostAreaChartSqlParams, AreaPanelDefault); //cpu、内存、磁盘各指标的监控

            if (vmhostSrv.instanceDataList) {
                _.each(vmhostSrv.instanceDataList, function(item) {
                    if (item.uid == insUid) {
                        self.insConfigData = item;
                    }
                })
            } else {
                instancesSrv.getServerDetail(insUid).then(function(result) {
                    if (result && result.data) {
                        self.insConfigData = result.data;
                    }
                });
            }

            userDataSrv.getRegionData().then(function(res) {
                if (res && res.data) {
                    self.filterData.regionOptions = res.data.filter(item => {
                        return item.status == 3;
                    });
                    self.filterData.region_key = self.filterData.regionOptions[0].regionKey;
                    _.each(self.filterData.regionOptions, item => {
                        if (item.regionKey == localStorage.regionKey) {
                            self.filterData.region_key = item.regionKey;
                        }
                    });
                    // libvirt监控没有mem这个字段
                    vmhostSrv.sqlQuery({
                        "sql": "select * from mem where time > now() - 1m AND code = '" + self.filterData.region_key + "' AND host_type = 'virtual' AND \
                                    vm_id = '" + insUid + "'"
                    }).then(function(res) {
                        res ? self.loadedQueryData = true : false;
                        if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                            self.queryMemNull = false;
                            vmhostSrv.sqlQuery({
                                "sql": "SELECT MAX(used_percent) AS used_percent FROM swap WHERE time > now() - 30m AND code = '" + self.filterData.region_key + "' \
                                            AND host_type = 'virtual' AND vm_id = '" + insUid + "' GROUP BY time(10s)"
                            }).then(function(res) {
                                //先查看Linux的是否有数据
                                if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                                    //有数据就用Linux数据渲染
                                    self.linuxSysVmchart = true;
                                    self.winSysVmchart = false;
                                    self.getHostAreaChart(self.filterData.region_key, insUid, self.filterData);
                                } else {
                                    self.linuxSysVmchart = false;
                                    self.winSysVmchart = true;
                                    self.getHostAreaChart(self.filterData.region_key, insUid, self.filterData, "win");
                                }
                                console.log("linuxSysVmchart:", self.linuxSysVmchart, "winSysVmchart:", self.winSysVmchart);
                            });
                        } else {
                            self.queryMemNull = true;
                        }
                    })
                }
            });
            self.query = function() {
                if (self.linuxSysVmchart) {
                    self.getHostAreaChart(self.filterData.region_key, insUid, self.filterData);
                } else {
                    self.getHostAreaChart(self.filterData.region_key, insUid, self.filterData, "win");
                }
            };
            $scope.insConfigDatas = { status: "empty", cpuConfigData: 0, ramConfigData: 0 };
            $scope.logContent = "";
            $scope.fixedIpPool=[];
            $scope.floatingIpPool=[];
            instancesSrv.getServerDetail(insUid).then(function(result) {
                $scope.insConfigDatas = { status: "empty", cpuConfigData: 0, ramConfigData: 0 };
                $scope.logContent = "";
                $scope.fixedIpPool=[];
                let v4FixedArr=[];
                let v6FixedArr=[];
                $scope.floatingIpPool=[];
                $scope.devicesType = "";
                if (result && result.data) {
                    if($routeParams.id!=insUid){return;}
                    /*让私网ip和公网ip关系对应*/
                    var ipData = [];
                    var floatingIps=[];
                    var netA = result.data.netAddresses;
                    
                    if(result.data.passthroughDevices.length>0){
                        if( result.data.passthroughDevices){
                            var res = result.data.passthroughDevices.some(function(item){
                                return JSON.stringify(item).indexOf("USB")>-1
                            })
                            var res1 = result.data.passthroughDevices.some(function(item){
                                return JSON.stringify(item).indexOf("PCI")>-1
                            })
                            if(res&&!res1){
                                $scope.devicesType = "USB"
                            }else if(!res&&res1){
                                $scope.devicesType = "PCI"
                            }else if(res&&res1){
                                $scope.devicesType = "USB/PCI"
                            }else{
                                $scope.devicesType = "暂无"
                            }
                        }
                    }else{
                        $scope.devicesType = "暂无"
                    }
                    
                    if(netA.length){
                        for(var i=0;i<netA.length;i++){
                            ipData = ipData.concat(netA[i].novaAddressList)
                        }
                    }
                    //
                    // $scope.fixedIpPool = ipData.filter(item=>{
                    //     return item['OS-EXT-IPS:type']=='fixed'
                    // });
                    //过滤出私网ip
                    let fixedIpArr=ipData.filter(item=>{
                        return item['OS-EXT-IPS:type']=='fixed'
                    });
                    fixedIpArr.forEach(function(item){
                        if(item['version']==4){
                           item.addr=item.addr+"(ipv4)";
                           v4FixedArr.push(item); 
                        }else if(item['version']==6){
                           item.addr=item.addr+"(ipv6)";
                           v6FixedArr.push(item);
                        }
                    });
                    v4FixedArr.forEach(function(v4Item){
                        v6FixedArr.forEach(function(v6Item){
                            if(v4Item['OS-EXT-IPS-MAC:mac_addr']==v6Item['OS-EXT-IPS-MAC:mac_addr']){
                                v4Item.addr=v4Item.addr+"</br>"+v6Item.addr;
                            }
                        });
                    });
                    $scope.fixedIpPool=v4FixedArr;
                    floatingIps = ipData.filter(item=>{
                        return item['OS-EXT-IPS:type']=='floating'
                    });
                    $scope.fixedIpPool.forEach(function(item,i){
                        item.addr = "网卡:"+item.addr;
                        var floatIp=floatingIps.filter(floatIp=>{
                            return floatIp['OS-EXT-IPS-MAC:mac_addr']==item['OS-EXT-IPS-MAC:mac_addr']
                        });
                        if(floatIp.length==1){
                            floatIp[0].addr = "公网IP:"+floatIp[0].addr;
                        }else if(floatIp.length==0){
                            var obj={
                                'addr': "网卡:"+$translate.instant("aws.instances.none")
                            }
                            floatIp.push(obj);
                        }
                        $scope.floatingIpPool=$scope.floatingIpPool.concat(floatIp);
                    })

                    result.data.diskInfo.map( item=> {
                        if(item.bootable == "true" && item.root_device == "true" && item.diskFormat !="iso" ) {
                            item.isbootable = $translate.instant("aws.common.systemDisk");
                        }else {
                            item.isbootable = $translate.instant("aws.common.dataDisk");
                        }
                    } )

                    result.data.status = result.data.status.toLowerCase();
                    result.data.statusTr = $translate.instant('aws.instances.table.status.'+result.data.status);
                    
                    // result.data.diskNewName = "";
                    // for (var i = 0; i < result.data.diskInfo.length; i++) {
                    //     if (i != result.data.diskInfo.length - 1) {
                    //         result.data.diskNewName = result.data.diskNewName + result.data.diskInfo[i].name +"(" +result.data.diskInfo[i].type + ")" + "," + " ";
                    //     } else {
                    //         result.data.diskNewName = result.data.diskNewName + result.data.diskInfo[i].name +"(" +result.data.diskInfo[i].type + ")";
                    //     }
                    // }
                    if (result.data.status != "error" &&  result.data.status != "build") {
                        instancesSrv.getServerLog(insUid).then(function(result) {
                            if (result) {
                            	if(result.data ==""){
                            		 $scope.logContent = '暂无日志信息';
                            	}else{
                            		 $scope.logContent = result.data.replace(/\n/g, "<br\/>");
                            	}
                            }
                        });
                    }
                    $scope.insConfigDatas = result.data;

                    var ram = 0;
                    $scope.insConfigDatas.cpuConfigData = Number(result.data.vcpus);
                    ram = Number(result.data.ram/1024);
                    $scope.insConfigDatas.ramConfigData = Math.ceil(ram) == ram?ram:ram.toFixed(1);

                    //获取云主机网卡对应的带宽
                    $scope.insConfigDatas.nic_bandwidth = [];
                    for(let key in result.data.bandwidth){
                        if(key.indexOf("quota:vif_inbound_average") > -1){
                            delete result.data.bandwidth[key];
                        }
                    }
                    instancesSrv.getServerNetwork(insUid).then(function(res) {
                        if (res && res.data && res.data.length) {
                            let allNic_ip = [];
                            let existBand_nicIp = [];
                            _.each(res.data,function(item){
                                allNic_ip.push(item.fixed_ips[0].ip_address);
                                for(let key in result.data.bandwidth){
                                    let nic_bandwidth = Number(result.data.bandwidth[key])/128;
                                    if(key.indexOf(item.mac_addr) > -1){
                                        existBand_nicIp.push(item.fixed_ips[0].ip_address);
                                        if(nic_bandwidth == 0){
                                            $scope.insConfigDatas.nic_bandwidth.push(item.fixed_ips[0].ip_address + " : " + $translate.instant("aws.networks.noLimit"));
                                        }else{
                                            $scope.insConfigDatas.nic_bandwidth.push(item.fixed_ips[0].ip_address + " : " + Number(result.data.bandwidth[key])/128 + "  Mbps " );
                                        }
                                    }
                                }
                            })
                            _.each(_.difference(allNic_ip,existBand_nicIp),function(nic_ip){
                                 $scope.insConfigDatas.nic_bandwidth.push(nic_ip + " : " + $translate.instant("aws.networks.noLimit"));
                            })
                            $scope.insConfigDatas.nic_bandwidth = _.uniq($scope.insConfigDatas.nic_bandwidth);
                        }
                    });
                }
            });
        });
        $scope.$on("refreshInstance", function() {
            getInstance();
        });

        //新建云主机
        self.insAnimation = "animateOut";
        self.newInstance = function() {
            self.insAnimation = "animateIn";
            $("body").addClass("animate-open")
        };
        self.closeNewIns = function(){
            self.insAnimation = "animateOut";
            $("body").removeClass("animate-open")
        }
        self.$on("newIns",function(){
            self.insAnimation = "animateOut";
            $("body").removeClass("animate-open");
            getInstance();
        })
        //云主机创建快照
        self.createSnap = function(editData) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/cvm/instances/tmpl/createSnap.html",
                controller: "createSnapCtrl",
                resolve: {
                    editData: editData
				}

            });
        };
         //云主机快照回滚
        self.snapRollBack = function() {
            if(!self.vmSnapRollBack && !self.vmdiskIdget){
                var vmdiskInfo = self.vmdiskInfo; 
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "os-snap-rollback.html",
                    controller: "snapRollBackCtrl",
                    resolve: {
                        vmdiskInfo: function(){
                            return vmdiskInfo
                        }
                    }

                });
            }
            
        };
        //获取项目中的总配额
        function getproQuotas() {
            var insQuotapost = {
                type: "project_quota",
                targetId: localStorage.projectUid,
                enterpriseUid: localStorage.enterpriseUid
            };
            cvmViewSrv.getproQuotas(insQuotapost).then(function(result) {
                if (result && result.data && result.data.length) {
                    _.forEach(result.data, function(item) {
                        if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                            self[item.name + "quota"].total = item.defaultQuota || item.hardLimit;
                        }
                    });
                }
            });
        }
        //获取项目中配额的使用量
        function getProused() {
            self.instancesquota = {};
            self.coresquota = {};
            self.ramquota = {};
            var postData = {
                type: "project_quota",
                domainUid: localStorage.domainUid,
                projectUid: localStorage.projectUid,
                enterpriseUid: localStorage.enterpriseUid
            };
            cvmViewSrv.getProused(postData).then(function(result) {
                if (result && result.data && result.data.length) {
                    _.forEach(result.data, function(item) {
                        if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                            self[item.name + "quota"].used = item.inUse;
                        }
                    });
                }
                getproQuotas();
            });
            
        }
        //获取部门中的总配额
        function getDomQuotas() {
            depviewsrv.getQuotaTotal(localStorage.domainUid).then(function(result) {
                if (result && result.data && result.data.length) {
                    _.forEach(result.data, function(item) {
                        if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                            self[item.name + "Domquota"].total = item.defaultQuota || item.hardLimit;
                        }
                    });
                }
            });
        }
        //获取部门中配额的使用量
        function getDomused() {
            self.instancesDomquota = {};
            self.coresDomquota = {};
            self.ramDomquota = {};
            depviewsrv.getQuotaUsed(localStorage.domainUid).then(function(result) {
                if (result && result.data && result.data.length) {
                    _.forEach(result.data, function(item) {
                        if (item.name == "instances" || item.name == "cores" || item.name == "ram") {
                            self[item.name + "Domquota"].used = item.inUse;
                        }
                    });
                }
                getDomQuotas();
            });
           
        }

        //选中多个
        self.chkSome = function() {
            var chkGroup = [];
            var itemGroup = [];
            var names = [];
            var postData = {
                id: { ids: chkGroup },
                items: itemGroup,
                names:names
            };
            _.forEach(self.tableParams.data, function(group) {
                if (self.checkboxes.items[group.uid]) {
                    chkGroup.push(group.uid);
                    itemGroup.push(group);
                    names.push(group.name);
                }
            });
            return postData;
        };
        //开启虚拟机
        self.startServer = function(checkedItems) {
            var post = [];
            var content = {
                target: "startServer",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.startServer") + "</span>",
                type: "info",
                btnType: "btn-primary"
            };
            checkedItems.map(item=>{
                post.push({uid:item.uid,name:item.name})
            })
            instancesSrv.getRestoringVolServer(post).then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    if(res.data.length>0){
                        content.msg = "<span>"+ res.data.toString() +"虚拟机存在正在备份还原或快照回滚的云硬盘，无法开机"+"</span>";
                        content.notDel = true;
                    }
                    self.$emit("delete", content);
                }
                
            })
            
        };
        self.$on("startServer", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"power_on")
            instancesSrv.startServer(self.chkSome().id).then(function(result) {
                self.checkboxes.items = {};
                

            });
        });
        //关闭虚拟机
        self.stopServer = function() {
            var content = {
                target: "stopServer",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.stopServer") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("stopServer", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"power_off")
            instancesSrv.stopServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};

            });
        });
        //删除虚拟机
        self.delSever = function() {
            commonFuncSrv.deleteInstance(self,self.chkSome().id.ids,self.checkedItems);
        };
        //删除虚拟机
        self.forceDelSever = function() {
            var data = {
                uid:self.chkSome().id.ids
            };
            //判断该主机下是否有定时快照
            checkScheduleJob(self,data,"","instance-force-delete")
        };
       
        function emitDel(show_del_job_tip,data,type){
            var scope = $rootScope.$new();
            var modal_os_delete= $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-delete.html",
                scope: scope
            });
            scope.canDelSysDistRedio = self.canDelSysDistRedio;
            scope.show_del_job_tip = show_del_job_tip;
            scope.del = {
                "job":data,
                "flag":true
            }
            scope.confirmDel = function(){
                var  ids = self.chkSome().id.ids;
                checkedSrv.setChkIds(ids,"delete")
                if(type == "instance-soft-delete"){
                    if(show_del_job_tip){
                        delTaskBatch(scope.del.job)
                    }
                    instancesSrv.delServer(self.chkSome().id,scope.del.flag).then(function() {
                    });
                }else if(type == "instance-force-delete"){
                    if(show_del_job_tip){
                        delTaskBatch(scope.del.job)
                    }
                    instancesSrv.osForceDel(self.chkSome().id).then(function() {
                    });
                }
                modal_os_delete.close()
            }
        }
        function delTaskBatch(data){
            var jobids = data;
            if(data && data.length){
                regularSnapSrv.delTaskBatch({ids:data}).then(function(){
                })
            }
        }
        
        //重置虚拟机
        self.reset = function() {
            if(self.resetDisabled) return;
            var content = {
                target: "resetIns",
                msg: "<span>该操作仅限于运维操作，请在重置前确认虚拟机状态</span>"
            };
            self.$emit("delete", content);
        };
        self.$on("resetIns", function() {
            var  ids = self.chkSome().id.ids;
            var data = {
                ids:ids,
                names:self.chkSome().names
            };
            instancesSrv.resetVm(data).then(function() {
                getInstance();
            });
        });
        //重启虚拟机
        self.reboot = function() {
            var content = {
                target: "rebootIns",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.reboot") + "</span>",
                type: "info",
                btnType: "btn-primary"
            };
            self.$emit("delete", content);
        };
        self.$on("rebootIns", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"reboot")
            instancesSrv.rebootServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};
            });
        });
        //强制关机
        self.shutdown = function() {
            if(self.errorEnable) return;
            var content = {
                target: "shutdownIns",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.shutdown") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("shutdownIns", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"power_off");
            instancesSrv.shutdownServer(self.chkSome().id).then(function() {
                localStorage.shutdown_handle = true;
                self.checkboxes.items = {};
            });
        });
        //暂停云主机
        self.osSuspend = function() {
            var content = {
                target: "suspendIns",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.osSuspend") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("suspendIns", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"pause");
            instancesSrv.suspendServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};
            });
        });
        //暂停恢复云主机
        self.osUpPause = function() {
            var content = {
                target: "unPauseIns",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.osUpPause") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("unPauseIns", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"unpause");
            instancesSrv.unPauseServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};
            });
        });
        //挂起云主机
        self.osHang = function() {
            var content = {
                target: "hangIns",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.osHang") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("hangIns", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"suspend");
            instancesSrv.hangServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};
            });
        });
        //恢复挂起云主机
        self.osUpHang = function() {
            var content = {
                target: "unhangIns",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.osUpHang") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("unhangIns", function() {
            var  ids = self.chkSome().id.ids;
            checkedSrv.setChkIds(ids,"resume");
            instancesSrv.upHangServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};
            });
        });
        //编辑主机名
        self.editSever = function(editData) {
            var scope = $rootScope.$new();
            var modal_os_edit = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "update-os-edit.html",
                scope: scope
            });
            scope.hostName = editData.name;
            return modal_os_edit.result.then(function(hostName) {
                var postData = {
                    name: hostName
                };
                instancesSrv.editServer(editData.uid, postData).then(function(result) {
                    if (result && result.status == 0) {
                        $rootScope.$broadcast("alert-success", 0);
                    } else {
                        $rootScope.$broadcast("alert-error", 1);
                    }
                    getInstance();
                });
            });
        };
        //添加网卡和移除网卡
        self.updateNetwork = function(type, editData) {

            var scope = $rootScope.$new();
            var modal_os_net = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: type=="remove"?"update-os-net-another.html":"update-os-net-add.html",
                scope: scope
            });
            scope.type = type
            scope.netWorkCard = {};
            scope.network = {
                assignIP: false,
                init_cidr: {
                    ip_0: "",
                    ip_1: "",
                    ip_2: "",
                    ip_3: ""
                }
            };
            scope.submitInValid = false;
            var eventMata = { eventMata: "" };
            scope.field_form = {};
            scope.interacted = function(field) {
                scope.field_form.netForm = field;
                return scope.submitInValid || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
            };
            var chkPortPolicyFun = function(){
                if(scope.network.selected.subnets[scope.network.selected.sub_key].tenantId == localStorage.projectUid || localStorage.managementRole == "2"){
                    scope.portPolicyForbidden = false;
                    scope.rebootInsTip = true;
                }else{
                    scope.portPolicyForbidden = true;
                    scope.rebootInsTip = false;
                }
            };

            scope.changeNet = function(net) {
                if (type == "remove") {
                    return;
                }
                scope.repeatIp = false;
                scope.portPolicyForbidden = false;
                scope.cannot_Confirm = false;
                scope.validForm = false;
                scope.subSegmentList = [];
                if(scope.networkList_extend){
                    _.each(scope.networkList_extend,function(item){
                        if(item.id == net.id){
                            item.sub_name = item.net_sub_name.split("---")[1];
                            scope.subSegmentList.push(item);
                        }
                    });
                    scope.network.subSegment = scope.subSegmentList[0];
                    scope.changeSubSegment(scope.network.subSegment);
                }else{
                    scope.changeSubSegment(net);
                }
               
            };
            scope.changeSubSegment = function(net){
                scope.network = {
                    selected: scope.network.selected,
                    assignIP: scope.network.assignIP,
                    init_cidr: {
                        ip_0: "",
                        ip_1: "",
                        ip_2: "",
                        ip_3: ""
                    },
                    subSegment:scope.network.subSegment,
                    secSelected:scope.network.secSelected
                };
                
                if(type == "update"){
                    chkPortPolicyFun();
                }
                let startIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start.split(".");
                let endIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end.split(".");
                scope.compareIpFun(startIp_list,endIp_list);
                
            };
            scope.mouseNet = function(network,type){
                scope.net_subSegDetail = angular.copy(scope.networkList_extend);
                _.map(scope.net_subSegDetail,function(item){
                    if(item.id == network.id){
                        item.sub_name = item.net_sub_name.split("---")[1];
                        if(type == "over"){
                             item.showSubSegDetail = true;
                         }else{
                             item.showSubSegDetail = false;
                         }
                        return item 
                    }
                });
            };
            scope.focusInput = function() {
                scope.repeatIp = false;
                scope.cannot_Confirm = false;
                scope.validForm = false;
            };
            scope.addNetCard = false;
            scope.modifyFixdIp = false;
            avoidDoubleClick(scope,false)
            switch (type) {
                case "add":
                    scope.netTitle = $translate.instant("aws.instances.net.addNet");
                    scope.ipLabel = $translate.instant("aws.instances.addinstances.ipAddr");
                    scope.addNetCard = true;
                    scope = commonFuncSrv.settingIpFunc(scope,"network","netForm");
                    scope.setCheckValueFunc = function(){
                        let net = scope.network.subSegment;
                        let startIp = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start;
                        let endIp = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end;
                        scope.checkValue(startIp,endIp);
                    };
                    //获取安全组列表
                     getServerSecGroup(scope,"",editData)
                    //获取该项目下的网卡
                    instancesSrv.getProjectNetwork().then(function(result) {
                        if (result && result.data && angular.isArray(result.data) ) {
                            result.data.forEach(function(item){
                                item.subnets=item.subnets.filter(function(subnet){
                                    return subnet.ipVersion=='4';
                                });
                            });
                            scope.networkList = result.data.filter(function(item) {
                                return item.subnets.length; //没有绑定子网的交换机创建云主机时不能使用
                            });
                            //定制开发，如果为非admin用户，添加网卡过滤掉公网
                            if(!$rootScope.customizedIsAdmin){
                                scope.networkList = result.data.filter(function(item) {
                                    return !item.external; 
                                });
                            }
                            scope.networkList_extend = [];
                            _.each(scope.networkList, function(item) {
                                //创建网络时一个交换机对应一个子网的限制放开，一个交换机可以有多个子网，一个子网又可以有多个IP地址池
                                for(let i=0;i<item.subnets.length;i++){
                                    for(let j=0;j<item.subnets[i].allocationPools.length;j++){
                                        item.net_sub_name = item.name + "---" + item.subnets[i].name + "(" + item.subnets[i].allocationPools[j].start + "~" + item.subnets[i].allocationPools[j].end + ")";
                                        item.displayName = item.name;
                                        item.sub_key = i;
                                        item.allocationPool_key = j; 
                                        item.subnet_id=item.subnets[i].id;
                                        scope.networkList_extend.push(angular.copy(item));
                                    }
                                }
                            });

                            scope.network.selected = scope.networkList[0];
                            scope.subSegmentList = [];
                            _.each(scope.networkList_extend,function(item){
                                if(item.id == scope.network.selected.id){
                                    item.sub_name = item.net_sub_name.split("---")[1];
                                    scope.subSegmentList.push(item);
                                }
                            });
                            scope.network.subSegment = scope.subSegmentList[0];
                            let net = scope.network.subSegment;
                            let startIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start.split(".");
                            let endIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end.split(".");
                            scope.compareIpFun(startIp_list,endIp_list);
                        }
                    });
                    scope.confirm = function(upNet, netForm) {
                        var postData = {};
                        var addNetCard = function(postData) {
                            self.addfixIp=true;
                            self.addFixed_Ip = true;
                            self.addFixed_uid = editData.uid;
                            instancesSrv.addNetwork(editData.uid, postData.fixdIps, postData.networkid).then(function(result) {
                                if(result.status == 0){
                                    var postData = {
                                        id:result.data.port_id,
                                        secGroup:[scope.network.secSelected.id]
                                    }
                                    instancesSrv.updatePortSecurity(postData).then(function(result){
                                    })
                                }
                                var sec = scope.network.secSelected;
                                $rootScope.$broadcast("serverSocket", eventMata);
                                getInstance();
                            }).finally(function(){
                                self.addfixIp=false;
                            });
                            scope.addNetMsgModal.close();
                        }
                        scope.addNetMsgConfirm=function(scope,addNetCard){
                            scope.addNetMsgModal = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: "addNetMsg.html",
                                scope: scope,
                            });
                            scope.MsgConfirm=addNetCard;
                        }
                        if (netForm.$valid) {
                            postData = {
                                "networkid": {
                                    "networkid": upNet.id
                                },
                                "fixdIps": []
                            };
                            avoidDoubleClick(scope,true)
                            scope.validForm = true;
                            //勾选配置ip
                            if (scope.network.assignIP) {
                                let ip_address = scope.network.init_cidr.ip_0 + "." + scope.network.init_cidr.ip_1 + "." + scope.network.init_cidr.ip_2 + "." + scope.network.init_cidr.ip_3;
                                postData.fixdIps = [{
                                    "ip_address": ip_address
                                }];
                                scope.setCheckValueFunc();
                                if (scope.field_form.netForm.$valid) {
                                    let existedIps = [];
                                    networksSrv.getNetworksDetail(scope.network.selected.id).then(function(res) {
                                        if (res && res.data) {
                                            _.each(res.data, function(item) {
                                                _.each(item.subnetIps, function(sub) {
                                                    existedIps.push(sub.ip_address);
                                                })
                                            })
                                            if (!_.include(existedIps, ip_address)) {
                                                //网关ip没有被占用添加网卡（判断子网是否有网关ip）
                                                scope.postData=angular.copy(postData);
                                                networksSrv.getSubnetDetail(scope.network.subSegment.subnet_id).then(function(res){
                                                     if(res&&res.data&&angular.isObject(res.data)){
                                                        if(res.data.gateway_ip){
                                                           scope.hasGateway=true;
                                                        }else{
                                                           scope.hasGateway=false;
                                                        }
                                                        modal_os_net.close();
                                                        scope.addNetMsgConfirm(scope,addNetCard)
                                                     }
                                                });
                                            } else {
                                                scope.repeatIp = true;
                                                scope.validForm = false;
                                            }
                                        }
                                    });
                                } else {
                                    scope.submitInValid = true;
                                    scope.validForm = false;
                                }
                            }else{
                            //没有勾选配置ip,判断所选网络下的子网是否有子网存在网管ip
                                scope.postData=angular.copy(postData);
                                scope.hasGateway=false;
                                scope.network.selected.subnets.forEach(function(subnet){
                                     if(subnet.gatewayIp){
                                        scope.hasGateway=true;
                                        return;
                                     }
                                });
                                modal_os_net.close();
                                scope.addNetMsgConfirm(scope,addNetCard)
                            }
                        } else {
                            scope.submitInValid = true;
                            scope.validForm = false;
                        }

                    };
                    break;
                case "remove":
                    scope.netTitle = $translate.instant("aws.instances.net.removeNet");
                    var floatingIpList = [];
                    floatipsSrv.getFloatipsTableData().then(function(res) {
                        if (res && res.data) {
                            floatingIpList = res.data;
                        }
                    }).then(function() {
                        instancesSrv.getServerNetwork(editData.uid).then(function(result) {
                            scope.networkList = [];
                            if (result && result.data && result.data.length) {
                                result.data.map(function(item) {
                                    let ip_address=item.fixed_ips.filter(function(ip){
                                        return ip.ip_address.indexOf(":")<0;
                                    });
                                    scope.networkList.push({
                                        id: item.port_id,
                                        net_sub_name: ip_address[0].ip_address,
                                        displayName: ip_address[0].ip_address,
                                        mac_addr:item.mac_addr
                                    });
                                });
                                scope.network.selected = scope.networkList[0];
                            }
                        });
                    });
                    scope.confirm = function(upNet, netForm) {
                        if (netForm.netName.$valid) {
                            var postData = {
                                portid: upNet.id
                            };
                            // editData.fixedIps.map(function(item, index) {
                            //     if (item == upNet.net_sub_name) {
                            //         self.rmfip = editData.floatingIps[index];
                            //     }
                            // });
                            floatingIpList.forEach(item=>{
                                if(item.fixedIP == upNet.net_sub_name){
                                    self.rmfip = item.ip;
                                }
                            });
                            modal_os_net.close();
                            instancesSrv.removeNetwork(editData.uid, postData).then(function() {
                                //self.removefixedIp = upNet.net_sub_name;
                                self.removefixedIp = upNet;
                                self.removefixedIp_uid = editData.uid;
                                $rootScope.$broadcast("serverSocket", eventMata);
                            });
                        } else {
                            scope.submitInValid = true;
                        }
                    };
                    break;
                case "update":
                    scope.netTitle = $translate.instant("aws.instances.modifyFixedIp");
                    scope.ipLabel = $translate.instant("aws.instances.addinstances.modifyAs");
                    scope.modifyFixdIp = true;
                    scope = commonFuncSrv.settingIpFunc(scope,"network","netForm");
                    scope.setCheckValueFunc = function(){
                        let net = scope.network.selected;
                        let startIp = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start;
                        let endIp = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end;
                        scope.checkValue(startIp,endIp);
                    };
                    var fixedIP_floatingIp = {};
                    var permission = localStorage.permission;
                    if (permission == "enterprise") {
                        instancesSrv.osInterfaceFips(editData.uid).then(function(result) {
                            if (result && result.data) {
                                _.each(result.data, function(item) {
                                    fixedIP_floatingIp[(item.name.split("_")[0]).toString()] = item.name.split("_")[1];
                                })
                            }
                        });
                    }

                    // var getContinueNum = function(min,max){
                    //     let numlist = [];
                    //     for(let i = min ; i <= max ; i++){
                    //         numlist.push(i);
                    //     }
                    //     return numlist;
                    // };

                    // var getIpPools = function(allocationPools){
                    //     let pools = {};
                    //     _.each(allocationPools,function(item,i){
                    //         pools[i] = getContinueNum(_IP.toLong(item.start),_IP.toLong(item.end));
                            
                    //     });
                    //     return pools; //返回IP pool
                    // };
                     
                    var getIpPoolsZone = function(allocationPools) {
                        let pools = {};
                        _.each(allocationPools, function(item, i) {
                            pools[i] = [_IP.toLong(item.start), _IP.toLong(item.end)];
                        });
                        return pools; //返回所有IP池的IP范围
                    };

                    instancesSrv.getServerNetwork(editData.uid).then(function(res) {
                        if (res && res.data) {
                            return res.data;
                        }
                    }).then(function(osinterface) {
                        instancesSrv.getProjectNetwork().then(function(result) {
                            if (result && result.data && result.data.length) {
                                var tmpList = []
                                _.each(osinterface, function(insNet) {
                                    _.each(result.data, function(item) {
                                        if (item.subnets.length && insNet.net_id && insNet.net_id == item.id) { //没有绑定子网的交换机创建云主机时不能使用
                                            item = angular.copy(item);
                                            //item.fixed_ips = insNet.fixed_ips;
                                            item.fixed_ips=angular.copy(insNet.fixed_ips).filter(function(fixed_ip){
                                                return fixed_ip.ip_address.indexOf(":")<0;
                                            });
                                            item.net_sub_name = item.fixed_ips[0].ip_address;
                                            item.displayName = item.fixed_ips[0].ip_address;
                                            item.port_id = insNet.port_id;
                                            //判断该私网IP在哪一个子网中
                                            for(let i=0;i<item.subnets.length;i++){
                                                if(item.fixed_ips[0].subnet_id == item.subnets[i].id){
                                                    item.sub_key = i;
                                                    break;
                                                }
                                            }
                                            //判断该私网IP在子网的哪一个IP地址池中
                                            // let pools = getIpPools(item.subnets[item.sub_key].allocationPools);
                                            // for(let key in pools){
                                            //     if(_.include(pools[key],_IP.toLong(item.fixed_ips[0].ip_address))){ //ip 地址池是不可能交叉重叠的，所以一个IP只能是在一个IP地址池中
                                            //         item.allocationPool_key = key;
                                            //         break;
                                            //     }
                                            // }
                                            let pools = getIpPoolsZone(item.subnets[item.sub_key].allocationPools);
                                            let fixedIpAddr = _IP.toLong(item.fixed_ips[0].ip_address);
                                            for (let key in pools) {
                                                if (fixedIpAddr >= pools[key][0] && fixedIpAddr <= pools[key][1]) {
                                                    item.allocationPool_key = key;
                                                    break;
                                                }
                                            }
                                            tmpList.push(item);
                                        }
                                    })
                                });
                                scope.networkList = tmpList;
                                scope.network.selected = scope.networkList[0];
                                chkPortPolicyFun();
                                let net = scope.network.selected;
                                let startIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].start.split(".");
                                let endIp_list = net.subnets[net.sub_key].allocationPools[net.allocationPool_key].end.split(".");
                                scope.compareIpFun(startIp_list,endIp_list);
                            }
                        });
                    });
                    scope.confirm = function(formdata, form) {
                        scope.setCheckValueFunc();
                        if (form.$valid) {
                            scope.validForm = true;
                            let postData = {
                                "port_id": formdata.port_id,
                                "floating_ip": fixedIP_floatingIp[formdata.net_sub_name] ? fixedIP_floatingIp[formdata.net_sub_name] : "" //获取内网IP所关联的外网IP
                            };
                            let ip_address = scope.network.init_cidr.ip_0 + "." + scope.network.init_cidr.ip_1 + "." + scope.network.init_cidr.ip_2 + "." + scope.network.init_cidr.ip_3;
                            postData.ip_address = ip_address;

                            let existedIps = [];
                            networksSrv.getNetworksDetail(scope.network.selected.id).then(function(res) {
                                if (res && res.data) {
                                    _.each(res.data, function(item) {
                                        _.each(item.subnetIps,function(sub){
                                            existedIps.push(sub.ip_address);
                                        })
                                    })
                                    if (!_.include(existedIps, ip_address)) {
                                        instancesSrv.modifyInterface(postData).then(function(res) {
                                            if (res && !res.data) {
                                                self.updateFixedIp = true;
                                                self.updateFixedIp_uid = editData.uid;
                                                self.updateFixedIp_data = {
                                                    "newIp": ip_address,
                                                    "oldIp": formdata.fixed_ips[0].ip_address
                                                };
                                                $rootScope.$broadcast("serverSocket", eventMata);
                                                //getInstance();
                                            }
                                        });
                                        modal_os_net.close();
                                    } else {
                                        scope.repeatIp = true;
                                        scope.validForm = false;
                                    }
                                }
                            });
                        } else {
                            scope.submitInValid = true;
                            scope.validForm = false;
                        }
                    };
            }
        };
        //带宽调整
        self.modifyBandwidth = function(editData) {
            var scope = self.$new();
            var modifyBandwidthModal = $uibModal.open({
                animation: true,
                templateUrl: "modifyBandwidthModal.html",
                scope: scope
            });
            modifyBandwidthModal.rendered.then(function(){
                scope.submitInValid = false;
                scope.network = {
                    limit:false
                };
                scope.networkList = [];
                if(editData.tags && editData.tags.length){
                    _.each(editData.tags,function(tag){
                        if(tag.indexOf("qos_limit")>-1){
                            let networkBandwidth_Mbps = Number(tag.split(":")[1])/128;
                            scope.network.networkBandwidth =Math.ceil(networkBandwidth_Mbps) == networkBandwidth_Mbps?networkBandwidth_Mbps:networkBandwidth_Mbps.toFixed(2);
                        }
                    })
                }
                //获取云主机网卡
                instancesSrv.getServerNetwork(editData.uid).then(function(result) {
                    if (result && result.data && result.data.length) {
                        result.data.map(function(item) {
                            scope.networkList.push({
                                id: item.port_id,
                                displayName :item.fixed_ips[0].ip_address,
                                mac_addr:item.mac_addr
                            });
                        });
                        scope.network.selected = scope.networkList[0];
                        //获取网卡带宽信息
                        instancesSrv.getNetcardBandwidth(editData.uid).then(function(res){
                            if(res && res.data){
                                scope.NICs_bandwidth = res.data;
                                for(let key in scope.NICs_bandwidth){
                                    if(key.indexOf(scope.network.selected.mac_addr) > -1){
                                        scope.network.networkBandwidth = Number(scope.NICs_bandwidth[key])/128;
                                    }
                                }
                                if(scope.network.networkBandwidth == 0 || !scope.network.networkBandwidth){
                                    scope.network.limit = true;  //无限制
                                    scope.network.networkBandwidth = "";
                                }else{
                                    scope.network.limit = false;
                                }
                            }
                        })
                    }
                });
                
                scope.changeNet = function(net,modifyBandwidthForm){
                    scope.modifyBandwidthForm = modifyBandwidthForm;
                    scope.submitInValid = false;
                    scope.network.limit = true;  //无限制
                    scope.network.networkBandwidth = "";
                    scope.modifyBandwidthForm.bandwidth.$dirty = true;
                    scope.modifyBandwidthForm.bandwidth.$valid = false;
                    for(let key in scope.NICs_bandwidth){
                        if(key.indexOf(net.mac_addr) > -1){
                            scope.network.networkBandwidth = Number(scope.NICs_bandwidth[key])/128;
                            scope.modifyBandwidthForm.bandwidth.$dirty = false;
                            scope.modifyBandwidthForm.bandwidth.$valid = true;
                            break;
                        }else{
                            scope.network.networkBandwidth = "";
                        }
                    }
                    if(scope.network.networkBandwidth == 0 || !scope.network.networkBandwidth){
                        scope.network.limit = true;  //无限制
                        scope.network.networkBandwidth = "";
                    }else{
                        scope.network.limit = false;
                    }
                };
                
                scope.cfmBandwidth = function(modifyBandwidthForm,limitType){
                    if(modifyBandwidthForm.$valid || (scope.network.networkBandwidth && !scope.modifyBandwidthForm.bandwidth.$dirty) || scope.network.limit ){
                        if(scope.network.limit){ //无限制
                            scope.network.networkBandwidth = 0;
                        }
                        let params = {
                            serverId:editData.uid,
                            serverName:editData.name,
                            data:{
                              "mac_addr":scope.network.selected.mac_addr,
                              "inbound_average": (Number(scope.network.networkBandwidth)*128).toString(),
                              "outbound_average": (Number(scope.network.networkBandwidth)*128).toString()
                            }
                        };
                        instancesSrv.editNICBandwidth(params).then(function(res){
                            getInstance();
                        });
                        modifyBandwidthModal.close();
                    }else{

                        scope.submitInValid = true;
                    }
                };
            });
        };

        //绑定公网IP和解除公网IP绑定
        self.bindFloatingIp = function(type, editData) {
            //var scope = $rootScope.$new();
            var scope = $scope;
            var modal_os_ip = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "update-os-FloatingIp.html",
                scope: scope
            });
            scope.floatingIp = {};
            scope.submitInValid = false;
            switch (type) {
                case "bind":
                    scope.floatTitle = $translate.instant("aws.instances.FloatingIp.bindIP");
                    scope.osNetList = [];
                    scope.hideips = false;
                    scope.noDataFlag = false ;
                    //获取所有的公网IP
                    instancesSrv.getAllfloalingIp().then(function(result) {
                        if (result && result.data) {
                            scope.IpsList = result.data.filter(function(item) {
                                return !(item.portId);
                            });
                            if(scope.IpsList.length == 0){
                            	 scope.noDataFlag = true ;
                            }else{
                            	scope.noDataFlag = false ;
                            }
                            scope.floatingIp.floatingip_id = scope.IpsList[0];
                            return result.data;
                        }
                    }).then(function(res) {
                        //获取选中云主机下的网卡
                        instancesSrv.getOsNet(editData.uid).then(function(result) {
                            let net_filter = [];
                            if (res && result && result.data.length) {
                                result.data.map(function(item) {
                                    let ipv4_address=item.fixed_ips.filter(function(port){
                                        return port.ip_address.indexOf(":")==-1;
                                    });
                                    scope.osNetList.push({
                                        id: item.port_id,
                                        name: ipv4_address[0].ip_address
                                    });
                                });
                                //获取已经绑定过公网IP的网卡
                                scope.osNetList.map(item => {
                                    res.map(val => {
                                        if (val.instanceName && val.portId == item.id) {
                                            net_filter.push(item);
                                        }
                                    });
                                });
                                //过滤获取已经绑定过公网IP的网卡
                                net_filter.map(item => {
                                    scope.osNetList = scope.osNetList.filter(val => item != val);
                                });
                                scope.floatingIp.port_id = scope.osNetList[0];
                            }
                        });
                    });

                    scope.confirm = function(fip, floatForm) {
                        //与后台交互
                        if (floatForm.$valid) {
                            modal_os_ip.close();
                            var postData = {
                                floatingip_id: fip.floatingip_id.id,
                                port_id: fip.port_id.id
                            };
                            self.bindFip = fip.floatingip_id.ip;
                            self.bindFip_uid = editData.uid;
                            instancesSrv.bind_floatingip(postData).then(function() {});
                        } else {
                            scope.submitInValid = true;
                        }
                    };
                    break;
                case "relieve":
                    scope.floatTitle = $translate.instant("aws.instances.FloatingIp.unbindIP");
                    scope.hideips = true;
                    //获取选中云主机下绑定的公网IP
                    instancesSrv.osInterfaceFips(editData.uid).then(function(result) {
                        scope.osNetList = result.data;
                        scope.floatingIp.port_id = result.data[0];
                    });
                    scope.confirm = function(fip, floatForm) {
                        if (floatForm.$valid) {
                            modal_os_ip.close();
                            var postData = {
                                floatingip_id: fip.port_id.id
                            };
                            self.relieveIp = fip.port_id.name.split("_")[1];
                            self.relieveIp_uid = editData.uid;
                            instancesSrv.relieve_floatingip(postData).then(function() {});
                        } else {
                            scope.submitInValid = true;
                        }

                    };
                    break;
            }
        };
        //修改mac地址
        self.changeMac = function(editData) {
            if (!self.change_Mac) {
                var scope = $rootScope.$new();
                var modal_os_mac = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "update-os-macAddr.html",
                    scope: scope
                });
                scope.osPort = {};
                scope.submitInValid = false;
                instancesSrv.getOsNet(editData.uid).then(function(result) {
                    scope.osPortList = [];
                    if(result && result.data && angular.isArray(result.data)){
                        result.data.map(function(item) {
                            scope.osPortList.push({
                                id: item.port_id,
                                ip: item.fixed_ips[0].ip_address,
                                mac_addr: item.mac_addr
                            });
                        });
                        scope.osPort.selected = scope.osPortList[0];
                        scope.osPort.mac_address = angular.copy(scope.osPort.selected.mac_addr);
                    }
                    if(localStorage.permission == "enterprise" && editData.floatingIps.length >0){
                        instancesSrv.osInterfaceFips(editData.uid).then(function(result) {
                            if(result && result.data && angular.isArray(result.data)){
                                scope.osNetFipList = result.data;
                            }
                        });
                    }
                });

                scope.changeFixedIp = function(data){
                    scope.osPort.mac_address = data.mac_addr;
                };

                scope.confirm = function(osPort, fieldForm) {
                    if (fieldForm.$valid) {
                        var postData = {
                            "portId": osPort.selected.id,
                            "mac_address": osPort.mac_address
                        };
                        if(scope.osNetFipList && localStorage.permission == "enterprise"){
                            scope.osNetFipList.map(item =>{
                                if(item.portId == osPort.selected.id){
                                    postData.floatingIp_id = item.id;
                                }
                            })
                        }
                        instancesSrv.os_mac(editData.uid, postData);
                        modal_os_mac.close();
                    } else {
                        scope.submitInValid = true;
                    }
                };
            }

        };

        //同一块云硬盘云主机不能挂载两次
        function filterVolume(data,obj){
            return data.instance.some(item=>{
                return item==obj.name 
            });
        }
        
        //加载硬盘
        self.loadingDisk = function(editData) {
            if(self.loading_Disk || self.vmdiskIdget)return;
            var scope = $rootScope.$new();
            var modal_os_loadindDisk = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "update-load-disk.html",
                scope: scope
            });
            scope.submitInValid = false;
            //获取可用的云硬盘
            scope.disk = {};
            instancesSrv.getVallDisk().then(function(result) {
                if (result && result.data && result.data.length) {
                    self.vmdiskInfo.map((x)=>{
                        result.data = result.data.filter(item => item.id !=x.id)
                        //return !filterVolume(x,editData)
                    });
                    var valDiskReg = /-blank-vol$/;
                    scope.avaiDiskList = result.data.filter(item => !(item.metaData && (item.metaData.instance_name == "fixedImageInstanceName" || valDiskReg.test(item.name))));
                    scope.avaiDiskList =  scope.avaiDiskList.filter(item =>{
                        return (item.multiattach&&(item.status =="available"||item.status == "in-use")) || (!item.multiattach && item.status =="available");
                    });
                    scope.avaiDiskList = scope.avaiDiskList.filter(item => !(item.name.indexOf("backup-vol") > -1));
                    scope.avaiDiskList = scope.avaiDiskList.filter(item => !(item.imageMetadata.disk_format == "iso"));
                    scope.avaiDiskList = scope.avaiDiskList.filter(item => !item.magrationing);
                    scope.disk.volumeId = scope.avaiDiskList[0];
                }

            });
            //与后台交互
            scope.confirm = function(disk, diskForm) {
                if (diskForm.$valid) {
                    var postData = {
                        serverId: editData.uid,
                        volumeId: disk.id,
                        device: "/dev/vdn" //暂时写死
                    };
                    modal_os_loadindDisk.close();
                    instancesSrv.os_loading_disk(postData).then(function() {
                        self.loadDiskName = disk.name;
                        self.loadDiskUid = editData.uid;
                    });
                } else {
                    scope.submitInValid = true;
                }
            };

        };
        function checkScheduleJob(scope,data,volume_id,type){ //scope作用域，data云主机id数组，volume_id云硬盘id，type操作类型
            scope.show_del_job_tip = false;
            scope.getJobs = false;
            scope.jobIds =[];
            var checkData = {
                serverIds:data.uid
            }
            if(type == "volume"){
                checkData.volumeId = volume_id;
                checkData.serverIds = [data.uid];
            }
            instancesSrv.checkSheduleJob(checkData).then(function(result){
                if(result && result.data){
                    scope.jobIds = result.data;
                    scope.getJobs = true;
                    scope.show_del_job_tip = Boolean(result.data.length);
                    if(type == "instance-soft-delete" || type == "instance-force-delete"){
                        emitDel(scope.show_del_job_tip,result.data,type)
                    }
                }
                
            })
        }
        //卸载硬盘
        self.detachDisk = function(editData,diskInfo) {
            var scope = $rootScope.$new();
            var modal_os_detachDisk = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "update-detach-disk.html",
                scope: scope
            });
            scope.submitInValid = false;
            scope.disk = {};
            scope.changeVmDisk = function(volume){
                //判断该云硬盘下是否有定时快照
                checkScheduleJob(scope,editData,volume,"volume")
            }
             //只能卸载非/dev/vda且bootable为true的盘
            scope.attachDiskList = diskInfo.filter(item => !(item.root_device == "true"&& item.bootable == "true"));
            scope.attachDiskList = scope.attachDiskList.filter(item => !(item.diskFormat == "iso") && item.status == "in-use");
            scope.disk.volumeId = scope.attachDiskList[0].id;
            checkScheduleJob(scope,editData,scope.disk.volumeId,"volume")
            scope.confirm = function(disk, diskForm) {
                if (diskForm.$valid) {
                    var postData = {
                        serverId: editData.uid,
                        volumeId: scope.disk.volumeId
                    };
                    modal_os_detachDisk.close();
                    instancesSrv.os_detach_disk(postData).then(function() {
                        self.detachDiskUid = editData.uid;
                    });
                    if(scope.jobIds.length){
                        var post = {
                            ids:scope.jobIds,
                            volumeId:scope.disk.volumeId
                        }
                        regularSnapSrv.updateTaskBack(post).then(function(){
                           
                        })
                    }
                    
                } else {
                    scope.submitInValid = true;
                }
            };
        };

        //卷迁移
        self.stockTransfer = function(editData){
            if(self.canStockTransfer || self.vmdiskIdget) return;
            var scope = $rootScope.$new();
            var stock_transfer = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "stock_transfer.html",
                scope: scope
            });
            scope.submitInValid = false;
            scope.cloudHardDisk = {
                name:""
            }
            scope.storageDevice = {
                name:""
            }
            scope.cloudHardDiskList = [];
            scope.isLocal = editData.startStyle == 'Local'?true:false;
            let id=editData.uid
        
            function stockTransferList(){
                instancesSrv.stockTransferList(id).then(function(res){                          
                    if(res&&res.data&&res.data.types){
                        res.data.volumes.forEach(function(item){
                            if(item.diskInfo!="iso"&&item.status=="in-use" && item.storageLimit && item.storageLimit["os-retype"]){
                                scope.cloudHardDiskList.push(item)
                            }
                        })
                        scope.submitInValidListAll = res.data.types;
                    }
                })
            }
            stockTransferList()

            scope.canChooseStordType = true   //只能选择云硬盘才可以选择存储设备

            scope.choiceVolumes=function(value){
                // value.type="sdsdsd";
                scope.submitInValidList = [];
                scope.canChooseStordType = false
                scope.submitInValidListAll.forEach(function(item,index){
                    if(item.extra.volume_backend_name!=value.type){
                        if(value.multiattach == "true" &&item.multiattach=="true"){
                            scope.submitInValidList.push(item)
                        }else if(value.multiattach == "false"){
                            scope.submitInValidList.push(item)
                        }
                    }
                })
            }

            scope.warningUp = false
            scope.warningDown = false
            scope.changeStordType = function(volumes,type){
                scope.warningUp = false
                scope.warningDown = false
                if(volumes.device=="/dev/vda"){
                    if(type.storageProtocol=="ceph"){
                        if(editData.status=="SHUTOFF"||editData.status=="shutoff"||editData.status=="stopped"){
                            scope.warningUp = false
                        }else{
                            scope.warningUp = true
                        }
                    }else{
                        scope.warningUp = false
                    }
                }else{
                    if(type.storageProtocol=="ceph"){
                        if(volumes.status=="in-use"){
                            scope.warningDown = true
                        }else{
                            scope.warningDown = false
                        }
                    }else{
                        scope.warningDown = false
                    }
                }
            }
            
            scope.stockTransferConfirm = function(fileFrom){
                if(fileFrom.$valid&&!scope.warningDown&&!scope.warningUp){
                    var postData = {
                        "volumeId":scope.cloudHardDisk.name.id,
                        "newType":scope.storageDevice.name.id
                    }
                    instancesSrv.stockTransfer(postData).then(function(res){
                        getInstance();
                    })
                    stock_transfer.close()
                }else{
                    scope.submitInValid = true;
                }
            }
        }

        // 磁盘QoS
        self.volumesQoS = function(editData){
            var scope = $rootScope.$new();
            var volumes_QoS = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "volumes_QoS.html",
                scope: scope
            });
            scope.submitInValid = false;
            scope.volumesQoS = {
                name:""
            }
            scope.cloudHardDiskList = []
            scope.recordList = {}
            function initCount(totolInfo,num){
                scope.recordList.id = totolInfo[num].id;
                scope.recordList.catalogName = totolInfo[num].device.split("/dev/")[1]
                scope.recordList.read_bytes_sec = totolInfo[num].limit? totolInfo[num].limit.split(",")[0]/1024/1024:"";
                scope.recordList.read_iops_sec = totolInfo[num].limit? totolInfo[num].limit.split(",")[1]:"";
                scope.recordList.write_bytes_sec = totolInfo[num].limit? totolInfo[num].limit.split(",")[2]/1024/1024:"";
                scope.recordList.write_iops_sec = totolInfo[num].limit? totolInfo[num].limit.split(",")[3]:"";

                // scope.recordList.read_bytes_sec_flag = true ;
                // scope.recordList.read_iops_sec_flag = true ;
                // scope.recordList.write_bytes_sec_flag = true ;
                // scope.recordList.write_iops_sec_flag = true;
            }

            instancesSrv.volumesQoS(editData.uid).then(function(res){
                if(res && res.data && res.data.diskInfo && res.data.diskInfo.length>0){
                    res.data.diskInfo.forEach(function(item){
                        if(item.diskFormat!="iso"){
                            scope.cloudHardDiskList.push(item)
                        }
                    })
                    if(scope.cloudHardDiskList.length>0){
                        scope.volumesQoS.name = scope.cloudHardDiskList[0]
                        initCount(scope.cloudHardDiskList,0)
                    }
                    // scope.volumesQoS.name = res.data.diskInfo[0]
                }
            })

            scope.choiceVolumes = function(data){
                scope.cloudHardDiskList.forEach(function(item,index){
                    if(item.name==data.name){
                        initCount(scope.cloudHardDiskList,index)
                    }
                })
            }
            scope.volumesQoSConFirm = function(fileFrom){
                if(fileFrom.$valid){
                    let postData = {
                        readBytesSec:scope.recordList.read_bytes_sec*1024*1024,
                        readIopsSec:scope.recordList.read_iops_sec,
                        writeBytesSec:scope.recordList.write_bytes_sec*1024*1024,
                        writeIopsSec:scope.recordList.write_iops_sec,
                        catalogName:scope.recordList.catalogName
                    }
                    instancesSrv.editVolumesQoS(postData,editData.uid).then(function(){
                        getInstance();
                    })
                    volumes_QoS.close()
                }else{
                    scope.submitInValid = true;
                }
            }
        }

        //打开控制台
        self.openConsole = function(editData) {
            /*var insvnc = */
            window.open(self.consoleUrl, editData.uid, "height=1000,width=1100,top=20,left=20,toolbar=yes,resizable=yes,menubar=no,scroll");

             // localStorage.setItem("consoleUrl",self.consoleUrl)
            // window.open("/#/console", "", "height=1000,width=2000,top=20,left=20,toolbar=yes,resizable=yes,menubar=no,scroll");

            
            //insvnc.document.getElementsByTagName("body")[0].innerHTML = "<iframe src = "+ self.consoleUrl +" style='width:100% ;height:100%;'></iframe><style>*{margin:0;padding:0;}</style>";
        };
        self.noCinderModal = function(dis){
            if(dis) return;
            var modal_os = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/cvm/volumes/tmpl/addVolumeTip.html",
            });
        }

        self.noBackupsModal = function(dis){
            if(dis) return;
            var modal_os = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/cvm/volumes/tmpl/addBackupTip.html",
            });
        }

        //制作镜像
        self.mkImg = function(editData) {
            let templateUrl = (editData.startStyle =='Local' || (editData.startStyle =='EBS' && localStorage.cinderService)) ? "mkImg.html":"js/cvm/volumes/tmpl/addVolumeTip.html";
            if(self.canBak || self.volumeStatusDis || self.vmdiskIdget || self.storageLimitImage || self.limitImageSize) return 
            var scope = $rootScope.$new();
            var modal_os_mk = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: templateUrl,
                scope: scope
            });
            scope.submitInValid = false;
            scope.img = {};
            if(editData.startStyle=="Local"){
                scope.img.use_snapshot=true;
            }else{
                scope.img.use_snapshot=false;
            }
            scope.confirm = function(img, imgform) {

                if (imgform.$valid) {
                     modal_os_mk.close();
                     if(img.use_snapshot){
                        //使用快照方式制作镜像
                        instancesSrv.mkImg(editData.uid, img).then(function() {
                            localStorage.mkImg_hand = true;
                        });
                    }else{
                        //标准制作镜像方式
                        self.vmdiskInfo.forEach((x)=>{
                            if(x.bootable=='true'&& x.root_device == "true" && x.diskFormat!="iso"){
                                scope.img.volumeId=x.id;
                                img.volumeId=x.id
                            }
                        })
                        scope.img.instanceId=editData.uid;
                        instancesSrv.makeImage(img).then(function(result) {
                            self.checkboxes.items={};
                        });
                    }
                } else {
                    scope.submitInValid = true;
                }
            };
        };
        //备份
        self.osbackup = function(editData) {
            var scope = $rootScope.$new();
            var modal_os_backup = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-backup.html",
                scope: scope
            });
            scope.back = "";
            scope.submitInValid = false;
            //scope.cycleList = [{ id: "daily", name: $translate.instant("aws.instances.backups.day") }, { id: "weekly", name: $translate.instant("aws.instances.backups.week") }];
            scope.confirm = function(back, osbackForm) {
                back.backupType = "daily";
                back.rotation = 10;
                if (osbackForm.$valid) {
                    modal_os_backup.close();
                    instancesSrv.os_backup(editData.uid, back).then(function() {

                    });
                } else {
                    scope.submitInValid = true;
                }

            };
        };
        //热迁移
        self.osMigrate = function(editData) {
            //let templateUrl = editData.startStyle == 'Local' ? "localFunTip.html":"os-migrate.html";
            if(self.migrate || self.volumeStatusDis || self.vmdiskIdget || self.storageLimitMigrate) return;
            var scope = $rootScope.$new();
            var modal_os_migrate = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-migrate.html",
                scope: scope
            });
            scope.migrate = {
                "blockMigration": false,
                "diskOverCommit": false
            };
            scope.submitInValid = false;
            if (self.ADMIN && editData.startStyle == 'EBS') {
                instancesSrv.getZone().then(function(result) {
                    if (result && result.data && result.data.length) {
                        result.data.map(item => {
                            if (item.zoneName == editData.availabilityZone) {
                                var k;
                                item.nodeList = [];
                                for (k in item.hosts) {
                                    item.nodeList.push({ name: k });
                                }
                                scope.migrateHosts = item.nodeList.filter(val => val.name != editData.hostName);
                                scope.migrate.host = scope.migrateHosts[0];
                            }
                        });
                    }
                });
            }
            scope.confirm = function(migrate, osmigrateForm) {
                if (osmigrateForm.$valid) {
                    modal_os_migrate.close();
                    var postData = {
                        "host": migrate.host.name,
                        "blockMigration": migrate.blockMigration,
                        "diskOverCommit": migrate.diskOverCommit,
                        "serverName":editData.name
                    };
                    instancesSrv.os_migrate(editData.uid, postData);
                } else {
                    scope.submitInValid = true;
                }
            };
        };
        //冷迁移
        self.coldMigrate = function(editData){
            //let templateUrl = editData.startStyle == 'Local' ? "js/cvm/instances/tmpl/coldMigrate.html":"localFunTip.html";
            let coldMigrateCtrl = localStorage.cinderService?"coldMigrateCtrl":"";
            if(!self.coldMigrateBtn && !self.volumeStatusDis && !self.vmdiskIdget && !self.storageLimitColdMig){
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "js/cvm/instances/tmpl/coldMigrate.html",
                    controller: coldMigrateCtrl,
                    resolve: {
                        editData: function(){
                            return editData
                        }
                    }

                });
            }
        }
        //调整配置
        self.osUpgrade = function(editData) {
            if (!self.upgrade) {
                var scope = $rootScope.$new();
                var modal_os_upgrade = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "os-upgrade.html",
                    scope: scope
                });
                if (localStorage.permission == "enterprise") {
                    getProused();
                    getDomused();
                }
                instancesSrv.getServerDetail(editData.uid).then(function(result) {
                    self.curconf = result.data;
                    instancesSrv.getFlavors().then(function(result) {
                        if (result && result.data && result.data.length) {
                            _.forEach(result.data, function(val) {
                                if(localStorage.permission == "stand"){
                                    val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1) +"GB "+$translate.instant("aws.instances.addinstances.localDisk") +" "+ val.disk + "GB "+ $translate.instant("aws.instances.addinstances.dataDisk") +" "+ val.ephemeral + "GB";
                                }else{
                                    val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1)+"GB";
                                }
                            });
                            //scope.upgradeLists = result.data;
                            scope.upgradeLists = [];
                            result.data.map(function(item) {
                                if(localStorage.permission == "stand"){
                                    if ((item.ram == self.curconf.ram && item.vcpus == self.curconf.vcpus && item.ephemeral == self.curconf.ephemeral && item.disk == self.curconf.disk) || item.ephemeral < self.curconf.ephemeral|| item.disk < self.curconf.disk) {
                                        return
                                    } else {
                                        scope.upgradeLists.push(item);
                                    }
                                }else{
                                    if (item.ram == self.curconf.ram && item.vcpus == self.curconf.vcpus) {
                                        return
                                    } else {
                                        scope.upgradeLists.push(item);
                                    }
                                }
                                
                            })
                        }
                    });
                });

                scope.upgrade = {};
                scope.submitInValid = false;
                scope.chooseCpuMem = function(data) {
                    (data.vcpus - self.curconf.vcpus > self.coresDomquota.total - self.coresDomquota.used) ? scope.coreDomText = $translate.instant("aws.instances.quota.domCpu"): scope.coreDomText = "";
                    (data.ram - self.curconf.ram > self.ramDomquota.total - self.ramDomquota.used) ? scope.ramDomText = $translate.instant("aws.instances.quota.domRam"): scope.ramDomText = "";
                    (data.vcpus - self.curconf.vcpus > self.coresquota.total - self.coresquota.used) ? scope.coreProText = $translate.instant("aws.instances.quota.proCpu"): scope.coreProText = "";
                    (data.ram - self.curconf.ram > self.ramquota.total - self.ramquota.used) ? scope.ramProText = $translate.instant("aws.instances.quota.proRam"): scope.ramProText = "";
                    //(data.vcpus - self.hotgradeData.current_cpus > self.hotgradeData.maximum_cpus) ? scope.coreMaxText = $translate.instant("aws.instances.quota.coreMaxText") + self.hotgradeData.maximum_cpus: scope.coreMaxText = "";
                    //(data.ram -self.hotgradeData.current_mem_mb> self.hotgradeData.maximum_mem_mb) ? scope.ramMaxText = $translate.instant("aws.instances.quota.ramMaxText")+(self.hotgradeData.maximum_mem_mb/1024).toFixed(2)+"G": scope.ramMaxText = "";
                };
                scope.confirm = function(upgradeForm) {
                    if (upgradeForm.$valid) {
                        var postData = {
                            "flavorId": scope.upgrade.flavor.id
                        };
                        modal_os_upgrade.close();
                        instancesSrv.os_upgrade(editData.uid, postData).then(function(result) {
                            //console.log(result)
                            //var resizeIds = angular.fromJson(sessionStorage.ResizeIds);
                            //resizeIds ? "" : resizeIds = [];
                            //resizeIds.push(editData.uid)
                            //sessionStorage.ResizeIds = angular.toJson(resizeIds)
                        });
                    } else {
                        scope.submitInValid = true;
                    }
                };
            }

        };
        //热升级
        self.osHotgrade = function(edit) {
            if(self.unhotgrade || self.oshotgrade || self.vmdiskIdget) return
            var scope = $scope.$new();
            var modal_os_upgrade = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-hotgrade.html",
                scope: scope
            });
            scope.ram = {};
            scope.vcpus = {};
            scope.ram.min_max = {
                //min: self.hotgradeData.current_mem_mb/1024,
                min:edit.ram / 1024,  //热升级的当前配置从云主机的详情里面取值
                max: self.hotgradeData.maximum_mem_mb/1024
            };
            scope.vcpus.min_max = {
                //min: self.hotgradeData.current_cpus, 
                min:edit.vcpus,
                max: self.hotgradeData.maximum_cpus
            };
            scope.hotgrade = {
                //vcpu: self.hotgradeData.maximum_cpus,
                //ram: self.hotgradeData.maximum_mem_mb/1024
            };

            scope.currentSetting = edit.vcpus + $translate.instant("aws.instances.conf.core") + (edit.ram / 1024).toFixed(1) + "G";  // fixAWSTACK261-3282
            scope.submitInValid = false;

            getProused();
            getDomused();
            getHypervisors();
            function getHypervisors(){
                nodeSrv.getHypervisors().then(function(result) {
                    if (result && result.data) {
                        result.data.map(item=>{
                            item.name = item.hypervisorHostname.split(".")[0];
                            item.freeCpu = item.virtualCPU * 4 - item.virtualUsedCPU;
                            item.freeRam=parseInt(item.freeRam/1024);
                        })
                        result.data = result.data.filter(item => item.name == edit.hostName )
                        self.hypervisorInfo = result.data[0];

                        
                    }
            
                });
            }

            scope.checkCpu = function(){
                scope.cpuExceed = false;
                scope.cpuExceed1 = false;
                (Number(scope.hotgrade.vcpu) - edit.vcpus > self.coresDomquota.total - self.coresDomquota.used) ? scope.coreDomText = $translate.instant("aws.instances.quota.domCpu"): scope.coreDomText = "";
                (Number(scope.hotgrade.vcpu) - edit.vcpus > self.coresquota.total - self.coresquota.used) ? scope.coreProText = $translate.instant("aws.instances.quota.proCpu"): scope.coreProText = "";
                if(Number(scope.hotgrade.vcpu)>self.hypervisorInfo.virtualCPU){
                    scope.cpuExceed = true;
                }else{
                    if(Number(self.hypervisorInfo.virtualCPU*4 - self.hypervisorInfo.virtualUsedCPU)<scope.hotgrade.vcpu){
                        scope.cpuExceed1 = true;
                    }
                }
            }
            scope.checkRam = function(){
                scope.ramExceed = false;
                (Number(scope.hotgrade.ram*1024) - edit.ram > self.ramDomquota.total - self.ramDomquota.used) ? scope.ramDomText = $translate.instant("aws.instances.quota.domRam"): scope.ramDomText = "";
                (Number(scope.hotgrade.ram*1024) - edit.ram > self.ramquota.total - self.ramquota.used) ? scope.ramProText = $translate.instant("aws.instances.quota.proRam"): scope.ramProText = "";
                if(Number(self.hypervisorInfo.localMemory - self.hypervisorInfo.localMemoryUsed)<scope.hotgrade.ram*1024){
                    scope.ramExceed = true;
                }
            }

            self.hotconfirm = function(form) {
                if (form.$valid) {
                    if(scope.ramExceed || scope.cpuExceed || scope.cpuExceed1) return;
                    var data = {
                        vcpu_max: scope.hotgrade.vcpu,
                        ram_max: scope.hotgrade.ram*1024
                    };
                    modal_os_upgrade.close();
                    instancesSrv.postHotgrade(data, edit.uid).then(function() {

                    });
                } else {
                    scope.submitInValid = true;
                }
            };

        };
        //创建快照
        self.osSnapshot = function() {
            var scope = $rootScope.$new();
            var modal_os_backup = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-snapshot.html",
                scope: scope
            });
            instancesSrv.getServerDetail(self.editData.uid).then(function(result) {
                if (result && result.data) {
                    result.data.diskInfo.map(item => {
                        if (item.root_device == "true") {
                            scope.rootVolId = item.id;
                        }
                    });
                }
            });
            scope.snapshot = {};
            scope.confirm = function() {
                var snapData = {
                    volumeId: scope.rootVolId,
                    name: scope.snapshot.name
                };
                modal_os_backup.close();
                instancesSrv.os_snap(snapData).then(function() {

                });
            };
        };
        //调用api获取所有绑定给云主机的port
        var getServerNet = function(scope,editData){
            instancesSrv.getOsNet(editData.uid).then(function(result) {
                scope.osNetList = [];
                if ( result && result.data && result.data.length) {
                    result.data.map(function(item) {
                        scope.osNetList.push({
                            id: item.port_id,
                            name: editData.name + ":" + item.fixed_ips[0].ip_address
                        });
                    });
                    scope.sec.port_id  = scope.osNetList[0];
                    self.getPortDetail(scope,scope.sec.port_id.id,editData);
                }
            });
        };
        //获取某一个port的详情
        self.getPortDetail = function(scope,port_id,editData){
            var postData = {
                id:port_id
            };
            var sec;
            instancesSrv.getPortDetail(postData).then(function(result){
                if(result && result.data && result.data.security_groups){
                    sec = result.data.security_groups[0];
                    getServerSecGroup(scope,sec,editData)
                }
            })
        }
        //调用api获取所有的防火墙，并将已经选中的防火墙过滤出来
        var getServerSecGroup = function(scope,used,editData){
            instancesSrv.listServerSecGroup(editData.uid).then(function(result) {
                if(result && result.data && angular.isArray(result.data)){
                    scope.iptablesList = result.data;
                    scope.netWorkCard.name = result.data[0]
                    _.forEach(scope.iptablesList, function(item) {
                        if (item.id == used ) {
                            scope.sec.iptables = item.id;
                        }
                        if(!used && item.name == "default"){
                            scope.network.secSelected = item;
                        }
                    });
                    avoidDoubleClick(scope,false)
                }
                
            });
        };
        
        function avoidDoubleClick(scope,bol){
            scope.cannot_Confirm = bol;
        }

        //加载防火墙
        self.loadIptables = function(editData) {
            var scope = $rootScope.$new();
            var modal_os_iptables = $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "load-os-iptables.html",
                scope: scope
            });
            scope.submitInValid = false;
            scope.sec = {};
            scope.netWorkCard = {};
            avoidDoubleClick(scope,true)
            getServerNet(scope,editData)
            scope.changePort = function(port){
                scope.iptablesList = [];
                avoidDoubleClick(scope,true)
                self.getPortDetail(scope,port.id,editData);
            }
            scope.confirmSec = function(iptables,feild){
                scope.cannot_Confirm = true;
                var newSecName = "";
                if(feild.$valid){
                     avoidDoubleClick(scope,true)
                     var postData = {
                         id:scope.sec.port_id.id,
                         secGroup:[scope.sec.iptables]
                     }
                     instancesSrv.updatePortSecurity(postData).then(function(result){
                     })
                     modal_os_iptables.close()
                }else{
                   scope.submitInValid = true; 
                }
                scope.iptablesList.map(item => {
                    if (item.id == iptables) {
                        newSecName = item.name;
                    }
                });
                if (scope.initIptables != iptables) {
                    var postData = {
                        oldSecGroup: scope.initIptables,
                        newSecGroup: newSecName
                    };
                    //调用api,iptables为最新选中的
                    instancesSrv.updateServerSecGroup(editData.uid, postData).then(function() {
                        getInstance();
                    });
                }
            };
        };
        //网卡安全配置
        self.networkCardConfig=function(editData){
            
            var scope = $rootScope.$new();
            var modal_os_iptables = $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "networkCard-security-configuration.html",
                scope: scope
            });
            scope.submitInValid = false;
            scope.sec = {};
            scope.netWorkCard = {};
            scope.addressPort={
                list:[]
            }
            scope.openOrClose={
                flag:"0"
            };

            instancesSrv.getOsNet(editData.uid).then(function(result) {
                scope.osNetList = [];
                if ( result && result.data && result.data.length) {
                    result.data.map(function(item) {
                        scope.osNetList.push({
                            id: item.port_id,
                            name: editData.name + ":" + item.fixed_ips[0].ip_address
                        });
                    });
                    scope.sec.port_id  = scope.osNetList[0];
                }
            });
            scope.$watch(function(){
                return scope.sec.port_id
            },function(value){
                if(value){
                    instancesSrv.openOrCloseNetwork(value.id).then(function(res){
                        // console.log(res)
                        if(res&&res.data&&res.data.port_security_enabled){
                            if(res.data.port_security_enabled=="false"){       
                                scope.openOrClose.flag="0";
                                scope.iptablesList = []
                                scope.netWorkCard.name = {}
                            }else{
                                scope.openOrClose.flag="1" ;
                                scope.iptablesList = res.data.securityGroupsList;
                                scope.iptablesList.forEach(function(item){
                                    if(item.id==res.data.securityGroupsMap.id){
                                        scope.netWorkCard.name = item
                                    }
                                })
                            }
                            scope.addressPort.list=res.data.allowed_address_pairs;
                        }
                    })
                }
            },true)

            scope.ipPattern = "*请输入正确的IP地址";
            scope.macPattern = "*请输入正确的MAC地址"
            scope.addAddressPair=function(){
                if(scope.addressPort.list.length <= 9){
                    scope.addressPort.list.push({
                        "ip_address":"",
                        "mac_address":""
                    })
                }
            }
            scope.deleteAddressPair=function(num){
                scope.addressPort.list.splice(num,1)
            }       
            scope.changeNetwork=function(title,port){
                if(title=="open"){
                    instancesSrv.openOrCloseNetwork(port.id).then(function(result){
                        if(result&&result.data){   
                            scope.iptablesList = result.data.securityGroupsList;
                            scope.iptablesList.forEach(function(item){
                                if(result.data.securityGroupsMap.id){
                                    if(item.id==result.data.securityGroupsMap.id){
                                        scope.netWorkCard.name = item
                                    }
                                }else{
                                    scope.netWorkCard.name=result.data.securityGroupsList[0] 
                                }
                            })
                        }
                    })
                }else{
                    instancesSrv.openOrCloseNetwork(port.id).then(function(result){
                        if(result&&result.data){  
                            scope.iptablesList = result.data.securityGroupsList;
                            scope.netWorkCard.name = result.data.securityGroupsList[0]    
                        }
                    })
                }
            }
            scope.isRepeatFunc=function(arr){
                var hash = {};
                var isTrue;
                for(let i=0;i<arr.length;i++){
                    if(hash[arr[i]]==1){
                        isTrue = true;
                        break;
                    }
                    hash[arr[i]] = 1;
                }
                return isTrue;
            }
            scope.resetIsIPRepeat=function(){
                scope.isIpRepeat=false;
            }
            scope.confirmSec=function(part,group,bool,feild){
                let id=""
                let postData={
                    port:{
                        "port_security_enabled":false,
                        "security_groups":[],
                        "allowed_address_pairs":[]
                    }
                }
                if(bool=="0"&&part){
                    postData.port.port_security_enabled=false;
                    id=part.id
                    instancesSrv.setNetworkConfig(id,postData).then(function(res){
                        getInstance();
                    })
                    modal_os_iptables.close()
                }else if(bool=="1"){
                    //ip格式校验通过
                    if(feild.$valid){
                        //判断是否有重复的ip
                        let ipArr=[];
                        for(var i=0;i<scope.addressPort.list.length;i++){
                           ipArr.push(scope.addressPort.list[i].ip_address);
                        }
                        scope.isIpRepeat=scope.isRepeatFunc(ipArr);
                        if(!scope.isIpRepeat){
                            id=part.id
                            postData.port.port_security_enabled=true; 
                            postData.port.security_groups.push(group.id)
                            scope.addressPort.list.map(function(item){
                                delete (item.$$hashKey)
                            })
                            postData.port.allowed_address_pairs=scope.addressPort.list
                            instancesSrv.setNetworkConfig(id,postData).then(function(res){
                                getInstance();
                            })
                            modal_os_iptables.close()
                        }else{
                            $timeout(function() {
                               scope.isIpRepeat=false;
                            }, 3000);
                        }  
                    }else{
                        scope.submitInValid = true; 
                    }
                }
            }
        }
        //添加告警
        self.addAlarm = function(data) {
            var scope = self.$new();
            var modal_addAlarm = $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "alarmSetting.html",
                scope: scope
            });
            scope.alarmForm = initAlarmForm();
            scope.alarmForm.hostname = data.name;
            scope.alarmForm.labelList = data.uid;
            //scope.contactsDisabled = true;
            //scope.templateDisabled = true;
            //获取告警模板
            alarmTemplateSrv.getAlarmTmpls().then(function(result) {
                if (result && result.data && angular.isArray(result.data)) {
                    var data = result.data;
                    var vmTpl = [];
                    scope.templateDisabled = false;
                    data.map((item) => {
                        if (item.resourceType == "virtual") {
                            vmTpl.push(item);
                        }
                    });
                    scope.tmpls = {
                        options: vmTpl
                    };
                }
            });
            //获取联系人组
            contactGroupSrv.getContactGroup().then(function(result) {
                if (result && result.data && result.data.data && angular.isArray(result.data.data)) {
                    //scope.contactsDisabled = false;
                    scope.contacts = {
                        options: result.data.data
                    };
                }
            });
            scope.submitted = {};
            scope.alarmConfirm = function(formField, data) {
                if (formField.$valid) {
                    var params = {
                        name: data.name,
                        labels: data.labelList,
                        contactLists: data.contactlists.join(","),
                        templates: (data.alarmtemps).join(","),
                        resourceType: "virtual",
                        alarmAction: "email",
                        enabled: data.enabled,
                        domainId: localStorage.domainUid,
                        projectId: localStorage.projectUid
                    };
                    alarmSettingSrv.createAlarm(params).then(function() {});
                    modal_addAlarm.close();
                    self.checkboxes.items = {};
                } else {
                    if (formField.alarmName.$invalid) {
                        scope.submitted.alarmName = true;
                    }
                    if (formField.template.$invalid) {
                        scope.submitted.template = true;
                    }
                    if (formField.contactGroup.$invalid) {
                        scope.submitted.contactGroup = true;
                    }
                }
            };
        };

        //修改密码
        self.editPsw = function(data){
            if(self.canEditPsw){
                return ;
            }
            var scope = $rootScope.$new();
            var modal_psw_edit = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "edit-psw.html",
                scope: scope
            });
            var hostId = data.uid;
            var name = data.name;
            scope.edited_Psw = "";
            scope.editPswSubmit = false;
            scope.doubleClick = false
            scope.editPswCfm = function(editPswForm,psw){
                scope.doubleClick = true
                if(self.canEditPsw == false){
                    if(editPswForm.$valid){
                    var postData = {
                        name:name,
                        password:psw

                    }

                    instancesSrv.editPsw(hostId,postData).then(function(){
                        modal_psw_edit.close();
                    })
                }else{
                   scope.editPswSubmit = true;
                }
                }
                
            }

        }

        // 透传设备
        self.ttEquipment = function(data){
            if(!self.canttEquiment){
                var instan = modalCom.init(
                    "tt-equipment.html",
                    "ttEquipmentCtrl",
                    {
                        refresh:function(){
                            return getInstance
                        },
                        context:function(){
                            return self
                        },
                        editData:function(){
                            return data
                        }
                    })
            }
        }

        //重建云主机
         self.rebuild = function(data,vmdiskInfo) {
            if(self.canRebuild || self.vmdiskIdget){
                return ;
            }
            var storageFunc = vmFuncSrv.storageFunc(self,"","");
            var inPoolsize = true; 
            var msg;
            vmdiskInfo.map(item =>{
                if(item.bootable == "true" && item.root_device == "true" && item.diskFormat !="iso"){
                    storageFunc.poolInfo(item);
                    inPoolsize = storageFunc.checkVolumFun(data.imageSize);
                }
            })
            self.rebuildId = data.uid ;
            if(inPoolsize){
                msg = "<span class='mailServer-tips'>" + "<i class='icon-aw-prompt2'></i>" + $translate.instant("aws.instances.tip.sure_rebuild") + "</span>"
            }else{
                msg = "<span class='mailServer-tips'>" +  $translate.instant("aws.instances.tip.poolSize_rebuild") + "</span>"
            }
            var content = {
                target: "rebuild",
                msg: msg,
                type: "warning",
                showDelBtn:false,
                btnType: "btn-warning",
                notDel:!inPoolsize
            };
        
            self.$emit("delete", content);
        };
        self.$on("rebuild", function() {
            instancesSrv.getServerDetail(self.rebuildId).then(function(data){
                if(data && data.data){
                    var datadevce_data = data.data.diskInfo.filter(volume => (volume.bootable==="true" && volume.root_device==="true") );
                    if(datadevce_data && datadevce_data.length ){
                        var volumeId = [datadevce_data[0].id,];
                        instancesSrv. getVolumeSnapshots({volumeid:volumeId}).then(function(data){
                            if(data.data &&data.data.length){
                                var rebuildTipModal = $uibModal.open({
                                        animation: $scope.animationsEnabled,
                                        backdrop: "static",
                                        templateUrl: "rebuild-tip.html",
                                        scope: self   
                                     });
                                
                            }else{
                                instancesSrv.rebuildHost(self.rebuildId)
                            }
                        })
                    }else{
                        instancesSrv.rebuildHost(self.rebuildId)
                    }
                    
                  
                   
                }
            })
            // instancesSrv.rebuildHost(self.rebuildId).then(function(data){
            // })
        });
        // self.$on("rebuild", function() {
        //     instancesSrv.rebuildHost(self.rebuildId).then(function(data){
        //     })
        // });
        function initAlarmForm() {
            return {
                name: "",
                labelList: "",
                alarmtemps: [],
                contactlists: [],
                normalToAlarm: "",
                alarmToNormal: "",
                alarmAction: "email",
                enabled: true
            };
        }

        //光盘管理
        self.manageCD = function(data) {
            if(self.CDdisabled) return;
            $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "manageCD.html",
                controller: "manageCDController",
                resolve: {
                    editData: function() {
                        return data;
                    },
                    context: function() {
                        return self;
                    }
                }
            });
        };

        //异常重启
        self.errorStart = function(data){
            if(self.errorStartDisabled) return;
            $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "error-start.html",
                controller: "errorStartController",
                resolve: {
                    editData: function() {
                        return data;
                    },
                    context: function() {
                        return self;
                    },
                    refresh: function() {
                        return getInstance
                    }
                }
            });
        }

        //云主机救援
        self.vm_evacuate = function() {
            var content = {
                target: "evacuate",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.evacuate") + "</span>",
                type: "info",
                btnType: "btn-primary"
            };
            self.$emit("delete", content);
        };
        self.$on("evacuate", function() {
            instancesSrv.evacuateServer(self.chkSome().id).then(function() {
                self.checkboxes.items = {};
            });
        });                             
        //挂载ISO
        self.mountISO = function() {
            var scope = $rootScope.$new();
            var modal_os_mount = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-mountISO.html",
                scope: scope
            });
            scope.mount = {};
            instancesSrv.getImage().then(function(result) {
                if (result && result.data && result.data.length) {
                    scope.imageList = result.data
                    scope.mount.image = result.data[0];
                }
            });
            scope.confirm = function(field) {
                if (field.$valid) {
                    var mountData = {
                        imageId: scope.mount.image.imageUid,
                        imageName: scope.mount.image.name,
                        size: scope.mount.size,
                        serverId: self.editData.uid
                    };
                    modal_os_mount.close();
                    instancesSrv.mountISO(mountData).then(function() {

                    });
                } else {
                    scope.submitInValid = true;
                }

            };
        };
        //卸载ISO
        self.unmountISO = function() {
            var scope = $rootScope.$new();
            var modal_os_unmount = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "os-unmountISO.html",
                scope: scope
            });
            instancesSrv.getServerDetail(self.editData.uid).then(function() {
                /*if (result && result.data) {
                }*/
            });
            scope.unmount = {};
            scope.confirm = function(field) {
                if (field.$valid) {
                    var postData = {
                        serverId: self.editData.uid,
                        volumeId: scope.disk.volumeId
                    };
                    modal_os_unmount.close();
                    instancesSrv.unmountISO(postData).then(function() {
                        self.detachDiskUid = self.editData.uid;
                    });
                } else {
                    scope.submitInValid = true;
                }

            };
        };
        //云硬盘备份
        self.volumeBackups = function(editData) {
            if(!self.canBackups) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "js/cvm/instances/tmpl/volumeBackups.html",
                    controller: "volumeBackupsCtrl",
                    resolve: {
                        editData: function(){
                            return editData
                        }
                    }

                });
            }
            
        };
        //启动顺序管理
        self.bootMenu = function(editData){
            if(!self.canBootMenu){
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "js/cvm/instances/tmpl/bootMenu.html",
                    controller: "bootMenuCtrl",
                    resolve: {
                        editData: function(){
                            return editData
                        }
                    }

                });
            }
        }
        //getInstance();

        //云主机备份还原
        self.backupRestore = function(editData){
            if(self.canBackupRestore) return;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/cvm/instances/tmpl/backupRestore.html",
                controller: "backupRestoreCtrl",
                resolve: {
                    editData: function(){
                        return editData
                    }
                }

            });
        }
    }])
    .controller("instancesModelCtrl", instancesModelCtrl)

    .controller("createSnapCtrl",["$scope","$rootScope","editData","instancesSrv","volumesDataSrv","$translate","$uibModalInstance","checkedSrv","regularSnapSrv","storageSrv","checkQuotaSrv","vmSrv",
        function($scope,$rootScope,editData,instancesSrv,volumesDataSrv,$translate,$uibModalInstance,checkedSrv,regularSnapSrv,storageSrv,checkQuotaSrv,vmSrv){
            var self=$scope;
            var proTotalSnap,proUsedSnap,proRemainderSnap;
            var depTotalSnap,depUsedSnap,depRemainderSnap;
            self.canConfirm = true;
            self.newObj={};
            self.submitInValid = false;
            self.showPriceTip = $rootScope.billingActive;
            self.priceHour = 0;
            self.priceHourAbout = 0;
            self.priceMonth = 0;
            self.newObj.hasElastic = false;
            self.newObj.snap_number_list=[{name:1},{name:2},{name:3},{name:4},{name:5}];//快照保留份数选项1-5
            self.newObj.holdNumber=self.newObj.snap_number_list[0];
            self.newObj.unit_list = [{name:"一次"},{name:"按小时",unit:"hour"},{name:"按天",unit:"day"},{name:"按周",unit:"week"},{name:"按月",unit:"month"}];
            self.newObj.unit = self.newObj.unit_list[0];
            self.newObj.systemDisk = [];
            self.newObj.dataDisk = [];
            self.system_disk_list=[];
            self.data_disk_list=[];
            self.errorSnap={
                "depSnapNum":$translate.instant("aws.volumes.errorMessage.depSnapNum"),
                "proSnapNum":$translate.instant("aws.volumes.errorMessage.proSnapNum")
            };
            if(editData && editData.description &&  editData.description.indexOf("elastic expansion created")>-1 ){
                self.newObj.hasElastic = true;
            }
            self.changeTime=function(){
                self.chkCurrentTimeTip = false;
            }
            function chkCurrentTime(val){
                var curTime = new Date().getTime();
                var chkTime = new Date(val).getTime()
                if(chkTime<curTime){
                    return false;
                }else{
                    return true;
                }
            }
            self.snapFun=function(type){
                if(type=="week"||type=="month"){
                    self.snapMax="99"
                    self.snapMin="1"
                }else if(type=="day"){
                    self.snapMax="31"
                    self.snapMin="1"
                }else if(type=="hour"){
                    self.snapMax="168"
                    self.snapMin="1"
                }else if(type=="minute"){
                    self.snapMax="59"
                    self.snapMin="1"
                }
            }

            //计费信息
            getSnapAmount();
            function getSnapAmount() {
                if(!self.showPriceTip) {
                    return;
                }
                var option = {
                    snapshotCount: 1,
                    region: localStorage.regionName || "default"
                }
                instancesSrv.getSnapAmount(option).then(function(result) {
                    if(result && result.data && !isNaN(result.data)) {
                        self.priceHour = result.data;
                        self.priceHourAbout = result.data.toFixed(2);
                        self.priceMonth = (result.data * 24 * 30).toFixed(2);
                    }
                });
            }

            function avoidDoubleClick(bol){
                self.cannot_Confirm = bol;
            }
            function getVolumeIds(){
                var volumeIds = [],volumeNames=[];
                if(self.newObj.systemDisk.length){
                    self.newObj.systemDisk.map(item => {
                        volumeIds.push(item.id)
                        volumeNames.push(item.name)
                    })
                }
                if(self.newObj.dataDisk.length){
                    self.newObj.dataDisk.map(item => {
                        volumeIds.push(item.id)
                        volumeNames.push(item.name)
                    })
                }
                return {volumeIds,volumeNames}
            }
            var pushDisk = function(x){
                //bootable为true且root_device为true时是系统盘，为false是数据盘
                if(x.bootable=="true" && x.root_device == "true"){
                    self.system_disk_list.push(x);
                }else{
                    self.data_disk_list.push(x);
                }
            }
            var getServerDetail = function(){
                vmSrv.getVmDisks(editData.uid,{jobType:0}).then(function(result) {
                    if (result && result.data) {
                        var diskInfo = result.data.diskInfo.filter(item => (item.diskFormat != "iso" && (item.status == "in-use"||item.status == "available")));
                        diskInfo = diskInfo.filter(item => !item.magrationing);
                        //diskInfo = diskInfo.filter(item => item.associatedHost.indexOf("nfs")==-1) //.nfs存储不支持快照功能
                        diskInfo = diskInfo.filter(item => (item.storageLimit && item.storageLimit["snapshots"]));
                        diskInfo = diskInfo.filter(item => !(item.storageLimit && !item.storageLimit["share_volumes_snapshots"]&&item.attachments.length>1));
                        diskInfo.forEach((x)=>{
                            //同有双活特性云硬盘不支持快照功能
                            if(x.associatedHost.indexOf("toyou") > -1){
                                var postData = {
                                    "volume_type_name": x.type,
                                }
                                var posthost = x.associatedHost;
                                storageSrv.volume_type_analysis(postData).then(function(result){
                                    if(result && result.data && angular.isObject(result.data)){
                                        if(result.data.Character_message){
                                            if(result.data.Character_message.hyperswap==1){
                                                return ;
                                            }
                                        }
                                    }
                                    pushDisk(x)
                                })
                            }else{
                                pushDisk(x)
                            }
                        })
                        if(self.system_disk_list.length==0 && editData.startStyle == 'Local' ){
                            self.systemDiskTip = $translate.instant('aws.instances.snapshot.localsystemDiskPlace')
                        }else{
                            self.systemDiskTip = $translate.instant('aws.instances.snapshot.nosystemDiskPlace')
                        }
                    }
                });
            }
            
            self.change_snap_number=function(obj){
                self.newObj.holdNumber=obj;
                self.watchVolumeChoose = getVolumeIds().volumeIds;
                checkQuotaSrv.checkQuota(self, "snapshots","","",self.watchVolumeChoose.length*self.newObj.holdNumber.name);
            }
            self.changeDisk = function(){
                self.chooseDiskTipShow = false;
                self.watchVolumeChoose = getVolumeIds().volumeIds;
                checkQuotaSrv.checkQuota(self, "snapshots","","",self.watchVolumeChoose.length*self.newObj.holdNumber.name);
            }
            self.createInsSnap = function(field,editdata){
                var volumeIds = getVolumeIds().volumeIds,
                volumeNames= getVolumeIds().volumeNames;
                // if(!volumeIds.length){
                //     self.chooseDiskTipShow = true
                // }
                if(chkCurrentTime(self.newObj.startTime)){
                    if(field.$valid){
                        if(volumeIds.length){
                            //checkedSrv.setChkIds(volumeIds,"snapshotcreate")
                            if(self.timedSnap){ //定时快照
                                var postData = {
                                    "projectId": localStorage.projectUid,//项目id
                                    "regionKey": localStorage.regionKey,//regionKey 
                                    "serverId":  editData.uid,
                                    "startTime": self.newObj.startTime,
                                    "userId":localStorage.userUid
                                }
                                if(self.newObj.unit.unit){
                                    postData.holdNumber = self.newObj.holdNumber.name,//快照保存份数 
                                    postData.frequency = Number(self.newObj.frequency);//任务触发频率
                                    postData.unit = self.newObj.unit.unit;//任务触发频率单位
                                }
                                regularSnapSrv.createTask(postData,{volumeIds:volumeIds}).then(function(result){
                                })
                            }else{ //非定时快照
                                var post = {
                                    "volumeId": volumeIds.join("#"),
                                    "name":volumeNames.join("#"),
                                }
                                checkedSrv.setChkIds(volumeIds,"snapshotcreate")
                                volumesDataSrv.createSnapshotAction(post).then(function() {
                                });
                            }
                            avoidDoubleClick(true)  //避免双击
                            $uibModalInstance.close();
                        }else{
                            self.chooseDiskTipShow = true; //提示至少选择一块盘
                        }
                    }else{
                        self.submitInValid = true;
                    }
                }else{
                    self.chkCurrentTimeTip = true;
                }
                
            }
            avoidDoubleClick(false)
            //proSnapFunc()
            checkQuotaSrv.checkQuota(self, "snapshots","","",0);
            getServerDetail()
          
    }])

    .controller("snapRollBackCtrl",["$scope","$rootScope","vmdiskInfo","instancesSrv","volumesDataSrv","$translate","$uibModalInstance","checkedSrv", "$filter",
        function($scope,$rootScope,vmdiskInfo,instancesSrv,volumesDataSrv,$translate,$uibModalInstance,checkedSrv,$filter){
            var self=$scope;
            self.submitInValid = false;
            self.newObj = {};
            self.system_snap_list=[];
            self.data_snap_list=[];
            self.newObj.systemDiskSnap = [];
            self.newObj.dataDiskSnap = [];
            vmdiskInfo = vmdiskInfo.filter(item=> {
                return (item.status == "in-use"||item.status == "available")
            });
            console.log(vmdiskInfo)
            function avoidDoubleClick(bol){
                self.cannot_Confirm = bol;
            }
            function getVolumeIds(){
                var volume_snapshots = [];
                if(self.newObj.systemDiskSnap.length){
                    self.newObj.systemDiskSnap.map(item => {
                        volume_snapshots.push({"volumeId":item.volume_id,"snapshotId":item.id})
                    })
                }
                if(self.newObj.dataDiskSnap.length){
                    self.newObj.dataDiskSnap.map(item => {
                        volume_snapshots.push({"volumeId":item.volume_id,"snapshotId":item.id})
                    })
                }
                return volume_snapshots
            }
            function getallvmDiskId(){
               return vmdiskInfo.reduce((list, disk) => {
                    disk.id !== "" && list.indexOf(disk.id) === -1 && list.push(disk.id);
                    return list;
                }, []);
            }
            function getSystemDiskId(diskType){
               return vmdiskInfo.reduce((list, disk) => {
                    disk.id !== "" && list.indexOf(disk.id) === -1 && disk.bootable == diskType && disk.root_device == diskType && list.push(disk.id);
                    return list;
                }, []);
            }
            function getDataDiskId(diskType){
               return vmdiskInfo.reduce((list, disk) => {
                    disk.id !== "" && list.indexOf(disk.id) === -1 && !(disk.bootable == diskType && disk.root_device == diskType) && list.push(disk.id);
                    return list;
                }, []);
            }
            var getVolumeSnapshots = function(vmdiskInfo){
                var allvmDiskId = getallvmDiskId(vmdiskInfo);
                var systemDiskId = getSystemDiskId("true");
                var dataDiskId = getDataDiskId("true");
                var postData = {"volumeid":allvmDiskId};
                if(allvmDiskId.length == 0) return;
                instancesSrv.getVolumeSnapshots(postData).then(function(result) {
                    if (result && result.data && angular.isArray(result.data)) {
                        result.data = result.data.filter(item => 
                            (item.storageLimit && item.storageLimit["os-rollback"])
                        )
                        result.data.map(x =>{
                            if(systemDiskId.indexOf(x.volume_id)>-1){
                                self.system_snap_list.push(x);
                            }else if(dataDiskId.indexOf(x.volume_id)>-1){
                                self.data_snap_list.push(x);
                            }
                            var date = $filter("date")(x.created_at, "MMddHHmm");
                            if (x.name.indexOf('_') < 0) {
                                x.name = x.name + "  (" + date + ")";
                            }
                        });
                        self.system_snap_list_ori = angular.copy(self.system_snap_list);
                        self.data_snap_list_ori = angular.copy(self.data_snap_list);
                    }
                });
            }

            self.changeSnap = function(choosedSnap,typelist){
                self.chooseSnapTipShow = false;
                var list = angular.copy(self[typelist+"_ori"]);
                choosedSnap.map(ch => {
                    list = list.filter(item => item.volume_id != ch.volume_id)
                })
                self[typelist] = list;
            }
           
            self.snapshotRollbackFunc = function(field,editdata){
                let volume_snapshots = getVolumeIds();
                let postData = {volume_snapshots:volume_snapshots}
                const rollbackitems = new Set();
                volume_snapshots.map(item => {
                    rollbackitems.add(item.snapshotId);
                })
                const rollbackarray = Array.from(rollbackitems);  
                if(field.$valid){
                    if(volume_snapshots.length){
                        checkedSrv.setChkIds(rollbackarray,"snapshotrollback")
                        instancesSrv.snapshotRollback(angular.toJson(postData)).then(function(result){
                        })
                        avoidDoubleClick(true)  //避免双击
                        $uibModalInstance.close();
                    }else{
                        self.chooseSnapTipShow = true; //提示至少选择一块盘
                    }
                }else{
                    self.submitInValid = true;
                }
            }
            avoidDoubleClick(false)
            getVolumeSnapshots(vmdiskInfo)
          
    }])

    .controller("manageCDController", ["$scope", "$rootScope", "$uibModal", "$translate", "$timeout", "NgTableParams", "GLOBAL_CONFIG", "checkedSrv",
        "editData", "context", "instancesSrv", function($scope, $rootScope, $uibModal, $translate, $timeout, NgTableParams, GLOBAL_CONFIG, checkedSrv,
        editData, context, instancesSrv) {
        var self = $scope;
        if($rootScope.test){
            $rootScope.test();
            $rootScope.test = null;
        }
        self.delisDisabled = true;
        self.loadingCD = false;
        self.deleteCD = deleteCD;
        self.imageId = angular.copy(editData).uid;
        self.imgIdArr = [];
        self.openManageCD = function() {
            $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "infoCD.html",
                controller: "infoCDController",
                resolve: {
                    initCDTabData: function() {
                        return initCDTab;
                    },
                    imageId: function() {
                        return self.imageId;
                    },
                    imgIdArr: function() {
                        return self.imgIdArr;
                    },
                    showLoading: function() {
                        return showLoading;
                    },
                    context: function() {
                        return context;
                    }
                }
            });
        };
        initCDTab();

        function initCDTab() {
            self.loadingCD = false;
            instancesSrv.getCDTableData(self.imageId).then(function(result) {
                result.data?self.loadData = true:"";
                if(result && result.data) {
                    self.CD_data = result.data;
                    self.CD_data.map(item => {
                        item.status = $translate.instant("aws.instances.cdStatus");
                    });
                    successFunc('tableCDParams');
                    self.imgIdArr = [];
                    _.forEach(result.data, function(item) {
                        self.imgIdArr.push(item.imageId);
                    });
                }
            });
        }

        function successFunc(tableType) {
            self.tableCDParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.CD_data });
            var tableId = "id";
            checkedSrv.checkDo(self, self.CD_data, tableId, tableType);
        }

        function showLoading(bool) {
            self.loadingCD = bool;
        }

        function deleteCD(checkedItems) {
            var content = {
                target: "delCD",
                msg: "<span>" + $translate.instant("aws.instances.cdConfrimISO") + "</span>",
                data: checkedItems
            };
            context.$emit("delete", content);
        };
        $rootScope.test = context.$on("delCD", function(e,data) {
            var volumeIdArr = [];
            _.forEach(data,function(item){
                volumeIdArr.push(item.id);
            });
            showLoading(true);
            instancesSrv.uninstallISO(self.imageId, volumeIdArr).then(function(result) {
                $timeout(function() {
                    initCDTab();
                },2000)
            })
        });
    }])

    .controller("infoCDController", ["$scope", "$rootScope", "$uibModalInstance", "$timeout", "initCDTabData", "showLoading", "imageId", "imgIdArr", "instancesSrv",
        "context", function($scope, $rootScope, $uibModalInstance, $timeout, initCDTabData, showLoading, imageId, imgIdArr, instancesSrv, context) {
        var self = $scope;
        self.devinfo = { value : "" };
        if($rootScope.createIsoVolumeSuccess){
            $rootScope.createIsoVolumeSuccess();
            $rootScope.createIsoVolumeSuccess = null;
        }
        var params = {
            imageIds: imgIdArr.length?imgIdArr:""
        }
        instancesSrv.getISOList(params).then(function(result) {
            if(result && result.data) {
                self.deviceList = result.data;
            }
        });
        $rootScope.createIsoVolumeSuccess = context.$on("createIsoVolumeSuccess", function(e, data) {
            if(self.selectData && data.resourceName == self.selectData.name) {
                initCDTabData();
            }
        });
        self.devConfirm = function(data) {
            if(data) {
                showLoading(true);
                self.deviceList.forEach(function(item, index) {
                    if(item.id == data) {
                        self.selectData = self.deviceList[index];
                    }
                });
                var params = {
                    imageRef: self.selectData.id,
                    name: self.selectData.name,
                    size: self.selectData.vol_size,
                    serverId: imageId
                };
                //先将ISO镜像制作成卷, 制作成功后挂载ISO卷
                instancesSrv.makeVolume(params).then(function(result) {
                    if(result && result.status == "0") {
                        // $timeout(function() {
                        //     initCDTabData();
                        // },5000)
                        // 通过接收挂载成功的推送消息刷新列表
                    } else {
                        showLoading(false);
                    }
                });
            }
            $uibModalInstance.close();
        };
    }])
    .controller("ttEquipmentCtrl", function($scope, $uibModalInstance, instancesSrv, editData ,refresh,context,modalCom,TableCom,$translate,GLOBAL_CONFIG) {
        var self = $scope;
        let serverId = editData.uid        
        self.checkSecond = {
            checked: false,
            items: {}
        };
        self.editData = editData;
        

        self.$watch(function() {
            return self.checkSecond.items;//监控checkbox
        }, function(val) {
            self.checkedItems = [];
            var arr=[];
            for(var i in self.checkSecond.items){
                arr.push(self.checkSecond.items[i])
            }
            if(val && arr.length>=0){
                for(var key in val){
                    if(val[key]){
                        self.ttEquipmentData.forEach(item=>{
                            if(item.id==key){
                                self.checkedItems.push(item);
                            }
                        })
                    }
                }
            }
            if(self.checkedItems.length==1){   
                self.canAdd = true;
                self.canUnload = true;
            }else if(self.checkedItems.length>1){
                self.canAdd = true;
                self.canUnload = false;
            }else if(self.checkedItems.length==0){          
                self.canAdd = true;
                self.canUnload = false;
            }
        },true);
        //关闭弹出层
        console.log(context)
        self.close = function(){
            context.checkboxes.items = {};
            $uibModalInstance.close();
        }
        // 获取已加载的数据
        self.hasTtEquipmentList=function(){
            // instancesSrv.hasTtEquipmentList(serverId).then(function(res){
            //     if(res&&res.data&&res.data.length){
            //         self.ttEquipmentData = res.data
            //     }else{
            //         self.ttEquipmentData = []
            //     }
            // }).then(function(){
                 instancesSrv.allHasTtEquipmentList(serverId).then(function(result){
                    self.ttEquipmentData = []
                    if(result&&result.data&&result.data.length){
                        result.data.forEach(function(val){
                            self.ttEquipmentData.push(val)
                        })
                        self.ttEquipmentData.forEach(function(item,index){
                            item.uid = index+1
                        })
                    }else(
                        self.ttEquipmentData = []
                    )
                    TableCom.init(self,'ttEquipmentTable',self.ttEquipmentData,'id',GLOBAL_CONFIG.PAGESIZE,'checkSecond');
                })
                // console.log(self.ttEquipmentData)
                // self.ttEquipmentData.forEach(function(item,index){
                //     item.id = index+1
                // })
                
            // })
        }
        self.hasTtEquipmentList()

        // 加载
        self.addTtEquipment = function(data){
            var instan = modalCom.init("add-tt-equipment.html","addTtEquipmentCtrl",{refresh:function(){return self.hasTtEquipmentList},context:function(){return self},editData:function(){return self.editData}})
        }
        // 卸载
        self.unloadTtEquipment = function() {
            var content = {
                target: "unloadTtEquipment",
                msg: "<span>" + $translate.instant("aws.instances.tipMsg.unloadTtEquipment") + "</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            context.$emit("delete", content);
        };
        context.$on("unloadTtEquipment", function() { 
            if(self.checkedItems.length>0){
                if(self.checkedItems[0].deviceType == "USB"){
                    let id = self.checkedItems[0].serverId
                    let postData = {
                        usbPort:self.checkedItems[0].usbPort,
                        usbBus:self.checkedItems[0].usbBus,
                        addressBus:self.checkedItems[0].addressBus,
                        addressDevice:self.checkedItems[0].addressDevice,
                    }
                    instancesSrv.unloadTtEquipment(id,postData).then(function(res){
                        self.hasTtEquipmentList()
                    })
                }else if(self.checkedItems[0].deviceType == "GPU"){
                    let id = self.checkedItems[0].serverId;
                    let postData = {
                        bus:self.checkedItems[0].gpuId.split(":")[0],
                        slot:self.checkedItems[0].gpuId.split(":")[1].split(".")[0],
                        function:self.checkedItems[0].gpuId.split(":")[1].split(".")[1],
                        gpuId:self.checkedItems[0].gpuId
                    }
                    instancesSrv.unloadGpuTtEquipment(id,postData).then(function(res){
                        self.hasTtEquipmentList()
                    })
                }
            }
        });
    })
    .controller("addTtEquipmentCtrl", function($scope, $uibModalInstance, instancesSrv, editData ,refresh,context) {
        var self = $scope;
        let serverId = editData.uid  
        let count = context.ttEquipmentData
        self.noCanLoadusbEquipment = false   
        self.noCanLoadgpuEquipment = false   
        self.limitUsbDriveType = false
        self.limitGpuDriveType = false
        self.hasAddEquipmentList = [
            {name:"USB设备",deviceType:"USB"},
            {name:"GPU设备",deviceType:"GPU"}
        ]
        self.compatibilityList = [
            {name:"USB2.0",compatibility:"0"},
            {name:"USB3.0",compatibility:"1"}
        ]
        self.deviceType = {
            name:self.hasAddEquipmentList[0]
        }
        
        self.compatibility = {
            name:self.compatibilityList[0]
        }
        self.equipmentList = []
        // 点击加载之后，加载usb设备
        initUsbEquipment()
        
        // 选择USB兼容性
        // self.choiceCompatibility = function(Compatibility){
        //     console.log(Compatibility)
        // }
        // 初始化usb设备
        function initUsbEquipment(){
            instancesSrv.getTtequipmentList(serverId).then(function(res){
                self.equipmentList = []
                console.log(res.data)
                if(res&&res.data&&res.data.length>0){
                    res.data.forEach(function(item){
                        if(!item.loading){
                            self.equipmentList.push(item)
                        }
                    })
                    if(self.equipmentList.length>0){
                        self.ttEquipmentDetails = self.equipmentList[0]
                        self.noCanLoadusbEquipment = false
                    }else{
                        self.noCanLoadusbEquipment = true
                    }  
                }
            })
        }
        // 初始化gpu设备
        function initGpuEquipment(res){
            instancesSrv.getGpuTtequipmentList(serverId).then(function(res){
                self.equipmentList = []
                if(res&&res.data&&res.data.length>0){
                    res.data.forEach(function(item){
                        if(!item.loading){
                            self.equipmentList.push(item)
                        }
                    })
                    if(self.equipmentList.length>0){
                        self.ttEquipmentDetails = self.equipmentList[0]
                        self.noCanLoadgpuEquipment = false
                    }else{
                        self.noCanLoadgpuEquipment = true
                    }
                }
            })
        }
        // 单选按钮，切换设备类型
        self.getChoiceOne=function(item){
            self.ttEquipmentDetails = item
        }
        let loginData = angular.fromJson(localStorage.$LOGINDATA);
        let regionUid = loginData.regionUid;
        // 第一次进入，检验USB设备是否可加载
        // USB最多加载3条
        // GPU最多加载1条
        function limitDriveType(){
            if(self.deviceType.name.deviceType=="USB"){
                self.limitGpuDriveType = false
                self.noCanLoadgpuEquipment = false
                let num = 0
                count.forEach(function(item){
                    if(item.deviceType=="USB"){
                        num++
                    }
                })
                if(num<3){
                    self.limitUsbDriveType = false
                }else{
                    self.limitUsbDriveType = true
                }
            }else if(self.deviceType.name.deviceType=="GPU"){
                self.limitUsbDriveType = false
                self.noCanLoadusbEquipment = false                
                let num = 0
                count.forEach(function(item){
                    if(item.deviceType=="GPU"){
                        num++
                    }
                })
                if(num<2){
                    self.limitGpuDriveType = false
                }else{
                    self.limitGpuDriveType = true
                }
            }
        }
        limitDriveType()

        self.showCompatibilitySelect = true
        self.choiceDriveType = function(item){
            if(item.deviceType=="USB"){
                self.equipmentList = []
                initUsbEquipment()
                limitDriveType()
                self.showCompatibilitySelect = true
            }else if(item.deviceType=="GPU"){
                self.equipmentList = []                
                initGpuEquipment()
                limitDriveType()
                self.showCompatibilitySelect = false
            }
        }

        self.addTtEquipmentConFirm = function(){
            if(self.deviceType.name.deviceType == "USB"){
                let postData = {
                    serverId : editData.uid ,
                    enterpriseUid : localStorage.enterpriseUid,
                    regionUid : regionUid,
                    regionKey : localStorage.regionKey,
                    serverName : editData.name,
                    hostName : self.ttEquipmentDetails.host,
                    deviceType : self.deviceType.name.deviceType,
                    description : self.ttEquipmentDetails.description,
                    addressBus : self.ttEquipmentDetails.address_bus,
                    addressDevice : self.ttEquipmentDetails.address_device,
                    usbBus : self.compatibility.name.compatibility,
                }
                // console.log(postData.usbBus)
                instancesSrv.addTtEquipment(serverId,postData).then(function(res){
                    $uibModalInstance.close();
                    refresh()
                })
            }else if(self.deviceType.name.deviceType == "GPU"){
                let postData = {
                    serverId:editData.uid,
                    enterpriseUid:localStorage.enterpriseUid,
                    regionUid:regionUid,
                    regionKey:localStorage.regionKey,
                    bus:self.ttEquipmentDetails.id.split(":")[0],
                    slot:self.ttEquipmentDetails.id.split(":")[1].split(".")[0],
                    function:self.ttEquipmentDetails.id.split(":")[1].split(".")[1],
                    gpuId:self.ttEquipmentDetails.id,
                    serverName: editData.name,
                    deviceType:self.deviceType.name.deviceType,
                    description:self.ttEquipmentDetails.desc,
                    host:self.ttEquipmentDetails.host,
                }
                instancesSrv.addGpuTtEquipment(serverId,postData).then(function(res){
                    $uibModalInstance.close();
                    refresh()
                })
            }
        }
    })
    .controller("errorStartController",["$scope","editData","context","instancesSrv","refresh","$uibModalInstance",function($scope,editData,context,instancesSrv,refresh,$uibModalInstance){
        /*不支持批量，初始状态在虚拟机详情里面--->{{context.editDataCopy}}里面，
        看这里，详情里面也需要展示此字段，任家彬看这里*/
        var self = $scope;
        self.canDoIt = false
        self.isError = {
            errorFlag : context.editDataCopy.abnormalRestart
        }   
        // console.log(context.editDataCopy)
        self.changeStatus = function(item){
            if(item != context.editDataCopy.abnormalRestart){
                self.canDoIt = true
            }else{
                self.canDoIt = false
            }
        }

        self.confirmDel = function(){
            instancesSrv.errorStart(context.editDataCopy.uid,self.isError.errorFlag).then(function(res){
                $uibModalInstance.close();
                refresh()
            })
        }
    }])



    



    