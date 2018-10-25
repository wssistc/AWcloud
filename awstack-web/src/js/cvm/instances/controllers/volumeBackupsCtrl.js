import  vmSrv from "../services/vmSrv"

volumeBackupsCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModalInstance","$location","vmSrv","regularSnapSrv","checkQuotaSrv","vmFuncSrv","editData","storageManagementSrv"];
export function volumeBackupsCtrl($scope, $rootScope, $translate,$uibModalInstance,$location,vmSrv,regularSnapSrv,checkQuotaSrv,vmFuncSrv,editData,storageManagementSrv){
    var self = $scope;
    var size = 0;
    self.cannot_Confirm = false;
    self.volume_backups = [];
    self.newObj = {};
    self.newObj.systemDisk = [];
    self.newObj.dataDisk = [];
    self.newObj.type = "true";
    self.newObj.hasElastic = false;
    self.newObj.canIncremental = true;
    self.newObj.unit_list = [
        {name:"一次",unit:""},
        //{name:"分钟",unit:"minute"},
        {name:"按小时",unit:"hour"},
        {name:"按天",unit:"day"},
        {name:"按周",unit:"month"},
        {name:"按月",value:""}
    ];
    self.newObj.unit = self.newObj.unit_list[0];
    self.newObj.backup_number_list = [1,2,3,4];
    self.newObj.holdNumber = 1;
    checkQuotaSrv.checkQuota(self, "backups","","",0);
    checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",0);
    if(editData && editData.description && editData.description.indexOf("elastic expansion created")>-1 ){
        self.newObj.hasElastic = true;
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
    self.changeTime=function(){
        self.chkCurrentTimeTip = false;
    }
    getBackupAmount(0)
    function getBackupAmount(value) {
        var option = {
            backupVolumeSize: value,
            region: localStorage.regionName || "default"
        }
        vmFuncSrv.bossSourceFunc(self,value,option,"queryBackupChargingAmount")
    }
    function avoidDoubleClick(bol){
        self.cannot_Confirm = bol; //避免双击
    }
    // storageManagementSrv.getStorageTableData().then(function(res){
    //     var nfsBakTonfs = false;
    //     if(res && res.data && angular.isArray(res.data)){
    //         res.data.map(item => {
    //             if(item.use == "1" && item.type.toLowerCase().indexOf("nfs")>-1){
    //                 nfsBakTonfs = true;
    //             }
    //         })
    //     }
    //     getVmDisks(nfsBakTonfs)
    // })

    getVmDisks()

    function getVmDisks(){
        vmSrv.getVmDisks(editData.uid,{jobType:1}).then(function(res){
            if(res && res.data && angular.isArray(res.data.diskInfo)){
                var diskInfo = res.data.diskInfo.filter(item => (item.diskFormat != "iso" && (item.status == "in-use"||item.status == "available")));
                diskInfo = diskInfo.filter(item => (item.storageLimit && item.storageLimit["backups"]));
                diskInfo = diskInfo.filter(item => item => !item.magrationing);
                diskInfo = diskInfo.filter(item => !(item.storageLimit && !item.storageLimit["share_volumes_backups"]&&item.attachments.length>1));
                self.data_disk_list = diskInfo.filter(item => (item.bootable == "false" || item.root_device=="false"))
                self.system_disk_list =diskInfo.filter(item => (item.bootable == "true"&& item.root_device=="true"))
                self.data_disk_list = self.data_disk_list.filter(item => !(item.type.toLowerCase().indexOf("nfs")>-1 && item.status=="in-use"))
                self.system_disk_list =self.system_disk_list.filter(item => !(item.type.toLowerCase().indexOf("nfs")>-1 && item.status=="in-use"))
                if(self.system_disk_list.length==0 && editData.startStyle == 'Local' ){
                    self.systemDiskTip = $translate.instant('aws.instances.backups.localsystemDiskPlace')
                }else{
                    self.systemDiskTip = $translate.instant('aws.instances.backups.nosystemDiskPlace')
                }
            }
        })
    }
   
    self.changeDisk = function(){
        size = 0;
        self.chooseSnapTipShow = false;
        self.newObj.canIncremental = true;
        self.newObj.type = "true";
        self.newObj.systemDisk.map(item => {
            if(item.isComplete == "false")
            self.newObj.canIncremental = false
        })
        self.newObj.dataDisk.map(item => {
            if(item.isComplete == "false")
            self.newObj.canIncremental = false
        })
        self.volume_backups = [...self.newObj.dataDisk,...self.newObj.systemDisk];
        self.volume_backups.map(item => {
            size+=Number(item.size)
        })
        checkQuotaSrv.checkQuota(self, "backups","","",self.volume_backups.length);
        checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size);
        getBackupAmount(size)
    }
    self.timeTaskFun = function(timed){
        if(timed && self.newObj.unit.unit){
            checkQuotaSrv.checkQuota(self, "backups","","",self.volume_backups.length*self.newObj.holdNumber*2);
            checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size*self.newObj.holdNumber*2); 
            getBackupAmount(size)
        }else{
            checkQuotaSrv.checkQuota(self, "backups","","",self.volume_backups.length);
            checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size);
            getBackupAmount(size)
        }
    }
    self.change_unit = function(type){
        if(type=="week"||type=="month"){
            self.backupMax="99"
            self.backupMin="1"
        }else if(type=="day"){
            self.backupMax="31"
            self.backupMin="1"
        }else if(type=="hour"){
            self.backupMax="168"
            self.backupMin="1"
        }else if(type=="minute"){
            self.backupMax="59"
            self.backupMin="1"
        }
        if(self.newObj.unit.unit){
            checkQuotaSrv.checkQuota(self, "backups","","",self.volume_backups.length*self.newObj.holdNumber*2);
            checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size*self.newObj.holdNumber*2);
            getBackupAmount(size)
        }
    }
    self.change_snap_number = function(){
        checkQuotaSrv.checkQuota(self, "backups","","",self.volume_backups.length*self.newObj.holdNumber*2);
        checkQuotaSrv.checkQuota(self, "backup_gigabytes","","",size*self.newObj.holdNumber*2);
        getBackupAmount(size)
    }
    self.createBackups = function(field){
        if(chkCurrentTime(self.newObj.startTime)){
            if(field.$valid){
                if(self.volume_backups.length){
                    var volumeIds = self.volume_backups.reduce((list, disk) => {
                        disk.id !== "" && list.indexOf(disk.id) === -1 && list.push(disk.id);
                        return list;
                    }, []);
                    var volumeNames = self.volume_backups.reduce((list, disk) => {
                        disk.name !== ""  && list.push(disk.name);
                        return list;
                    }, []);
                    var postData = {}
                    if(self.backupForm.timedSnap){
                        if(self.newObj.unit.unit){
                            postData.unit = self.newObj.unit.unit;//执行频率单位
                            postData.frequency = Number(self.newObj.frequency);//时间间隔
                        }
                        postData.startTime = self.newObj.startTime;   //首次执行时间
                        postData.holdNumber = self.newObj.holdNumber; //保留备份份数
                        postData.projectId = localStorage.projectUid;
                        postData.regionKey = localStorage.regionKey;
                        postData.userId = localStorage.userUid;
                        postData.serverId = editData.uid;
                        postData.jobType =1;
                        regularSnapSrv.createTask(postData,{volumeIds:volumeIds}).then(function(result){
                        })
                    }else{
                        postData.serverIds = [editData.uid];
                        postData.serverNames = [editData.name];
                        postData.volumeIds = volumeIds;
                        postData.volumeNames = volumeNames;
                        postData.incremental = self.newObj.type == "true"?false:true;
                        vmSrv.createBackups(postData).then(function(){
                            
                        })
                    }
                    
                    avoidDoubleClick(true)  //避免双击
                    $uibModalInstance.close();
                }else{
                    self.chooseSnapTipShow = true; //提示至少选择一块盘
                }
            }else{
                self.submitInValid = true;
            }
        }else{
            self.chkCurrentTimeTip = true;
        }
        
    }
    
}


