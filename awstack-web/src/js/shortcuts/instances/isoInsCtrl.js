
let isoInsModule = angular.module("isoInsModule", []);

function isoCtrlFunc($scope,$rootScope,$location,$translate,makeImageSrv,imagesSrv,instancesSrv,flavorsSrv,createInsSrv,$timeout){
    let self = $scope;
    self.options.imgSrc = "img";
    self.createInsForm.sysVolumeSize = "";
    self.iso = {
        toolIsos:[],
        toolSoftIsos:[]
    };
    self.toolIsos = [];
    self.toolSoftIsos = [];
    self.insForm.hostNum = 1;
    self.createInsForm.ephemeral = "";
    self.testProQuotaFunc(self.createInsForm.selectedFlavor, 1);
    self.testDomQuotaFunc(self.createInsForm.selectedFlavor, 1);
    self.checkVolumFun(0)
    if($rootScope.billingActive){
        self.showPrice = true;
    }

    function getIso(){
        imagesSrv.getImages().then(function(result) {
            if(result&&result.data){
                self.allIso = result.data.filter(image => (
                    image.disk_format.toLowerCase()=="iso" && image.status=="active")
                )
                relativeOsType()
            }
        });
    }

    function relativeOsType(){
        if(self.osTypeList && self.allIso){
            self.osTypeIsos =  self.allIso.filter(item => {
                return item.os_type.toLowerCase() == self.iso.os_type.paramName.toLowerCase() && 
                item.os.toLowerCase() == self.iso.os_distro.toLowerCase()
            })
            self.osTypeIsos_copy = angular.copy(self.osTypeIsos )
            self.iso.iso = self.osTypeIsos[0];
            if(self.iso.iso && self.iso.iso.size){
                self.createInsForm.sysVolumeSize = self.iso.iso.size;
            }
            self.chooseBoot(self.storage.isUseLocal)
            relativeIso()
        }
    }

    function relativeIso(){
        var isos = angular.copy(self.allIso);
        var osTypeIsos = angular.copy(self.osTypeIsos_copy);
        if(self.iso.toolIsos && self.iso.toolIsos.length){
            self.iso.toolIsos.map(item => {
                isos = isos.filter(value => value.imageUid != item.imageUid);
                osTypeIsos = osTypeIsos.filter(value => value.imageUid != item.imageUid);
            })
        }
        if(self.iso.toolSoftIsos && self.iso.toolSoftIsos.length){
            self.iso.toolSoftIsos.map(item => {
                isos = isos.filter(value => value.imageUid != item.imageUid)
                osTypeIsos = osTypeIsos.filter(value => value.imageUid != item.imageUid);
            })
        }
        if(self.iso.iso) {
            isos = isos.filter(value => value.imageUid != self.iso.iso.imageUid)
        }

        self.toolIsos = [...self.iso.toolIsos,...isos];

        self.toolSoftIsos = [...self.iso.toolSoftIsos,...isos];

        self.osTypeIsos = osTypeIsos;
        
        getvVolumeSize();
        
    }

    function getvVolumeSize(){  //获取所有数据盘和工具盘的个数和大小
        var toolsize = 0 ;
        self.volumeCount = 0;
        self.volumeSize = 0;
        self.iso.toolIsos.map(item=>{
            toolsize += item.size;
        })
        self.iso.toolSoftIsos.map(item=>{
            toolsize += item.size;
        })
        self.volumeCount = self.iso.toolIsos.length + self.iso.toolSoftIsos.length + (self.iso.iso ? 2:0);
        self.volumeSize = Number(self.createInsForm.sysVolumeSize || 0) + Number((self.iso.iso?self.iso.iso.size:0)) + Number(toolsize);
        self.testVolumes(self.volumeCount,self.volumeSize);
        self.checkVolumFun(self.volumeSize);
        if(self.createInsForm.selectedFlavor){
            self.getPrice(self.createInsForm.selectedFlavor.vcpus,self.createInsForm.selectedFlavor.ram_gb);
        }else{
            self.getPrice(self.createInsForm.selectedFlavor.vcpus,self.createInsForm.selectedFlavor.ram_gb);
        }
    }

    function getOsType(){
        makeImageSrv.getOSversion().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map( item => {
                    item.paramValue = item.paramValue.split(",");
                })
                self.osTypeList = res.data;
                self.iso.os_type = res.data[0];
                self.iso.os_distro = res.data[0].paramValue[0];
                relativeOsType()
            }
        })
    }

    function getNetworks(){
        makeImageSrv.getNetwork().then(function(result){
            if(result&&result.data){
                self.networkList=result.data.filter(function(net){
                    if(net.subnets.length>0){
                        return net;
                    }
                });;
            }
            if(!self.ADMIN){
                self.networkList = self.networkList.filter(item => !item.external)
            }
            if(self.networkList.length>0){
                self.iso.networks=self.networkList[0];
            }
        });
    }

    function getFlavors(){
        flavorsSrv.getFlavors().then(function(result) {
            result ? self.loadFlavorData = true : "";
            self.flavorNormalList = [];
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
                    self.initFlavorTable(self.flavorNormalList,self.flavorNormalList[0])
                }
            }
        });        
    }

    self.getPrice = function(cpuCount,memorySize){
        if(!$rootScope.billingActive || !cpuCount || !memorySize ){
            return ;
        }
        var postData ={
            "region":localStorage.regionName?localStorage.regionName:"default",
            "cpuCount":cpuCount,
            "memorySize":memorySize
        }
        if(createInsSrv){
            createInsSrv.getPrice(postData).then(function(data){
                if(data && !isNaN(data.data)){
                    var price = Number(data.data) ;
                    var postdata  ={
                        "region":localStorage.regionName?localStorage.regionName:"default",
                        "volumeSize":0
                    };
                    if(self.storage.isUseLocal==2){
                        postdata.volumeSize = self.volumeSize || 0;
                    }
                    if(postdata.volumeSize >0){
                        createInsSrv.getVlomesPrice(postdata).then(function(res){
                            if(res && !isNaN(res.data)){
                                self.$broadcast("showPrice",true);
                                self.price = price + Number(res.data) ;
                                self.priceFix = (self.price * Number(self.insForm.hostNum)).toFixed(2);
                                self.totalPrice = (self.price * 30 * 24 * Number(self.insForm.hostNum)).toFixed(2);
                            }
                        })
                    }else{
                        self.$broadcast("showPrice",true)
                        self.price = price;
                        self.priceFix = (self.price * Number(self.insForm.hostNum)).toFixed(2);
                        self.totalPrice = (self.price * 30 * 24 * Number(self.insForm.hostNum)).toFixed(2);
                    }
                }else{
                    self.$broadcast("showPrice",true)
                    self.price ="N/A";
                    self.priceFix =  "N/A";
                    self.totalPrice = "N/A"
                }
                
            })
        }
      
    }

    self.changeFlavor = function(val) {
        self.createInsForm.selectedFlavor = val;
        self.getPrice(val.vcpus,val.ram_gb);
        self.testProQuotaFunc(val, 1);
        self.testDomQuotaFunc(val, 1);
    };

    self.chooseBoot = function(uselocal){
        self.storage.isUseLocal = uselocal;
        if(uselocal == 1){
            self.checkVolumFun(0)
        }else if(uselocal == 2){
            self.poolInfo(self.storage.storageDeviceSelected,"");
            //self.checkVolumFun(self.createInsForm.sysVolumeSize)
        }
    }
    self.changeOSType = function(){
        self.iso.os_distro = self.iso.os_type.paramValue[0];
        self.changeOS()
    }

    self.changeOS = function(){
        if(self.iso.os_distro.indexOf("Windows Server 2003")>-1){
            self.isWin2003 = true;
        }else{
            self.isWin2003 = false;
        }
        relativeOsType()

    }

    self.changeISO = function(){
        self.createInsForm.sysVolumeSize = self.iso.iso.size;
        relativeIso()
    }

    self.changeToolIso = function(){
        relativeIso()
    }

    self.changeToolSoftIso = function(){
        relativeIso()
    }
    self.attachToolIso = function(){
        self.iso.toolIsos = [];
        relativeIso()
    }
    self.attachToolSoftIso = function(){
        self.iso.toolSoftIsos = [];
        relativeIso()
    }

    self.changesysVolumeSize = function(){
        getvVolumeSize()
    }

    self.changeStorage = function(item){
        self.poolInfo(item,self.pollInfoCallBackFunc(self.volumeSize));
    };
    getFlavors();
    getNetworks();
    getIso();
    getOsType();

    self.createInstance = function(){
        if(self.InstanceForm.$valid){
            var postData = {
                name:self.insForm.name,
                count:1,
                network_id:self.iso.networks.id,
                flavor:self.createInsForm.flavor,
                os_type:self.iso.os_type.paramName,
                os_distro:self.iso.os_distro,
                attach_iso:[],
                attach_soft_iso:[],
                block_device_mapping:{
                    deleteOnTermination:true
                }
            }
            
            if(self.chkAttachToolIso){
                _.forEach(self.iso.toolIsos,function(disk){
                    postData.attach_iso.push({dataVolumeType:self.storage.storageDeviceSelected.volumeTypeId,dataVolumeId:disk.imageUid});
                });
            }
            
            if(self.isWin2003 && self.chkAttachToolSoftIso){
                _.forEach(self.iso.toolSoftIsos,function(disk){
                    postData.attach_soft_iso.push({dataVolumeType:self.storage.storageDeviceSelected.volumeTypeId,dataVolumeId:disk.imageUid});
                });
            }

            if(self.storage.isUseLocal==2){
                postData.use_local = false;
                postData.image_id = self.iso.iso.imageUid;
                postData.volumeSize = self.iso.iso.size,
                postData.dataVolumes = [{dataVolumeType:self.storage.storageDeviceSelected.volumeTypeId,dataVolumeSize:self.createInsForm.sysVolumeSize}]
                postData.volume_type = self.storage.storageDeviceSelected.volumeTypeId;
                instancesSrv.createIsoServer(postData).then(function(){
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
            }
            
        }else {
            self.submitInValid = true;
        }
    }
    
    
}
isoCtrlFunc.$inject = ['$scope', '$rootScope','$location', '$translate','makeImageSrv','imagesSrv','instancesSrv','flavorsSrv','createInsSrv','$timeout'];
isoInsModule.controller('isoInsCtrl', isoCtrlFunc);

export {
    isoCtrlFunc
}