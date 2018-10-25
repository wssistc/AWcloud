import "./createInsSrv";
import {
    easyCtrl
} from "../../easyReform/controllers/easyCtrl";

let createInsModule = angular.module("definedInsModule", ["commonFuncModule", "createInsSrvModule", "ngFileSaver"]);
function defineCreateInsCtrl(self, $rootScope, NgTableParams, $translate, $filter, $location, $routeParams, 
    $uibModal, flavorsSrv, imagesSrv, snapshotsDataSrv, checkQuotaSrv,securityGroupSrv, networksSrv, instancesSrv, 
    commonFuncSrv, keyPairsSrv, FileSaver, Blob,createInsSrv,$timeout) {
    self.currStep = 1;
    self.submitInValid = false;
    self.showPrice = false;
    self.regionName = localStorage.regionName;
    self.createInsForm.ephemeral = "";
    //PaaS服务
    self.supportCloudSecurity?self.cloud_security = true:self.cloud_security = false;
    self.supportCOC?self.COC = true:self.COC = false;
    self.interacted = function(field) {
        if(field && field.ip_0 && field.ip_1 && field.ip_2 && field.ip_3 && self.field_form){
            self.field_form.step3InsForm = field;
            return self.submitInValid || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
        }
    };
    if($rootScope.billingActive){
        self.showPrice = true;
    }
    
    //获取创建私有网络func
    easyCtrl(self, $rootScope, $translate, $uibModal, $location);
    
    //新建私有网络后，重新获取网络数据
    self.$watch(function() {
        return commonFuncSrv.reGetNetList;
    }, function(reGetNetList) {
        if (reGetNetList) {
            self = commonFuncSrv.setAssignIpFun(self, "definedInsNet", "step3InsForm","private");
            commonFuncSrv.reGetNetList = false;
        }
    }, true);
    
    self.$on("showPrice",function(f1,flag){
        if($rootScope.billingActive){
            self.showPrice = flag
        }
    })
    //获取flavor规格列表
    self.getInsFlavors = function() {
        flavorsSrv.getFlavors().then(function(result) {
            result ? self.loadFlavorData = true : "";
            if (result && result.data && angular.isArray(result.data)) {
                result.data.forEach(function(item) {
                    item.ram_gb = (item.ram / 1024).toFixed(1);
                    if (item.ram_gb.split(".")[1] == "0") {
                        item.ram_gb = item.ram_gb.split(".")[0];
                    }
                    item.ram_gb = Number(item.ram_gb);
                });
                self.flavorSpecific.flavorCopy = result.data;
                initFlavorSpecificCpu(result.data)
            }
        });
    };
    function initFlavorSpecificCpu(data){
        //data = self.filterFlavorFromBoot(data);
        self.flavorSpecific.cpu = [];
        data.map(item=>{
            if( self.flavorSpecific.cpu.indexOf(item.vcpus) == -1){
                self.flavorSpecific.cpu.push(item.vcpus)
            }
            return item
        })
        self.flavorSpecific.cpu.sort(function (x,y) {
            return x-y;
        })
        self.selectCpu(self.flavorSpecific.cpu[0])
    }

    function initFlavorSpecificRam(cpu){
        var dataset =[];
        //dataset = self.filterFlavorFromBoot(self.flavorSpecific.flavorCopy);
        dataset = self.flavorSpecific.flavorCopy
        self.flavorSpecific.ram = [];
        dataset.map(item => {
            if(item.vcpus == cpu){
                if( self.flavorSpecific.ram.indexOf(item.ram_gb) == -1){
                    self.flavorSpecific.ram.push(item.ram_gb)
                }
            }
        })
        self.flavorSpecific.ram.sort(function (x,y) {
            return x-y;
        })
        self.selectRam(self.flavorSpecific.ram[0])
    }

    function chooseCpuMemValidate(data,flag){
        self.getPrice(data.vcpus,data.ram_gb,self.currStep)
        self.testProQuotaFunc(data, self.insForm.hostNum);
        self.testDomQuotaFunc(data, self.insForm.hostNum);
    }
    function initFlavorsTable(){
        var data = self.flavorSpecific.flavorCopy.filter(item => (item.vcpus == self.flavorSpecific.cpuSelect && item.ram_gb == self.flavorSpecific.ramSelect));
        self.initFlavorTable(data)
        chooseCpuMemValidate(self.createInsForm.selectedFlavor);
    }
    
    self.changeFlavor = function(val) {
        val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.core") + val.ram + "GB ";
        self.createInsForm.selectedFlavor = val;
        chooseCpuMemValidate(self.createInsForm.selectedFlavor);
    };
    self.selectCpu = function(cpu){
        self.flavorSpecific.cpuSelect = cpu;
        initFlavorSpecificRam(cpu)
    }
    self.selectRam = function(ram){
        self.flavorSpecific.ramSelect = ram;
        initFlavorsTable();
       
    }
    //重写函数
    self.changeStorage = function(item){
        self.nomore_voltype = false;
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            self.getToyouDevice(self.getToyouVolumeCharacter)
       }
        self.poolInfo(item,self.pollInfoCallBackFunc);
    };

    self.checkAllVolumPoolFun = function() {
        self.getPrice(self.flavorSpecific.cpuSelect,self.flavorSpecific.ramSelect,2); //更新价格
        self.exceedPools = false;
        self.exceedPoolsText = "";
        let size_name = {};
        let array = self.createInsForm.dataDiskArray.filter(item => item.device.id != "has");
        array.map(val => {
            var data = self.poolDataTranslate(val.device);
            if(!size_name[val.device.volumeTypeId]){
                size_name[val.device.volumeTypeId] = {
                    size:0,
                    inUsed:Number(data[0]),
                    total:Number(data[1]),
                    name:val.device.disPlayName
                }
            } 
        })
        if(self.storage.isUseLocal ==2 && self.storage.storageDeviceSelected && size_name[self.storage.storageDeviceSelected.volumeTypeId]){
            switch(self.options.imgSrc){
                case "img":
                    size_name[self.storage.storageDeviceSelected.volumeTypeId].size += Number(self.createInsForm.sysVolumeSize||0)
                    break;
                case "snap":
                    size_name[self.storage.storageDeviceSelected.volumeTypeId].size += Number(self.createInsForm.selectedSnap.size||0)
                    break;
                case "backup":
                    size_name[self.storage.storageDeviceSelected.volumeTypeId].size += Number(self.createInsForm.selectedBackup.size||0)
                    break;
            }
        }
        array.map(item => {
            size_name[item.device.volumeTypeId].size += Number(item.size || 0);
        })
        for (var value in size_name){
            if(size_name[value].size*self.insForm.hostNum + size_name[value].inUsed >  size_name[value].total){
                self.exceedPools = true;
                self.exceedPoolsText = size_name[value].name
                break;
            }
        }

        // for (let value of Object.values(size_name)) {
        //     if(value.size*self.insForm.hostNum + value.inUsed >  value.total){
        //         self.exceedPools = true;
        //         self.exceedPoolsText = value.name
        //         break;
        //     }
        // }
        
    };
    self.$on("initFlavor",function(e){
        if(self.flavorSpecific.flavorCopy){
            self.chooseBoot(self.storage.isUseLocal)
        }
    })
    
    self.chooseBoot = function(uselocal){
        if(self.source.fromSnapshot || self.source.fromVolume || self.source.fromBackup) return;
        self.storage.isUseLocal = uselocal;
        self.options.imgSrc = "img";
        if(self.storage.isUseLocal == 2){
            self.storage.storageDeviceSelected = self.storageDeviceList[0];
            self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
            self.changesysVolumeSize(self.arch.selected.size) 
        }else if(self.storage.isUseLocal == 1){
            self.storage.storageDeviceSelected = "";
            self.getCacheVolume(self.arch.selected,""); //校验缓存盘
            self.getBatchVolum(self.arch.selected,"");
            self.createInsForm.dataDiskArray = [];
            self.changesysVolumeSize(0) 
        }
        //initFlavorSpecificCpu(self.flavorSpecific.flavorCopy)
    }

    self.clickStep = function(nextstep, ...form) {
        return;
        let validFormCount = 0;
        self.submitInValid = false;
        if ((nextstep - self.currStep) > 0) {
            if (self.insProText || self.coreProText || self.ramProText || self.volumesProText || self.gigabytesProText
                || self.insDomText || self.coreDomText || self.ramDomText || self.volumesDomText || self.gigabytesDomText
                || !self.canVolum  || self.exceedPoolsText || !self.canBatchNoCeph || !self.canBatch || self.storage.isUseLocal == 0) {
                return;
            }
            if(self.currStep == 2 && ((self.options.imgSrc=='img' && !self.arch.selected) 
                || (self.options.imgSrc=='snap' && !self.createInsForm.selectedSnap) 
                || (self.options.imgSrc=='backup' && !self.createInsForm.selectedBackup) 
                || (self.options.imgSrc=='volume' &&  !self.createInsForm.selectedVolume)
                || (self.options.imgSrc=='img' && self.nomore_voltype)
                || (self.options.imgSrc=='volume' && self.insForm.hostNum>1)
                || (self.options.imgSrc=='backup' && self.insForm.hostNum>1)
            )){
                return;
            }
            for (let i = 0; i < form.length; i++) {
                if (!form[i].$valid) {
                    self.submitInValid = true;
                    return;
                    break;
                } else {
                    validFormCount++;
                }
            }
            if (validFormCount == form.length) {
                self.currStep = nextstep;
            }
        } else {
            self.currStep = nextstep;
            self.submitInValid = false;
        }
        if (self.insForm.hostNum > 1) {
            self.definedInsNet.assignIP = false;
        }
        if(self.currStep == 2){
            self.testVolumes()
        }
    };

    //点击下一步
    self.clickNextStep = function(step, currform) {
        //self.currStep = step;
        self.submitInValid = false;
        switch (step) {
            case 1:
                self.currStep = step;
                break;
            case 2:
                if (currform) {
                    if (currform.$valid) {
                        self.currStep = step;
                        if (self.options.canJoinNode) {
                            return;
                        }
                        if(self.storage.isUseLocal==1){
                            self.checkVolumFun(0)
                            self.getCacheVolume(self.arch.selected,"");
                            self.getBatchVolum(self.arch.selected,"");
                        }else if(self.storage.isUseLocal==2){
                            if(self.source.new){
                                self.arch.selected = self.InsImagesList[0];
                                self.createInsForm.chkImageId = self.arch.selected.imageUid;
        
                            }
                            self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);  
                        }
                        self.checkAllVolumPoolFun();
                        
                    } else {
                        self.submitInValid = true;
                    }
                } else {
                    self.currStep = step;
                }
            break;
                
            case 3:
                if (currform) {
                    if (currform.$valid) {
                        self.currStep = step;
                        if (step == 3) {
                            if(self.insForm.hostNum >1){
                                self.definedInsNet.assignIP = false;
                            }
                            if((self.options.imgSrc=='img'&& self.arch.selected.os_type == 'windows')
                            || (self.options.imgSrc=='volume'&&self.createInsForm.selectedVolume.imageMetadata.os_type == 'windows')
                            || (self.options.imgSrc=='snap'&& self.createInsForm.selectedSnap.osType == 'windows')
                            || (self.options.imgSrc=='backup'&&self.createInsForm.selectedBackup.osType == 'windows')){
                                self.cloud_security = false;
                                self.COC = false;
                            }else{
                                self.supportCloudSecurity?self.cloud_security = true:self.cloud_security = false;
                                self.supportCOC?self.COC = true:self.COC = false;
                            }
                            
                            
                        }
                    } else {
                        self.currStep = step - 1;
                        self.submitInValid = true;
                    }
                } else {
                    self.currStep = step;
                }
                break;
            case 4:
                if (currform) {
                    if(!self.definedInsNet.assignSub){
                        self.definedInsNet.assignIP  = false;
                    }
                    if (self.definedInsNet.assignIP) {
                        self.setCheckValueFunc();
                        if (self.field_form.step3InsForm.$valid) {
                            self.createInsForm.fixed_ip = self.definedInsNet.init_cidr.ip_0 + "." + self.definedInsNet.init_cidr.ip_1 + "." + self.definedInsNet.init_cidr.ip_2 + "." + self.definedInsNet.init_cidr.ip_3;
                            self.definedInsNet.repeatIp = false;
                            let existedIps = [];
                            networksSrv.getNetworksDetail(self.definedInsNet.selectedNet.id).then(function(res) {
                                if (res && res.data) {
                                    _.each(res.data, function(item) {
                                        _.each(item.subnetIps, function(sub) {
                                            existedIps.push(sub.ip_address);
                                        })
                                    })
                                    if (_.include(existedIps, self.createInsForm.fixed_ip)) {
                                        self.definedInsNet.repeatIp = true;
                                    }
                                    if (currform.$valid && !self.definedInsNet.repeatIp) {
                                        self.currStep = step;
                                    } else {
                                        self.currStep = step - 1;
                                        self.submitInValid = true;
                                    }
                                }
                            });                                                     
                        } else {
                            self.submitInValid = true;
                        }
                    } else {
                        if (currform.$valid) {
                            self.currStep = step;
                        } else {
                            self.currStep = step - 1;
                            self.submitInValid = true;
                        }
                    }
                } else {
                    self.currStep = step;
                }
                break;
        }
    };
    self.getInsFlavors();
    
    //选择镜像源
    self.choseImgSrc = function(src) {
        if((src=='volume' || src=='backup') && self.insForm.hostNum>1) return;
        if((src=='volume' || src=='snap' || src=='backup') && self.storage.isUseLocal==1) return;
        self.options.imgSrc = src;
        self.createInsForm.sysVolumeSize = "";
        self.createInsForm.sysVolumeMinSize = "";
        self.storage.storageDeviceSelected = {};
        self.submitInValid = false;
        self.createInsForm.noAvalDisk = false;
        switch(src){
            case "img":
                if (self.insImgTable && self.insImgTable.data && self.insImgTable.data[0]) {
                    //self.createInsForm.image_id = self.insImgTable.data[0].imageUid;
                    self.storage.storageDeviceSelected = self.storageDeviceList[0];
                    self.arch.selected = self.insImgTable.data[0];
                    self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
                    self.changeImg(self.arch.selected)
                }
            break;
            case "snap":
                if (self.insSysSnapTable && self.insSysSnapTable.data && self.insSysSnapTable.data[0]) {
                    self.createInsForm.snap_id = self.insSysSnapTable.data[0].id;
                    self.createInsForm.selectedSnap = self.insSysSnapTable.data[0];
                    self.changeSnap(self.createInsForm.selectedSnap)
                }
            break;
            case "volume":
                if(self.insSysVolumeTable && self.insSysVolumeTable.data && self.insSysVolumeTable.data[0]){
                    self.createInsForm.volume_id = self.insSysVolumeTable.data[0].id;
                    self.createInsForm.selectedVolume = self.insSysVolumeTable.data[0];
                    self.changeVolume(self.createInsForm.selectedVolume)
                }
            break;
            case "backup":
                self.storage.storageDeviceSelected = self.storageDeviceList[0];
                self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
                if(self.insSysBackupTable && self.insSysBackupTable.data && self.insSysBackupTable.data[0]){
                    self.createInsForm.backup_id = self.insSysBackupTable.data[0].id;
                    self.createInsForm.selectedBackup = self.insSysBackupTable.data[0];
                    self.changeBackup(self.createInsForm.selectedBackup )
                }
            break;

        }
    };
   
    
    self.changeImg = function(image) {
        if(self.options.imgSrc != "img") return;
        var imageCopy = angular.copy(image)
        self.createInsForm.chkImageId = image.imageUid;
        self.arch.selected = imageCopy;
        self.createInsForm.sysVolumeMinSize = self.arch.selected.size || 0;
        self.createInsForm.sysVolumeSize = self.arch.selected.size || 0;
        if(self.storage.isUseLocal==2){
            self.getCacheVolume(image,self.storage.storageDeviceSelected);
            self.getBatchVolum(image,self.storage.storageDeviceSelected);
            self.checkVolumFun(self.arch.selected.size * self.insForm.hostNum || 0);
        }
        self.allDataVolumeSize()
    };

    self.changeSnap = function(snap) {
        if(self.options.imgSrc != "snap") return;
        self.createInsForm.selectedSnap = snap;
        self.storage.storageDeviceSelected = snap.storageInfo;
        self.createInsForm.sysVolumeMinSize = self.createInsForm.selectedSnap.size;
        self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
        self.checkVolumFun(self.createInsForm.selectedSnap.size * self.insForm.hostNum);
        self.allDataVolumeSize()
    };

    self.changeBackup = function(backup){
        if(self.options.imgSrc != "backup") return;
        self.createInsForm.selectedBackup = backup;
        self.checkVolumFun(self.createInsForm.selectedBackup.size * self.insForm.hostNum);
        self.allDataVolumeSize()
    }

    //过滤掉数据盘选择中的Image所选的卷
    self.changeVolume = function(volume){
        if(self.options.imgSrc != "volume") return;
        self.createInsForm.selectedVolume = volume;
        self.storage.storageDeviceSelected = volume.storageInfo;
        self.createInsForm.dataDiskArray = [];
        self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
        self.checkVolumFun(0);
        self.allDataVolumeSize()
    }

    //添加数据盘
    self.addDataVolumes = function(){
        if(self.createInsForm.dataDiskArray.length >= 5 || self.createInsForm.avalDiskCopy==undefined || !self.createInsForm.getAvalDisk) return;
        self.createInsForm.avalDisk = self.filterVolumeSelects()
        self.createInsForm.dataDiskArray.push({device:self.storageDeviceListCopy[0],volume:self.createInsForm.avalDisk[0]})
        self.allDataVolumeSize();
        
    }
    //删除数据盘
    self.delDataVolumes = function(ind){
        self.createInsForm.dataDiskArray = self.createInsForm.dataDiskArray.filter((item,index) => index != ind);
        self.createInsForm.avalDisk = self.filterVolumeSelects();
        self.allDataVolumeSize();
    }

    //切换数据盘存储类型
    self.changeDataVolumeType = function(val,index){
        if((self.insForm.hostNum>1 && val.id=="has") || (self.createInsForm.avalDisk.length == 0 && val.id=="has")){
            self.createInsForm.dataDiskArray[index]={device:self.storageDeviceListCopy[0],volume:self.createInsForm.avalDisk[0],size:self.createInsForm.dataDiskArray[index].size};
        }
        if(self.insForm.hostNum ==1 && val.id=="has" && self.createInsForm.avalDisk.length){
            self.createInsForm.dataDiskArray[index].size = self.createInsForm.dataDiskArray[index].volume.size;
        }
        self.createInsForm.avalDisk = self.filterVolumeSelects()
        self.allDataVolumeSize();
    }
    self.changeDataVolume = function(volume,index){
        self.createInsForm.dataDiskArray[index].size = volume.size;
        self.createInsForm.avalDisk = self.filterVolumeSelects()
        self.allDataVolumeSize(self.createInsForm.sysVolumeSize);
    }
    //切换数据盘已有盘,更新所有下拉框可选数据
    self.filterVolumeSelects = function(){
        self.createInsForm.noAvalDisk = false;
        var avalDisk = angular.copy(self.createInsForm.avalDiskCopy);
        if(self.options.imgSrc == "volume" && self.createInsForm.selectedVolume && self.createInsForm.selectedVolume.id){
            avalDisk = self.createInsForm.avalDiskCopy.filter(item => item.id != self.createInsForm.selectedVolume.id)
        }
        self.createInsForm.dataDiskArray.map(chk => {
            avalDisk = avalDisk.filter(item=>{
                return ((chk.device.id == "has" && item.id != chk.volume.id) || chk.device.id != "has")
            })
        })
        if(avalDisk.length==0){
            self.createInsForm.noAvalDisk = true;
        }
        self.createInsForm.dataDiskArray.map(item =>{
            if(!item.device.id) item.volume = avalDisk[0];
        })
        return avalDisk;
    }

    //获取所有数据盘的总大小
    self.allDataVolumeSize = function(){
        var size = 0;
        self.createInsForm.dataDiskArray.map((item,index) => {
            item.size?size+=Number(item.size):"";
            self.createInsForm["avalDisk"+index] = angular.copy(self.createInsForm.avalDisk);
            var ishasvolume = false 
            self.createInsForm["avalDisk"+index].map(vol =>{
                if (vol.id == item.volume.id) ishasvolume = true;
            })
            if(!ishasvolume && item.device.id == 'has') self.createInsForm["avalDisk"+index].unshift(item.volume);
        });
        self.createInsForm.dataVolumeSize = size;
        self.testVolumes();
        self.checkAllVolumPoolFun()
    }
    self.changesysVolumeSize = function(size){ //size为系统盘的大小
        self.checkVolumFun(size * self.insForm.hostNum); //校验资源池
        self.testVolumes();   //校验云硬盘相关的配额
        self.checkAllVolumPoolFun()  //系统盘+数据盘校验资源池
    }
    
    //创建自定义规格
    self.myEasyFlavor = function(){
        //self.easyFlavor(self.getInsFlavors)
        var newFlavorModel = $uibModal.open({
            animation: true,
            templateUrl: "js/system/tmpl/newFlavor.html",
            controller: "newFlavorCtrl",
            resolve:{
                type:function(){
                    return "vmHost"
                },
                refreshFlavors:function(){
                    return self.getInsFlavors
                },
                fromIns:function(){
                    return self.storage.isUseLocal
                }
            }
        });
    }
    //创建密钥对
    self.createKeyPair = function() {
        var scope = self.$new();
        scope.newKeyPairData = {};

        var newKeyPairModal = $uibModal.open({
            animation: true,
            templateUrl: "newKeyPair.html",
            scope: scope
        });

        scope.submitted = false;
        scope.interacted = function(field) {
            scope.field_form = field;
            return scope.submitted || field.$dirty;
        };
        scope.confirmNewKeypair = function(kpData) {
            if (scope.field_form.$valid) {
                scope.formSubmitted = true;
                keyPairsSrv.createKeyPair(kpData).then(function(result) {
                    if (result && result.data) {
                        self.doDownload(result.data);
                        self.getKeypairs();
                    }
                });
                newKeyPairModal.close();
            } else {
                scope.submitted = true;
            }
        };
    };
    //下载密钥对
    self.doDownload = function(data) {
        var scope = self.$new();
        var downloadInstance = $uibModal.open({
            animation: true,
            templateUrl: "downloadPem.html",
            scope: scope
        });
        scope.download = function () {
            var pemData = new Blob(
                [data.private_key],
                { type: "application/x-pem-file"}
            );
            FileSaver.saveAs(pemData, data.name + ".pem");
            downloadInstance.close();
        };

    };
    //创建安全组
    self.createSecurityGroup = function(){
        self.easySecurityGroup(self)
    }
    //查看安全组规则详情
    self.viewSecRule = function(securityGroup) {
        var scope = self.$new();
        var secRuleModal = $uibModal.open({
            animation: true,
            templateUrl: "secRuleDetail.html",
            scope: scope
        });

        securityGroupSrv.getFirewallRuleDetail(securityGroup.id).then(function(result) {
            result ? self.loadSecRuleData = true : "";
            if (result && result.data) {
                var data = _.map(result.data, function(item) {
                    if (item.direction == "ingress") {
                        item.direc = $translate.instant("aws.security.ingress");
                    }
                    if (item.direction == "egress") {
                        item.direc = $translate.instant("aws.security.egress");
                    }
                    item.ipProtocol = item.ipProtocol ? item.ipProtocol : $translate.instant("aws.security.any");
                    item._ipProtocol = item.ipProtocol == "icmp" ? item.fromPort + " / " + item.toPort : " - ";
                    item.sourceType = item.cidr || item.parentGroupName || $translate.instant("aws.security.any");
                    //item.searchTerm = [item.direc, item.ethertype, item.ipProtocol, item.fromPort + "-" + item.toPort + item._ipProtocol + item.sourceType].join(',');
                    return item;
                });
                self.secRuleTable = new NgTableParams({
                    count: 5
                }, {
                    counts: [],
                    dataset: data
                });
            }
        });
    }
    //创建自定义云主机
    self.createDefinedInsCfm = function() {
        var dataVolumes = [];
        if(self.storage.isUseLocal==1){
            dataVolumes = [{dataVolumeSize:Number(self.createInsForm.ephemeral || 0 )}]
        }else if(self.storage.isUseLocal==2){
            self.createInsForm.dataDiskArray.map(item => {
                if(item.device.id == "has"){
                    dataVolumes.push({dataVolumeId:item.volume.id})
                }else{
                    dataVolumes.push({dataVolumeType:item.device.volumeTypeId,dataVolumeSize:item.size})
                }
            })
        }
        
        let postData = {
            name: self.createInsForm.name,
            count: self.insForm.hostNum,
            admin_pass: self.createInsForm.admin_pass || "",
            network_id: self.definedInsNet.selectedNet.id,
            keypair_id: self.keypairs.selected ? self.keypairs.selected.name : "",
            use_local: self.storage.isUseLocal == 2? false : true,
            hostname: self.createInsForm.hostname,
            flavor: self.createInsForm.selectedFlavor.id,
            security_id: self.securities.selected ? self.securities.selected.id : "",
            dataVolumes:dataVolumes,
            block_device_mapping:{"disk_bus":self.createInsForm.disk_bus.id},
            cloud_security:self.cloud_security,
            coc:self.COC
        };
        if(self.cloud_security){
            if(self.supportPass&&self.supportPass.CloudSecurity && self.supportPass.CloudSecurity.isLinked){
                postData.agent_url = self.supportPass.CloudSecurity.agentUrl;
            }
        }
        switch(self.options.imgSrc){
            case "img":
                postData.os_type = self.arch.selected.os_type;
                postData.image_id = self.arch.selected.imageUid;
                postData.volumeSize =  Number(self.createInsForm.sysVolumeSize);
                if(self.cloud_security){
                    postData.arch = self.arch.selected.arch;
                }
                if(self.storage.isUseLocal==2){
                    postData.volume_type = self.storage.storageDeviceSelected.volumeTypeId;
                }
                break;
            case "snap":
                postData.snapshot_id = self.createInsForm.selectedSnap.id;
                postData.block_device_mapping.deleteOnTermination = true;
                if(self.cloud_security){
                    postData.arch = self.createInsForm.selectedSnap.architecture;
                }
                break;
            case "volume":
                postData.volumeId = self.createInsForm.selectedVolume.id;
                if(self.cloud_security){
                    if(self.createInsForm.selectedVolume.imageMetadata){
                        postData.arch = self.createInsForm.selectedVolume.imageMetadata.architecture
                    }
                }
                break;
            case "backup":
                postData.backupId = self.createInsForm.selectedBackup.id;
                if(self.cloud_security){
                    postData.arch = self.createInsForm.selectedBackup.architecture;
                }
                if(self.storage.isUseLocal==2){
                    postData.volume_type = self.storage.storageDeviceSelected.volumeTypeId;
                }
                break;

        }
        if(self.createInsForm.vmGroupSelected && self.createInsForm.vmGroupSelected.id){
            postData.groupId = self.createInsForm.vmGroupSelected.id;
        }
        
        if(self.definedInsNet.assignSub){
            postData.subnet_id = self.definedInsNet.selectedSubnet.id;
        }
        if (self.definedInsNet.assignIP) {
            postData.fixed_ip = self.createInsForm.fixed_ip;
        }
        self.zone.selected ? postData.availability_zone = self.zone.selected.zoneName : "";
        self.node.selected ? postData.node = self.node.selected.name : "";
        self.checkVolumFun();
        if (self.canVolum) {
            self.validForm = true;
            self.doubleClick = true;
            instancesSrv.createServer(postData).then(function(){
                //判断是否是在网络拓扑页面新建云主机
                if ($location.path() == "/cvm/netTopo") {
                    $timeout(function() {
                        $rootScope.initEditedTopo();
                    }, 1000);
                }else{
                    $location.url("/cvm/instances");
                    self.$emit("newIns")
                }   
                
            });
        } else {
            self.validForm = false;
        }

    };
    //自定义创建云主机配置详情
    self.$watch(function() {
        return $routeParams.id;
    }, function(value) {
        value ? self.animation = "animateIn" : self.animation = "animateOut";
    });
    
    function formatStep4DetailInfo() {
        self.createInsForm.fixed_ip = "自动分配";
        if (self.definedInsNet.assignIP) {
            self.createInsForm.fixed_ip = self.definedInsNet.init_cidr.ip_0 + "." + self.definedInsNet.init_cidr.ip_1 + "." + self.definedInsNet.init_cidr.ip_2 + "." + self.definedInsNet.init_cidr.ip_3;
        }
    }

    self.setCheckValueFunc1 = function(){
        formatStep4DetailInfo()
    }

    self.changeAssignIP = function(value){
        if(!value){
            self.definedInsNet.init_cidr.ip_3 = ""  
            formatStep4DetailInfo()
        }
    }
    
   
    //ngtable 头部filter
    self.tableFilterList = {
            image:{
                name:"镜像类型",
                filter:[
                    {name:"全部",type:{is_public:""}},
                    {name:"公有",type:{is_public:true}},
                    {name:"私有",type:{is_public:false}}
                ]
            },
            arch:{
                name:"系统架构",
                filter:[
                    {name:"全部",type:{arch:""}},
                    {name:"64位",type:{arch:"x86_64"}},
                    {name:"32位",type:{arch:"i686"}}
                ]
            },
            os:{
                name:"操作系统",
                filter:[
                    {name:"全部",type:{os_type:""}},
                    {name:"Windows",type:{os_type:"windows"}},
                    {name:"Linux",type:{os_type:"linux"}}
                ]
            }
    }
    self.tableContent = self;

}   
defineCreateInsCtrl.$inject = ['$scope', '$rootScope', 'NgTableParams', '$translate', "$filter", '$location', '$routeParams', '$uibModal', 
'flavorsSrv', 'imagesSrv', 'snapshotsDataSrv', 'checkQuotaSrv', 'securityGroupSrv', 'networksSrv', 'instancesSrv', 'commonFuncSrv', 
'keyPairsSrv', 'FileSaver', 'Blob',"createInsSrv","$timeout"];
createInsModule.controller('defineCreateInsCtrl', defineCreateInsCtrl);
