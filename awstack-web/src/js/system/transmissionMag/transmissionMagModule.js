import "./transmissionMagSrv";

var TransMagaModule = angular.module("TransMagaModule", ["TransMagaApi"])
.controller("TransMagaCtrl", ['$routeParams','$scope', '$rootScope', '$location', 'TransMagaSrv', '$translate','GLOBAL_CONFIG','TableCom','modalCom',
function($routeParams,$scope, $rootScope, $location, TransMagaSrv, $translate,GLOBAL_CONFIG,TableCom,modalCom) {
    var self = $scope ;
    self.checkFirst = {
        checked: false,
        items: {}
    };
    self.TransMaga_search={};

    var initTransMaga = function(){
         TransMagaSrv.gitInstanceList().then(function(res){
            if(res&&res.data){
                self.TransMagaData = res.data.map(function(item){
                    item.status_load = item.status?"已加载":"未加载"
                    item.searchTerm = [item.serverName,item.hostName,item.deviceType,item.status_load,item.description].join("\b")
                    return item
                })
                TableCom.init(self,'TransMagaTable',self.TransMagaData,'id',GLOBAL_CONFIG.PAGESIZE,'checkFirst');
            }
        })
    }
    initTransMaga();

    self.applyGlobalSearch = function() {
        self.TransMagaTable.filter({
            searchTerm: self.TransMaga_search.globalSearchTerm
        });
    };
    self.refreshTransMaga = function(){
        initTransMaga()
    }

    // 监听主页的单选框，控制操作按钮的状态
    self.$watch(function() {
        return self.checkFirst.items;//监控checkbox
    }, function(val) {
        self.checkedItems = [];
        var arr=[];
        for(var i in self.checkFirst.items){
            arr.push(self.checkFirst.items[i])
        }
        self.checkRelation = null;
        self.checkRelieve = null;
        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.TransMagaData.forEach(item=>{
                        if(item.id==key){
                            self.checkedItems.push(item);
                        }
                    })
                }
            }
        }
        if(self.checkedItems.length==1){
            if(self.checkedItems[0].serverStatus=="shutoff"||self.checkedItems[0].serverStatus=="active"){
                self.canUnload = true;
            }else{
                self.canUnload = false;
            }    
            self.canAdd = true;
        }else if(self.checkedItems.length>1){
            self.canAdd = true;
            self.canUnload = false;
        }else if(self.checkedItems.length==0){
            self.canAdd = true;
            self.canUnload = false;
        }
    },true);

    //详情
    self.$watch(function(){
        return $location.search().id
    },function(ne,old){
        if(!ne||ne==old) return
        let serverId = ""
        let id = $location.search().id;
        self.TransMagaData.forEach(function(item){
            if(item.id == id){
                serverId = item.serverId
            }
        })
        let enterpriseUid = localStorage.enterpriseUid
        let domainName = localStorage.domainName
        let projectName = localStorage.projectName
        TransMagaSrv.getInstancesDetails(enterpriseUid,id,serverId).then(function(res){
            if(res&&res.data){
                self.InstancesDetails = res.data
                self.InstancesDetails.domainName = domainName
                self.InstancesDetails.projectName = projectName
            }
        })
    })

    // 加载信息
    self.loadTransMaga = function(data) {
        var createTransMaga = modalCom.init('createTransMaga.html',"createTransMagaCtrl",{refresh:function(){return initTransMaga},context:function(){return self},editData:function(){return data}})
    };
    // 卸载
    self.uninstallTransMaga = function(checkedItems) {
        var content = {
            target: "uninstallTransMaga",
            msg: "<span>" + $translate.instant("aws.transmissionMag.confirm-uninstall-equipment") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("uninstallTransMaga", function(e,data) {
        if(self.checkedItems.length>0){
            if(self.checkedItems[0].deviceType == "USB"){
                let id = self.checkedItems[0].serverId
                let postData = {
                    usbPort:self.checkedItems[0].usbPort,
                    usbBus:self.checkedItems[0].usbBus,
                    addressBus:self.checkedItems[0].addressBus,
                    addressDevice:self.checkedItems[0].addressDevice,
                }
                TransMagaSrv.unloadTtEquipment(id,postData).then(function(res){
                    initTransMaga();
                })
            }else if(self.checkedItems[0].deviceType == "GPU"){
                let id = self.checkedItems[0].serverId;
                let postData = {
                    bus:self.checkedItems[0].gpuId.split(":")[0],
                    slot:self.checkedItems[0].gpuId.split(":")[1].split(".")[0],
                    function:self.checkedItems[0].gpuId.split(":")[1].split(".")[1],
                    gpuId:self.checkedItems[0].gpuId
                }
                TransMagaSrv.unloadGpuTtEquipment(id,postData).then(function(res){
                    initTransMaga();
                })
            }
        }
    });  
}])
.controller("createTransMagaCtrl", ["$scope", "$rootScope","$translate","GLOBAL_CONFIG","$uibModalInstance","TransMagaSrv","refresh",
function($scope, $rootScope, $translate, GLOBAL_CONFIG,$uibModalInstance,TransMagaSrv,refresh) {
    var self = $scope;
    self.noCanLoadusbEquipment = false   
    self.noCanLoadgpuEquipment = false   
    self.limitUsbDriveType = false
    self.limitGpuDriveType = false   
    self.loadData = false //数据加载中，不可点击透传类型选项  
    self.TransMagaMsg = {
        instanceName:""
    }       
    
    self.hasAddEquipmentList = [
        {name:"USB设备",deviceType:"USB"},
        {name:"GPU设备",deviceType:"GPU"}        
    ]
    self.deviceType = {
        name:self.hasAddEquipmentList[0]
    }

    self.compatibilityList = [
        {name:"USB2.0",compatibility:"0"},
        {name:"USB3.0",compatibility:"1"}
    ]

    self.compatibility = {
        name:self.compatibilityList[0]
    }

    // 第一次进入，显示usb设备
    choiceInstancesByUsb()

    // usb设备可加载的云主机列表筛选
    // 开机，关机状态，只可加载3条usb设备
    function choiceInstancesByUsb(){
        TransMagaSrv.getInstancesList().then(function(res){
            self.TransMagaList = []
            if(res&&res.data&&res.data.length>0){
                res.data.forEach(function(item){
                    if(item.status == "shutoff" || item.status == "active"){
                        if(item.passthrough_devices){
                            if(item.passthrough_devices.length>0){
                                let count = 0
                                item.passthrough_devices.forEach(function(val){
                                    if(val.device_type=="USB"){
                                        count ++
                                    }
                                })
                                if(count<3){
                                    self.TransMagaList.push(item)
                                }
                            }else{
                                self.TransMagaList.push(item)
                            }  
                        }
                    }
                })
                if(self.TransMagaList.length>0){
                    // self.TransMagaList = res.data
                    self.TransMagaMsg.instanceName = self.TransMagaList[0]
                    self.serverId = self.TransMagaList[0].id
                    self.serverName = self.TransMagaList[0].name
                    getTtequipmentList(self.serverId)
                }
            }
        })
    }

    // usb设备可加载的云主机列表筛选
    // 开机，关机状态，加载条数3
    function choiceInstancesByGpu(){
        TransMagaSrv.getInstancesList().then(function(res){            
            self.TransMagaList = []
            if(res&&res.data&&res.data.length>0){
                res.data.forEach(function(item){
                    if(item.status == "shutoff" || item.status == "active"){
                        if(item.passthrough_devices){
                            if(item.passthrough_devices.length>0){
                                let count = 0
                                item.passthrough_devices.forEach(function(val){
                                    if(val.device_type=="GPU"){
                                        count ++
                                    }
                                })
                                if(count<3){
                                    self.TransMagaList.push(item)
                                }
                            }else{
                                self.TransMagaList.push(item)
                            }  
                        }
                    }
                })
                if(self.TransMagaList.length>0){
                    // self.TransMagaList = res.data
                    self.TransMagaMsg.instanceName = self.TransMagaList[0]
                    self.serverId = self.TransMagaList[0].id
                    self.serverName = self.TransMagaList[0].name
                    getGpuTtequipmentList(self.serverId)
                }
            }
        })
    }

    
    // 云主机下拉框显示改变事件
    self.choiceInstances = function(item){
        self.serverId = item.id
        self.serverName = item.name  
        self.loadData = false              
        if(self.deviceType.name.deviceType == "USB"){ 
            getTtequipmentList(self.serverId)
        }else if(self.deviceType.name.deviceType == "GPU"){                 
            getGpuTtequipmentList(self.serverId)
        }
    }

    // 获取usb类型的透传设备详情列表
    function getTtequipmentList(serverId){
        self.loadData = true
        self.equipmentList = []  
        TransMagaSrv.getTtequipmentList(serverId).then(function(res){
            if(res&&res.data&&res.data.length>0){
                res.data.forEach(function(item){
                    if(!item.loading){
                        self.equipmentList.push(item)
                    }
                })
                if(self.equipmentList.length>0){
                    self.ttEquipmentDetails = self.equipmentList[0]
                    self.noCanLoadusbEquipment = false
                }else{
                    self.noCanLoadusbEquipment = true
                }  
            }
        })
    }
    //获取gpu类型的透传设备详情列表
    function getGpuTtequipmentList(serverId){
        self.loadData = true
        self.equipmentList = []  
        TransMagaSrv.getGpuTtequipmentList(serverId).then(function(res){
            if(res&&res.data&&res.data.length>0){
                res.data.forEach(function(item){
                    if(!item.loading){
                        self.equipmentList.push(item)
                    }
                })
                if(self.equipmentList.length>0){
                    self.ttEquipmentDetails = self.equipmentList[0]
                    self.noCanLoadgpuEquipment = false
                }else{
                    self.noCanLoadgpuEquipment = true
                }  
            }
        })
    }

    //设备类型改变事件，影响云主机和设备描述列表
    self.showCompatibilitySelect = true                     
    
    self.choiceDeviceType = function(item){
        self.loadData = false 
        self.equipmentList = []
        if(item.deviceType == "USB"){
            self.showCompatibilitySelect = true 
            self.noCanLoadgpuEquipment = false   
            self.limitUsbDriveType = false
            var serverId=self.TransMagaMsg.instanceName.id;
            getTtequipmentList(serverId);
        }else if(item.deviceType == "GPU"){
            self.showCompatibilitySelect = false
            self.noCanLoadusbEquipment = false   
            self.limitUsbDriveType = false
            var serverId=self.TransMagaMsg.instanceName.id;
            getGpuTtequipmentList(serverId);
        }
    }

    self.getChoiceOne = function(item){
        self.ttEquipmentDetails = item
    }
    let loginData = angular.fromJson(localStorage.$LOGINDATA);
    let regionUid = loginData.regionUid;

    self.addTtEquipmentConFirm = function(){
        if(self.deviceType.name.deviceType == "USB"){
            let postData = {
                serverId : self.serverId ,
                enterpriseUid : localStorage.enterpriseUid,
                regionUid : regionUid,
                regionKey : localStorage.regionKey,
                serverName :  self.serverName,
                hostName : self.ttEquipmentDetails.host,
                deviceType : self.deviceType.name.deviceType,
                description : self.ttEquipmentDetails.description,
                addressBus : self.ttEquipmentDetails.address_bus,
                addressDevice : self.ttEquipmentDetails.address_device,
                usbBus : self.compatibility.name.compatibility,                
            }
            TransMagaSrv.addTtEquipment(self.serverId,postData).then(function(res){
                $uibModalInstance.close();
                refresh()
            })
        }else if(self.deviceType.name.deviceType == "GPU"){
            let postData = {
                serverId:self.serverId,
                enterpriseUid:localStorage.enterpriseUid,
                regionUid:regionUid,
                regionKey:localStorage.regionKey,
                bus:self.ttEquipmentDetails.id.split(":")[0],
                slot:self.ttEquipmentDetails.id.split(":")[1].split(".")[0],
                function:self.ttEquipmentDetails.id.split(":")[1].split(".")[1],
                gpuId:self.ttEquipmentDetails.id,
                serverName: self.serverName,
                deviceType:self.deviceType.name.deviceType,
                description:self.ttEquipmentDetails.desc,
                host:self.ttEquipmentDetails.host,
            }
            TransMagaSrv.addGpuTtEquipment(self.serverId,postData).then(function(res){
                $uibModalInstance.close();
                refresh()
            })
        }
    }
}])

