function createInstanceCtrl($scope, $rootScope, instancesSrv, $translate, cvmViewSrv, depviewsrv, aggregatesSrv, networksSrv,
     storageSrv, overviewSrv, volumesDataSrv, commonFuncSrv,$location,vmFuncSrv,flavorsSrv,$timeout) {
    var self = $scope;
    self.createInsForm.selectedFlavor = "";
    self.createInsForm.flavor = "";
    self.createInsForm.ephemeral = ""; 
    self.createInsForm.dataVolumeSize = 0;
    self.showMoreFlavor = false;
    self.options.img = "public";
    self.options.arch = "x86_64";
    self.flavorNormalList = [];
    self.baseFlavorIndex = -2;
    self.submitInValid = false;
    if(self.options.imgSrc != "img"){
        self.arch = {
            selected : ""
        }
    }
    if(self.roleNumber){
        self = commonFuncSrv.setAssignIpFun(self, "network","InstanceForm","");
    }else{
        self = commonFuncSrv.setAssignIpFun(self, "network","InstanceForm","private"); 
    }
    self.supportCloudSecurity?self.cloud_security = true:self.cloud_security = false;
    self.supportCOC?self.COC = true:self.COC = false;
    self.testProQuotaFunc(self.createInsForm.selectedFlavor, self.insForm.hostNum);
    self.testDomQuotaFunc(self.createInsForm.selectedFlavor, self.insForm.hostNum);
    self.checkPoolInQUick();
    self.testVolumes();
    self.priceFix = 0;
    self.price = 0;
    self.totalPrice = 0;
    if($rootScope.billingActive){
        self.showPrice = true;
    }
    if(self.source.new){
        self.options.imgSrc = "img"
    }
    
    var imgType = [{
        text: $translate.instant("aws.instances.addinstances.public"),
        value: "public"
    }, {
        text: $translate.instant("aws.instances.addinstances.private"),
        value: "private"
    }];
    var framework = [{
        text: $translate.instant('aws.instances.addinstances.x86_64'),// "64位"
        value: "x86_64"
    }, {
        text: $translate.instant('aws.instances.addinstances.i686'),//"32位"
        value: "i686"
    }];

    self.flavorNormalList3 = [
    {text:"基础规格（1核2G）",description:"有一定访问量的应用",vcpus:1,ram_gb:2,name:"标准型1"},
    {text:"计算规格（2核4G）",description:"并发适中的APP或普通数据处理",vcpus:2,ram_gb:4,name:"标准型2"},
    {text:"专业规格（4核8G）",description:"适用于并发要求较高的APP",vcpus:4,ram_gb:8,name:"标准型3"}]

    self.vm = {
        imgType: imgType,
        framework: framework
    };
    if((self.options.imgSrc=='img' && self.arch.selected.os_type == 'windows')
    || (self.options.imgSrc=='volume'&& self.createInsForm.selectedVolume.imageMetadata.os_type == 'windows')
    || (self.options.imgSrc=='snap'&& self.createInsForm.selectedSnap.osType == 'windows')
    || (self.options.imgSrc=='backup'&& self.createInsForm.selectedBackup.osType == 'windows')){
        self.cloud_security = false;
        self.COC = false;
    }
    self.$watch(function(){
        return self.arch.selected.size
    },function(val){
        if(val && self.options.imgSrc == "img"){
            self.createInsForm.sysVolumeSize = val;
            self.createInsForm.sysVolumeMinSize = val || 0;
            self.changesysVolumeSize(val)
        }
    })
    self.$watch(function(){
        return self.arch.selected.os_type
    },function(val){
        if(val){
            if(val.toLowerCase()=="windows"){
                self.cloud_security = false;
                self.COC = false;
            }else if(val.toLowerCase()=="linux"){
                self.supportCloudSecurity?self.cloud_security = true:self.cloud_security = false;
                self.supportCOC?self.COC = true:self.COC = false;
            }
        }
    })
    
    function formatStep4DetailInfo() {
        self.createInsForm.fixed_ip = "自动分配";
        if (self.network.assignIP) {
            self.createInsForm.fixed_ip = self.network.init_cidr.ip_0 + "." + self.network.init_cidr.ip_1 + "." + self.network.init_cidr.ip_2 + "." + self.network.init_cidr.ip_3;
        }
    }

    self.setCheckValueFunc1 = function(){
        formatStep4DetailInfo()
    }
    if(self.source.new){
        self.allvmImages(self.InsImagesList);
        self.createInsForm.sysVolumeSize = self.arch.selected.size;
    }

    self.changesysVolumeSize = function(size){ //size为系统盘的大小
        self.checkVolumFun(size); //校验资源池
        self.testVolumes();   //校验云硬盘相关的配额
        if(self.createInsForm.selectedFlavor){
            self.getPrice(self.createInsForm.selectedFlavor.vcpus,self.createInsForm.selectedFlavor.ram_gb) 
        }else {
            self.getPrice(0,0) 
        }
    }

    self.chooseBoot = function(uselocal){
        if(self.source.fromSnapshot || self.source.fromVolume || self.source.fromBackup) return;
        self.storage.isUseLocal = uselocal;
        self.options.imgSrc = "img";
        if(self.createInsForm.selectedFlavor){
            self.getPrice(self.createInsForm.selectedFlavor.vcpus,self.createInsForm.selectedFlavor.ram_gb) 
        }else {
            self.getPrice(0,0) 
        }
        if(uselocal == 1){
            self.storage.storageDeviceSelected = "";
            self.checkVolumFun(0) //校验资源池 
            self.getCacheVolume(self.arch.selected,""); //校验缓存盘
            self.getBatchVolum(self.arch.selected,"");
        }else if(uselocal == 2){
            self.poolInfo(self.storage.storageDeviceSelected,self.pollInfoCallBackFunc);
        }
    }

    self.showMoreFlavorFunc = function(){
        self.showMoreFlavor = !self.showMoreFlavor;
        if(self.showMoreFlavor){
            self.initFlavorTable(self.flavorNormalListCopy,self.createInsForm.selectedFlavor)
        }
    }

    self.recommendFlavorFunc = function(){
        self.showMoreFlavor = !self.showMoreFlavor;
        mapFlavor(self.createInsForm.selectedFlavor);
        self.unmatchedFalvor = false ;
    }

    self.changeFlavor = function(val) {
        self.createInsForm.selectedFlavor = val;
        self.chooseCpuMem(val)
    };
    
    self.changeBaseFlavor = function(item,index){
        var choose = self.flavorNormalList.filter(val => (val.vcpus == item.vcpus && val.ram_gb == item.ram_gb ));
        choose.length? self.unmatchedFalvor = false : self.unmatchedFalvor = true;
        self.chooseCpuMem(choose[0]);
    }

    self.chooseCpuMem = function(data,flag) {
        self.createInsForm.selectedFlavor = data;
        self.createInsForm.flavor = data.id;
        self.baseFlavorIndex = -1;
        if(!data) {
            data = {ram:0,vcpus:0};
        };
        if(flag != "changePri"){
             self.getPrice(data.vcpus,data.ram_gb)
        }
        self.testProQuotaFunc(data, self.insForm.hostNum);
        self.testDomQuotaFunc(data, self.insForm.hostNum);
        mapFlavor(data);
    }; 

    self.changeStorage = function(item){
        self.nomore_voltype = false;
        if(self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
            self.getToyouDevice(self.getToyouVolumeCharacter)
       }
        self.poolInfo(item,self.pollInfoCallBackFunc);
    };

    self.interacted = function(field) {
        self.field_form.InstanceForm = field;
        if(field && field.ip_0 && field.ip_1 && field.ip_2 && field.ip_3){
            return self.submitInValid || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
        }
    };

    function mapFlavor(data){
        self.flavorNormalList3.map((item,index) =>{
            if(data.vcpus == item.vcpus && data.ram_gb == item.ram_gb) 
                self.baseFlavorIndex = index;
        })
    }

    function getFlavors(){
        flavorsSrv.getFlavors().then(function(result) {
            result ? self.loadFlavorData = true : "";
            if (result && result.data && angular.isArray(result.data)) {
                var data = result.data;
                if (data && angular.isArray(data)) {
                    _.forEach(data, function(val) {
                        let flavor_ram_gb = val.ram  / 1024;
                        val.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb ? flavor_ram_gb : flavor_ram_gb.toFixed(1);
                        val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + val.ram_gb + "GB ";
                        self.flavorNormalList.push(val);
                    });
                    self.flavorNormalListCopy = angular.copy(self.flavorNormalList)
                    self.flavorNormalList = self.flavorNormalListCopy;
                }
            }
        });        
    }
   
    getFlavors()


    self.createInstance = function(InstanceForm) {
        self.validForm = false;
        self.doubleClick = false;
        var postData = {};
        var addInstance = function(params) {
            if (self.canVolum) {
                self.doubleClick = true;
                instancesSrv.createServer(params).then(function(){
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
        self.checkVolumFun();
        if (InstanceForm.$valid) {
            if(self.canJoinNode){
                return;
            }
            postData = {
                name: self.createInsForm.name,
                count: self.insForm.hostNum,
                admin_pass: self.insForm.admin_pass || "",
                network_id: self.network.selectedNet.id,
                keypair_id: self.keypairs.selected ? self.keypairs.selected.name : "",
                use_local: self.storage.isUseLocal==2?false:true,
                hostname: self.insForm.hostname,
                flavor: self.createInsForm.selectedFlavor.id,
                security_id: self.securities.selected ? self.securities.selected.id : "",
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
                    if(self.storage.isUseLocal==2){
                        postData.volume_type = self.storage.storageDeviceSelected.volumeTypeId;
                    }else if(self.storage.isUseLocal==1){
                        postData.dataVolumes = [{dataVolumeSize:Number(self.createInsForm.ephemeral || 0 )}];
                    }
                    if(self.cloud_security){
                        postData.arch = self.arch.selected.arch;
                    }
                    break;
                case "snap":
                    postData.snapshot_id = self.createInsForm.selectedSnap.id;
                    postData.block_device_mapping = {
                        deleteOnTermination:true
                    }
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
            self.zone.selected ? postData.availability_zone = self.zone.selected.zoneName : "";
            self.node.selected ? postData.node = self.node.selected.name : "";
            if(self.network.assignSub){
                postData.subnet_id = self.network.selectedSubnet.id;
            }
            if (self.network.assignIP) {
                postData.fixed_ip = self.network.init_cidr.ip_0 + "." + self.network.init_cidr.ip_1 + "." + self.network.init_cidr.ip_2 + "." + self.network.init_cidr.ip_3;
                self.setCheckValueFunc();
                if (self.field_form.InstanceForm.$valid) {
                    self.validForm = true;
                    let existedIps = [];
                    networksSrv.getNetworksDetail(self.network.selectedNet.id).then(function(res) {
                        if (res && res.data) {
                            _.each(res.data, function(item) {
                                _.each(item.subnetIps, function(sub) {
                                    existedIps.push(sub.ip_address);
                                })
                            })
                            if (!_.include(existedIps, postData.fixed_ip)) {
                                addInstance(postData);
                            } else {
                                self.network.repeatIp = true;
                                self.validForm = false;
                            }
                        }
                    });
                } else {
                    self.submitInValid = true;
                    self.validForm = false;
                }
            }else{
                self.validForm = true;
                addInstance(postData);
            }
        } else {
            self.submitInValid = true;
            self.validForm = false;
        }

        return self;
    };

}
createInstanceCtrl.$inject=["$scope", "$rootScope", "instancesSrv", "$translate","cvmViewSrv", "depviewsrv", "aggregatesSrv","networksSrv","storageSrv",
"overviewSrv","volumesDataSrv","commonFuncSrv","$location","vmFuncSrv","flavorsSrv","$timeout"];
export {
    createInstanceCtrl
}