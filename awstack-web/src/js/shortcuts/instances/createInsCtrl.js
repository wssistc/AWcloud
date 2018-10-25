import "./createInsSrv";
import "./securityGroupSrv";
import "../../common/services/commonFuncSrv";
import {
    createInstanceCtrl as quickCreateInsCtrl
} from "../../cvm/instances/createInstanceCtrl";

//import {imageCtrlFunc} from "../../cvm/images/makeImageModule"


let createInsModule = angular.module("createInsModule", ["commonFuncModule", "createInsSrvModule", "ngFileSaver"]);

function createInsCtrl($scope, $rootScope, NgTableParams, $translate, $filter, $location, $routeParams, $uibModal,
    flavorsSrv, imagesSrv, snapshotsDataSrv, checkQuotaSrv, securityGroupSrv, networksSrv, instancesSrv, commonFuncSrv, 
    keyPairsSrv, createInsSrv, cvmViewSrv, depviewsrv, aggregatesSrv, storageSrv, overviewSrv, volumesDataSrv,vmFuncSrv,
    backupsSrv,affinitySrv,insTab,makeImageSrv,dataclusterSrv,$timeout) {
    var self = $scope;
    self.showPrice = false;
    self.canBatchNoCeph = true;
    self.canBatch = true;
    self.currTab =  "defined";
    self.currTabTemp = "js/shortcuts/instances/tmpl/"+self.currTab+"CreateIns.html";
    self.isCustom = localStorage.isCustom == "true"?true:false;
    self.bootLocal = true;
    self.createInsForm = {
        // disDomainName:localStorage.domainName,
        // disProjectName:localStorage.projectName
    };
    self.node = {};
    self.poolsInfo_data = {};
    self.options={
        canJoinNode:true,
    };
    self.insForm = {
        hostNum:1,
        networkList:[]
    };
    self.network = {};
    
    self.definedInsNet = {};
    self.storage = {
        isUseLocal:self.isCustom ?false: true
    };
    self.flavorSpecific = {
        cpu:[],
        ram:[]
    }
    self.source ={
        new:true,
        fromImage :false,
        fromSnapshot:false,
        isQuickEnter:Boolean($routeParams.type=="quick"),
    }
    self.regionBusiAuth = JSON.parse(localStorage.regionBusiAuth);
    self.supportPass = JSON.parse(localStorage.supportPaas);
    self.supportCloudSecurity = false;
    self.supportCOC = false;
    if(self.ADMIN && self.supportPass && ((self.supportPass.CloudSecurity && self.supportPass.CloudSecurity.isLinked)||(self.supportPass.SkyCloudSecurity && self.supportPass.SkyCloudSecurity.isLinked) )){
        self.regionBusiAuth.map(item => {
            if(item == 13||item==17){
                self.supportCloudSecurity = true;
            }
        })
    }
    if(self.ADMIN &&  self.supportPass && self.supportPass.COC && self.supportPass.COC.isLinked ){
        self.regionBusiAuth.map(item => {
            if(item == 15){
                self.supportCOC = true;
            }
        })
    }
    
    localStorage.managementRole != 2 ? self.roleNumber = false : self.roleNumber = true;
    //校验是否有缓存盘
    self = vmFuncSrv.cacheVolume(self,instancesSrv);
    //存储服务
    self = vmFuncSrv.storageFunc(self,instancesSrv,storageSrv);
    //安全组服务
    self = vmFuncSrv.securityFunc(self,instancesSrv);
    //密钥对服务
    self = vmFuncSrv.keypairsFunc(self,instancesSrv);

    //系统调度服务
    self =  vmFuncSrv.zoneFunc(self,instancesSrv,aggregatesSrv);
    //配额服务
    self =  vmFuncSrv.quotaFunc(self,instancesSrv,cvmViewSrv,depviewsrv);

    self = vmFuncSrv.imageFunc(self,instancesSrv,"cvm");

    if(self.isCustom){
        initBootStyle()
    }else if(!self.isCustom){
       getNodes()
    }

    function initBootStyle(){
        if(self.services.cinder){
            self.storage.isUseLocal = 2;   //2可以用云硬盘
        }else if(!self.isCustom && self.bootLocal ){
            self.storage.isUseLocal = 1;   //1可以用本地盘
        }else{
            self.storage.isUseLocal = 0;   //都不可以用
        }
        self.$broadcast("initFlavor")     //异步情况下，获取node在flavor后
    }

    function getNodes(){
        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
        dataclusterSrv.getAllNode(regionUid).then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map(item => {
                    item.nodeConfigScript =  JSON.parse(item.nodeConfigScript);
                    item.hostInfo = JSON.parse(item.hostInfo)
                    if(item.nodeConfigScript && !item.nodeConfigScript.disk_data && item.hostInfo && item.hostInfo.var_data_size<800 ){
                        self.bootLocal = false;
                    }
                })
                initBootStyle()
            }
        })
    }
    function getCanUseNodes() {
        var enterpriseUid = localStorage.enterpriseUid;
        var regionUid = JSON.parse(localStorage.$LOGINDATA).regionUid;
        createInsSrv.getNodes(enterpriseUid, regionUid).then(function (data) {
            var num = 0;
            if (data && data.data) {
                for (var obj in data.data) {
                    if (data.data[obj]) {
                        num++;
                    }
                }
            }
            self.options.canUseNodes = num;
        })
    }
    self.$watch(function() {
        return self.insForm.hostNum;
    }, function(val) {
        if (val) {
            numWatch(val)
        }
    });

    //初始化两个tab里面的网络列表
    // self.$watch(function() {
    //     return self.currTab;
    // }, function(val) {
    //     netInit(val)
    // });

    function netInit(val){
        if(val=='defined'){
            self = commonFuncSrv.setAssignIpFun(self, "definedInsNet","step3InsForm","private");
        }else if(val=='quick'){
            if(self.roleNumber){
                self = commonFuncSrv.setAssignIpFun(self, "network","InstanceForm","");
            }else{
                self = commonFuncSrv.setAssignIpFun(self, "network","InstanceForm","private"); 
            }
        }
    }
    function numWatch(val){
        if(self.options.imgSrc =="img" && self.storage.isUseLocal == 2){
            self.getBatchVolum(self.arch.selected,self.storage.storageDeviceSelected);
            self.getCacheVolume(self.arch.selected,self.storage.storageDeviceSelected);
        }
        if (self.options.checkedPolocies === "anti-affinity") {
            var memberNum = self.options.checkedMemberNum*1;
            var wilAddNum = self.insForm.hostNum*1;
            if (memberNum + wilAddNum > self.options.canUseNodes) {
                self.options.canJoinNode = true;
            } else {
                self.options.canJoinNode = false;
            }
        } else {
            self.options.canJoinNode = false;
        }
        if (self.createInsForm.selectedFlavor) {
            self.testProQuotaFunc(self.createInsForm.selectedFlavor, val);
            self.testDomQuotaFunc(self.createInsForm.selectedFlavor, val);
        }
        if(self.currTab ==  "quick") { //快捷配置教员云硬盘相关配额
            self.testVolumes();
        }
        if (val > 1) {
            self.network.assignIP = false;
            self.createInsForm.dataDiskArray = [];
        }
    }

    //获取所有添加的空白盘
    self.getBalkvolume = function(){
        if(self.currTab ==  "defined"){
            self.createInsForm.getBalkvolumeArray = self.createInsForm.dataDiskArray.filter(item => item.device.id != "has");
            return self.createInsForm.getBalkvolumeArray;
        }else if(self.currTab ==  "quick" || self.currTab ==  "iso"){
            return [];
        }
        
    }

    self.testVolumes = function(count,size){   //检验云硬盘相关   //如果传了count和size是校验iso创建云主机的
        var blackVolumeSize = size||0;
        var bootOfVoule =  0  //新建云主机系统盘所占用的配额
        if(self.storage.isUseLocal==2){
            bootOfVoule = count || 1
        }
        self.getBalkvolume().map(item =>{
            blackVolumeSize = blackVolumeSize + Number(item.size||0)
        })
        switch(self.options.imgSrc){
            case "img":
                blackVolumeSize = blackVolumeSize + Number(self.createInsForm.sysVolumeSize || 0)
                self.testProVolQuotaFunc(self.insForm.hostNum,bootOfVoule+self.getBalkvolume().length,blackVolumeSize);
                self.testDomVolQuotaFunc(self.insForm.hostNum,bootOfVoule+self.getBalkvolume().length,blackVolumeSize);
                break;
            case "snap":
                blackVolumeSize = blackVolumeSize + Number(self.createInsForm.selectedSnap.size || 0)
                self.testProVolQuotaFunc(self.insForm.hostNum,bootOfVoule+self.getBalkvolume().length,blackVolumeSize);
                self.testDomVolQuotaFunc(self.insForm.hostNum,bootOfVoule+self.getBalkvolume().length,blackVolumeSize);
                break;
            case "backup":
                blackVolumeSize = blackVolumeSize + Number(self.createInsForm.selectedBackup.size || 0)
                self.testProVolQuotaFunc(self.insForm.hostNum,bootOfVoule+self.getBalkvolume().length,blackVolumeSize);
                self.testDomVolQuotaFunc(self.insForm.hostNum,bootOfVoule+self.getBalkvolume().length,blackVolumeSize);
                break;
            case "volume":
                self.testProVolQuotaFunc(self.insForm.hostNum,self.getBalkvolume().length,blackVolumeSize);
                self.testDomVolQuotaFunc(self.insForm.hostNum,self.getBalkvolume().length,blackVolumeSize);
                break;

        }
        return blackVolumeSize;
    }

    self.initFlavorTable = function(data,select){
        //var data = self.filterFlavorFromBoot(data);
        data.forEach(function(flavor){
            flavor.cpuTopoArr=[];
            if(flavor.sockets){
               flavor.cpuTopoArr.push({name:$translate.instant("aws.system.flavor.sockets"),value:flavor.sockets}); 
            }
            if(flavor.cores){
               flavor.cpuTopoArr.push({name:$translate.instant("aws.system.flavor.cores"),value:flavor.cores}); 
            }
            if(flavor.threads){
               flavor.cpuTopoArr.push({name:$translate.instant("aws.system.flavor.threads"),value:flavor.threads}); 
            }
        });
        self.options.insFlavorTable = new NgTableParams({
            count: data.length
        }, {
            counts: [],
            dataset:data
        });
        if (data.length) {
            self.createInsForm.flavor = select?select.id : data[0].id;
            self.createInsForm.selectedFlavor = select || data[0];
        }else{
            self.createInsForm.selectedFlavor = {ram:0,vcpus:0};
            self.$broadcast("showPrice",false)
           
        }
    }
    self.checkPoolInQUick = function(){
        if(self.storage.isUseLocal == 1){
            self.checkVolumFun(0)
        }else if(self.storage.isUseLocal == 2){
            self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
        }
    }
    self.getStorage = function(poolCallbackFunc,toyouDeviceCallback){
        instancesSrv.getStorage().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                self.storageDeviceList = res.data;
                self.storageDeviceListCopy = angular.copy(self.storageDeviceList);
                self.storageDeviceListCopy.push({"disPlayName":$translate.instant('aws.action.selectExistVol'),id:"has"}) ;
                self.storage.storageDeviceSelected = self.storage.storageDeviceSelected?self.storage.storageDeviceSelected:self.storageDeviceList[0];
                if(self.storage.storageDeviceSelected && self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
                        toyouDeviceCallback?self.getToyouDevice(toyouDeviceCallback):"";
                }
                if(self.currTab == "quick"){
                    self.checkPoolInQUick()
                }
                
            }
        })
    };
    //获取所有可以加载的云硬盘
    self.getVallDisk = function(){
        self.createInsForm.dataDiskArray = [];
        self.createInsForm.getAvalDisk = false;
        instancesSrv.getVallDisk().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data = res.data.filter( item=> (item.status == "available" || item.status == "in-use"));
                res.data = res.data.filter(item => !item.magrationing) //卷迁移中卷不能进行任何操作
                self.createInsForm.getAvalDisk = true;
                self.createInsForm.avalDisk = res.data;
                self.createInsForm.avalDiskCopy = angular.copy(res.data);
            }
        })
    }
    self.setInsNum = function(type) {
        if ((self.insForm.hostNum <= 1 && type == "minus") || (self.insForm.hostNum >= 10 && type == "add")) {
            return;
        }
        if (type == "minus") {
            self.insForm.hostNum--;
        } else {
            self.insForm.hostNum++;
        }
        self.zone.selected = self.zoneList [0];
        self.node.selected = self.zone.selected.nodeList[0];
        self.node.list = self.zone.selected.nodeList;
    };
    self.getVmGroups = function(){
        affinitySrv.getAffinityGroupList().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
               self.createInsForm.vmGroups = res.data;
               self.createInsForm.vmGroups.map(function (item) {
                    item.showInfo = item.name + "(" + $translate.instant("aws.instances." + item.policies[0]) + ")";
                    if (item.policies[0] === "anti-affinity" && item.members.length === self.options.canUseNodes) {
                        item.showInfo = item.name + "(" + $translate.instant("aws.instances." + item.policies[0]) + "$translate.instant('aws.instances.addinstances.theMemberEnough'))";
                    }
                    if (item.policies[0] === "anti-affinity" && item.members.length < self.options.canUseNodes) {
                        item.showInfo = item.name + "(" + $translate.instant("aws.instances." + item.policies[0]) + $translate.instant('aws.instances.addinstances.canCreate') + (self.options.canUseNodes-item.members.length)+$translate.instant('aws.instances.addinstances.unitMember')  + ")";
                    }
                })
                self.createInsForm.vmGroups.unshift({name:$translate.instant('aws.action.pleaseSelect'),showInfo:$translate.instant('aws.action.pleaseSelect'),id:""})
            }
        })
    }
    self.pollInfoCallBackFunc = function(size){
        switch(self.options.imgSrc){
            case "img":
                if (self.arch && self.arch.selected){
                    if(self.currTab == "defined"){
                        self.checkVolumFun(self.createInsForm.sysVolumeSize);
                    }else if(self.currTab == "quick"){
                        self.checkVolumFun(self.arch.selected.size);
                    }
                    else if(self.currTab == "iso"){
                        self.checkVolumFun(size);
                    }
                    
                    self.getCacheVolume(self.arch.selected,self.storage.storageDeviceSelected);
                    self.getBatchVolum(self.arch.selected,self.storage.storageDeviceSelected);
                }
                break;
            case "snap":
                if(self.createInsForm.selectedSnap && self.createInsForm.selectedSnap.size){
                    self.checkVolumFun(self.createInsForm.selectedSnap.size);
                }
                break;
            case "backup":
                if(self.createInsForm.selectedBackup && self.createInsForm.selectedBackup.size){
                    self.checkVolumFun(self.createInsForm.selectedBackup.size);
                }
                break;
        }
    } 
    self.getvolType = function(device, hyperswap = 0) {
        self.storage.storageSelected = "";
        self.nomore_voltype = false;
        var posta = {
            "Vendor": "TOYOU",
            "Storage_name": device[1],
            "Pool_name": device[2],
            "Character_message": {
                "compression": 0,
                "rsize": 0,
                "easytier": 0,
                "hyperswap": hyperswap
            }
        };
        storageSrv.getVoltype(posta).then(function(result) {
            if (result && result.data && result.data.volume_type_id) {
                self.storage.storageDeviceSelected.volumeTypeId = result.data.volume_type_id;
            } else {
                self.nomore_voltype = true;
            }
        })
    }
    self.getToyouVolumeCharacter = function(device){
        var postData = {
            "id": device[0],
            "Storage_name": device[1]
        }
        //获取该资源池支持的存储特性
        storageSrv.getFeatures(postData).then(function(result) {
            if (result && result.data && angular.isArray(result.data.Storage_characters)) {
                self.storageFeatures = result.data.Storage_characters;
                var hasHyperswap = 0;
                if (self.storageFeatures.indexOf("hyperswap") > -1) {
                    hasHyperswap = 1;
                }
                self.getvolType(device, hasHyperswap)
            }
        })
    }
    //获取镜像列表
    self.operateImageTable = function(data){
        if(self.currTab == "quick") return;
        data.map(function(item) {
            if (item.os && (item.os).toLowerCase() == "unknown") {
                item.os = "";
                item.os_type = "";
            }

            if (item.os_type != null && item.size != null && item.arch != null ) {
                if (((item.os_type).toLowerCase() == 'windows' || (item.os_type).toLowerCase() == "linux") 
                    && (item.size != 0) && (item.arch == "x86_64" || item.arch == "i686") 
                    && item.disk_format != 'iso' && item.status.toLowerCase() === 'active') {
                    item.canUse = true;
                } 
            }else{
                item.canUse = false;
            }
            item.status = item.status.toLowerCase();
            item._imageType = item.is_public ? $translate.instant('aws.img.is_public.true') :  $translate.instant('aws.img.is_public.false');
            item.size = item.size*1;
            item.os_type = item.os_type ? item.os_type.toLowerCase() : "";
            return item;
        });
        data = data.filter(item => {
            return item.canUse == true;
        });
        
        var dataCopy = angular.copy(data);
        self.InsImagesList = angular.copy(data);
        self.insImgTable = new NgTableParams({
            count: data.length
        }, {
            counts: [],
            dataset: data
        });

        if (data.length) {
            //self.createInsForm.image_id = data[0].imageUid;
            self.createInsForm.chkImageId = data[0].imageUid;
            self.arch.selected = data[0];
            self.createInsForm.sysVolumeMinSize = data[0].size;
            self.createInsForm.sysVolumeSize = data[0].size;
        }
    }
    self.operateImageCame = function(data){
        data.map(item =>{
            if(item.imageUid == $location.search().imageUid){
                self.arch.selected = item;
                self.arch.selected.imgType = item.is_public?"public":"private";

            }
        })
        self.createInsForm.sysVolumeMinSize = self.arch.selected.size;
        self.createInsForm.sysVolumeSize =self.arch.selected.size;
    }
    self.getInsImages = function(callbackFunc){
        self.arch = {
            selected: {}
        };
        imagesSrv.getImages().then(function(res){
            res ? self.loadImgData = true : "";
            if (res && res.data){
                callbackFunc(res.data)
            }
        })
    }
    //获取系统盘快照
    self.operateSysSnapTable = function(data){
        var sysSnapData = [];
        data.forEach((x) => {
            if (x.bootTable) {
                sysSnapData.push(x);
            }
        })
        sysSnapData.map(function(item) {
            var date = $filter("date")(item.created, "MMddHHmm");
            if (item.name.indexOf("_") < 0) {
                item.name = item.name + "  (" + date + ")";
            }
            return item;
        });
        sysSnapData = sysSnapData.filter(item=>{
            return item.status.toLowerCase() === "available";
        });
        self.insSysSnapTable = new NgTableParams({
            count: sysSnapData.length
        }, {
            counts: [],
            dataset: sysSnapData
        });
        // if (sysSnapData.length) {
        //     self.createInsForm.snap_id = sysSnapData[0].id;
        //     self.createInsForm.selectedSnap = sysSnapData[0];
        //     self.storage.storageDeviceSelected = sysSnapData[0].storageInfo;
        // }
    }
    self.operateSysSnapCame = function(data){
        self.createInsForm.selectedSnap = data;
        self.createInsForm.snap_id = data.id;
        self.storage.storageDeviceSelected = data.storageInfo;
    }
    self.getInsSysSnap = function(callbackFunc){
        if($location.search().snapshotId){
            snapshotsDataSrv.snapShotDetailAction($location.search().snapshotId).then(function(result){
                if (result && result.data && angular.isArray(result.data)){
                    callbackFunc(result.data[0])
                }
            })
        }else{
            snapshotsDataSrv.getSnapshotsTableData().then(function(result){
                result ? self.loadSnapData = true : "";
                if (result && result.data){
                    callbackFunc(result.data)
                }
            })
        }
        
    }

    //获取系统盘
    self.operateSysVolumeTable = function(data){
        var sysVolumeData = data;
        self.insSysVolumeTable = new NgTableParams({
            count: sysVolumeData.length
        }, {
            counts: [],
            dataset: sysVolumeData
        });
        // if (sysVolumeData.length) {
        //     self.createInsForm.volume_id = sysVolumeData[0].id;
        //     self.createInsForm.selectedVolume = sysVolumeData[0];
        //     self.storage.storageDeviceSelected = sysVolumeData[0].storageInfo;
        // }
    }
    self.operateSysVolume = function(data){
        self.createInsForm.selectedVolume = data;
        self.storage.storageDeviceSelected = data.storageInfo;
        self.changeVolume(data)
        self.createInsForm.volume_id = self.createInsForm.selectedVolume.id;
    }
    self.getInsSysVolume = function(callbackFunc){
        if($location.search().volumeId){
            volumesDataSrv.detailVolumeData($location.search().volumeId).then(function(result){
                if(result && result.data && angular.isArray(result.data)){
                    callbackFunc(result.data[0])
                }
            })
        }else{
            volumesDataSrv.getVolumesTableData().then(function(result){
                result ? self.loadVolumeData = true : "";
                if (result && result.data){
                    result.data = result.data.filter(item => !item.magrationing) //卷迁移中卷不能进行任何操作
                    result.data = result.data.filter(item => item.bootable && item.status == "available" && !( item.metaData && item.metaData.image_cache_name))
                    result.data = result.data.filter(item => !(item.imageMetadata && item.imageMetadata.disk_format =="iso"))
                    callbackFunc(result.data)
                }
            })
        }
        
    }
    //获取系统盘备份
    self.operateSysBackupTable = function(data){
        var sysBackupData = data;
        self.insSysBackupTable = new NgTableParams({
            count: sysBackupData.length
        }, {
            counts: [],
            dataset: sysBackupData
        });
        // if (sysBackupData.length) {
        //     self.createInsForm.backup_id = sysBackupData[0].id;
        //     self.createInsForm.selectedBackup = sysBackupData[0];
        // }
    }
    self.operateSysBackup = function(data){
        self.createInsForm.selectedBackup = data;
        self.createInsForm.backup_id = self.createInsForm.selectedBackup.id;
    }
    self.getInsSysBackup = function(callbackFunc,backupId){
        if($location.search().backupId){
            backupsSrv.getBackupsDetail($location.search().backupId).then(function(result){
                if(result && result.data){
                    callbackFunc(result.data)
                }
            })
        }else{
            backupsSrv.getBackups().then(function(result){
                result ? self.loadBackupData = true : "";
                if (result && result.data){
                    result.data = result.data.filter(item => item.bootable&&item.status=="available")
                    callbackFunc(result.data)
                }
            })
        }
        
    }
    //过滤掉数据盘选择中的Image所选的卷
    self.changeVolume = function(volume){
        if(self.options.imgSrc != "volume") return;
        self.createInsForm.selectedVolume = volume;
        self.storage.storageDeviceSelected = volume.storageInfo;
        self.createInsForm.dataDiskArray = [];
        self.checkVolumFun(0);
        self.testProVolQuotaFunc(self.insForm.hostNum,0)
        self.testDomVolQuotaFunc(self.insForm.hostNum,0)
    }

    self.getPrice = function(cpuCount,memorySize,step){
        if(!$rootScope.billingActive || !cpuCount || !memorySize ){
            return ;
        }
        var postData ={
            "region":localStorage.regionName?localStorage.regionName:"default",
            "cpuCount":cpuCount,
            "memorySize":memorySize
        }
        if(createInsSrv){
            createInsSrv.getPrice(postData).then(function(data){
                if(data && !isNaN(data.data)){
                    var price = Number(data.data) ;
                    if((self.currTab=="defined" && step > 1) || self.currTab=="quick"){
                        var postdata  ={
                            "region":localStorage.regionName?localStorage.regionName:"default",
                            "volumeSize":0
                        }
                        let dataVolumeSize = self.createInsForm.dataVolumeSize ? Number(self.createInsForm.dataVolumeSize) : 0;
                        let sysVolumeSize = self.createInsForm.sysVolumeSize ? Number(self.createInsForm.sysVolumeSize) : 0;
                        let selectedSnapSize = (self.createInsForm.selectedSnap && self.createInsForm.selectedSnap.size) ? Number(self.createInsForm.selectedSnap.size) : 0;
                        let selectedBackupSize = (self.createInsForm.selectedBackup && self.createInsForm.selectedBackup.size) ? Number(self.createInsForm.selectedBackup.size) : 0;

                        postdata.volumeSize = dataVolumeSize;
                        if(self.storage.isUseLocal==2){
                            switch (self.options.imgSrc) {
                                case "img":
                                    postdata.volumeSize += sysVolumeSize;
                                    break;
                                case "snap":
                                    postdata.volumeSize += selectedSnapSize;
                                    break;
                                case "backup":
                                    postdata.volumeSize += selectedBackupSize;
                                    break;
                            }
                        }
                        if(postdata.volumeSize >0){
                            createInsSrv.getVlomesPrice(postdata).then(function(res){
                                if(res && !isNaN(res.data)){
                                    self.$broadcast("showPrice",true);
                                    self.price = (price*10*10 + Number(res.data)*10*10)/100;
                                    self.priceFix = (self.price*10*10 * Number(self.insForm.hostNum))/100;
                                    self.totalPrice = (self.price*10*10 * 30 * 24 * Number(self.insForm.hostNum))/100;
                                }
                            })
                        }else{
                            self.$broadcast("showPrice",true)
                            self.price = price;
                            self.priceFix = (self.price * Number(self.insForm.hostNum)).toFixed(2);
                            self.totalPrice = (self.price * 30 * 24 * Number(self.insForm.hostNum)).toFixed(2);
                        }
                        
                    }else{
                        self.$broadcast("showPrice",true);
                        self.price =price;
                        self.priceFix = (self.price * Number(self.insForm.hostNum)).toFixed(2);
                        self.totalPrice = (self.price * 30 * 24 * Number(self.insForm.hostNum)).toFixed(2);
                    }
                }else{
                    self.$broadcast("showPrice",true)
                    self.price ="N/A";
                    self.priceFix =  "N/A";
                    self.totalPrice = "N/A"
                }
                
            })
        }
      
    }
    self.initSource = function(){
        self.source.new = false;
        self.source.urlTable = "/cvm/instances";
        switch($location.search().from){
            case "image":
                self.options.imgSrc = "img";
                self.source.urlTable = "/cvm/images"
                self.source.fromImage = true;
                self.getInsImages(self.operateImageCame);
                break;
            case "snapshot":
                self.options.imgSrc = "snap";
                self.source.urlTable = "/cvm/snapshots";
                self.source.fromSnapshot = true;
                self.storage.isUseLocal = 2;
                self.getInsSysSnap(self.operateSysSnapCame)
                break;
            case "volume":
                self.options.imgSrc = "volume";
                self.source.urlTable = "/cvm/volumes";
                self.source.fromVolume = true;
                self.storage.isUseLocal = 2;
                self.getInsSysVolume(self.operateSysVolume)
                break;
            case "backup":
                self.options.imgSrc = "backup";
                self.source.urlTable = "/cvm/backups";
                self.source.fromBackup = true;
                self.storage.isUseLocal = 2;
                self.getInsSysBackup(self.operateSysBackup);
                break;
            case "topo":
                self.source.urlTable = "/cvm/netTopo";
            default:
                self.source.new = true;
                self.options.imgSrc = "img";
                self.getInsImages(self.operateImageTable);
                self.getInsSysSnap(self.operateSysSnapTable);
                self.getInsSysVolume(self.operateSysVolumeTable)
                self.getInsSysBackup(self.operateSysBackupTable)
        }
        self.source.url =  $location.url();
    }
    self.changeRegion = function(item){
        item.regionKey = localStorage.regionKey;
        getDomain()
    }
    //切换部门
    self.changeDomain = function(domain) {
        var name = self.createInsForm.name;
        var flavor = self.createInsForm.selectedFlavor;
        self.createInsForm = {};
        self.createInsForm.name = name;
        self.createInsForm.selectedFlavor=flavor;
        self.createInsForm.flavor = flavor.id;
        self.createInsForm.domain = domain;
        if (domain.projects && domain.projects[0]) {
            self.createInsForm.project = domain.projects[0];
            initSrv();
        } else {
            self.createInsForm.project = "";
        }
    };
    //切换项目
    self.changeProject = function(domain,project) {
        var name = self.createInsForm.name;
        var flavor = self.createInsForm.selectedFlavor;
        self.createInsForm = {};
        self.createInsForm.name = name;
        self.createInsForm.selectedFlavor=flavor;
        self.createInsForm.flavor = flavor.id;
        self.createInsForm.domain = domain;
        self.createInsForm.project = project;
        initSrv();
    };
    self.changeAffinityGroup = function (data) {
        if(!data.id) return;
        self.options.checkedMemberNum = data.members.length;
        self.options.checkedPolocies = data.policies[0];
        self.zone.selected = self.zoneList [0];
        self.node.selected = self.zone.selected.nodeList[0];
        self.node.list = self.zone.selected.nodeList;
        if (data.policies[0] === "anti-affinity") {
            var memberNum = data.members.length;
            var wilAddNum = self.insForm.hostNum;
            if (memberNum + wilAddNum > self.options.canUseNodes) {
                self.options.canJoinNode = true;
            } else {
                self.options.canJoinNode = false;
            }
        } else {
            self.options.canJoinNode = false;
        }
    }
    self.createInsTab = function(tab) {
        if(self.currTab == tab){return};
        self.currTab = tab;
        self.insForm.hostNum = 1;
        self.createInsForm.vmGroupSelected = self.createInsForm.vmGroups[0];
        if (self.currTab == "defined") {
            netInit(tab)
            self.currTabTemp = 'js/shortcuts/instances/tmpl/definedCreateIns.html';
        }else if(self.currTab == "quick"){
            getInsBasicCtrl();
            self.currTabTemp = 'js/shortcuts/instances/tmpl/quickCreateIns.html';
        }else{
            self.currTabTemp = 'js/shortcuts/instances/tmpl/isoCreateIns.html';
            //getIsoCreateInsCtrl()
        }
    };

    self.$on("send-create", function(e, val) {
        if (val && val.type) {
            switch (val.type) {
                case 'project':
                    getDomain();
                    break;
                case 'domain':
                    getDomain();
                    break;
                case 'network':
                    break;
            }
        }
    })
    function setDomainProject() {
        if(!self.createInsForm.domain || !self.createInsForm.project) return;
        localStorage.domainName = self.createInsForm.domain.domainName;
        localStorage.domainUid = self.createInsForm.domain.domainUid;
        localStorage.projectName = self.createInsForm.project.projectName;
        localStorage.projectUid = self.createInsForm.project.projectId;
    }
    function setRoleByProject() {
        createInsSrv.getRole(localStorage.projectUid).then(function(res) {
            if (res && res.data) {
                localStorage.rolename = res.data.roleName;
            }
        });
    }
    function getInsBasicCtrl() {
        quickCreateInsCtrl(self, $rootScope, instancesSrv, $translate, cvmViewSrv, depviewsrv, aggregatesSrv, networksSrv, storageSrv, overviewSrv, volumesDataSrv, commonFuncSrv, $location,vmFuncSrv,flavorsSrv,$timeout);
    }
    // function getIsoCreateInsCtrl(){
    //     imageCtrlFunc($scope,$rootScope,$translate,makeImageSrv,imagesSrv,instancesSrv)
    // }
    function getDomain() {
        /**
         * @description 获取部门 = self.options.domainList
         * @param self  作用域
         * @param options //父级变量
         * @param callbackFunc //回调函数
         */
        vmFuncSrv.domainTranslate(self,"options",getDomaincallbackFunc)
    }

    function getDomaincallbackFunc(){
        self.createInsForm.domain = self.options.domainList[0];
        self.options.domainList.map(function(item) {
            if (item.domainUid == localStorage.domainUid) {
                self.createInsForm.domain = item;
            }
        });
        self.createInsForm.project = self.createInsForm.domain.projects[0];
        self.createInsForm.domain.projects.map(function(item){
            if (item.projectId == localStorage.projectUid) {
                self.createInsForm.project = item;
            }
        })
        initSrv();
        self.getStorage(self.pollInfoCallBackFunc,self.getToyouVolumeCharacter);
    }

    function initSrv(){
        self.createInsForm.dataDiskArray = [];
        self.createInsForm.disk_buses = [{name:$translate.instant('aws.common.defaultType'),id:""},{name:"virtio",id:"virtio"},{name:"ide",id:"ide"},{name:"scsi",id:"scsi"}];
        self.createInsForm.disk_bus = self.createInsForm.disk_buses[0];
        setDomainProject();
        setRoleByProject();
        self.getKeypairs();
        self.getSecurity();
        self.getVmGroups();
        self.initSource();
        netInit(self.currTab)

        if (self.currTab == "defined") {
            self.getVallDisk(); //重新获取所有可用数据盘
        }else if(self.currTab == "quick"){
            getInsBasicCtrl();
        }
        self.getproQuotas(self.createInsForm.selectedFlavor);
        self.getdomQuotas(self.createInsForm.selectedFlavor);
    }
    if(self.source.isQuickEnter){
        getDomain()
    }else{
        initSrv();
        self.getStorage(self.pollInfoCallBackFunc,self.getToyouVolumeCharacter)
    }
    getCanUseNodes();
    
    
    	
}
createInsCtrl.$inject = ["$scope", "$rootScope", "NgTableParams", "$translate", "$filter", "$location", '$routeParams', '$uibModal',
    'flavorsSrv', 'imagesSrv', 'snapshotsDataSrv', 'checkQuotaSrv', 'securityGroupSrv', 'networksSrv', 'instancesSrv', 'commonFuncSrv',
     'keyPairsSrv', "createInsSrv", "cvmViewSrv", "depviewsrv", "aggregatesSrv", "storageSrv", "overviewSrv", "volumesDataSrv","vmFuncSrv",
     'backupsSrv',"affinitySrv","insTab","makeImageSrv","dataclusterSrv","$timeout"
];
createInsModule.controller("createInsCtrl", createInsCtrl);

