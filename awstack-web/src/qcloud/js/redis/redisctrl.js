angular.module("redisListModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap", "redissrv", "ui.select", "ngMessages"])
.filter("formatDate",[function(){
    return function(val){
        if(val){
            return /^0000/.test(val.split(" ")[0])?"--":val.split(" ")[0];
        }
    }
}])
.controller("redisCtrl", ["$scope", "$rootScope","redisSrv","$uibModal","$window","NgTableParams","checkedSrv","$q","RegionID","$interval","$timeout", function($scope, $rootScope,redisSrv,$uibModal,$window,NgTableParams,checkedSrv,$q,RegionID,$interval,$timeout) {
    var self = $scope;
    self.projectList = [{projectId:0,projectName:"默认项目"}];
    self.regionList = redisSrv.getRegionList();
    self.region = {};
    self.resdiSet = [];
    self.project = {
        "selected":self.projectList[0].projectId
    };
    self.regionList.filter(item=>{
        if(item.region==RegionID.Region()){
            self.region.selected = item;
        }
        return item;
    });

    var queryParams = {
        "Region":self.region.selected.region,
        "projectId":self.project.selected.projectId
    };
    
    function initRedisInstanceTable(queryParams){
        self.globalSearchTerm = "";
        redisSrv.getList(queryParams).then(function(res){
            if(res && res.redisSet){
                res.redisSet.forEach(item => {
                    item.searchItem = item.redisName + item.redisId + item.wanIp;
                    if(item.region == "gz"){
                        item.regionName = "广州"
                    }else if(item.region == "sh"){
                        item.regionName = "上海"
                    }else if(item.region == "bj"){
                        item.regionName = "北京"
                    }
                });
                self.resdiSet = res.redisSet
                self.redisInstanceTable = new NgTableParams(
                    { count: 10 }, 
                    { counts: [], dataset: self.resdiSet }
                );
                checkedSrv.checkDo(self, res.redisSet, "redisId","redisInstanceTable");
            }
        })
    };
    initRedisInstanceTable(queryParams);
    function getTb(res){
        if(res && res.redisSet){
            res.redisSet.forEach(item => {
                item.searchItem = item.redisName + item.redisId + item.wanIp;
                if(item.region == "gz"){
                    item.regionName = "广州"
                }else if(item.region == "sh"){
                    item.regionName = "上海"
                }else if(item.region == "bj"){
                    item.regionName = "北京"
                }
            });
            self.resdiSet = res.redisSet;

            self.redisInstanceTable = new NgTableParams(
                { count: 10 }, 
                { counts: [], dataset: self.resdiSet  }
            );
            var term = self.globalSearchTerm;
            self.redisInstanceTable.filter({ searchItem: term });
        }
    }

    $window.redisFunc = function(region){
        var timer = $timeout(function(){
            var flag;
            var queryParams = {
                "Region":self.region.selected.region,
                "projectId":self.project.selected.projectId
            };
            redisSrv.getList(queryParams).then(function(res){
                getTb(res)
            }).finally(function(res){
                $window.redisFunc();
            })
        },12000)
    }
    $window.redisFunc();
    
    

    self.changeProject = function(projectId){
        queryParams.projectId = projectId;
        initRedisInstanceTable(queryParams);
    };

    self.changeRegion = function(item){
        queryParams.Region = item.region; 
        initRedisInstanceTable(queryParams);
        self.region.selected = item;
        sessionStorage.setItem("RegionSession",item.region);
    };

    self.refresh = function(queryParams){
        initRedisInstanceTable(queryParams);
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.redisInstanceTable.filter({ searchItem: term });
    };

    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        if(self.checkboxes){
            self.isAutoRenew = false;
            self.isCancelRenew = false;
        }
        if(value && value.length > 1 ){
            self.isRadio = true;
        }else if(value && value.length > 0 ){
            self.isRadio = false;
            self.isAutoRenew = false;
            self.isCancelRenew = false;
        }else{
            self.isRadio = true;
            self.isAutoRenew = true;
            self.isCancelRenew = true;
        }
    });

    //新建云存储redis
    self.createRedisInstance = function(){
        $uibModal.open({
            templateUrl:"createRedisInstance.html",
            controller:"CreateRedisCtrl",
            resolve:{
                refresh:function(){
                    return initRedisInstanceTable;
                },
                AllenableZone:function(){
                    var deferred = $q.defer();
                    redisSrv.getZoneList({Region:"gz"}).then(function(res){
                        if (res.data) {
                            deferred.resolve(res.data.zones);
                        }
                    })
                    return deferred.promise;
                }
            }
        });
    };

    //扩容
    self.addSize = function(val){
        if(val&&val.status ==2){
            $uibModal.open({
                templateUrl:"addsize.html",
                controller:"AddSizeCtrl",
                resolve:{
                    refresh:function(){
                        return initRedisInstanceTable;
                    },
                    instan:function(){
                        return val;
                    },
                    sliderData:function(){
                        var pzlx;
                        if(val.typeId == 1){
                            pzlx = 300;
                        }else{
                            pzlx = 60;
                        }
                        var slider = {
                            value:val.size/1024 + 1,
                            options:{
                                floor: val.size/1024 + 1,
                                ceil: pzlx,
                                step: 1
                            }
                        };
                        return slider;
                    }
                }
            });
        }
    };

    //修改密码
    self.changePassword = function(){
        var modalInstance = $uibModal.open({
            templateUrl:"clearExa.html",
            scope:$scope
        });
        self.changePW = true;
        self.exa = self.checkedItems[0];
        self.EXA = {}
        self.confirmPassword = function(){
            var postData = {
                Region:self.region.selected.region,
                redisId:self.exa.redisId,
                oldPassword:self.EXA.oldPassword,
                password:self.EXA.newPassword
            }
            redisSrv.changePassword(postData).then(function(result){
                modalInstance.dismiss("cancel");
                initRedisInstanceTable({Region:self.region.selected.region})
            });
        }
    };

    //续费
    self.renewRedis = function(){
        self.total = {price:""};
        self.crsPriceUnit = [{name:"年"}, {name:"月"}];
        self.crsPriceUnit.selected =self.crsPriceUnit[0];

        self.crsPriceTime = [{name:"1",time:"12"},{name:"2",time:"24"},{name:"3",time:"36"}]
        self.crsPriceTime.selected =self.crsPriceTime[0];

        var modalInstance = $uibModal.open({
            templateUrl:"renewRedis.html",
            scope:$scope
        });
        var queryData = {
            "Region": self.region.selected.region,
            "zoneId": self.checkedItems[0].zoneId,
            "typeId": self.checkedItems[0].typeId,
            "memSize":self.checkedItems[0].size,
            "goodsNum": 1,
            "period":self.crsPriceTime.selected.time
        }
        redisSrv.crsPrice(queryData).then(function(res){
            self.total = res.data
        });
        self.changeUnit = function(val){
            switch (val){
                case "年":
                self.crsPriceTime = [{name:"1",time:"12"},{name:"2",time:"24"},{name:"3",time:"36"}];
                self.crsPriceTime.selected = self.crsPriceTime[0];
                break;
                case "月":
                self.crsPriceTime = [
                {name:"1",time:"1"},
                {name:"2",time:"2"},
                {name:"3",time:"3"},
                {name:"4",time:"4"},
                {name:"5",time:"5"},
                {name:"6",time:"6"},
                {name:"7",time:"7"},
                {name:"8",time:"8"},
                {name:"9",time:"9"},
                {name:"10",time:"10"},
                {name:"11",time:"11"},
                {name:"12",time:"12"}
                ]
                self.crsPriceTime.selected =self.crsPriceTime[0];
                break;
            }
            var queryData = {
                "Region": self.region.selected.region,
                "zoneId": self.checkedItems[0].zoneId,
                "typeId": self.checkedItems[0].typeId,
                "memSize":self.checkedItems[0].size,
                "goodsNum": 1,
                "period":self.crsPriceTime.selected.time
            }
            redisSrv.crsPrice(queryData).then(function(res){
                self.total = res.data
            });
        }
        self.changeTime = function(val){
            var queryData = {
                "Region": self.region.selected.region,
                "zoneId": self.checkedItems[0].zoneId,
                "typeId": self.checkedItems[0].typeId,
                "memSize":self.checkedItems[0].size,
                "goodsNum": 1,
                "period":val
            }
            redisSrv.crsPrice(queryData).then(function(res){
                self.total = res.data
            });
        }
        self.confirm= function(){
            var postData = {
                Region:self.region.selected.region,
                redisId:self.checkedItems[0].redisId,
                period:self.crsPriceTime.selected.time
            }
            redisSrv.renewRedis(postData).then(function(result){
                modalInstance.dismiss("cancel");
                initRedisInstanceTable({Region:self.region.selected.region})
            });
        }
    };

    // 设置自动续费
    self.autoRenew = function(){
        $uibModal.open({
            templateUrl:"autoRenew.html",
            controller:"redisAutoRenewCtrl",
            resolve:{
                refresh:function(){
                    return initRedisInstanceTable;
                },
                val:function(){
                    return self.checkedItems;
                },
                reg:function(){
                    return self.region.selected;
                }
            }
        });
    };

    //取消自动续费
    self.cancelRenew = function(){
        $uibModal.open({
            templateUrl:"cancelRenew.html",
            controller:"redisAutoRenewCtrl",
            resolve:{
                refresh:function(){
                    return initRedisInstanceTable;
                },
                val:function(){
                    return self.checkedItems;
                },
                reg:function(){
                    return self.region.selected;
                }
            }
        });
    };

    //获取云主机详情
    self.$on("getDetail", function(event, value) {
        redisSrv.getList({
            "Region":self.region.selected.region,
            "redisId":value
        }).then(function(res){
            if(res && res.redisSet){
                self.redisDetail = res.redisSet[0];
            }
        })
    });

    //清空实例
    self.clearExa = function(){
        $uibModal.open({
            templateUrl:"clearExa.html",
            controller:"clearExaCtrl",
            resolve:{
                refresh:function(){
                    return initRedisInstanceTable;
                },
                exa:function(){
                    return self.redisDetail;
                },
                reg:function(){
                    return self.region.selected;
                }
            }
        });
    };

}])
.controller("AddSizeCtrl",["$scope","instan","$uibModalInstance","redisSrv","$timeout","refresh",function(scope,instan,$uibModalInstance,redisSrv,$timeout,refresh){
    var self = scope;
    self.priceIng = true;
    var timer;
    var sliderTimer = $timeout(function(){
        //self.slider = sliderData;
        if(instan.typeId == 1){
            self.pzlx = 300;
        }else{
            self.pzlx = 60;
        }
        self.sectionArr = [];
        self.section = (self.pzlx - (instan.size/1024 + 1))/4;
        for(let c=1;c<4;c++){
            var item = ((instan.size/1024 + 1)+self.section*c).toFixed();
            self.sectionArr.push(item);
        }
        self.slider = {
            value:instan.size/1024 + 1,
            options:{
                floor: instan.size/1024 + 1,
                ceil: self.pzlx,
                step: 1,
                ticksArray:self.sectionArr
            }
        };
    },1)
    var regionMap = {
        1:"gz",
        4:"sh",
        8:"bj",
        5:"hk"
    }
    self.$watch(function(){
        if(self.slider&&self.slider.value){
            return self.slider.value
        }
    },function(ne){
        if(ne){
            $timeout.cancel(timer);
            timer = $timeout(function(){
                let req = {
                    Region:regionMap[instan.regionId],
                    redisId:instan.redisId,
                    memSize:Number(self.slider.value)*1024
                };
                redisSrv.upgradePrice(req).then(function(res){
                    if(res.data && Number(res.data.price)){
                        self.price = (res.data.price/100).toFixed(2);
                    }
                }).finally(function(){
                    self.priceIng = false;
                })
            },600);
        }
    });
    self.confirm = function(){
        let req = {
            Region:regionMap[instan.regionId],
            redisId:instan.redisId,
            memSize:Number(self.slider.value)*1024
        };
        let refReq = {
            Region:regionMap[instan.regionId],
            projectId:instan.projectId,
        } 
        self.canUpdate = false;
        redisSrv.upgradeRedis(req).then(function(res){
            self.canUpdate = false;
            if(res.code==0){
                $timeout(function(){
                    refresh(refReq);
                },2000)
                $uibModalInstance.dismiss("cancel");
            }
        });
    }
}])
.controller("CreateRedisCtrl",["$scope","redisSrv","$uibModalInstance","refresh","AllenableZone","$timeout",
    function(scope,redisSrv,$uibModalInstance,refresh,AllenableZone,$timeout){
    var self = scope;
    self.submitalid = false;
    self.periodList=[
        {
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
        }
    ];
    self.canCheck = true;
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
    self.regionCur = self.regionList[0].region;
    self.curPeri = self.periodList[0].value;
    AllenableZone.map(item=>{
        switch(Number(Object.keys(item)[0][0])){
            case 1:
                self.enableZoneList.gz.push(Object.keys(item)[0]);
                break;
            case 2:
                self.enableZoneList.sh.push(Object.keys(item)[0]);
                break;
            case 3:
                self.enableZoneList.hk.push(Object.keys(item)[0]);
                break;
            case 8:
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
            self.Types = self.shopconfigs.types;//
            self.curTypes = self.Types[Object.keys(self.Types)[0]];//
            self.section = (self.curTypes.maxMemSize - self.curTypes.minMemSize)/(3*1024);
            self.sectionArr = [0,self.curTypes.maxMemSize/1024/3,self.curTypes.maxMemSize/1024/3*2,self.curTypes.maxMemSize/1024/3*3]
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
            
        });
    }
    console.log(req)
    redisSrv.getProductList(req).then(function(res){
        init(res);
    });
    self.selReg = function(item){//切换区域
        if(self.regionCur != item.region){
            self.regionCur = item.region;
            self.curNetC = "base";
            self.network.select ={}
            self.canCheck = false;
            self.zoneList = self.enableZoneList[self.regionCur];
            self.curZoneId = self.zoneList[0];
            var req = {
                "Region":self.regionCur,
                "zoneIds.0":Number(self.curZoneId)
            }
            redisSrv.getProductList(req).then(function(res){
                init(res);
            });

        }
    }
    self.selZone = function(zoneid){//切换可用域
        self.curZoneId = zoneid;
        self.curNetC = "base";
        self.network.select ={};
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
        if(self.curNetC!= "perNet"){
            self.curNetC = "perNet";
        }
        initNetwork(option);
    }
    self.selNetwork = function(item){
        self.subNetList = item.subnetlist;
        self.subnet.select = self.subNetList[0];
        self.hasSubNet = self.subNetList.length>0?false:true;
    }
    self.selType = function(item){
        self.curTypes = item;
        self.section = (self.curTypes.maxMemSize - self.curTypes.minMemSize)/(3*1024);
        self.sectionArr = [0,self.curTypes.maxMemSize/1024/3,self.curTypes.maxMemSize/1024/3*2,self.curTypes.maxMemSize/1024/3*3]
        self.slider.value = self.curTypes.minMemSize/1024;
        self.slider.options = {
            floor: self.curTypes.minMemSize/1024,
            ceil: self.curTypes.maxMemSize/1024,
            step: 1,
            ticksArray: self.sectionArr
        }
        console.log(self.sectionArr)
    }
    self.selPeri = function(item){//切换时长
        self.curPeri = item.value;
    }
    self.confirm = function(){
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
        self.submitalid = true;
        self.isTrue = true;
        if(self.curNetC=="perNet" && self.network.select && self.network.select){
            postData.vpcId = self.network.select.vpcId.split("_").pop();
            postData.subnetId = self.subnet.select.subnetId.split("_").pop();
        }
        if(self.submitalid && self.newRedis.$valid){
            redisSrv.createInstan(postData).then(function(res){
                self.isTrue = false;
                if(res.code==0){
                    $uibModalInstance.dismiss("cancel");
                    $timeout(function(){
                        refresh();
                    },1000)
                }
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
        return self.regionCur+self.goodsNum+self.slider.value+self.curPeri+self.curZoneId+self.curTypes.type
    },function(ne){
        console.log(ne);
        if(self.canCheck&&self.curTypes.type){
            let data = {
                "Region":self.regionCur,            //地域[必填]
                "typeId":self.curTypes.type,       //
                "goodsNum":self.goodsNum,             //
                "memSize":self.slider.value*1024,              //
                "period":self.curPeri,
                "zoneId":Number(self.curZoneId)          //
            }
            redisSrv.getPrice(data).then(function(res){
                if(res.data && Number(res.data.price)){
                    self.price = (res.data.price/100).toFixed(2);
                }
            })
        }
    })
}])
.controller("redisAutoRenewCtrl",["$scope","val","$uibModalInstance","redisSrv","$timeout","refresh","$filter","reg",function(scope,val,$uibModalInstance,redisSrv,$timeout,refresh,$filter,reg){
    var self = scope;

    self.region = {};
    self.totalUnitPrice = 0;
    self.val= [];
    self.val = val;
    var _length =  self.val.length;
    self.val.map(item =>{
        item.lastTime = new Date(moment(item.deadlineTime).format("YYYY-MM-DD"));
        if(item.lastTime.getMonth() == 11){
            item.lastTime = (item.lastTime.getFullYear()+1) + '-01-' + item.lastTime.getDate();
        }else if(item.lastTime.getMonth() == 10 || item.lastTime.getMonth() == 9 ||  item.lastTime.getMonth() == 8){
            item.lastTime = item.lastTime.getFullYear() + '-' + (item.lastTime.getMonth()+2) + '-' + item.lastTime.getDate();
        }else{
            item.lastTime = item.lastTime.getFullYear() + '-0' + (item.lastTime.getMonth()+2)  + '-' + item.lastTime.getDate();
        }
        var postData = {
            "Region": reg.region,
            "zoneId": item.zoneId,
            "typeId": item.typeId,
            "memSize":item.size,
            "goodsNum": 1,
            "period": 1
        }
        redisSrv.crsPrice(postData).then(function(res){
            item.price = res.data.price/100;
            self.totalUnitPrice += item.price;
        });
    })
    console.log(reg)

    self.confirm = function(type){
        switch(type){
            case 'ok':
            var postData = {
                Region:reg.region,
                isAutoRenew:1
            }
            for(var i=0;i<_length;i++){
                postData['redisIds.' +i] = self.val[i].redisId;
            }
            redisSrv.setautorenew(postData).then(function(result){
                $uibModalInstance.dismiss("cancel");
                refresh({Region:reg.region})
            });
            break;
            case 'cancel':
            var postData = {
                Region:reg.region,
                isAutoRenew:0
            }
            for(var i=0;i<_length;i++){
                postData['redisIds.' +i] = self.val[i].redisId;
            }
            redisSrv.setautorenew(postData).then(function(result){
                $uibModalInstance.dismiss("cancel");
                refresh({Region:reg.region})
            });
            break;
        }
    }

}])
.controller("clearExaCtrl",["$scope","refresh","exa","$uibModalInstance","redisSrv","$timeout","reg","$location",function(scope,refresh,exa,$uibModalInstance,redisSrv,$timeout,reg,$location){
    var self = scope;
    self.EXA = {};
    self.changePW = false;
    self.exa = exa;
    self.confirm = function(){
        var postData = {
            Region:reg.region,
            redisId:exa.redisId,
            password:self.EXA.password
        }

        redisSrv.clearExa(postData).then(function(res){
            $uibModalInstance.dismiss("cancel");
            $timeout(function(){
                refresh();
            },1000)
            $location.url("/redis/redislist")
        });
    }
    self.changePassword = function(){
        self.changePW = true;
        self.confirmPassword = function(){
            var postData = {
                Region:reg.region,
                redisId:exa.redisId,
                oldPassword:self.EXA.oldPassword,
                password:self.EXA.newPassword
            }
            redisSrv.changePassword(postData).then(function(result){
                $uibModalInstance.dismiss("cancel");
            });
        }
    }
}])
