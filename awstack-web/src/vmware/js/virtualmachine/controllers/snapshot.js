snapshotCtrl.$inject=["$scope", "$rootScope", "$translate","vmService","selectedvm","checkboxes","$uibModalInstance"];
export function snapshotCtrl($scope, $rootScope, $translate,vmService,selectedvm,checkboxes,$uibModalInstance){
    var self=$scope;
    function lookCurrentSnap(obj){
        _.forEach(obj,function(item){
            if(item.snapshot&&item.snapshot.value==self.selectedSnapValue){
                item.isCurrent=true;
                item.current_font="虚拟机当前在此处"
                //item.childSnapshotList.push({name:"虚拟机当前在此处"})
            }else{
                if(item.childSnapshotList.length>0){
                    lookCurrentSnap(item.childSnapshotList)
                }
            }
        })
    }
    function snapshot_table(data) {
        if(data){
            self.snapshotList=[{name:selectedvm.name,type:"VirtualMachine"}];
            self.snapshotList[0].childSnapshotList=data.rootSnapshotList;
            self.selectedSnapValue=data.currentSnapshot.value;
            self.selectedSnap=data.currentSnapshot;
        }else{
            self.snapshotList=[{name:selectedvm.name,type:"VirtualMachine",isCurrent:true,current_font:"虚拟机当前在此处"}];
            self.snapshotList[0].childSnapshotList=[];
        }
        
        lookCurrentSnap(self.snapshotList)
    }
    
    function getSnapshots(){
        let params={mor:selectedvm.mor};
        vmService.listSnapshotByVm(params).then(function(result){
            if(result&&result.data){
                snapshot_table(result.data);
                self.canDelAllSnap=true
            }else{
                snapshot_table()
            }
        });
    }
    getSnapshots();
    
    self.selectSnap=function(obj){
        if(!obj.type){
            self.selectedSnap=obj;
            self.canDelSnap=true;
        }
    };
    self.canDelSnap=false;
    self.canDelAllSnap=false;
    self.delSnap=function(){
        self.canDelSnap=false;
        vmService.delSnap(self.selectedSnap.snapshot).then(function(result){
            getSnapshots();
        });
    };
    self.restore_vm=function(){
        self.canDelSnap=false;
        vmService.revertVM(self.selectedSnap.snapshot).then(function(result){
            getSnapshots();
        });
    };
    self.delAllSnap=function(){
        self.canDelSnap=false;
        self.canDelAllSnap=false;
        vmService.delAllSnap(selectedvm.mor).then(function(result){
            if(!result.data){
                self.canDelSnap=true;
                self.canDelAllSnap=true;
            }else{
                getSnapshots();
            }
            
        });
    };
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        checkboxes.items={};
    };
}