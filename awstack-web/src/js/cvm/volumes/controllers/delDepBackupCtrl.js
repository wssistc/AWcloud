
delDepBackupsController.$inject=['$scope', '$uibModalInstance', 'volumesDataSrv', 'deleteNoDepBackups', 'depBackupData'];
export function delDepBackupsController($scope, $uibModalInstance, volumesDataSrv, deleteNoDepBackups, depBackupData) {
    var self = $scope;
    self.delLoadingShow = false;
    self.del_current = depBackupData[0].name;
    self.backupList = depBackupData;
    self.delDepBackup = function(index, backup) {
        deleteNoDepBackups([backup]);
        self.index = index;
    }
    self.$on("showDelDepLoading", function(e, data){
        self.delLoadingShow = true;
    });
    self.$on("backupSocket", function(e, data) {
        if (self.backupList && self.backupList.length) {
            self.backupList.map(function(obj) {
                if (data.eventMata.backup_id) {
                    if (obj.id === data.eventMata.backup_id) {
                        if (data.eventType == "backup.delete.end") { //删除成功
                            self.backupList.splice(self.index, 1);
                            self.delLoadingShow = false;
                            if(self.backupList.length == 0) {
                                $uibModalInstance.close();
                            }
                        }
                    }
                }
            });
        }
    });
}
