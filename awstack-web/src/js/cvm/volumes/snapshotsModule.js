import "./snapshotsSrv";
import "./volumesSrv";

var snapshotsModule = angular.module("snapshotsModule", ["snapshotssrv"])
    .controller("SnapshotsCtrl", ['$routeParams','$scope', '$rootScope', '$translate', 'NgTableParams', 'alertSrv', '$location', '$uibModal', 'checkedSrv', 'snapshotsDataSrv','GLOBAL_CONFIG','volumesDataSrv','$filter',function($routeParams,$scope, $rootScope, $translate, NgTableParams, alertSrv, $location, $uibModal, checkedSrv, snapshotsDataSrv,GLOBAL_CONFIG,volumesDataSrv,$filter) {
        var self = $scope;
        self.canSnapShot=false;
        self.isDisabled = true;
        if(localStorage.permission == "enterprise"){
            self.isEnterprise = true
        }
        self.menuGuide = [$translate.instant('aws.menu.System'),$translate.instant('aws.menu.System_Operation'),$translate.instant('aws.menu.System_Storage')];
        self.headers = {
            "snapshotName": $translate.instant("aws.snapshots.snapshotName"),
            "projectName": $translate.instant("aws.volumes.projectName"),
            "volume": $translate.instant("aws.volumes.volumeName"),
            "size": $translate.instant("aws.snapshots.size"),
            "status": $translate.instant("aws.volumes.status"),
            "description": $translate.instant("aws.snapshots.description"),
            "type": $translate.instant("aws.volumes.type")
        };

        //tab
        self.active=0;
        self.changeActive=function(num){
        	if(!self.canSnapShot){
        		return ;
        	}
        	self.loadData1 = undefined;
        	self.loadData2 = undefined;
        	self.dataTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:[]});
        	self.sysTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:[]});
            self.active=num;
            initSnapShotForm();
        }
        
        self.snapshot_search={};

        self.newInstance = function(editData) {
            self.insAnimation = "animateOut";
            var path = "/cvm/snapshots?from=snapshot&snapshotId="+editData.id
            $location.url(path);
            self.insAnimation = "animateIn";
            $("body").addClass("animate-open")
            // var path = "/quickconfig/createins?from=snapshot&snapshotId="+editData.id
            // $location.url(path);
        };
        self.closeNewIns = function(){
            self.insAnimation = "animateOut";
            $("body").removeClass("animate-open");
            $location.url("/cvm/snapshots");
        }
        function successFuncData(data) {
            self.snapshot_search.globalSearchTerm="";
            data.map(function(item){
                item.status_ori=$translate.instant("aws.snapshots.table.status."+item.status);
                var date = $filter("date")(item.created,"MMddHHmm");
                if (item.name.indexOf("_")<0) {
                    item.name = item.name + "  (" + date + ")";
                }
                item.searchTerm = item.name +item.volumeName + item.size+item.status_ori;
            });
            self.tabledata = data ;
            self.dataTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:self.tabledata });
            self.applyGlobalSearch = function() {
                var term = self.snapshot_search.globalSearchTerm;
                self.dataTable.filter({searchTerm: term });
            };
            var tableId = "id";
            checkedSrv.checkDo(self, data, tableId ,"dataTable");
            self.$watch(function() {
                return self.checkedItems;
            }, function(values) {
                self.canCV = false;
                self.btn = {};
                if(!values) return;
                if (values.length > 1) {
                    for (var i = 0; i < values.length; i++) {
                        canDelFunc(values[i]);
                        if (self.canDel == false) {
                            self.canDel = false;
                            break;
                        }
                    }
                } 
                if (values.length == 1) {
                    self.btn.limit = values[0].storageLimit;
                    self.storageTypeTip = $translate.instant("aws.snapshots.tip.tip1");
                    if(self.btn.limit["volumes_snapshots"]) canCVFunc(values[0]);
                    canDelFunc(values[0]);
                }else{
                    self.storageTypeTip=$translate.instant("aws.snapshots.tip.tip3");
                }
                if(values.length == 0){
                    self.canDel = false;
                }
            });
        }
        function canDelFunc(obj) {
            self.canDel = true;
            var cantDelArray = ["error_deleting"];
            _.forEach(cantDelArray, function(item) {
                if (obj.status == item) {
                    self.canDel = false;
                }
            });
        }

        function canCVFunc(obj) {
            self.canCV = true;
            if (obj.status != "available") {
                self.canCV = false;
                self.CVTip = $translate.instant("aws.snapshots.tip.tip2");
                return
            }
        }

        function successFuncSys(data) {
            self.snapshot_search.globalSearchTerm="";
            data.map(function(item){
                item.status_ori=$translate.instant("aws.snapshots.table.status."+item.status);
                var date = $filter("date")(item.created,"MMddHHmm");
                if (item.name.indexOf("_")<0) {
                    item.name = item.name + "  (" + date + ")";
                }
                item.searchTerm = item.name +item.volumeName + item.size+item.status_ori;
            });
            self.tabledata = data ;
            self.sysTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:self.tabledata });
            self.applyGlobalSearch = function() {
                var term = self.snapshot_search.globalSearchTerm;
                self.sysTable.filter({searchTerm: term });
            };
            var tableId = "id";
            checkedSrv.checkDo(self, data, tableId,"sysTable");
        }
        var dataSnapShotForm = function() {
                self.canSnapShot=false;
                snapshotsDataSrv.getSnapshotsTableData().then(function(result) {
                    var dataSnap=[];

                    if(result && result.data){
                        result.data.forEach((x) => {
                            if(!x.bootTable){
                                dataSnap.push(x);
                            }
                        })
                        successFuncData(dataSnap);
                    }
                    self.loadData1 = dataSnap;
                }).finally(function(){
                    self.canSnapShot=true;
                })
        };
        var sysSnapShotForm = function() {
                self.canSnapShot=false;
                snapshotsDataSrv.getSnapshotsTableData().then(function(result) {
                    var sysSnap=[];
                    if(result && result.data){
                        result.data.forEach((x) => {
                            if(x.bootTable){
                                sysSnap.push(x);
                            }
                        })
                        successFuncSys(sysSnap);
                        
                    }
                    self.loadData2 = sysSnap;
                }).finally(function(){
                    self.canSnapShot=true;
                })  
        };

        

        function initSnapShotForm(){
            if(!self.services.cinder) return;
            if(self.active==0){
                if(self.canSnapShot){
                    dataSnapShotForm();
                }
            }else{
                if(self.canSnapShot){
                    sysSnapShotForm();  
                } 
            }
        }

        localStorage.cinderService?dataSnapShotForm():"";

        $scope.refreshSnap=function(){
            initSnapShotForm();
            
        };

        $scope.$on("getDetail", function(event, value) {
            snapshotsDataSrv.snapShotDetailAction(value).then(function(result) {
                //result.data[0].description=decodeURI(result.data[0].description);
                if(result && result.data && result.data.length){
                    if($routeParams.id!=value){return;}
                    $scope.detailData = result.data[0];
                }else{
                    $scope.detailData={};
                }

            });
        });

        $scope.$on("snapSocket",function(e,data){
            if (self.tabledata) {
                self.tabledata.map(function(obj){
                    if(obj.id === data.eventMata.snapshot_id){
                        obj.status = data.eventMata.status;
                        if(obj.status == "deleted"){
                            _.remove(self.tabledata,function(val){
                                return val.status =="deleted";
                            });
                        }
                    }
                });
            }
            
            //启动云硬盘
            if(data.eventType == "volume.create.start"){  //开始卸载云硬盘或开始加载云硬盘
                var tipMsg4 = data.resourceName + $translate.instant("aws.sockets.opLog."+ data.eventType);
                alertSrv.set(data.requestId, tipMsg4 , "building",5000);
            }
            if(data.eventType == "volume.create.end"){  
                var tipMsg5 = data.resourceName + $translate.instant("aws.sockets.opLog."+ data.eventType);
                alertSrv.set(data.requestId, tipMsg5 , "success",5000);
            }
            if(self.active==0 && self.dataTable){
                    self.dataTable.reload();
            }else if(self.active==1&& self.sysTable){
                    self.sysTable.reload();
            }
            
        });

        self.deleteSnapshots = function(checkedItems) {

            var content = {
                target: "deleteSnapshots",
                msg: "<span>" + $translate.instant("aws.snapshots.confirmDelete") + "</span>",
                data: checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("deleteSnapshots", function(e,data) {
            if (data.length == 1) {
                checkedSrv.setChkIds([data[0].id],"snapshotdelete");
                snapshotsDataSrv.delOneSnapshotAction(data[0].id).then(function() {
                    initSnapShotForm();
                });
            } else {
                var snapshot_ids=[];
                //获取删除的快照ids
                _.forEach(data,function(item){
                    snapshot_ids.push(item.id);
                });
                var del_params={
                    ids:snapshot_ids
                };
                checkedSrv.setChkIds(del_params.ids,"snapshotdelete");
                snapshotsDataSrv.delSnapshots(del_params).then(function(){
                    initSnapShotForm();
                });
            }
            initSnapShotForm();
        });
        $scope.enabledVolume = function(editData) {
            if(!self.canCV) return;
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "enabledVolumeModel.html",
                controller: "enabledVolumeCtrl",
                resolve: {
                    initSnapShotForm: function() {
                        return initSnapShotForm;
                    },
                    editData: function() {
                        return editData;
                    },
                    selectedItems:function(){
                        return self.checkboxes;
                    }
                }
            });
        };
    }]);

