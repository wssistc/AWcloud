
volumeBackupCtrl.$inject=['$scope', 'volumesDataSrv', '$translate', '$uibModalInstance', 'initTable', 'editData','checkQuotaSrv','vmFuncSrv'];
export function volumeBackupCtrl(scope, volumesDataSrv, $translate, $uibModalInstance, initTable, editData,checkQuotaSrv,vmFuncSrv){
    scope.submitInValid = false;
    scope.newObj = {};
    scope.newObj.type = "true";
    editData.isComplete == "true"?scope.newObj.canIncremental = true:scope.newObj.canIncremental=false;
    checkQuotaSrv.checkQuota(scope, "backups");
    checkQuotaSrv.checkQuota(scope, "backup_gigabytes","","",editData.size);
    getBackupAmount(editData.size)
    function getBackupAmount(value) {
        var option = {
            backupVolumeSize: value,
            region: localStorage.regionName || "default"
        }
        vmFuncSrv.bossSourceFunc(scope,value,option,"queryBackupChargingAmount")
    }
    scope.createBackupsConfirm = function(fileFrom){
        if(fileFrom.$valid){
            var postData = {
                name:scope.newObj.name,
                serverIds:[],
                serverNames:[],
                volumeIds:[editData.id],
                volumeNames:[editData.name],
                incremental:scope.newObj.type == "true"?false:true,
            }
            editData.insnameAndId.map(item=>{
                postData.serverIds.push(item.id)
                postData.serverNames.push(item.name)
            })
            volumesDataSrv.createBackups(postData).then(function(res){
                initTable()
            })
            $uibModalInstance.close();
        }else{
            scope.submitInValid = true;
        }
    }
}
