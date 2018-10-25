import {Region_VmType} from "./instancetype";
import "../cvm/instanceSrv";

var buyInstancesModule = angular.module("buyInstancesModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "ui.select"]);
buyInstancesModule.controller("buyInstancesCtrl", ["$scope","NgTableParams","checkedSrv", "$uibModal","instanceSrv","$location","$routeParams","$timeout","RegionID","$rootScope","$sce","$translate",
    function($scope,NgTableParams,checkedSrv,$uibModal,instanceSrv,$location,$routeParams,$timeout,RegionID,$rootScope,$sce,$translate){
	var self = $scope;
    var timer;
    self.stepOne = true;
    self.stepTwo = false;
    self.stepThree = false;
	self.stepFour = false;
    self.ngFlag=true;
    self.saveValue="";
    self.slider = {
        bandwidthValue:1,
        options:{}
    };
 
    self.options ={};
    self.regionMaxNum = {
        "sh":27,
        "gz":25,
        "bj":21
    };
   

    /*step-one info*/
    self.stepOneItem = {
        paymodes:[
            {name:"包年包月",value:"1"},
            {name:"按量计费",value:"2"}
        ],
        availableRegion:Region_VmType
    }
    self.options.paymodes = self.stepOneItem.paymodes[1];
    self.num =  1;
    self.options.needMonitorAgent =1;
    self.options.needSecurityAgent =1;

    self.stepOneItem.payMode = function(item){
        self.options.paymodes = item;
    }
    /*地域*/
    self.stepOneItem.chooseRegion =function(item){
        self.options.region = item;
        sessionStorage.setItem("RegionSession",item.value);
        self.stepOneItem.zones = item.zones;
        self.stepOneItem.changeZone(item.zones[0])
    };

    /*可用区*/
    self.stepOneItem.changeZone =function(item){
        self.options.zone = item;
        self.stepOneItem.seriesType = item.type;
        self.stepOneItem.chkSeries(item.type[0])
    }
    /*系列*/
    self.stepOneItem.chkSeries = function(item){
        self.options.chkSeriesType = item;
        self.stepOneItem.vmType = item.instancetypes[0].instancetypes;
        self.stepOneItem.chkVmType(item.instancetypes[0].instancetypes[0],item.instancetypes[0].instances);
    }
    /*机型*/
    self.stepOneItem.chkVmType = function(item,instances){
        self.options.chkType = item;
        self.stepOneItem.vmTypeList = instances.filter(ins => ins.deviceType == item.deviceType);
        self.stepOneItem.vmTypeList.map(cate => {
            if(cate.selected == "true"){
                if(cate.hasOwnProperty("category")){
                    self.options.chkTypeItemId = cate.id;
                }/*else if(cate.hasOwnProperty("gpu")){
                    self.options.chkTypeItem = cate.cpu +'/' + cate.mem + '/' + cate.gpu;
                }*/
                
            }
        })
    }
    self.$watch(function(){
        return self.options.chkTypeItemId
    },function(value){
        if(value){
            self.stepOneItem.vmTypeList.map(cate => {
                if(cate.id == value){
                    self.options.chkTypeItem = cate;
                }
            })
            
        }
    })

    if(RegionID.Region()){
        self.stepOneItem.availableRegion.map(item =>{
            if(item.value == RegionID.Region()){
                self.stepOneItem.chooseRegion(item)
            }
        });
    }

    self.stepOneItem.toStepTwoFunc = function(){
            self.stepOne = false;
            self.stepTwo = true;
            self.stepThree = false;
            self.stepFour = false;
            self.$watch("options.os",function(newValue,oldValue){
                if(newValue!=oldValue){
                    self.ngFlag=false;
                }

            });

            /*获取镜像列表
                镜像列表跳转到新建云主机*/
            if($routeParams.imageId && !self.options.imgType){
                self.stepTwoItem.imgType.map(function(item){
                    if (item.value ==  $routeParams.imgageType)  self.options.imgType = item;
                })
            }else{
                self.options.imgType = self.options.imgType || self.stepTwoItem.imgType[0]
            }
            

            self.stepTwoItem.choosenImgSupply(self.options.imgType);
    }
    /*self.stepOneItem.chooseRegion( self.options.region);*/

    /*step-two info*/

    self.stepTwoItem = {
        imgType:[{name:"公有镜像",value:"2"}/*,{name:"自定义镜像",value:"1"}*/,{name:"服务市场",value:"3"}],
        osType:["CentOS"/*,"Ubuntu"*/,"Windows Server"]
    };
    self.stepTwoItem.choosenImgSupply = function(item,type){
        self.imageTypeDisabled = true;
        self.options.imgType = item;
        self.options.osType = self.options.osType || self.stepTwoItem.osType[0];
        /*self.options.os = "";*/
        getImage(self.options.osType,type);       
        if(item.value==2 && self.showInfo==true){
            self.options.os = "" ;
            self.showInfo= false ;   
        }
        /*if(item.value==2){
            self.showInfo= false ;
        }*/
        if(item.value==1){
            self.options.os = "" ;
        }   
        self.$watch("options.os.imageName",function(newValue){
            if(newValue!="" && newValue!=undefined){
             self.saveValue = newValue
            }
        }); 
    };
    self.stepTwoItem.chooseInMark = function(){
        var scope = $rootScope.$new();
        var modalInstance =  $uibModal.open({
           animation: $scope.animationsEnabled,
           templateUrl: "imageMark.html",
           scope:scope
        });
        scope.category =[
            {
                name:"基础环境",
                value:"BASIC_ENVIRONMENT"
            },
            {
                name:"全能环境",
                value:"UNIVERSAL_ENVIRONMENT"
            },{
                name:"管理与监控",
                value:"MANAGER_MONITOR"
            },{
                name:"建站模板",
                value:"WEBSITE_TEMPLATE"
            },{
                name:"安全高可用",
                value:"HIGH_AVAILABILITY_OF_SAFETY"
            },{
                name:"Docker容器",
                value:"DOCKER_CONTAINER"
            },{
                name:"业务管理",
                value:"BUSINESS_MANAGEMENT"
            }
        ];
        /*var postData = {
            "Region":self.options.region.value,
            "imageType": 1 ,
            "imageIds": [] 
        };*/
        scope.DescribeMarketImages = function(value){
            instanceSrv.DescribeMarketImages({
                Region:self.options.region.value,
                categoryId:value
            }).then(function(result){
                if(result && !result.code){
                    scope.marketImage = result.imageSet; 
                    scope.tableParams = new NgTableParams({ count: 4 }, { counts: [], dataset:scope.marketImage});
                }
            })
        };
        scope.iscategoryFunc = function(categ){
            scope.marketImage=[];
            scope.iscategory = categ.value;
            scope.DescribeMarketImages(categ.value);
        };
        scope.iscategoryFunc(scope.category[0]);
        scope.confirmUse = function(img){
            self.options.os = img;
            self.showInfo = true;
            modalInstance.close();
        };       
    };
    
   /* self.stepTwoItem.choosenImgSupply(self.stepTwoItem.imgType[0])*/
    
    /*获取镜像*/
    function getImage(osty,type){
        var postData = {
            "Region":self.options.region.value,
            "status":2,
            "imageType": self.options.imgType.value ,/* 镜像类型，1: 私有镜像 2: 公共镜像 3: 服务市场 4: 共享镜像*/
            "imageIds": [] 
        };
        instanceSrv.getImage(postData).then(function(result){
            if(result && result.imageSet){
                self.imageTypeDisabled = false;
                self.osList = result.imageSet;
                /*从镜像创建云主机默认选择镜像配置*/
                if($routeParams.imageId && !type ){
                   self.osList.map(item =>{
                        if(item.unImgId == $routeParams.imageId){
                            
                            /*选中操作系统过滤某操作系统下的镜像，选中镜像值*/
                            self.stepTwoItem.osType.map(ostype =>{
                                if(item.osName.toLowerCase().indexOf(ostype.toLowerCase())>-1 || (item.osName.toLowerCase().indexOf("xserver")>-1)&&ostype=="Windows Server"){
                                    self.options.osType = ostype;
                                    self.stepTwoItem.osListFilter = getOs(ostype);
                                    self.options.os = item;
                                }
                            });
                            /*中镜像提供方*/
                            self.stepTwoItem.imgType.map(type =>{
                                if(type.value == item.imageType){
                                    self.options.imgType = type;
                                }
                            });

                        }     
                    })
                }else{
                    self.stepTwoItem.osListFilter = self.osList;
                    if(self.options.imgType.value == 2) self.stepTwoItem.osListFilter = getOs(osty);
                    if(self.options.imgType.value != 3) self.options.os = self.options.os || self.stepTwoItem.osListFilter[0];
                }
            }
        })
    }

    function getOs(ostype = "CentOS"){
        if(self.osList && !self.osList.length)return;
         return self.osList.filter(os => os.imageName.indexOf(ostype)>-1);
    }

    /*选择操作系统后联动系统版本*/
    self.stepTwoItem.choosenOsType = function(item){
        self.stepTwoItem.osListFilter = getOs(item);
        self.options.osType = item;
        self.options.os = self.stepTwoItem.osListFilter[0]
    };
    self.stepTwoItem.toStepOneFunc = function(){
        self.stepOne = true;
        self.stepTwo = false;
        self.stepThree = false;
        self.stepFour = false;
    }
    self.stepTwoItem.toStepThreeFunc = function(stepTwoForm){
        if(stepTwoForm.$valid && self.options.os.unImgId){
            self.stepOne = false;
            self.stepTwo = false;
            self.stepThree = true;
            self.stepFour = false;
            $timeout(function(){
                self.slider.sysDisValue = 20;
                self.slider.options_root={
                    floor: 20,
                    ceil: 50,
                    step:10,
                    ticksArray:  [20, 30, 40, 50]
                };
            },200)
            self.stepThreeItem.systemDisk = mapDisk(self.options.chkTypeItem.disk_map);
            if(self.options.paymodes.value == "1"){ //包年包月
                $timeout(function(){
                    self.slider.options_bw ={
                       floor: 1,
                       ceil: 200,
                       step:1,
                       ticksArray:  [1, 50, 100, 200]
                    };
                },200)
                self.stepThreeItem.bandwidthType = [{name:"按宽带计费",value:'PayByBandwidth'},{name:"按流量计费",value:"PayByTraffic"}];
                /*第三步选择宽带等之后，切换计费模式*/
                if(self.options.bandwidthType && self.options.bandwidthType.value == "PayByHour" ){
                    self.options.bandwidthType= self.stepThreeItem.bandwidthType[0]
                }
                self.options.bandwidthType = self.options.bandwidthType || self.stepThreeItem.bandwidthType[0]

            }else if(self.options.paymodes.value == "2"){/*按量计费*/
                $timeout(function(){
                    self.slider.options_bw ={
                       floor: 1,
                       ceil: 100,
                       step:1,
                       ticksArray:  [1, 50,100]
                    };
                },200)
                self.stepThreeItem.bandwidthType = [{name:"按宽带计费",value:'PayByHour'},{name:"按流量计费",value:"PayByTraffic"}];
                /*第三步选择宽带等之后，切换计费模式*/
                if(self.options.bandwidthType && self.options.bandwidthType.value == "PayByBandwidth" ){
                    self.options.bandwidthType = self.stepThreeItem.bandwidthType[0]
                }
                self.options.bandwidthType = self.options.bandwidthType || self.stepThreeItem.bandwidthType[0]

            }
            /*初始化网络选项*/
            self.options.period = self.options.period || self.stepThreeItem.period[0];
            if($routeParams.vpcId && !self.options.netType){
                self.stepThreeItem.chooseNet(self.stepThreeItem.netType[1],"vpc");
            }else{
                self.options.netType = self.options.netType || self.stepThreeItem.netType[0];
            }
            /*初始化时选择系统盘*/
            self.options.systemDisk =self.stepThreeItem.systemDisk[0];
            self.stepThreeItem.choosSystemDisk(self.options.systemDisk);

        }else{
            self.submitform = true;
        }
    }

    /*step-three info*/
    self.stepThreeItem = {
        netType:[{name:"基础网络",value:"1"},{name:"私有网络",value:"2"}],
        period:[{name:"1个月",value:"1"},{name:"2个月",value:"2"},{name:"3个月",value:"3"},{name:"半年",value:"6"},{name:"1年",value:"12"},{name:"2年",value:"24"},{name:"3年",value:"36"}]
    }
    /*存储相关*/

    self.stepThreeItem.chooseDataDisk = function(item){
        self.options.dataDisk = item;
        self.slider.options.step =10;
        if(item.value == 1) diskSection("local_disk");
        if(item.value == 2) diskSection("cloud_disk");
        if(item.value == 3) diskSection("local_ssd");
        if(item.value == 4) diskSection("cloud_ssd");
    };
    function diskSection(type){
        $timeout(function(){
            self.slider.dataDisValue = self.options.chkTypeItem[type][0] ;
            self.slider.options.floor = self.options.chkTypeItem[type][0];
            self.slider.options.ceil = self.options.chkTypeItem[type][1];
            self.slider.options.ticksArray = self.options.chkTypeItem[type];
            getPrice(self.options.paymodes)
        },200)
        
    }
    function mapDisk(arry){
        var  diskArry =[];
        arry.map(function(dis){
            if(dis["1"] || dis==1) diskArry.push({name:"本地硬盘",value:"1"});
            //if(dis["2"] || dis==2) diskArry.push({name:"云硬盘",value:"2"}); //fix AWSTACK261-3792
            if(dis["3"] || dis==3) diskArry.push({name:"本地SSD硬盘",value:"3"});
            if(dis["4"] || dis==4) diskArry.push({name:"SSD云硬盘",value:"4"});
        })
        return diskArry
    }

    self.stepThreeItem.choosSystemDisk = function(item){
        self.options.systemDisk = item;
        self.options.chkTypeItem.disk_map.map(function(val){
            if(val[item.value]){
                self.stepThreeItem.dataDisk = mapDisk(val[item.value])
            }  
        })
        self.stepThreeItem.chooseDataDisk(self.stepThreeItem.dataDisk[0])
    }

    self.stepThreeItem.rePrice = function(){
        getPrice(self.options.paymodes)
    };
    
    self.$watch(function(){
        return self.num+self.slider.sysDisValue+self.slider.dataDisValue + self.slider.bandwidthValue
    },function(value){
        if(value && self.stepThree){
            $timeout.cancel(timer);
            timer = $timeout(function(){
                 getPrice(self.options.paymodes)
            },600); 
        }
    })
    
    /*网络相关*/
    self.stepThreeItem.chooseNet = function(item,type){
        self.options.netType = item;
        if(item.value == "2"){
            var postData = {
                "Region":self.options.region.value
            }
            instanceSrv.getNetwork(postData).then(function(result){
                if(result && result.code == 0){
                    self.netList = result.data;
                    if($routeParams.vpcId && type){
                        self.options.net = self.netList.filter(item => item.vpcId == $routeParams.vpcId)[0];
                    }else{
                        self.options.net = result.data[0];
                    }
                }
            }).finally(function(){
                self.stepThreeItem.changetosunbet();
            })
            
        }
    };
    self.stepThreeItem.changetosunbet = function(){
        self.options.subnet =[];
        self.subnetList =[];
        var postData = {
            "Region":self.options.region.value,
            "vpcId":self.options.net.unVpcId,
            "zoneId":Number(self.options.zone.zoneId)
        }
        instanceSrv.getSubnet(postData).then(function(result){
            if(result && result.data){
                self.subnetList = result.data;
                self.options.subnet = result.data[0];
            }
        })
    };
    self.stepThreeItem.chooseBandwidthType = function(item){
        /*13. 按量计费带宽最大100M  包年包月最大200M*/
        item.value == "PayByTraffic"?self.slider.options_bw.ceil = 100:200;
        item.value == "PayByTraffic"?self.slider.options_bw.ticksArray = [1, 20, 50, 100]:[1, 50, 100, 200];
        self.slider.bandwidthValue = 1;
        self.options.bandwidthType = item;

        getPrice(self.options.paymodes)
    };
    self.stepThreeItem.choosePeriod = function(item){
        self.options.period = item;
        getPrice(self.options.paymodes)
    };
    function getPrice(type){
        
        var postData={};
        self.priceIng = true;
        if(type.value == "1" ){
            postData = {
                "Region": self.options.region.value,
                "instanceType":1,
                "cpu":Number(self.options.chkTypeItem.cpu),
                "mem": Number(self.options.chkTypeItem.mem),
                "period":Number(self.options.period.value),
                "storageType": Number(self.options.dataDisk.value),
                "storageSize": Number(self.slider.dataDisValue),
                "goodsNum":Number(self.num),
                "bandwidth": Number(self.slider.bandwidthValue),
                "bandwidthType": self.options.bandwidthType.value,
                "imageId": self.options.os.unImgId,
                "imageType": Number(self.options.os.imageType)
            };
            /*目前storageType =3和4的时候不支持查询价格*/
            if(self.options.dataDisk.value=="3" || self.options.dataDisk.value=="4"){
                postData.storageType ="2"
            }
            instanceSrv.getPrice(postData).then(function(result){
                self.price = result.price/100;
                self.priceIng = false;
            })
        }else if(type.value=="2"){
            postData = {
                "Region": self.options.region.value,
                "cpu":Number(self.options.chkTypeItem.cpu),
                "mem": Number(self.options.chkTypeItem.mem),
                "imageId": self.options.os.unImgId,
                "imageType": Number(self.options.os.imageType),
                "bandwidth": Number(self.slider.bandwidthValue),
                "bandwidthType": self.options.bandwidthType.value,
                "storageType": Number(self.options.dataDisk.value),
                "storageSize": Number(self.slider.dataDisValue),
                "goodsNum":Number(self.num)
            };
            /*目前storageType =3和4的时候不支持查询价格*/
            if(self.options.dataDisk.value=="3" || self.options.dataDisk.value=="4"){
                postData.storageType ="2"
            }
            instanceSrv.getPriceHour(postData).then(function(result){
                if(result && result.code==0){
                    self.price = result.data.cvm.price;
                    self.netPrice = result.data.bandwidth.price;
                    self.priceIng = false;
                }
            })
        }
        
    }

    self.stepThreeItem.toStepTwoFunc = function(){
        self.stepOne = false;
        self.stepTwo = true;
        self.stepThree = false;
        self.stepFour = false;
    }
    self.stepThreeItem.toStepFourFunc = function(field){
        self.submitform = false;
        if(field.$valid){
            self.stepOne = false;
            self.stepTwo = false;
            self.stepThree = false;
            self.stepFour = true;
            if(self.options.os.osName.indexOf("Xserver")>-1){
                self.passpattern = /^[0-9]+[a-zA-Z]+[^0-9a-zA-Z\s]+|[0-9]+[^0-9a-zA-Z\s]+[a-zA-Z]+|[a-zA-Z]+[0-9]+[^0-9a-zA-Z\s]+|[a-zA-Z]+[^0-9a-zA-Z\s]+[0-9]+|[^0-9a-zA-Z\s]+[a-zA-Z]+[0-9]+|[^0-9a-zA-Z\s]+[0-9]+[a-zA-Z]+\S*$/;
                self.passminnum = 12;
                self.passtip = $translate.instant('CN.errors.wspecial');
                self.stepFourItem.loginStyle = [{name:"设置密码",value:"1"}];
                self.options.loginStyle = self.stepFourItem.loginStyle[0];


            }else{
                self.passpattern = /^[0-9]+[^0-9/\s]+|[a-zA-Z]+[^a-zA-Z/\s]+|[^0-9a-zA-Z\s]+[0-9a-zA-Z]+\S*$/;
                self.passminnum = 8;
                self.passtip = $translate.instant('CN.errors.lspecial');
                self.stepFourItem.loginStyle = [{name:"设置密码",value:"1"},{name:"立即关联密钥",value:"2"}];
                self.options.loginStyle = self.options.loginStyle||self.stepFourItem.loginStyle[0];
            }
            self.stepFourItem.chooseLoginStyle( self.options.loginStyle);

        }else{
            self.submitform = true;
        }
    }

    /*step-four info*/
    self.stepFourItem ={
        nameStyle:[{name:"创建后命名",value:"1"}]
    }
    self.stepFourItem.chooseNameStyle=function(item){
        self.options.nameStyle = item;
    }
    self.stepFourItem.chooseLoginStyle = function(item){
        self.options.loginStyle = item;
        var postData_2 = {
            "Region": self.options.region.value,
            "projectId":0
        };
        instanceSrv.getSecurityGroups(postData_2).then(function(result){
            if(result && result.data){
                self.secGroups = result.data;
                self.options.secGroup = result.data[0]
            }
        })
        if(item.value == "2"){
            var postData_1 = {
                "Region": self.options.region.value,
                "projectId": "",
                "keypairIds":[]
            };
            instanceSrv.getKeypairs(postData_1).then(function(result){
                self.shhKeypaire = result.data.sshSet;
                self.options.ssh = result.data.sshSet[0];
            })
        }
    }
    /*self.stepFourItem.chooseLoginStyle(self.stepFourItem.loginStyle[0]);*/
    self.stepFourItem.toStepThreeFunc = function(){
        self.stepOne = false;
        self.stepTwo = false;
        self.stepThree = true;
        self.stepFour = false;
        self.submitform = false;
    }
    self.buyVm = function(field){
        if(field.$valid){
            self.stepFourForm.wating = true;
            var postData ={
                "Region": self.options.region.value,
                "cpu":Number(self.options.chkTypeItem.cpu),
                "mem": Number(self.options.chkTypeItem.mem),
                "imageId": self.options.os.unImgId,
                "storageSize":Number(self.slider.dataDisValue),
                "zoneId":Number(self.options.zone.zoneId),
                "instanceType":self.options.chkType.instancetype,
                "imageType":Number(self.options.os.imageType),
                "bandwidth": Number(self.slider.bandwidthValue),
                "bandwidthType": self.options.bandwidthType.value,
                "wanIp":Number(Boolean(self.options.wanIp)),   
                "isVpcGateway":1,
                "storageType":Number(self.options.dataDisk.value),
                "needSecurityAgent":1,
                "needMonitorAgent":1,
                "projectId":0,
                "goodsNum":Number(self.num)
            };
            if(self.options.systemDisk.value == "2"){
                postData.rootSize = self.slider.sysDisValue
            }
            if(self.options.secGroup.sys == "0"){
                postData.SecurityGroupId = self.options.secGroup.sgId;
            }
            if(self.options.loginStyle.value == "1"){
                postData.password = self.options.password
            }else if(self.options.loginStyle.value == "2"){
                postData.keyId = self.options.ssh.keyId
            }
            if(self.options.netType.value =="2"){
                postData.vpcId = self.options.net.vpcId;
                postData.subnetId = self.options.subnet.subnetId;
            }
            if(self.options.paymodes.value =="1"){
                postData.period = self.options.period.value;
                instanceSrv.addVm(postData).then(function(){
                    self.stepFourForm.wating = false;
                    $location.url("/cvm/instances?");
                })
            }else if(self.options.paymodes.value =="2"){
                instanceSrv.addVmHour(postData).then(function(){
                    self.stepFourForm.wating = false;
                    $location.url("/cvm/instances");
                })
            }
        }else{
            self.submitform = true;
        }
    }
}]);

