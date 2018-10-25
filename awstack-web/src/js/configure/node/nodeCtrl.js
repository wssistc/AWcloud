import "./nodeSrv";
import {dockerNodeDetailsCtrl} from "../../kubernetes/dockerNodes/dockerNodesModule"
import "../../system/datacluster/dataclusterSrv";
import "../../kubernetes/dockerNodes/dockerNodesSrv";
import {
    initCardCtrl as initCardCtrl
} from "../../system/datacluster/initCardConfig";
import {
    initDisksCtrl as initDisksCtrl
} from "../../system/datacluster/initDisksConfig";
import {netCheckCtrl as netCheckCtrl} from "../../system/datacluster/netCheck";
import { isArray } from "util";
angular.module("nodectrl", ["nodesrv","dataclusterSrv"])
    .controller("NodeCtrl", function($scope, $rootScope, $translate, $routeParams,$interval, NgTableParams, nodeSrv, checkedSrv, GLOBAL_CONFIG,$uibModal,$window,$timeout,dataclusterSrv,$filter,newCheckedSrv,detailFactory,dockerNodesSrv,$location) {
        var self = $scope;
        self.search={};
        self.canDel=true;   
        self.canDelTwo=true;
        if(localStorage.permission=="enterprise"){
            self.enterpriseVersion=true;
        }else{
            self.enterpriseVersion=false;
        }
        self.regionTab={
            isNodeShow:true,
            isdockerShow:false
        };

        if(localStorage.installK8s==1){
           self.services.k8s=true;
        }

        self.chooseNode = function(){
            self.regionTab.isNodeShow = true;
            self.regionTab.isdockerShow = false;
        };
        self.chooseDocker = function(){
            self.regionTab.isNodeShow = false;
            self.regionTab.isdockerShow = true;
        };
        
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
        self.isShowErrorMsg=localStorage.isTopNonTrivial == "true";
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
              {name:'node.roles',value:true,disable:false,search:'roles'},
              {name:'node.useStatus',value:true,disable:false,search:'useStatus'},
              {name:'node.healthStaus.status',value:true,disable:false,search:'healthStatus'},
              {name:'node.Status',value:true,disable:false,search:'status'},
              {name:'node.errorArea',value:true,disable:false,search:'errorMessage',isShow:!self.isShowErrorMsg},
           ];
        }
        
        //node详情
        self.$on("getDetail",function(event,value){
            if($routeParams.nodeType=='node'){
               self.nodeDetailFun(value,$routeParams.name);
            }else{
               self.initNodeData($routeParams.id);
               self.chooseDocker();
            }
        });
        
        self.isVxlan=false;
        //判断当前环境是vlan还是vxlan
        dataclusterSrv.getNetType(localStorage.enterpriseUid, localStorage.regionKey).then(function(res){
            if(res&&res.data&&angular.isObject(res.data)){
               if(res.data.type=='vlan'){
                  self.isVxlan=false;
               }else if(res.data.type=='vxlan'){
                  self.isVxlan=true;
               }
            }
        });
        
        //node详情函数 名字还是需要传进来
        self.nodeDetailFun = function(value,name){
            $scope.nodename = name;
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
                            self.usedNode=val.useStatus;
                            //判断节点是否健康
                            let options={nodeNames:[$scope.nodename]};
                            let regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
                            dataclusterSrv.isHealthAction(options,regionUid).then(function(res){
                                if(res&&res.data&&angular.isObject(res.data)){
                                   self.isNodeHealth=res.data[$scope.nodename]?res.data[$scope.nodename]:false;
                                }
                            });
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
            });
            $scope.hypervisor = {};
            dataclusterSrv.getHypervisors().then(function(result) {
                if (result && result.data) {
                    _.forEach(result.data, function(item) {

                        if (item.hypervisorHostname.split(".")[0] == $scope.nodename) {
                            item.localMemoryUsed=parseInt(item.localMemoryUsed/1024);
                            item.localMemory=parseInt(item.localMemory/1024);
                            item.freeRam=parseInt(item.freeRam/1024);
                            $scope.hypervisor = item;
                            $scope.hypervisor.hypervisorHostname=$scope.hypervisor.hypervisorHostname.split(".")[0];
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
                    $scope.detail_ipmi_address=ipmiAuthInfo.ipmi_address;
                    detailFactory.ipmiInfo = {};
                    detailFactory.ipmiInfo.ipmiAddr = ipmi_address_arr;
                }
            });
        };
        self.changeRegion = function(regionUid) {
            self.regionUid = regionUid;
            self.tableNode = [];
            var nodeNamesArry = [];
            _.forEach(self.nodeData, function(item) {
                if(regionUid==item.regionUid){
                    nodeNamesArry.push(item.hostName);
                    self.tableInfo = item.nodeConfigScripts;
                }
            });
            var nodeName = { nodeNames: nodeNamesArry }
            dataclusterSrv.isHealthAction(nodeName, regionUid).then(function(result) {
                if(result && result.data){
                    self.tableNode = [];
                    _.forEach(self.nodeData, function(item) {
                        if(regionUid==item.regionUid){
                            item.healthStatus = result.data[item.hostName]?result.data[item.hostName]:false;
                            item.fault_domain = localStorage.isTopNonTrivial == "true"?item.hostInfoMap.fault_domain:"N/A";
                            
                            if(item.nodeConfigScript&&JSON.parse(item.nodeConfigScript)){
                                let nodeConfigScript = JSON.parse(item.nodeConfigScript)
                                nodeConfigScript.network.forEach(function(value){
                                    if(value.role=="cluster"){
                                        let ip = value.ip
                                        if(nodeConfigScript.nomad.servers.indexOf(ip)>-1){
                                            item.roles = "server"
                                        }else{
                                            item.roles = "client"
                                        }
                                    }
                                })
                            }else{
                                item.roles = "client"
                            }
                        }
                        item.errorMessage = ""
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

        //故障域
        self.canEditErrorArea = localStorage.isTopNonTrivial == "true"?true:false
        self.canInsert = false
        self.editFault = function(data){
            checkErrorArea(data)
        }

        function checkErrorArea(data){
            if(localStorage.isTopNonTrivial == "true"){
                self.tableNode.forEach(function(value){
                    if(value.useStatus){
                        self.faultLength = value.fault_domain.split("-").length
                    }
                })
                
                if(self.faultLength==1){
                    let reg1 = /^([1-9]|[1-9][0-9])$/
                    if(reg1.test(data.fault_domain)){
                        self.canInsert = true //匹配成功才可以加入集群
                        data.errorMessage = ""
                    }else{
                        self.canInsert = false
                        data.errorMessage = "输入格式错误！"
                    }
                }if(self.faultLength == 2){
                    let reg2 = /^([1-9]|[1-9][0-9])[\-]([1-9]|[1-9][0-9])$/
                    if(reg2.test(data.fault_domain)){
                        self.canInsert = true //匹配成功才可以加入集群
                        data.errorMessage = ""
                    }else{
                        self.canInsert = false
                        data.errorMessage = "输入格式错误！"
                    }
                }if(self.faultLength == 3){
                    let reg3 = /^([1-9]|[1-9][0-9])[\-]([1-9]|[1-9][0-9])[\-]([1-9]|[1-9][0-9])$/
                    if(reg3.test(data.fault_domain)){
                        self.canInsert = true //匹配成功才可以加入集群
                        data.errorMessage = ""
                    }else{
                        self.canInsert = false
                        data.errorMessage = "输入格式错误！"
                    }
                }
            }else{
                self.canInsert =true
            }
        }

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

        //获取是否对接存储和镜像迁移的数据
        if(localStorage.isCustom=='false'){
           dataclusterSrv.getSettingStatus().then(function(res){
                if(res&&res.data&&angular.isArray(res.data)){
                   res.data.forEach(function(item){
                       if(item.regionKey==localStorage.regionKey){
                          self.volumeImageData=item;
                       }
                   });
                }
           });
        }

        function getNode(regionUid) {
            dataclusterSrv.getAllNode(regionUid).then(function(data) {
                if (data && data.data) {
                    self.nodeData = data.data;
                    self.changeRegion(regionUid);
                }
            });
        }

        self.getNode = function(regionUid) {
            dataclusterSrv.getAllNode(regionUid).then(function(data) {
                if (data && data.data) {
                    self.nodeData = data.data;
                    self.changeRegion(regionUid);
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
        self.refreshNodes = function(globalSearchTerm) {
            self.search.nodeSearchTerm="";
            var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
            dataclusterSrv.getAllNode(regionUid).then(function(data) {
                if (data && data.data) {
                    self.nodeData = data.data;
                }else{
                    self.nodeData=[];
                }
                self.changeRegion(regionUid);
            }); 
        };
        //激活操作
        //当且仅当选中得节点状态为42或43时才可以激活
        self.actionCan=false;
        self.activation = function(obj) {
            if(self.canActive){
               self.tableNodes.reload();
                var nodeIds = obj[0].nodeUid;
                var nodeUidsArry = [];
                self.actionCan=true;
                nodeUidsArry.push(nodeIds);
                dataclusterSrv.activationAction(nodeUidsArry, self.regionUid).then(function() {
                    self.refreshNodes();
                }).finally(function(){
                    self.actionCan=false;
                });
            }
        };
         //表格中的重试激活操作
        self.retryActivation=function(obj){
            self.tableNodes.reload();
            var nodeIds = obj.nodeUid;
            var nodeUidsArry = [];
            self.actionCan=true;
            nodeUidsArry.push(nodeIds);
            dataclusterSrv.activationAction(nodeUidsArry, self.regionUid).then(function() {
                self.refreshNodes();
            }).finally(function(){
                self.actionCan=false;
            });
        }
        function isCanActivation(obj){
            self.canActive = true;
            if(obj){
                if (obj.length != 1) { 
                    self.canActive = false;
                }else{
                    if(obj[0].status!=42){
                       self.canActive = false;
                    }
                } 
            }else{
                self.canActive = false;
            }
        }

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
            if(self.canMaintenance&&self.canMaintenanceTwo){
                var content = {
                    target: "maintenanceNode",
                    msg: "<span>" + $translate.instant("aws.node.confirmMaintenance") + "</span>",
                    data: checkedItems
                };
                self.$emit("delete", content);
            }
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
            if(localStorage.isTopNonTrivial=="true"){
                checkErrorArea(checkedItems[0])
                if(!self.canInsert){
                    $uibModal.open({
                        animation: true,
                        templateUrl: "errorAreaWarning.html",
                        controller: function(){},
                    });
                }else{
                    var nodeArr=[];
                    checkedItems.forEach(function(item){
                        nodeArr.push({"nodeUid":item.nodeUid,"faultDomain":item.fault_domain});
                    });
                    var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
                    dataclusterSrv.joinCluster(localStorage.enterpriseUid,regionUid,nodeArr).then(function(res){
                        self.refreshNodes();
                        self.joinClustertips = true;
                    });
                }            
            }else{
                var nodeArr=[];
                checkedItems.forEach(function(item){
                    nodeArr.push({"nodeUid":item.nodeUid,"faultDomain":"0-0-0"});
                });
                var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
                dataclusterSrv.joinCluster(localStorage.enterpriseUid,regionUid,nodeArr).then(function(res){
                    self.refreshNodes();
                    self.joinClustertips = true;
                });
            }   
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
            if(self.canDel&&self.canDelTwo){
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
            }
        };
        // 强制删除
        self.forceDeleteNode = function() {
            if(self.canForceDeleteNode){
                var scope = $rootScope.$new();
                var modaldeleteNode = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: "forceDeleteNode.html",
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
                        dataclusterSrv.forceDelNodeAction(postData, self.regionUid).then(function() {
                            self.refreshNodes();
                        });
                    } else {
                        scope.submitInValid = true;
                    }
                };
            }
        };
        // 初始化
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
            self.retryCan=true;
            var nodeId = obj.nodeUid;
            var nodeUidsArry=[];
            //可能为两节点晋升失败（一个按钮，传两个节点uid）,或者三节点晋升失败(传第三节点的uid)
            if(obj.status==33){
               self.newData.map(function(item){
                  if(item.status==33){
                     nodeUidsArry.push(item.nodeUid);
                  }
               });
            }else{
               nodeUidsArry.push(nodeId);
            }
            dataclusterSrv.retryNodeAction(nodeUidsArry, self.regionUid).then(function() {
                self.refreshNodes();
            }).finally(function(){
                self.retryCan=false;
            });
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
                    //只有两个节点不可以加入集群
                    if(self.tableNodes.data.length<3){
                       self.canAddTwo = false;
                    }
                    var _canAdd = true;
                    //其他节点即不是配置成功又不是未配置（其他节点正在配置中）
                    for(let i = 0;i < otherNodesData.length;i++){
                        if(otherNodesData[i].status !=4 &&otherNodesData[i].status != null&&otherNodesData[i].status != 1){
                            _canAdd = false;
                            break;
                        }
                    }
                    //如果当前选中的节点状态不是配置成功，不可加入集群
                    if(obj[0] && obj[0].status!=4){
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
            self.notDelNode1=false;
            if (obj) {
                if (obj.length != 1) { 
                    self.canDelTwo = false;
                }else{ //选中一条数据时
                    var nodeConfigScript,otherNodesData,status4Count = 0;
                    otherNodesData = self.tableNodes.data.filter(item => {
                        return item.nodeUid != obj[0].nodeUid;
                    });
                    //其他节点中配置成功并正在使用的节点数要大于等于三(且三个节点的enable_arbiter为false,为正常的三节点)
                    otherNodesData.forEach(function(item){
                       if(item.useStatus&&item.status==4){
                          nodeConfigScript=JSON.parse(item.nodeConfigScript);
                          if(!nodeConfigScript.enable_arbiter){
                              status4Count++;
                          } 
                       }
                    });
                    if(status4Count<3){
                       self.canDelTwo = false;
                       self.small_3=true;
                    }else{
                       self.small_3=false;
                    }
 
                    //自身的条件判断(各种异常可以删，配置成功健康状态为健康且被使用可以删)
                    if(obj[0].status!=3&&obj[0].status!=13&&obj[0].status!=23&&obj[0].status!=33&&obj[0].status!=43&&obj[0].status!=53&&!(obj[0].status==4&&obj[0].useStatus&&obj[0].healthStatus==true)&&!((obj[0].status==1||obj[0].status==null)&&!obj[0].useStatus)){
                       self.canDelTwo = false;
                    }
                    
                    //其他节点需满足的条件(配置成功且健康或者是未配置)
                    for(var i=0;i<otherNodesData.length;i++){
                        var condition=(otherNodesData[i].status==4&&otherNodesData[i].useStatus&&(otherNodesData[i].healthStatus==true))||(!otherNodesData[i].useStatus&&(otherNodesData[i].status==1||otherNodesData[i].status==null));
                        if(!condition){
                           self.canDelTwo = false;
                           break; 
                        }
                    }

                    //软件交付模式下对于node-1是否可以删除的判断（未对接存储不可删，对接存储未镜像迁移不可删）
                    if(localStorage.isCustom=='false'){
                        if(obj[0].hostName=="node-1"){
                            //判断的api获取失败
                            if(!self.volumeImageData){
                                self.canDelTwo = false;
                                self.notDelNode1=true;
                            }else{
                                if(self.volumeImageData.cinderVolume>0){
                                   if(self.volumeImageData.image!=2){
                                      self.canDelTwo=false;
                                      self.notDelNode1=true;
                                   } 
                                }else{
                                   self.canDelTwo=false;
                                   self.notDelNode1=true;
                                }
                            }
                        }
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
                    var nodeConfigScript,nodeIp,isConsul,status4Count=0;
                    if(obj[0].nodeConfigScript){
                        nodeConfigScript = JSON.parse(obj[0].nodeConfigScript);
                        nodeIp = nodeConfigScript.network.filter(item=>{return item.role=="cluster"})[0].ip;
                        isConsul = nodeConfigScript.consul.servers.indexOf(nodeIp)<0;//是否为consul节点
                    }
                    //所选节点status==4，其它节点的status==null或status==4，且其它节点中status==4的节点数大于等于3.
                    //配置成功且加入集群可以维护
                    if(!(obj[0] && obj[0].status == 4 && obj[0].useStatus)){
                        self.canMaintenanceTwo = false;
                    }
                    var otherNodesData = self.tableNodes.data.filter(item => {
                        return item.nodeUid != obj[0].nodeUid;
                    });
                    otherNodesData.forEach(item => {
                        if(item.status == 4&&item.useStatus){
                            let config=JSON.parse(item.nodeConfigScript);
                            if(!config.enable_arbiter){
                                status4Count++;
                            }
                        }
                    });
                    //其他配置成功且被使用的节点个数要大于3
                    if(status4Count<3){
                        self.canMaintenanceTwo = false;
                    }
                    //其他节点的状态要么是配置成功已使用，要么是未配置的空节点
                    for(let i=0;i<self.tableNodes.data.length;i++){
                        let condition=(self.tableNodes.data[i].status==4&&self.tableNodes.data[i].useStatus)||(!self.tableNodes.data[i].useStatus&&(self.tableNodes.data[i].status==1||self.tableNodes.data[i].status==null))
                        if(!condition){
                           self.canMaintenanceTwo = false;
                           break;
                        }
                    }
                }
            }else{
                self.canMaintenanceTwo = false;
            }    
        }
        //判断选择节点是否可以初始化
        function isCanInitConfig(obj){
            self.canInitConfig=true;   
            if(obj){
               if(obj.length!=1){
                  self.canInitConfig=false;
               }else{
                  var nodeConfigScript,consul_server_length,two_promote_arr=[],three_promote_arr=[],use_num=0;//待晋升的第三节点
                  //两节点环境，还未进行两节点晋升，不可进行初始化
                  for(let i=0;i<self.tableNodes.data.length;i++){
                     if(self.tableNodes.data[i].nodeConfigScript&&self.tableNodes.data[i].useStatus&&self.tableNodes.data[i].status==4){
                         let config=JSON.parse(self.tableNodes.data[i].nodeConfigScript);
                         use_num++
                         console.log(config,"configconfigconfigconfigconfig");
                         //存在还未两节点晋升的节点
                         if(config.enable_arbiter){
                            nodeConfigScript = config;
                            consul_server_length=nodeConfigScript.consul.servers.length;
                            break;
                         } 
                     }
                  }
                  //使用中的节点数小于3不可以进行节点晋升
                  if(use_num<3){
                     self.canInitConfig=false;
                  }
                  if(consul_server_length==1&&nodeConfigScript.enable_arbiter){
                     self.canInitConfig=false;
                  }
                  
                  //存在还需要三节点晋升的节点(此时晋升成功的两节点nodeConfigScript.enable_arbiter为true,第三节点还未加入nodeConfigScript.enable_arbiter为false)
                  for(let j=0;j<self.tableNodes.data.length;j++){
                     if(self.tableNodes.data[j].nodeConfigScript&&self.tableNodes.data[j].useStatus){
                        nodeConfigScript = JSON.parse(self.tableNodes.data[j].nodeConfigScript);
                        if(nodeConfigScript.consul.servers.length==3&&!nodeConfigScript.enable_arbiter){
                           three_promote_arr.push(self.tableNodes.data[j]);
                        }
                        if(nodeConfigScript.consul.servers.length==3&&nodeConfigScript.enable_arbiter){
                           two_promote_arr.push(self.tableNodes.data[j]);
                        }
                     }
                  }
                  if(three_promote_arr.length==1&&two_promote_arr.length==2){
                     self.canInitConfig=false;
                  }

                  //如果有其他节点初始化配置完成但是还未加入集群不可初始化
                  for(let k=0;k<self.tableNodes.data.length;k++){
                     let condition=(self.tableNodes.data[k].status==4&&self.tableNodes.data[k].useStatus)||((self.tableNodes.data[k].status==1||self.tableNodes.data[k].status==null)&&!self.tableNodes.data[k].useStatus)
                     if(!condition){
                        self.canInitConfig=false;
                        break;
                     }
                  }
                  
                  // 未配置可以进行初始化配置
                  if(!((obj[0].status==null||obj[0].status==1)&&(!obj[0].useStatus))){
                     self.canInitConfig=false;
                  }
               }
            }else{
               self.canInitConfig=false;
            }
        }

        //是否展示两节点晋升(两个节点配置成功且被使用，至少含有一个空节点（未配置且未使用）)
        function isShowTwoNodePromote(data){
            var use_success_nume=0,nodeConfigScript,consul_server_length,no_use_num=0;
            self.isShowTwoProBtn=false;
            data.forEach(function(item){
                if (item.nodeConfigScript && item.useStatus&&item.status==4) {
                    nodeConfigScript = JSON.parse(item.nodeConfigScript);
                    consul_server_length = nodeConfigScript.consul.servers.length;
                }
                if(item.useStatus&&(item.status==4)){
                    use_success_nume++
                }
                if(!item.useStatus&&(item.status==1||item.status==null)){
                    no_use_num++
                }
            });
            if((use_success_nume==2)&&(no_use_num>0)&&nodeConfigScript){
                if (consul_server_length == 1 && nodeConfigScript.enable_arbiter) {
                    self.isShowTwoProBtn = true;
                }
            }
        }
        //是否展示节点高可用架构按钮（两节点晋升条件和至少两个节点step为1.2.3）
        function isShowNodeUserfulFrame(data){
            var use_success_nume=0,nodeConfigScript,consul_server_length,no_use_num=0,in_step_num = 0,in_step_3=0,three_promote_num=0;
            self.isShowNodeUserfulFrame=false;
            data.forEach(function(item){
                if (item.nodeConfigScript && item.useStatus&&item.status==4) {
                    nodeConfigScript = JSON.parse(item.nodeConfigScript);
                    consul_server_length = nodeConfigScript.consul.servers.length;
                }
                if(item.useStatus&&(item.status==4)){
                    use_success_nume++
                }
                if(!item.useStatus&&(item.status==1||item.status==null)){
                    no_use_num++
                }
                //用于判断三节点晋升用
                if(item.status==31||item.status==33){
                    three_promote_num++;
                }
                if(item.nodeConfigScript){
                    let nodeConfigScript = JSON.parse(item.nodeConfigScript)
                    //判断节点晋升到第几步
                    if(nodeConfigScript.arbiter_promote_step == "1"||nodeConfigScript.arbiter_promote_step == "2"){
                        in_step_num++
                    }
                    //第三步要单独做判断
                    if(nodeConfigScript.arbiter_promote_step == "3"){
                        in_step_3++
                    }
                }
            });
            //两节点云管最初安装好的状态
            if((use_success_nume==2)&&(no_use_num>0)&&nodeConfigScript){
                if (consul_server_length == 1 && nodeConfigScript.enable_arbiter) {
                    self.isShowNodeUserfulFrame = true;
                }
            }
            //step为1或者2
            if(in_step_num>1){
                self.isShowNodeUserfulFrame = true;
            }
            //step为3
            if(in_step_3>1){
                //还未点击三节点晋升
                if(nodeConfigScript&&nodeConfigScript.enable_arbiter&&consul_server_length == 3){
                   self.isShowNodeUserfulFrame = true;
                }
                //三节点正在晋升或者晋升失败
                if(three_promote_num==1){
                   self.isShowNodeUserfulFrame = true;
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
                         if(item.nodeConfigScript&&item.useStatus&&(item.status==4)){
                            nodeConfigScript = JSON.parse(item.nodeConfigScript);
                            if(nodeConfigScript.consul&&nodeConfigScript.consul.servers){
                               consul_server_length=nodeConfigScript.consul.servers.length;
                            }
                         }
                         if(item.useStatus&&(item.status==4)){
                            use_success_nume++
                         }
                    });
                    if(use_success_nume==2&&nodeConfigScript){
                         if(consul_server_length==1&&nodeConfigScript.enable_arbiter){
                            self.canTwoNodePromote=true;
                         }else{
                            self.canTwoNodePromote=false;
                         }
                    }else{
                         self.canTwoNodePromote=false;
                    }
                }
            }else{
                self.canTwoNodePromote=false;
            }
        }   
        // 判断选择节点是否可以点击多节点高可用架构
        function isCanNodeUsefulFrame(obj){
            self.canNodeUsefulFrame=true;
            if (obj) {
                if(obj.length!=2){
                   self.canNodeUsefulFrame=false;
                }else{
                    //两个节点的状态都是配置成功且被使用，nodeConfigScript中arbiter_enable=true且consul有1个值
                    var use_success_nume=0,nodeConfigScript,consul_server_length;
                    obj.forEach(function(item){
                         if(item.nodeConfigScript&&item.useStatus&&(item.status==4||item.status==31||item.status==33)){
                            nodeConfigScript = JSON.parse(item.nodeConfigScript);
                            if(nodeConfigScript.consul&&nodeConfigScript.consul.servers){
                               consul_server_length=nodeConfigScript.consul.servers.length;
                            }
                         }
                         if(item.useStatus&&(item.status==4)){
                            use_success_nume++
                         }
                    });
                    if(nodeConfigScript){
                         if((consul_server_length==1&&nodeConfigScript.enable_arbiter&&use_success_nume==2)||(nodeConfigScript.arbiter_promote_step&&nodeConfigScript.arbiter_promote_step == "1"||nodeConfigScript.arbiter_promote_step == "2"||nodeConfigScript.arbiter_promote_step == "3")){
                            self.canNodeUsefulFrame=true;
                            if(nodeConfigScript.arbiter_promote_step){
                                self.arbiter_promote_step = nodeConfigScript.arbiter_promote_step
                            }
                         }else{
                            self.canNodeUsefulFrame=false;
                         }
                    }else{
                         self.canNodeUsefulFrame=false;
                    }
                }
            }else{
                self.canNodeUsefulFrame=false;
            }
        }
        //两个节点（status为4，被使用，arbtrite为true，consul里面有三个值），一个节点（status为4，被使用，arbtrite为false，consul里面有三个值）
        function isShowThreeNodePromote(data){
            self.isShowThreeProBtn=false;
            var twoNode_arr=[],thirdNode_arr=[],other_arr=[],nodeConfigScript,consul_server_length,twoNode_arbiter;
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
                }else{
                   other_arr.push(item);
                }
            });
            if((twoNode_arr.length==2)&&(thirdNode_arr.length==1)&&nodeConfigScript){
                if(consul_server_length==3&&twoNode_arbiter){
                   self.isShowThreeProBtn=true;
                }
            }
            //其他状态的节点必须为空节点状态
            if(other_arr.length>0){
                for(let i=0;i<other_arr.length;i++){
                    let condition=(other_arr[i].status==1||other_arr[i].status==null)&&!other_arr[i].useStatus
                    if(!condition){
                       self.isShowThreeProBtn=false;
                       break;
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

        //单数据中心不可强制删除，多数据中心必须要多于一个数据中心，且这个数据中心下节点数为三个或者三个以下
        let regionBusiAuth=localStorage.regionBusiAuth!=2?JSON.parse(localStorage.regionBusiAuth):[];
        regionBusiAuth=regionBusiAuth.map(function(item){
            item=Number(item)
            return item;
        });

        //有7为多数据中心
        let multipleRegion=regionBusiAuth.indexOf(7);
        if(multipleRegion>-1){
           self.multipleRegion=true;
        }else{
           self.multipleRegion=false;
        }
        self.regionNum=0;
        if(self.multipleRegion){
           dataclusterSrv.getClusterTableData().then(function(res){
               if(res&&res.data&&angular.isArray(res.data)){
                  self.regionNum=res.data.length;
               }
           });
        }
    
        //虚拟资源节点搜索
        self.applyGlobalSearch = function(globalSearchTerm) {
            var term = globalSearchTerm;
            self.tableNodes.filter({searchTerm: term });
        };

        function successFunc(data) {
            //判断是两节点还是四子星
            self.isTwoNodeMode=isTwoNodeMode(data);
            isShowTwoNodePromote(data)
            isShowThreeNodePromote(data)
            isShowNodeUserfulFrame(data)

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
            newData.forEach(function(item){
                //各种失败操作后可以进行重试操作
                var reg = new RegExp("^23|43|13|53$");
                if (reg.test(item.status)) {
                    item.canRetry = true;
                } else {
                    item.canRetry = false;
                }

                //判断哪些可以进行激活操作
                if (item.status == 42) {
                    item.canActivation = true;
                } else {
                    item.canActivation = false;
                }
            });
            //两节点晋升失败重试按钮只显示一次
            for(let i=0;i<newData.length;i++){
                if(newData[i].status==33){
                   newData[i].canRetry=true;
                   break;
                }
            }
            self.newData=newData;
            self.nodeListData = data;
            self.nodesSearchTerm(({tableData:self.nodeListData,titleData:self.nodeTitleData}))
            self.tableNodes = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: newData });
            var tableId = "nodeUid";
            newCheckedSrv.checkDo(self, data, tableId,"tableNodes");
            //过半健康节点检查
            healthCheck(self.tableNode);
        }
        self.$watch(function() {
            return self.checkedItems;
        }, function(values) { 
            if(!values){
               return;
            }
            self.canForceDeleteNode = false
            if(values.length==1){
                isCanDel(values);
                self.nodeNum=0;
                //多数据中心环境且有一个以上数据中心
                if(self.multipleRegion&&self.regionNum>1){
                   //当前数据中心集群中节点数为三个及三个以内
                   self.newData.forEach(function(item){
                       if(item.useStatus){
                          self.nodeNum++
                       }
                   });
                   if(self.nodeNum<=3){
                      self.canForceDeleteNode = true;
                   }
                }
                
            }else{
                self.canDelTwo = false;
                self.canForceDeleteNode = false
            }
            //isCanDel(values);
            isCanMaintenance(values);
            isCanAdd(values);
            isCanInitConfig(values);
            isCanActivation(values);
            if(self.isShowTwoProBtn){
               isCanTwoNodePromote(values)
            }
            isCanNodeUsefulFrame(values)
            if(self.isShowThreeProBtn){
               isCanThreeNodePromote(values)
            }
            if(localStorage.isTopNonTrivial == "true"){
                if(values.length==1&&!values[0].useStatus){
                    checkErrorArea(values[0])
                }else{
                    self.canInsert = false
                }
            }else{
                self.canInsert = true
            }
        },true);

        //初始化获取节点列表
        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
        getNode(regionUid);
        //getRegion();
        //接收node状态的变化
        self.$on("nodeSocket", function(e, data) {
            self.refreshNodes();
        });
        dockerNodeDetailsCtrl($scope, $translate, $rootScope, $uibModal, NgTableParams, dockerNodesSrv,newCheckedSrv);

        // 多节点高可用架构
        self.nodesUsefulFrame = function(){
            var uibModalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "js/configure/node/tmpl/nodesUsefulFrame.html",
                controller: "nodesUsefulFrameCtrl",
                resolve: {
                    allData:function(){
                        return self.tableNode
                    },
                    editData:function(){
                        return self.checkedItems
                    },
                    context:function(){
                        return self
                    },
                    getNodes:function(){
                        return self.getNode
                    }
                }
            });
        }
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
    localStorage.nodeConfig = JSON.stringify({});
    localStorage.diskCardConfig = JSON.stringify({});

    //软件交付模式
    localStorage.patternSelected=JSON.stringify({name:"软件交付模式",value:"deliver"});
    self.headers={
        hostName:$translate.instant("aws.node.init.hostName"),
        clusterNet:$translate.instant("aws.node.init.clusterNet"),
        storageNet:$translate.instant("aws.node.init.storageNet"),
        tanentNet:$translate.instant("aws.node.init.tanentNet"),
    }
    
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
    self.activeConfig=function(type,canLoad){
        if(type=='addNodeInfomation'){
          self.addNodeInfomation=true;
          self.cartConfig=false;
          self.networkInspection=false;
          self.diskConfig=false;
          self.diskInspectin=false;
        }else if(type=='cartConfig'){
          self.addNodeInfomation=false;
          self.cartConfig=true;
          self.networkInspection=false;
          self.diskConfig=false;
          self.diskInspectin=false;
          self.cardconfigure(context.checkedItems);
          if(canLoad){
            $timeout(function(){
                initCardCtrl($scope, $http,$timeout, $location, $routeParams, $interval,$translate);
            },100)       
          }
        }else if(type=='networkInspection'){
          //网卡配置才允许进行网络检查
          self.addNodeInfomation=false;
          self.cartConfig=false;
          self.networkInspection=true;
          self.diskConfig=false;
          self.diskInspectin=false; 
          netCheckCtrl($scope, $http,$timeout, $location,$routeParams,NgTableParams,dataclusterSrv,context, $interval,$translate);
        }else if(type=='diskConfig'){
          self.addNodeInfomation=false;
          self.cartConfig=false;
          self.networkInspection=false;
          self.diskConfig=true;
          self.diskInspectin=false;
          self.disksconfigure(context.checkedItems);
          $timeout(function(){
              initDisksCtrl($scope, $http,$timeout, $location, $routeParams, $interval,$translate,dataclusterSrv);
          },100)
        }else if(type=='diskInspectin'){
          self.addNodeInfomation=false;
          self.cartConfig=false;
          self.networkInspection=false;
          self.diskConfig=false;
          self.diskInspectin=true; 
        }
    };  
    //初始化进来在提示信息界面
    self.activeConfig('addNodeInfomation');
    self.infomationToCardConfig=function(){
        self.activeConfig('cartConfig',true);
    }
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
                        ceph_ssd=[],
                        local_osd=[]
                    i.data.forEach(function(v){
                        ceph_osd.push('/dev/'+v.name)
                    })
                    i.caching.forEach(function(v){
                        ceph_ssd.push('/dev/'+v.name)
                    })
                    i.localdisk.forEach(function(v){
                        local_osd.push('/dev/'+v.name)
                    })
                    ceph_osd = ceph_osd.join(", ")
                    ceph_ssd = ceph_ssd.join(", ")
                    local_osd = local_osd.join(", ")
                    i.ceph_osd = ceph_osd;
                    i.ceph_ssd = ceph_ssd;
                    i.local_osd = local_osd;
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
                    //if(self.insDisk){
                       item.disk_data = i.local_osd;
                    //}else if(self.cephDisk){
                       item.disk_config=[{
                          "ceph_osd":i.ceph_osd,  //#数据盘
        　　　　　　      "ceph_ssd":i.ceph_ssd,  // #日志盘
        　　　　　　      "mode":i.mode,
        　　　　　　      "root":i.root
                       }]
                    //}
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
           var fault_domain = localStorage.isTopNonTrivial=="true"?context.checkedItems[0].fault_domain :"0-0-0"
           var options={
               "regionid":JSON.parse(localStorage.$LOGINDATA).regionUid,
               "nodeid":nodeid,
               "regionkey":localStorage.regionKey,
               "isTopNonTrivial":false,
               "enable_ceph":localStorage.isCustom=='true'?true:self.hasCephStorage?true:false,
               "ha":false,
                "fault_domain":fault_domain,
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
