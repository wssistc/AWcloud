
angular.module("buyMysqlModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap", "mysqlsrv", "ui.select", "ngMessages"])
    .controller("MysqlCreateCtrl",["$scope","mysqlSrv","$timeout","$location","RegionID","$routeParams",function(scope,mysqlSrv,$timeout,$location,RegionID,$routeParams){
        var self = scope;
        var timer;
        self.canCheck = true;
        self.priceIng = true;
        self.isSupportVpc = false;
        self.required = {
            network:false,
            subnet:false
        }
        var defauVpc = $routeParams;
        function init(res,defauVpc){
            if(res.configs){
                self.shopconfigs = res.configs;//所有数据
                self.curZoneId = Object.keys(self.shopconfigs.goodsDescription)[0];//可用区默认值
                if(defauVpc&&defauVpc.zoneId){
                    self.curZoneId = defauVpc.zoneId;
                }
                self.Types = self.shopconfigs.goodsDescription[self.curZoneId].types;//mqsql规格所有值
                self.isSupportVpc = self.shopconfigs.goodsDescription[self.curZoneId].isSupportVpc;//是否支持私有网络
                self.curTypes = self.Types[0];//mqsql规格默认值
                self.curMysql = self.curTypes.mysqlversion[0]//mqsql版本默认值[5.5]
                self.memory={
                    selected:self.curTypes
                }

                self.sectionArr = [];
                self.section = (self.memory.selected.volumeMax - self.memory.selected.volumeMin)/4;
                for(let c=1;c<4;c++){
                    var item = (self.memory.selected.volumeMin+self.section*c).toFixed();
                    self.sectionArr.push(item);
                }
                self.slider.value = self.memory.selected.volumeMin;
                self.slider.options = {
                    floor: self.memory.selected.volumeMin,
                    ceil: self.memory.selected.volumeMax,
                    step: self.memory.selected.volumeStep,
                    ticksArray: self.sectionArr
                }
                self.canCheck = true;
            }
        }
        function initNetwork(req,defauVpc){
            self.networkList = [];
            self.subNetList = [];
            self.network.select =null;
            self.subnet.select = null;
            self.hasSubNet = false;
            self.submitalid = false;
            self.subDisabled = true;
            mysqlSrv.getNetwork(req).then(function(res){
                if(res.data){
                    self.networkList = res.data;
                    if(self.networkList.length>0){
                        if(defauVpc&&defauVpc.vpcId){
                            self.networkList.map(item=>{
                                if(item.vpcId==defauVpc.vpcId){
                                    self.network.select = item;
                                    self.subNetList = self.network.select.subnetlist;
                                }
                                return item;
                            })
                        }else{
                            self.subNetList = self.networkList[0].subnetlist;
                            self.network.select = self.networkList[0]; 
                        }
                        if(defauVpc&&defauVpc.subnetId){
                            self.subNetList.map(item=>{
                                if(item.subnetId==defauVpc.subnetId){
                                    self.subnet.select = item;
                                }
                                return item;
                            })
                        }else{
                            self.subnet.select = self.subNetList[0];
                        }
                    }
                    self.hasSubNet = true;
                    self.hasSubNet = self.subNetList.length>0?false:true;
                }
                self.subDisabled = false;
                
            }).then(function(){
                if(self.subNetList.length>0){
                    self.hasSubNet = false;
                    var req = {
                        Region:self.regionCur,
                        vpcId:self.network.select.vpcId,
                        subnetId:self.subnet.select.subnetId
                    }
                    mysqlSrv.getNetNum(req).then(function(res){
                        if(res){
                            self.netNum = {
                                show:true,
                                totalIPNum:res.totalIPNum,
                                availableIPNum:res.availableIPNum
                            }
                        }
                    });
                }else{
                    self.hasSubNet = true;
                    self.netNum = {
                        show:false,
                        totalIPNum:null,
                        availableIPNum:null
                    }
                }
            });
        }
        self.curNetC = defauVpc.vpcId?"perNet":"base";
        self.shopconfigs = {};
        self.slider = {
            value:1
        }
        self.network = {};
        self.subnet = {};
        self.goodsNum = 1;
        self.memory={
            selected:{}
        };

        self.curZoneId = 100002;
        self.regionList = mysqlSrv.getRegionList();
        //self.regionCur = self.regionList[0].region;
        self.regionCur = defauVpc.regionId?defauVpc.regionId:RegionID.Region();
        //self.projectList = proList;
        self.payType = [
            {
                text: "包年包月",
                value: "prePay"
            },
            {
                text: "按量计费",
                value: "hourPay"
            }
        ]
        self.periodList=[
            {
                text: "1个月",
                value: 1
            },{
                text: "2",
                value: 2
            },{
                text: "3",
                value: 3
            },{
                text: "4",
                value: 4
            },{
                text: "5",
                value: 5
            },{
                text: "6",
                value: 6
            },{
                text: "7",
                value: 7
            },{
                text: "8",
                value: 8
            },{
                text: "9",
                value: 9
            },{
                text: "10",
                value: 10
            },{
                text: "11",
                value: 11
            },{
                text: "1年",
                value: 12
            },{
                text: "2年",
                value: 24
            },{
                text: "3年",
                value: 36
            }
        ];
        self.curPay = self.payType[0].value;
        self.curPeri = self.periodList[0].value;
        self.selPayType = function(item){
            self.curPay=item.value
        }
        mysqlSrv.getProductList({Region:self.regionCur}).then(function(res){
            init(res);
        }).then(function(){
            if(defauVpc.vpcId&&self.curNetC=="perNet"){
                var netReg = {
                    Region:self.regionCur,
                    zoneId:self.curZoneId
                }
                initNetwork(netReg,defauVpc);
            }
        });
        mysqlSrv.getInstanNum({Region:self.regionCur}).then(function(res){
            console.log(res);
            if(res&&res.count){
                self.instanNum = res.count;
            }
        })
        
        self.selReg = function(item){//切换区域
            if(self.regionCur != item.region){
                $timeout.cancel(timer);
                self.subDisabled = true;
                self.regionCur = item.region;
                self.curNetC = "base";
                self.isSupportVpc = false;
                self.network.select ={}
                self.canCheck = false;
                self.priceIng = true;
                mysqlSrv.getProductList({Region:item.region}).then(function(res){
                    self.subDisabled = false;
                    init(res);
                });
                mysqlSrv.getInstanNum({Region:item.region}).then(function(res){
                    if(res&&res.count){
                        self.instanNum = res.count;
                    }
                })
                self.netNum = {
                    show:false,
                    totalIPNum:null,
                    availableIPNum:null
                }
                sessionStorage.setItem("RegionSession",item.region);
            }
            
        }
        self.selZone = function(zoneid,val){//切换可用域
            if(self.curZoneId!=zoneid){
                self.curZoneId = zoneid;
                $timeout.cancel(timer);
                self.Types = val.types;
                self.isSupportVpc = val.isSupportVpc
                self.curNetC = "base";
                self.network.select ={};
                self.memory={
                    selected:self.Types[0]
                };
                self.curTypes = self.Types[0];
                self.sectionArr = [];
                self.section = (self.curTypes.volumeMax - self.curTypes.volumeMin)/4;
                for(let c=1;c<4;c++){
                    var item = (self.curTypes.volumeMin+self.section*c).toFixed();
                    self.sectionArr.push(item);
                }
                self.slider.value = self.curTypes.volumeMin;
                self.slider.options = {
                    floor: self.curTypes.volumeMin,
                    ceil: self.curTypes.volumeMax,
                    minLimit:self.curTypes.volumeMin,
                    maxLimit:self.curTypes.volumeMax,
                    step: self.curTypes.volumeStep,
                    ticksArray: self.sectionArr
                }
            }
        }
        self.chooseNetwork = function(){//切换网络
            var option = {
                Region:self.regionCur,
                zoneId:Number(self.curZoneId)
            }
            self.required.network = false;
            self.required.subnet = false;
            if(self.curNetC!= "perNet"){
                self.curNetC = "perNet";
                initNetwork(option);
            }
        }
        self.selNetwork = function(item){
            self.subNetList = item.subnetlist;
            self.subnet.select = self.subNetList[0];
            if(self.subNetList.length>0){
                self.hasSubNet = false;
                var req = {
                    Region:self.regionCur,
                    vpcId:item.vpcId,
                    subnetId:self.subnet.select.subnetId
                }
                mysqlSrv.getNetNum(req).then(function(res){
                    if(res){
                        self.netNum = {
                            show:true,
                            totalIPNum:res.totalIPNum,
                            availableIPNum:res.availableIPNum
                        }
                    }
                });
            }else{
                self.hasSubNet = true;
                self.netNum = {
                    show:false,
                    totalIPNum:null,
                    availableIPNum:null
                }
            }
            
        }
        self.selsubNet = function(subnet){
            if(self.subNetList.length>0){
                self.hasSubNet = false;
                var req = {
                    Region:self.regionCur,
                    vpcId:self.network.select.vpcId,
                    subnetId:subnet.subnetId
                }
                mysqlSrv.getNetNum(req).then(function(res){
                    if(res){
                        self.netNum = {
                            show:true,
                            totalIPNum:res.totalIPNum,
                            availableIPNum:res.availableIPNum
                        }
                    }
                });
            }
        }
        self.selMysql = function(item){//切换数据库版本
            self.curMysql = item;
        }
        self.selMem = function(cur){//切换内存
            self.curTypes = cur;

            self.sectionArr = [];
            self.section = (self.curTypes.volumeMax - self.curTypes.volumeMin)/4;
            for(let c=1;c<4;c++){
                var item = (self.curTypes.volumeMin+self.section*c).toFixed();
                self.sectionArr.push(item);
            }
            self.slider.value = self.curTypes.volumeMin;
            self.slider.options = {
                floor: self.curTypes.volumeMin,
                ceil: self.curTypes.volumeMax,
                minLimit:self.curTypes.volumeMin,
                maxLimit:self.curTypes.volumeMax,
                step: self.curTypes.volumeStep,
                ticksArray: self.sectionArr
            }
        }
        self.selPeri = function(item){//切换时长
            self.curPeri = item.value;
        }
        self.refreshNet = function(){
            var option = {
                Region:self.regionCur,
                zoneId:Number(self.curZoneId)
            }
            initNetwork(option);
        };
        self.confirm = function(){
            let postData = {
                cdbType:"CUSTOM",
                engineVersion:self.curMysql,
                goodsNum:self.goodsNum,
                //vpcId:0,
                //subnetId:self.curPeri,
                //period:self.curPeri,
                projectId:0,
                memory:self.memory.selected.memory,
                volume:self.slider.value,
                zoneId:Number(self.curZoneId),
                instanceRole:'master',
                //masterRegion:self.regionCur,
                Region:self.regionCur
            };
            
            if(self.curNetC=="perNet" && self.network.select && self.network.select){
                postData.vpcId = self.network.select.vpcId;
                postData.subnetId = self.subnet.select.subnetId;
            }
            if(self.curPay=="prePay"){
                postData.period = self.curPeri;
            }
            if(self.newMysql.$valid){
                self.subDisabled = true;
                mysqlSrv.createInstan(postData,self.curPay).then(function(res){
                    self.subDisabled = true;
                    if(res.code==0){
                        //$uibModalInstance.dismiss("cancel");
                        //refresh();
                        $location.path("/cdb/cdblist");
                    }
                }).finally(function(){
                    self.subDisabled = false;
                })
            }else{
                if(self.newMysql.network.$error){self.required.network = true;}
                if(self.newMysql.subnet.$error){self.required.subnet = true;}
            }
            
        }
        self.$watch(function(){
            if(self.memory){
                return self.regionCur+self.goodsNum+self.memory.selected.memory+self.slider.value+self.curPeri+self.curZoneId+self.curPay+self.canCheck
            }
        },function(ne){
            if(ne){
               if(self.canCheck&&self.memory&&self.memory.selected.memory&&self.slider.value&&self.goodsNum&&self.curZoneId){
                   $timeout.cancel(timer);
                    timer = $timeout(function(){
                        self.priceIng = true;
                        let data = {
                            "Region":self.regionCur,            //地域[必填]
                            "cdbType":"CUSTOM",       //实例规格[必填]，CUSTOM 代表自定义规格
                            "goodsNum":self.goodsNum,             //实例数量[必填]，默认值为1，使用/ProductList获取可用数量
                            "memory":self.memory.selected.memory,            //实例内存大小[可选]，单位：MB,使用/ProductList获取范围
                            "volume":self.slider.value,              //实例硬盘大小[可选]，单位：GB,使用/ProductList获取范围
                            "zoneId":Number(self.curZoneId),          //可用区ID[可选]，使用/ProductList获取范围
                            "instanceRole":"master"   //实例类型[可选]，默认为 master，支持值包括：master-表示主实例，dr-表示灾备实例，ro-表示只读实例
                        }
                        if(self.curPay=="prePay"){
                            data.period = self.curPeri;
                        }
                        mysqlSrv.getPrice(data,self.curPay).then(function(res){
                            if(Number(res.price)){
                                self.price = (res.price/100).toFixed(2);
                            }
                        }).finally(function(){
                            self.priceIng = false;
                        })
                    },600); 
                } 
            }
            
            
            
        })
    }]);


