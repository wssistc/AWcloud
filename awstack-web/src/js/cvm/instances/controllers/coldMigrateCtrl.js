import  vmSrv from "../services/vmSrv";
import nodeSrv from "../../../configure/node/nodeSrv";

coldMigrateCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModalInstance","$location","vmSrv","nodeSrv","editData","NgTableParams"];
export function coldMigrateCtrl($scope, $rootScope, $translate,$uibModalInstance,$location,vmSrv,nodeSrv,editData,NgTableParams){
    var self = $scope;
    self.migrateType = [{name:"系统调度",value:"auto"},{name:"指定节点",value:"appoint"}];
    self.coldMigrate = {};
    self.submitInValid = false;
    nodeSrv.getHypervisors().then(function(result) {
        if (result && result.data) {
            result.data.map(item=>{
                item.name = item.hypervisorHostname.split(".")[0];
                item.freeCpu = item.virtualCPU * 4 - item.virtualUsedCPU;
                item.freeRam=parseInt(item.freeRam/1024);
            })
            result.data = result.data.filter(item => (item.name != editData.hostName &&(editData.vcpus<item.freeCpu && editData.ram/1024<item.freeRam)&&(item.state=="up"&&item.status=="enabled")))
            self.coldMigrate.name = result.data[0].name;
            self.coldMigrateTable = new NgTableParams({ count: 10 }, { counts: [], dataset: result.data });
        }

    });
    self.confirm = function(field){
        var postData = {
            "migrate": {}
        }
        if(field.$valid){
            $uibModalInstance.close()
            self.coldMigrate.type.value == "appoint"?postData.migrate.host = self.coldMigrate.name :postData.migrate = null ;
            vmSrv.coldMigrate(editData.uid,postData)
        }else{
            self.submitInValid = true;
        }
        
        
    }
}


