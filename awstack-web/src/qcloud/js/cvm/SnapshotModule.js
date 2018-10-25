import "./volumesSrv";
import "./snapshotSrv";
var snapshotModule= angular.module("snapshotModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap","checkedsrv", "volumessrv","snapshotsrv", "ui.select", "ngMessages", "rzModule"])
snapshotModule.controller("SnapshotCtrl", ["$scope","$rootScope","NgTableParams","$translate","$location","$uibModal","checkedSrv","volumesDataSrv","snapshotsrv","RegionID","instanceSrv",
function($scope, $rootScope, NgTableParams,$translate, $location, $uibModal, checkedSrv,volumesDataSrv,snapshotsrv,RegionID,instanceSrv) {
    var self = $scope ;
    var timer;
    self.pollingList=[];
    if(RegionID.Region()=="hk"||RegionID.Region()=="sg"||RegionID.Region()=="ca"){
        //RegionID.Region="sh";
        sessionStorage.setItem("RegionSession",'sh');
    }
    self.regionid=RegionID.Region();
    sessionStorage.setItem('opened','true');
    self.changeRegion=function(regionid){
        self.regionid=regionid;
        //RegionID.Region()=regionid;
        sessionStorage.setItem("RegionSession",regionid);
    }
    self.canCreate=false;
    self.canRename=false;
    self.canRollback=false;
    self.$watch(function() {
        return self.checkedItems;
    }, function(values) {
        if(values){
            if(values.length==1){
                self.canCreate=true;
                self.canRename=true;
                canRBFunc(values[0]);
            }else{
                self.canCreate=false;
                self.canRename=false;
                self.canRollback=false;
            }
            //判断删除按钮是否可用
            if (values.length == 1) {
                canDelFunc(values[0]);
            } else if (1<values.length&&values.length <11) {
                for (var i = 0; i < values.length; i++) {
                    canDelFunc(values[i]);
                    if (self.canDel == false) {
                        self.canDel = false;
                        break;
                    }
                }
            } else {
                self.canDel = false;
            }
        }
    });
    function canDelFunc(obj){
        self.canDel=false;
        if(obj.snapshotStatus=="normal"){
            self.canDel=true;
        }
    }
    function canRBFunc(obj){
        console.log(obj)
        self.canRollback=false;
        if(obj.snapshotStatus!="normal"){
            self.RollbackTip = "请选择正常状态的快照";
        }
        if(obj.snapshotStatus=="normal"&&obj.diskAttached===0){
            self.canRollback=true;
        }
        if(obj.snapshotStatus=="normal"&&obj.diskAttached===1){
            self.RollbackTip = "获取原云硬盘所绑定实例信息中..."
            getSnapVolInstaceStatus(obj)
        }
    }

    function getSnapVolInstaceStatus(obj){
        var data = {
            params:{
                "Region":RegionID.Region(),
                "storageIds.0":obj.storageId
            }
        }
        volumesDataSrv.getCbsDetail(data).then(function(res){
            if(res.code == 0 && res.storageSet &&  res.storageSet[0]){
                var cbsInsId = res.storageSet[0].uInstanceId;
                instanceSrv.getVmsInfo(data.params.Region,cbsInsId).then(function(result){
                    if(result && result.code==0 && result.instanceSet && result.instanceSet[0]){
                        if(result.instanceSet[0].status == 4 && result.instanceSet[0].diskInfo.expandStorage){
                            result.instanceSet[0].diskInfo.expandStorage.map(item => {
                                if(item.storageId == obj.storageId){
                                    self.canRollback=true;
                                }
                            })
                        }
                    }
                    if(!self.canRollback){
                        self.RollbackTip = "关联硬盘挂载的子机处于未关机状态，无法执行回滚操作";
                    }
                })
            }
        })
    }
    function successFunc(data) {
        var tableId = "snapshotId";
        self.snapshotData=data;
        self.snapshotsTable = new NgTableParams({ count: 10 ,sorting: {createTime: "desc"}}, { counts: [], dataset: self.snapshotData });
        checkedSrv.checkDo(self, data, tableId,"snapshotsTable");
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.snapshotsTable.filter({ searchTerm: term });
        };
    }
    function initSnapshotsTable() {
        self.pollingList=[];
        self.globalSearchTerm = "";
        var data={
            params:{
                "Region":self.regionid,
                "projectId":0
            }
        }
        snapshotsrv.getSnapshot(data).then(function(result){
            if(result.code==0){
                result.snapshotSet.map(item => {
                    item.searchTerm =  item.snapshotId+item.snapshotName;
                    if(!item.snapshotName){
                        item.snapshotName="未命名";
                    }
                    if(item.snapshotStatus=="creating"||item.snapshotStatus=="rollbacking"){
                        self.pollingList.push(item.snapshotId)
                    }
                });
                self.snapshotTableData=result.snapshotSet;
            }else{
                self.snapshotTableData=[];
            }
            successFunc(self.snapshotTableData);
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
            data.params['snapshotIds.'+i]=self.pollingList[i];
        }
        var newData=[];
        var normalList=[];
        snapshotsrv.getSnapshot(data).then(function(result){
            if(result.code==0){
                newData=result.snapshotSet;
                //区分哪些硬盘的状态已经更新完成，哪些还在更新中
                for(var i=0;i<newData.length;i++){
                    if(newData[i].snapshotStatus=="normal"){
                        normalList.push(newData[i]);
                        self.pollingList.splice(i,1);
                    }
                }
                //状态更新完成的更新前端页面
                _.forEach(self.snapshotData,function(item){
                    _.forEach(normalList,function(obj){
                        if(item.snapshotId==obj.snapshotId){
                            item.snapshotStatus=obj.snapshotStatus;
                        }
                    })
                })
                //更新table
                console.log(self.snapshotData)
                self.snapshotsTable.reload();
            }
        })
    }
    self.$watch(function(){
        return self.pollingList.length
    },function(value){
        if(value==0){
            if(timer){
               clearInterval(timer); 
               timer="";
           }
        }else{
            timer=window.setInterval(changeStatus, 3000);
            
        }
    });
    self.$watch(function(){
        return self.regionid;
    },function(value){
        if(value){
            initSnapshotsTable();
            sessionStorage.setItem("RegionSession", value);
        }
    })
    $scope.$on("getDetail", function(event, value) {
        $scope.detailData={};
        var data={
            "params":{
                "Region":RegionID.Region(),
                "snapshotIds.0":value
            }
        }
        snapshotsrv.getSnapshot(data).then(function(result){
            if(result.code==0){
                $scope.detailData=result.snapshotSet[0]
            }
        })
    });
    //下载功能
    self.downloadFunc = function () {
        var snapshotsList = [];
        // 过滤出需要在CSV文件中显示的字段。
        _.map(self.snapshotTableData, function (item) {
            snapshotsList.push([
                item.snapshotId,
                item.snapshotName,
                $translate.instant("CN.cbs.snap.snapshotStatus."+item.snapshotStatus),
                item.storageSize+"G",
                $translate.instant("CN.cbs.snap.diskType."+item.diskType),
                item.storageId,
                item.createTime,
                "永久保留"
            ]);
        });
        return snapshotsList;
    };
    self.createVolume = function(editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "createVolume.html",
            controller: "createVolumeCtrl",
            resolve: {
                initSnapshotsTable: function() {
                    return initSnapshotsTable;
                },
                editData:function(){
                    return editData;
                }
            }
        });
    };
    //修改name
    self.rename = function(editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "editNameSnap.html",
            controller: "editSnapCtrl",
            resolve:{
                initSnapshotsTable:function(){
                    return initSnapshotsTable;
                },
                editData:function(){
                    return editData
                }
            }
        });
    };
    //删除快照
    self.delSnapshot=function(checkedItems){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "delSnap.html",
            controller: "delSnapCtrl",
            resolve:{
                initSnapshotsTable:function(){
                    return initSnapshotsTable;
                },
                checkedItems:function(){
                    return checkedItems;
                }
            }
        });
    }
    self.rollback=function(editData){
        if(!self.canRollback) return;
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "rollback.html",
            controller: "rollbackCtrl",
            resolve:{
                initSnapshotsTable:function(){
                    return initSnapshotsTable;
                },
                editData:function(){
                    return editData;
                }
            }
        });
    }
}]);
snapshotModule.controller("createVolumeCtrl", ["$rootScope","$scope","$uibModalInstance","$translate","RegionID","volumesDataSrv","snapshotsrv","initSnapshotsTable","editData","$timeout",
                                    function($rootScope,$scope,$uibModalInstance,$translate,RegionID, volumesDataSrv,snapshotsrv, initSnapshotsTable,editData,$timeout) {
    var self = $scope;
    /**/
    var timer;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.selectSnap=editData;
    self.postData={};
    self.postData.storageName="";
    self.postData.zoneId=editData.zoneId;
    self.postData.goodsNum=1;
    self.postData.period=1;
    self.postData.payMode="prePay";
    self.postData.price;
    self.postData.snapshotId=editData.snapshotId;

    //云硬盘数量
    self.canReduce=function(){
        if(self.postData.goodsNum>1){
            return true;
        }else{
            return false;
        }
    }
    self.canAdd=function(){
        if(self.postData.goodsNum>9){
            return false;
        }else{
            return true;
        }
    }
    self.reducenum=function(){
        self.postData.goodsNum--;
    }
    self.addnum=function(){
        self.postData.goodsNum++;
    }

    //获取地域和可用区
    self.regionList=[
        {
            text: "广州",
            value: "gz"
        },
        {
            text: "上海",
            value: "sh"
        },
        {
            text: "北京",
            value: "bj"
        }
    ];
    if(editData.zoneId==800001){
        self.postData.Region=self.regionList[2].value;
    }else if(editData.zoneId==200001){
        self.postData.Region=self.regionList[1].value;
    }else if(editData.zoneId==100001||editData.zoneId==100002||editData.zoneId==100003){
        self.postData.Region=self.regionList[0].value;
    }else if(editData.zoneId==300001){
        self.postData.Region=self.regionList[3].value;
    }else if(editData.zoneId==400001){
        self.postData.Region=self.regionList[4].value;
    }
    //初始化插件
    if(editData.zoneId==200001||editData.zoneId==100002){
        self.slider = {
          value: editData.storageSize,
          options: {
            floor: editData.storageSize,
            ceil: 4000,
            step:10,
            minimumValue:editData.storageSize,
            maximumValue:4000,
            ticksArray: [1000, 2000, 3000, 4000]
          }
        };
    }else{
        self.slider = {
          value: editData.storageSize,
          options: {
            floor: editData.storageSize,
            ceil: 16000,
            step:10,
            minimumValue:editData.storageSize,
            maximumValue:16000,
            ticksArray: [4000, 8000, 12000, 16000]
          }
        };
    }
    function getZone(){
        var data={
            "params":{
                "Region":self.postData.Region
            }
        }
        volumesDataSrv.getZone(data).then(function(result){
            if(result.code==0){
                if(data.params.Region=="gz"){
                    for(var i=0;i<result.zoneSet.length;i++){
                        if(result.zoneSet[i].zoneId=="100001"){
                            result.zoneSet.splice(i,1);
                        }
                    }
                }
                if(data.params.Region=="bj"){
                    for(var i=0;i<result.zoneSet.length;i++){
                        if(result.zoneSet[i].zoneId=="800002"){
                            result.zoneSet.splice(i,1);
                        }
                    }
                }
                self.zoneList=result.zoneSet;
               // self.postData.zoneId=self.zoneList[0].zoneId;
            }else{
                self.zoneList=[];
            }
        }) 
    }
    
    getZone();
    
    //获取项目
    /*function getProFunc(data){
        self.projectList=[];
        self.project={};
        volumesDataSrv.getProject(data).then(function(result){
            if(result.code==0){
                self.projectList=result.data;
            }
            if(self.projectList.length>0){
                self.project=self.projectList[0];
                self.postData.projectId=self.project.projectId;
            }
        });
    }
    getProFunc(regionData)
    self.changePro=function(project){
        self.postData.projectId=project.projectId;
    };*/
    
    function changeCloudType(){
        if(self.postData.storageType=="cloudSSD"){
            self.slider = {
              value: 250,
              options: {
                floor: 250,
                ceil: 4000,
                step:10,
                minimumValue:250,
                maximumValue:4000,
                ticksArray: [1000, 2000, 3000, 4000]
              }
            };
            self.showValue=250;
            if(editData.storageSize>250){
                self.slider.value=editData.storageSize;
                self.slider.options.floor=editData.storageSize;
                self.slider.options.minimumValue=editData.storageSize;
                self.showValue=editData.storageSize;
            }
        }else if(self.postData.storageType=="cloudBasic"&&(self.postData.zoneId=="100002"||self.postData.zoneId=="200001")){
            self.slider = {
              value: editData.storageSize,
              options: {
                floor: editData.storageSize,
                ceil: 4000,
                step:10,
                minimumValue:editData.storageSize,
                maximumValue:4000,
                ticksArray: [1000, 2000, 3000, 4000]
              }
            };
            self.showValue=editData.storageSize;

        }else if(self.postData.storageType=="cloudBasic"&&(self.postData.zoneId=="100003"||self.postData.zoneId=="800001")){
            self.slider = {
              value: editData.storageSize,
              options: {
                floor: editData.storageSize,
                ceil: 16000,
                step:10,
                minimumValue:editData.storageSize,
                maximumValue:16000,
                ticksArray: [4000, 8000, 12000, 16000]
              }
            };
            self.showValue=editData.storageSize;
        }
    }
    changeCloudType();
    //硬盘介质类型
    self.choosenStorageType=function(type){
        self.postData.storageType=type.value;
    };
    self.$watch(function(){
        return self.postData.storageType
    },function(value){
        changeCloudType();
    });
    self.changeZone=function(zone){
        self.postData.zoneId=zone.zoneId;
    };
    self.$watch(function(){
        return self.postData.zoneId
    },function(zone){
        //zone改变，云硬盘类型改变
        //只有普通云硬盘
        if(zone=="100002"||zone=="200001"){
            self.storageTypeList=[
            {
                text:"云硬盘",
                value:"cloudBasic"
            }]
        }else if(zone=="100003"||zone=="800001"){
            self.storageTypeList=[
            {
                text:"云硬盘",
                value:"cloudBasic"
            },{
                text:"SSD云硬盘",
                value:"cloudSSD"
            }]
        }
        self.postData.storageType=self.storageTypeList[0].value;
        changeCloudType();
    });
    //购买时长
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
        self.postData.period=period.value;
    }
    //计费模式
    self.payModeList=[{
        text: "包年包月",
        value: "prePay"
    }]
    self.changePayMode=function(paymode){
        self.postData.payMode=paymode.value;
    }

    /*self.slider = {
      value: editData.storageSize,
      options: {
        floor: editData.storageSize,
        ceil: 4000,
        step:10,
        ticksArray: [1000, 2000, 3000, 4000]
      }
    };*/
    self.showValue=editData.storageSize;
    self.validataValue=function(){
        if(self.showValue){
           if((self.showValue%10)!=0){
                self.showValue=(parseInt(self.showValue/10)+1)*10
            }
        }else{
            self.showValue=editData.storageSize;
        }
        if(self.showValue<self.slider.options.floor){
            self.showValue=self.slider.options.floor;
        }else if(self.showValue>self.slider.options.ceil){
            self.showValue=self.slider.options.ceil;
        }
        
        self.slider.value=self.showValue; 
        self.pricesize();      
    }
    //确定云硬盘的价钱
    var initNewPriceData={
        params:{
            Region:self.postData.Region,
            inquiryType:"create",
            storageType:self.postData.storageType,
            storageSize:self.postData.storageSize,
            goodsNum:self.postData.goodsNum,
            period:self.postData.period,
            payMode:self.postData.payMode
        }
    }
    function getNewPriceFunc(data){
        volumesDataSrv.getNewPrice(data).then(function(result){
            if(result.code==0){
                self.postData.price=result.price;
            }
        })
    }
    self.pricesize=function(){
        self.$broadcast('rzSliderForceRender');
        self.showValue=self.slider.value;
        var data={
            params:{
                Region:self.postData.Region,
                inquiryType:"create",
                storageType:self.postData.storageType,
                storageSize:self.slider.value,
                goodsNum:self.postData.goodsNum,
                period:self.postData.period,
                payMode:self.postData.payMode
            }
        }
        getNewPriceFunc(data);
    }
    /*self.$watch(function(){
        return self.slider.value
    },function(value){
        $timeout.cancel(timer);
        timer = $timeout(function(){
            var data={
                params:{
                    Region:self.postData.Region,
                    inquiryType:"create",
                    storageType:self.postData.storageType,
                    storageSize:self.slider.value,
                    goodsNum:self.postData.goodsNum,
                    period:self.postData.period,
                    payMode:self.postData.payMode
                }
            }
            volumesDataSrv.getNewPrice(data).then(function(result){
                if(result.code==0){
                    self.postData.price=result.price;
                }
            });
            self.$broadcast('rzSliderForceRender');
        },600)
    });*/
    //getNewPriceFunc(initNewPriceData);
    self.$watch(function(){
        return self.postData.Region+","+self.postData.storageType+","+self.postData.goodsNum+","+self.postData.period+","+self.postData.payMode;
    },function(value){
        var watchData=[]
        watchData=value.split(",");
        var data={
            params:{
                Region:watchData[0],
                inquiryType:"create",
                storageType:watchData[1],
                storageSize:self.slider.value,
                goodsNum:Number(watchData[2]),
                period:Number(watchData[3]),
                payMode:watchData[4]
            }
        }
        getNewPriceFunc(data);
    })
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initSnapshotsTable();
    };
    self.volumeConfirm=function(){
        if(self.createVolumeForm.$valid){
            self.postData.storageSize=self.slider.value;
            $uibModalInstance.dismiss("cancel");
            var data={
                "params":self.postData
            }
            volumesDataSrv.createVolume(data).then(function(result){
                if(result.code==0){
                    $rootScope._ids = result.storageIds;
                    initSnapshotsTable();
                }
            });
        }else{
            self.submitted=true;
        }
    }
}]);
snapshotModule.controller("editSnapCtrl",function($scope,snapshotsrv,editData,RegionID,initSnapshotsTable, $uibModalInstance){
    var self=$scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.postData={};
    self.postData.Region=RegionID.Region();
    self.postData.snapshotId=editData.snapshotId;
    self.postData.snapshotName="";
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initSnapshotsTable();
    };
    self.confirmEdit=function(name){
        if(self.editNameForm.$valid){
            $uibModalInstance.dismiss("cancel");
            var data={
                params:self.postData
            }
            snapshotsrv.editSnapName(data).then(function(result){
                if(result.code==0){
                    initSnapshotsTable();
                }
            });
        }else{
            self.submitted=true;
        }
        
    };
});
snapshotModule.controller("delSnapCtrl", ["$scope","$uibModalInstance","RegionID","snapshotsrv","initSnapshotsTable","checkedItems",function($scope,$uibModalInstance,RegionID, snapshotsrv, initSnapshotsTable,checkedItems) {
    var self = $scope;
    self.selectLength=checkedItems.length;
    self.selectSnapList=checkedItems;
    self.isShowVolume=true;
    self.showVolume=function(){
        self.isShowVolume=!self.isShowVolume;
    };
    self.postDelData={
        Region:RegionID.Region(),
    };
    var snapshotList=[];
    _.forEach(checkedItems,function(item){
        snapshotList.push(item.snapshotId)
    });
    for(var i=0;i<snapshotList.length;i++){
       self.postDelData['snapshotIds.'+i]=snapshotList[i];
    }
    
    self.confirmDel=function(){
        $uibModalInstance.dismiss("cancel");
        var data={
            params:self.postDelData
        }
        snapshotsrv.delSnap(data).then(function(result){
            if(result.code==0){
                initSnapshotsTable();
            }
        });
    }; 
    self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
        initSnapshotsTable();
    };   
}]);
snapshotModule.controller("rollbackCtrl",["$scope","$uibModalInstance","RegionID","snapshotsrv","initSnapshotsTable","editData",function($scope,$uibModalInstance,RegionID, snapshotsrv, initSnapshotsTable,editData){
    var self=$scope;
    self.selectSnap=editData;
    self.postRollbackData={};
    self.postRollbackData.Region=RegionID.Region();
    self.postRollbackData.snapshotId=editData.snapshotId;
    self.shutdownModal=function(){
        $uibModalInstance.dismiss("cancel");
    };
    self.cancel = function() {
        //initSnapshotsTable();
        $uibModalInstance.dismiss("cancel");
    };
    self.confirmRollback=function(name){
        $uibModalInstance.dismiss("cancel");
        var data={
            params:self.postRollbackData
        }
        snapshotsrv.rollBack(data).then(function(result){
            if(result.code==0){
                initSnapshotsTable();
            }
        });
    };
}]);