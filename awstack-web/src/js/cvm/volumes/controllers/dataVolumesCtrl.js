
import "../volumesSrv";
import "../../instances/instancesSrv";
dataVolumesCtrl.$inject=['$scope', "$rootScope", "volumesDataSrv", "$translate","NgTableParams","newCheckedSrv","$uibModal","$location","instancesSrv","regularSnapSrv","volumesSrv","storageManagementSrv"];
loadingVolumeCtrl.$inject=['$scope', 'volumesDataSrv', '$uibModalInstance', '$translate', 'initDataVolumesTable', 'editData'];
expandVolumeSizeCtrl.$inject=['$scope', 'volumesDataSrv', '$translate', '$uibModalInstance', 'initDataVolumesTable', 'editData'];
createSnapshotCtrl.$inject=['$scope', 'volumesDataSrv', '$translate', '$uibModalInstance', 'initDataVolumesTable', 'editData','checkedSrv',];

function dataVolumesCtrl($scope, $rootScope, volumesDataSrv,$translate,NgTableParams,newCheckedSrv,$uibModal,$location,instancesSrv,regularSnapSrv,volumesSrv,storageManagementSrv){
    let self = $scope;
    self.context = self;
    self.table = {};
    self.menuGuide = [$translate.instant('aws.menu.System'),$translate.instant('aws.menu.System_Operation'),$translate.instant('aws.menu.System_Storage')];
    self.titleName="dataVolumes";
    if(sessionStorage["dataVolumes"]){
       self.tableCols=JSON.parse(sessionStorage["dataVolumes"]);
    }else{
        self.tableCols = [
            { field: "check", title: "",headerTemplateURL:"dataheaderCheckbox.html",show: true },
            { field: "name", title: self.headers.volumeName,sortable: "name",show: true,disable:true},
            { field: "size", title: self.headers.config,sortable: "size",show: true,disable:false},
            { field: "statusCopy", title: self.headers.status,sortable: "status",show: true,disable:true },
            { field: "voltype", title: self.headers.voltype,sortable: "voltype",show: true,disable:false },
            { field: "bootableCopy", title: self.headers.bootable,sortable: "bootable",show: true,disable:false },
            { field: "multiattachCopy", title: self.headers.sharedVolume,sortable: "multiattach",show: true,disable:false },
            { field: "description", title: self.headers.description,sortable: "description",show: true,disable:false },
        ];
    }
    
    // storageManagementSrv.getStorageTableData().then(function(res){
    //     if(res && res.data && angular.isArray(res.data)){
    //         res.data.map(item => {
    //             if(item.use == "1" && item.type.toLowerCase().indexOf("nfs")>-1){
    //                 self.volume.nfsBakTonfs = true;
    //             }
    //         })
    //     }
    // })

    function successFunc(res){
		self.data_data = self.configSearch(self.data_data,self.tableCols);
        self.dataTableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: self.data_data });
        newCheckedSrv.checkDo(self,"","id","dataTableParams");
    };

    self.resetVolumeStatus = function(obj) {
        if(!self.btn.resetVol) return;
        var content = {
            target: "resetVolumeStatus",
            msg: "<div class='resetVolume-info'>" + $translate.instant("aws.volumes.dv.confirmResetStatus") + "</div>",
            data: obj
        };
        self.$emit("delete", content);
    };
    self.$on("resetVolumeStatus", function(e,data) {
        volumesSrv.resetStatus(data.id).then(function(){
            self.getData();
        })
    });

    self.noBackupsModal = function(dis){
        if(dis) return;
        var modal_os = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/volumes/tmpl/addBackupTip.html",
        });
    }
    
    self.getData = function(){
        if(!localStorage.cinderService) return;
        volumesDataSrv.getVolumesTableData().then(function(result) {
            if(result && result.data && angular.isArray(result.data)){
                //过滤掉result.data中vol.instance="fixedImageInstanceName"的元素
                //result.data=result.data.filter(vol=>vol.instance[0]!="fixedImageInstanceName");
                result.data=result.data.filter(vol=>{
                    if(vol.name){
                        return vol.name.split("-")[0]!="fixedImageInstanceName"
                    }else{
                        return true;
                    }
                });
                result.data.map(item => {
                    item.statusCopy= $translate.instant("aws.volumes.table.status."+item.status);
                    item.multiattachCopy = $translate.instant('aws.volumes.table.multiattach.'+item.multiattach);
                    item.bootableCopy = $translate.instant('aws.volumes.table.bootable.'+item.bootable);
                    item.voltype =  item.storageInfo?item.storageInfo.disPlayName:"";
                    item._type=angular.copy(item.type);
                    if (item.description == null) {
                       item.description = '';
                    }else if(item.description == "auto-created_from_restore_from_backup"){
                        item.description = $translate.instant("aws.volumes.fromBackup");
                    }
                    if(angular.isArray(item.attachments) && item.attachments.length == 1 && item.attachments[0].device && item.attachments[0].device.slice(-2) == "da"){
                        item.root_device = true;
                    }
                }            );
                self.data_data = result.data.filter(volume => !(volume.bootable && volume.root_device) || (volume.imageMetadata&&volume.imageMetadata.disk_format == "iso"));
                self.data_data= self.data_data.filter(item => !( item.metaData && (item.metaData.image_cache_name || item.metaData.glance_image_id)) || (item.imageMetadata&&item.imageMetadata.disk_format == "iso"));
                self.data_data= self.data_data.filter(item => !(item.name&&item.name.indexOf("backup-vol") > -1));
                successFunc(self.data_data);
                
            }			
        });
    }
    self.getData()

    self.volume.initTablefunc = function(){
        self.getData()
    }
    $scope.$on("backupSocket",function(e,data){
        if( self.data_data.length){
            self.data_data.map(function(obj){
                if(obj.id === data.eventMata.volume_id){
                    obj.status = data.eventMata.status;
                }
            });
            if(data.eventType=='backup.restore.end'){
                self.getData()
            }
        }
        if(self.dataTableParams){
            self.dataTableParams.reload();
            self["checkboxes"+ "dataTableParams"].items={};
        }
        
    });
    $scope.$on("volumeSocket",function(e,data){
        if( self.data_data.length){
            self.data_data.map(function(obj){
                if(obj.id === data.eventMata.volume_id){
                    obj.status = data.eventMata.status;
                    if(obj.status == "deleted"){
                        _.remove(self.data_data,function(val){
                            return val.status =="deleted";
                        });
                    }
                    if(self.volumeSize && data.eventMata.status =="available"){         //更新扩容值
                        obj.size = self.volumeSize;
                        self.volumeSize = "";
                    }
                }
            });
        }
        if(self.dataTableParams){
            self.dataTableParams.reload();
            self["checkboxes"+ "dataTableParams"].items={};
        }
        
    });

    self.$watch(function(){
        return self.checkedItemsdataTableParams;
    },function(values){
        self.tablchk(values)    
    })
     //新建云硬盘改造
     self.addVolume = function(type){
        let templateUrl = localStorage.cinderService ? "js/cvm/volumes/tmpl/addVolume.html":"js/cvm/volumes/tmpl/addVolumeTip.html";
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: templateUrl,
            controller: localStorage.cinderService?"addVolumeCtrl":"",
            resolve: {
                initTable: function() {
                    return self.getData;
                },
                singleway:function(){
                    return type;
                }
            }
        });
    }

    self.insAnimation = "animateOut";
    self.newInstance = function(editData){
        if(!self.btn.canNewIns) return;
        var path = "/cvm/volumes?from=volume&volumeId="+editData.id
        $location.url(path);
        self.insAnimation = "animateIn";
        $("body").addClass("animate-open")
        // var path = "/quickconfig/createins?from=volume&volumeId="+editData.id
        // $location.url(path);
    }
    self.closeNewIns = function(){
        self.insAnimation = "animateOut";
        $("body").removeClass("animate-open");
        $location.url("/cvm/volumes");
    }

     //下拉框中的强制删除
     self.forceDelVolumes = function(checkedItems){
        if(!self.btn.canForeDel || self.btn.delisDisabled) return;
        var content = {
                target: "forceDeleteVolumes",
                msg: "<span>" + $translate.instant("aws.volumes.dv.confirmForce") + "</span>",
                data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("forceDeleteVolumes", function(e,data) {
        if (data.length == 1) {
            volumesDataSrv.cpDelOneVolumeAction(data[0].id).then(function() {
                //initDataVolumesTable();
            });
        } else if (data.length > 1) {
            //获取删除的卷id数组
            var volume_ids=[];
            _.forEach(data,function(item){
                volume_ids.push(item.id);
            });
            var delParams = {
                ids: volume_ids
            };
            volumesDataSrv.cpDelVolumes(delParams).then(function(){
                //initDataVolumesTable();
            });
        }
    });

    self.loadingVolume = function(editData,init) {
        if(!self.btn.canAttach) return;
        
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "loadingVolumeModel.html",
            controller: "loadingVolumeCtrl",
            resolve: {
                initDataVolumesTable: function() {
                    return init;
                },
                editData: function() {
                    return editData;
                }
            }
        });
        return modalInstance.result.then(function(post){
            if(post){
                self.data_data.map(item=>{
                    if(item.id == post.id){
                        item.status = "attaching"
                    }
                })
            }
        });
    };
    function checkScheduleJob(scope,data,volume_id,type){
        scope.show_del_job_tip = false;
        scope.getJobs = false;
        scope.jobIds =[];
        var checkData = {
            serverIds:[data.id],
            volumeId:volume_id
        }
        instancesSrv.checkSheduleJob(checkData).then(function(result){
            if(result && result.data){
                scope.jobIds = result.data;
                scope.getJobs = true;
                scope.show_del_job_tip = Boolean(result.data.length);
            }
            
        })
    }
    self.uninstallVolume = function(editData) { 

        if(!self.btn.canUnstall) return;
        let options = {};
        let scope = self.$new();
        let delInsName="";
        options.volumeId= editData.id;
        //调取详情列表，获取云硬盘加载的云主机
        volumesDataSrv.detailVolumeData(editData.id).then(function(result) {
            if(result && result.data){
                scope.volume_ins_id_list=result.data[0].insnameAndId;
                scope.volume_host=scope.volume_ins_id_list[0];
                options.serverId=scope.volume_host.id;
                delInsName=scope.volume_host.name;
                checkScheduleJob(scope,scope.volume_host,editData.id)
            }
        });
       
        scope.change_host=function(obj){
            options.serverId=obj.id;
            delInsName=obj.name;
            checkScheduleJob(scope,obj,editData.id)
        };


        let modalInstance2 =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "uninstallVolume.html",
            scope:scope
        });
        scope.confirm_unstall=function(){
            modalInstance2.close();
            volumesDataSrv.uninstallVolumeAction(options).then(function() {
            });
            if(scope.jobIds.length){
                var post = {
                    ids:scope.jobIds,
                    volumeId:editData.id
                }
                regularSnapSrv.updateTaskBack(post).then(function(){
                    
                })
            }
        };
        return modalInstance2.result.then(function(){
        });
    };
    //下拉框中的扩照
    self.expandVolumeSize = function(editData,init) {
        if(!self.btn.canExtend) return;
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "expandVolumeSizeModel.html",
            controller: "expandVolumeSizeCtrl",
            resolve: {
                initDataVolumesTable: function() {
                    return init;
                },
                editData: function() {
                    return editData;
                }
            }
        });
        return modalInstance.result.then(function(post){
            self.volumeSize = post;
        });
    };

    //备份
    self.volumeBackup = function(editData,init){
        if(!self.btn.canBackup || self.btn.hasTaskbackup) return;
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/volumes/tmpl/volumeBackup.html",
            controller: "volumeBackupCtrl",
            resolve: {
                initTable: function() {
                    return init;
                },
                editData: function() {
                    return editData;
                }
            }
        });
    }

    //下拉框中的创建快照
    self.createSnapshot = function(editData,init) {
        if(!self.btn.canCS || self.btn.hasTasksnapshot) return;
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "createSnapshotModel.html",
            controller: "createSnapshotCtrl",
            resolve: {
                initDataVolumesTable: function() {
                    return init;
                },
                editData: function() {
                    return editData;
                }
            }
        });
    };
    
}
function loadingVolumeCtrl($scope, volumesDataSrv, $uibModalInstance, $translate, initDataVolumesTable, editData){
    var self = $scope;
    self.canConfirm=false;

    function cantAttachedHost(insname){
        return self.havedHost.some(item=>{
            return item==insname
        });
        
    }
    volumesDataSrv.getHostAction().then(function(result) {
        if(result && result.data){
            volumesDataSrv.detailVolumeData(editData.id).then(function(res) {
                if(res && res.data){
                    self.havedHost=res.data[0].instance;
                }
                result.data=result.data.filter(item=>item.name!="fixedImageInstanceName");
                //result.data=result.data.filter(item=>item.status!="ERROR");  //云硬盘不能加载到错误的云主机上面
                result.data=result.data.filter(item=>item.status.toLowerCase()=="active" || item.status.toLowerCase()=="shutoff" || item.status.toLowerCase()=="paused" || item.status.toLowerCase()=="suspended" || item.status.toLowerCase()=="stopped"); 
                result.data=result.data.filter(item=> {
                    return !cantAttachedHost(item.name)
                });
                if(result.data.length>0){
                    self.hosts = result.data;
                    self.host= self.hosts[0];
                    self.canConfirm=true;
                }else{
                    self.host={};
                    self.hosts =[];
                }       
                    
                });
            
        }
    });

    self.diskDrives = [
        { id: "/dev/vdc", name: "scsi" },
        { id: "/dev/vdd", name: "virtio" },
        { id: "/dev/vde", name: "other" }
    ];
    
    self.diskDrive = self.diskDrives[0];
    self.changeHost=function(host){
        self.canConfirm=true;
        self.host=host;
    };
    /*self.changeDrive=function(diskDrive){
        self.diskDrive=diskDrive;
    };*/
    self.volumeConfirm = function() {
        var refresh=false;
        self.canConfirm=false;
        var options = {};
        options["volumeId"] = editData.id;
        if(self.host!=undefined){
            options["serverId"] = self.host.uid;
        }else{
            refresh=true;
            options["serverId"] = "";
        }
        options["device"] = self.diskDrive.id;
        volumesDataSrv.loadingVolumeAction(options).then(function(result) {
            if(result && !result.status){
                $uibModalInstance.close(editData);
            }else{
                $uibModalInstance.close();
            }
            if(refresh){
                initDataVolumesTable();
            }
           
        });
        
        
        
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initDataVolumesTable();
    };
}
function expandVolumeSizeCtrl($scope, volumesDataSrv, $translate, $uibModalInstance, initDataVolumesTable, editData){
    var self = $scope;
    var proTotalGig,proUsedGig,proRemainderGig;
    var depTotalGig,depUsedGig,depRemainderGig;	
    self.isShowDep=false;
    self.isShowPro=false;
    self.canConfirm=true;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.volumeForm =angular.copy(editData) ;
    var oldSize=editData.size;
    self.errorExpand={
        "cantExpandDep": $translate.instant("aws.volumes.errorMessage.cantExpandDep"),
        "cantExpandPro": $translate.instant("aws.volumes.errorMessage.cantExpandPro")
    };
    //判断项目总配额减去部门已使用的配额的函数
    var proGigFunc=function(value){
        volumesDataSrv.getProHave("gigabytes").then(function(result){
            if(result && result.data && result.data.length){
                proTotalGig=result.data[0].hardLimit;
            }
            volumesDataSrv.getProUsed("gigabytes").then(function(result){
                if(result && result.data && result.data.length){
                    proUsedGig=result.data[0].inUse;
                }else{
                    proUsedGig=0;
                }
                return proUsedGig;
            }).then(function(proUsedGig){
                proRemainderGig=parseInt(proTotalGig)-parseInt(proUsedGig);
                if(proRemainderGig<value){
                    self.isShowPro=true;
                    self.errorMessagePro=self.errorExpand.cantExpandPro;
                    self.canConfirm=false;	
                }
                self.project_data={
                    title:$translate.instant("aws.project.quota"),
                    inUsed:parseInt(proUsedGig),
                    beAdded:parseInt(value),
                    total:proTotalGig
                };	
            });
        });
    };

    //判断部门总配额减去部门已使用的配额的函数
    var depGigFunc=function(value){
        volumesDataSrv.getQuotaTotal("gigabytes").then(function(result){
            if(result && result.data && result.data.length){
                depTotalGig=result.data[0].hardLimit;
            }else{
                proGigFunc(value);
            }
            volumesDataSrv.getQuotaUsed("gigabytes").then(function(result){
                if(result && result.data && result.data.length){
                    depUsedGig=result.data[0].inUse;
                }else{
                    depUsedGig=0;
                }
                return depUsedGig;
            }).then(function(depUsedGig){
                depRemainderGig=parseInt(depTotalGig)-parseInt(depUsedGig);
                if(depRemainderGig<value){
                    self.isShowDep=true;
                    self.errorMessageDep=self.errorExpand.cantExpandDep;
                    self.canConfirm=false;
                    /*self.project_data={
                        title:$translate.instant("aws.project.quota"),
                        inUsed:parseInt(self.project_data.inUsed)+parseInt(value),
                        total:proTotalGig
                    };*/
                    proGigFunc(value);
                }else{
                    proGigFunc(value);
                }
                self.domain_data={
                    title:$translate.instant("aws.depart.quota"),
                    inUsed:parseInt(depUsedGig),
                    beAdded:parseInt(value),
                    total:depTotalGig
                };	
            });
        });
    };
    if(localStorage.permission=="enterprise"){
        depGigFunc(1);
    }

    self.isShowError=function(value){
        self.isShowDep=false;
        self.isShowPro=false;
        self.canConfirm=true;
        if(value!=undefined){
            var expandSize=parseInt(value)-parseInt(oldSize);
            depGigFunc(expandSize);
        }else{
            depGigFunc(1);
        }
    };
    self.volumeConfirm = function() {
        var postVolumeParams = {
            id: editData.id,
            size: parseInt(self.volumeForm.size)
        };
        
        var expandVolume=function(){
            $uibModalInstance.close(parseInt(self.volumeForm.size));
            self.canConfirm=true;
            volumesDataSrv.expandVolumeSizeAction(postVolumeParams).then(function() {
                //initVolumesTable();
            });
        };
        
        if (self.expandVolumeSize.$valid) {
            self.canConfirm=false;
            expandVolume();
        } else {
            self.submitted = true;
        }
    };
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initDataVolumesTable();
    };
}
function createSnapshotCtrl($scope, volumesDataSrv, $translate, $uibModalInstance, initDataVolumesTable, editData,checkedSrv){
    var self = $scope;
    var proTotalSnap,proUsedSnap,proRemainderSnap;
    var depTotalSnap,depUsedSnap,depRemainderSnap;
    self.canConfirm=true;
    self.isShowDepSnapNum=false;
    self.isShowProSnapNum=false;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.snapShot = {
        "volumeId": editData.id,
        "name": "",
        "description": ""
    };
    self.errorSnap={
        "depSnapGig": $translate.instant("aws.volumes.errorMessage.depSnapGig"),
        "proSanpGig":$translate.instant("aws.volumes.errorMessage.proSanpGig"),
        "depSnapNum":$translate.instant("aws.volumes.errorMessage.depSnapNum"),
        "proSnapNum":$translate.instant("aws.volumes.errorMessage.proSnapNum")
    };
    //判断项目快照的总配额数与已使用数的函数
    var proSnapFunc=function(){
        volumesDataSrv.getProHave("snapshots").then(function(result){
            if(result && result.data && result.data.length){
                proTotalSnap=result.data[0].hardLimit;
            }
            volumesDataSrv.getProUsed("snapshots").then(function(result){
                if(result && result.data && result.data.length){
                    proUsedSnap=result.data[0].inUse;
                }else{
                    proUsedSnap=0;
                }
                return proUsedSnap;
            }).then(function(proUsedSnap){
                proRemainderSnap=parseInt(proTotalSnap)-parseInt(proUsedSnap);
                if(proRemainderSnap<1){
                    self.isShowProSnapNum=true;
                    self.errorMessagePro=self.errorSnap.proSnapNum;
                    self.canConfirm=false;
                }
                self.project_data_snap={
                    title:$translate.instant("aws.project.quota"),
                    inUsed:proUsedSnap,
                    beAdded:1,
                    total:proTotalSnap
                };
            });
        });	
    };
    //判断部门快照的总配额数与已使用数的函数
    var depSnapFunc=function(){
        volumesDataSrv.getQuotaTotal("snapshots").then(function(result){
            if(result && result.data && result.data.length){
                depTotalSnap=result.data[0].hardLimit;
            }else{
                proSnapFunc();
            }
            volumesDataSrv.getQuotaUsed("snapshots").then(function(result){
                if(result && result.data && result.data.length){
                    depUsedSnap=result.data[0].inUse;
                }else{
                    depUsedSnap=0;
                }	
                return depUsedSnap;
            }).then(function(depUsedSnap){
                depRemainderSnap=parseInt(depTotalSnap)-parseInt(depUsedSnap);
                if(depRemainderSnap<1){
                    self.isShowDepSnapNum=true;
                    self.errorMessageDep=self.errorSnap.depSnapNum;
                    self.canConfirm=false;
                    proSnapFunc();
                }else{
                    proSnapFunc();
                }
                self.domain_data_snap={
                    title:$translate.instant("aws.depart.quota"),
                    inUsed:depUsedSnap,
                    beAdded:1,
                    total:depTotalSnap
                };
            });
        });
    };

    depSnapFunc();
    
    self.volumeConfirm = function() {
        
        self.postParams={
            "volumeId": editData.id,
            "name":self.snapShot.name,
            "description":self.snapShot.description
        };
        var createSnap=function(){
            $uibModalInstance.close();
            self.canConfirm=true;
            checkedSrv.setChkIds([editData.id],"snapshotcreate")
            volumesDataSrv.createSnapshotAction(self.postParams).then(function() {
                initDataVolumesTable();
            });
        };

        if (self.createVolumeForm.$valid) {
            self.canConfirm=false;
            createSnap();
        } else {
            self.submitted = true;
        }
    };
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };
}

export {dataVolumesCtrl,loadingVolumeCtrl,expandVolumeSizeCtrl,createSnapshotCtrl}
