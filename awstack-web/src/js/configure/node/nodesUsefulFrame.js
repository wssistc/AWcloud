import "./nodeSrv";
import "../../system/datacluster/dataclusterSrv";
import {
    initCardCtrl as initCardCtrl
} from "../../system/datacluster/initCardConfig";
import {
    initDisksCtrl as initDisksCtrl
} from "../../system/datacluster/initDisksConfig";
import {netCheckCtrl as netCheckCtrl} from "../../system/datacluster/netCheck";
import { isArray } from "util";
angular.module("nodesUsefulFrameModel", ["nodesrv","dataclusterSrv"])
.controller("nodesUsefulFrameCtrl", function($scope, $rootScope, $translate, $uibModal,$interval,$uibModalInstance,dataclusterSrv,editData ,allData ,NgTableParams ,TableCom ,context,getNodes,$timeout) {
    let self = $scope;
    let scope = context//nodeCtrl的self
    $rootScope.showNatureStart = false;
    self.allNodesData = allData;
    self.editNodesData = editData;//外面勾选进行节点晋升的两个节点

    self.inStep = context.arbiter_promote_step?context.arbiter_promote_step:1;
    self.inStepOneBar = 0;
    self.inStepTwoBar = 1;
    self.inStepThreeBar = 2;
    self.showTwoNodePromoteBtn = false ;
    self.showInitNodesBtn = false;
    self.showThreeNodePromoteBtn = false;
    var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;

    self.canInitNodes = false;
    self.canInsertNodes = false;

    // 排序函数
    function sortTab(arr){
        if(arr&&arr.length>0){ return arr.sort(function(a,b){
            return a.hostName > b.hostName;
        })}
    }
    self.stepNext = function(num){
        self.inStep = num;
        if(num==2){
            if(self.editNodesData.every(checkStepOne)){
                //设置成第二步
                self.inStep = 2;
                dataclusterSrv.setStep(regionUid,self.inStep).then(function(res){
                    //需要同步更新页面的nodelist表
                    getNodes(regionUid);
                });
                self.showTwoNodePromoteBtn = false;
            }else{
                self.showTwoNodePromoteBtn = true;
                $timeout(function(){
                   self.showTwoNodePromoteBtn = false;
                },2500);
                self.inStep = 1;
            } 
        }else if(num==3){
            if(self.allNodesData.some(checkStepTwo)){
                self.inStep = 3;
                dataclusterSrv.setStep(regionUid,self.inStep).then(function(res){
                    getNodes(regionUid);
                });
                self.showInitNodesBtn = false;
                self.insertToCount = [];
                self.allNodesData.forEach(function(item){
                    if((item.status == 4)&& item.useStatus && item.healthStatus){
                        self.insertToCount.push(item);
                        TableCom.init(self,'tableInsertToCount',sortTab(self.insertToCount),'nodeUid',10,"checkInsertToCount");   
                    }
                });
            }else{
                self.inStep = 2;
                self.showInitNodesBtn = true;
                $timeout(function(){
                   self.showInitNodesBtn = false;
                },2500);
            } 
        }
    };
    // 下一步判断
    // 第一步判断是两节点都存在nodeConfigScript且nodeConfigScript中enable_arbiter=true且consul有3个值
    function checkStepOne(node){
        if(node.nodeConfigScript){
            let nodeConfigScript = JSON.parse(node.nodeConfigScript);
            if(nodeConfigScript.consul.servers.length == 3 && nodeConfigScript.enable_arbiter){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    // 第二步的判断存在两节点符合第一步的要求，并且有一条存在nodeConfigScript且nodeConfigScript中enable_arbiter=false且consul有3个值
    //?角色的判断是不是正确
    function checkStepTwo(node){
        if(node.nodeConfigScript){
            let nodeConfigScript = JSON.parse(node.nodeConfigScript);
            if(nodeConfigScript.consul.servers.length==3&&!nodeConfigScript.enable_arbiter&&node.roles=="client" && node.status == 4 && node.useStatus && node.healthStatus){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    // 第一步列表显示
    TableCom.init(self,'tableCanAddNodes',sortTab(self.editNodesData),'nodeUid',10);
    // 第二步列表显示
    TableCom.init(self,'tableInitNodes',sortTab(self.allNodesData),'nodeUid',10,"checkInitPage");
    // 第三部列表显示
    self.insertToCount = [];
    self.allNodesData.forEach(function(item){
        //两个已经晋升成功的节点和第三个需要晋升的节点在第三部展示
        if((item.status == 4 ||item.status == 31||item.status == 33) && item.useStatus && item.healthStatus){
            self.insertToCount.push(item);
            TableCom.init(self,'tableInsertToCount',sortTab(self.insertToCount),'nodeUid',10,"checkInsertToCount"); 
        }
    });


    //第一步两节点晋升按钮的判断
    self.checKTwoNodesPromote = false;
    function checkTwoNodesPromote(value){
        if(value.nodeConfigScript&&value.useStatus&&(value.status==4)&&value.roles=="client"){
            let nodeConfigScript = JSON.parse(value.nodeConfigScript);
            if(nodeConfigScript.consul&&nodeConfigScript.consul.servers&&nodeConfigScript.consul.servers.length==1&&nodeConfigScript.enable_arbiter) return true
            else return false;
        }else return false;
    }
    if(self.editNodesData.every(checkTwoNodesPromote)){
        self.checKTwoNodesPromote = true;
    } else {
        self.checKTwoNodesPromote = false;
    }


    // 两节点晋升弹框
    self.twoNodePromote = function() {
        var content = {
            target: "twoNodes",
            msg: "<div class='resetVolume-info'>" + $translate.instant("aws.node.sureTwoNodePromote") + "</div>",
            type: "warning",
            btnType: "btn-warning"
        };
        scope.$emit("delete", content);
    };
    scope.$on("twoNodes", function() {
        var nodeArr=[];
        self.editNodesData.forEach(function(item){
            nodeArr.push(item.nodeUid);
        });
        var options={
            "nodeUids":nodeArr 
        };
        dataclusterSrv.twoNodePromote(options).then(function(res){
            let data = {
                "regionKey":localStorage.regionKey
            };
            //self.twoNodePromoteResize(data);
            //更新第一步表中的节点
            //将步数重置为1
            dataclusterSrv.setStep(regionUid,1).then(function(res){
                //需要同步更新页面的nodelist表
                promoteOption();
            });
            
        });
    });

    
    // 两节点晋升云管会重启，需要重新登录，轮询调api
    self.twoNodePromoteResize = function(options){
        self.successTimer = 1;   //防止云管间歇中断，每次轮询3次才改变状态
        self.failTimer = 1 ;     //失败3次才改变状态
        self.canAlertMsg = 1;    
        var timer = $interval(function(){
            dataclusterSrv.getNatureStart(options).then(function(result) {
                if(!result){
                    self.failTimer ++; 
                    if(self.failTimer == 3) self.canAlertMsg = 2 ;    
                }else if(result&&result.msg == "OK"){
                    if(self.canAlertMsg == 2){
                        self.successTimer ++; 
                        if( self.successTimer ==3 ){
                            $rootScope.showNatureStart = true;
                        }  
                    }
                }
            });
        },10000);  
    };

    self.checkInitPage = {
        items: {}
    };

    self.checkInsertToCount = {
        items: {}
    };

    self.$on("nodeSocket", function(e, data) {
        if(data.event_type == "nodeMng.promote.ing"|| data.event_type == "nodeMng.promote.fail" || data.event_type == "nodeMng.promote.success"){
            promoteOption();
        }else if(data.event_type == "nodeMng.add.ing"|| data.event_type == "nodeMng.add.fail" || data.event_type == "nodeMng.add.success"){
            self.addOption();
        }
    });

    // 收到晋升推送消息之后的函数
    function promoteOption(){
        getNodes(regionUid);
        var watchNewData = self.$watch(function(){
            return context.newData;
        },function(newData){
            if(!newData) return;
            self.allNodesData = newData;
            self.newEditNodesData = [];
            if(self.inStep == "1"){
                self.allNodesData.forEach(function(item){
                    self.editNodesData.forEach(function(value){
                        if(value.nodeUid == item.nodeUid){
                            self.newEditNodesData.push(item);
                            TableCom.init(self,'tableCanAddNodes',sortTab(self.newEditNodesData),'nodeUid',10);
                        }
                    });
                });
                //刷新后再重新判断是否可以点击两节点晋升
                if(self.newEditNodesData.every(checkTwoNodesPromote)){
                    self.checKTwoNodesPromote = true;
                } else {
                    self.checKTwoNodesPromote = false;
                }
            } else if(self.inStep == "3"){
                self.insertToCount = [];
                self.allNodesData.forEach(function(item){
                    // let nodeConfigScript = JSON.parse(value.nodeConfigScript)
                    // || nodeConfigScript.arbiter_promote_step == "3"
                    if((item.status == 4 ||item.status == 31||item.status == 33)&& item.useStatus && item.healthStatus){
                        self.insertToCount.push(item);
                        TableCom.init(self,'tableInsertToCount',sortTab(self.insertToCount),'nodeUid',10,"checkInsertToCount");   
                    }
                });
            }
        },true);
    }

    // 收到新增节点推送消息之后的操作
    self.addOption = function(){
        getNodes(regionUid)
        var watchNewAllData = self.$watch(function(){
            return context.newData
        },function(newData){
            if(!newData) return
            self.allNodesData = newData 
            TableCom.init(self,'tableInitNodes',sortTab(self.allNodesData),'nodeUid',10,"checkInitPage");
        },true);
    };

    // 监听加入集群页面单选框
    self.$watch(function() {
        return self.checkInitPage.items;
    }, function(val) {
        self.InitNodesCheckedItems = [];
        var arr=[];
        for(var i in self.checkInitPage.items){
            arr.push(self.checkInitPage.items[i]);
        }

        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.allNodesData.forEach(item=>{
                        if(item.nodeUid==key){
                            self.InitNodesCheckedItems.push(item);
                        }
                    });
                }
            }
        }
        if(val){
            self.showInitNodesBtn=false;
        }
        let checkedItems=self.InitNodesCheckedItems;
        self.canInitNodes = false;
        if(checkedItems.length==1){
            if(!checkedItems[0].nodeConfigScript&&(checkedItems[0].status =="1"||!checkedItems[0].status)&&!checkedItems[0].useStatus&&checkedItems[0].roles == "client"){
                //不存在其他正在进行加入进群操作的节点
                if(notInitNodest()){
                    self.canInitNodes = true;
                    self.addcheckedItems = checkedItems;
                }
            }
        }
    },true);

    //加入集群，如果数组中存在一条数据是状态为12 或者11，或者三条数据状态都为4，不可勾选节点加入集群
    function notInitNodest(){
        let status_one_init = 0,status_three_hasInit = 0;
        self.allNodesData.forEach(function(item){
            if(item.status == "11" ||item.status == "12") status_one_init++;
            if(item.status == "4") status_three_hasInit ++;
        });
        if(status_one_init>0||status_three_hasInit>2) return false
        else return true
    }


    // 监听晋升新节点页面单选框
    self.$watch(function() {
        return self.checkInsertToCount.items;
    }, function(val) {
        self.insertCheckedItems = [];
        var arr=[];
        for(var i in self.checkInsertToCount.items){
            arr.push(self.checkInsertToCount.items[i])
        }

        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.allNodesData.forEach(item=>{
                        if(item.nodeUid==key){
                            self.insertCheckedItems.push(item);
                        }
                    });
                }
            }
        }

        let checkedItems=self.insertCheckedItems;
        self.canInsertNodes = false;
        if(checkedItems.length==1){
            if(checkedItems[0].nodeConfigScript && checkedItems[0].status ==4 && checkedItems[0].useStatus && checkedItems[0].roles == "client"){
                self.canInsertNodes = true; 
                self.InsertCheckedItems = checkedItems;
            }
        }
    },true);


    // 加入集群
    self.initConfig=function(item){
        $uibModal.open({
            animation: true,
            templateUrl: "js/system/datacluster/tmpl/initConfig.html",
            controller: "initConfigFrameCtrl",
            resolve:{
                editData:function(){
                    return item;
                },
                context:function(){
                    return scope;
                },
                addOption:function(){
                    return self.addOption;
                }
            }
        }); 
    };

    // 第三节点晋升弹框
    self.threeNodePromote = function() {
        var content = {
            target: "threeNodePromote",
            msg: "<span>" + $translate.instant("aws.node.sureThirdNodePromote") + "</span>",
            type: "warning",
            btnType: "btn-warning"
        };
        scope.$emit("delete", content);
    };
    scope.$on("threeNodePromote", function() {
        var nodeArr=[];
        if(!self.InsertCheckedItems||(self.InsertCheckedItems&&!self.InsertCheckedItems.length)) return
        self.InsertCheckedItems.forEach(function(item){
            nodeArr.push(item.nodeUid);
        });
        var options={
            "nodeUids":nodeArr 
        };
        dataclusterSrv.threeNodePromote(options).then(function(res){
            dataclusterSrv.setStep(regionUid,3).then(function(res){
                //需要同步更新页面的nodelist表
                thirdNodeOption();
            });
        });
    });

    // 点击第三节点晋升按钮之后刷新弹框操作
    function thirdNodeOption(){
        getNodes(regionUid);
        let watchNewAllData = self.$watch(function(){
            return context.newData;
        },function(newData){
            if(!newData) return;
            self.allNodesData = newData ;
            self.insertToCount = [];
            self.allNodesData.forEach(function(item){
                if((item.status == 4 ||item.status == 31||item.status == 33) && item.useStatus && item.healthStatus){
                    self.insertToCount.push(item);
                    TableCom.init(self,'tableInsertToCount',sortTab(self.insertToCount),'nodeUid',10,"checkInsertToCount");   
                }
            });
        },true); 
    }

    // 重试按钮 晋升失败重试和加入集群失败重试
    // 重试有两种状态，一种传一个id，第二步和第三部，另外一种传两个id，刷新弹框的函数不一样
    self.retryCan=false;
    self.retry = function(obj) {
        self.retryCan=true;
        var nodeId = obj.nodeUid;
        var nodeUidsArry=[];
        //可能为两节点晋升失败（一个按钮，传两个节点uid）,或者三节点晋升失败(传第三节点的uid)
        if(obj.status==33){
           self.allNodesData.map(function(item){
              if(item.status==33){
                 nodeUidsArry.push(item.nodeUid);
              }
           });
        }else{
           nodeUidsArry.push(nodeId);
        }
        dataclusterSrv.retryNodeAction(nodeUidsArry, regionUid).then(function() {
            retryPage();
        }).finally(function(){
            self.retryCan=false;
        });
    };
    // 不同弹出步骤刷新页面的函数不一样
    function retryPage(){
        getNodes(regionUid);
        let watchRetryAllData = self.$watch(function(){
            return context.newData;
        },function(newData){
            if(!newData) return;
            self.allNodesData = newData;
            if(self.inStep == 1){
                self.newEditNodesData = [];
                self.allNodesData.forEach(function(item){
                    self.editNodesData.forEach(function(value){
                        if(value.nodeUid == item.nodeUid){
                            self.newEditNodesData.push(item)
                            TableCom.init(self,'tableCanAddNodes',sortTab(self.newEditNodesData),'nodeUid',10);
                            watchRetryAllData();
                        }
                    });
                });
            }else if(self.inStep == 2){
                TableCom.init(self,'tableInitNodes',sortTab(self.allNodesData),'nodeUid',10,"checkInitPage");
                watchRetryAllData();
            }else if(self.inStep == 3){
                self.insertToCount = [];
                self.allNodesData.forEach(function(item){
                    if((item.status == 4 ||item.status == 31||item.status == 33) && item.useStatus && item.healthStatus){
                        self.insertToCount.push(item);
                        TableCom.init(self,'tableInsertToCount',sortTab(self.insertToCount),'nodeUid',10,"checkInsertToCount"); 
                        watchRetryAllData() ; 
                    }
                });
            }

        },true);
    }

    // 第三部确认按钮是否可以点击，三节点状态都是健康，已使用，server，状态为4，存在nodeConfigScript且nodeConfigScript中enable_arbiter=false且consul有3个值
    function checkCanConfirm(item){
        if(item.nodeConfigScript){
            let nodeConfigScript = JSON.parse(item.nodeConfigScript);
            if(!nodeConfigScript.enable_arbiter&&nodeConfigScript.consul.servers.length==3&&item.status==4&&item.roles=="server"&&item.healthStatus&&item.useStatus ){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }         
    }

    // 第三节点晋升成功之后，需要点击确认按钮，将step归0
    self.confirm = function(){
        if(self.insertToCount.every(checkCanConfirm)){
            let regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
            self.showThreeNodePromoteBtn = false;
            dataclusterSrv.setStep(regionUid,0).then(function(res){
                //需要同步更新页面的nodelist表
                getNodes(regionUid);
                $uibModalInstance.close();
            });
            // dataclusterSrv.initArbiterPromoteStep(localStorage.enterpriseUid,regionUid).then(function(res){
            //     getNodes(regionUid);
            //     $uibModalInstance.close();
            // })
        }else{
            self.inStep = 3;
            self.showThreeNodePromoteBtn = true;
            $timeout(function(){
               self.showThreeNodePromoteBtn = false;
            },2500);
        }
    }    
}).controller("initConfigFrameCtrl",["$scope","$rootScope","$uibModalInstance","editData","dataclusterSrv","physicalConductorSrv","$location","context","$http","$timeout","$routeParams","NgTableParams", "$interval","$translate","addOption",function($scope,$rootScope,
    $uibModalInstance,editData,dataclusterSrv,physicalConductorSrv,$location,context,$http,$timeout,$routeParams,NgTableParams, $interval,$translate,addOption) {
    var self=$scope;
    self.nodeName=editData[0].hostName;
    localStorage.nodeConfig = JSON.stringify({});
    localStorage.diskCardConfig = JSON.stringify({});
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
          self.cardconfigure(editData);
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
          self.disksconfigure(editData);
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
           editData.forEach(function(item){
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
                    // if(self.insDisk){
                       item.disk_data = i.local_osd;
                    // }else if(self.cephDisk){
                       item.disk_config=[{
                          "ceph_osd":i.ceph_osd,  //#数据盘
        　　　　　　      "ceph_ssd":i.ceph_ssd,  // #日志盘
        　　　　　　      "mode":i.mode,
        　　　　　　      "root":i.root
                       }]
                    // }
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
           var nodeid=editData[0].nodeUid;
           var fault_domain = localStorage.isTopNonTrivial=="true"?editData[0].fault_domain :"0-0-0"
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
                //将步数重置为2
                dataclusterSrv.setStep(JSON.parse(localStorage.$LOGINDATA).regionUid,2).then(function(res){
                    addOption();
                });
            });

       }else{
           self.clickFinish=true;
           $timeout(function(){
               self.clickFinish = false;   
           },2000)
       }
    }
}])