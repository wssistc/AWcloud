import "../cvm/volumesSrv";
import "../cvm/snapshotSrv";
var buyCbsModule = angular.module("buyCbsModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "ui.select","rzModule","snapshotsrv", "volumessrv"]);
buyCbsModule.controller("buyCbsCtrl", [
            "$scope","$rootScope","$location","NgTableParams","RegionID", "volumesDataSrv","snapshotsrv", 
    function($scope,$rootScope,$location,NgTableParams,RegionID, volumesDataSrv,snapshotsrv) {
    var self = $scope;
    /*var timer;*/
    self.creating=false;
    self.slider = {
      value: 10,
      options: {
        floor: 10,
        ceil: 16000,
        step:10,
        minimumValue:10,
        maximumValue:16000,
        ticksArray: [4000, 8000, 12000, 16000]
      }
    };
    self.showAnnotation=false;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.postData={};
    self.postData.storageName="";
    self.postData.zoneId=100003;
    //self.postData.zoneId="";
    self.postData.goodsNum=1;
    self.postData.period=1;
    self.postData.payMode="prePay";
    self.postData.price;
    self.postData.snapshotId="";
    if(RegionID.Region()){
        self.postData.Region=RegionID.Region();
    }else{
        self.postData.Region='sh';
    }
    
    function successFunc(data){
        self.snapshotsTable = new NgTableParams({ count: 10 }, { counts: [], dataset: data });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.snapshotsTable.filter({ searchTerm: term });
        };
    }
    
    
    //云硬盘数量
    self.canReduce=function(){
        if(self.postData.goodsNum>1){
            return true;
        }else{
            return false;
        }
    };
    self.canAdd=function(){
        if(self.postData.goodsNum>9){
            return false;
        }else{
            return true;
        }
    };
    self.reducenum=function(){
        self.postData.goodsNum--;
    };
    self.addnum=function(){
        self.postData.goodsNum++;
    };
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
    function getZone(data){
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
                    for(var a=0;a<result.zoneSet.length;a++){
                        if(result.zoneSet[a].zoneId=="800002"){
                            result.zoneSet.splice(a,1);
                        }
                    }
                }
                self.zoneList=result.zoneSet;
                self.postData.zoneId=self.zoneList[0].zoneId;
            }else{
                self.zoneList=[];
            }
        }); 
    }
    //不同的region不同的zone列表
    self.changeRegion=function(region){
        self.postData.Region=region.value;  
    };
    self.$watch(function(){
        return self.postData.Region
    },function(region){
        sessionStorage.setItem("RegionSession",region);
        var data={
            "params":{
                "Region":region
            }
        }
        getZone(data);
        getSnapshots();
    });
    
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
        }else if(self.postData.storageType=="cloudBasic"&&(self.postData.zoneId=="100002"||self.postData.zoneId=="200001")){
            self.slider = {
              value: 10,
              options: {
                floor: 10,
                ceil: 4000,
                step:10,
                minimumValue:10,
                maximumValue:4000,
                ticksArray: [1000, 2000, 3000, 4000]
              }
            };
            self.showAnnotation=false;
            self.showValue=10;
        }else if(self.postData.storageType=="cloudBasic"&&(self.postData.zoneId=="100003"||self.postData.zoneId=="800001")){
            self.slider = {
              value: 10,
              options: {
                floor: 10,
                ceil: 16000,
                step:10,
                minimumValue:10,
                maximumValue:16000,
                ticksArray: [4000, 8000, 12000, 16000]
              }
            };
        }
    }
    //changeCloudType();
    //不同的zone不同的云硬盘类型列表
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
    //是否使用快照
    function getSnapshots(){
        var data={
            params:{
                Region:self.postData.Region
            }
        }
        snapshotsrv.getSnapshot(data).then(function(result){
            if(result.code==0){
                result.snapshotSet.map(item => {
                    item.searchTerm =  item.snapshotId+item.snapshotName;
                });
                result.snapshotSet=result.snapshotSet.filter(item=>item.diskType=="data");
                self.snapshotListCopy=result.snapshotSet;
                self.snapshotList=result.snapshotSet;
                successFunc(self.snapshotList)
            }
        });
    }
    self.useSnapshot=false;
    self.$watch(function(){
        return self.useSnapshot;
    },function(value){
        if(value){
            getSnapshots();
        }else{
            self.postData.snapshotId="";
            if(self.postData.storageType=="cloudSSD"&&(self.postData.zoneId=="100003"||self.postData.zoneId=="800001")){
                self.slider.value=250;
                self.showValue=250;
            }else{
                self.slider.value=10;
                self.showValue=10;
            }
        }
    });
    self.selectSnap=function(snapshot){
        self.selectSnapshot=snapshot;
        self.postData.snapshotId=snapshot.snapshotId;
        if(self.postData.storageType=="cloudSSD"){
            if(snapshot.storageSize<250){
                self.slider.value=250;
                self.slider.options.floor=250;
                self.showValue=250;
            }else{
                self.slider.value=snapshot.storageSize;
                self.slider.options.floor=snapshot.storageSize;
                self.showValue=snapshot.storageSize;
            }
        }else if(self.postData.storageType=="cloudBasic"){
            self.slider.value=snapshot.storageSize;
            self.slider.options.floor=snapshot.storageSize;
            self.showValue=snapshot.storageSize;
        }
    };
    self.searchConcent="";
    self.searchSnap= function(searchConcent) {
        self.snapshotList=self.snapshotListCopy;
        self.snapshotList=self.snapshotList.filter(item=>item.searchTerm.indexOf(searchConcent)>-1);   
        successFunc(self.snapshotList);
    };
    /*self.choosenDiskType=function(type){
        self.postData.diskType=type.value;
    }*/
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
    
    //硬盘介质类型
    self.choosenStorageType=function(type){
        self.postData.storageType=type.value;
    };
    self.$watch(function(){
        return self.postData.storageType
    },function(){
        if(self.postData.snapshotId){
                self.selectSnap(self.selectSnapshot)
        }else{
            changeCloudType();
        }
        
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
    self.postData.period=self.periodList[0].value;
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

    
    //self.showValue=10;
    self.validataValue=function(){
        if(self.showValue){
           if((self.showValue%10)!=0){
                self.showValue=(parseInt(self.showValue/10)+1)*10
            } 
        }else{
            self.showValue=10;
        }
  
        /*if(self.postData.storageType=="cloudSSD"){
            if(self.showValue<250){
                self.showValue=250
            }else if(self.showValue>4000){
                self.showValue=4000
            }
        }else if(self.postData.storageType=="cloudBasic"){
           if(self.showValue<10){
                self.showValue=10
            }else if(self.showValue>16000){
                self.showValue=16000
            } 
        }*/
        if(self.showValue<self.slider.options.floor){
            self.showValue=self.slider.options.floor;
        }else if(self.showValue>self.slider.options.ceil){
            self.showValue=self.slider.options.ceil;
        }
        self.slider.value=self.showValue; 
        self.pricesize();      
    }
    //self.$watch(self.showValue,function)
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
    
    self.$watch(function(){
        return self.postData.Region+","+self.postData.storageType+","+self.postData.goodsNum+","+self.postData.period+","+self.postData.payMode;
    },function(value){
        var watchData=[]
        watchData=value.split(",");
        var pattern = new RegExp("^[1-9]+[0-9]*$");
        var isnumber=pattern.test(Number(watchData[2]))
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
        if(isnumber){
            getNewPriceFunc(data);
        }
    });
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
            getNewPriceFunc(data);
        },600)
    });*/
    self.pricesize=function(){
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
    /*self.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };*/

    self.volumeConfirm=function(){
        if (self.createVolumeForm.$valid) {
            self.creating=true;
            self.subDisabled=true;
            self.postData.storageSize=self.slider.value;
            var data={
                "params":self.postData
            }
            volumesDataSrv.createVolume(data).then(function(result){
                if(result.code==0){
                    $rootScope._ids = result.storageIds;
                    $location.url("/cvm/cbs");
                    //$location.url("/cvm/cbs?storageIds="+result.storageIds);
                }
            }).finally(function(){
                self.creating=false;
                self.subDisabled=false;
            });
        }else{
            self.submitted = true;
        }
    }
}]);