snapshotsModule.controller("enabledVolumeCtrl", ['$scope', '$rootScope', '$translate', 'snapshotsDataSrv', 'volumesDataSrv','$uibModalInstance', 'initSnapShotForm', 'editData','selectedItems',function($scope, $rootScope, $translate, snapshotsDataSrv, volumesDataSrv,$uibModalInstance, initSnapShotForm, editData,selectedItems) {
    var self = $scope;
    var proTotalGig,proUsedGig,proRemainderGig;
    var depTotalGig,depUsedGig,depRemainderGig;
    var proTotalVolumes,proUsedVolumes,proRemainderVolumes;
    var depTotalVolumes,depUsedVolumes,depRemainderVolumes;
    self.isShowDep=false;
    self.isShowPro=false;
    self.isShowDepVolumes=false;
    self.isShowProVolumes=false;  
    self.showPriceTip = $rootScope.billingActive;
    self.priceHour = 0;
    self.priceHourAbout = 0;
    self.priceMonth = 0;
    //用系统盘创建云硬盘时，不能选择共享卷。
    if(editData.status == "available" && editData.bootTable == true){
        self.root_device_not_shared = false
    }else{
        if(editData.type.indexOf('ceph')==-1){
            self.root_device_not_shared =false;
        }else{
            self.root_device_not_shared = true;
        }   
    }
    //self.canConfirm=true;
    self.page = {
        "newVolume": $translate.instant("aws.volumes.cv.newVolume"),
        "updateVolume": $translate.instant("aws.volumes.cv.updateVolume"),
        "cantCreate":$translate.instant("aws.volumes.errorMessage.cantCreate"),
        "moreThanDepGig":$translate.instant("aws.volumes.errorMessage.moreThanDepGig"),
        "moreThanProGig":$translate.instant("aws.volumes.errorMessage.moreThanProGig"),
        "moreThanDepVolumes":$translate.instant("aws.volumes.errorMessage.moreThanDepVolumes"),
        "moreThanProVolumes":$translate.instant("aws.volumes.errorMessage.moreThanProVolumes")
    };
    self.errorMess = {
        "snapshotDep":$translate.instant("aws.volumes.errorMessage.snapshotDep"),
        "snapshotPro":$translate.instant("aws.volumes.errorMessage.snapshotPro")
    };
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    //判断项目volumes总配额减去部门已使用的配额的函数
    var proVolumesFunc=function(value){
        volumesDataSrv.getProHave("volumes").then(function(result){
            if(result && result.data && result.data.length){
                proTotalVolumes=result.data[0].hardLimit; //当前项目配额总数
            }
            volumesDataSrv.getProUsed("volumes").then(function(result){
                if(result && result.data && result.data.length){
                    proUsedVolumes=result.data[0].inUse; //当前项目已使用的 
                }else{
                    proUsedVolumes=0;
                }   
                return proUsedVolumes;
            }).then(function(proUsedVolumes){
                proRemainderVolumes=parseInt(proTotalVolumes)-parseInt(proUsedVolumes); //当前项目剩余的配额数
                if(proRemainderVolumes<value){  
                    self.isShowProVolumes=true;
                    self.errorMessageProVolumes=self.page.moreThanProVolumes;
                }

                self.project_data_volumes={
                    title:$translate.instant("aws.project.quota"),
                    inUsed:parseInt(proUsedVolumes),
                    beAdded:parseInt(value),
                    total:proTotalVolumes
                };
            });
            
        });
    };

    //判断部门volumes总配额减去部门已使用的配额的函数
    var depVolumesFunc=function(value){
        volumesDataSrv.getQuotaTotal("volumes").then(function(result){
            if(result && result.data && result.data.length){
                depTotalVolumes=result.data[0].hardLimit; //当前部门配额总数
            }else{
                proVolumesFunc(value);
            }
            volumesDataSrv.getQuotaUsed("volumes").then(function(result){
                if(result && result.data && result.data.length){
                    depUsedVolumes=result.data[0].inUse;  //当前部门已使用的配额数
                }else{
                    depUsedVolumes=0;
                }
                return depUsedVolumes;
            }).then(function(depUsedVolumes){
                depRemainderVolumes=parseInt(depTotalVolumes)-parseInt(depUsedVolumes);
                if(depRemainderVolumes<value){
                    self.isShowDepVolumes=true;
                    self.errorMessageDepVolumes=self.page.moreThanDepVolumes;
                    /*self.project_data={
                        title:$translate.instant("aws.project.quota"),
                        inUsed:parseInt(self.project_data.inUsed)+parseInt(value),
                        total:proTotalGig
                    };*/
                    proVolumesFunc(value);
                }else{
                    proVolumesFunc(value);
                }
                self.domain_data_volumes={
                    title:$translate.instant("aws.depart.quota"),
                    inUsed:parseInt(depUsedVolumes),
                    beAdded:parseInt(value),
                    total:depTotalVolumes
                };
            });
        });
    };
    //判断项目gigabytes总配额减去部门已使用的配额的函数
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
                    self.errorMessagePro=self.errorMess.snapshotPro;
                   // self.canConfirm=false;
                }
                self.project_data={
                    title:$translate.instant("aws.project.quota") + "（GB）",
                    inUsed:parseInt(proUsedGig),
                    beAdded:parseInt(value),
                    total:proTotalGig
                };
            });
            
        });
    };
    //判断部门总配额gigabytes减去部门已使用的配额的函数
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
                    self.errorMessageDep=self.errorMess.snapshotDep;
                    //self.canConfirm=false;
                    proGigFunc(value);
                }else{
                    proGigFunc(value);
                }
                self.domain_data={
                    title:$translate.instant("aws.depart.quota") + "（GB）",
                    inUsed:parseInt(depUsedGig),
                    beAdded:parseInt(value),
                    total:depTotalGig
                };
            });
        });
    };
    if(localStorage.permission=="enterprise"){
        depGigFunc(editData.size);
        depVolumesFunc(1);
    }

    // 计费信息
    getVolumeAmount(editData.size);
    function getVolumeAmount(value) {
        if(!self.showPriceTip) {
            return;
        }
        var option = {
            volumeSize: value,
            region: localStorage.regionName || "default"
        }
        volumesDataSrv.getVolumeAmount(option).then(function(result) {
            if(result && result.data && !isNaN(result.data)) {
                self.priceHour = result.data;
                self.priceHourAbout = result.data.toFixed(2);
                self.priceMonth = (result.data * 24 * 30).toFixed(2);
            }
        });
    }
    
    self.isShowError=function(value){
        self.isShowDep=false;
        self.isShowPro=false;
       // self.canConfirm=true;
        if(value){
            depGigFunc(value);
            getVolumeAmount(value);
        }else{
            depGigFunc(editData.size);
            getVolumeAmount(editData.size);
        }
        depVolumesFunc(1);
    };
    var init_createData = function() {
        return {
            "name": "",
            "description": "",
            "size":editData.size
        };
    };
    self.volumeForm=init_createData();
    self.volumeForm.multiattach=false;
    self.canConfirm = function(){
       return !self.isShowDep && !self.isShowPro && !self.isShowDepVolumes && !self.isShowProVolumes  && !self.cantSubmit
    };
    self.volumeConfirm = function() {
        /*if(!self.volumeForm.size){
            self.volumeForm.size=parseInt(editData.size);
        }*/
        var postVolumeParams = {
            snapshotId: editData.id,
            name: self.volumeForm.name,
            description: self.volumeForm.description,
            size:parseInt(self.volumeForm.size),
            multiattach:self.volumeForm.multiattach
        };
        if(!postVolumeParams.size){
            postVolumeParams.size=parseInt(editData.size);
        }
        var enableVolume=function(){
            $uibModalInstance.close();
            //self.canConfirm=true;
            snapshotsDataSrv.enabledVolumeAction(postVolumeParams).then(function() {
                initSnapShotForm();
            }); 
        };
        if(self.createVolumeForm.$valid){
            self.cantSubmit=true;
           // self.canConfirm=false;   
            enableVolume(); 
        }else{
            self.submitted = true;
            self.cantSubmit=false;
        }   
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        selectedItems.items={};
    };
}]);

snapshotsModule.directive("oldsizesnap",[function(){
    return {
        restrict:"A",
        require:"ngModel",
        link:function(scope,ele,attrs,expandVolumeSizeCtrl){
            var tempSize=scope.volumeForm.size;
            function judgeSize(viewValue){
                if(!viewValue){
                    expandVolumeSizeCtrl.$setValidity("oldsizesnap",true);
                    return viewValue;
                }
                
                if(viewValue<tempSize){
                    expandVolumeSizeCtrl.$setValidity("oldsizesnap",false);
                }else{
                    expandVolumeSizeCtrl.$setValidity("oldsizesnap",true);
                }   
                return viewValue;
            }
            judgeSize();
            expandVolumeSizeCtrl.$parsers.push(judgeSize);
        }
    };
}]);
