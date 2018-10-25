    
import "./snapshotsSrv";
import "./volumesSrv";
import "./regularSnapSrv";
import "../instances/instancesSrv";
import "../../system/storage/storageSrv";
var regularSnapModule = angular.module("regularSnapModule", ["snapshotssrv","regularSnapSrvModule","volumessrv","instancesModule"])
regularSnapModule.controller("regularSnapCtrl",["$scope","$rootScope","NgTableParams","$uibModal","$translate","volumesDataSrv",
"instancesSrv","regularSnapSrv","GLOBAL_CONFIG","checkedSrv","$routeParams",
function ($scope,$rootScope,NgTableParams,$uibModal,$translate,volumesDataSrv,instancesSrv,regularSnapSrv,GLOBAL_CONFIG,
    checkedSrv,$routeParams) {
    // body...
    var self = $scope;
    self.context = self;
    self.isDisabled = true;
    self.delisDisabled = true;
    self._search = {};
    self.menuGuide = [$translate.instant('aws.menu.System'),$translate.instant('aws.menu.System_Operation'),$translate.instant('aws.menu.System_Storage')];
    self.titleName="regularSnap";
    self.translate = {
        "taskId": $translate.instant("aws.tasks.taskId"),
        "serverName": $translate.instant("aws.instances.addinstances.instanceName"),
        "volumeNames": $translate.instant("aws.volumes.volumeName"),
        "previousFireTime": $translate.instant("aws.tasks.previousFireTime"),
        "nextFireTime": $translate.instant("aws.tasks.nextFireTime"),
        "holdNumber": $translate.instant("aws.tasks.holdNumber"),
        "jobType": $translate.instant("aws.tasks.jobType"),
        "operate": $translate.instant("aws.tasks.operate"),
    }
    if(sessionStorage["regularSnap"]){
        self.tableCols=JSON.parse(sessionStorage["regularSnap"]);
     }else{
        self.tableCols = [
             { field: "check", title: "",headerTemplateURL:"headerCheckbox.html",show: true },
             { field: "scheduleJobId", title: self.translate.taskId,sortable: "scheduleJobId",show: true,disable:true},
             { field: "serverName", title: self.translate.serverName,sortable: "serverName",show: true,disable:false},
             { field: "volumeNames", title: self.translate.volumeNames,sortable: "volumeNames",show: true,disable:false },
             { field: "previousFireTime", title: self.translate.previousFireTime,sortable: "previousFireTime",show: true,disable:false },
             { field: "nextFireTime", title: self.translate.nextFireTime,sortable: "nextFireTime",show: true,disable:false },
             { field: "holdNumber", title: self.translate.holdNumber,sortable: "holdNumber",show: true,disable:false },
             { field: "jobTypeCopy", title: self.translate.jobType,sortable: "jobTypeCopy",show: true,disable:false },
             { field: "operate", title: self.translate.operate,operate: "percent",show: true,disable:true },
        ];
     }
 
     self.configSearch = function(tableData){
         var tableData = tableData || self.tabledata;
         tableData.map(item => {
            //item.usingVolumeIdsArray = "";
            item.jobTypeCopy = $translate.instant("aws.instances.snapshot.task." + item.jobType)
            item.volumeNames = item.volumeNames.toString();
            editSearch(item)
         })
         return tableData;
     }
     function editSearch(item){
        var searchTerm = []
        self.tableCols.map(search => {
            if(search.title && search.show){
                searchTerm.push(item[search.field])
            }
        })
        item.searchTerm =searchTerm.join("\b") ;
		return item;
    }
    function successFunc(data){
        self.tabledata = self.configSearch(data);
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata });
        var tableId = "scheduleJobId";
        //初始化选中状态
        checkedSrv.checkDo(self, data, tableId);

    }
    function timeTrans(x){
        if(x.status=="NORMAL"){
            x.task_switch=true;
        }else if(x.status="PAUSED"){
            x.task_switch=false;
        }
        if(x.previousFireTime){
            x.previousFireTime= moment(new Date(x.previousFireTime)).format('YYYY-MM-DD HH:mm:ss');
        }else{
            x.previousFireTime="";
        }
        if(x.nextFireTime){
            x.nextFireTime= moment(new Date(x.nextFireTime)).format('YYYY-MM-DD HH:mm:ss');
            x.nextFireTimeCopy= moment(new Date(x.nextFireTime)).format('YYYY-MM-DD HH:mm:ss');
        }else{
            x.nextFireTime="";
             x.nextFireTimeCopy = "";
        }
        if(x.nextFireTime && x.previousFireTime  && !x.holdNumber && !x.unit){
            x.onetaskexecute = true;
            x.nextFireTime = "";
        }else{
            x.onetaskexecute = false;
        }
        return x;
    }
    function initTable(){
        if(!localStorage.cinderService) return;
        regularSnapSrv.gettasks({
            regionKey:localStorage.regionKey,
            userId:localStorage.userUid
        }).then(function(result){
            if(result && result.data){
                result.data.forEach((x) => {
                    timeTrans(x)
                })
                self.task_data=result.data;
                successFunc(result.data);
            }
        })
    }
    initTable();
    //刷新列表
    self.refresh=function(){
        initTable();
    }
    $scope.$on("getDetail", function(event, value) {
        self.showDetail = true;
        self.detail = {};
        regularSnapSrv.gettasksDetail(value).then(function(result) {
            if($routeParams.id!=value){return;}
            self.detailData = result.data;
            
        });
        regularSnapSrv.gettasks({
            regionKey:localStorage.regionKey,
            userId:localStorage.userUid
        }).then(function(result) {
            if(result && result.data && angular.isArray(result.data)){
                self.detail = result.data.filter(item=>item.scheduleJobId ==$routeParams.id )[0];
                self.detail.volumeNames = self.detail.volumeNames.toString();
                timeTrans(self.detail)
            }
            
            
        });
        
    });
    self.getDetial = function(){
        self.showDetail = true;
    }
    self.getDetialTask = function(){
        self.showDetail = false;
    }
    //启动和暂停任务
    self.getStatus=function(obj){
        if(obj.task_switch){
            //重启task
            regularSnapSrv.resumeTask(obj.scheduleJobId).then(function(result){
                initTable();
            })
        }else{
            //暂停task
            regularSnapSrv.pauseTask(obj.scheduleJobId).then(function(result){
                initTable();
            })

        }
    }

    //创建任务
    self.createSnap = function(type,editData) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/volumes/tmpl/createTask.html",
            controller: "createTaskCtrl",
            resolve: {
                initTable: function() {
                    return initTable;
                },
                tasktype:function(){
                    return type
                },
                editData:function(){
                    return editData
                }
            }

        });
    };

    //删除任务
    self.delTask = function(editData) {
        var content = {
            target: "delTask",
            msg: "<span>" + $translate.instant('aws.tasks.delTaskInfo') + "</span>",
        };
        self.$emit("delete", content);
    };
    self.$on("delTask", function(e,data) {
        var del_ids = [];
        self.checkedItems.map(item => {del_ids.push(item.scheduleJobId);});
        regularSnapSrv.delTaskBatch({ids:del_ids}).then(function(result){
            initTable();
        })
    });
    
}])
regularSnapModule.controller("createTaskCtrl",["$scope","$rootScope","$uibModalInstance","$translate","volumesDataSrv","instancesSrv",
"regularSnapSrv","initTable","tasktype","editData","$filter","storageSrv","checkQuotaSrv","vmSrv","vmFuncSrv",
function ($scope,$rootScope,$uibModalInstance,$translate,volumesDataSrv,instancesSrv,regularSnapSrv,initTable,tasktype,editData,$filter,
    storageSrv,checkQuotaSrv,vmSrv,vmFuncSrv) {
    var self = $scope;
    var tasktype = tasktype;
    var editData = editData;
    var numbers = 0;
    var size = 0;
    var sizeEidt = 0;
    self.tasktype = tasktype;
    self.canConfirm = true;
    self.newObj={};
    self.submitInValid = false;
    self.hasJobSnap = 0;
    self.hasJobBackups = {
        number:0,
        size:0
    }
    self.translate = {
        "once": $translate.instant('aws.tasks.once'),
        "hour":$translate.instant('aws.tasks.hour'),
        "day":$translate.instant('aws.tasks.day'),
        "week":$translate.instant('aws.tasks.week'),
        "month":$translate.instant('aws.tasks.month'),
        "snapshotTask":$translate.instant('aws.tasks.snapshotTask'),
        "backupTask": $translate.instant('aws.tasks.backupTask'),
    }
    self.newObj.snap_number_list=[{name:1},{name:2},{name:3},{name:4},{name:5}];//快照保留份数选项1-5
    self.newObj.unit_list = [
        {name:self.translate.once},
        //{name:"按分钟",unit:"minute"},
        {name:self.translate.hour,unit:"hour"},
        {name:self.translate.day,unit:"day"},
        {name:self.translate.week,unit:"week"},
        {name:self.translate.month,unit:"month"}
    ];
    self.newObj.taskKinds = [{name:self.translate.snapshotTask,value:0}];
    self.newObj.systemDisk = [];
    self.newObj.dataDisk = [];
    self.system_disk_list=[];
    self.data_disk_list=[];
    if(localStorage.backupsService == "backups"){
        self.newObj.taskKinds.push({name:self.translate.backupTask,value:1})
    }
    self.snapFun=function(type,task){
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
        valitaQuota(task.value)
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
    function getBackupAmount(value) {
        var option = {
            backupVolumeSize: value,
            region: localStorage.regionName || "default"
        }
        vmFuncSrv.bossSourceFunc(self,value,option,"queryBackupChargingAmount")
    }
    function getSnapAmount(value) {
        var option = {
            snapshotCount: value,
            region: localStorage.regionName || "default"
        }
        vmFuncSrv.bossSourceFunc(self,value,option,"querySnapshotChargingAmount")
    }
    function avoidDoubleClick(bol){
        self.cannot_Confirm = bol;
    }
    function getVolumeIds(){
        var volumeIds = [],volumeNames=[];
        size = 0;
        if(self.newObj.systemDisk.length){
            self.newObj.systemDisk.map(item => {
                volumeIds.push(item.id);
                volumeNames.push(item.name);
                size = size + Number(item.size)
            })
        }
        if(self.newObj.dataDisk.length){
            self.newObj.dataDisk.map(item => {
                volumeIds.push(item.id);
                volumeNames.push(item.name);
                size = size + Number(item.size)
            })
        }
        return {volumeIds,volumeNames,size}
    }
    //获取云主机列表
    function getHosts(){
        self.newObj.hosts=[];
        volumesDataSrv.getHostAction().then(function(result) {
            if(result && result.data && angular.isArray(result.data)){
                result.data = result.data.filter(function(item) {
                    return item.proid == localStorage.projectUid;
                });
                result.data = result.data.filter(inst => inst.name != "fixedImageInstanceName");
                switch(tasktype){
                    case "new":
                        self.newObj.hosts=result.data.filter(item=>item.name!="fixedImageInstanceName");
                        self.newObj.hosts=result.data.filter(item=>!(item.description && item.description.indexOf("elastic expansion created")>-1 )); // 弹性扩展的虚拟机不支持
                        self.editOperation = false;
                        if(self.newObj.hosts.length>0){
                            self.newObj.host= self.newObj.hosts[0];
                            getServerDetail(self.newObj.host.uid,tasktype);
                        }
                        break;
                    case "edit":
                        self.newObj.hosts=result.data.filter(item=>item.uid == editData.serverId);
                        self.editOperation = true;
                        if(self.newObj.hosts.length>0){
                            self.newObj.host= self.newObj.hosts[0];
                            getServerDetail(self.newObj.host.uid,tasktype,editData.scheduleJobId);
                        }
                        break;
                }
                
                
            }
        });
        
    }
    //选择云主机后获取云主机的数据盘和系统盘
    self.changeHost=function(host){
       // checkQuotaSrv.checkQuota(self, "snapshots","","",0);
        self.newObj.host=host;
        getServerDetail(self.newObj.host.uid);
    };

    var pushDisk = function(x){
        //bootable为true且root_device为true时是系统盘，为false是数据盘
        if(x.bootable=="true" && x.root_device == "true" && x.diskFormat !="iso"){
            self.system_disk_list.push(x);
        }else{
            self.data_disk_list.push(x);
        }
    }
    
    //选择云主机后获取云主机的数据盘和系统盘
    function getServerDetail(insid,tasktype,jobId){
        self.newObj.systemDisk=[];
        self.newObj.dataDisk=[];
        self.system_disk_list=[];
        self.data_disk_list=[];
        vmSrv.getVmDisks(insid,{jobType:self.newObj.taskKind.value,jobId:jobId}).then(function(result) {
            if (result && result.data) {
                result.data.diskInfo = result.data.diskInfo.filter(item => !item.magrationing);
                if(self.newObj.taskKind.value == 0){
                    result.data.diskInfo = result.data.diskInfo.filter(item=>(item.storageLimit && item.storageLimit["snapshots"]))
                    result.data.diskInfo  = result.data.diskInfo .filter(item => !(item.storageLimit && !item.storageLimit["share_volumes_snapshots"]&&item.attachments.length>1));
                }else if(self.newObj.taskKind.value == 1){
                    result.data.diskInfo = result.data.diskInfo.filter(item=>(item.storageLimit && item.storageLimit["backups"]))
                    result.data.diskInfo  = result.data.diskInfo .filter(item => !(item.storageLimit && !item.storageLimit["share_volumes_backups"]&&item.attachments.length>1));
                }
                if(self.system_disk_list.length==0 && result.data.startStyle == 'Local' && self.newObj.taskKind.value == 1){
                    self.systemDiskTip = $translate.instant('aws.instances.backups.localsystemDiskPlace')
                }else if(self.newObj.taskKind.value == 1){
                    self.systemDiskTip = $translate.instant('aws.instances.backups.nosystemDiskPlace')
                }
                if(self.system_disk_list.length==0 && result.data.startStyle == 'Local' && self.newObj.taskKind.value == 0){
                    self.systemDiskTip = $translate.instant('aws.instances.snapshot.localsystemDiskPlace')
                }else if(self.newObj.taskKind.value == 0){
                    self.systemDiskTip = $translate.instant('aws.instances.snapshot.nosystemDiskPlace')
                }
                result.data.diskInfo.forEach((x)=>{
                    //同有双活特性云硬盘不支持快照功能

                    if(x.associatedHost.indexOf("toyou") > -1){
                        var postData = {
                            "volume_type_name": x.type,
                        }
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
                 switch(tasktype){
                     case "new":
                        break;
                     case "edit":
                        self.newObj.systemDisk = [];
                        self.newObj.dataDisk = [];
                        sizeEidt = 0;
                        editData.volumeIdsArray.map(x => {
                            self.system_disk_list.map(y => {
                                if(y.id == x){
                                    self.newObj.systemDisk.push(y)
                                    sizeEidt = sizeEidt + Number(y.size);
                                }
                            })
                            self.data_disk_list.map(y => {
                                if(y.id == x){
                                    self.newObj.dataDisk.push(y)
                                    sizeEidt = sizeEidt + Number(y.size);
                                }
                            })
                        })
                        break;
                 }
            }
        });
    }
    function valitaQuota(taskVal){
        var volData = getVolumeIds();
        self.watchVolumeChoose = volData.volumeIds;
        if(self.newObj.unit.unit){
            numbers = self.watchVolumeChoose.length*self.newObj.holdNumber.name; 
            size = volData.size *self.newObj.holdNumber.name;
        }else{
            numbers = self.watchVolumeChoose.length;
            size = volData.size;
        }
        switch(tasktype){
            case "new":
                if(taskVal==0){
                    checkQuotaSrv.checkQuota(self, "snapshots","","",numbers);
                    getSnapAmount(self.watchVolumeChoose.length)
                }else if(taskVal==1){
                    if(self.newObj.unit.unit){
                        numbers = numbers *2; //云管默认是两条备份链
                        size = size *2;
                    }
                    checkQuotaSrv.checkQuota(self, "backups","","",numbers);
                    checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size);
                    getBackupAmount(volData.size)
                }
                
                break;
            case "edit":
                if(taskVal==0){
                    if(numbers>editData.holdNumber*editData.volumeIdsArray.length){
                        checkQuotaSrv.checkQuota(self, "snapshots","","",numbers-self.hasJobSnap);
                        getSnapAmount(self.watchVolumeChoose.length)
                    }else{
                        checkQuotaSrv.checkQuota(self, "snapshots","","",0);
                        getSnapAmount(self.watchVolumeChoose.length)
                    }
                }else if(taskVal==1){
                    if(numbers>editData.holdNumber*editData.volumeIdsArray.length){
                        checkQuotaSrv.checkQuota(self, "backups","","",numbers*2- self.hasJobBackups.number);
                    }else{
                        checkQuotaSrv.checkQuota(self, "backups","","",0);
                    }
                    if(size>sizeEidt * editData.holdNumber*editData.volumeIdsArray.length){
                        checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size*2- self.hasJobBackups.size);
                        getBackupAmount(volData.size)
                    }else{
                        checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",0);
                        getBackupAmount(volData.size)
                    }
                    
                    
                }
                
                break;
        }
    }

    self.changeTaskKind = function(task){
        getServerDetail(self.newObj.host.uid);
        valitaQuota(task.value) 
    }
    self.change_snap_number = function(obj){
        self.newObj.holdNumber = obj;
        valitaQuota(self.newObj.taskKind.value)  
    }
    self.changeDisk = function(){
        self.chooseDiskTipShow = false;
        valitaQuota(self.newObj.taskKind.value)
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
                    var postData = {
                        "projectId": localStorage.projectUid,//项目id
                        "regionKey": localStorage.regionKey,//regionKey 
                        "serverId":  self.newObj.host.uid,
                        "startTime": self.newObj.startTime,
                        "userId":localStorage.userUid,
                        "jobType":self.newObj.taskKind.value
                    }
                    if(self.newObj.unit.unit){
                        postData.holdNumber = self.newObj.holdNumber.name,//快照保存份数 
                        postData.frequency = Number(self.newObj.frequency);//任务触发频率
                        postData.unit = self.newObj.unit.unit;//任务触发频率单位
                    }
                    switch(tasktype){
                        case "new":
                            regularSnapSrv.createTask(postData,{volumeIds:volumeIds}).then(function(result){
                                initTable()
                            })
                            break
                        case "edit":
                            postData.scheduleJobId = editData.scheduleJobId;
                            postData.jobGroup = editData.jobGroup;
                            postData.jobName = editData.jobName;
                            regularSnapSrv.updateTask(postData,{volumeIds:volumeIds}).then(function(result){
                                initTable()
                            })
                            break;
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
    switch(tasktype){
        case "new":
            self.newObj.taskKind = self.newObj.taskKinds[0];
            self.newObj.unit = self.newObj.unit_list[0];
            self.newObj.holdNumber=self.newObj.snap_number_list[0];
            checkQuotaSrv.checkQuota(self, "snapshots","","",0);
            getSnapAmount(0)
            break
        case "edit":
            self.newObj.taskKind = self.newObj.taskKinds.filter(x => x.value == editData.jobType)[0];
            self.newObj.unitfilter = self.newObj.unit_list.filter(x => x.unit == editData.unit);
            self.newObj.frequency = editData.frequency;
            editData.holdNumber = editData.holdNumber || 1;
            self.newObj.holdNumberfilter = self.newObj.snap_number_list.filter(x =>x.name == editData.holdNumber);
            self.newObj.holdNumber = self.newObj.holdNumberfilter[0];
            self.newObj.startTime = moment(editData.nextFireTimeCopy).format("YYYY-MM-DD HH:mm"); 
            if(self.newObj.unitfilter.length){
                self.newObj.unit = self.newObj.unitfilter[0];
            }else{
                self.newObj.unit = self.newObj.unit_list[0];
            }
            if(editData.jobType == 0){
                regularSnapSrv.getJobSnaps(editData.scheduleJobId).then(function(result){
                    self.hasJobSnap = result.data;
                })
                checkQuotaSrv.checkQuota(self, "snapshots","","",0);
                getSnapAmount(0)
            }else if(editData.jobType == 1){
                regularSnapSrv.getJobBackups(editData.scheduleJobId).then(function(result){
                    self.hasJobBackups.number = result.data.number;
                    self.hasJobBackups.size = result.data.size;
                })
                checkQuotaSrv.checkQuota(self, "backups","","",0);
                checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",0);
                getBackupAmount(0)
            }
            break;
    }
    
    avoidDoubleClick(false)
    getHosts()

   
  
}])