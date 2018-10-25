angular.module("ticketsApplyModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
    .controller("ticketsApplyCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG) {
      console.log("工单申请");
      var self = scope ;
      getApplyTypes()
      self.apply = function(type){
        switch (type) {
            case "1":
            var $applyQuotaModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "applyQuota.html",
                controller:  "applyQuotaCtrl",
                resolve: {
                       closeModal:function(){
                            return function(){
                                $applyQuotaModal.close()
                            }
                       }               
                }
            });
            break;
            case "2":
            var $applyInsModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "applyIns.html",
                controller:  "applyInsCtrl",
                resolve: {
                       closeModal:function(){
                            return function(){
                                $applyInsModal.close()
                            }
                       }               
                }
            });
            break;
            case "3":
            var $applyVolumesModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "volumesApply.html",
                controller:  "applyVolumesCtrl",
                resolve: {
                       closeModal:function(){
                            return function(){
                                $applyVolumesModal.close()
                            }
                       }               
                }
            });
            break;
            case "4":
            var $applyNetworkModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "networkApply.html",
                controller:  "networkApplyCtrl",
                resolve: {
                       closeModal:function(){
                            return function(){
                                $applyNetworkModal.close()
                            }
                       }               
                }
            });
            break;
            case "5":
            var $applyRouterModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "routerApply.html",
                controller:  "routerApplyCtrl",
                resolve: {
                       closeModal:function(){
                            return function(){
                                $applyRouterModal.close()
                            }
                       }               
                }
            });
            break;
            case "11":
            var $applyInfoModal = $uibModal.open({
                animation: self.animationsEnabled,
                backdrop: 'static',
                templateUrl: "infoApply.html",
                controller:  "infoApplyCtrl",
                resolve: {
                       closeModal:function(){
                            return function(){
                                $applyInfoModal.close()
                            }
                       }               
                }
            });
            break;
        }
      }
      function getApplyTypes(){
        ticketsSrv.getApplyTypes().then(function(data){
            if(data && data.data){
                var applyTyps_res = [];
                var applyTyps_info = [];
                data.data.map(function(item){
                    if(item.type == 10 || item.type == 11 ){
                        applyTyps_info.push(item)
                    }else{
                        applyTyps_res.push(item)
                    }   
                })
                self.applyTyps_info = applyTyps_info ;
                self.applyTyps_res = applyTyps_res ;
            }
        })
      }
    }])
    .controller("applyQuotaCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","closeModal", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,closeModal) {
        console.log("配额申请");
        var self = scope ;
        self.canConfirm = false;
        var domainUid = localStorage.defaultdomainUid ;
        if(localStorage.managementRole == "2" || localStorage.managementRole == "3"){
            self.showProjectChoose = false; 
        }else{
            self.showProjectChoose = true;
        }
        var localData = localStorage.$LOGINDATA ? JSON.parse(localStorage.$LOGINDATA) : [];
        var id = JSON.parse(localStorage.$LOGINDATA).id.toString();
        var resourceData = {
            busiData: {
                applyUserId: "",
                domainUid: "",
                projectUid: "",
                domainName:localStorage.domainName,
                quota:""
            },
            key: ""
        };
        scope.tickets = {
            depart: {selected: ""},
            deparList: [],
            pro: {selected: ""},
            projectsList: []
        };
   
        //获取项目配额
        var getProQuta = function(){
            if(scope.tickets.pro.selected){
                ticketsSrv.getDomainQuotas(self.tickets.depart.selected.domainUid).then(function(data){
                    if(data && data.data){
                        var domainQuotas = data.data;
                        ticketsSrv.getProHave(scope.tickets.pro.selected.projectid).then(function(result){
                            scope.quotas=[];
                            if(result && result.data){
                                _.forEach(result.data,function(item){
                                    item.projectUid = localStorage.projectUid;
                                    if(item.name == "ram" ){
                                        item.hardLimit = item.hardLimit/1024;
                                    }
                                    domainQuotas.map(function(quota){
                                        if(item.name == quota.name){
                                            item.availquota = quota.hardLimit
                                            if(item.name == "ram" ){
                                                item.availquota = quota.hardLimit/1024;
                                            }
                                        } 
                                    })
                                    scope.quotas.push(item);
                                });
                                console.log(scope.quotas)
                                if(!rootScope.L3){
                                    scope.quotas=scope.quotas.filter(item=>{
                                        return item.name!="floatingip"
                                    })
                                }
                            }
                        }); 
                    }
                })
               
            }
            
        };
        //获取部门配额
        var getDomainHave = function(){
            if(scope.tickets.pro.selected){
                ticketsSrv.getDomainHave(self.tickets.depart.selected.domainUid).then(function(result){
                    scope.quotas=[];
                    if(result && result.data){
                        _.forEach(result.data,function(item){
                            if(item.name == "ram"  ){
                                item.hardLimit = item.hardLimit/1024
                            }

                            scope.quotas.push(item);
                        });
                        if(!rootScope.L3){
                            scope.quotas=scope.quotas.filter(item=>{
                                return item.name!="floatingip"
                            })
                        }
                    }
                }); 
            }
            
        };
        scope.changedepart = function (m) {
            scope.tickets.projectsList = scope.ticketsData[m.name];
            scope.tickets.pro.selected = scope.tickets.projectsList[0];
            if(scope.tickets.quotaType){
                getProQuta();
            }else{

            }
           
        };
        scope.changePro = function(){
            getProQuta();
        };
        scope.resourceConfirm = function (m) {
            if (m.$valid) {
                self.canConfirm = true;
                var id = JSON.parse(localStorage.$LOGINDATA).id.toString();
                resourceData = {
                    busiData: {
                        type:"1",
                        applyUserId: id,
                        domainUid: scope.tickets.depart.selected.domainUid,
                        "domainName":localStorage.domainName,
                        quota:scope.quotas,
                        "userName":localStorage.userName ,
                        "projectName":localStorage.projectName,
                       
                    },
                    
                   
                };
                if(self.showProjectChoose){
                    resourceData.busiData.projectUid =scope.tickets.pro.selected.projectId ;
                  
                }
                ticketsSrv.startJob(resourceData,localStorage.enterpriseUid).then(function () {
                    ticketsSrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
	                    ticketsSrv.unHandledTickets = result;
	                });
                    self.canConfirm = false;
                    closeModal();
                });
            } else {
                scope.submitValid = true;
            }
        };
        getProjects()
        function getProjects(){
            ticketsSrv.getProjectsList().then(function(data){
                if(data && data.data){   
                    var prolist = data.data ;
                    for(var i=0;i<prolist.length;i++){
                        if(prolist[i].domainUid=='default'){
                            prolist[i].disDomainName = '默认部门';
                        }else{
                            prolist[i].disDomainName = prolist[i].domainName;
                        }
                        if(prolist[i].projects&&prolist[i].projects.length>0){
                            for(var j=0;j<prolist[i].projects.length;j++){
                                if(prolist[i].projects[j].projectName == 'admin' && prolist[i].domainUid=='default'){
                                    prolist[i].projects[j].disProjectName = '默认项目';         
                                }else{
                                    prolist[i].projects[j].disProjectName = prolist[i].projects[j].projectName;
                                }
                            }
                        }
                    }
                    self.tickets.deparList = prolist;
                    prolist.map(function(item){
                        if(item.domainUid == domainUid){
                            self.tickets.depart.selected = item ;
                            self.tickets.pro.selected = self.tickets.depart.selected.projects[0];
                        }
                    })
                    if(self.showProjectChoose){
                        getProQuta();
                    }else{
                        getDomainHave()
                    }
                    
              }
            })
        }
      }])
      .controller("infoApplyCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","closeModal", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,closeModal) {
        console.log("信息咨询");
        var self = scope ;
        var domainUid = localStorage.defaultdomainUid ;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.canConfirm = false;
        scope.submitValid = false;
        ticketsSrv.getAddressee().then(function(res){
            if(res&&res.data){
                self.Addressee=res.data.filter(item=>{
                    return item.name!=localStorage.rolename;
                });
            }
        });
        scope.qa = {
            userTo: "",
            title: "",
            description: ""
        };
        scope.Addresseegroup = {};
        scope.Addresseegroup.selected = [];
        scope.ticketQaconfirm = function (m) {
            var id = JSON.parse(localStorage.$LOGINDATA).id.toString();
            if (m.$valid) {
                self.canConfirm = true;
                var usergroup=[]
                _.forEach(scope.Addresseegroup.selected,function(item){
                    usergroup.push(item.id)
                })
                scope.qa.userTo=usergroup.join(",");
                var qaData = {
                        title: scope.qa.title,
                        userTo: scope.qa.userTo,
                        description : scope.qa.description,
                        createdby:userId,
                        enterpriseUid:localStorage.enterpriseUid

                };
                ticketsSrv.addQaFun(qaData,userId).then(function (res) {
                	ticketsSrv.getMasTask(localStorage.enterpriseUid,userId).then(function(data){
        				ticketsSrv.unHandledMessage = data;
        			});
                    closeModal();
                    self.canConfirm = false;
                });
            } else {
                scope.submitValid = true;
            }
        };
       
      }])
      .controller("applyVolumesCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","closeModal", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,closeModal) {
        console.log("云硬盘申请");
        var self = scope ;
        var domainUid = localStorage.defaultdomainUid ;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.canConfirm = false;
        self.interacted = function(field) {
            return self.submitted || field.$dirty;
        };
        getStorageDeviceList()
        self.volumeForm ={
            name:"",
            size:"",
            description:""
        }
        self.volumeConfirm = function(createVolumeForm){
            if(createVolumeForm.$valid){
                self.canConfirm = true;
                var resourceData ={
                    busiData: {
                    "applyUserId":userId,
                    "domainUid":domainUid,
                    "domainName":localStorage.domainName,
                    "disk":{
                        "diskName":self.volumeForm.name,
                        "diskCapacity":self.volumeForm.size,
                        "des":self.volumeForm.description?self.volumeForm.description:"",
                        "volume_type":scope.volumeForm.storageDeviceSelected.volumeTypeId,
                        "disPlayName":scope.volumeForm.storageDeviceSelected.disPlayName
                        } ,
                     "type":"3",
                     "userName":localStorage.userName,
                     "projectName":localStorage.projectName ,
                     "projectUid":localStorage.projectUid    
                  }
                }
                ticketsSrv.startJob(resourceData,localStorage.enterpriseUid).then(function () {
                    ticketsSrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
	                    ticketsSrv.unHandledTickets = result;
	                });
                    self.canConfirm = false;
                    closeModal();
                });
            }else{
                self.submitInValid = true;
            }
        }
        function getStorageDeviceList(){
            ticketsSrv.getStorageDeviceList().then(function(data){
               if(data && data.data && data.data.length){
                    scope.storageDeviceList = data.data;
                    scope.volumeForm.storageDeviceSelected = scope.storageDeviceList[0]
               }
            })
        }
      }])
      .controller("networkApplyCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","closeModal", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,closeModal) {
        console.log("网络申请");
        var self = scope ;
        self.canConfirm = false;
        var domainUid = localStorage.defaultdomainUid ;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.networkFormData = {
            init_cidr:{
                ip_1:"10",
                ip_2:"0",
                ip_3:"0",
                ip_4:"0",
                ip_5:"24"
            }
        }
        
        self.networtTypes =[
            {
                showName:"网络",
                id:0
            },
            {
                showName:"子网",
                id:1
            },
        ]
        self.networkFormData.type = self.networtTypes[0];
        self.networkConfirm = function(form){
            if(form.$valid){
                self.canConfirm = true;
                var resourceData ={
                    busiData: {
                    "applyUserId":userId,
                    "domainUid":domainUid,
                    "domainName":localStorage.domainName,
                    "network":{
                        "netName":self.networkFormData.name,
                        "desc":self.networkFormData.description?self.networkFormData.description:"",
                        "cidr":self.networkFormData.init_cidr.ip_1+"."+self.networkFormData.init_cidr.ip_2+"."+self.networkFormData.init_cidr.ip_3+"."+self.networkFormData.init_cidr.ip_4+"/"+self.networkFormData.init_cidr.ip_5
                        } ,
                     "type":"4",
                     "userName":localStorage.userName ,
                     "projectName":localStorage.projectName  ,
                     "projectUid":localStorage.projectUid  
                  }
                }
                ticketsSrv.startJob(resourceData,localStorage.enterpriseUid).then(function () {
                    closeModal();
                    ticketsSrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
	                    ticketsSrv.unHandledTickets = result;
	                });
                    self.canConfirm = false;
                });
            }else{
                self.submitInValid = true;
            }
        }
        getNetworks();
        function getNetworks(){
            ticketsSrv.getNetworks().then(function(data){
               if(data && data.data){
                    self.networkList = data.data;
                    self.networkFormData.TheirNet = self.networkList[0]
               }
            })
        }
      }])
   
      .controller("routerApplyCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","closeModal", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,closeModal) {
        console.log("路由器申请");
        var self = scope ;
        self.canConfirm = false;
        var domainUid = localStorage.defaultdomainUid ;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.routerForm = {}
        getExtNets()
        getTenantSubs()
        self.changeExtNet = function(extNet) {
            self.subnets = extNet.subnets ;
            self.routerForm.subnet =  self.subnets[0]
          
        };
        self.routerConfirm = function(form){
            if(form.$valid){
                self.canConfirm = true;
                var resourceData ={
                    busiData: {
                    "applyUserId":userId,
                    "domainUid":domainUid,
                     "domainName":localStorage.domainName,
                    "router":{
                        "name":self.routerForm.name,
                        "desc":self.routerForm.description?self.routerForm.description:"",
                        "network_id":self.routerForm.selectedNet.id,
                        "network_name":self.routerForm.selectedNet.name,
                        "subnet_id":self.routerForm.selectedTenantSub.id,
                        "subnet_name":self.routerForm.selectedTenantSub.name,
                       
                        
                        } ,
                     "type":"5",
                     "userName":localStorage.userName ,
                     "projectName":localStorage.projectName ,
                     "projectUid":localStorage.projectUid   
                  }
                }
                if(self.routerForm.assignSub){
                    resourceData.busiData.router.external_fixed_ips =[{"subnet_id": self.routerForm.subnet.id}]
                    resourceData.busiData.router.assSubnetName =self.routerForm.subnet.name 
                }
                 ticketsSrv.startJob(resourceData,localStorage.enterpriseUid).then(function () {
                    ticketsSrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
	                    ticketsSrv.unHandledTickets = result;
	                });
                    self.canConfirm = false;
                    closeModal();
                });
            }else{
                self.submitInValid = true;
            }
        }
       //获取路由器公网网
       function getExtNets(){
        ticketsSrv.getExtNets().then(function(res) {
                if (res && res.data) {
                    self.extNets = res.data ;
                    self.routerForm.selectedNet = self.extNets[0] ;
                    self.subnets = self.extNets[0].subnets ;
                    self.routerForm.subnet =  self.subnets[0]
                }
            });
       }
        function getTenantSubs(){
            ticketsSrv.getTenantSubs().then(function(res) {
                if (res && res.data) {
                    var tenantSubs_data = _.map(res.data, function(item) {
                        item.name = item.name + "---" + item.cidr;
                        return item;
                    });
                    self.tenantSubs = tenantSubs_data;
                    self.routerForm.selectedTenantSub = self.tenantSubs[0]
                }
            });
        }
      }])
      .controller("applyInsCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "ticketsSrv", "alertSrv", "$translate", "checkedSrv", "$location","GLOBAL_CONFIG","closeModal","imagesSrv", function (scope, rootScope, NgTableParams, $uibModal, ticketsSrv, alertSrv, $translate, checkedSrv, $location,GLOBAL_CONFIG,closeModal,imagesSrv) {
        var self = scope ;
        var domainUid = localStorage.defaultdomainUid ;
        var userId = localStorage.$USERID ? localStorage.$USERID : "";
        self.instanceForm = {}
        self.submitValid = false;
        self.canConfirm = false;
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
        self.selectCpu = function(cpu){
            self.flavorSpecific.cpuSelect = cpu;
            
        }
        scope.changeImg = function(data){
            if (data&& data.imageUid) {
                self.iamgeInfo = data;
                self.instanceForm.chkImageId = data.imageUid;
            }
        }
        self.selectRam = function(ram){
            self.flavorSpecific.ramSelect = ram;
        
        }
        self.imageChange = function(data){
            self.iamgeInfo = data;
        }
        self.insConfirm = function(form){
            if(form.$valid && self.insImgTable  && self.insImgTable.data && self.insImgTable.data[0]){
                self.canConfirm = true;
                var resourceData ={
                    busiData: {
                    "applyUserId":userId,
                    "domainUid":domainUid,
                    "domainName":localStorage.domainName,
                    "instance":{
                        "name":self.instanceForm.name,
                        "desc":self.instanceForm.description?self.instanceForm.description:"",
                        "password":self.instanceForm.admin_pass,
                        "cpu":scope.instanceForm.flavor.vcpus,
                        "ram":scope.instanceForm.flavor.ram/1024,
                        "imageName":self.iamgeInfo.name,
                        "imageId":self.iamgeInfo.imageUid,
                        "network_id":self.instanceForm.selectedNet.id,
                        "network_name":self.instanceForm.selectedNet.name,
                        "subnet_id":scope.instanceForm.selectedSubnet.id,
                        "subnet_name" : scope.instanceForm.selectedSubnet.name,
                        "flavor":scope.instanceForm.flavor.id,
                        "volume_type":scope.instanceForm.storageDeviceSelected.volumeTypeId,
                        "disPlayName":scope.instanceForm.storageDeviceSelected.disPlayName =="本地盘"?"":scope.instanceForm.storageDeviceSelected.disPlayName,
                        } ,
                     "type":"2",
                     "userName":localStorage.userName,
                     "projectName":localStorage.projectName ,
                     "projectUid":localStorage.projectUid  
                  }
                }
                ticketsSrv.startJob(resourceData,localStorage.enterpriseUid).then(function () {
                    ticketsSrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
	                    ticketsSrv.unHandledTickets = result;
	                });
                    closeModal();
                    self.canConfirm = false;
                });
            }else{
                self.submitInValid = true;
            }
        }
        self.changeExtNet = function(data){
            scope.instanceForm.selectedSubnet  =data.subnets[0]
        }
        getInsImages()
        getNetworks()
        getFlovars()
        getStorageDeviceList()
       function getInsImages(callbackFunc){
            self.arch = {
                selected: {}
            };
            imagesSrv.getImages().then(function(res){
                res ? self.loadImgData = true : "";
                if (res && res.data){
                    res.data.map(function(item){
                        if (item.os && (item.os).toLowerCase() == "unknown") {
                            item.os = "";
                            item.os_type = "";
                        }
            
                        if (item.os_type != null && item.size != null && item.arch != null ) {
                            if (((item.os_type).toLowerCase() == 'windows' || (item.os_type).toLowerCase() == "linux") 
                                && (item.size != 0) && (item.arch == "x86_64" || item.arch == "i686") 
                                && item.disk_format != 'iso' && item.status.toLowerCase() === 'active') {
                                item.canUse = true;
                            } 
                        }else{
                            item.canUse = false;
                        }
                        item.status = item.status.toLowerCase();
                        item._imageType = item.is_public ? "公有" : "私有";
                        item.size = item.size*1;
                        item.os_type = item.os_type ? item.os_type.toLowerCase() : "";
                        return item;
                    })
                    res.data = res.data.filter(item => {
                        return item.canUse == true;
                    });
                    if ( res.data.length) {
                        self.instanceForm.chkImageId = res.data[0].imageUid;
                        self.iamgeInfo = res.data[0];
                        
                    }
                    self.insImgTable = new NgTableParams({
                        count: 3
                    }, {
                        counts: [],
                        dataset: res.data
                    });
                   
                    // self.createInsForm.sysVolumeMinSize = self.arch.selected.size;
                    // self.createInsForm.sysVolumeSize =self.arch.selected.size;

                }
            })
        }
        function getNetworks(){
            ticketsSrv.getProjectNetwork().then(function(result) {
                if (result && result.data && angular.isArray(result.data) ) {
                    if(!self.ADMIN){
                        scope.networkList = result.data.filter(function(item) {
                            return !item.external&&item.subnets.length!=0; //没有绑定子网的交换机创建云主机时不能使用
                        });
                    }else{
                        scope.networkList = result.data.filter(function(item) {
                            return item.subnets.length; //没有绑定子网的交换机创建云主机时不能使用
                        });
                    }
                    scope.networkList.forEach(function(network){
                        network.subnets=network.subnets.filter(function(subnet){
                            return subnet.ipVersion=='4';
                        });
                    });
                    scope.instanceForm.selectedNet = scope.networkList[0];
                    scope.instanceForm.selectedSubnet  =scope.networkList[0].subnets[0]
                   
                }
            });
        }
        function getFlovars(){
            self.flavorNormalList =[]
            ticketsSrv.getFlavors().then(function(result) {
                if (result && result.data && angular.isArray(result.data)) {
                    _.forEach(result.data, function(val) {
                        let flavor_ram_gb = val.ram  / 1024;
                        val.ram_gb = Math.ceil(flavor_ram_gb) == flavor_ram_gb ? flavor_ram_gb : flavor_ram_gb.toFixed(1);
                        val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + val.ram_gb + "GB ";
                        self.flavorNormalList.push(val);
                    });
                }
            });
        }
        function getStorageDeviceList(){
            ticketsSrv.getStorageDeviceList().then(function(data){
               if(data && data.data){
                    scope.storageDeviceList = data.data;
                    if(localStorage.isCustom =='false'){
                        var bootLocal = true;
                        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
                        ticketsSrv.getAllNode(regionUid).then(function(res){
                            if(res && res.data && angular.isArray(res.data)){
                                res.data.map(item => {
                                    item.nodeConfigScript =  JSON.parse(item.nodeConfigScript);
                                    item.hostInfo = JSON.parse(item.hostInfo)
                                    if(!item.nodeConfigScript.disk_data && item.hostInfo.var_data_size<800 ){
                                        bootLocal = false;
                                    }
                                })
                                if(bootLocal){
                                    scope.storageDeviceList.unshift({
                                        "disPlayName":"本地盘"
                                    })
                                }
                            }
                        })
                    }
                    if(scope.storageDeviceList.length){
                        scope.instanceForm.storageDeviceSelected = scope.storageDeviceList[0]
                    } 
               }
            })
        }
      }])
      .directive("tableFilter", [function(){
        return {
            restrict: 'AE',
            scope:{
                tableName:"@",
                context:"=",
                curentFilter:"=",
                changeSelect:"="
            },
            template: `<div class="table-header-filter">
            <span>{{curentFilter.name}}</span>
            <div class="table-header-icon">
                <i class="icon-aw-down"></i>
                <ul class="table-header-dropdown" ng-class="{'open':tableHeaderOpen}">
                    <li ng-repeat="item in curentFilter.filter" ng-click="headerFilter(item)">{{item.name}}</li>
                </ul>  
            </div>
          </div>`,
            link:function(scope,ele,attr,ctrl){
                scope.headerFilter = function(item){
                    var table = scope.context.tableContent[scope.tableName]
                    table.filter(item.type);
                    var filterData = table.settings().getData(table);
                    scope.changeSelect?scope.changeSelect(filterData[0]||{}):"";
                };
                $(ele).find(".icon-aw-down").on("click",function(e){
                    $(this).siblings(".table-header-dropdown").toggleClass("open");
                    e.stopPropagation();
                    e.preventDefault();
                })
                $("html").on("click",function(){
                    $(ele).find(".table-header-dropdown").removeClass("open");
                })
            }
        }
    }])
    .directive("availquota_",function(){
        return {
            restrict:"A",
            require:"ngModel",
            link:function(scope,ele,attrs,creatProCtrl){	
                function tempVaildQuota(viewValue){
                    if(typeof(scope.quota.availquota) != undefined&&viewValue>scope.quota.availquota&&viewValue!=0){
                        creatProCtrl.$setValidity("availquota",false);
                    }else{
                        creatProCtrl.$setValidity("availquota",true);
                    }
                    return viewValue;
                }
                tempVaildQuota(scope.quota.hardLimit);
                creatProCtrl.$parsers.push(tempVaildQuota);
            }
        };
    });