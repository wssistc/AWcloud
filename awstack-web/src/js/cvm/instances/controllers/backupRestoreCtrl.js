import  vmSrv from "../services/vmSrv"

backupRestoreCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModalInstance","$location","vmSrv","editData","$filter","newCheckedSrv"];
export function backupRestoreCtrl($scope, $rootScope, $translate,$uibModalInstance,$location,vmSrv,editData,$filter,newCheckedSrv){
    var self = $scope;
    var all_system_backup_list,all_data_backup_list;
    self.system_backup_list = [];
    self.data_backup_list = [];
    self.newObj = {
        systemDiskBackup:[],
        dataDiskBackup:[]
    }
    console.log(editData)
    vmSrv.getRestoreBackup(editData.uid).then(function(result){
        if(result && result.data){
            for (let value of Object.values(result.data.systemVolumeBackups)) {
                self.system_backup_list.push(...value)
            }
            for (let value of Object.values(result.data.dataVolumeBackups)) {
                self.data_backup_list.push(...value)
            }
            self.system_backup_list = self.system_backup_list.filter(item => (item.storageLimit && item.storageLimit["restore"]));
            self.data_backup_list = self.data_backup_list.filter(item => (item.storageLimit && item.storageLimit["restore"]));
            all_system_backup_list = angular.copy(self.system_backup_list)
            all_data_backup_list = angular.copy(self.data_backup_list);
        }
    })

    self.changeSystemBackup = function(items){
        var systemBackupTemp = angular.copy(all_system_backup_list);
        items.map(item => {
            systemBackupTemp = systemBackupTemp.filter(val => val.volumeId!=item.volumeId)
        })
        self.system_backup_list = systemBackupTemp;
        self.chooseBackupTipShow = false;
    }

    self.changeDataBackup = function(items){
        var dataBackupTemp = angular.copy(all_data_backup_list);
        items.map(item => {
            dataBackupTemp = dataBackupTemp.filter(val => val.volumeId!=item.volumeId)
        })
        self.data_backup_list = dataBackupTemp;
        self.chooseBackupTipShow = false;
    }

    self.confirmRestore = function(){
        self.cannot_Confirm = true;
        if(self.newObj.systemDiskBackup.length + self.newObj.dataDiskBackup.length == 0){
            self.chooseBackupTipShow = true;
        }
        if(!self.chooseBackupTipShow){
            var postData = {
                "serverName":editData.name,
                "backupRestoreVo":[]
            };
            var backupIds = [];
            self.newObj.systemDiskBackup.map(item => {
                postData.backupRestoreVo.push({volumeId:item.volumeId,backupId:item.id});
                backupIds.push(item.id);
            })
            self.newObj.dataDiskBackup.map(item => {
                postData.backupRestoreVo.push({volumeId:item.volumeId,backupId:item.id});
                backupIds.push(item.id);
            })
            newCheckedSrv.setChkIds(backupIds,"backuprestore");
            vmSrv.vmRestoreBackup(postData).then(function(){
                self.cannot_Confirm = false;
            })
            $uibModalInstance.close()
        }
    }
}


