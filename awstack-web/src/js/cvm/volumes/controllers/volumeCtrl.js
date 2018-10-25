
volumeController.$inject=['$scope', "$rootScope", 'volumesDataSrv', '$uibModalInstance', 'type', 'initTable', 'editData', '$translate','instancesSrv','storageSrv','$timeout','overviewSrv',"newCheckedSrv","vmFuncSrv"];
export function volumeController($scope, $rootScope, volumesDataSrv, $uibModalInstance, type, initTable, editData, $translate,instancesSrv,storageSrv,$timeout,overviewSrv,newCheckedSrv,vmFuncSrv){
    var self = $scope;
    localStorage.managementRole!=2?self.roleNumber=false:self.roleNumber=true;
    var proTotalVolumes,proUsedVolumes,proRemainderVolumes;
    var depTotalVolumes,depUsedVolumes,depRemainderVolumes;
    var proTotalGig,proUsedGig,proRemainderGig;
    var depTotalGig,depUsedGig,depRemainderGig;

    //当用户勾选“双活(hyperswap)”功能时，“分层(easytier)”功能不可选 
    //压缩(compression) 精简配置(rsize) 分层(easytier) 双活(hyperswap)
    //当同时存在“压缩”和“精简”时，勾选“压缩”会，联动勾选“精简”
    var chkDo = function(value,pre){
        if(value["hyperswap"]){
            self.fchk.dis["hyperswap"] = true;
            self.fchk.dis["easytier"] = true;
        }
        if(value["easytier"]){
            self.fchk.dis["hyperswap"] =true;
        }
        if(value["compression"] && value["rsize"]){
            self.fchk.dis["hyperswap"] =true;
        }
        if(value["compression"] && value["rsize"] == false){
            value["rsize"] = true;
        }
    }
    
    var init_createData = function() {
        return {
            "name": "",
            "size": "",
            "description": ""
        };
    };
    self.type = type;
    self.isShowDep=false;
    self.isShowPro=false;
    self.isShowDepVolumes=false;
    self.isShowProVolumes=false;
    self.submitted = false;
    self.canVolum=true;
    self.errorMessageDep="";
    self.errorMessagePro="";
    self.errorMessageDepVolumes="";
    self.errorMessageProVolumes="";
    self.showPriceTip = $rootScope.billingActive;
    self.priceHour = 0;
    self.priceHourAbout = 0;
    self.priceMonth = 0;
    self.page = {
        "newVolume": $translate.instant("aws.volumes.cv.newVolume"),
        "updateVolume": $translate.instant("aws.volumes.cv.updateVolume"),
        "cantCreate":$translate.instant("aws.volumes.errorMessage.cantCreate"),
        "moreThanDepGig":$translate.instant("aws.volumes.errorMessage.moreThanDepGig"),
        "moreThanProGig":$translate.instant("aws.volumes.errorMessage.moreThanProGig"),
        "moreThanDepVolumes":$translate.instant("aws.volumes.errorMessage.moreThanDepVolumes"),
        "moreThanProVolumes":$translate.instant("aws.volumes.errorMessage.moreThanProVolumes")
    };
    self.storage = {};
    self.fchk = {
        items: {},
        dis:{}
    };
    
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };

    //存储服务
    self = vmFuncSrv.storageFunc(self,instancesSrv,storageSrv);

    self.changeStorage = function(item){
        self.nomore_voltype = false;
        self.storage.storagepoolShow = false;
        self.storageFeatures = [];
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            self.getToyouDevice(getToyouVolumeCharacter)
        }
        self.poolInfo(item,pollInfoCallBackFunc);
        self.storage.storagepoolShow = true;     
    }

    self.isShowError=function(value){
        self.isShowDep=false;
        self.isShowPro=false;;
        if(value!=undefined){
            depGigFunc(value);
            getVolumeAmount(value);
        }else{
            depGigFunc(0);
            // 计费置为0
            self.priceHour = 0;
            self.priceHourAbout = 0;
            self.priceMonth = 0;
        }
        self.checkVolumFun(self.volumeForm.size || 0)
        depVolumesFunc(1);
    };

    //选择存储特性
    self.$watch(function(){
        return self.fchk.items
    },function(value,pre){
        if(value){
            self.fchk.dis = {};
            chkDo(value,pre)
        }
    },true)

    function pollInfoCallBackFunc(){
        self.checkVolumFun(self.volumeForm.size || 0);
        self.poolsInfo_data.title = "存储池容量 (TB)";
    } 

    function getToyouVolumeCharacter(device){
        self.toyouDevice = device;
        var postData = {
            "id": device[0],
            "Storage_name": device[1]
        }
        //获取该资源池支持的存储特性
        storageSrv.getFeatures(postData).then(function(result){
            if(result && result.data &&  angular.isArray(result.data.Storage_characters)){
                self.storageFeatures = result.data.Storage_characters;
                self.fchk.items = {};
                //self.storageFeatures = ["compression","rsize"]
                self.storageFeatures.map(item => {
                    item = item.toLowerCase();
                    //当没有“双活(hyperswap)”特性时，页面默认，是不勾选任何特性
                    //如果双活(hyperswap)，默认选中
                    self.fchk.items[item] = false;
                    if(item =="hyperswap"){
                        self.fchk.items[item] = true;
                    }
                    
                })
            }
        })
    }

    // 计费信息
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
        
    switch (type) {
        case "new":
        case "backup":
            self.volumeModal_title = self.page.newVolume;
            self.volumeForm = init_createData();
            if(type == "backup"){
                self.volumeForm.size = editData?editData.size:"";
                var option = {
                    volumeSize: editData.size,
                    region: localStorage.regionName || "default"
                };
                vmFuncSrv.bossSourceFunc(self,editData.size,option,"queryChdChargingAmount")
            }
           
            self.nomore_voltype = false;
            self.volumeForm.multiattach = false;
            self.getStorage(pollInfoCallBackFunc,getToyouVolumeCharacter);
            break;
        case "edit":
        case "systemEdit":
            self.volumeModal_title = self.page.updateVolume;
            self.volumeForm = editData;
            break;
    }
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
                proTotalGig=result.data[0].hardLimit; //当前项目配额总数
            }
            volumesDataSrv.getProUsed("gigabytes").then(function(result){
                if(result && result.data && result.data.length){
                    proUsedGig=result.data[0].inUse; //当前项目已使用的 
                }else{
                    proUsedGig=0;
                }	
                return proUsedGig;
            }).then(function(proUsedGig){
                proRemainderGig=parseInt(proTotalGig)-parseInt(proUsedGig); //当前项目剩余的配额数
                if(proRemainderGig<value){  
                    self.isShowPro=true;
                    self.errorMessagePro=self.page.moreThanProGig;
                }

                self.project_data={
                    title:$translate.instant("aws.project.quota")+ " (GB)",
                    inUsed:parseInt(proUsedGig),
                    beAdded:parseInt(value),
                    total:proTotalGig
                };
            });
            
        });
    };
    //判断部门gigabytes总配额减去部门已使用的配额的函数
    var depGigFunc=function(value){
        volumesDataSrv.getQuotaTotal("gigabytes").then(function(result){
            if(result && result.data && result.data.length){
                depTotalGig=result.data[0].hardLimit; //当前部门配额总数
            }else{
                proGigFunc(value);
            }
            volumesDataSrv.getQuotaUsed("gigabytes").then(function(result){
                if(result && result.data && result.data.length){
                    depUsedGig=result.data[0].inUse;  //当前部门已使用的配额数
                }else{
                    depUsedGig=0;
                }
                return depUsedGig;
            }).then(function(depUsedGig){
                depRemainderGig=parseInt(depTotalGig)-parseInt(depUsedGig);
                if(depRemainderGig<value){
                    self.isShowDep=true;
                    self.errorMessageDep=self.page.moreThanDepGig;
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
                    title:$translate.instant("aws.depart.quota")+ " (GB)",
                    inUsed:parseInt(depUsedGig),
                    beAdded:parseInt(value),
                    total:depTotalGig
                };
            });
        });
    };
    
    var postfunc = function(postVolumeParams,from="new"){
        postVolumeParams.multiattach=self.volumeForm.multiattach;
        postVolumeParams.volume_type=self.volumeForm.storageSelected;
        if(self.type == "backup"){
            if(from == "backup"){
                var post = {
                    multiattach:self.volumeForm.multiattach,
                    volumeType:self.volumeForm.storageSelected,
                    name:postVolumeParams.name,
                    backupName:postVolumeParams.backupName
                }
                newCheckedSrv.setChkIds([postVolumeParams.backupId],"backuprestore")
                volumesDataSrv.formBackupVolume(post,postVolumeParams.backupId).then(function() {
                    
                });
            }
            
        }else{
            volumesDataSrv.addVolumesAction(postVolumeParams).then(function() {
                initTable();
            });
        }
       
        $uibModalInstance.close();;
    };
    var editpostfunc = function(postVolumeParams,initTable){
        postVolumeParams.id = editData.id;
        volumesDataSrv.editVolumeAction(postVolumeParams).then(function() {
            initTable();
        });
        $uibModalInstance.close();
    }
    //判断是否可点击的函数
    $scope.volumeConfirm = function() {
        var postVolumeParams = {
            name: self.volumeForm.name,
            size: self.volumeForm.size,
            description: self.volumeForm.description,
        };
        if(type=="new" || type=="backup"){
            if(self.storage.storageDeviceSelected.name.indexOf("toyou") == -1){
                if (self.createVolumeForm.$valid) {
                    self.volumeForm.storageSelected = self.storage.storageDeviceSelected.volumeTypeId;
                    postfunc(postVolumeParams);
                    self.cantSubmit=true;
                }else{
                    self.submitted = true;
                    self.cantSubmit=false;
                }
            }else if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
                var posta = {
                    "Vendor": "TOYOU",
                    "Storage_name": self.toyouDevice[1],
                    "Pool_name": self.toyouDevice[2],
                    "Character_message": { //这四个特性，1为支持，0为不支持。可以为空字典或者不传
                        "compression": Number(self.fchk.items.compression) || 0,
                         "rsize" :Number(self.fchk.items.rsize) || 0,
                         "easytier":Number(self.fchk.items.easytier) || 0,
                         "hyperswap":Number(self.fchk.items.hyperswap) || 0
                    }
                };
                storageSrv.getVoltype(posta).then(function(result){
                    if(result && result.data){
                        self.volumeForm.storageSelected = result.data.volume_type_id;
                    }
                    return self.volumeForm.storageSelected
                }).then(function(value){
                    if (self.createVolumeForm.$valid && value) {
                        postfunc(postVolumeParams);
                    } else if(!self.createVolumeForm.$valid){
                        self.submitted = true;
                        self.cantSubmit=false;
                    } else{
                        self.nomore_voltype = true;
                        $timeout(function(){
                            self.nomore_voltype = false;
                        }, 5000);
                        self.cantSubmit=false;
                    }
                })
            }
            //备份创建云硬盘
            if(type == "backup"){
                if(self.createVolumeForm.$valid){
                    postVolumeParams.backupName = editData.name;
                    postVolumeParams.backupId = editData.id;
                    postfunc(postVolumeParams,"backup");
                }
                
            }
        }else{
            if (self.createVolumeForm.$valid){
                postVolumeParams.bootable = self.volumeForm.bootable;
                editpostfunc(postVolumeParams,initTable);
                self.cantSubmit=true;
            }else{
                self.submitted = true;
                self.cantSubmit=false;
            }
        }
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };
    self.canConfirm = function(){
       return !self.isShowDep && !self.isShowPro && !self.isShowDepVolumes && !self.isShowProVolumes && !self.centralizedtip && !self.cantSubmit
    };
    self.canConfirmEdit=function(){
        return !self.cantSubmit
    };

    depVolumesFunc(1);
    depGigFunc(1);
    
}
