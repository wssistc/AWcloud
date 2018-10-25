

function backupsCtrl($scope, $rootScope, $translate,$uibModal,$location,backupsSrv,NgTableParams,newCheckedSrv,$filter,volumeId,
    volumesDataSrv){
    var self = $scope;
    self.isbackupVolume = false;
    self.restore_btn = true;
    self.hasTask = true;
    self.volumeId = volumeId;
    self.translate = {
        "name": $translate.instant("aws.backups.table.name"),
        "vm": $translate.instant("aws.backups.table.vm"),
        "createAt": $translate.instant("aws.backups.table.createAt"),
        "size": $translate.instant("aws.backups.table.size"),
        "backupStatus": $translate.instant("aws.backups.table.backupStatus"),
        "backupType": $translate.instant("aws.backups.table.backupType"),
    }
    var tableData;
    //备份新建云主机
    self.insAnimation = "animateOut";
    self.newInstance = function(editData){
        if(!self.vm_btn)return;
        var path = "/cvm/backups?from=backup&backupId="+editData.id
        $location.url(path);
        self.insAnimation = "animateIn";
        $("body").addClass("animate-open")
       
        // var path = "/quickconfig/createins?from=backup&backupId="+editData.id
        // $location.url(path);
    }
    self.closeNewIns = function(){
        self.insAnimation = "animateOut";
        $("body").removeClass("animate-open");
        $location.url("/cvm/backups");
    }
    //有定时备份任务的卷不能新建备份
    backupsSrv.checkSheduleJob({volumeId:volumeId,jobType:1}).then(function(res){
        if(res && res.data && angular.isArray(res.data)){
            self.hasTask = Boolean(res.data.length);
            if(self.hasTask){
                self.newBackupTip = $translate.instant("aws.backups.tips.tip12");
            }
        }
    })

    //备份新建云硬盘
    self.newVolume = function(editData){
        if(!self.volume_btn){
            return;
        }
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/volumes/tmpl/volumeModel.html",
            controller: "volumeController",
            resolve: {
                type: function() {
                    return "backup";
                },
                editData: function() {
                    return editData;
                },
                initTable: function() {
                    return self.getBackups;
                }
            }
        });
    }
    //获取备份列表
    self.getBackups = function(){
		self.backuptabledata = "";
		backupsSrv.getVolumeBackups(volumeId).then(function(res){
			if(res && res.data && angular.isArray(res.data)){
                res.data = $filter("orderBy")(res.data, "createdAt",false);
				initTable(res);
			}else{
                self.backuptabledata = null;
            }
		});
    }
    //只允许删除状态为available以及error且没有依赖的备份 
    self.delBackups = function(data){
        if(self.del_btn){
            return;
        }
        if(data[0] && data[0].hasDependentBackups) { // 删除有依赖的备份
            deleteDependentBackups(data[0]);
        } else {
            deleteNoDepBackups(data);
        }
    }
    function deleteNoDepBackups(data) {
        var content = {
            target: "delBackups",
            msg: "<span>" + $translate.instant("aws.backups.tips.del_msg") + "</span>",
            data:data
        };
        self.$emit("delete", content);
    }
    if($rootScope.delFn){
        $rootScope.delFn();
        $rootScope.delFn = "";
    }
    $rootScope.delFn =  self.$on("delBackups", function(e,data) {
        var postData = chkSome(data);
        $rootScope.$broadcast("showDelDepLoading");
        newCheckedSrv.setChkIds(postData.ids,"backupdelete")
        backupsSrv.delBackups(postData).then(function() {
        });
    });

    // 删除有依赖的备份, 弹出层展示依赖的备份, 依次删除。
    function deleteDependentBackups(data) {
        var idx = "";
        var depBackupList = [];
        self.backuptabledata.forEach(function(item, index) {
            if(item.id == data.id) {
                idx = index;
            }
        });
        for(var i = idx; i < self.backuptabledata.length; i++) {
            if(!self.backuptabledata[i].isIncremental && i != idx) {
                break;
            } else {
               depBackupList.push(self.backuptabledata[i]);
            }
        }
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/volumes/tmpl/delDepBackupsModel.html",
            controller: "delDepBackupsController",
            resolve: {
                deleteNoDepBackups: function() {
                    return deleteNoDepBackups;
                },
                depBackupData: function() {
                    return depBackupList;
                }
            }
        });

    }

    //新建备份
    self.volumeBackup = function(editData){
        if(!self.isbackupVolume || self.hasTask) return ;
        // editData.isComplete = "true";
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/volumes/tmpl/volumeBackup.html",
            controller: "volumeBackupCtrl",
            resolve: {
                initTable: function() {
                    return self.getBackups;
                },
                editData: function() {
                    return editData;
                }
            },
        });
        return uibModalInstance.result.then(function(post){
            self.newBackupTip = $translate.instant("aws.backups.tips.tip9");
            self.getBackups();
        });
    }
    //备份还原
    self.restoreBackup = function(data){
        if(self.restore_btn || self.isDisabled || self.restoreStatus_btn){
            return;
        }
        var content = {
            target: "restoreBackup",
            msg: "<span>" + $translate.instant("aws.backups.tips.restore_msg") + "</span>",
            data:data
        };
        self.$emit("delete", content);
    }

    self.$on("restoreBackup", function(e,data) {
        var postData = chkSome(data);
        newCheckedSrv.setChkIds(postData.ids,"backuprestore")
        backupsSrv.restoreBackup(postData.ids[0],volumeId,postData.names[0]).then(function() {
        });
    });

    //重置状态
    self.resetBackup = function(data){
        if(!self.reset_btn){
            return;
        }
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "resetBackup.html",
            controller: "resetBackupCtrl",
            resolve: {
                editData: function() {
                    return data;
                }
            }
        });
        
    }

    self.refreshBackups = function(){
        self.getBackups()
    }
    // self.$on("getDeepDetail", function(event, value) {
    //     backupsSrv.getBackupsDetail(value).then(function(res){
    //         if(res && res.data){
    //             self.detailData = res.data;
    //             self.detailData.isIncremental = $translate.instant("aws.backups.table.isIncremental." +  res.data.isIncremental);
    //             self.detailData.status = $translate.instant("aws.backups.table.status." +  res.data.status);
    //         }
    //     })
    // })

    self.$watch(function(){
        return self.checkedItemsbackupTable;
    },function(values){
        self.del_btn = true;
        self.reset_btn = false;
        self.volume_btn = false;
        self.vm_btn = false;
        self.restoreStatus_btn = true;
        self.btn = {};
        self.storageTypeTip = $translate.instant("aws.backups.tips.tip14");
        if(values && values.length){
            var availableChk = 0,errorChk = 0,createChk = 0,errorDepChk = 0;
            values.map(function(item){
                availableChk += (item.status === "available") || 0;
                errorChk += (item.status === "error") || 0;
                if(values.length == 1){
                    self.btn.limit = values[0].storageLimit;
                    self.storageTypeTip = $translate.instant("aws.backups.tips.tip13");
                    //错误、可用状态且没有被依赖的盘可以删,小备份链中有创建中的不允许删除
                    var indexChoose = -2;
                    self.backuptabledata.map((item,index) =>{
                        if(values[0].id == item.id){
                            indexChoose = index;
                        }
                        if(index == indexChoose +1){
                            // createChk += (item.isIncremental && item.status === "creating") || 0;
                            errorDepChk += (item.isIncremental && item.status === "error") || 0;
                        }
                    })
                    var depBackupList = [];
                    for(var i = indexChoose; i < self.backuptabledata.length; i++) {
                        if(!self.backuptabledata[i].isIncremental && i > indexChoose) {
                            break;
                        } else {
                           depBackupList.push(self.backuptabledata[i]);
                        }
                    }
                    depBackupList.map(item => {
                        createChk += (item.isIncremental && item.status === "creating") || 0;
                    });
                    if((values[0].status == "error" || values[0].status == "available") &&  errorDepChk == 0 && createChk == 0){
                        self.del_btn = false;
                    }else{
                        if(createChk != 0){
                            self.del_tip = $translate.instant("aws.backups.tips.tip10");
                        }else if(errorDepChk != 0){
                            self.del_tip = $translate.instant("aws.backups.tips.tip11");
                        }else {
                            self.del_tip = $translate.instant("aws.backups.tips.tip1");
                        }
                    }
                    //可用状态可以新建云硬盘
                    if(self.btn.limit["volumes_backup"]) 
                    canBackupVolume(values[0]);
                    //非错误、可用状态才可以重置
                    canReset(values[0]);
                    //可用状态可以新建云主机
                    canVm(values[0]);
                    //可用状态且源卷可用可以还原
                    if(!self.restore_btn){
                        if(values[0].status == "available"){
                            self.restoreStatus_btn = false;
                        }else{
                            self.restoreBackupTip = $translate.instant("aws.backups.tips.tip8");
                        }
                    }
                    
                } else {
                    if (values && values.length > 1) {
                        self.storageTypeTip = $translate.instant("aws.backups.table.placeholder.createVolumeMultipleChoice");
                    } 
                }
            })
        }
    },true)

    function canBackupVolume (obj){
        self.volume_btn = true;
        if(obj.status != "available"){
            self.volume_btn = false;
            self.backupVolumeTip = $translate.instant("aws.backups.tips.tip4");
            return;
        }
    }
    function canReset(obj){
        self.reset_btn = true;
        if((obj.status == "error" || obj.status == "available")){
            self.reset_btn = false;
            return;
        }
    }
    function canVm(obj){
        self.vm_btn = true;
        if(obj.status != "available"){
            self.vm_btn = false;
            return;
        }
    }

    self.$on("backupSocket", function(e, data) {
        if (self.backuptabledata && self.backuptabledata.length) {
            self.backuptabledata.map(function(obj) {
                if (data.eventMata.backup_id) {
                    if (obj.id === data.eventMata.backup_id) {
                        obj.status = data.eventMata.status;
                        if (data.eventType == "backup.delete.end") { //删除
                            _.remove(self.backuptabledata, function(val) {
                                return ((val.status == "error" || val.status == "deleted"));
                            });
                            isVolumeExist() //重新获取原卷的状态
                            self.getBackups(); //刷新列表解除依赖关系
                        }
                    }
                }
            });
        }
        self.backupTable.data = self.backuptabledata;
        self.backupTable.reload();
        self.checkboxesbackupTable.items = {};
        if(data.eventType == "backup.create.end"){
            self.getBackups(); //刷新列表获取依赖关系
        }
        if(data.eventType == "backup.create.start" || data.eventType == "backup.restore.start"){
            self.isbackupVolume = false;
            self.restore_btn = true;
            isVolumeExist() //重新获取原卷的状态
        }
        if(data.eventType == "backup.create.end" || data.eventType == "backup.restore.end" || data.eventType == "backup.create.error" ){
            self.isbackupVolume = false;
            isVolumeExist() //重新获取原卷的状态
        }
        
        
    });

    function editSearch(item){
		item.status = item.status.toLowerCase();
		item.statusCopy = $translate.instant('aws.backups.table.status.' + item.status);
		item.bootableCopy = $translate.instant('aws.backups.table.bootable.' + item.bootable)
		item.searchTerm = [item.name,item.statusCopy,item.bootableCopy,item.volumeName,item.serverName].join("~") ;
		return item;
	}

    function initTable(res){
		if(res && res.data){
			res.data.map((item,index) => {
                editSearch(item)
            })
            tableData = res.data;
			self.backuptabledata = res.data;
			self.backupTable = new NgTableParams({ count: 10 }, { counts: [], dataset: self.backuptabledata });
			newCheckedSrv.checkDo(self,res.data,"id","backupTable");
		}
    };
    
    function chkSome(items) {
		var ids = [];
		var names = []
		items.map(item => {
			ids.push(item.id),
			names.push(item.name)
		})
		return {ids:ids,names:names};
    };

    function restoreLimit(volume){
        if(volume){
            if(volume.status == "available"){
                self.restore_btn = false;
            }else if(volume.status == "in-use"){
                if(angular.isArray(volume.insnameAndId) && volume.insnameAndId.length>0){
                    var shutoffCount = 0;
                    volume.insnameAndId.map(item =>{
                        item.status == "shutoff"?shutoffCount+=1:"";
                    })
                    if(shutoffCount == volume.insnameAndId.length){
                        self.restore_btn = false;
                        if(self.checkedItemsbackupTable.length==1){
                            if(self.checkedItemsbackupTable[0].status == "available"){
                                self.restoreStatus_btn = false;
                            }else{
                                self.restoreBackupTip = $translate.instant("aws.backups.tips.tip8");
                            }
                        }
                    
                    }else{
                        self.restoreBackupTip = $translate.instant("aws.backups.tips.tip7");
                    }
                }else{
                    self.restore_btn = false;
                }
            }else{
                self.restoreBackupTip = $translate.instant("aws.backups.tips.tip9");
            }
            
        }
    }
    //获取备份源卷
    function isVolumeExist(){
        backupsSrv.isVolumeExist(volumeId).then(function(result){
            if(result && result.data){
                if(result.data.id == volumeId){
                    if(result.data.exist){
                        self.existvolumeId = true;
                        if(result.data.volume && (result.data.volume.status == "available" || result.data.volume.status == "in-use")){
                            self.isbackupVolume = true;
                        }else{
                            self.isbackupVolume = false;
                            self.newBackupTip = $translate.instant("aws.backups.tips.tip9");
                        }
                        
                        self.backupVolumeDetailData = result.data.volume;
                        restoreLimit(result.data.volume)
                    }else{
                        self.isbackupVolume = false;
                        self.newBackupTip = $translate.instant("aws.backups.tips.tip3");
                    }
                    
                }
            }else{
                self.isbackupVolume = false;
                self.newBackupTip = $translate.instant("aws.backups.tips.tip3");
            }
        })
    }
        
    isVolumeExist();
    self.getBackups();    
}
function resetBackupCtrl($scope, $rootScope, $translate,$uibModal,backupsSrv,editData,$uibModalInstance,newCheckedSrv){
    var self = $scope;
    self.submitInValid = false;
    self.translate = {
        error: $translate.instant("aws.backups.table.status.error")
    }
    self.toStatuseList = [{"name":self.translate.error,"value":"error"}];
    // if(editData.status !="restoring"){
    //     self.toStatuseList = self.toStatuseList.filter(item => item.value != "available")
    // }
    self.reset = {};
    self.reset.toStatus = self.toStatuseList[0];
    self.resetBackupConfirm = function(field){
        if(field.$valid){
            var postData={
                backName:editData.name,
                status:self.reset.toStatus.value
            }
            newCheckedSrv.setChkIds([editData.id],"backupreset_status")
            backupsSrv.resetBackup(editData.id,postData).then(function(){})
            $uibModalInstance.close();
        }else{
            self.submitInValid = true;
        }
    }

}
backupsCtrl.$inject = ["$scope", "$rootScope", "$translate","$uibModal","$location","backupsSrv","NgTableParams","newCheckedSrv","$filter","volumeId",
"volumesDataSrv"];
resetBackupCtrl.$inject = ["$scope", "$rootScope", "$translate","$uibModal","backupsSrv","editData","$uibModalInstance","newCheckedSrv"];
export {backupsCtrl,resetBackupCtrl}
