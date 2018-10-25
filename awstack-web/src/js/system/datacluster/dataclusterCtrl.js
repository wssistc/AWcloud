import "./dataclusterSrv";
import {dockerNodeDetailsCtrl} from "../../kubernetes/dockerNodes/dockerNodesModule"
import "../../kubernetes/dockerNodes/dockerNodesSrv";
import {netCheckCtrl} from "./netCheck";
import {
    initCardCtrl as initCardCtrl
} from "./initCardConfig";
import {
    initDisksCtrl as initDisksCtrl
} from "./initDisksConfig";


var dataclusterModule = angular.module("dataclusterModule", ["dataclusterSrv"]);
dataclusterModule.controller("dataclusterCtrl", ["$scope", "$rootScope", "NgTableParams", "$location", "$uibModal", "$translate", "dataclusterSrv","detailFactory" ,"newCheckedSrv", "GLOBAL_CONFIG", "$filter","dockerNodesSrv","alertSrv",
    function($scope, $rootScope, NgTableParams, $location, $uibModal, $translate, dataclusterSrv,detailFactory, newCheckedSrv, GLOBAL_CONFIG, $filter,dockerNodesSrv,alertSrv) {
    var self = $scope;
    self.headers = {
        "mapping": $translate.instant("aws.cluster.mapping"),
        "virtualNodeNum": $translate.instant("aws.cluster.virtualNodeNum"),
        "containerNodeNum": $translate.instant("aws.cluster.containerNodeNum"),
        "name": $translate.instant("aws.cluster.name"),
        "regionKey": $translate.instant("aws.cluster.regionKey"),
        "description": $translate.instant("aws.cluster.description"),
        "config": $translate.instant("aws.cluster.config"),
        "lastTime": $translate.instant("aws.cluster.lastTime"),
        "status":$translate.instant("aws.volumes.status"),
        "createTime":$translate.instant("aws.cluster.createTime")
    };
    self.canDel = false;
    self.canDeploy = false;
    self.canShutOff=false;
    self.canInitConfig=false;
    self.shutDownMsg=$translate.instant("aws.cluster.shutDownMsg");
    self.showShutDownMsg=true;
    self.regionTab = {
        isNodeShow:false,
        isdockerShow:false,
        //canDockerShow:localStorage.installK8s==1?true:false
    }

    self.$on("detailMove",function(e){
        detailFactory.moveTo = true;
        self.moveTo=true;
    });
    
    //一键关闭消息推送
    self.$on("shutDownData",function(e,data){
        if(data.eventType=='shutdown_cluster'){
           if(data.ansible_log&&angular.isObject(data.ansible_log)){
              if(data.ansible_log.task_name=='shutdown begin'){
                let regionName = JSON.parse(data.meta).regionname;
                 let tipMsg= regionName+$translate.instant("aws.datacluster.cluster")+$translate.instant("aws.node.startShutDown");
                 alertSrv.set("", tipMsg, "success", 5000);
                 self.$apply();
              }
              if(data.ansible_log.task_name=='Initiate Shutdown for Other Nodes'){
                let regionName = JSON.parse(data.meta).regionname;
                 let tipMsg= regionName+$translate.instant("aws.datacluster.cluster")+$translate.instant("aws.node.successShutDown");
                 alertSrv.set("", tipMsg, "success", 5000);
                 self.$apply();
              }
              if(data.ansible_log.status=='failed'){
                let regionName = JSON.parse(data.meta).regionname;
                 let tipMsg= regionName+$translate.instant("aws.datacluster.cluster")+$translate.instant("aws.node.failedShutDown");
                 alertSrv.set("", tipMsg, "success", 5000);
                 self.$apply();
              }
           }
        }
    });
    
    var isCanDel = function(checkedItems) {
        if (checkedItems.length === 1) {
            self.canDel = true;
        } else {
            self.canDel = false;
        }
    };
    function successFunc(data) {
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.centertableParams.filter({ searchTerm: term });
        };
        _.forEach(data, function(item) {
            item.status_ori = $translate.instant("aws.cluster.status." + item.status);
            item.lastTime_ori = $filter('date')(item.createTime, "yyyy-MM-dd HH:mm:ss");
            //item.searchTerm = [item.regionName, item.regionKey, item.status_ori, item.description, item.lastTime_ori].join('\b');
        })
        self.clusterTableData = data;
        self.clusterListData = data;
        self.clusterSearchTerm(({tableData:self.clusterListData,titleData:self.clusterTitleData}))
        self.centertableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        var tableId = "id";
        //checkedSrv.checkDo(self, data, tableId);
        newCheckedSrv.checkDo(self, data, tableId,"centertableParams"); 
        self.$watch(function() {
            return self.checkedItemscentertableParams;
        }, function(value) {
            isCanDel(self.checkedItemscentertableParams);
            if(value.length==1){
                self.canEdit = true;
                self.canDeploy = true;
                if(value[0].status==3){
                   self.canShutOff=true;
                }  
            }else{
                self.canEdit = false;
                self.canDeploy = false;
                self.canShutOff=false;
            }
        });
    }

    function initRegionTable() {
        dataclusterSrv.getClusterTableData().then(function(result) {
            if (result && result.data) {
                successFunc(result.data);
            }
        });
    }
    initRegionTable();

    self.refresh = function(){
        initRegionTable();
    }
    //数据中心设置项的初始化
    self.clusterTitleName="dataCluster";
    if(sessionStorage["dataCluster"]){
       self.clusterTitleData=JSON.parse(sessionStorage["dataCluster"]);
    }else{
       self.clusterTitleData=[
          {name:'cluster.name',value:true,disable:true,search:'regionName'},
          {name:'volumes.status',value:true,disable:false,search:'status_ori'},
          {name:'cluster.regionKey',value:true,disable:false,search:'regionKey'},
          {name:'cluster.virtualNodeNum',value:true,disable:false,search:'destination'},
          {name:'cluster.containerNodeNum',value:true,disable:false,search:'instances'},
          {name:'cluster.createTime',value:true,disable:false,search:'lastTime_ori'},
          {name:'cluster.description',value:true,disable:false,search:'description'},
       ];
    }
    self.clusterSearchTerm=function(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
            item.searchTerm="";
            titleData.forEach(function(showTitle){
                if(showTitle.value){
                    // if(showTitle.search=='source'){
                    //    item.searchTerm+=[item.source_ip_address,item._source_port].join("\b");
                    // }else if(showTitle.search=='destination'){
                    //    item.searchTerm+=[item.destination_ip_address,item._destination_port].join("\b");  
                    // }else{
                   item.searchTerm+=item[showTitle.search]+"\b";
                    // }
                 }
            });
        });     
    };


    self.$watch(function(){
        return $location.search()
    },function(val){
        if(val&&val.id){
            self.regionTab.isNodeShow = true;
            self.regionTab.isdockerShow = false;
        }else{
            self.regionTab.isNodeShow = false;
            self.regionTab.isdockerShow = false;
        }
    })

    self.$on("getDetail", function(event, value) {
        self.regionName = $location.search().name;
        self.$watch(function(){
            return  detailFactory
        },function(item){
            self.moveTo = item.moveTo; 
            self.NodedetailData = item.NodedetailData;
            self.hypervisor = item.hypervisor;
            self.ipmiInfo = item.ipmiInfo;
            if(self.hypervisor){
                self.hypervisor.hypervisorHostname=self.hypervisor&&self.hypervisor.hypervisorHostname?self.hypervisor.hypervisorHostname.split(".")[0]:"";    
            }
        },true)
    });

    self.handleDetail = function(item){ 
        if(item&&item.regionUid){
            if(item.status!=0){
                self.services.k8s = item.installK8s;
                detailFactory.moveTo =false;
                $location.search('id='+item.regionUid+'&name='+encodeURIComponent(item.regionName)+'&regionKey='+item.regionKey);
            }else{
                var scope = self.$new();
                var regionData = {
                    name:item.regionName,
                    regionKey:item.regionKey,
                    installEntrance:false
                }
                var installRegionModal = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "installRegion.html",
                    controller:"installRegionCtrl",
                    resolve:{
                        regionData:function(){
                            return regionData;
                        }
                    }
                });
            }
            
        }else{
            self.moveTo = false;
            detailFactory.moveTo =false;
            $location.url('/system/datacluster')
        }
    }
    self.toRight = function(){
        self.moveTo=false;
        detailFactory.moveTo = false;
    }
    self.createRegion = function() {
        var scope = self.$new();
        var regionModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "createRegion.html",
            controller:"createRegionCtrl",
            resolve:{
                initRegionTable:function(){
                    return initRegionTable;
                }
            }
        });
        
    };
    self.editRegion = function(checkedItems) {
        var scope = self.$new();
        var editRegionModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "editRegion.html",
            controller:"editRegionCtrl",
            resolve:{
                checkedItems: function(){
                    return checkedItems;
                },
                initRegionTable:function(){
                    return initRegionTable;
                },
                context:function(){
                    return self;
                }
            }
        });
        
    };

    self.del = function(checkedItems) {
        // dataclusterSrv.getNode(checkedItems[0].regionUid).then(function(result) {
        //     if (result && result.data && result.data.length) {
        //         self.nodes = result.data;
        //         self.errorMessage = $translate.instant("aws.cluster.delClusternode");
        //     } else {
        //         self.errorMessage = $translate.instant("aws.cluster.delCluster");
        //     }
           
            var content = {
                target: "delCluster",
                msg: "<span>" + $translate.instant("aws.cluster.delCluster") + "</span>",
                data: checkedItems
            };
            if (checkedItems[0].status=='3'&&checkedItems[0].instances>0) {
                content.notDel = true;
                content.msg = $translate.instant("aws.cluster.delClusternode");
            }
            self.$emit("delete", content);
        // });
    };
    self.$on("delCluster", function(e, data) {
        dataclusterSrv.delRegion(data[0].regionUid).then(function() {
            initRegionTable();
        });
    });
    self.deployRegion = function(editData){
        sessionStorage.setItem('curRegionEnterpriseUid',editData.enterpriseUid);
        sessionStorage.setItem('curRegionKey',editData.regionKey);
        sessionStorage.setItem('curRegionStatus',editData.status);
        sessionStorage.setItem('curRegionName',editData.regionName);
        sessionStorage.setItem('curRegionUid',editData.regionUid);
        localStorage.curRegionHOSTNAMELIST = '';
        localStorage.componentEnableCeph = editData.regionConfigScriptMap?editData.regionConfigScriptMap.enable_ceph:"";
        $location.url("/configure/cluster/stepone");

    }
    self.chooseNode = function(){
        self.regionTab.isNodeShow = true;
        self.regionTab.isdockerShow = false;
    }
    self.chooseDocker = function(){
        self.regionTab.isNodeShow = false;
        self.regionTab.isdockerShow = true;
    }
    //一键关机
    self.shutDown=function(editData){
         if(self.canShutOff){
            let content = {
                target: "shutOff",
                msg: "<span>" + $translate.instant("aws.cluster.confirmShutOffMsg") + "</span>",
                data: editData
             };
             self.$emit("delete", content);
         }
    };
    self.$on("shutOff", function(e, data) {
         self.shutDowning=true;
         dataclusterSrv.shutDown(data.regionKey,data.regionName).then(function(){
            initRegionTable();
         }).finally(function(){
            self.shutDowning=false;
         });
    });
    dockerNodeDetailsCtrl($scope, $translate, $rootScope, $uibModal, NgTableParams, dockerNodesSrv,newCheckedSrv);

}])
.controller("createRegionCtrl",["$scope","dataclusterSrv","initRegionTable","$uibModal","$uibModalInstance",function(scope,dataclusterSrv,initRegionTable,$uibModal,$uibModalInstance){
        scope.postParams = {
            regionName:"",
            description:""
        };
        scope.submitted = false;
        scope.interacted = function(field) {
            scope.field_form = field;
            return scope.submitted || field.name.$dirty;
        };
        scope.confirm = function() {
            if (scope.field_form.$valid) {
                dataclusterSrv.createRegion(scope.postParams).then(function(res) {
                    $uibModalInstance.dismiss("cancel");
                    if(res&&res.data){
                        var regionData = {
                            name:res.data.regionName,
                            regionKey:res.data.regionKey,
                            installEntrance:true
                        }
                        var installRegionModal = $uibModal.open({
                            animation: scope.animationsEnabled,
                            templateUrl: "installRegion.html",
                            controller:"installRegionCtrl",
                            resolve:{
                                regionData:function(){
                                    return regionData;
                                }
                            }
                        });
                        initRegionTable();
                    }
                    
                });
            } else {
                scope.submitted = true;
                scope.createRegion.$dirty = true;
            }
        };
}])
.controller("editRegionCtrl",["$scope","dataclusterSrv","initRegionTable","context","checkedItems","$uibModalInstance",function(scope,dataclusterSrv,initRegionTable,context,checkedItems,$uibModalInstance){
        scope.postParams = {
            regionName:"",
            description:""
        };
        scope.submitted = false;
        scope.postParams.regionName = checkedItems[0].regionName;
        scope.postParams.description = checkedItems[0].description;
        scope.interacted = function(field) {
            scope.field_form = field;
            return scope.submitted || field.name.$dirty || field.description.$dirty;
        };
        scope.confirm = function() {
            if (scope.field_form.$valid) {
                if(checkedItems[0].regionKey == localStorage.regionKey){
                    localStorage.regionName = scope.postParams.regionName;
                }
                dataclusterSrv.editRegion(scope.postParams,checkedItems[0]).then(function(res) {
                    $uibModalInstance.dismiss("cancel");
                    context.$emit('region-refresh',{type:"region"});
                    initRegionTable();
                });
            } else {
                scope.submitted = true;
                scope.editRegion.$dirty = true;
            }
        };
}])
.controller("installRegionCtrl",["$scope","$uibModalInstance","regionData",function(scope,$uibModalInstance,regionData){
        scope.regionRange = regionData.name;
        scope.installEntrance = regionData.installEntrance;
        scope.regionkeyCode = regionData.regionKey;
        scope.confirm = function(regionkeyCode) {
            location.replace("/datacenter/#/info/stepone/"+regionkeyCode)
            $uibModalInstance.dismiss("cancel");
        };
}])
.controller("importHardwareCtrl",["$scope","$rootScope","$uibModalInstance","editData","dataclusterSrv","physicalConductorSrv",function($scope,$rootScope,
    $uibModalInstance,editData,dataclusterSrv,physicalConductorSrv) {
        var self = $scope;
        self.IPMIsubmitValid = false;
        self.checkIPMIPass = false;
        self.IPMI_info = {
            ip_0: "",
            ip_1: "",
            ip_2: "",
            ip_3: "",
            username: "",
            password: ""
        }

        //判断节点是否有IMPI信息, 有则回显, 没有则新增
        dataclusterSrv.getIpmiInfo(editData[0].nodeUid).then(function(result) {
            if(result && result.data && result.data.ipmiAuthInfo) {
                self.hasIpmi = true;
                var ipmiAuthInfo = angular.fromJson(result.data.ipmiAuthInfo);
                var ipmi_address_arr = ipmiAuthInfo.ipmi_address.split(".");
                self.IPMI_info.ip_0 = ipmi_address_arr[0];
                self.IPMI_info.ip_1 = ipmi_address_arr[1];
                self.IPMI_info.ip_2 = ipmi_address_arr[2];
                self.IPMI_info.ip_3 = ipmi_address_arr[3];
                self.IPMI_info.username = ipmiAuthInfo.ipmi_username;
                self.IPMI_info.password = ipmiAuthInfo.ipmi_password;
            }else {
                self.hasIpmi = false;
            }
        });

        function IPMI_address(){
            return self.IPMI_info.ip_0 + "." + self.IPMI_info.ip_1 + "." + self.IPMI_info.ip_2 + "." + self.IPMI_info.ip_3;
        }

        self.changeIpAddr = function() {
            self.checkIPMIPass = false;
        }

        self.verifyIPMI = function(IPMIfiled){
            if(IPMIfiled.$valid) {
                self.checkIPMIPass = false;
                let postVerify = {
                    nodes:[
                        {   
                            "ipmi_auth_info":{
                                "ipmi_address": IPMI_address(),
                                "ipmi_username": self.IPMI_info.username, 
                                "ipmi_password": self.IPMI_info.password
                            }
                        }
                    ]
                }
                physicalConductorSrv.checkIPMI(postVerify).then(function(res) {
                    if(res && res.data){
                        var check = angular.fromJson(res.data);
                        if(check.nodes[0].check) {
                            self.checkIPMIPass = true;
                            $rootScope.$broadcast("alert-success", "010")
                        }else {
                            $rootScope.$broadcast("alert-error", "011");
                        }
                    }
                    
                })
            }else{
                self.IPMIsubmitValid = true;
            }
        }

        self.confirm = function(IPMIForm){
            if(IPMIForm.$valid) {
                var options = {
                    regionKey: localStorage.regionKey,
                    enterpriseUid: localStorage.enterpriseUid,
                    nodeId: editData[0].nodeUid,
                    nodeName: editData[0].hostName,
                    ipmiAddress: IPMI_address(),
                    ipmiUsername: self.IPMI_info.username,
                    ipmiPassword: self.IPMI_info.password,
                    type: 0
                }
                if(self.hasIpmi) {
                    dataclusterSrv.editIpmiInfo(options).then(function(result) {
                        if(result && result.status == "0"){

                        }
                    });
                }else {
                    dataclusterSrv.addIpmiInfo(options).then(function(result) {
                        if(result && result.status == "0"){
                            
                        }
                    });
                }
                $uibModalInstance.close();
            }else {
                self.IPMIsubmitValid = true;
            }
        }
}])
.controller("RegionNodeCtrl", function($scope,$filter, $rootScope, $translate, $routeParams, NgTableParams, dataclusterSrv,detailFactory, newCheckedSrv, GLOBAL_CONFIG,$uibModal,$window,$timeout) {
        var self = $scope;
        if(localStorage.permission=="enterprise"){
            self.enterpriseVersion=true;
        }else{
            self.enterpriseVersion=false;
        }

        self.nodesSearchTerm=function(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm="";
                titleData.forEach(function(showTitle){
                    if(showTitle.value){
                        if(showTitle.search=='ip'){
                            var itemSearch = item.hostInfoMap.ip;
                        }else if(showTitle.search=='lastTime'){
                            var itemSearch =  $filter("date")(item.lastTime, "yyyy-MM-dd HH:mm:ss");
                        }else if(showTitle.search=='useStatus'){
                            var itemSearch = $translate.instant('aws.node.useStatusValues.'+item.useStatus);
                        }else if(showTitle.search=='healthStatus'){
                            var itemSearch = $translate.instant('aws.node.healthStaus.'+item.healthStatus);
                        }else if(showTitle.search=='status'){
                            var itemSearch = $translate.instant('aws.node.status.'+item.status);
                        }else{
                            var itemSearch = item[showTitle.search]
                        }
                        item.searchTerm+=itemSearch+"\b";

                    }
                });
            });     
        };
        //数据中心节点项的初始化
        self.nodeTitleName="nodeCluster";
        if(sessionStorage["nodeCluster"]){
           self.nodeTitleData=JSON.parse(sessionStorage["nodeCluster"]);
        }else{
           self.nodeTitleData=[
              {name:'node.hypervisorHostname',value:true,disable:true,search:'hostName'},
              {name:'node.regionName',value:true,disable:false,search:'regionName'},
              {name:'node.management_IP',value:true,disable:false,search:'ip'},
              {name:'node.lastTime',value:true,disable:false,search:'lastTime'},
              {name:'node.useStatus',value:true,disable:false,search:'useStatus'},
              {name:'node.healthStaus.status',value:true,disable:false,search:'healthStatus'},
              {name:'node.Status',value:true,disable:false,search:'status'},
           ];
        }
        
        //node详情函数
        self.nodeDetailFun = function(value,name){
            var nodeName = name;
            $scope.nodename = nodeName;
            dataclusterSrv.getCurRegNodeList().then(function(data) {
                if (data && data.data) {
                    _.forEach(data.data, function(val) {
                        if (val.nodeUid == value) {
                            if (val.useStatus) {
                                $scope.NodedetailData = angular.fromJson(val.nodeConfigScript);
                            } else {
                                $scope.NodedetailData = {};
                            }
                            $scope.detailHead = val;
                            //$scope.NodedetailData = angular.fromJson(val.nodeConfigScript) || self.data;

                            $scope.totalDisks = 0;
                            _.forEach(val.hostInfoMap.disks, function(item) {
                                $scope.totalDisks = Number($scope.totalDisks) + Number((item.capacity).split("GB")[0]);
                            });
                        }
                    });
                }

                if ($scope.NodedetailData.network != null) {
                    self.isShowNet = true;
                    for (var i = 0; i < $scope.NodedetailData.network.length; i++) {
                        if ($scope.NodedetailData.network[i].role == "public") {
                            $scope.NodedetailData.network.splice(i, 1);
                        }
                        if (typeof($scope.NodedetailData.network[i]["vlan-start"]) != "undefined") {
                            $scope.NodedetailData.network[i].isShow = true;
                        } else {
                            $scope.NodedetailData.network[i].isShow = false;
                        }

                    }
                } else {
                    self.isShowNet = false;
                }
                detailFactory.NodedetailData = $scope.NodedetailData;
            })
            $scope.hypervisor = {};
            dataclusterSrv.getHypervisors().then(function(result) {
                if (result && result.data) {
                    _.forEach(result.data, function(item) {

                        if (item.hypervisorHostname.split(".")[0] == nodeName) {
                            item.localMemoryUsed=parseInt(item.localMemoryUsed/1024);
                            item.localMemory=parseInt(item.localMemory/1024);
                            item.freeRam=parseInt(item.freeRam/1024);
                            $scope.hypervisor = item;
                        }
                    });
                    detailFactory.moveTo = true;
                    detailFactory.hypervisor = $scope.hypervisor;
                }

            });
            dataclusterSrv.getIpmiInfo(value).then(function(result) {
                if (result && result.data && result.data.ipmiAuthInfo) {
                    var ipmiAuthInfo = angular.fromJson(result.data.ipmiAuthInfo);
                    var ipmi_address_arr = ipmiAuthInfo.ipmi_address;
                    detailFactory.ipmiInfo = {};
                    detailFactory.ipmiInfo.ipmiAddr = ipmi_address_arr;
                }
            });
        }
        self.changeRegion = function(regionUid) {
            self.regionUid = regionUid;
            self.tableNode = [];
            var nodeNamesArry = [];
            _.forEach(self.nodeData, function(item) {
                if(regionUid==item.regionUid){
                    // var nodeNamesArry= [item.hostName]; 
                    // var nodeName = { nodeNames: nodeNamesArry };
                    nodeNamesArry.push(item.hostName)
                    //各种失败操作后可以进行重试操作
                    var reg = new RegExp("^23|43|13|33|53$");
                    if (reg.test(item.status)) {
                        item.canRetry = true;
                    } else {
                        item.canRetry = false;
                    }
                    //判断哪些可以进行激活操作
                    if (item.status == 42 || item.status == 43) {
                        item.canActivation = true;
                    } else {
                        item.canActivation = false;
                    }
                    //获取每个节点的健康状态
                    // dataclusterSrv.isHealthAction(nodeName, regionUid).then(function(result) {
                    //     if (result && result.data) {
                    //         item.healthStatus = result.data[item.hostName];
                    //     } else {
                    //         item.healthStatus = false;
                    //     }
                    //     if (item.status == 41 || item.status == 42 || item.status == 43) {
                    //         item.healthStatus = "repair";
                    //     }
                    // });
                    // self.tableNode.push(item);
                    self.tableInfo = item.nodeConfigScripts;
                }
                
            });
            var nodeName = { nodeNames: nodeNamesArry }
            dataclusterSrv.isHealthAction(nodeName, regionUid).then(function(result) {
                if(result && result.data){
                    _.forEach(self.nodeData, function(item) {
                        if(regionUid==item.regionUid){
                            item.healthStatus = result.data[item.hostName]?result.data[item.hostName]:false;
                        }
                        // "41": "开始维护节点","42": "节点维护中","43": "维护节点失败"（健康状态为维护）
                        if (item.status == 41 || item.status == 42 || item.status == 43) {
                            item.healthStatus = "repair";
                        }
                        self.tableNode.push(item);
                    });
                }
                //获取列表时进行轮询
                tableResize(self.tableNode)
                successFunc(self.tableNode);    
            });  
        };

        /*function getRegion() {
            dataclusterSrv.getRegion().then(function(data) {
                if (data && data.data) {
                    self.regionTabs = data.data;
                } else {
                    self.regionTabs = [];
                }
                getNode();
            });
        }*/

        function getNode(regionUid) {
            dataclusterSrv.getAllNode(regionUid).then(function(data) {
                if (data && data.data) {
                    self.nodeData = data.data;
                    self.changeRegion($routeParams.id);
                }
            });
        }

        //删除数组中的某个元素
        Array.prototype.removeNodeId = function(val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };
        self.resizeNum={};
        self.timerStart=false;
        function tableResize(data){
            //需要轮询的数组列表               
            self.resizing = [];
            data.map(x => {
                if(x.status ==2 && x.useStatus ==false){
                    self.resizing.push(x.nodeUid)
                }
            });
            if(self.resizing.length>0){
                //时间重置
                if(JSON.stringify(self.resizeNum) == "{}"){
                    self.resizing.map(id => {self.resizeNum[id]=1});
                }
                if(!self.timerStart){
                    var options={
                        'nodeUids':self.resizing
                    };
                    /*节点状态更新轮询*/
                    $window.IntervalNodesResize(options);
                }
                
            }
        }

        $window.IntervalNodesResize = function(options){
            var timer = $timeout(function(){
                self.timerStart=true;
                dataclusterSrv.getNodeStatus(options).then(function(result) {
                    if(result && result.data && result.data.length){
                        result.data.forEach(function(item){
                            //有数据异常数据（可能有其他用户删除了正在保存数据）
                            if(item.status == null){
                                //轮询数组中去掉这一项
                                self.resizing.removeNodeId(item.nodeUid);
                                //更新列表视图
                                self.tableNode.map(function(obj){
                                    if(obj.nodeUid == item.nodeUid){
                                        self.tableNode.removeNodeId(obj);
                                    }
                                })
                                //重置按钮状态
                                successFunc(self.tableNode);
                            }else if((item.status == 4||item.status == 3)&&item.useStatus ==false){
                                self.resizing.removeNodeId(item.nodeUid);
                                self.tableNode.map(function(obj){
                                    if(obj.nodeUid == item.nodeUid){
                                        obj.status = item.status;
                                    }
                                });  
                            }
                            
                            //轮询一次记录时间更改。
                            if(self.resizeNum[item.nodeUid]){
                                self.resizeNum[item.nodeUid]=self.resizeNum[item.nodeUid]+1;
                            }else{
                                self.resizeNum[item.nodeUid]=1;
                            }
                            
                            //当一个节点在初始化过程中荡掉。让这条数据轮询最多30分钟关闭。
                            if(self.resizeNum[item.nodeUid]>60){
                                self.resizing.removeNodeId(item.nodeUid);
                            }
                        })
                        
                    }
                        
                      
                }).finally(function(){
                    //轮询时可能有的数据已经恢复正常,参数重置。
                    if(self.resizing.length>0){
                        var options={
                            'nodeUids':self.resizing
                        }
                        $window.IntervalNodesResize(options);
                    }else{
                        self.timerStart=false;
                        $timeout.canel(timer);
                    }
                });
            
            },5000);  
        };

        //过半健康节点检查（objs为组装完整的tableNode数据）
        function healthCheck(objs) {
            var objsLength = objs.length;
            var k = 0;
            var consulServers;
            //如果集群没有节点,不做健康检查
            if (objsLength == 0) {
                return;
            }
            //如果没有节点在使用，不做健康检查
            for (k; k < objsLength; k++) {
                if (objs[k].nodeConfigScript) {
                    consulServers = angular.fromJson(objs[k].nodeConfigScript).consul.servers;
                    break;
                }
            }
            if (k == objsLength) {
                return;
            }
            //var consulServers=angular.fromJson(objs[0].nodeConfigScript).consul.servers;
            var consulServersLength = consulServers.length;
            var healthNodeNumber = 0;
            var nodeNamesArry = [];
            var nodeName = { nodeNames: nodeNamesArry };
            var allNodesNameArry = [];
            var allNodesName = { nodeNames: allNodesNameArry };
            var allHealthNodeNum = 0;
            self.canAdd = true;
            self.canDel = true;
            self.canMaintenance = true;
            self.consulNum = consulServersLength;
            //如果有其他节点在维护状态，新增、删除和维护按钮不可用
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].status == 42) {
                    self.canAdd = false;
                    self.canDel = false;
                    self.canMaintenance = false;
                    break;
                }
            }
            //获取consul-server所在的物理节点的数组
            _.forEach(objs, function(node) {
                if (node.useStatus) {
                    allNodesNameArry.push(node.hostName);
                    var nodeIp = angular.fromJson(node.nodeConfigScript).network[1].ip;
                    _.forEach(consulServers, function(item) {
                        if (nodeIp == item) {
                            node.isConsul = true;
                            nodeNamesArry.push(node.hostName);
                        }
                    });
                }

            });
            //对consul-server节点进行健康检查，如果没有过半的consul-server节点处于健康状态，新增节点和删除节点不可用
            if(nodeName.nodeNames.length){
                dataclusterSrv.isHealthAction(nodeName, self.regionUid).then(function(result) {
                    if (result && result.data) {
                        _.forEach(result.data, function(item) {
                            if (item == true) {
                                healthNodeNumber++;
                            }
                        });
                    }
                    var tempNum = consulServersLength % 2 + 1;
                    self.consulOnlineNum = healthNodeNumber;
                    if (healthNodeNumber < tempNum) {
                        self.canAdd = false;
                    }
                    //对所有节点进行健康检查，如果健康节点小于三（改成两）个，新增和删除按钮不可用
                    dataclusterSrv.isHealthAction(allNodesName, self.regionUid).then(function(result) {
                        if (result && result.data) {
                            _.forEach(result.data, function(item) {
                                if (item == true) {
                                    allHealthNodeNum++;
                                }
                            });
                        }
                        self.allOnlineNum = allHealthNodeNum;
                        if (allHealthNodeNum < 2) {
                            self.canAdd = false;
                            self.canDel = false;
                        }
                    });
                });
            }
        }
        //刷新列表操作
        self.refreshNodes = function() {
            dataclusterSrv.getAllNode($routeParams.id).then(function(data) {
                if (data && data.data) {
                    self.nodeData = data.data;
                }else{
                    self.nodeData=[];
                }
                self.changeRegion(self.regionUid);
            }); 
        };
        //激活操作
        //当且仅当选中得节点状态为42或43时才可以激活
        self.actionCan=false;
        self.activation = function(obj) {
            if(self.newData.length){
                self.newData.map(function(item){
                    if(item.nodeUid==obj.nodeUid){
                        if(obj.status != 42 && obj.status != 43 ){
                            item.canActivation=false;
                        }
                    }
                });
            }
            self.tableNodes.reload();
            var nodeIds = obj.nodeUid;
            var nodeUidsArry = [];
            self.actionCan=true;
            nodeUidsArry.push(nodeIds);
            dataclusterSrv.activationAction(nodeUidsArry, self.regionUid).then(function() {
                self.refreshNodes();
            }).finally(function(){
                self.actionCan=false;
            })
        };
        //增加节点操作
        self.addNode = function(obj) {
            var nodeIds = obj[0].nodeUid;
            var nodeUidsArry = [];
            nodeUidsArry.push(nodeIds);
            dataclusterSrv.addNodeAction(nodeUidsArry, self.regionUid).then(function() {
                self.refreshNodes();
            });
        };
        //维护节点操作
        self.maintenance = function(checkedItems) {
            var content = {
                target: "maintenanceNode",
                msg: "<span>" + $translate.instant("aws.node.confirmMaintenance") + "</span>",
                data: checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("maintenanceNode", function(e, data) {
            var nodeId = data[0].nodeUid;
            var nodeUidsArry = [];
            nodeUidsArry.push(nodeId);
            dataclusterSrv.maintenanceAction(nodeUidsArry, self.regionUid).then(function() {
                self.refreshNodes();
            });
        });

        // 加入集群
        self.joinCluster=function(checkedItems){
            var nodeArr=[];
            checkedItems.forEach(function(item){
                nodeArr.push(item.nodeUid);
            });
            var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
            dataclusterSrv.joinCluster(localStorage.enterpriseUid,regionUid,nodeArr).then(function(res){
                self.refreshNodes();
            });

        };

        //两节点晋升
        self.twoNodePromote=function(checkedItems){
            var nodeArr=[];
            checkedItems.forEach(function(item){
                nodeArr.push(item.nodeUid);
            });
            var options={
                "nodeUids":nodeArr 
            };
            dataclusterSrv.twoNodePromote(options).then(function(res){
                 self.refreshNodes()
            });

        };

        //三节点晋升
        self.threeNodePromote=function(checkedItems){
            var nodeArr=[];
            checkedItems.forEach(function(item){
                nodeArr.push(item.nodeUid);
            });
            var options={
                "nodeUids":nodeArr 
            };
            dataclusterSrv.threeNodePromote(options).then(function(res){
                self.refreshNodes()
            });

        };

        //导入硬件信息
        self.importHardware = function(item) {
            $uibModal.open({
                animation: true,
                templateUrl: "js/system/datacluster/tmpl/importHardware.html",
                controller: "importHardwareCtrl",
                resolve:{
                    editData:function(){
                        return item;
                    }
                }
            });
        }

        //删除操作
        self.deleteNode = function() {
            var scope = $rootScope.$new();
            var modaldeleteNode = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "deleteNode.html",
                scope: scope
            });
            scope.node = {};
            scope.confirm = function(field) {
                if (field.$valid) {
                    var nodeId = self.editData.nodeUid;
                    var nodeUidsArry = [];
                    nodeUidsArry.push(nodeId);
                    var postData = {
                        "enterpriseLoginName":localStorage.enterpriseLoginName,
                        "userName":scope.node.username,
                        "password":scope.node.password,
                        "nodeUids":nodeUidsArry
                    }
                    modaldeleteNode.close()
                    dataclusterSrv.delNodeAction(postData, self.regionUid).then(function() {
                        self.refreshNodes();
                    });
                } else {
                    scope.submitInValid = true;
                }

            };
        };

        self.initConfig=function(item){
            $uibModal.open({
                animation: true,
                templateUrl: "js/system/datacluster/tmpl/initConfig.html",
                controller: "initConfigCtrl",
                resolve:{
                    editData:function(){
                        return item;
                    },
                    context:function(){
                        return self;
                    }
                }
            }); 
        }
        //判断节点是否可以重试
        self.retryCan=false;
        self.retry = function(obj) {
            if(self.newData.length){
                self.newData.map(function(item){
                    if(item.nodeUid==obj.nodeUid){
                        if(obj.status != 13 && obj.status != 23 && obj.status != 43 && obj.status != 53){
                            item.canRetry=false;
                        }
                    }
                });
            }
            //self.tableNodes.reload();
            var nodeId = obj.nodeUid;
            var nodeUidsArry=[];
            self.retryCan=true;
            nodeUidsArry.push(nodeId);
            dataclusterSrv.retryNodeAction(nodeUidsArry, self.regionUid).then(function() {
                self.refreshNodes();
            }).finally(function(){
                self.retryCan=false;
            })
        };
        //判断节点是否可以增加(两节点和三节点可以共用)
        function isCanAdd(obj) {
            self.canAddTwo = true;
            self.canAdd = true;
            if (obj) {
                if (obj.length != 1) {
                    self.canAddTwo = false;
                    self.canAdd = false;
                } else {
                    var otherNodesData = self.tableNodes.data.filter(item => {
                        return item.nodeUid != obj[0].nodeUid;
                    });
                    var _canAdd = true;
                    //其他节点即不是配置成功又不是未配置（其他节点正在配置中）
                    for(let i = 0;i < otherNodesData.length;i++){
                        if(otherNodesData[i].status !=4 && otherNodesData[i].status != null){
                            _canAdd = false;
                            break;
                        }
                    }
                    //如果当前选中的节点状态不是配置成功，不可加入集群
                    if(obj[0] && obj[0].status !=4){
                        _canAdd = false;
                    }
                    if(!self.isTwoNodeMode){
                        //如果当前选中的节点在配置中或者有其他节点正在配置中，添加按钮不可点
                        if (obj[0].useStatus || !_canAdd) {  
                            self.canAddTwo = false;
                        }
                    }else{
                        //两节点晋升中的是否可以加入集群 (两个节点晋升成功（但是状态为4）,一个节点新增节点初始化完成（4）且未使用,存在三个节点,arbiter_enable=true,consul有三个值)
                        var nodeConfigScript,consul_server_length;
                        self.tableNodes.data.forEach(function(item){
                            if(item.nodeConfigScript&&item.useStatus&&(item.status==4)){
                               nodeConfigScript = JSON.parse(item.nodeConfigScript); 
                               consul_server_length=nodeConfigScript.consul.servers.length;
                            } 
                        });
                        var status4_success_data=otherNodesData.filter(function(item){
                             return (item.status==4&&item.useStatus);
                        });
                        let status4_success_num=status4_success_data.length;
                        var condition=(status4_success_num==2)&&!obj[0].useStatus&&obj[0].status==4&&(consul_server_length==3)&&nodeConfigScript.enable_arbiter
                        if(!condition){
                            self.canAddTwo = false;
                        }
                    }
                }
            }else{
                self.canAdd = false;
            }
        }
        //判断选中节点是否可以删除
        function isCanDel(obj) {
            self.canDelTwo = true;
            if (obj) {
                if (obj.length != 1) { 
                    self.canDelTwo = false;
                }else{ //选中一条数据时
                    //删除按钮可操作的条件是：所选节点status==4或status==13，其它节点的status==null或status==4，且其它节点中status==4的节点数大于3.
                    var nodeConfigScript,nodeIp,isConsul;
                    if(obj[0].nodeConfigScript){
                        nodeConfigScript = JSON.parse(obj[0].nodeConfigScript);
                        console.log(nodeConfigScript,"nodeConfigScript");
                        nodeIp = nodeConfigScript.network.filter(item=>{return item.role=="cluster"})[0].ip;
                        isConsul = nodeConfigScript.consul.servers.indexOf(nodeIp)<0;//是否为consul节点
                    }
                    //if(obj[0] && isConsul && (obj[0].status == 4 || obj[0].status == 13)){
                    if(obj[0] && (obj[0].status == 4 || obj[0].status == 13 || obj[0].status == 3)){//servers也可以删除
                        var otherNodesData = self.tableNodes.data.filter(item => {
                            return item.nodeUid != obj[0].nodeUid;
                        });
                        var status4Count = 0,_candel = true;
                        otherNodesData.forEach(item => {
                            if(item.status == 4){
                                status4Count++;
                            }
                        });
                        for(let i=0;i<otherNodesData.length;i++){
                            if(otherNodesData[i].status !=4 && otherNodesData[i].status != null){
                                _candel = false;
                                break;
                            }
                        }
                        if(status4Count <3|| !_candel){
                            self.canDelTwo = false;
                        }
                    }else{
                        self.canDelTwo = false;
                    }
                }
            }else{
                self.canDelTwo = false;
            }
        }
        //判断选择节点是否可以维护
        function isCanMaintenance(obj) {
            self.canMaintenanceTwo = true;
            if (obj) {
                if (obj.length != 1) {
                    self.canMaintenanceTwo = false;
                }else{
                    var nodeConfigScript,nodeIp,isConsul
                    if(obj[0].nodeConfigScript){
                        nodeConfigScript = JSON.parse(obj[0].nodeConfigScript);
                        nodeIp = nodeConfigScript.network.filter(item=>{return item.role=="cluster"})[0].ip;
                        isConsul = nodeConfigScript.consul.servers.indexOf(nodeIp)<0;//是否为consul节点
                    }
                    //所选节点status==4，其它节点的status==null或status==4，且其它节点中status==4的节点数大于等于3.
                    //if(obj[0] && isConsul  && obj[0].status == 4){ 
                    if(obj[0]  && obj[0].status == 4){ //servers也可以维护
                        var otherNodesData = self.tableNodes.data.filter(item => {
                            return item.nodeUid != obj[0].nodeUid;
                        });
                        var status4Count = 0,_canMaintenance = true;
                        otherNodesData.forEach(item => {
                            if(item.status == 4){
                                status4Count++;
                            }
                        });
                        for(let i=0;i<otherNodesData.length;i++){
                            if(otherNodesData[i].status !=4 && otherNodesData[i].status != null){
                                _canMaintenance = false;
                                break;
                            }
                        }
                        if(status4Count <3 || !_canMaintenance){
                            self.canMaintenanceTwo = false;
                        }
                    }else{
                        self.canMaintenanceTwo = false;
                    }
                }
            }else{
                self.canMaintenanceTwo = false;
            }    
        }
        //判断选择节点是否可以初始化
        function isCanInitConfig(obj){
            self.canInitConfig=true;   
            //多个节点是否可进行初始化配置，暂时制作了一个
            // if(values.length>0){
            //     self.canInitConfig=true;
            //     //判断选中的节点的网卡配置是否一样
            //     for(var i=0;i<self.checkedItems.length;i++){
            //         var firstCard = JSON.stringify(self.checkedItems[0].hostInfoMap.nics.sort(by('name')));
            //         var elseCard = JSON.stringify(self.checkedItems[i].hostInfoMap.nics.sort(by('name')));
            //         if(firstCard!=elseCard){
            //             self.canInitConfig=false;
            //         }
            //     }
            //     //判断选中的节点的硬盘配置是否一样
            //     for(var i=0;i<self.checkedItems.length;i++){
            //         var firstDisk = JSON.stringify(self.checkedItems[0].hostInfoMap.disks.sort(by('name')));
            //         var elseDisk = JSON.stringify(self.checkedItems[i].hostInfoMap.disks.sort(by('name')));
            //         if(firstDisk!=elseDisk){
            //             self.canInitConfig=false;
            //         }
            //     }
            // }else{
            //     self.canInitConfig=false;
            // }
            if(obj){
               if(obj.length!=1){
                  self.canInitConfig=false;
               }else{
                  // 未配置可以进行初始化配置
                  if(obj[0].status==null||obj[0].status==1){
                     self.canInitConfig=true;
                  }else{
                     self.canInitConfig=false;
                  }
               }
            }else{
               self.canInitConfig=false;
            }
        }

        //是否展示两节点晋升(arbiter_enable=true,consul有1个值，两个使用且配置成功的节点)
        function isShowTwoNodePromote(data){
            var use_success_nume=0,nodeConfigScript,consul_server_length;
            self.isShowTwoProBtn=false;
            data.forEach(function(item){
                if(item.nodeConfigScript&&item.useStatus){
                    nodeConfigScript = JSON.parse(item.nodeConfigScript);
                    consul_server_length=nodeConfigScript.consul.servers.length;
                }
                if(item.useStatus&&(item.status==4)){
                    use_success_nume++
                }
            });
            if((use_success_nume==2)&&nodeConfigScript){
               if(consul_server_length==1&&nodeConfigScript.enable_arbiter){
                  self.isShowTwoProBtn=true;
               }
            }
        }

        //判断选择节点是否可以进行两节点晋升
        function isCanTwoNodePromote(obj){
            self.canTwoNodePromote=true;
            if (obj) {
                if(obj.length!=2){
                   self.canTwoNodePromote=false;
                }else{
                    //两个节点的状态都是配置成功且被使用，nodeConfigScript中arbiter_enable=true且consul有1个值
                    var use_success_nume=0,nodeConfigScript,consul_server_length;
                    obj.forEach(function(item){
                         if(item.nodeConfigScript&&item.useStatus){
                            nodeConfigScript = JSON.parse(item.nodeConfigScript);
                            consul_server_length=nodeConfigScript.consul.servers.length;
                         }
                         if(item.useStatus&&(item.status==4)){
                            use_success_nume++
                         }
                    });
                    if(use_success_nume==2&&nodeConfigScript){
                         if(consul_server_length==1&&nodeConfigScript.enable_arbiter){
                            self.canTwoNodePromote=true;
                         }
                    }else{
                         self.canTwoNodePromote=false;
                    }
                }
            }else{
                self.canTwoNodePromote=false;
            }
        }
        
        //是否展示三节点晋升(有三个节点，两个节点晋升成功(最终状态为4)，一个配置成功（4），被使用，arbtrite为true,consul里面有三个值)(有问题)
        function isShowThreeNodePromote(data){
           self.isShowThreeProBtn=false;
           var twoNode_arr=[],thirdNode_arr=[],nodeConfigScript,consul_server_length,twoNode_arbiter;
           if(data.length==3){
                data.forEach(function(item){
                    //新加入的第三节点的arbiter为false
                    if(item.status==4&&item.useStatus){
                       nodeConfigScript = JSON.parse(item.nodeConfigScript);
                       if(nodeConfigScript.enable_arbiter){
                          consul_server_length=nodeConfigScript.consul.servers.length;
                          twoNode_arbiter=nodeConfigScript.enable_arbiter;
                          twoNode_arr.push(item);
                       }else{
                          thirdNode_arr.push(item);
                       }
                    }
                });
                if((twoNode_arr.length==2)&&(thirdNode_arr.length==1)&&nodeConfigScript){
                    if(consul_server_length==3&&twoNode_arbiter){
                       self.isShowThreeProBtn=true;
                    }
                }
           }
        }

        //判断选择节点是否可以进行三节点晋升(有三个节点，两个节点晋升成功(最终状态为4)，一个配置成功（4），被使用，arbtrite为true,consul里面有三个值)
        function isCanThreeNodePromote(obj){
           self.canThreeNodePromote=false;
           if (obj) {
               if(obj.length==1){
                   //新加入的第三节点的arbiter为false
                   var nodeConfigScript = JSON.parse(obj[0].nodeConfigScript);
                   if(obj[0].useStatus&&(obj[0].status==4)&&!nodeConfigScript.enable_arbiter){
                      self.canThreeNodePromote=true;
                   }
               }
           }
        }

        //判断是两节点还是四子星
        function isTwoNodeMode(data){
            var nodeConfigScript,twoNode_arr=[];
            var twoNodeMode=false;
            data.forEach(function(item){
                if(item.nodeConfigScript&&(item.status==4)&&item.useStatus){
                    nodeConfigScript = JSON.parse(item.nodeConfigScript);
                    if(nodeConfigScript.enable_arbiter){
                       twoNode_arr.push(item);
                    }
                }
            });
            if(twoNode_arr.length==2){
                twoNodeMode=true;
            }
            return twoNodeMode;
        }

        /*使用by排序兼容edge浏览器*/
        function by(name){
            return function(o, p){
               var a, b;
               if (typeof o === "object" && typeof p === "object" && o && p) {
                 a = o[name];
                 b = p[name];
                 if (a === b) {
                   return 0;
                 }
                 if (typeof a === typeof b) {
                   return a < b ? -1 : 1;
                 }
                 return typeof a < typeof b ? -1 : 1;
               }
               else {
                 throw ("error");
               }
            }
        }

        function successFunc(data) {
            //判断是两节点还是四子星
            self.isTwoNodeMode=isTwoNodeMode(data);
            if(self.isTwoNodeMode){
                isShowTwoNodePromote(data)
                isShowThreeNodePromote(data)
            }
            var used = [],nouse = [],max = [],newData;
            data.map(function(item){
                if(item.useStatus){
                    used.push(item);
                    max.push(Number(item.hostName.split("-")[1]));
                }else{
                    nouse.push(item);
                }
            });
            used.sort(function(a,b){
                return _IP.toLong(a.hostInfoMap.ip) - _IP.toLong(b.hostInfoMap.ip);
            });
            nouse.sort(function(a,b){
                return _IP.toLong(a.hostInfoMap.ip) - _IP.toLong(b.hostInfoMap.ip);
            }).map(function(item,index){
                item.hostName = "node-"+(Math.max.apply(null,max)+1+index);
                return item;
            });
            newData = used.concat(nouse);
            self.newData=newData;
            self.nodeListData = data;
            self.nodesSearchTerm(({tableData:self.nodeListData,titleData:self.nodeTitleData}))
            self.tableNodes = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: newData });
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableNodes.filter({searchTerm: term });
            };
            var tableId = "nodeUid";
            newCheckedSrv.checkDo(self, data, tableId,"tableNodes");
            //过半健康节点检查
            healthCheck(self.tableNode);
            self.$watch(function() {
                return self.checkedItems;
            }, function(values) { 
                isCanDel(values);
                isCanMaintenance(values);
                isCanAdd(values);
                isCanInitConfig(values);
                if(self.isShowTwoProBtn){
                   isCanTwoNodePromote(values)
                }
                if(self.isShowThreeProBtn){
                   isCanThreeNodePromote(values)
                }
            });
        }

        //初始化获取节点列表
        getNode($routeParams.id);
        //getRegion();
        //接收node状态的变化
        self.$on("nodeSocket", function(e, data) {
            self.refreshNodes();
        });
})
.factory('detailFactory', function(){
    var DetailData={
            hypervisor:{},
            NodedetailData:{},
            ipmiInfo:{},
            moveTo:false,
        }
    return DetailData      
}).controller("initConfigCtrl",["$scope","$rootScope","$uibModalInstance","editData","dataclusterSrv","physicalConductorSrv","$location","context","$http","$timeout","$routeParams","NgTableParams", "$interval","$translate",function($scope,$rootScope,
    $uibModalInstance,editData,dataclusterSrv,physicalConductorSrv,$location,context,$http,$timeout,$routeParams,NgTableParams, $interval,$translate) {
    var self=$scope;
    self.nodeName=context.checkedItems[0].hostName;
    //if(!localStorage.nodeConfig){
        localStorage.nodeConfig = JSON.stringify({});
    //}
    //if(!localStorage.diskCardConfig){
        localStorage.diskCardConfig = JSON.stringify({});
    //}
    //软件交付模式
    localStorage.patternSelected=JSON.stringify({name:"软件交付模式",value:"deliver"});
    
    
    /*网络配置*/
    self.cardconfigure = function(checkedItems){
        localStorage.initConfigCardCheckedItems = JSON.stringify(checkedItems);
        checkedItems.forEach(function(item){
            var nodeId = item.nodeUid;
            var nodeConfig = JSON.parse(localStorage.nodeConfig);
            if(nodeConfig[nodeId]){

            }else{
                nodeConfig[nodeId]={disksJson:null,cardJson:null};
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            }
        })
    }

    /*硬盘配置*/
    self.disksconfigure = function(checkedItems){
        localStorage.initConfigDiskCheckedItems = JSON.stringify(checkedItems);
        checkedItems.forEach(function(item){
            var nodeId = item.nodeUid;
            var nodeConfig = JSON.parse(localStorage.nodeConfig);
            if(nodeConfig[nodeId]){

            }else{
                nodeConfig[nodeId]={disksJson:null,cardJson:null};
                localStorage.nodeConfig = JSON.stringify(nodeConfig);
            }
        })
    }

    self.activeConfig=function(type){
        if(type=='cartConfig'){
          self.cartConfig=true;
          self.networkInspection=false;
          self.diskConfig=false;
          self.diskInspectin=false;
          self.cardconfigure(context.checkedItems);
          $timeout(function(){
              initCardCtrl($scope, $http,$timeout, $location, $routeParams, $interval,$translate);
          },100)
        }else if(type=='networkInspection'){
          //网卡配置才允许进行网络检查
          //if(self.hasConfigCard){
             self.cartConfig=false;
             self.networkInspection=true;
             self.diskConfig=false;
             self.diskInspectin=false; 
             netCheckCtrl($scope, $http,$timeout, $location,$routeParams,NgTableParams,dataclusterSrv,context, $interval,$translate);
          // }else{
          //    self.noConfigCard=true;
          //    $timeout(function(){
          //        self.noConfigCard = false;   
          //    },2000)
          // }
        }else if(type=='diskConfig'){
          self.cartConfig=false;
          self.networkInspection=false;
          self.diskConfig=true;
          self.diskInspectin=false;
          self.disksconfigure(context.checkedItems);
          $timeout(function(){
              initDisksCtrl($scope, $http,$timeout, $location, $routeParams, $interval,$translate,dataclusterSrv);
          },100)
        }else if(type=='diskInspectin'){
          self.cartConfig=false;
          self.networkInspection=false;
          self.diskConfig=false;
          self.diskInspectin=true; 
        }
    }; 
    self.activeConfig('cartConfig');
    self.cardClickToNet=function(){
        //网卡配置才允许进行网络检查
          if(self.hasConfigCard){
             self.cartConfig=false;
             self.networkInspection=true;
             self.diskConfig=false;
             self.diskInspectin=false; 
             netCheckCtrl($scope, $http,$timeout, $location,$routeParams,NgTableParams,dataclusterSrv,context, $interval,$translate);
          }else{
             self.noConfigCard=true;
             $timeout(function(){
                 self.noConfigCard = false;   
             },2000)
          }
    }

    self.initConfigConfirm=function(){
       //完成网卡配置和磁盘配置
       if(self.hasConfigDisks&&self.hasConfigCard){
           var allDisksCard = JSON.parse(localStorage.nodeConfig);
           var allNodesData=[];
           context.checkedItems.forEach(function(item){
               var params={};
               params.nodeid=item.nodeUid;
               params.hostname=item.hostName;
               allNodesData.push(params);
           });
           allNodesData.forEach(function(item){
                var thisData = allDisksCard[item.nodeid];
                item.disk_data="";
                item.nic_map={
                    "cluster":thisData.cardJson.nic_map.cluster.bonds,
                    "storage":thisData.cardJson.nic_map.storage.bonds,
                    "public":thisData.cardJson.nic_map.public.bonds,
                    "tenant":thisData.cardJson.nic_map.tenant.bonds,
                    "mgmt":thisData.cardJson.nic_map.mgmt.bonds
                };
                item.bonds={}
                item.disk_config=[];
                item.disk_data="";
                thisData.disksJson.configGroup.forEach(function(i){
                    /*数据盘拼接*/
                    var ceph_osd = [],
                        ceph_ssd=[]
                    i.data.forEach(function(v){
                        ceph_osd.push('/dev/'+v.name)
                    })
                    i.caching.forEach(function(v){
                        ceph_ssd.push('/dev/'+v.name)
                    })
                    ceph_osd = ceph_osd.join(", ")
                    ceph_ssd = ceph_ssd.join(", ")
                    i.ceph_osd = ceph_osd;
                    i.ceph_ssd = ceph_ssd;
                    if(ceph_ssd==''){
                        i.mode = 'journal_collocation';
                        i.root = '';
                    }else{
                        i.mode = i.selected.mode
                        if(i.mode == 'bcache'){
                            i.root = 'bcache';
                        }else if(i.mode == 'raw_multi_journal'){
                            i.root = 'ssd_journal';
                        }
                    }
                    // var nodeDisks ={
                    //     "ceph_osd":i.ceph_osd,
                    //     "ceph_ssd":i.ceph_ssd,
                    //     "mode":i.mode,
                    //     "root":i.root
                    // }
                    if(self.insDisk){
                       item.disk_data = i.ceph_osd;
                    }else if(self.cephDisk){
                       item.disk_config=[{
                          "ceph_osd":i.ceph_osd,  //#数据盘
        　　　　　　      "ceph_ssd":i.ceph_ssd,  // #日志盘
        　　　　　　      "mode":i.mode,
        　　　　　　      "root":i.root
                       }]
                    }
                })
                thisData.cardJson.bonds.forEach(function(i){
                    item.bonds[i.name]={
                        "nics":[],
                        "mode":i.selected.type
                    }
                    i.nics.forEach(function(v){
                        item.bonds[i.name].nics.push(v.name)
                    })
                })
            })
           var nodeid=context.checkedItems[0].nodeUid;
           var options={
               "regionid":JSON.parse(localStorage.$LOGINDATA).regionUid,
               "nodeid":nodeid,
               "regionkey":localStorage.regionKey,
               "isTopNonTrivial":false,
               "enable_ceph":false,
               "ha":false,
               "node":allNodesData
           }
           $uibModalInstance.close()
           dataclusterSrv.initConfig(localStorage.enterpriseUid,localStorage.regionKey,nodeid,options).then(function(res){
               //刷新页面
               context.refreshNodes();
           });
       }else{
           self.clickFinish=true;
           $timeout(function(){
               self.clickFinish = false;   
           },2000)
       }
    }
}])