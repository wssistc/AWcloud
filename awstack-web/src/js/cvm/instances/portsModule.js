import "./instancesSrv";
import "./portsSrv";
import "../networks/routersSrv";
import "../networks/networksSrv";

angular.module("portsModule", ["instancesSrv","portsSrvModule"])
    .controller("portsCtrl", ["$scope", "$rootScope","NgTableParams","$uibModal", "instancesSrv","portsSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","$filter","$q","$location",
     function($scope, $rootScope,NgTableParams, $uibModal, instancesSrv, portsSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,$filter,$q,$location) {
        var self = $scope;   
        self.ports_search={};
        self.delisDisabled=true;
        self.canEdit=false;

        //设置项的初始化
        self.titleName="ports";
        if(sessionStorage["ports"]){
           self.titleData=JSON.parse(sessionStorage["ports"]);
        }else{
           self.titleData=[
              {name:'ports.MACadress',value:true,disable:false,search:"mac_address"},
              {name:'ports.name',value:true,disable:true,search:"name"},
              {name:'ports.network',value:true,disable:false,search:"network_name"},
              {name:'ports.subnet',value:true,disable:false,search:"subnet_name"},
              {name:'ports.ipAdress',value:true,disable:false,search:"ip_address"},
              {name:'ports.associatedHost',value:true,disable:false,search:"device_name"},
              {name:'ports.createtime',value:true,disable:false,search:"createTime"}
           ];
        }
        self.portSearchTerm=function(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm="";
                titleData.forEach(function(showTitle){
                    if(showTitle.value){
                        if(showTitle.search=='subnet_name'){
                           item.fixed_ips.forEach(function(ip){
                              item.searchTerm+=ip.subnet_name+"\b";
                           });
                        }else if(showTitle.search=='ip_address'){
                           item.fixed_ips.forEach(function(ip){
                              item.searchTerm+=ip.ip_address+"\b";
                           });
                        }else{
                           item.searchTerm+=item[showTitle.search]+"\b";
                        }
                        
                    }
                });
            });  
        };
        var initPortsTable=function(){
            self.portsTable = new NgTableParams({
               count: GLOBAL_CONFIG.PAGESIZE
            }, {
               counts: [],
               dataset: []
            });
            self.ports_search.globalSearchTerm ="";
            self.loadPortsData = false;
             portsSrv.getPortList().then(function(result){
                  result ? self.loadPortsData = true : "";
                  if(result&&result.data&&angular.isArray(result.data)){
                     successFunc(result.data);
                  }
             });
        };
        initPortsTable();

        function successFunc(data){
             self.portsData=data.map(function(item){
                  if(item.device_id){
                     item.status='mounted';
                  }else{
                     item.status='unmounted';
                  }
                  item.status_TR=$translate.instant("aws.ports."+item.status);
                  item.createTime = $filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");  
                  return item;
              });
              //根据session初始化searchterm
              self.portSearchTerm({tableData:self.portsData,titleData:self.titleData});
              self.portsTable = new NgTableParams({
                 count: GLOBAL_CONFIG.PAGESIZE
              }, {
                 counts: [],
                 dataset: self.portsData
              });
              checkedSrv.checkDo(self, "", "id", "portsTable");
        }

        self.refreshPorts=function(){
           initPortsTable();
        };

        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            if(!value){return}
            self.moreHandle=false;
            self.loadEnable=false;
            self.unloadEnable=false;
            self.canEdit=false;
            //多个
            self.delEnable=false;
            if(value.length==1){
               self.canEdit=true;
               self.moreHandle=true;
               if(!value[0].device_id){
                  self.loadEnable=true;
                  self.delEnable=true;
               }else{
                  self.unloadEnable=true;
               }
            }else if(value.length>1){
               self.moreHandle=true;
               var exitIns=false;
               value.some(function(item){
                   if(item.device_id){
                      exitIns=true;
                      return item.device_id;
                   }
               });
               if(!exitIns){
                  self.delEnable=true;
               }else{
                  self.delEnable=false;
               }
            }
        });
        
        self.applyGlobalSearch = function() {
            self.portsTable.filter({
                searchTerm: self.ports_search.globalSearchTerm
            });
        };

        //新建网卡
        self.createPorts = function() {
            var createPortsModal=$uibModal.open({
                animation: true,
                templateUrl: "createPorts.html",
                controller: "createPortsCtrl",
                resolve: {
                    refreshPortsTable: function() {
                        return initPortsTable;
                    }
                }
            });
        };

        //编辑网卡
        self.editPorts = function(editData) {
            var editPortsModal=$uibModal.open({
                animation: true,
                templateUrl: "editPorts.html",
                controller: "editPortsCtrl",
                resolve: {
                    refreshPortsTable: function() {
                        return initPortsTable;
                    },
                    editData:function(){
                        return editData;
                    }
                }
            });
        }; 

        //加载网卡
        self.load = function(editData) {
            var loadModal=$uibModal.open({
                animation: true,
                templateUrl: "load.html",
                controller: "loadCtrl",
                resolve: {
                    refreshPortsTable: function() {
                        return initPortsTable;
                    },
                    editData:function(){
                        return editData;
                    },
                    context:function(){
                        return self; 
                    }
                }
            });
        };

        //卸载网卡
        self.unload = function(editData) {
            self.gettingIns=true;
            instancesSrv.getServerDetail(editData.device_id).then(function(res){
               if(res&&res.data&&angular.isArray(res.data.fixedIps)&&res.data.fixedIps.length){
                   if(res.data.fixedIps.length>1){
                        var unloadContent = {
                            target: "unloadPorts",
                            msg: "<span>" + $translate.instant("aws.ports.unloadPorts") + "</span>",
                            type: "warning",
                            btnType: "btn-warning",
                            data: {
                                portNum:res.data.fixedIps.length,
                                editData:editData
                            }
                        };
                        self.$emit("delete", unloadContent);
                    }else if(res.data.fixedIps.length==1){
                        var content = {
                            target: "unloadPorts",
                            msg: "<span>" + $translate.instant("aws.ports.notUnloadPorts") + "</span>",
                            type: "warning",
                            btnType: "btn-warning",
                            data: {
                                portNum:res.data.fixedIps.length,
                                editData:editData
                            }
                        };
                        self.$emit("delete", content);
                    }  
               }
            }).finally(function(){
                self.gettingIns=false;
            });
        };
        self.$on("unloadPorts", function(e,data) {
            //云主机网卡数大于1才允许被卸载
            if(data.portNum>1){
                self.canUnload=true; 
                portsSrv.detachInterface(data.editData.device_id,data.editData.id).then(function(){
                    //手动刷新列表
                    self.portsData=self.portsData.filter(function(item){
                         return item.id!=data.editData.id;
                    });
                    self.portsTable = new NgTableParams({
                       count: GLOBAL_CONFIG.PAGESIZE
                    }, {
                       counts: [],
                       dataset: self.portsData
                    });
                    checkedSrv.checkDo(self, "", "id", "portsTable");
                }).finally(function(){
                    self.canUnload=false;
                });
            }
        });

        //删除网卡
        self.delPorts= function(checkedItems) {
            var content = {
                target: "delPorts",
                msg: "<span>" + $translate.instant("aws.ports.delPorts") + "</span>",
                data: checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("delPorts", function(e,data) {
            self.portDeleting=true;
            var ports_ids=[];
            _.forEach(data,function(item){
                ports_ids.push(item.id);
            });
            var del_params={
                portIds:ports_ids
            };
            portsSrv.deletePort(del_params).then(function(){
                initPortsTable();
            }).finally(function(){
                self.portDeleting=false;
            });
        });  
    }])
    .controller("createPortsCtrl", ["$scope", "$rootScope","$uibModal", "instancesSrv","portsSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","refreshPortsTable","portsIpSettingSrv","$uibModalInstance","networksSrv",
        function($scope, $rootScope, $uibModal, instancesSrv, portsSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,refreshPortsTable,portsIpSettingSrv,$uibModalInstance,networksSrv) {
        var self = $scope;
        
        //判断是否是admin
        switch(localStorage.managementRole){
            case"2":
                self.isSuperAdmin = true;//是否是超级管理员
                break;
            default:
                self.isSuperAdmin = false;//是否是超级管理员
        }
        self.portsForm = {
            name:"",
            selectedExtNet: "",
            selectedSubnet: "",
            selectedSubPool: "",
            assignSub: false,
            assignIP: false,
            init_cidr: {
                ip_0: "",
                ip_1: "",
                ip_2: "",
                ip_3: ""
            },
            //description:"",
            network:{

            }
        };
        //网络选项
        self.extNets = {
            options: []
        };
        self.field_form = {};
        self.submitted = false;
        self.interacted = function(field) {
            if (field) {
                self.field_form.createPortsForm = field;
                return self.submitted || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
            }
        };
        self = portsIpSettingSrv.setAssignIpFun(self, "portsForm", portsSrv,"createPortsForm");
        self.setCheckvalueFunc = function(){
            let subnet = self.portsForm.selectedSubPool;
            let startIp = subnet.allocationPools[subnet.allocationPool_key].start;
            let endIp = subnet.allocationPools[subnet.allocationPool_key].end;
            self.checkValue(startIp,endIp);
        };
        self.isAssignSub=function(){
            self.portsForm.assignIP=false;
        };
        self.portsConfirm = function(form) {
            let portsParams = {};
            if (form.$valid) {
                portsParams = {
                    "port":{
                       "name": self.portsForm.name,
                       "network_id": self.portsForm.selectedExtNet.id,
                       //"description": self.portsForm.description,
                    }
                };
                //指定子网
                if (self.portsForm.assignSub){
                    //组装数据
                    portsParams.port.fixed_ips = [];
                    let externalFixedIps = {};
                    //是否指定ip
                    if (self.portsForm.assignIP == true) {
                        let gatewayIp = self.portsForm.init_cidr.ip_0 + "." +
                            self.portsForm.init_cidr.ip_1 + "." +
                            self.portsForm.init_cidr.ip_2 + "." +
                            self.portsForm.init_cidr.ip_3;
                        externalFixedIps.ip_address = gatewayIp;
                        self.setCheckvalueFunc();
                    }
                    if(self.portsForm.selectedSubnet){
                        externalFixedIps.subnet_id = self.portsForm.selectedSubnet.id;
                        portsParams.port.fixed_ips.push(externalFixedIps);
                    }
                    if (self.field_form.createPortsForm.$valid){
                        //指定ip才进行ip校验
                        if(self.portsForm.assignIP == true){
                            let existedIps = [];
                            networksSrv.getNetworksDetail(self.portsForm.selectedExtNet.id).then(function(res) {
                                if (res && res.data) {
                                    _.each(res.data, function(item) {
                                        _.each(item.subnetIps, function(sub) {
                                            existedIps.push(sub.ip_address);
                                        });
                                    });
                                    if (!_.include(existedIps, portsParams.port.fixed_ips[0].ip_address)) {
                                        portsSrv.createPort(portsParams).then(function() {
                                            refreshPortsTable();
                                        });
                                        $uibModalInstance.close();
                                    } else {
                                        self.portsForm.repeatIp = true;
                                        self.submitted = true;
                                    }
                                }
                            });
                        }else{
                            portsSrv.createPort(portsParams).then(function() {
                                refreshPortsTable();
                            });
                            $uibModalInstance.close();
                        }
                    }else {
                        self.submitted = true;
                    }
                }else{
                //不指定子网
                    portsSrv.createPort(portsParams).then(function() {
                        refreshPortsTable();
                    });
                    $uibModalInstance.close();
                }
            } else {
                self.submitted = true;
            }
        };
    }])
    .controller("editPortsCtrl", ["$scope", "$rootScope","$uibModal", "instancesSrv","portsSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","refreshPortsTable","portsIpSettingSrv","$uibModalInstance","editData",
        function($scope, $rootScope, $uibModal, instancesSrv, portsSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,refreshPortsTable,portsIpSettingSrv,$uibModalInstance,editData) {
        var self = $scope;
        self.submitted = false;
        self.editFormData = {
            name: editData.name,
            //description: editData.description?editData.description:""
        };
        self.editConfirm = function(form) {
            if (form.$valid) {
                var options={
                   port:self.editFormData
                };
                portsSrv.updatePort(editData.id,options).then(function() {
                    refreshPortsTable();
                });
                $uibModalInstance.close();
            } else {
                self.submitted = true;
            }
        };
    }])
    .controller("loadCtrl", ["$scope", "$rootScope","$uibModal","NgTableParams","instancesSrv","portsSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","refreshPortsTable","portsIpSettingSrv","$uibModalInstance","editData","context",
        function($scope, $rootScope, $uibModal, NgTableParams, instancesSrv, portsSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,refreshPortsTable,portsIpSettingSrv,$uibModalInstance,editData,context) {
        var self = $scope;
        self.loadData={
           selectedIns:"",
           insSearch:""
        };
        //获取云主机列表
        instancesSrv.getData().then(function(result){
            result ? self.loadInsData = true : "";
            if(result&&angular.isArray(result.data)){
               //过滤掉加载8个ip的云主机
               let insData=result.data.map(function(item){
                  item.status = item.status.toLowerCase();
                  item.status_TR=$translate.instant("aws.instances.table.status."+item.status);
                  item.searchTerm=[item.name,item.status_TR,item.fixedIps].join(",");
                  return item;
               });
               insData=insData.filter(function(item){
                   return item.fixedIps.length<8;
               });
               self.insTable = new NgTableParams({
                  count: 5
               }, {
                  counts: [],
                  dataset: insData
               });
            }
        });

        self.loadConfirmMsg = function() {
            var loadConfirmMsgModal=$uibModal.open({
                animation: true,
                templateUrl: "loadMsg.html",
                controller: "loadMsgCtrl",
                resolve: {
                    refreshPortsTable: function() {
                        return refreshPortsTable;
                    },
                    loadContext:function(){
                        return self
                    },
                    mainContext:function(){
                        return context
                    },
                    editData:function(){
                        return editData
                    },
                }
            });
        };

        //验证子网是否有网关ip
        portsSrv.getSubnetDetail(context.checkedItems[0].fixed_ips[0].subnet_id).then(function(res){
            if(res&&res.data&&angular.isObject(res.data)){
                if(res.data.gateway_ip){
                   self.hasGateway=true;
                }else{
                   self.hasGateway=false;
                }
            }
        });

        self.insSearch = function() {
            self.insTable.filter({
                searchTerm: self.loadData.insSearch
            });
        };

        self.changeIns = function(val) {
            self.loadData.selectedIns= val;
            self.noSelectedIns=false;
        };

        self.loadConfirm=function(){
            $uibModalInstance.close();
            self.loadConfirmMsg();
        };

    }])
    .controller("loadMsgCtrl", ["$scope", "$rootScope","$uibModal","NgTableParams","instancesSrv","portsSrv","$translate", "checkedSrv","$timeout", "GLOBAL_CONFIG", "alertSrv","refreshPortsTable","portsIpSettingSrv","$uibModalInstance","editData","loadContext","mainContext",
        function($scope, $rootScope, $uibModal, NgTableParams, instancesSrv, portsSrv, $translate, checkedSrv, $timeout, GLOBAL_CONFIG, alert,refreshPortsTable,portsIpSettingSrv,$uibModalInstance,editData,loadContext,mainContext) {
            var self=$scope;
            self.hasGateway=loadContext.hasGateway;
            self.loadMsgConfirm=function(){
                mainContext.canLoad=true;
                if(loadContext.loadData.selectedIns){
                   var options={
                        "interfaceAttachment": {
                            "port_id": editData.id
                        }
                   };
                   var params={
                       "deviceName":loadContext.loadData.selectedIns.name
                   };
                   $uibModalInstance.close();
                   portsSrv.createInterface(loadContext.loadData.selectedIns.uid,options,params).then(function() {
                        refreshPortsTable();
                   }).finally(function(){
                        mainContext.canLoad=false;
                   });
                }
            };
        }]);
    

