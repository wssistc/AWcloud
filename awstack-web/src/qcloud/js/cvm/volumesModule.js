import "./volumesSrv";
import "./snapshotSrv";
var volumesModule = angular.module("volumesModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap","snapshotsrv","checkedsrv", "volumessrv", "ui.select", "ngMessages", "rzModule"])
volumesModule.controller("VolumesCtrl", function($scope, $rootScope, RegionID, NgTableParams,  $location,$timeout, $uibModal,checkedSrv,volumesDataSrv, $translate) {
    var self = $scope ;
    self.regionid=RegionID.Region();
    sessionStorage.setItem('opened','true');
    self.changeRegion=function(regionid){
        self.regionid=regionid;
        //RegionID.Region()=regionid;
        sessionStorage.setItem("RegionSession",regionid);
    }
    self.canMount=false;
    self.canUnMount=false;
    self.canCSnap=false;
    self.canExtend=false;
    self.canEdit=false;
    self.canAllocate=false;
    self.canRenewal=false;
    self.canDownload=false;
    function canMountFunc(obj) {
        self.canMount = false;
        if(obj.storageStatus=="detached"&&obj.attached==0&&obj.portable==1){
            self.canMount =true;
        }
    }
    function canUnmountFunc(obj){
        self.canUnMount=false;
        if(obj.storageStatus=="attached"&&obj.attached==1&&obj.portable==1){
            self.canUnMount=true;
        }
    }
    function canExtendFunc(obj){
        self.canExtend=false;
        self.canAllocate=false;
        if(obj.attached==0&&obj.portable==1&&(obj.deadlineTimeCopy!="已回收")){
            self.canExtend=true;
            self.canAllocate=true;
        }
    }
    function commonFunc(obj){
        self.canAllocate=false;
        self.canRenewal=false;
        if(obj.portable==1){
            self.canAllocate=true;
            self.canRenewal=true;
        }
    }
    function canCSnapFunc(obj){
        self.canCSnap=false;
        if(obj.snapshotAbility==1){
            self.canCSnap=true;
        }
    }
    function successFunc(data) {
        var tableId = "storageId";
        self.volumeData=data;
        self.storageListTable = new NgTableParams({ count: 10 ,sorting: {createTime: "desc"}}, { counts: [], dataset: self.volumeData });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.storageListTable.filter({ searchTerm: term });
        };
        checkedSrv.checkDo(self, data, tableId,"storageListTable");
        self.$watch(function() {
            return self.checkedItems;
        }, function(values) {
            if(values.length==1){
                canCSnapFunc(values[0]);
                commonFunc(values[0]);
                canExtendFunc(values[0]);
                self.canEdit=true;
                self.canDownload=true;
            }else{
                self.canExtend=false;
                self.canCSnap=false;
                self.canEdit=false;
                self.canAllocate=false;
                self.canRenewal=false;
                self.canDownload=false;
            }
            //判断挂载按钮是否可用
            if(values.length==0){
                self.canMount = false;
                self.canUnMount=false;
            }else if (values.length == 1) {
                canMountFunc(values[0]);
                canUnmountFunc(values[0]);
            } else if (1<values.length &&values.length <11) {
                for (var i = 0; i < values.length; i++) {
                    canMountFunc(values[i]);
                    if (self.canMount == false) {
                        self.canMount = false;
                        break;
                    }
                }
                for (var a = 0; a < values.length; a++) {
                    canUnmountFunc(values[a]);
                    if (self.canUnMount == false) {
                        self.canUnMount = false;
                        break;
                    }
                }
            }
        });
    }
    
    self.pollingList=[];
    function initVolumesTable() {
        self.pollingList=[];
        self.globalSearchTerm = "";
        var data={
            "params":{
                "Region":RegionID.Region(),
                "projectId":0
            }
        }
        var nowDate = new Date();
        var nowDateValue=nowDate.valueOf();
        /*var volumesData=[];*/
        volumesDataSrv.getCbsList(data).then(function(result){
            if(result.code==0){
                result.storageSet.map(item => {
                    var itemData=new Date(item.deadlineTime);
                    var itemData7=new Date(item.deadlineTime);
                    itemData7.setDate(itemData7.getDate()+7);
                    var itemDataValue7=itemData7.valueOf();
                    var itemDataValue=itemData.valueOf();
                    if((nowDateValue>=itemDataValue)&&(nowDateValue<itemDataValue7)&&(itemDataValue!=0)){
                        item.deadlineTimeCopy="待回收";
                    }else if((nowDateValue>=itemDataValue7)&&(itemDataValue!=0)){
                        item.deadlineTimeCopy="已回收";
                    }else{
                        item.deadlineTimeCopy=item.deadlineTime;
                    }
                    if(item.storageStatus=="normal"&&item.attached==1){
                        item.storageStatus="attached";
                    }else if(item.storageStatus=="normal"&&item.attached==0){
                        item.storageStatus="detached";
                    }
                    if(!item.uInstanceId){
                        item.uInstanceId="-";
                    }
                    item.searchTerm =  item.storageId+item.storageName;
                    if(item.storageStatus=="attaching"||item.storageStatus=="detaching"||item.storageStatus=="snapshotCreating"||item.storageStatus=="rollback"||item.storageStatus=="expanding"){
                        self.pollingList.push(item.storageId)
                    }
                });
                self.volumeTableData=result.storageSet;
            }else{
                self.volumeTableData=[];
            }
            successFunc(self.volumeTableData);
        })
    }
    //新建云硬盘时轮询
    function pollingNew(){
        self.storageListTable.reload();
        var data={
            "params":{
                "Region":RegionID.Region(),
                "projectId":0
            }
        }
        volumesDataSrv.getCbsList(data).then(function(result){
            if(result.code==0){
                 _.forEach(result.storageSet,function(item){
                    for(var i=0;i<self.newcbsList.length;i++){
                        if(self.newcbsList[i]==item.storageId){
                            self.newcbsList.splice(i,1);
                            initVolumesTable();
                        }
                    }
                });
            }
        })
    }
    if($rootScope._ids){
        self.newcbsList=$rootScope._ids;
        delete $rootScope._ids
        var timer3;
        self.$watch(function(){
            return self.newcbsList.length
        },function(value){
            if(value==0){
                if(timer3){
                    clearInterval(timer3); 
                    timer3=""
               }
            }else{
                if(timer3){
                    return;
                }else{
                   timer3=window.setInterval(pollingNew, 3000); 
                }
            }
        });
        
    }
    
    //轮询改变状态
    function changeStatus(){
        var data={
            params:{
                Region:RegionID.Region()
            }
        }
        for(var i=0;i<self.pollingList.length;i++){
            data.params['storageIds.'+i]=self.pollingList[i];
        }
        var newData=[];
        var normalList=[];
        volumesDataSrv.getCbsDetail(data).then(function(result){
            if(result.code==0){
                newData=result.storageSet;
                //区分哪些硬盘的状态已经更新完成，哪些还在更新中
                for(var i=0;i<newData.length;i++){
                    if(newData[i].storageStatus=="normal"&&newData[i].attached==1){
                        newData[i].storageStatus="attached";
                    }else if(newData[i].storageStatus=="normal"&&newData[i].attached==0){
                        newData[i].storageStatus="detached";
                    }
                    if(newData[i].storageStatus=="attached"||newData[i].storageStatus=="detached"||newData[i].storageStatus=="toRecycle"){
                        normalList.push(newData[i]);
                        self.pollingList.splice(i,1);
                    }
                }
                //状态更新完成的更新前端页面
                _.forEach(self.volumeData,function(item){
                    _.forEach(normalList,function(obj){
                        if(item.storageId==obj.storageId){
                            item.storageStatus=obj.storageStatus;
                            item.attached=obj.attached;
                            item.deadlineTime=obj.deadlineTime;
                            item.storageSize=obj.storageSize
                            if(obj.uInstanceId){
                                item.uInstanceId=obj.uInstanceId;
                            }else{
                                item.uInstanceId="-";
                            }
                        }
                    })
                })
                //更新table
                self.storageListTable.reload();
            }
        })
    }
    var timer;
    self.$watch(function(){
        return self.pollingList.length
    },function(value){
        if(value==0){
            if(timer){
                clearInterval(timer); 
                timer=""
           }
        }else{
            if(timer){
                return;
            }else{
               timer=window.setInterval(changeStatus, 2000); 
            }
        }
    });
   
    self.$watch(function(){
        return RegionID.Region();
    },function(value){
        sessionStorage.setItem("RegionSession", value);
        initVolumesTable();
    })
    
    $scope.$on("getDetail", function(event, value) {
        $scope.detailData={};
        self.haveSnap=true;
        
        var nowDate = new Date();
        var nowDateValue=nowDate.valueOf();
        function getDetailFunc(){
            var data={
                "params":{
                    "Region":RegionID.Region(),
                    "storageIds.0":value
                }
            }
            self.pollingDetailList=[];
            volumesDataSrv.getCbsDetail(data).then(function(result){
                if(result.code==0){
                    $scope.detailData=result.storageSet[0];
                }
                if($scope.detailData.deadlineTime){
                    var itemData=new Date($scope.detailData.deadlineTime);
                    var itemDataValue=itemData.valueOf();
                    if((itemDataValue<nowDateValue)&&(itemDataValue!=0)){
                        $scope.detailData.deadlineTimeCopy="已回收";
                    }else{
                        $scope.detailData.deadlineTimeCopy=$scope.detailData.deadlineTime;
                    }
                }
                
                if($scope.detailData.storageStatus=="normal"&&$scope.detailData.attached==1){
                    $scope.detailData.storageStatus="attached";
                }else if($scope.detailData.storageStatus=="normal"&&$scope.detailData.attached==0){
                    $scope.detailData.storageStatus="detached";
                }
                if($scope.detailData.attached==1){
                    self.canMountDetail=false;
                }else if($scope.detailData.attached==0){
                    self.canMountDetail=true;
                }
                if($scope.detailData.portable==0){
                    self.isShowAttach=false;
                }else if($scope.detailData.portable==1){
                    self.isShowAttach=true;
                }
                if($scope.detailData.snapshotIds.length==0){
                    self.haveSnap=false;
                }else{
                    self.haveSnap=true;
                }
                if($scope.detailData.storageStatus=="attaching"||$scope.detailData.storageStatus=="detaching"||$scope.detailData.storageStatus=="snapshotCreating"||$scope.detailData.storageStatus=="rollback"||$scope.detailData.storageStatus=="expanding"){
                        self.pollingDetailList.push($scope.detailData.storageId)
                    }
            });
        }
        self.getDetailFunc=getDetailFunc;
        var timer2;
        self.$watch(function(){
            return self.pollingDetailList.length
        },function(value){
            if(value==0){
                if(timer2){
                    clearInterval(timer2); 
                    timer2=""
               }
            }else{
                if(timer2){
                    return;
                }else{
                    if(value){
                        timer2=window.setInterval(getDetailFunc, 2000); 
                    }
                   
                }
            }
        });
        getDetailFunc();
        
    });
    //导出信息
    self.downloadFunc = function () {
        var dataList=[];
        _.map(self.volumeTableData,function(item){
            var volumeList = [];
            volumeList.push(item.storageId);
            volumeList.push(item.storageName);
            volumeList.push($translate.instant("CN.cbs.table.storageStatus."+item.storageStatus));
            volumeList.push(item.storageSize)+"G";
            volumeList.push($translate.instant("CN.cbs.table.zone."+item.zoneId));
            volumeList.push($translate.instant("CN.cbs.table.portable."+item.portable));
            volumeList.push(item.uInstanceId);
            volumeList.push($translate.instant("CN.cbs.table.diskType."+item.diskType));
            volumeList.push($translate.instant("CN.cbs.table.storageType."+item.storageType));
            volumeList.push($translate.instant("CN.cbs.table.payMode."+item.payMode));
            volumeList.push(item.deadlineTimeCopy);
            dataList.push(volumeList);
        })
        
        return dataList;
    };
    self.editName = function(type,editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "editName.html",
            controller: "editCtrl",
            resolve:{
                initVolumesTable:function(){
                    return initVolumesTable;
                },
                editData:function(){
                    return editData
                },
                type:function(){
                    return type
                },
                getDetailFunc:function(){
                    return self.getDetailFunc
                }
            }
        });
    };
    self.createVolume = function() {
        $location.path("/buy/cbs");
    };
    //挂载云硬盘
    self.mountVolume = function(type,editData) {
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "loadingVolumeModel.html",
            controller: "loadingVolumeCtrl",
            resolve: {
                initVolumesTable: function() {
                    return initVolumesTable;
                },
                editData: function() {
                    return editData;
                },
                type:function(){
                    return type
                },
                getDetailFunc:function(){
                    return self.getDetailFunc
                }
            }
        });
    };
    //卸载云硬盘
    self.unmountVolume = function(type,editData) {
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "unmountVolumeModel.html",
            controller: "UNCtrl",
            resolve: {
                initVolumesTable: function() {
                    return initVolumesTable;
                },
                editData: function() {
                    return editData;
                },
                type:function(){
                    return type;
                },
                getDetailFunc:function(){
                    return self.getDetailFunc
                }
            }
        });
    };
    //续费操作
    self.renewal=function(editData){
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "renewal.html",
            controller:"renewalCtrl",
            resolve: {
                initVolumesTable: function() {
                    return initVolumesTable;
                },
                editData: function() {
                    return editData;
                }
            }
        });
    };
    //创建快照
    self.createSnap=function(type,editData){
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "snapshots.html",
            controller:"createSNCtrl",
            resolve: {
                editData:function(){
                    return editData;
                },
                initVolumesTable:function(){
                    return initVolumesTable;
                },
                type:function(){
                    return type
                },
                getDetailFunc:function(){
                    return self.getDetailFunc
                }
            }
        });
    };
    //扩容云硬盘
    self.extendSize=function(type,editData){
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "extendSize.html",
            controller:"extendSizeCtrl",
            resolve: {
                editData:function(){
                    return editData;
                },
                initVolumesTable:function(){
                    return initVolumesTable;
                },
                type:function(){
                    return type
                },
                getDetailFunc:function(){
                    return self.getDetailFunc
                }
            }
        });
    };
    //分配到项目
    self.allocateVolume=function(editData){
        var modalInstance =  $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "allocateVolume.html",
            controller:"allocateVolumeCtrl",
            resolve: {
                editData:function(){
                    return editData;
                },
                initVolumesTable:function(){
                    return initVolumesTable;
                }
            }
        });
    };
});
volumesModule.controller("loadingVolumeCtrl", function($scope,RegionID,getDetailFunc,type, volumesDataSrv,NgTableParams, $uibModalInstance, $translate, initVolumesTable, editData,$timeout) {
    var self = $scope;
    self.canConfirm=false;
    self.selectVolumeList=editData;
    self.postDataMount={
        Region:RegionID.Region(),
        uInstanceId:""
    };
    var storageList=[];
    _.forEach(editData,function(item){
        storageList.push(item.storageId)
    });
    for(var i=0;i<storageList.length;i++){
        self.postDataMount['storageIds.'+i]=storageList[i];
    }
    self.isShowVolume=true;
    self.showVolume=function(){
        self.isShowVolume=!self.isShowVolume;
    };
    //获取可用云主机列表
    
    function initInsTable(obj){
        var data={
            params:{
                Region:RegionID.Region(),
                zoneId:editData[0].zoneId,
                projectId:editData[0].projectId,
                offset:obj.offset,
                limit:obj.limit
            }
        }
        volumesDataSrv.getVms(data).then(function(result){
            if(result.code==0){
                self.totalCount=result.totalCount;
                self.instanceListCopy=result.instanceSet;
                self.instanceList=result.instanceSet;
                self.instanceList.map(item => {
                    var insData={
                        params:{
                            "Region":RegionID.Region(),
                            "uInstanceIds.0":item.unInstanceId
                        }
                    }
                    volumesDataSrv.getVolumesOfins(insData).then(function(result){
                        if(result.code==0){
                            if(result.detail[item.unInstanceId].maxAttachNum){
                                item.volumesMax=result.detail[item.unInstanceId].maxAttachNum;
                            }else{
                                item.volumesMax=10;
                            }
                            if(result.detail[item.unInstanceId].count){
                                item.volumesCount=result.detail[item.unInstanceId].count;
                            }else{
                                item.volumesCount=0;
                            }
                            
                            item.volumesNum=Number(item.volumesMax)-Number(item.volumesCount)
                        }
                    })
                    item.searchTerm =  item.unInstanceId+item.instanceName;
                });
            }else{
                self.instanceList=[];
            }
        })    
    }
    self.pageStep=5;
    self.initInsTable=initInsTable;
    self.searchConcent="";
    initInsTable({
        offset:0,
        limit:5
    });
    self.searchIns= function(searchConcent) {
        self.instanceList=self.instanceListCopy;
        self.instanceList=self.instanceList.filter(item=>item.searchTerm.indexOf(searchConcent)>-1); 
    };
    self.selectVm=function(vmid){
        self.postDataMount.uInstanceId=vmid;
        self.canConfirm=true;
    };
    self.volumeConfirm = function() {
        $uibModalInstance.dismiss("cancel");
        var data={
            params:self.postDataMount
        }
        volumesDataSrv.mountVolume(data).then(function(result){
            if(result.code==0){
                if(type=='edit'){
                    $timeout(initVolumesTable,1000);
                }else if(type=='detail'){
                    $timeout(getDetailFunc,1000);
                }
                
            }
        });
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
    };
});
volumesModule.controller("UNCtrl",function($scope,volumesDataSrv,RegionID,editData,type,getDetailFunc,initVolumesTable, $uibModalInstance,$timeout){
    var self=$scope;
    self.showAlert=false
    if(editData.length==1){
        self.showAlert=true;
    }else{
        self.showAlert=false;
    }
    self.selectVolumeList=editData;
    //卸载云硬盘
    self.isShowVolum=true;
    self.showVolum=function(){
        self.isShowVolum=!self.isShowVolum;
    };
    self.postDataUnmount={
        Region:RegionID.Region()
    };
    var storageList=[];
    _.forEach(editData,function(item){
        storageList.push(item.storageId)
    });
    for(var i=0;i<storageList.length;i++){
        self.postDataUnmount['storageIds.'+i]=storageList[i];
    }
    self.confirmUnmount=function(){
        $uibModalInstance.dismiss("cancel");
        var data={
            params:self.postDataUnmount
        }
        volumesDataSrv.unmountVolume(data).then(function(result){
            if(result.code==0){
                if(type=='edit'){
                    $timeout(initVolumesTable,1000);
                }else if(type=='detail'){
                    $timeout(getDetailFunc,1000);
                }
            }
            
        })
    };
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
    };
});
volumesModule.controller("renewalCtrl",function($scope,volumesDataSrv,RegionID,editData,initVolumesTable, $uibModalInstance,$timeout){
    var self=$scope;
    //购买时长
    self.postDataPeriod={
        Region:RegionID.Region(),
        storageId:editData.storageId,
        period:1
    };
    self.periodList=[{
        text: "1个月",
        value: 1
    },{
        text: "2个月",
        value: 2
    },{
        text: "3个月",
        value: 3
    },{
        text: "半年",
        value: 6
    },{
        text: "1年",
        value: 12
    },{
        text: "2年",
        value: 24
    },{
        text: "3年",
        value: 36
    }];
    self.changePeriod=function(period){
        self.postDataPeriod.period=period.value;
    };
    /*var data={
        params:self.postDataPeriod
    }*/
    function getRenewalPriceFunc(data){
        volumesDataSrv.getNewPrice(data).then(function(result){
            if(result.code==0){
                self.price=result.price;
            }
        })
    }
    self.$watch(function(){
        return self.postDataPeriod.period
    },function(value){
        var data={
            params:{
                Region:RegionID.Region(),
                inquiryType:"renew",
                period:Number(value),
                storageId:editData.storageId
            }
        }
        getRenewalPriceFunc(data);
        var deadline= new Date(editData.deadlineTime);
        deadline.setMonth(deadline.getMonth()+value);
        var dataYear=deadline.getFullYear();
        var dataMonth=deadline.getMonth()+1;
        var dataDay=deadline.getDate();
        self.deadlineTime=dataYear+"-"+dataMonth+"-"+dataDay;
    })
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable(self.postDataPeriod.period);
    };
    self.confirmPeriod=function(){
        $uibModalInstance.dismiss("cancel");
        var data={
            params:self.postDataPeriod
        }
        volumesDataSrv.renewalVolume(data).then(function(result){
            if(result.code==0){
                $timeout(initVolumesTable,1000);
            }
        })
    };
    
});
volumesModule.controller("createSNCtrl",function($scope,volumesDataSrv,type,getDetailFunc,RegionID,editData,initVolumesTable, $uibModalInstance){
    var self=$scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    //创建快照部分
    self.selectVolume=editData;
    self.costMoney=3;
    self.createSnapData={
        Region:RegionID.Region(),
        storageId:editData.storageId,
        snapshotName:""
    };
    self.confirmCreateSnap=function(){
        if(self.createSnapForm.$valid){
            $uibModalInstance.dismiss("cancel");
            var data={
                params:self.createSnapData
            }
            volumesDataSrv.createSnapshot(data).then(function(result){
                if(result.code==0){
                    if(type=='edit'){
                        initVolumesTable();
                    }else if(type=="detail"){
                        getDetailFunc();
                    }
                    
                }
            });
        }else{
            self.submitted = true;
        }  
    };
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
    };
});
volumesModule.controller("extendSizeCtrl",function($scope,volumesDataSrv,getDetailFunc,type,RegionID,editData,initVolumesTable, $uibModalInstance,$timeout){
    var self=$scope;
    /*var timer;*/
    if(editData.storageType=="cloudBasic"){
        if(editData.zoneId==200001||editData.zoneId==100002){
            self.slider = {
              value: Number(editData.storageSize+10),
              options: {
                floor: Number(editData.storageSize+10),
                ceil: 4000,
                step:10,
                minimumValue:Number(editData.storageSize+10),
                maximumValue:4000,
                ticksArray: [1000, 2000, 3000, 4000]
              }
            };
        }else{
            self.slider = {
              value: Number(editData.storageSize+10),
              options: {
                floor: Number(editData.storageSize+10),
                ceil: 16000,
                step:10,
                minimumValue:Number(editData.storageSize+10),
                maximumValue:16000,
                ticksArray: [4000, 8000, 12000, 16000]
              }
            };
        }
    }else if(editData.storageType=="cloudSSD"){
        self.slider = {
            value: Number(editData.storageSize+10),
            options: {
                floor: Number(editData.storageSize+10),
                ceil: 4000,
                step:10,
                minimumValue:Number(editData.storageSize+10),
                maximumValue:4000,
                ticksArray: [1000, 2000, 3000, 4000]
            }
        };
    }
    
    self.selectVolume=editData;
    self.price=0;
    
    self.showValue=Number(editData.storageSize+10);
    self.validataValue=function(){
        if(self.showValue){
           if((self.showValue%10)!=0){
                self.showValue=(parseInt(self.showValue/10)+1)*10
            } 
        }else{
            self.showValue=Number(editData.storageSize+10);
        }
        if(self.showValue<Number(editData.storageSize+10)){
            self.showValue=Number(editData.storageSize+10);
        }else if(self.showValue>self.slider.options.ceil){
            self.showValue=self.slider.options.ceil;
        }
        
        self.slider.value=self.showValue; 
        self.pricesize();      
    }
    /*self.extendSizeData={
        Region:RegionID.Region(),
        storageId:editData.storageId,
        storageSize:self.slider.value
    };*/
    
    function getExtendPriceFunc(data){
        volumesDataSrv.getNewPrice(data).then(function(result){
            if(result.code==0){
                self.price=result.price;
            }
        })
    }
    self.pricesize=function(){
        self.$broadcast('rzSliderForceRender');
        self.showValue=self.slider.value;
        var data={
            params:{
                Region:RegionID.Region(),
                inquiryType:"resize",
                storageSize:self.slider.value,
                storageId:editData.storageId
            }
        }
        getExtendPriceFunc(data);
    }
    /*self.$watch(function(){
        return self.slider.value
    },function(value){
        $timeout.cancel(timer);
        timer = $timeout(function(){
            var data={
                params:{
                    Region:RegionID.Region(),
                    inquiryType:"resize",
                    storageSize:self.slider.value,
                    storageId:editData.storageId
                }
            }
            volumesDataSrv.getNewPrice(data).then(function(result){
                if(result.code==0){
                    self.price=result.price;
                }
            })
            self.$broadcast('rzSliderForceRender');
        },600)
    })*/
    //self.pricesize();
    self.confirmExtend=function(){
        $uibModalInstance.dismiss("cancel");
        var data={
            params:{
                Region:RegionID.Region(),
                storageId:editData.storageId,
                storageSize:self.slider.value
            }
        }
        volumesDataSrv.extendVolume(data).then(function(result){
            if(result.code==0){
                if(type=='edit'){
                    $timeout(initVolumesTable,1000);
                }else if(type=='detail'){
                    $timeout(getDetailFunc,1000);
                }
                
            }
        })
    };
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
    };
});
volumesModule.controller("editCtrl",function($scope,volumesDataSrv,editData,RegionID,initVolumesTable,getDetailFunc,type, $uibModalInstance){
    var self=$scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.postEditData={
        Region:RegionID.Region(),
        storageName:"",
        storageId:editData.storageId
    }
    self.volumeNewName="";
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
    };
    self.confirmEdit=function(){
        if(self.editNameForm.$valid){
            $uibModalInstance.dismiss("cancel");
            var data={
                params:self.postEditData
            }
            volumesDataSrv.editVolumeName(data).then(function(result){
                if(result.code==0){
                    if(type=="edit"){
                        initVolumesTable();
                    }else if(type=="detail"){
                        /*var data={
                            "params":{
                                "Region":RegionID.Region(),
                                "storageIds.0":editData.storageId
                            }
                        }*/
                        getDetailFunc();
                    }
                    
                }
            });
        }else{
            self.submitted = true;
        }
    };
});
volumesModule.controller("allocateVolumeCtrl",function($scope,volumesDataSrv,editData,RegionID,initVolumesTable, $uibModalInstance){
    var self=$scope;
    self.selectVolume=editData;
    self.isShowVolume=true;
    self.showVolume=function(){
        self.isShowVolume=!self.isShowVolume;
    };
    self.postAlloData={
        Region:RegionID.Region(),
        storageId:editData.storageId
    }
    //获取项目
    var data={
        params:{
            Region:RegionID.Region()
        }
    }
    self.projectList=[];
    volumesDataSrv.getProject(data).then(function(result){
        if(result.code==0){
            result.data.push({
                projectName:"默认项目",
                projectId:0
            })
            self.projectList=result.data;
            self.projectListCopy=result.data;
        }
        
    });
    self.selectPro=function(projectid){
        if(projectid!="default"){
            self.postAlloData.projectId=Number(projectid);
        }
    };
    //搜索功能
    self.searchConcent="";
    self.searchPro= function(searchConcent) {
        self.projectList=self.projectListCopy;
        self.projectList=self.projectList.filter(item=>item.searchTerm.indexOf(searchConcent)>-1);
    }
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
    };
    self.confirmAllo=function(){
        $uibModalInstance.dismiss("cancel");
        initVolumesTable();
        var data={
            params:self.postAlloData
        }
        volumesDataSrv.allocateVolume(data).then(function(result){
            if(result.code==0){
                initVolumesTable();
            }
        })
    };
});