createInsModule.directive("insConfigDetailTable", [function() {
    return {
        restrict: 'AE',
        template: `
            <fieldset>
                <div class = "control-group" ng-show="source.isQuickEnter">
                    <label class="control-label">{{'aws.users.cu.department' | translate}}：</label>
                    <div class="controls">
                        <span class="val">{{createInsForm.domain.disDomainName}}</span>
                    </div>
                </div>
                <div class = "control-group" ng-show="source.isQuickEnter" >
                    <label class="control-label">{{'aws.users.cu.project' | translate}}：</label>
                    <div class="controls">
                        <span class="val">{{createInsForm.project.disProjectName}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.instanceName'|translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show="createInsForm.name">{{createInsForm.name}} </span>
                        <span class="val grey" ng-show="!createInsForm.name">{{'aws.common.unselect' | translate}} </span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.num'|translate}}：</label>
                    <div class="controls">
                        <span class="val">{{insForm.hostNum}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.vmgroup'|translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show="createInsForm.vmGroupSelected.name" >{{createInsForm.vmGroupSelected.name }} </span>
                        <span class="val grey" ng-show="!createInsForm.vmGroupSelected.name" >{{'aws.common.unselect' | translate}} </span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.selfConfig'|translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show="createInsForm.selectedFlavor">{{createInsForm.selectedFlavor.name}}、{{createInsForm.selectedFlavor.vcpus}}核CPU、{{createInsForm.selectedFlavor.ram_gb}}GB</span>
                        <span class="val grey" ng-show="!createInsForm.selectedFlavor">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.chooseBoot'| translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show="(currStep>1 || !currStep) && storage.isUseLocal">{{'aws.instances.addinstances.isUseLocal.'+ storage.isUseLocal | translate}}</span>
                        <span class="val grey" ng-show="currStep==1 || !storage.isUseLocal">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.common.chooseSrc' | translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show="(currStep>1 || !currStep) && options.imgSrc">{{'aws.common.'+ options.imgSrc | translate}}</span>
                        <span class="val grey" ng-show="currStep==1 || !options.imgSrc">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label" ng-if="options.imgSrc=='img'">{{'aws.img.name' | translate}}：</label>
                    <label class="control-label" ng-if="options.imgSrc=='snap'">{{'aws.snapshots.snapshotName' | translate}}：</label>
                    <label class="control-label" ng-if="options.imgSrc=='volume'">{{'aws.volumes.volumeName' | translate}}：</label>
                    <label class="control-label" ng-if="options.imgSrc=='backup'">{{'aws.backups.backupName' | translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-if="options.imgSrc=='img'" >
                            <span class="val" ng-show="(currStep>1 || !currStep) && arch.selected ">{{arch.selected.name}}</span>
                            <span class="val grey" ng-show="currStep==1 || !arch.selected">{{'aws.common.unselect' | translate}}</span>
                        </span>
                        <span class="val" ng-if="options.imgSrc=='snap'" >
                            <span class="val" ng-show="(currStep>1 || !currStep) && createInsForm.selectedSnap">{{createInsForm.selectedSnap.name}}</span>
                            <span class="val grey" ng-show="currStep==1 || ! createInsForm.selectedSnap">{{'aws.common.unselect' | translate}}</span>
                        </span>
                        <span class="val" ng-if="options.imgSrc=='volume'" >
                            <span class="val" ng-show="(currStep>1 || !currStep) && createInsForm.selectedVolume">{{createInsForm.selectedVolume.name}}</span>
                            <span class="val grey" ng-show="currStep==1 || !createInsForm.selectedVolume">{{'aws.common.unselect' | translate}}</span>
                        </span>
                        <span class="val" ng-if="options.imgSrc=='backup'" >
                            <span class="val" ng-show="(currStep>1 || !currStep) && createInsForm.selectedVolume">{{createInsForm.selectedVolume.name}}</span>
                            <span class="val grey" ng-show="currStep==1 || !createInsForm.selectedVolume">{{'aws.common.unselect' | translate}}</span>
                        </span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.common.systemDisk'|translate}}：</label>
                    <div class="controls" ng-if="options.imgSrc=='img'">
                        <span class="val" ng-if="(currStep>1 || !currStep) && createInsForm.sysVolumeSize">{{createInsForm.sysVolumeSize}} GB</span> 
                        <span class="val" ng-if="currStep==1 || !createInsForm.sysVolumeSize"> N/A</span>
                    </div>
                    <div class="controls" ng-if="options.imgSrc=='snap'">
                        <span class="val" ng-if="(currStep>1 || !currStep) && createInsForm.selectedSnap">{{createInsForm.selectedSnap.size}} GB</span> 
                        <span class="val" ng-if="currStep==1 || !createInsForm.selectedSnap"> N/A</span>
                    </div>
                    <div class="controls" ng-if="options.imgSrc=='volume'">
                        <span class="val" ng-if="(currStep>1 || !currStep) && createInsForm.selectedVolume">{{createInsForm.selectedVolume.size}} GB</span> 
                        <span class="val" ng-if="currStep==1 || !createInsForm.selectedVolume"> N/A</span>
                    </div>
                    <div class="controls" ng-if="options.imgSrc=='backup'">
                        <span class="val" ng-if="(currStep>1 || !currStep) && createInsForm.selectedBackup">{{createInsForm.selectedBackup.size}} GB</span> 
                        <span class="val" ng-if="currStep==1 || !createInsForm.selectedBackup"> N/A</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.common.dataDisk'|translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-if="(currStep>1 || !currStep) && createInsForm.dataVolumeSize && storage.isUseLocal == 2">{{createInsForm.dataVolumeSize}} GB</span>
                        <span class="val" ng-if="createInsForm.ephemeral && storage.isUseLocal == 1">{{createInsForm.ephemeral}} GB</span>
                        <span class="val" ng-if="(currStep==1 || !createInsForm.dataVolumeSize)&&storage.isUseLocal == 2">N/A</span>
                        <span class="val" ng-if="(!createInsForm.ephemeral) && storage.isUseLocal == 1">N/A</span>
                    </div>
                </div>
                <div class = "control-group" ng-show="storage.isUseLocal == 2" >
                    <label class="control-label">{{'aws.common.pool' | translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show = "(currStep>1 || !currStep) && storage.storageDeviceSelected">{{storage.storageDeviceSelected.disPlayName}}</span>
                        <span class="val grey" ng-show="currStep==1 || !storage.storageDeviceSelected">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.ports.ipAdress' | translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show = "(currStep>2 || !currStep) && createInsForm.fixed_ip">{{createInsForm.fixed_ip}}</span>
                        <span class="val grey" ng-show="currStep<=2 || !createInsForm.fixed_ip">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.keypair'|translate}}：</label>
                    <div class="controls">
                        <span class="val" ng-show = "(currStep>2 || !currStep) && keypairs.selected">{{keypairs.selected.name}}</span>
                        <span class="val grey" ng-show="currStep<=2 || !(keypairs.selected && keypairs.selected.name)">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.securityGroup'|translate}}：</label>
                    <div class="controls">
                        <span class="val"  ng-show = "(currStep>2 || !currStep) && securities.selected">{{securities.selected.value}}</span>
                        <span class="val grey" ng-show="currStep<=2 || !securities.selected">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
                <div class = "control-group" >
                    <label class="control-label">{{'aws.instances.addinstances.launchArea'|translate}}：</label>
                    <div class="controls"> 
                        <span class="val" ng-show = "(currStep>2 || !currStep) && zone.selected">{{zone.selected.zoneName}}</span>
                        <span class="val grey" ng-show="currStep<=2 || !(zone.selected && zone.selected.zoneName)">{{'aws.common.unselect' | translate}}</span>
                    </div>
                </div>
            </fieldset>    `,
        replace: true,
    }
}]);
createInsModule.directive("tableFilterEle", [function(){
    return {
        restrict: 'AE',
        scope:{
            tableName:"@",
            context:"=",
            curentFilter:"=",
            changeSelect:"="
        },
        template: `<div class="table-header-filter">
        <span>{{curentFilter.name}}</span>
        <div class="table-header-icon">
            <i class="icon-aw-down"></i>
            <ul class="table-header-dropdown" ng-class="{'open':tableHeaderOpen}">
                <li ng-repeat="item in curentFilter.filter" ng-click="headerFilter(item,$event)">{{item.name}}</li>
            </ul>  
        </div>
      </div>`,
        link:function(scope,ele,attr,ctrl){
            scope.headerFilter = function(item,e){
                var table = scope.context.tableContent[scope.tableName];
                table.filter(item.type);
                if(table.hasFilterChanges()){
                    var filterData = table.settings().getData(table);
                    scope.changeSelect?scope.changeSelect(filterData[0]||{}):"";
                }
            };
            $(ele).find(".icon-aw-down").on("click",function(e){
                $(this).siblings(".table-header-dropdown").toggleClass("open");
                e.stopPropagation();
                e.preventDefault();
            })
            $("html").on("click",function(){
                $(ele).find(".table-header-dropdown").removeClass("open");
            })
        }
    }
}])
createInsModule.value("insTab",{
    "currTab":"defined"
})