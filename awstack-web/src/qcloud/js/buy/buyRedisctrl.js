import "../redis/redisSrv";

angular.module("buyRedisModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "ngMessages","redissrv"])
.controller("buyRedisCtrl",["$scope","$timeout","$location","redisSrv","AllenableZone","RegionID",function(scope,$timeout,$location,redisSrv,AllenableZone,RegionID){
    var self = scope;
    self.canCheck = false;
    var timel;
    self.priceIng = true;
    self.submitalid = false;
    self.subMt = false;
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
    //self.isSupportVpc = false;
    self.curNetC = "base";
    self.shopconfigs = {};
    self.slider = {
        value:1
    }
    self.enableZoneList = {
        gz:[],
        sh:[],
        bj:[],
        hk:[]
    }
    self.network = {
        select:{}
    };
    self.subnet = {
        select:{}
    };
    self.goodsNum = 1;
    self.memory={
        selected:{}
    };
    self.curTypes = {};
    self.regionList = redisSrv.getRegionList();
    self.regionCur = RegionID.Region();
    self.curPeri = self.periodList[0].value;
    AllenableZone.map(item=>{
        switch(Number(Object.keys(item)[0].substring(0,2))){
            case 10:
                self.enableZoneList.gz.push(Object.keys(item)[0]);
                break;
            case 20:
                self.enableZoneList.sh.push(Object.keys(item)[0]);
                break;
            case 30:
                self.enableZoneList.hk.push(Object.keys(item)[0]);
                break;
            case 80:
                self.enableZoneList.bj.push(Object.keys(item)[0]);
                break;
        }
    })
    self.zoneList = self.enableZoneList[self.regionCur];
    self.curZoneId = self.zoneList[0];
    var req = {
        "Region":self.regionCur,
        "zoneIds.0":Number(self.curZoneId)
    }
    function init(res){
        if(res.data){
            self.shopconfigs = res.data[0];//所有数据
            self.Types = self.shopconfigs.types;
            function transform(obj){
                self.Type = [];
                for(var item in self.Types){
                    self.Type.push(self.Types[item]);
                }
                return self.Type;
            }
            transform(self.Types)
            self.Type.sort(function(a,b){
                return a.type-b.type
            }).reverse();


            self.curTypes = self.Type[Object.keys(self.Type)[0]];//
            self.sectionArr = [];
            self.section = (self.curTypes.maxMemSize - self.curTypes.minMemSize)/(4*1024);
            for(let c=1;c<4;c++){
                var item = (self.curTypes.minMemSize/1024+self.section*c).toFixed();
                self.sectionArr.push(item);
            }
            self.slider.value = self.curTypes.minMemSize/1024;
            self.slider.options = {
                floor: self.curTypes.minMemSize/1024,
                ceil: self.curTypes.maxMemSize/1024,
                step: 1,
                ticksArray: self.sectionArr
            }

            self.canCheck = true;
        }
    };
    function initNetwork(req){
        self.networkList = [];
        self.subNetList = [];
        self.network.select =null;
        self.subnet.select = null;
        self.hasSubNet = false;
        redisSrv.getNetwork(req).then(function(res){
            if(res.data){
                self.networkList = res.data;
                if(self.networkList.length>0){
                    self.subNetList = self.networkList[0].subnetlist;
                    self.network.select = self.networkList[0];
                    self.subnet.select = self.subNetList[0];
                }
                self.hasSubNet = self.subNetList.length>0?false:true;
            };
            
        }).then(function(){
            if(self.subNetList.length>0){
                self.hasSubNet = false;
                var req = {
                    Region:self.regionCur,
                    vpcId:self.network.select.vpcId,
                    subnetId:self.subnet.select.subnetId,
                }
                redisSrv.getNetNum(req).then(function(res){
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
    redisSrv.getProductList(req).then(function(res){
        init(res)
    });
    self.selReg = function(item){//切换区域
        if(self.regionCur != item.region){
            self.regionCur = item.region;
            self.curNetC = "base";
            self.network.select ={}
            self.canCheck = false;
            self.priceIng = true;
            self.zoneList = self.enableZoneList[self.regionCur];
            self.curZoneId = self.zoneList[0];
            var req = {
                "Region":self.regionCur,
                "zoneIds.0":Number(self.curZoneId)
            }
            redisSrv.getProductList(req).then(function(res){
                init(res);
            });
            sessionStorage.setItem("RegionSession",item.region);
        }
    }
    self.selZone = function(zoneid){//切换可用域
        self.curZoneId = zoneid;
        self.curNetC = "base";
        self.network.select ={};
        self.canCheck = false;
        var req = {
            "Region":self.regionCur,
            "zoneIds.0":Number(self.curZoneId)
        }
        redisSrv.getProductList(req).then(function(res){
            init(res);
        });
    }
    self.chooseNetwork = function(){//切换网络
        var option = {
            Region:self.regionCur,
            zoneId:Number(self.curZoneId)
        }
        self.hasSubNet = true;
        self.netNum = {
            show:false,
            totalIPNum:null,
            availableIPNum:null
        }
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
                subnetId:self.subnet.select.subnetId,
            }
            redisSrv.getNetNum(req).then(function(res){
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
                subnetId:subnet.subnetId,
            }
            redisSrv.getNetNum(req).then(function(res){
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
    self.selType = function(item){
        self.curTypes = item;
        self.sectionArr = [];
        self.section = (self.curTypes.maxMemSize - self.curTypes.minMemSize)/(4*1024);
        for(let c=1;c<4;c++){
            var item = (self.curTypes.minMemSize/1024+self.section*c).toFixed();
            self.sectionArr.push(item);
        }
        self.slider.value = self.curTypes.minMemSize/1024;
        self.slider.options = {
            floor: self.curTypes.minMemSize/1024,
            ceil: self.curTypes.maxMemSize/1024,
            step: 1,
            ticksArray: self.sectionArr
        }
    }
    self.selPeri = function(item){//切换时长
        self.curPeri = item.value;
    }
    self.confirm = function(){
        self.submitalid = true;
        if(self.submitalid && self.newRedis.$valid){
            let postData = {
                typeId:self.curTypes.type,
                engineVersion:self.curMysql,
                goodsNum:self.goodsNum,
                period:self.curPeri,
                projectId:0,
                memSize:self.slider.value*1024,
                password:self.password,
                zoneId:Number(self.curZoneId),
                Region:self.regionCur
            };
            self.isTrue = true;
            self.subMt = true;
            if(self.curNetC=="perNet" && self.network.select && self.network.select){
                postData.vpcId = self.network.select.vpcId.split("_").pop();
                postData.subnetId = self.subnet.select.subnetId.split("_").pop();
            }
            redisSrv.createInstan(postData).then(function(res){
                self.isTrue = false;
                if(res.code==0){
                    $location.path("/redis/redislist");
                }
            }).finally(function(){
                self.subMt = false;
            }) 
        }
        
    }
    self.refreshNet = function(){
        var option = {
            Region:self.regionCur,
            zoneId:Number(self.curZoneId)
        }
        initNetwork(option);
    };
    self.$watch(function(){
            return self.regionCur+self.goodsNum+self.slider.value+self.curPeri+self.curZoneId+self.curTypes.type+self.canCheck
    },function(ne){
        if(self.canCheck&&self.slider.value&&self.goodsNum&&self.curZoneId&&self.curTypes.type){
            $timeout.cancel(timel);
            timel = $timeout(function(){
                let data = {
                    "Region":self.regionCur,            //地域[必填]
                    "typeId":self.curTypes.type,       //
                    "goodsNum":self.goodsNum,             //
                    "memSize":self.slider.value*1024,              //
                    "period":self.curPeri,
                    "zoneId":Number(self.curZoneId)          //
                };
                self.priceIng = true;
                redisSrv.getPrice(data).then(function(res){
                    if(res.data && Number(res.data.price)){
                        self.price = (res.data.price/100).toFixed(2);
                    }
                }).finally(function(){
                    self.priceIng = false;
                })
            },500)
        }
    })
}]);