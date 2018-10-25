"use strict";
vmCtrl.$inject=["$scope", "$rootScope", "NgTableParams", "$location","$uibModal","checkedSrv", "$translate","vmService","uiComponentSrv"];
export function vmCtrl($scope, $rootScope, NgTableParams, $location, $uibModal,checkedSrv, $translate,vmService,uiComponentSrv){
    var self=$scope;

    function vm_table(data) {
        self.tabledata = data;
        self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.tabledata });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ searchTerm: term });
        };
        checkedSrv.checkDo(self,"instanceUuid");
    }
    function  handling_result(result){
        result.data.forEach((x)=>{
            x.diskSize=(x.diskSize/(1024*1024)).toFixed(2);
            x.diskSizeUsage=(x.diskSizeUsage/(1024*1024)).toFixed(2);
            x.hostMemoryUsage=(x.hostMemoryUsage).toFixed(2);
            x.guestMemoryUsage=(x.guestMemoryUsage).toFixed(2);
            x.searchTerm =  x.name;
        });
        //result.data=result.data.filter(vms=>vms.name!="VMware vCenter Server Appliance");
        self.loadData=false;
        vm_table(result.data);
    }
    function get_vm_list() {
        var value = $location.path().split("/")[1];
        if(value==="virtualmachine"){
            localStorage.form_location="virtualmachine";
            vmService.getVmList().then(function(result){
                if(result&&result.data){
                    handling_result(result);
                }
            });
        }else if(value==="datacenter"){
            localStorage.form_location="datacenter";
            let dcName=localStorage.DCTAG;
            vmService.getVmListByDCName(dcName).then(function(result){
                if(result&&result.data){
                    handling_result(result);
                }
            });
        }else if(value==="host"){
            localStorage.form_location="host";
            let hostName=localStorage.TAG;
            vmService.getVmListByHostName(hostName).then(function(result){
                if(result&&result.data){
                    handling_result(result);
                }
            });
        }else if(value==="cluster"){
            let clustName=localStorage.CLUTAG;
            vmService.getVmListByClusterName(clustName).then(function(result){
                if(result&&result.data){
                    handling_result(result);
                }
            });
        }
        
    }
    get_vm_list();
    self.canSuspend=false;
    self.canPowerOn=false;
    self.canPowerOff=false;
    self.canOpenConsole=false;
    self.canDel=false;
    self.canRest=false;
    self.canLookSnap=false;
    self.pcConsole=true;
    self.circleConsole = false;
    self.canRestore=false;
    function canRestoreFunc(obj){
        self.canRestore=true;
        if(!obj.currentSnapshotMor){
            self.canRestore=false;
        }
    }
    function canPowerOnFunc(obj){
        self.canPowerOn=true;
        let cantPowerOnArry=["poweredOn"];
        _.forEach(cantPowerOnArry, function(item) {
            if (obj.powerStatus == item) {
                self.canPowerOn = false;
            }
        });
    }
    function canPowerOffFunc(obj){
        self.canPowerOff=true;
        let cantPowerOffArry=["poweredOff"];
        _.forEach(cantPowerOffArry, function(item) {
            if (obj.powerStatus == item) {
                self.canPowerOff = false;
            }
        });
    }
    function canSuspendFunc(obj){
        self.canSuspend=true;
        let cantSuspendArry=["suspended","poweredOff"];
        _.forEach(cantSuspendArry, function(item) {
            if (obj.powerStatus == item) {
                self.canSuspend = false;
            }
        });
    }
    function canOpenConsoleFunc(obj){
        self.canOpenConsole = false;
        self.pcConsole=true;
        self.circleConsole = false;
        if(obj.powerStatus =="suspended"||obj.powerStatus == "poweredOff"){   
            self.canOpenConsole = false;
        }else{
            self.pcConsole=false;
            self.circleConsole = true;
            vmService.getConsoleUrl(obj.mor).then(function(res){
                if(res.data){
                    self.pcConsole=true;
                    self.circleConsole = false;
                    if(res.data.split("?")[0].indexOf("https://")>-1){
                        self.consoleUrl = res.data;
                    }else{
                        self.consoleUrl = window.location.host+'/console/?'+res.data.split("?")[1]+"&wxCon="+res.data.split("?")[0].replace("http://","");
                    }
                    //self.consoleUrl = res.data;
                    if(res.data.indexOf("/console/?vmId")>-1){
                        self.morValue = res.data.split("/console/?vmId=")[1].split("&vmName")[0];
                    }else{
                        self.morValue = res.data.split("vm=urn:vmomi:VirtualMachine:")[1].split(":")[0];
                    }
                    
                    var conOpen=self.$watch(function(){
                        return self.checkedItems;
                    },function(value){
                        if(value&&value.length == 1 && value[0].mor.value==self.morValue){
                            self.canOpenConsole = true;
                        }else{
                            self.canOpenConsole = false;
                            conOpen();
                        }
                    });
                }
            });
        }
    }
    function canDelFunc(obj){
        self.canDel=true;
        let cantDelArry=["poweredOn"];
        _.forEach(cantDelArry, function(item) {
            if (obj.powerStatus == item) {
                self.canDel = false;
            }
        });
    }
    function canRestFunc(obj){
        self.canRest=true;
        let cantRestArry=["poweredOff","suspended"];
        _.forEach(cantRestArry, function(item) {
            if (obj.powerStatus == item) {
                self.canRest = false;
            }
        });
    }
    self.$watch(function(){
        return self.checkedItems;
    },function(value){
        if(value&&value.length==1){
            canPowerOnFunc(value[0]);
            canPowerOffFunc(value[0]);
            canSuspendFunc(value[0]);
            canOpenConsoleFunc(value[0]);
            canDelFunc(value[0]);
            canRestFunc(value[0]);
            self.canLookSnap=true;
            canRestoreFunc(value[0])
        }else{
            self.canSuspend=false;
            self.canPowerOn=false;
            self.canPowerOff=false;
            self.canOpenConsole=false;
            self.canDel=false;
            self.canRest=false;
            self.canLookSnap=false;
            self.pcConsole=true;
            self.circleConsole = false;
            self.canRestore=false;
        }

    });
    self.refreshVM=function(){
        get_vm_list();
    }
    //创建虚拟机
    self.create_vm = function() {
        $location.path("/virtualmachine/createvm")
    };

    //打开控制台
    self.openConsole = function(obj) {
        if(self.consoleUrl.indexOf("&wxCon=")>-1){
            window.open("http://"+ self.consoleUrl, "Console", "height=1000,width=1100,top=20,left=400,toolbar=yes,menubar=no,scroll");
        }else{
            window.open( self.consoleUrl, "Console", "height=1000,width=1100,top=20,left=400,toolbar=yes,menubar=no,scroll");
        }
    };
    self.goToVMDetail=function(vm){
        $location.path("/virtualmachine/overview");
        localStorage.vmmor=JSON.stringify(vm.mor);
        localStorage.TAG = vm.name;
    };
    self.revertCurrent=function(editData){
        self.confirmFunc=function(){
            vmService.revertCurrent(editData.mor).then(function(result){
                self.checkboxes.items={};
            })
        }
        var content = {
            msg: "除非将虚拟机的当前状态保存在快照中，否则该状态将丢失。是否要恢复为最新 (最近) 的快照?",
            type: "warning",
            func:"confirmFunc"
        };
        self.$emit("ui-tag-alert", content);
    }
    self.powerVM = function(editData,action){
        self.powerVMFunc = function(){
            vmService.powerVM({
                "mor":editData.mor,
                "status":action
            }).then(function(){
                get_vm_list();
            });
        };
        switch(action){
            case "powerOff": //关机
            var content = {
                target: "shutdownvm",
                msg: "是否关闭虚拟机电源？",
                type: "danger",
                func:"powerVMFunc"
            };
            self.$emit("ui-tag-alert", content);
            break;
            case "suspend": //挂起
            var content2 = {
                target: "shutdownvm",
                msg: "是否挂起虚拟机？",
                type: "danger",
                func:"powerVMFunc"
            };
            self.$emit("ui-tag-alert", content2);
            break;
            case "reset": //重启电源
            case "powerOn": //开机
            self.canPowerOn=false;
            case "reboot": //重启操作系统
            case "shutdown": //关闭操作系统
            case "standby": //挂起操作系统
            self.powerVMFunc();
            break;
        }
    };
    //  编辑虚拟机功能
    self.editVM=function(editData){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "tmpl/editVM.html",
            controller: "editVMCtrl",
            resolve: {
                selectedvm: function() {
                    return editData;
                },
                checkboxes:function(){
                    return self.checkboxes;
                }
            }
        });
    }
    //快照
    self.snapshot = function(editData){
        var scope = self.$new()
        var snapshotInstanceModal = uiComponentSrv.modalInstance({
            templateUrl:"snapshotModal.html",
            scope:scope
        });
        
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        scope.snapshotForm = {
            "memory":false,
            "quiesce":false
        };
        scope.confirm = function(form){
            if(form.$valid){
                scope.snapshotForm.mor = editData.mor;
                vmService.createSnapshot(scope.snapshotForm).then(function(){
                    get_vm_list();
                });
                snapshotInstanceModal.close();
            }else{
                scope.submitted = true;
            }
        };
        scope.cancel = function() {
            snapshotInstanceModal.close();
            self.checkboxes.items={};
        };
    };
    //管理虚拟机快照
    self.getSnap=function(editData){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "tmpl/snapshot.html",
            controller: "snapshotCtrl",
            resolve: {
                selectedvm: function() {
                    return editData;
                },
                checkboxes:function(){
                    return self.checkboxes;
                }
            }
        });
    }
    //删除虚拟机
    self.deleteVM = function(checkedItems) {
        let content = {
            target: "delVM",
            msg: "<span>" +  "确定删除虚拟机吗？" + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delVM", function(e,data) {
        vmService.destroyVM(data[0].mor).then(function(){
            get_vm_list();
        })
    });

    //迁移虚拟机
    self.migration=function(obj){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "tmpl/virtualmachine/migration.html",
            controller: "migrationCtrl",
            resolve: {
                selectedvm: function() {
                    return obj;
                },
                checkboxes:function(){
                    return self.checkboxes;
                }
            }
        });
    }
}
/*vmModule.controller("migrationCtrl", ["$scope", "$rootScope", "alertSrv", "$translate","$uibModalInstance",function($scope, $rootScope, alertSrv, $translate,$uibModalInstance) {
    var self=$scope;
    //选择虚拟机迁移方法
    self.migMethod=function(method){
        console.log(method)
    };
    //虚拟机存储策略
    self.strategyList=[{name:"strategy1",id:"111"},{name:"strategy2",id:"222"}]
    self.strategy=self.strategyList[0];
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };
}]);
export default vmModule.name*/