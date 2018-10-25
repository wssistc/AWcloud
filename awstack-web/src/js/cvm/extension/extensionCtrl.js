import "./extensionSrv";
import "../instances/instancesSrv";
import "../images/imagesSrv";
import "../networks/networksSrv";
import "./scalpolicySrv";

var extensionModule = angular.module("extensionModule", ["ngTable", "ngAnimate", "ui.bootstrap", "imagesSrv","policySrv","networksSrvModule","extensionSrv", "instancesSrv","ui.select", "ngMessages","makeImageSrvModule"]);
extensionModule.controller("extensionCtrl", function($scope,$filter, $rootScope, NgTableParams, alertSrv, $location, $uibModal, extensionSrv,instancesSrv, checkedSrv, $translate,GLOBAL_CONFIG,dataclusterSrv) {
    var self = $scope;
    self.canDelete=false;
    self.canAddIns=false;
    self.imageRequired=false;
    self.localVolumeCreteIns=false;
    self.noDataDisk = false;
    self.tab={};
    function successFunc(data) {
        self.tabledata = data;
        data.map(function(item){
            item.createTime = $filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");
            item.searchTerm = [item.name,item.currentSize,item.reason, item.createTime , $translate.instant("aws.extension.status."+item.status)].join('\b');
        });
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({searchTerm:term});
        };
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
        //判断是否能新建弹性扩展
        var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
        dataclusterSrv.getAllNode(regionUid).then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map(item => {
                    item.hostInfo = JSON.parse(item.hostInfo);
                    item.nodeConfigScript =  JSON.parse(item.nodeConfigScript);
                    if(item.nodeConfigScript&&!item.nodeConfigScript.disk_data && item.hostInfo && item.hostInfo.var_data_size<800 ){
                        self.noDataDisk = true;
                    }
                });
                //系统盘分区是否能本地盘创建云主机，软件交付模式下，没有对接存储，需要判断是否能新建本地盘云主机
                if(localStorage.isCustom=='false'){
                    dataclusterSrv.getStorageList().then(function(res){
                        if(res&&res.data&&angular.isArray(res.data)){
                            self.storageList=res.data.filter(function(item){
                                return item.use==0;
                            });
                            //没有对接存储,java端会用本地盘创建云主机
                            if(self.storageList.length==0&&self.noDataDisk){
                                self.localVolumeCreteIns=false;
                            }else{
                                self.localVolumeCreteIns=true;
                            }
                        } 
                    });
                }else{
                    self.localVolumeCreteIns=true;
                }
            }
        });
    }

    function getExtensions() {
        extensionSrv.getScaleClusters().then(function(data) {
            self.globalSearchTerm = "" ;
            if(data&&data.data){
                successFunc(data.data);
            }
            data?self.loadData = true:"";
        });
    }
    self.refreshExtension=function(){
        getExtensions();
    }
    getExtensions();
    self.newExtension=function(){
        if(self.localVolumeCreteIns){
           $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "newExtension.html",
                controller: "newExCtrl",
                resolve: {
                    getExtensions: function() {
                        return getExtensions;
                    }
                }
            });
        }
    };
    //删除弹性扩展
    self.deleteExtension = function(checkedItems) {
        var content = {
            target: "delCluster",
            msg: "<span>" + $translate.instant("aws.extension.tipMsg.delScaleCluster") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    
    self.$on("delCluster", function(e,data) {
        if(data.length==1){
            extensionSrv.delCluster(data[0].id).then(function(result){
                getExtensions();
            })
        }else{
            var cluster_ids=[];
            _.forEach(data,function(item){
                cluster_ids.push(item.id);
            });
            var delParams = {
                ids: cluster_ids
            };
            extensionSrv.delClusters(delParams).then(function(result){
                getExtensions();
            })
        }
    });
    //删除时候刷新页面
    $rootScope.$on("extensionSocket",function(e,data){
        getExtensions();
    });
    $scope.$on("getDetail", function(event, value) {
        extensionSrv.getClusterDetail(value).then(function(result) {
            if(result&&result.data){
                $scope.baseInfo = result.data;
            }else{
                $scope.baseInfo=[];
            }
        });
        self.instanceForm=new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        self.balanceForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        self.alarmScalePolicyForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        self.alarmEventForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        self.detailActive=0;
        self.selectIndex=function(page){
            if(page==0){
                self.tab.tabShow=0;
                extensionSrv.getInsDetail(value).then(function(result) {
                    if(result&&result.data){
                        self.insInfo = result.data;
                        self.insInfo.forEach(function(item){
                            item.createTime=$filter("date")(item.created, "yyyy-MM-dd HH:mm:ss");
                            item.updateTime=$filter("date")(item.updated, "yyyy-MM-dd HH:mm:ss")
                        });
                        self.instanceForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: result.data });
                    }
                });
            }else if(page==1){
                self.tab.tabShow=1;
                extensionSrv.getLBDetail(value).then(function(result) {
                    if(result&&result.data){
                        self.lbInfo = result.data;
                        self.balanceForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: result.data });
                    }
                });
            }else if(page==2){
                self.tab.tabShow=2;
                extensionSrv.getScaleRules(value).then(function(result){
                    if(result&&result.data){
                        result.data = _.map(result.data, item => {
                            _.each(item.alarmTemps, temp => {
                                temp.unit = "%";
                                if (temp.name == "net.bytes_sent" || temp.name == "net.bytes_recv") {
                                    temp.threshold = temp.threshold * 8 / 1024 / 1024;
                                    temp.unit = "Mbit/s";
                                }
                            })
                            return item;
                        });
                      self.alarmScalePolicy = result.data;
                      self.alarmScalePolicyForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: result.data });
                    }
                   
                });
            }else if (page == 3) {
                self.tab.tabShow=3;
                extensionSrv.getAlarmEventProcessDetail(value).then(function (result) {
                    if (result && result.data) {
                        self.aepInfo = result.data;
                        self.aepInfo.forEach(function(item){
                            item.status_TR=$translate.instant("aws.extension.status."+item.status);
                        });
                        self.alarmEventForm = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: result.data });
                    }
                });
            }
        };
        self.selectIndex(1);
        self.selectIndex(2);
        self.selectIndex(3);
        self.selectIndex(0);
    });

    self.$watch(function() {
        return self.checkedItems;
    }, function(values) {
        if(typeof(values)!="undefined"){
            if (values.length == 1) {
                canDelFunc(values[0]);
                canAddInsFunc(values[0]);
            } else if (values.length > 1) {
                self.canAddIns=false;
                for (var i = 0; i < values.length; i++) {
                    canDelFunc(values[i]);
                    if (self.canDelete == false) {
                        break;
                    }
                }
            }else{
                self.canAddIns=false;
                self.canDelete=false;
            }
        }
    });

    function canAddInsFunc(obj){
        self.canAddIns=true;
        var canAddArray=["delete-server-failed","creating","create-failed","deleting","delete-failed","scaling","scale-failed"];
        canAddArray.forEach(function(item){
             if(obj.status==item){
                self.canAddIns=false;
             }
        });
    }

    function canDelFunc(obj) {
        self.canDelete = true;
        var cantDelArray = ["creating", "deleting", "scaling"];
        _.forEach(cantDelArray, function(item) {
            if (obj.status == item) {
                self.canDelete = false;
            }
        });
    }

    self.addInstances=function(checkedItems){
        self.addInstancesModal=$uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "addInstances.html",
            controller: "addInstancesCtrl",
            resolve: {
                getExtensions: function() {
                    return getExtensions;
                },
                editData:function(){
                    return checkedItems[0];
                },
                context:function(){
                    return self;
                }
            }
        });
    };

});
extensionModule.controller("newExCtrl",function($scope, $rootScope,$uibModalInstance,extensionSrv,policySrv,networksSrv,imagesSrv,instancesSrv,getExtensions,makeImageSrv,$translate,$timeout,dataclusterSrv){
    var self=$scope;
    self.submitted = false;
    self.maxSizeLimit = false;
    self.scaleTab={};
    self.scaleTab.isShow=0;
    self.chooseTab=function(step){
        self.scaleTab.isShow=step;
    };
    self.interactedBase = function(field) {
        return self.baseMsgFormValid || field.$dirty;
    };
    self.interactedIns = function(field) {
        return self.insFormValid || field.$dirty;
    };
    self.interactedBalance = function(field) {
        return self.balanceFormValid || field.$dirty;
    };
    self.interactedScale = function(field) {
        return self.interactedScaleValid || field.$dirty;
    };

    self.stepToTwo=function(baseMsgForm){
        self.baseMsgFormValid=false;
        if(baseMsgForm.$valid){
           self.chooseTab(1);
        }else{
           self.baseMsgFormValid=true;
        }
    };

    self.stepToThree=function(insForm){
        self.insFormValid=false;
        if(insForm.$valid){
           self.chooseTab(2);
        }else{
           self.insFormValid=true;
        }
    };

    self.stepToFour=function(balanceForm){
        self.balanceFormValid=false;
        if(balanceForm.$valid){
           self.chooseTab(3);
        }else{
           self.balanceFormValid=true;
        }
    };
    self.postdata={
        name:"",
        initsize:"",
        minsize:"",
        maxsize:"",
        scalrule:[]
    };
    self.postdata.lbservertemp={
        hostname:"",
        flavor:"1",
        image_id:"",
        network_id:"",
        keypair_id:"",
        admin_pass:"",
        os_type:"Linux"
    };
    self.postdata.lbtemp={
        subnet_id:"",
        protocol:"",
        port:"",
        algorithm:""
    };

    //判断是否是admin,非admin要过滤外网
    switch(localStorage.managementRole){
        case"2":
            self.isSuperAdmin = true;//是否是超级管理员
            break;
        default:
            self.isSuperAdmin = false;//是否是超级管理员
    }

    //获取秘钥对
    self.keypair={};
    self.keypairList=[];
    instancesSrv.getKeypairs().then(function(result){
        if(result&&result.data){
            self.keypairList=result.data;
            self.keypairList.push({name:"不选择",id:""});
            self.keypairList.reverse();
        }
        if(self.keypairList.length>0){
            self.keypair=self.keypairList[0];
            self.postdata.lbservertemp.keypair_id=self.keypair.id;//数据库不能保存id，太长，保存name,此时为空可以保存id
        }
    });
    self.changeKeypair=function(keypair){
        self.postdata.lbservertemp.keypair_id=keypair.name;//数据库不能保存id，太长，保存name
    };


    //负载均衡协议处理
    self.protocolList=[{id:"",name:"HTTP"},{id:"",name:"HTTPS"}, {id:"",name:"TCP"}];
    self.protocol=self.protocolList[0];
    self.postdata.lbtemp.protocol=self.protocol.name;
    self.changePro=function(protocol){
        self.postdata.lbtemp.protocol=protocol.name;
    };


    //均衡算法的处理
    self.balanceList=[
        {id:"ROUND_ROBIN",name:$translate.instant("aws.loadbalancers.lbAlgorithm.ROUND_ROBIN")},
        {id:"LEAST_CONNECTIONS",name:$translate.instant("aws.loadbalancers.lbAlgorithm.LEAST_CONNECTIONS")},
        {id:"SOURCE_IP",name:$translate.instant("aws.loadbalancers.lbAlgorithm.SOURCE_IP")}
      ];
    self.balance=self.balanceList[0];
    self.postdata.lbtemp.algorithm=self.balance.id;
    self.changeBal=function(balance){
        self.postdata.lbtemp.algorithm=balance.id;
    };

    //获取image
    self.imageList=[];
    self.image={};
    //过滤掉格式为iso的,且加入系统盘分区限制，当节点中的var_data_size<300，过滤掉size>50的镜像
    imagesSrv.getImages().then(function(result){
        if(result&&result.data){
            var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
            //过滤掉不可用的镜像
            result.data.forEach(function(item){
                let condition=item.os_type&&( item.os_type.toLowerCase()=='windows'||item.os_type.toLowerCase()=="linux" ) &&(item.size!=0) && (item.arch =="x86_64" || item.arch =="i686" )&&item.disk_format!='iso'&&item.status.toLowerCase() == 'active';
                if(condition){
                   self.imageList.push(item);  
                }
            });
            dataclusterSrv.getAllNode(regionUid).then(function(res){
                if(res && res.data && angular.isArray(res.data)){
                    res.data.map(item => {
                        item.hostInfo = JSON.parse(item.hostInfo);
                        item.nodeConfigScript =  JSON.parse(item.nodeConfigScript);
                        if(item.hostInfo.var_data_size<300 ){
                            self.maxSizeLimit = true;
                        }
                        if(item.nodeConfigScript&&!item.nodeConfigScript.disk_data &&item.hostInfo&& item.hostInfo.var_data_size<800 ){
                            self.noDataDisk = true;
                        }
                    });
                    //系统盘分区限制，无论是软件交付还是超融合，在var_data_size小于300GB是，启动镜像大小限制功能，镜像大小大于50G提示不能创建云主机。
                    if(self.maxSizeLimit){
                        self.imageList=angular.copy(self.imageList).filter(item=>item.size<=50);
                    }
                    if(self.imageList.length){
                        self.image=self.imageList[0];
                        self.postdata.lbservertemp.image_id=self.image.imageUid;
                    }
                }
            });
        }

    });
    self.changeImage=function(image){
        self.scaleTab.selectedImage=image;
        //根据镜像过滤flavor
        self.configList=angular.copy(self.configSaveList).filter(function(config){
             return config.disk==0||config.disk>=image.size;
        });
        if(self.configList.length>0){
            self.config=self.configList[0];
            self.postdata.lbservertemp.flavor=self.config.id;
        }
        self.postdata.lbservertemp.image_id=image.imageUid;
    };

    //获取网络
    self.networkList=[];
    self.network={};
    makeImageSrv.getNetwork().then(function(result){
        if(result&&result.data){
            for(var i=0;i<result.data.length;i++){
                if(result.data[i].subnets.length==0){
                    result.data.splice(i,1)
                }
            }
            //非admin过滤掉外网
            if(!self.isSuperAdmin){
               self.networkList=result.data.filter(function(item){
                   return !item.external;
               });
            }else{
               self.networkList=result.data; 
            }
        }
        if(self.networkList.length>0){
            self.network=self.networkList[0];
            self.postdata.lbservertemp.network_id=self.network.id;
        }
    });
    self.changeNet=function(net){
        self.postdata.lbservertemp.network_id=net.id;
    };

    //获取负载均衡的子网(为前面云主机选择网络的子网)
    self.subnetList=[];
    self.subnet={};
    var getSubnets=function(value){
        networksSrv.getNetworksSubnet(value).then(function(result){
            if(result&&result.data){
                self.subnetList=result.data.filter(function(item){
                   return item.ipVersion=='4';
                });
                self.subnet={};
            }
            if(self.subnetList.length>0){
                self.subnet=self.subnetList[0];
                self.postdata.lbtemp.subnet_id=self.subnet.id;
            }
        });
    };
    self.changeSub=function(subnet){
        self.postdata.lbtemp.subnet_id=subnet.id;
    };

    //云主机的网络改变时，负载均衡的子网随之改变。
    self.$watch(function(){
        return self.postdata.lbservertemp.network_id;
    },function(value){
        if(value){
           getSubnets(value);
        }
    });

    //获取flavor
    self.config={};
    self.configList=[];
    self.configSaveList=[];
    instancesSrv.getFlavors().then(function(result) {
        if(result&&result.data){
            _.forEach(result.data, function(val) {
                val.text = val.name+ ": "+val.vcpus  +$translate.instant("aws.instances.conf.memtip") + (val.ram/1024).toFixed(2) + $translate.instant("aws.instances.conf.endtip");
                val._name = val.name+ " ( CPU:"+val.vcpus   + $translate.instant("aws.instances.conf.memtip") + ":"+(val.ram/1024).toFixed(2)+" GB )" ;
                self.configList.push(val);
                self.configSaveList.push(val);
            });
        }
        if(self.configList.length>0){
            self.config=self.configList[0];
            self.postdata.lbservertemp.flavor=self.config.id;
            if(self.image.name){
               self.changeImage(self.image);
            }
        }

    });
    self.changeConfig=function(config){
        self.postdata.lbservertemp.flavor=config.id;
    };
   
    self.alarmtempList=[];
    self.policyList=[];
    self.extensionRuleForm = {
        rules:[]
    };

    function initExtensionRule(alarmtempList,policyList){
        return {
            "alarmtemp":alarmtempList[0],
            "policy":policyList[0]
        };
    }
    
    extensionSrv.getAlarmTemps().then(function(result){  //获取告警规则
        if(result&&result.data){
            self.alarmtempList=result.data.filter(item=>item.resourceType=="virtual");
            return self.alarmtempList;
        }
    }).then(function(alarmtempList){ //获取扩展规则
        policySrv.getPolicy().then(function(result){
            if(result&&result.data){
                self.policyList=result.data;
                self.extensionRuleForm.rules.push(initExtensionRule(alarmtempList,self.policyList));
            }
        });
    });

    self.addRule = function(index){
        self.extensionRuleForm.rules.push(initExtensionRule(self.alarmtempList,self.policyList));
    };

    self.delRule = function(index){
        self.extensionRuleForm.rules.splice(index,1);
    };

    //创建弹性扩展
    self.createExtension=function(scaleForm){
        var unFinishedArr=[
            {bind:'100',step:'stepTwoThree'},
            {bind:'010',step:'stepOneThree'},
            {bind:'001',step:'stepOneTwo'},
            {bind:'110',step:'stepThree'},
            {bind:'101',step:'stepTwo'},
            {bind:'011',step:'stepOne'},
            {bind:'000',step:'stepOneTwoThree'},
        ];
        self.unfinished=[];
        if (scaleForm.$valid) {
            if(self.baseMsgForm.$valid&&self.insForm.$valid&&self.balanceForm.$valid){
                _.each(self.extensionRuleForm.rules,function(item){
                    self.postdata.scalrule.push({
                        "alarmTempId": String(item.alarmtemp.id),
                        "scalPolicyId": item.policy.id
                    });
                });
                extensionSrv.createExtension(self.postdata).then(function(){
                    getExtensions();
                }).finally(function(){
                    self.isDisabled = false;
                });
                $uibModalInstance.close();
            }else{
                let bindString=""+Number(self.baseMsgForm.$valid)+Number(self.insForm.$valid)+Number(self.balanceForm.$valid);
                unFinishedArr.forEach(function(item){
                    if(item.bind==bindString){
                       self.unfinished[item.step]=true;
                       $timeout(function(){
                           self.unfinished[item.step]=false;
                       },2500);
                    }
                });
            }
        }else{
            self.interactedScaleValid=true;
        } 
    };
    //接收到消息，刷新页面
    $rootScope.$on("extensionSocket",function(e,data){
        getExtensions();
    });
});
extensionModule.controller("extensionInsInfoCtrl",function($scope,$location, $rootScope,extensionSrv,instancesSrv){
    var self=$scope;
    var value = $location.path().split("/")[3];
    /*$scope.insConfigData = { status: "empty", vcpus: 0, ram: 0 };
    instancesSrv.getServerDetail(value).then(function(result) {
        if (result && result.data) {
            result.data.status = result.data.status.toLowerCase();
            result.data.diskNewName = "";
            for (var i = 0; i < result.data.diskName.length; i++) {
                if (i != result.data.diskName.length - 1) {
                    result.data.diskNewName = result.data.diskNewName + result.data.diskName[i] + ",";
                } else {
                    result.data.diskNewName = result.data.diskNewName + result.data.diskName[i];
                }
            }

            if (result.data.status != "error") {
                instancesSrv.getServerLog(value).then(function(result) {
                    if (result) {
                        $scope.logContent = result.data.replace(/\n/g, "<br\/>");
                    }
                });
            }

        }
        $scope.insConfigData = result.data;
        console.log($scope.insConfigData)
    });*/

});
extensionModule.controller("addInstancesCtrl",function($scope, $rootScope,$uibModalInstance,extensionSrv,policySrv,networksSrv,imagesSrv,instancesSrv,getExtensions,makeImageSrv,$translate,$timeout,editData,context){
    var self=$scope;
    self.submitted=false;
    self.timeCorrect=true;
    self.endTimeBiggerStartTime=true; 
    //获取密钥对
    function getKeypairs(){
        extensionSrv.getKeyPairs().then(function(res){
            if(res&&res.data&&angular.isArray(res.data)){
               self.keypairList=self.keypairList.concat(res.data);
            }
        });
    }
    self.init_dateTimepicker=function() {
        if(self.addInsData.timingStart){
            $timeout(function(){
                $(".form_date").datetimepicker({
                    language: "zh-CN",
                    weekStart: 1,
                    todayBtn: 1,
                    autoclose: 1,
                    todayHighlight: 1,
                    //startView: 2,
                    minView: "month",
                    //minuteStep:5,
                    forceParse: 0,
                    format: "yyyy-mm-dd",
                    pickerPosition: "bottom-left",
                    startDate:new Date()
                });
            },300);
        }
    };
    self.addInsData={
        extensionName:editData.name,
        insName:"",
        password:"",
        imageName:"",
        networks:"",
        configureType:"",
        keypaireName:"",
        timingStart:false,
        start:{
           date:"",
           hour:"",
           minute:"",
           second:0
        },
        end:{
           date:"",
           hour:"",
           minute:"",
           second:0
        },
        frequency:{
            day:"",
            week1:true,
            week2:false,
            week3:false,
            week4:false,
            week5:false,
            week6:false,
            week7:false,
        },
    };
    
    self.frequency={
        selected:'times'
    };

    self.selectFrequency=function(type){
        self.frequency.selected=type;
        if(type=='week'){
            self.addInsData.frequency={
                day:"",
                week1:true,
                week2:false,
                week3:false,
                week4:false,
                week5:false,
                week6:false,
                week7:false,
            }; 
        }else if(type=='days'){
            self.addInsData.frequency.day="";
        }
    };

    self.keypairList=[{name:"选择密钥对",value:'select'}];
    self.addInsData.keypaireName=self.keypairList[0];
    getKeypairs();
    self.init_dateTimepicker();
    self.imageList=[];
    self.flavorList=[];
    self.networkList=[];
    extensionSrv.getClusterDetailOfAddIns(editData.id).then(function(res){
        if(res&&res.data&&angular.isObject(res.data)){
           //镜像处理
           if(res.data.image){
              self.imageList.push({name:res.data.image.name,os_type:res.data.image.os_type});
              self.addInsData.imageName=self.imageList[0];
           }
           if(res.data.flavor){
              let flavor=res.data.flavor;
              let flavorName=flavor.name+ " ( CPU:"+flavor.vcpus   + $translate.instant("aws.instances.conf.memtip") + ":"+(flavor.ram/1024).toFixed(2)+" GB )" ;
              self.flavorList.push({name:flavorName});
              self.addInsData.configureType=self.flavorList[0];
           }
           if(res.data.network){
              self.networkList.push({name:res.data.network.name});
              self.addInsData.networks=self.networkList[0];
           }
        }
    });

    self.interacted=function(filed){
        return filed.$dirty||self.submitted;
    };

    self.addInsConfirm=function(addInstancesForm){
        self.timeCorrect=true;
        if(addInstancesForm.$valid){
            //如果勾选了定时任务
            var timeString= self.addInsData.start.date.split("-").join("/")+" "+self.addInsData.start.hour+":"+self.addInsData.start.minute+":"+self.addInsData.start.second;
            var miniSecons=new Date(timeString).getTime();
            var endTimestamp= self.addInsData.end.date.split("-").join("/")+" "+self.addInsData.end.hour+":"+self.addInsData.end.minute+":"+self.addInsData.end.second;
            var endMiniSeconds=new Date(endTimestamp).getTime();
            var params={
                 serverName:self.addInsData.insName,
                 serverPassword:self.addInsData.password,
                 numberOfServer:1,//页面无数量输入，固定为1
            };
            if(self.addInsData.keypaireName.value!='select'){
                 params.keyPairName=self.addInsData.keypaireName.name;
            }
            if(self.addInsData.timingStart){
                 //定时任务的时间必须满足大于点击确定时间的前一分钟
                 var nowTime=new Date().getTime();
                 var oneMinuteAfterNowTime=new Date().getTime()+1*60*1000;
                 if(miniSecons<oneMinuteAfterNowTime||endMiniSeconds<miniSecons){
                    if(miniSecons<oneMinuteAfterNowTime){
                        self.timeCorrect=false;
                        $timeout(function(){
                           self.timeCorrect=true; 
                        },3000); 
                    }
                    if(endMiniSeconds<miniSecons){
                        self.endTimeBiggerStartTime=false;
                        $timeout(function(){
                           self.endTimeBiggerStartTime=true; 
                        },3000); 
                    }
                 }else{
                    var cron="";
                    params.startTimestamp=miniSecons;
                    params.endTimestamp=endMiniSeconds;
                    //con表达式的组装
                    let startYear=self.addInsData.start.date.split("-")[0];
                    let startmonth=self.addInsData.start.date.split("-")[1];
                    let startDay=self.addInsData.start.date.split("-")[2];
                    let startHour=self.addInsData.start.hour;
                    let startMinute=self.addInsData.start.minute;
                    let startSecon=self.addInsData.start.second;
                    if(self.frequency.selected=='times'){
                       cron+=startSecon+" "+startMinute+" "+startHour+" "+startDay+" "+startmonth+" "+"?"+" "+startYear;
                    }else if(self.frequency.selected=='days'){
                       //"0 0 0 /days * ? *"
                       //秒 分 时     后面固定不动
                       cron+=startSecon+" "+startMinute+" "+startHour+" "+"/"+self.addInsData.frequency.day+" * "+"?"+" *";
                    }else if(self.frequency.selected=='week'){
                       let weekArr=[];
                       if(self.addInsData.frequency.week1){
                          weekArr.push('MON');
                       }
                       if(self.addInsData.frequency.week2){
                          weekArr.push('TUE');
                       }
                       if(self.addInsData.frequency.week3){
                          weekArr.push('WED');
                       }
                       if(self.addInsData.frequency.week4){
                          weekArr.push('THU');
                       }
                       if(self.addInsData.frequency.week5){
                          weekArr.push('FRI');
                       }
                       if(self.addInsData.frequency.week6){
                          weekArr.push('SAT');
                       }
                       if(self.addInsData.frequency.week7){
                          weekArr.push('SUN');
                       }
                       let weekString=weekArr.join(",");
                       //0 0 0 ? * 1,3
                       //秒 分 时 ？和*固定 1,3为选择的星期
                       cron+=startSecon+" "+startMinute+" "+startHour+" ? * "+weekString;
                    }
                    params.cron=cron;
                    context.addInstancesModal.close();
                    extensionSrv.addInstansesTiming(editData.id,params).then(function(){
                          getExtensions();
                    });
                 }
                 
            }else{
                 context.addInstancesModal.close();
                 extensionSrv.addInstanses(editData.id,params).then(function(){
                      getExtensions();
                 });
            }
        }else{
            self.submitted=true;
        }
    };
});
