import "../services/volumesSrv";
import "../volumesSrv"
addVolumeCtrl.$inject=['$scope', "$rootScope", 'volumesSrv', '$uibModalInstance', "initTable","singleway","$translate","storageSrv","instancesSrv","vmFuncSrv",
"volumesDataSrv","imagesSrv","snapshotsDataSrv","backupsSrv","NgTableParams","$filter","newCheckedSrv","checkQuotaSrv"];
export function addVolumeCtrl($scope, $rootScope, volumesSrv, $uibModalInstance,initTable,singleway,$translate,storageSrv,instancesSrv,vmFuncSrv,
volumesDataSrv,imagesSrv,snapshotsDataSrv,backupsSrv,NgTableParams,$filter,newCheckedSrv,checkQuotaSrv){
    var self = $scope;
    self.context = self;
    self.doubleClick = false;
    self.singlePassageway = singleway;
    localStorage.managementRole!=2?self.roleNumber=false:self.roleNumber=true;
    //当用户勾选“双活(hyperswap)”功能时，“分层(easytier)”功能不可选 
    //压缩(compression) 精简配置(rsize) 分层(easytier) 双活(hyperswap)
    //当同时存在“压缩”和“精简”时，勾选“压缩”会，联动勾选“精简”
    var chkDo = function(value,pre){
        if(value["hyperswap"]){
            self.fchk.dis["hyperswap"] = true;
            self.fchk.dis["easytier"] = true;
        }
        if(value["easytier"]){
            self.fchk.dis["hyperswap"] =true;
        }
        if(value["compression"] && value["rsize"]){
            self.fchk.dis["hyperswap"] =true;
        }
        if(value["compression"] && value["rsize"] == false){
            value["rsize"] = true;
        }
    }
    self.src = 'blank';
    self.translate = {
        volumeName : $translate.instant("aws.volumes.cv.name"),
        config : $translate.instant("aws.volumes.cv.config"),
        imgName : $translate.instant("aws.img.img_name"),
        type : $translate.instant("aws.img.type"),
        architecture : $translate.instant("aws.img.architecture"),
        OS : $translate.instant("aws.img.OS"),
        min_disk : $translate.instant("aws.img.min_disk"),
        publick: $translate.instant("aws.img.is_public.true"),
        private: $translate.instant("aws.img.is_public.false"),
        x86_64: $translate.instant("aws.img.arch.x86_64"),
        i686: $translate.instant("aws.img.arch.i686"),
        all: $translate.instant("aws.img.all"),
        snapshotName: $translate.instant("aws.snapshots.snapshotName"),
        size: $translate.instant("aws.snapshots.size"),
        backupName:$translate.instant("aws.backups.backupName"),
        backupTime:$translate.instant("aws.backups.backupTime"),
        instanceName:$translate.instant("aws.instances.cloudInstanceName"),
        allocated:$translate.instant("aws.volumes.allocated"),
        capacity:$translate.instant("aws.volumes.capacity"),
    }
    self.volumeCols=[
        // { field: "sss", title: "",headerTemplateURL:"headerCheckbox.html",show: true },
        { field: "check", title: "",show: true },
        { field: "name", title: self.translate.volumeName,sortable: "name", show: true },
        { field: "size", title: self.translate.config,sortable: "size", show: true }
    ]
    self.imgCols = [
        { field: "check", title: "",show: true },
        { field: "name", title: self.translate.imgName,sortable: "name",show: true },
        { field: "_imageType", title: self.translate.type,sortable: "is_public",headerTemplateURL:"headerPublic.html",show: true },
        { field: "archCopy", title: self.translate.architecture,sortable: "arch",headerTemplateURL:"headerArch.html",show: true },
        { field: "os", title: self.translate.OS,sortable: "os",headerTemplateURL:"headerOs.html",show: true },
        { field: "size", title: self.translate.min_disk,sortable: "size",show: true },
    ]
    self.tableFilterList = {
        public:{
            name:self.translate.type,
            filter:[
                {name:self.translate.all,type:{is_public:""}},
                {name:self.translate.public,type:{is_public:true}},
                {name:self.translate.private,type:{is_public:false}}
            ]
        },
        arch:{
            name:self.translate.architecture,
            filter:[
                {name:self.translate.all,type:{arch:""}},
                {name:self.translate.x86_64,type:{arch:"x86_64"}},
                {name:self.translate.i686,type:{arch:"i686"}}
            ]
        },
        os:{
            name:self.translate.OS,
            filter:[
                {name:self.translate.all,type:{os_type:""}},
                {name:"Windows",type:{os_type:"windows"}},
                {name:"Linux",type:{os_type:"linux"}}
            ]
        }
    }
    self.snapCols = [
        { field: "check", title: "",show: true },
        { field: "name", title: self.translate.snapshotName,sortable: "name",show: true },
        { field: "volumeName", title: self.translate.volumeName,sortable: "volumeName",show: true },
        { field: "size", title: self.translate.size,sortable: "size",show: true },
    ]
    self.backupCols = [
        { field: "check", title: "",show: true },
        { field: "name", title: self.translate.backupName,sortable: "name",show: true },
        { field: "serverNames", title: self.translate.instanceName,sortable: "serverNames",show: true },
        { field: "size", title: self.translate.size,sortable: "size",show: true },
        { field: "createCopy", title: self.translate.backupTime,sortable: "createdAt",show: true },
    ]
    self.tableContent = self;
    self.submitted = false;
    self.canVolum=true;
    self.priceHour = 0;
    self.priceHourAbout = 0;
    self.priceMonth = 0;
    self.addVolumeForm = {};
    self.volumeForm = {};
    self.storage = {};
    self.fchk = {
        items: {},
        dis:{}
    };
    //存储服务
    self = vmFuncSrv.storageFunc(self,instancesSrv,storageSrv);
    self.getStorage(pollInfoCallBackFunc,getToyouVolumeCharacter);
    self.changeStorage = function(item){
        self.nomore_voltype = false;
        self.volumeForm.multiattach = false;
        self.storageFeatures = [];
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            self.getToyouDevice(getToyouVolumeCharacter,item)
        }
        self.poolInfo(item,pollInfoCallBackFunc);     
    }

    self.changeSize = function(size){
        var size = Number(size);
        self.checkVolumFun(size || 0);
        checkQuotaSrv.checkQuota(self, "gigabytes","","",size);
        if(size != undefined) {
            getVolumeAmount(size);
        }else {
            // 计费置为0
            self.priceHour = 0;
            self.priceHourAbout = 0;
            self.priceMonth = 0;
        }
    }

    self.choseSrc = function(src){
        self.src = src;
        self.volumeForm.multiattach = false;
        self.canVolum = true;
        self.storage.storageDeviceSelected = "";
        getVolumeAmount(0)
        switch(src){
            case"blank":
                self.storage.storageDeviceSelected = self.storageDeviceList[0];
                if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
                    self.getToyouDevice(getToyouVolumeCharacter,self.storage.storageDeviceSelected)
                }
            break;
            case"volume":
                self.storageFeatures = [];
                self.storageDeviceList = self._storageDeviceList
                if(self.addVolumeForm.volumeTabData && self.addVolumeForm.volumeTabData.length){
                    self.changeVolume(self.addVolumeForm.volumeTabData[0])
                }
            break;
            case"img":
                self.storageDeviceList = self._storageDeviceList.filter(item => (
                    item.storageLimitList && item.storageLimitList.volumes_image)
                )
                self.storage.storageDeviceSelected = self.storageDeviceList[0];
                if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
                    self.getToyouDevice(getToyouVolumeCharacter,self.storage.storageDeviceSelected)
                }
                if(self.addVolumeForm.imgTabData && self.addVolumeForm.imgTabData.length){
                    self.changeImg(self.addVolumeForm.imgTabData[0])
                }
            break;
            case"snap":
                self.storageFeatures = [];
                self.storageDeviceList = self._storageDeviceList
                if(self.addVolumeForm.snapTabData && self.addVolumeForm.snapTabData.length){
                    self.changeSnap(self.addVolumeForm.snapTabData[0])
                }
            break;
            case"backup":
                self.storageDeviceList = self._storageDeviceList.filter(item => 
                    (item.storageLimitList && item.storageLimitList.volumes_backup)
                )
                self.storage.storageDeviceSelected = self.storageDeviceList[0];
                if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
                    self.getToyouDevice(getToyouVolumeCharacter,self.storage.storageDeviceSelected)
                }
                if(self.addVolumeForm.backupTabData && self.addVolumeForm.backupTabData.length){
                    self.changeBackup(self.addVolumeForm.backupTabData[0])
                }
            break;
        }
    }
    self.changeVolume = function(item){
        if(self.src != "volume") return;
        self.addVolumeForm.volume_id = item.id;
        self.addVolumeForm.selectedVolume = item;
        self.storage.storageDeviceSelected = item.storageInfo;
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            self.getToyouDevice(getToyouVolumeCharacter,self.storage.storageDeviceSelected)
        }
        getVolumeAmount(item.size || 0)
        if(item.id){ //考虑到数据为空
            self.poolInfo(item.storageInfo,pollInfoCallBackFunc);
            self.checkVolumFun(item.size||0)
        }else{
            self.canVolum = true;
        }
    }
    self.changeImg = function(item){
        if(self.src != "img") return;
        self.addVolumeForm.img_id = item.imageUid;
        self.addVolumeForm.selectedImg = item;
        self.checkVolumFun(item.size||0)
        getVolumeAmount(item.size || 0)
    }
    self.changeSnap = function(item){
        if(self.src != "snap") return;
        self.addVolumeForm.snap_id = item.id;
        self.addVolumeForm.selectedSnap = item;
        self.storage.storageDeviceSelected = item.storageInfo;
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            self.getToyouDevice(getToyouVolumeCharacter,self.storage.storageDeviceSelected)
        }
        getVolumeAmount(item.size || 0)
        if(item.id){  
            self.poolInfo(item.storageInfo,pollInfoCallBackFunc);
            self.checkVolumFun(item.size || 0)
        
        }
    }
    self.changeBackup = function(item){
        if(self.src != "backup") return;
        self.addVolumeForm.backup_id = item.id;
        self.addVolumeForm.selectedBackup = item;
        getVolumeAmount(item.size || 0)
        self.checkVolumFun(item.size || 0);
    }
    //获取硬盘列表
    self.getVolume = function(){
        volumesDataSrv.getVolumesTableData().then(function(result){
            result ? self.loadVolumeData = true : "";
            if (result && result.data){
                result.data.map(item=>{
                    item.searchTerm = [item.name,item.size].join("\b");
                })
                result.data = result.data.filter(item => !item.magrationing) //卷迁移中卷不能进行任何操作
                result.data = result.data.filter(item => (item.status == "available" || item.status == "in-use") && !( item.metaData && item.metaData.image_cache_name) && !(item.metaData && item.metaData.glance_image_id))
                //result.data = result.data.filter( item=> item.storageInfo.name.indexOf("nfs")==-1)  //fix AWSTACK-4286云硬盘通过云硬盘界面中需要将nfs的卷屏蔽掉
                //屏蔽掉不支持的volume
                result.data = result.data.filter(item => (item.storageInfo && item.storageInfo.storageLimitList && item.storageInfo.storageLimitList.volumes_volumes))
                result.data = result.data.filter(item => !(item.storageInfo && item.storageInfo.storageLimitList && !item.storageInfo.storageLimitList.share_volumes_volumes && item.multiattach && item.attachments && item.attachments.length>1));
                volumeCallbackFunc(result.data)
            }
        })
    }
    //获取镜像列表
    self.getImages = function(callbackFunc){
        self.arch = {
            selected: {}
        };
        imagesSrv.getImages().then(function(res){
            res ? self.loadImgData = true : "";
            if (res && res.data){
                imageCallbackFunc(res.data)
            }
        })
    }
    //获取快照列表
    self.getSnaps = function(data){
        snapshotsDataSrv.getSnapshotsTableData().then(function(result){
            result ? self.loadSnapData = true : "";
            if (result && result.data){
                result.data = result.data.filter(item => item.status=="available");
                result.data = result.data.filter(item => (item.storageInfo && item.storageInfo.storageLimitList && item.storageInfo.storageLimitList.volumes_snapshots))
                snapsCallbackFunc(result.data)
            }
        })
    }
    self.getBackups = function(){
        backupsSrv.getBackups().then(function(result){
            result ? self.loadBackupData = true : "";
            if (result && result.data){
                result.data = result.data.filter(item => item.status=="available")
                result.data = result.data.filter(item => ( item.storageLimit && item.storageLimit.volumes_backup))                
                backupCallbackFunc(result.data)
            }
        })
    }
    self.getVolume()
    self.getImages()
    self.getSnaps()
    self.getBackups();
    if(singleway){
        self.$watch(function(){
            return self.domainproject
        },function(res){
            if(JSON.stringify(res)!='{}'&&
                res.deparList.length>0&&
                res.depart.selected.domainUid
                ){
                var domainUid = res.depart.selected.domainUid;
                var projectUid = res.pro.selected.projectId;
                checkQuotaSrv.checkQuota(self, "volumes",domainUid,projectUid);
                checkQuotaSrv.checkQuota(self, "gigabytes",domainUid,projectUid);  
            }
        },true)
    }else{
        checkQuotaSrv.checkQuota(self, "volumes","","",1);
        checkQuotaSrv.checkQuota(self, "gigabytes","","",0);
    }
    

    //选择存储特性
    self.$watch(function(){
        return self.fchk.items
    },function(value,pre){
        if(value){
            self.fchk.dis = {};
            chkDo(value,pre)
        }
    },true)

    function volumeCallbackFunc(data){
        self.volumeTable = new NgTableParams({
            count: 5
        }, {
            counts: [],
            dataset: data
        });
        if (data.length) {
            self.addVolumeForm.volumeTabData = angular.copy(data);
            self.changeVolume(data[0])
        }
    }

    function imageCallbackFunc(data){
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
            item._imageType = item.is_public ? self.translate.public : self.translate.private;
            item.size = item.size*1;
            item.archCopy = $translate.instant("aws.img.arch."+item.arch)
            item.os_type = item.os_type ? item.os_type.toLowerCase() : "";
            item.searchTerm = [item.name,item.size,item._imageType,item.os,item.archCopy].join("\b");
            return item;
        });
        data = data.filter(item => {
            return item.canUse == true;
        });
        var dataCopy = angular.copy(data);
        self.imgTable = new NgTableParams({
            count: 5
        }, {
            counts: [],
            dataset: data
        });

        if (data.length) {
            self.addVolumeForm.imgTabData = angular.copy(data)
            self.changeImg(data[0])
        }
    }

    function snapsCallbackFunc(data){
        data.map(function(item) {
            var date = $filter("date")(item.created, "MMddHHmm");
            if (item.name.indexOf("_") < 0) {
                item.name = item.name + "  (" + date + ")";
            }
            item.searchTerm = [item.name,item.size,item.volumeName].join("\b");
            return item;
        });
        var sysSnapData = data.filter(item=>{
            return item.status.toLowerCase() === "available";
        });
        self.snapTable = new NgTableParams({
            count: 5
        }, {
            counts: [],
            dataset: sysSnapData
        });
        if (sysSnapData.length) {
            self.addVolumeForm.snapTabData = angular.copy(sysSnapData)
            self.changeSnap(sysSnapData[0]);
        }
    }

    function backupCallbackFunc(data){
        data.map(item=>{
            item.createCopy = $filter("date")(item.createdAt, "yyyy-MM-dd HH:mm:ss");
            item.serverNames = item.serverNames.toString();
            item.searchTerm = [item.name,item.size,item.serverName,item.createCopy].join("\b");
            return item;
        })
        self.backupTable = new NgTableParams({
            count: 5
        }, {
            counts: [],
            dataset: data
        });
        if (data.length) {
            self.addVolumeForm.backupTabData = angular.copy(data);
            self.changeBackup(data[0]);
        }
    }

    function pollInfoCallBackFunc(){
        self.checkVolumFun(self.volumeForm.size || 0);
        self.poolsInfo_data.title = self.translate.capacity;
        self.poolsInfo_data_allocate = angular.copy(self.poolsInfo_data);
        self.poolsInfo_data_allocate.subtitle = self.translate.allocated;
        self.poolsInfo_data_allocate.inUsed = self.poolsInfo_data_allocate.allocate;
        self._storageDeviceList = self._storageDeviceList?self._storageDeviceList:angular.copy(self.storageDeviceList);
    } 

    function getToyouVolumeCharacter(device){
        self.toyouDevice = device;
        var postData = {
            "id": device[0],
            "Storage_name": device[1]
        }
        //获取该资源池支持的存储特性
        storageSrv.getFeatures(postData).then(function(result){
            if(result && result.data &&  angular.isArray(result.data.Storage_characters)){
                self.storageFeatures = result.data.Storage_characters;
                self.fchk.items = {};
                //self.storageFeatures = ["compression","rsize"]
                self.storageFeatures.map(item => {
                    item = item.toLowerCase();
                    //当没有“双活(hyperswap)”特性时，页面默认，是不勾选任何特性
                    //如果双活(hyperswap)，默认选中
                    self.fchk.items[item] = false;
                    if(item =="hyperswap"){
                        self.fchk.items[item] = true;
                    }
                    
                })
            }
        })
    }

    // 计费信息
    function getVolumeAmount(value) {
        var option = {
            volumeSize: value,
            region: localStorage.regionName || "default"
        }
        vmFuncSrv.bossSourceFunc(self,value,option,"queryChdChargingAmount")
    }

    function getToyouVoltype(postData,callbackFunc){
        var posta = {
            "Vendor": "TOYOU",
            "Storage_name": self.toyouDevice[1],
            "Pool_name": self.toyouDevice[2],
            "Character_message": { //这四个特性，1为支持，0为不支持。可以为空字典或者不传
                "compression": Number(self.fchk.items.compression) || 0,
                    "rsize" :Number(self.fchk.items.rsize) || 0,
                    "easytier":Number(self.fchk.items.easytier) || 0,
                    "hyperswap":Number(self.fchk.items.hyperswap) || 0
            }
        };
        storageSrv.getVoltype(posta).then(function(result){
            if(result && result.data){
                postData.volume_type = result.data.volume_type_id;
                callbackFunc(postData)
            }else{
                self.nomore_voltype = true;9
            }
        })
    }
    $scope.domainproject ={}    
    function addVolumesAction(postData){
        if(singleway){
            volumesDataSrv.addSingleVolumesAction(postData,$scope.domainproject).then(function() {
                $uibModalInstance.close();
                //initTable();
            });
        }else{
            volumesDataSrv.addVolumesAction(postData).then(function() {
                $uibModalInstance.close();
                initTable();
            });
        }
    }

    function formBackupVolume(post,backupId){
        var  backupId = self.addVolumeForm.selectedBackup.id;
        volumesDataSrv.formBackupVolume(post,backupId).then(function() {
            $uibModalInstance.close();
            initTable();
        });
    }

    function enabledVolumeAction(post){
        snapshotsDataSrv.enabledVolumeAction(post).then(function() {
            $uibModalInstance.close();
            initTable();
        });
    }

    function addVolumePostSrv(postData,action){
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            getToyouVoltype(postData,action)
        }else{
            if(self.src != "snap" && self.src != "backup"){
                postData.volume_type = self.storage.storageDeviceSelected.volumeTypeId;
            }
            action(postData)
        }
    }

    //判断是否可点击的函数
    $scope.volumeConfirm = function(field) {
        if(field.$valid){
            var postData = {
                name:self.volumeForm.name
            }
            self.doubleClick = true;
            switch(self.src){
                case"blank":
                    postData.size = self.volumeForm.size;
                    postData.description = self.volumeForm.description;
                    postData.multiattach = self.volumeForm.multiattach;
                    addVolumePostSrv(postData,addVolumesAction)
                break;
                case"volume":
                    postData.sourceVolid = self.addVolumeForm.selectedVolume.id;
                    postData.size = self.addVolumeForm.selectedVolume.size;
                    postData.multiattach = self.volumeForm.multiattach;
                    addVolumePostSrv(postData,addVolumesAction)
                break;
                case"img":
                    postData.imageRef = self.addVolumeForm.selectedImg.imageUid;
                    postData.size = self.addVolumeForm.selectedImg.size;
                    postData.multiattach = self.volumeForm.multiattach;
                    addVolumePostSrv(postData,addVolumesAction)
                break;
                case"snap":
                    postData.snapshotId = self.addVolumeForm.selectedSnap.id;
                    postData.size = self.addVolumeForm.selectedSnap.size;
                    postData.multiattach = self.volumeForm.multiattach;
                    addVolumePostSrv(postData,enabledVolumeAction)
                break;
                case"backup":
                    postData.multiattach = self.volumeForm.multiattach;
                    postData.volumeType = self.storage.storageDeviceSelected.volumeTypeId;
                    postData.backupName = self.addVolumeForm.selectedBackup.name;
                    newCheckedSrv.setChkIds([self.addVolumeForm.selectedBackup.id],"backuprestore")
                    addVolumePostSrv(postData,formBackupVolume)
                break;
            }
        }else{
            self.submitted = true;
        }
        
    };
    
}