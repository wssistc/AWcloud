
var vmFuncModule = angular.module("vmFuncModule", []);

vmFuncModule.service("vmFuncSrv", ["$http","$location","$translate","createInsSrv","$rootScope","phyhostSrv",'FileSaver', 'Blob',"kbnSrv","instancesSrv","alertSrv",
function($http,$location,$translate,createInsSrv,$rootScope,phyhostSrv,FileSaver,Blob,kbnSrv,instancesSrv,alertSrv) {
    return {
        cacheVolume:function(self,instancesSrv){
            //用镜像首次创建主机的时候要判断镜像是否是qcow2格式，如果是qcow2再判断是否有缓存盘，如果没有只能新建一个，如果有可以批量创建
            self.getCacheVolume = function(image,storageDeviceSelected) {
                self.canBatch = true;
                if(!image || self.storage.isUseLocal !=2) return;
                if (self.insForm.hostNum > 1 && image && image.disk_format == "qcow2" && storageDeviceSelected) {
                    if (storageDeviceSelected.name) {
                        var postData = storageDeviceSelected.name;
                        instancesSrv.getImageCacheVol(image.imageUid, postData).then(function(result) {
                            if (result && result.status == "400") {
                                self.canBatch = false;
                            } else {
                                self.canBatch = true;
                            }
                        })
                    } else {
                        self.canBatch = true;
                    }

                }

            };
            //非ceph存储
            self.getBatchVolum = function(image,storageDeviceSelected){
                self.canBatchNoCeph= true;
                if(!image || self.storage.isUseLocal !=2 ) return;
                if(storageDeviceSelected 
                    && storageDeviceSelected.capabilities 
                    && storageDeviceSelected.capabilities.volume_backend_name.indexOf('ceph')==-1){
                    if (self.insForm.hostNum > 1 && image && storageDeviceSelected) {
                        if(storageDeviceSelected.capabilities.image_volume_cache_enabled){
                            if (storageDeviceSelected.name) {
                                var postData = storageDeviceSelected.name;
                                instancesSrv.getImageCacheVol(image.imageUid, postData).then(function(result) {
                                    if (result && result.status == 0 && result.data && result.data.status == "400") {
                                        self.canBatchNoCeph = false;
                                    } else {
                                        self.canBatchNoCeph = true;
                                    }
                                })
                            } else {
                                self.canBatchNoCeph = true;
                            }

                        }else{
                            self.canBatchNoCeph = false;
                        }
                    }
        
                }
            };

            return self;
        },
        storageFunc :function(self,instancesSrv,storageSrv){
            Array.prototype.min = function(){ 
                return Math.min.apply(null,this) 
            }
            self.checkVolumFun = function(size) {
                self.canVolum = true;
                if (self.poolsInfo_data && Number(self.poolsInfo_data._allocate) >= 0 && Number(self.poolsInfo_data._total) >= 0) {
                    var usedSize = Number(size);
                    var free = [ Number(self.poolsInfo_data._total-self.poolsInfo_data._allocate),self.poolsInfo_data._free].min();
                    if (usedSize > free) {
                        self.canVolum = false;
                    }
                }
                return self.canVolum;
            };
            self.poolDataTranslate = function(item){
                if(!item) return;
                var sdata = item;
                if (!sdata.capabilities.max_over_subscription_ratio) {
                    sdata.capabilities.max_over_subscription_ratio = 1;
                }
                var total = sdata.capabilities.total_capacity_gb * sdata.capabilities.max_over_subscription_ratio;
                var allocated_capacity_gb;
                var free_capacity_gb = sdata.capabilities.free_capacity_gb;
                if (sdata.capabilities.provisioned_capacity_gb) {
                    allocated_capacity_gb = sdata.capabilities.provisioned_capacity_gb;
                } else {
                    allocated_capacity_gb = sdata.capabilities.fresh_allocated_capabilities;
                }
                return [allocated_capacity_gb,total,free_capacity_gb]
            }
            self.poolInfo = function(item,poolCallbackFunc){
                //self.storage.storageDeviceSelected.host = item.name;
                //self.storage.storageDeviceSelected.image_volume_cache_enabled = item.capabilities.image_volume_cache_enabled?true:false;
                if(!item || !item.capabilities) return;
                var data = self.poolDataTranslate(item);
                self.poolsInfo_data = {
                    title: "TB",
                    allocate: Math.floor( Number(data[0] / 1024) * 1000) / 1000 , //已分配
                    beAdded: 0,
                    total: Math.floor( Number(data[1] / 1024) * 1000) / 1000,   //总量
                    free: Math.floor( Number(data[2] / 1024) * 1000) / 1000,    //剩余
                    inUsed : Math.floor(Number(data[1]-data[2]) / 1024 * 1000) / 1000 ,  //总量-剩余 = 已使用
                    _total: Number(data[1]),
                    _free:Number(data[2] ) ,
                    _allocate : Number(data[0]) ,

                };
                poolCallbackFunc?poolCallbackFunc():"";

                //toyou特性开发
            };
            self.getStorage = function(poolCallbackFunc,toyouDeviceCallback){
                instancesSrv.getStorage().then(function(res){
                    if(res && res.data && angular.isArray(res.data)){
                       self.storageDeviceList = res.data;
                       self.storage.storageDeviceSelected = self.storage.storageDeviceSelected?self.storage.storageDeviceSelected:self.storageDeviceList[0];
                       if(self.storage.storageDeviceSelected && self.storage.storageDeviceSelected.name.indexOf("toyou")>-1){
                            toyouDeviceCallback?self.getToyouDevice(toyouDeviceCallback,self.storage.storageDeviceSelected):"";
                       }
                       self.poolInfo(self.storage.storageDeviceSelected,poolCallbackFunc)
                    }
                })
            };
            self.getToyouDevice = function(getToyouDeviceCallback,item) {
                var postData = {
                    "Vendor": "TOYOU"
                }
                storageSrv.getDevice(postData).then(function(result) {
                    if (result && angular.isArray(result.data) && result.data.length) {
                        var currPost;
                        if(item&&item.capabilities&&item.capabilities.volume_backend_name){
                            var currentD =  item.capabilities.volume_backend_name.split('--');
                            for(let i=result.data.length-1;i>-1;i--){
                                if(result.data[i][1]==currentD[0]&&result.data[i][2]==currentD[1]){
                                    currPost = result.data[i];
                                    break;
                                }
                            }
                        }
                        currPost = currPost||result.data[0];
                        getToyouDeviceCallback(currPost);
                    }
                });
            }
            return self;
        },
        imageFunc:function(self,instancesSrv,vmType){
            self.allList = [];
            self.image = {};
            self.arch = {};
            self.os = {};
            self.osType = [];
            self.archType = [];
            self.images2 = [];
            self.choosen = function(data) {
                self.image.selected = "";
                self.options.img = data.value;
                setOSType();
                setArchType();
                setImage2();
                vmType == "cvm"?self.checkVolumFun(self.arch.selected.size):"";
            };
            self.framework = function(data) {
                self.options.arch = data.value;
                setOSType();
                setArchType();
                setImage2();
            };
            self.os_changed = function() {
                setOSType();
                setArchType();
                setImage2();
                vmType == "cvm"?self.checkVolumFun(self.arch.selected.size):"";
            };
            self.changeArchName = function(image) {
                self.getCacheVolume(image,self.storage.storageDeviceSelected);
                self.getBatchVolum(image,self.storage.storageDeviceSelected);
                self.checkVolumFun(image.size || 0);
                if(vmType == "cvm" && self.createInsForm.selectedFlavor){
                   self.getPrice(self.createInsForm.selectedFlavor.vcpus,self.createInsForm.selectedFlavor.ramCopy)
                }else{
                    self.getPrice()
                }
            };
            //根据传入的参数过滤出镜像公有或私有
            function getImage(is_public = true) {
                return self.allList.filter(img => img.is_public === is_public);
            }
            //在公有和私有类型下返回所有的os_type类型(这里只过滤出Linux和windows类型)
            function getOSType(is_public = true) {
                return getImage(is_public).reduce((list, img) => {
                    img.os_type !== "" &&
                        img.os_type !== null &&
                        (img.os_type.toLowerCase() === "linux" || img.os_type.toLowerCase() === "windows") &&
                        list.indexOf(img.os_type) === -1 && list.push(img.os_type);
                    return list;
                }, []).map(os_type => ({
                    type: $translate.instant("aws.img.osType." + os_type.toLowerCase())
                }));
            }
            //分出公有和私有
            function setOSType() {
                self.osType.splice(0, self.osType.length);
                self.osType.push.apply(self.osType, getOSType(self.options.img === "public"));
                self.image.selected = self.image.selected || self.osType[0]; //默认给出操作系统self.osType[0]，切换操作系统时给出 self.image.selected
                (!self.image.selected) ? self.image.selected = "": "";
            }
            //self.archType存放系统架构
            function setArchType() {
                self.archType.splice(0, self.archType.length);
                self.archType.push.apply(self.archType, getArchType(
                    self.options.img === "public",
                    self.image.selected.type,
                    self.options.arch
                ));
        
            }
            //列出所有的系统架构
            function getArchType(is_public = true /*, os_type = "", arch_type = "" */ ) {
                return getImage(is_public).reduce((list, img) => {
                    img.arch !== "" && list.indexOf(img.arch) === -1 && list.push(img.arch);
                    return list;
                }, []);
            }
            //镜像列表过滤出所选的镜像类型(is_public),系统类型(os_type)，系统架构(arch_type)
            function getImage2(is_public = true, os_type = "", arch_type = "x86_64") {
                let images = getImage(is_public);
                //物理云主机不考虑size
                if (vmType == "pvm") {
                    images = images.filter(img => img.os_type !== "" && img.os_type !== null)
                }else{
                    images = images.filter(img => img.size != null && img.size != 0 && img.os_type !== "" && img.os_type !== null)
                }
                return images
                    .filter(img => $translate.instant("aws.img.osType." + img.os_type.toLowerCase()) === os_type)
                    .filter(img => img.arch === arch_type)
                    .filter(img => img.name !== "");
            }
        
            function setImage2() {
                self.images2.splice(0, self.images2.length);
                self.images2.push.apply(self.images2, getImage2(
                    self.options.img === "public",
                    self.image.selected.type,
                    self.options.arch
                ));
                self.images2.length == 0 ? self.arch.selected = "" : self.arch.selected = self.images2[0];
                if(vmType == "cvm"){
                    self.getCacheVolume(self.arch.selected,self.storage.storageDeviceSelected)
                    self.getBatchVolum(self.arch.selected,self.storage.storageDeviceSelected);
                    //self.checkVolumFun(self.arch.selected.size);
                }
            }
            self.allvmImages = function(list){
                self.allList.splice(0, self.allList.length);
                self.allList.push.apply(self.allList, list.filter(
                    item => item.status.toUpperCase() == "ACTIVE"
                    && item.disk_format != "iso"));
                setOSType();
                setArchType();
                setImage2();
                self.options.disabled = false;
                self.osList = self.os[self.options.img];
            }

            self.allImages = function(){
                instancesSrv.getImage().then(function(result) {
                    self.allList.splice(0, self.allList.length);
                    self.allList.push.apply(self.allList, result.data.filter(
                        item => item.status.toUpperCase() == "ACTIVE"
                        && item.disk_format != "iso"));
                    setOSType();
                    setArchType();
                    setImage2();
                    self.options.disabled = false;
                    self.osList = self.os[self.options.img];
                });
            }
            return self;
        },
        flavorFunc:function(self,instancesSrv){
            self.flavorNormalList = [];
            self.getFlavors = function(){
                instancesSrv.getFlavors().then(function(result) {
                    if (result && result.data && angular.isArray(result.data)) {
                        _.forEach(result.data, function(val) {
                            val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1) + "GB ";
                            self.flavorNormalList.push(val);
                        });
                        self.options.flavor = self.flavorNormalList[0];
                        let flavor_ram_gb = self.options.flavor.ram / 1024;
                        self.options.flavor.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb ? flavor_ram_gb : flavor_ram_gb.toFixed(1);
                    }
                });
            }
            self.getFlavors()
            return self;
        },
        keypairsFunc:function(self,instancesSrv){
            self.keypairs = {};
            self.getKeypairs = function() {
                instancesSrv.getKeypairs().then(function(result) {
                    if (result && result.data && angular.isArray(result.data)) {
                        result.data.map(item => item.value = item.name);
                        self.keypairsList = [];
                        self.keypairsList.push({
                            name: "",
                            value: $translate.instant("aws.instances.addinstances.keypairChoice")
                        });
                        self.keypairsList.push(...result.data);
                    }
                });
            }
            return self;
        },
        securityFunc:function(self,instancesSrv){
            self.securities = {};
            self.getSecurity = function(){
                instancesSrv.getSecurity().then(function(result) {
                    if (result && result.data && angular.isArray(result.data)) {
                        result.data.map(item => item.value = item.name);
                        self.securityList = [];
                        self.securityList.push(...result.data);
                        self.securityList.forEach(function(item) {
                            if (item.name == 'default') {
                                self.securities.selected = item;
                            }
                        })
                    }
                })
            }
            return self;
        },
        zoneFunc:function(self,instancesSrv,aggregatesSrv){
            self.zone = {};
            self.node = {};
            self.getZone = function(){
                if (self.ADMIN) {
                    instancesSrv.getZone().then(function(result) {
                        if (result && result.data && angular.isArray(result.data)) {
                            operateZone(result.data, "zoneName")
                        }
                    });
                } else {
                    aggregatesSrv.getAggregates().then(function(result) {
                        if (result && result.data && angular.isArray(result.data)) {
                            operateZone(result.data, "availZone")
                        }
                    });
                } 
            }
            self.changeNode=function(nodeData){
                var affinityGroup = self.createInsForm.affinityGroup?self.createInsForm.affinityGroup:self.createInsForm.vmGroupSelected;
                if(affinityGroup && affinityGroup.id && affinityGroup.policies[0]=="anti-affinity"){
                    if(nodeData.name){
                        if(self.insForm.hostNum >1){
                            alertSrv.set("", "选择反亲和性云主机组并且指定启动区域和节点时，云主机数量将设置为1" , "error",3000);
                            self.insForm.hostNum =1
                        }
                    }
                }
            }
            self.changeZone = function(data){
                //self.getZone();
                var nodeList = angular.copy(data.nodeList)
                self.node.selected = data.nodeList[0];
                self.node.list = data.nodeList;
                if(data && data.zoneName){
                    var affinityGroup = self.createInsForm.affinityGroup?self.createInsForm.affinityGroup:self.createInsForm.vmGroupSelected;
                   
                    if(affinityGroup && affinityGroup.id){
                        //亲和性组
                        if(affinityGroup.policies[0] =="affinity"){
                            //有成员
                            if(affinityGroup.members.length>0){
                                 self.list_disabled = true;
                                 affinityGroup.members.map(function(id){
                                    instancesSrv.getServerDetail(id).then(function(result){
                                        if(result && result.data && result.data.hostName){
                                            var node = result.data.hostName ;
                                            var arr = [];
                                            arr.push(data.nodeList[0]);
                                            self.zone.selected.nodeList.map(function(item){
                                                if(item.name == node){
                                                      arr.push(item);
                                                }
                                            })
                                            self.node.list = arr;
                                            self.list_disabled = false;
                                            return ;
                                       }
                                    })
                                 })
                            }

                        }
                        //反亲和性组
                        else{
                            //无成员
                             if(!affinityGroup.members.length){
                            }else{
                                if(self.options.canUseNodes > affinityGroup.members.length){
                                     self.list_disabled = true;
                                     affinityGroup.members.map(function(id){
                                        instancesSrv.getServerDetail(id).then(function(item){
                                           if(item && item.data){
                                                var node = item.data.hostName ;
                                                self.zone.selected.nodeList.map(function(res,index){
                                                    if(res.value == node){
                                                        nodeList.splice(index,1);
                                                        self.node.list = nodeList;
                                                        self.list_disabled = false;
                                                        }
                                                    });  
                                                 }
                                            })
                                        })
                                }
                            }
                        }
                    }
                }
            }
            function operateZone(data, zoneName) {
                data = data.filter(val => val.zoneName != "internal");
                self.zoneList = [];
                self.zoneList.push({
                    zoneName: "",
                    value: $translate.instant("aws.instances.addinstances.launchAreaChoice"),
                    nodeList: [{
                        name: "",
                        value: $translate.instant("aws.instances.addinstances.launchNodeChoice")
                    }]
                })

                self.zoneInit = data.map(item => {
                    item.nodeList = [];
                    item.nodeList.push({
                        name: "",
                        value: $translate.instant("aws.instances.addinstances.launchNodeChoice")
                    })
                    item.zoneName = item[zoneName]
                    item.value = item[zoneName];
                    if (zoneName == "zoneName") {
                        for (let hostname in item.hosts) {
                            item.nodeList.push({
                                name: hostname,
                                value: hostname
                            });
                        }
                    } else {
                        item.hosts.map(val => {
                            item.nodeList.push({
                                name: val,
                                value: val
                            });
                        })
                    }
        
                    return item;
                });
                self.zoneList.push(...self.zoneInit)
            }
            self.getZone();
            return self;
        },
        quotaFunc:function(self,instancesSrv,cvmViewSrv,depviewsrv){
            //获取项目下云主机的配额,并判断
            function initproQuotaUsage(){
                self.instancesquota = {
                    used: 0
                };
                self.coresquota = {
                    used: 0
                };
                self.ramquota = {
                    used: 0
                };
                self.volumesquota = {
                    used: 0
                };
                self.phy_instancesquota = {
                    used: 0
                };
                self.gigabytesquota = {
                    used: 0
                };
            }
            function initdomQuotaUsage(){
                self.instancesDomquota = {
                    used: 0
                };
                self.coresDomquota = {
                    used: 0
                };
                self.ramDomquota = {
                    used: 0
                };
                self.volumesDomquota = {
                    used: 0
                };
                self.phy_instancesDomquota = {
                    used: 0
                };
                self.gigabytesDomquota = {
                    used: 0
                };
            }

            self.getproQuotas = function(flavor) {
                var insQuotapost = {
                    type: "project_quota",
                    targetId: localStorage.projectUid,
                    enterpriseUid: localStorage.enterpriseUid
                };
                initproQuotaUsage();
                cvmViewSrv.getproQuotas(insQuotapost).then(function(result) {
                    if (result && result.data && result.data.length) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes" || item.name=="phy_instances" || item.name == "gigabytes") {
                                self[item.name + "quota"].total = item.hardLimit;

                            }
                        });
                        self.testProQuota(flavor, 1); //初始化的时候检查配额
                    }
                });
            }

            self.getdomQuotas = function(flavor) {
                initdomQuotaUsage();
                depviewsrv.getQuotaTotal(localStorage.domainUid).then(function(result) {
                    if (result && result.data && result.data.length) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes" || item.name=="phy_instances" || item.name == "gigabytes") {
                                self[item.name + "Domquota"].total = item.hardLimit;
                            }
                        });
                        self.testDomQuota(flavor, 1); //初始化的时候检查配额
                        
                    }
                });
            }
            self.testProQuotaFunc = function(val,num){
                if(!val) return;
                (val.vcpus * num > self.coresquota.total - self.coresquota.used) ? self.coreProText = $translate.instant("aws.instances.quota.proCpu"): self.coreProText = "";
                (val.ram * num > self.ramquota.total - self.ramquota.used) ? self.ramProText = $translate.instant("aws.instances.quota.proRam"): self.ramProText = "";
                (num > self.instancesquota.total - self.instancesquota.used) ? self.insProText = $translate.instant("aws.instances.quota.proIns"): self.insProText = "";
                //(num > self.volumesquota.total - self.volumesquota.used) ? self.volumesProText = $translate.instant("aws.instances.quota.proVolumes"): self.volumesProText = "";
                (1 > self.phy_instancesquota.total - self.phy_instancesquota.used) ? self.phyinsProText = $translate.instant("aws.instances.quota.proPhyIns"): self.phyinsProText = "";
                self.proPhyInsNum = {
                    icon: true,
                    total: self.phy_instancesquota.total,
                    used: self.phy_instancesquota.used,
                    showUsed: 1
                };
            };

            self. testDomQuotaFunc = function(val,num){
                if(!val) return;
                (val.vcpus * num > self.coresDomquota.total - self.coresDomquota.used) ? self.coreDomText = $translate.instant("aws.instances.quota.domCpu"): self.coreDomText = "";
                (val.ram * num > self.ramDomquota.total - self.ramDomquota.used) ? self.ramDomText = $translate.instant("aws.instances.quota.domRam"): self.ramDomText = "";
                (num > self.instancesDomquota.total - self.instancesDomquota.used) ? self.insDomText = $translate.instant("aws.instances.quota.domIns"): self.insDomText = "";
                //(num > self.volumesDomquota.total - self.volumesDomquota.used) ? self.volumesDomText = $translate.instant("aws.instances.quota.domVolumes"): self.volumesDomText = "";
                (1 > self.phy_instancesDomquota.total - self.phy_instancesDomquota.used) ? self.phyinsDomText = $translate.instant("aws.instances.quota.domPhyIns"): self.phyinsDomText = "";
                self.domPhyInsNum = {
                    icon: true,
                    total: self.phy_instancesDomquota.total,
                    used: self.phy_instancesDomquota.used,
                    showUsed: num
                };
            };

            self.testProVolQuotaFunc = function(num,volumeCount,volumeSize=0){
                (num*volumeCount > self.volumesquota.total - self.volumesquota.used) ? self.volumesProText = $translate.instant("aws.instances.quota.proVolumes"): self.volumesProText = "";
                (num*volumeSize > self.gigabytesquota.total - self.gigabytesquota.used) ? self.gigabytesProText = $translate.instant("aws.instances.quota.proGigabytes"): self.gigabytesProText = "";
            
            }
            self.testDomVolQuotaFunc = function(num,volumeCount,volumeSize=0){
                (num*volumeCount > self.volumesDomquota.total - self.volumesDomquota.used) ? self.volumesDomText = $translate.instant("aws.instances.quota.domVolumes"): self.volumesDomText = "";
                (num*volumeSize > self.gigabytesDomquota.total - self.gigabytesDomquota.used) ? self.gigabytesDomText = $translate.instant("aws.instances.quota.domGigabytes"): self.gigabytesDomText = "";
            }

            self.testProQuota = function(val, num) {
                var postData = {
                    type: "project_quota",
                    domainUid: localStorage.domainUid,
                    projectUid: localStorage.projectUid,
                    enterpriseUid: localStorage.enterpriseUid
                };
                cvmViewSrv.getProused(postData).then(function(result) {
                    if (result && result.data) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes"|| item.name=="phy_instances" || item.name == "gigabytes") {
                                self[item.name + "quota"].used = item.inUse;
                            }
                        });
                        self.testProQuotaFunc(val, num)
                    }
                });
            };
            self.testDomQuota = function(val, num) {
                depviewsrv.getQuotaUsed(localStorage.domainUid).then(function(result) {
                    if (result && result.data) {
                        _.forEach(result.data, function(item) {
                            if (item.name == "instances" || item.name == "cores" || item.name == "ram" || item.name == "volumes" || item.name=="phy_instances" || item.name == "gigabytes") {
                                self[item.name + "Domquota"].used = item.inUse;
                            }
                        });
                        self. testDomQuotaFunc(val, num)
                    }
                });
            };
            return self;
        },
        getHostAreaChartFunc: function(self, hostAreaChartSqlParams, AreaPanelDefault) {

            //根据时间范围设置查询精度
            function setSqlPrecision(range) {
                if (range >= 0 && range < 24) {
                    self.filterData.precision = 300;
                } else if (range >= 24 && range < 24 * 7) {
                    self.filterData.precision = 3600;
                } else if (range >= 24 * 7) {
                    self.filterData.precision = 86400;
                }
            }

            //获取起止总时间，单位h
            function getRangeHours(start, end) {
                var rangeHours = void 0;
                var _start = new Date(start);
                var _end = new Date(end);
                var diffTime = _end.getTime() - _start.getTime();
                var diffDays = Math.floor(diffTime / (24 * 3600 * 1000));
                var leave1 = diffTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
                var diffHours = Math.floor(leave1 / (3600 * 1000));
                rangeHours = diffDays * 24 + diffHours;
                return rangeHours;
            }

            function panelsDataFunc(item, key, rangeHours,type) {
                self.panels[key] = (self.panels[key]).slice((self.panels[key]).length, 0);
                var areaChart = new AreaPanelDefault();
                var chart = key;
                areaChart.panels.title = $translate.instant("aws.monitor." + item.chartPerm.title);
                areaChart.panels.unit = item.chartPerm.unit;
                areaChart.panels.priority = item.chartPerm.priority;
                areaChart.panels.type = item.chartPerm.type;
                areaChart.panels.legend = item.chartPerm.legend;
                areaChart.panels.chart = chart;
                if (rangeHours && rangeHours > 24) {
                    //大于24小时，坐标轴显示日期
                    areaChart.panels.xAxisType = "date";
                }
                if (self.filterData.from) {
                    areaChart.panels[chart + "StartTime"] = new Date(self.filterData.from);
                    areaChart.panels[chart + "EndTime"] = new Date(self.filterData.to);
                }

                let valueFormats = function(d) {
                    var _d;
                    var valueFormatter;
                    var decimalPos = String(d).indexOf(".");
                    var tickDecimals = decimalPos === -1 ? 0 : String(d).length - decimalPos - 1;
                    if (areaChart.panels.unit) {
                        var formatType = areaChart.panels.unit;
                        if (kbnSrv.valueFormats[formatType]) {
                            valueFormatter = kbnSrv.valueFormats[formatType];
                            _d = valueFormatter(d, tickDecimals);
                        } else {
                            valueFormatter = kbnSrv.valueFormats.special;
                            _d = valueFormatter(d, tickDecimals, formatType);
                        }
                    } else {
                        valueFormatter = kbnSrv.valueFormats.none;
                        _d = valueFormatter(d, tickDecimals);
                    }
                    return _d;
                };
                if(item.sqlPerm.chart=='cpu'||item.sqlPerm.chart=='memory'){
                    if(item.sqlPerm.precision==86400){
                        item.sqlPerm.startTimeMillis = item.sqlPerm.startTimeMillis+8*3600000
                        item.sqlPerm.endTimeMillis = item.sqlPerm.endTimeMillis+8*3600000
                    }else{
                        item.sqlPerm.startTimeMillis = item.sqlPerm.startTimeMillis+(item.sqlPerm.precision*1000)

                    }
                }
                phyhostSrv.chartQuery(
                    item.sqlPerm
                ).then(function(res) {
                    if (res && res.data && res.data.values.length > 0) {
                        if (key == "diskPath") {
                            self[key + "_csv_info"] = "(" + item.sqlPerm.path + ")" + $translate.instant("aws.monitor.csvTitle." + key) + "\n";
                        } else if (key == "diskio") {
                            self[key + "_csv_info"] = "(" + item.sqlPerm.disk + ")" + $translate.instant("aws.monitor.csvTitle." + key) + "\n";
                        }else if (key == "netcard") {
                            self[key + "_csv_info"] = "(" + item.sqlPerm.interface + ")" + $translate.instant("aws.monitor.csvTitle." + key) + "\n";
                        } else {
                            self[key + "_csv_info"] = $translate.instant("aws.monitor.csvTitle." + key) + "\n";
                        }

                        if(key == "cpu") {
                            self.phyHostNoData = false;
                        }

                        _.each(angular.copy(res.data.columns), function(item, i) {
                            item = $translate.instant("aws.monitor." + item);
                            self[key + "_csv_info"] += item + (i == res.data.columns.length - 1 ? "\n" : ",");
                        });
                        _.each(angular.copy(res.data.values), function(val) {
                            _.each(res.data.columns, function(item, i) {
                                val[0] = moment(new Date(val[0])).format("YYYY-MM-DD HH:mm:ss");
                                if (i > 0) {
                                    val[i] = valueFormats(val[i]);
                                }
                                self[key + "_csv_info"] += val[i] + (i == res.data.columns.length - 1 ? "\n" : ",");
                            });
                        });

                        if(key == "diskio" || key == "netcard"){
                            self.csv_info_obj[key + "_csv_info"] += self[key + "_csv_info"] +"\n\n\n"; 
                        }else{
                            self.csv_info_obj[key + "_csv_info"] = self[key + "_csv_info"]; 
                        }

                        self.csv_info += self[key + "_csv_info"] + "\n\n\n";

                        if(key == "mem" && type == "win"){
                            res.data.columns = res.data.columns.filter(function(key) {
                                return key !== "memory_buff_or_cache_percent";
                            });
                        }
                        areaChart.panels.data.push(res.data);
                    } else {
                        if(key == "cpu") {
                            self.phyHostNoData = true;
                        }
                        let _start, _end;
                        if (self.filterData.from || self.filterData.to) {
                            _start = new Date(self.filterData.from);
                            _end = new Date(self.filterData.to);
                        } else {
                            _start = moment().subtract(30, "m");
                            _end = moment();
                        }
                        let defaultChartData = {
                            "columns": ["time", item.chartPerm.title],
                            "values": [
                                [_start, 0],
                                [_end, 0]
                            ],
                            "default": true
                        };
                        areaChart.panels.data.push(defaultChartData);

                    }
                    var hasChartData = false;
                    for(var i = 0; i < self.panels[key].length; i++) {
                        if(self.panels[key][i].priority == areaChart.panels.priority) {
                            hasChartData = true;
                            break;
                        }
                    }
                    if(!hasChartData) {
                        self.panels[key].push(areaChart.panels);
                    }
                    $rootScope.loading = true;
                });
            }

            self.getHostAreaChart = function(regionKey, hostId, filterData, type) {
                // let regionKey = filterData.selectedZonetype.regionKey;
                // let hostId = filterData.selectedZonehost.nodeUid;
                if(!filterData.precision) {
                    let rangeHours = getRangeHours(filterData.from, filterData.to);
                    setSqlPrecision(rangeHours);
                }
                self.panels = {};
                self.csv_info = "";
                self.csv_info_obj = {};

                self.diskPath = {
                    options: []
                };
                self.diskio = {
                    options: []
                };
                self.netCard = {
                    options: []
                };

                
                let hostChartPermas = new hostAreaChartSqlParams(regionKey, hostId, filterData, null, type);
                for (let key in hostChartPermas.chartSqls) {
                    self.panels[key] = [];
                    if (key == "cpu" || key == "mem" || key == "system") {
                        _.each(hostChartPermas.chartSqls[key], function(item) {
                            panelsDataFunc(item, key,null,type);
                        })
                    }
                }

                phyhostSrv.getHostDiskPartition(regionKey, hostId).then(function(res) {
                    if (res && res.data) {
                        self.diskPath.options = self.diskPath.options.slice(self.diskPath.options.lenght, 0);
                        _.each(res.data, function(item) {
                            self.diskPath.options.push(item.name);
                        })
                        self.diskPath.options = self.diskPath.options.filter(function(item) {
                            if (item.indexOf("awstack") < 0) {
                                return item;
                            }
                        });
                        self.diskPath.options = _.uniq(self.diskPath.options);
                        self.filterData.diskPath = self.diskPath.options;
                        self.filterData.selectedDiskpath = self.diskPath.options[0];

                        function diskPathFunc(selectedDiskpath) {
                            var diskPathChartPermas = new hostAreaChartSqlParams(regionKey, hostId, filterData, selectedDiskpath, type);
                            self.csv_info_obj.diskPath_csv_info = "";
                            _.each(diskPathChartPermas.chartSqls.diskPath,function(item){
                                item.chartPerm.title = 'disk_used_percent';
                                panelsDataFunc(item, "diskPath");
                            });
                            
                        };
                        diskPathFunc(self.filterData.selectedDiskpath);

                        self.changeDiskpath = function(diskPath) {
                            self.panels.diskPath = self.panels.diskPath.slice(self.panels.diskPath.length, 0);
                            diskPathFunc(diskPath);
                        };
                    }
                });

                if (type != "win") {
                    phyhostSrv.getHostdisk(regionKey, hostId).then(function(res) {
                        if (res && res.data) {
                            self.diskio.options = self.diskio.options.slice(self.diskio.options.lenght, 0);
                            _.each(res.data, function(item) {
                                self.diskio.options.push(item.name);
                            })
                            self.filterData.selectedDiskio = self.diskio.options[0];

                            function diskioChartFunc(selectedDiskio) {
                                var diskioChartPermas = new hostAreaChartSqlParams(regionKey, hostId, filterData, selectedDiskio, type);
                                self.csv_info_obj.diskio_csv_info = "";
                                _.each(diskioChartPermas.chartSqls.diskio, function(item) {
                                    panelsDataFunc(item, "diskio");
                                });
                            };
                            diskioChartFunc(self.filterData.selectedDiskio);

                            self.changeDiskio = function(diskio) {
                                self.panels.diskio = self.panels.diskio.slice(self.panels.diskio.length, 0);
                                diskioChartFunc(diskio);
                            };
                        }
                    });
                }

                phyhostSrv.getHostNetcard(regionKey, hostId).then(function(res) {
                    if (res && res.data) {
                        self.netCard.options = self.netCard.options.slice(self.netCard.options.lenght, 0);
                        _.each((res.data).filter(function(val) {
                            return val.name != "all";
                        }), function(item) {
                            self.netCard.options.push(item.name);
                        });
                        self.filterData.selectedNetCard = self.netCard.options[0];

                        function netcardChartFunc(selectedNetCard) {
                            var netcardChartPermas = new hostAreaChartSqlParams(regionKey, hostId, filterData, selectedNetCard, type);
                            self.csv_info_obj.netcard_csv_info = "";
                            _.each(netcardChartPermas.chartSqls.netcard, function(item) {
                                panelsDataFunc(item, "netcard");
                            });
                        };
                        netcardChartFunc(self.filterData.selectedNetCard);

                        self.changeNetCard = function(netcard) {
                            self.panels.netcard = self.panels.netcard.slice(self.panels.netcard.length, 0);
                            netcardChartFunc(netcard);
                        };
                    }
                });
                

            };

            self.downloadData = function() {
                let csv_info = "";
                for(let key in self.csv_info_obj){
                    if(key == "diskio_csv_info" || key == "netcard_csv_info"){
                        csv_info += self.csv_info_obj[key];
                    }else{
                        csv_info += self.csv_info_obj[key] + "\n\n\n";
                    }
                }
                var blob = new Blob(
                    [csv_info], {
                        type: "text/csv;charset=utf-8;"
                    }
                );
                FileSaver.saveAs(blob, "监控视图数据导出.csv");
            };

            return self;
        },
        getSqlDatabaseChartFunc: function(self, sqlDatabaseParams, AreaPanelDefault) {

            //根据时间范围设置查询精度
            function setSqlPrecision(range) {
                if (range >= 0 && range < 24) {
                    self.filterData.precision = 300;
                } else if (range >= 24 && range < 24 * 7) {
                    self.filterData.precision = 3600;
                } else if (range >= 24 * 7) {
                    self.filterData.precision = 86400;
                }
            }

            //获取起止总时间，单位h
            function getRangeHours(start, end) {
                var rangeHours = void 0;
                var _start = new Date(start);
                var _end = new Date(end);
                var diffTime = _end.getTime() - _start.getTime();
                var diffDays = Math.floor(diffTime / (24 * 3600 * 1000));
                var leave1 = diffTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
                var diffHours = Math.floor(leave1 / (3600 * 1000));
                rangeHours = diffDays * 24 + diffHours;
                return rangeHours;
            }

            function panelsDataFunc(item, key, rangeHours,type,clustername) {
                self.panels[key] = (self.panels[key]).slice((self.panels[key]).length, 0);
                var areaChart = new AreaPanelDefault();
                var chart = key;
                areaChart.panels.title = $translate.instant("aws.monitor." + item.chartPerm.title);
                areaChart.panels.unit = item.chartPerm.unit;
                areaChart.panels.priority = item.chartPerm.priority;
                areaChart.panels.type = item.chartPerm.type;
                areaChart.panels.legend = item.chartPerm.legend;
                areaChart.panels.chart = chart;
                if (rangeHours && rangeHours > 24) {
                    //大于24小时，坐标轴显示日期
                    areaChart.panels.xAxisType = "date";
                }
                //处理开始和结束事件的格式
                if (self.filterData.from) {
                    areaChart.panels[chart + "StartTime"] = new Date(self.filterData.from);
                    areaChart.panels[chart + "EndTime"] = new Date(self.filterData.to);
                }
                item.sqlPerm.clustername=clustername;
                phyhostSrv.chartQueryTest(
                    item.sqlPerm
                ).then(function(res) {
                    if (res && res.data && res.data.values.length > 0) {
                        areaChart.panels.data.push(res.data);
                    } else {
                        let _start, _end;
                        if (self.filterData.from || self.filterData.to) {
                            _start = new Date(self.filterData.from);
                            _end = new Date(self.filterData.to);
                        } else {
                            _start = moment().subtract(30, "m");
                            _end = moment();
                        }
                        let defaultChartData = {
                            "columns": ["time", item.chartPerm.title],
                            "values": [
                                [_start, 0],
                                [_end, 0]
                            ],
                            "default": true
                        }
                        areaChart.panels.data.push(defaultChartData);
                    }
                    self.panels[key].push(areaChart.panels);
                    $rootScope.loading = true;
                });
            }

            self.getHostAreaChart = function(regionKey, filterData, type,clustername) {
                if(!filterData.precision) {
                    let rangeHours = getRangeHours(filterData.from, filterData.to);
                    setSqlPrecision(rangeHours);
                }
                self.panels = {};  
                let sqlChartPermas = new sqlDatabaseParams(regionKey, filterData, null, type);
                for (let key in sqlChartPermas.chartSqls) {
                    self.panels[key] = [];
                    if (key == "disk_usage_avg"||key == "index_speed"||key == "index_total") {
                        _.each(sqlChartPermas.chartSqls[key], function(item) {
                            panelsDataFunc(item, key,null,type,clustername);
                        });
                    }
                }
            };

            return self;
        },
        getDiskPartitionFunc: function(self, phyhostSrv) {
            self.diskPathUsageTop5Data = [];
            self.diskPathUsageData = [];
            self.diskTotal = 0;
            self.diskUsageTotal = 0;
            self.diskTotals = 0;
            self.diskUsageTotals = 0;
            self.getDiskPartition = function(filterData) {
                var diskTotal = 0,
                    diskUsageTotal = 0,
                    diskTotals = 0,
                    diskUsageTotals = 0;
                phyhostSrv.getDiskPartition(filterData.selectedZonetype.regionKey, filterData.selectedZonehost.nodeUid).then(function(res) {
                    if (res && res.data) {
                        self.diskPathUsageTop5Data = self.diskPathUsageTop5Data.slice(self.diskPathUsageTop5Data.length, 0);
                        self.diskPathUsageData = self.diskPathUsageData.slice(self.diskPathUsageData.length, 0);
                        var dataMap = res.data.filter(function(item) {
                            item.usedPercent = Number(item.used) / Number(item.total);
                            if (item.path.indexOf("awstack") < 0) {
                                return item;
                            }
                        });
                        _.map(_.sortBy(dataMap, "usedPercent").reverse(), function(item, i) {
                            if (i > 4) {
                                self.getNum = true;
                                return;
                            } else {
                                self.getNum = false;
                            }
                            self.diskPathUsageTop5Data.push({
                                name: item.path,
                                inUsed: (Number(item.used)).toFixed(2),
                                total: (Number(item.total)).toFixed(2),
                                type: "text",
                                unit: "GB"
                            });
                            diskTotal += Number(item.total);
                            diskUsageTotal += Number(item.used);
                        })
                        //self.diskTotal = diskTotal.toFixed(2);
                        //self.diskUsageTotal = diskUsageTotal.toFixed(2);

                        /*磁盘详情数据处理*/
                        _.map(_.sortBy(dataMap, "usedPercent").reverse(), function(item, i) {
                            self.diskPathUsageData.push({
                                name: item.path,
                                inUsed: (Number(item.used)).toFixed(2),
                                total: (Number(item.total)).toFixed(2),
                                type: "text",
                                unit: "GB"
                            });
                            diskTotals += Number(item.total);
                            diskUsageTotals += Number(item.used);
                        })
                        self.diskTotals = diskTotals.toFixed(2);
                        self.diskUsageTotals = diskUsageTotals.toFixed(2);
                    }
                });
            }
            return self
        },
        getprocessMemFunc: function(self, phyhostSrv) {
            self.processMemTop5Data = [];
            self.getprocessMem = function(filterData) {
                phyhostSrv.processMem(self.filterData.selectedZonetype.regionKey, self.filterData.selectedZonehost.nodeUid).then(function(res) {
                    self.processMemTop5Data = self.processMemTop5Data.slice(self.processMemTop5Data.length, 0);
                    if (res && res.data) {
                        _.map(res.data, function(item, i) {
                            if (i > 4) {
                                return
                            }
                            self.processMemTop5Data.push({
                                name: item.processName,
                                inUsed: ((Number(item.mem)) / 100).toFixed(3),
                                total: 1,
                                type: "percent"
                            });
                        })
                    }
                });
            }
            return self;
        },
        domainTranslate:function(self,optionObj,callbackFunc){
            self[optionObj] ={};
            function getRegionList(){
                $http({
                    method: "GET",
                    url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions"
                }).then(function(res) {
                    if(res&&res.data){
                        self.regionList = res.data.filter(item=>{
                            return item.status==3;
                        })
                        self[optionObj].regionList =  res.data;
                        self[optionObj].regionList.forEach(item=>{
                            if(item.regionKey==localStorage.regionKey){
                                self[optionObj].regionSelected = item;
                            }
                        })
                        getDomain()
                    }
                })
            }
            function getDomain(){
                createInsSrv.getDomain().then(function(res) {
                    if (res && res.data) {
                        self[optionObj].domainList = res.data;
                        for (var i = 0; i < self[optionObj].domainList.length; i++) {
                            if (self[optionObj].domainList[i].domainUid == 'default') {
                                self[optionObj].domainList[i].disDomainName = '默认部门';
                            } else {
                                self[optionObj].domainList[i].disDomainName = self[optionObj].domainList[i].domainName;
                            }
                            if (self[optionObj].domainList[i].projects && self[optionObj].domainList[i].projects.length > 0) {
                                for (var j = 0; j < self[optionObj].domainList[i].projects.length; j++) {
                                    if (self[optionObj].domainList[i].projects[j].projectName == 'admin' && self[optionObj].domainList[i].domainUid == 'default') {
                                        self[optionObj].domainList[i].projects[j].disProjectName = '默认项目';
                                    } else {
                                        self[optionObj].domainList[i].projects[j].disProjectName = self[optionObj].domainList[i].projects[j].projectName;
                                    }
                                }
                            }
                        }
                        callbackFunc()
                    }
                });
            }
            getRegionList()
            
        },
        bossSourceFunc:function(context,value,options,url){
            var showPriceTip = $rootScope.billingActive;
            var priceData = {}
            if(!showPriceTip) {
                return;
            }
            function priceDataFunc(data){
                this.priceHour = data;
                this.priceHourAbout = data.toFixed(2);
                this.priceMonth = (data * 24 * 30).toFixed(2);
            }
            if(value){
                createInsSrv.getResourPrice(options,url).then(function(result) {
                    if(result && result.data && !isNaN(result.data)) {
                        priceDataFunc.call(context,result.data)
                    }
                });
            }else{
                //计费置为0
                priceDataFunc.call(context,0)
                
            }
        }
    };
}]);
