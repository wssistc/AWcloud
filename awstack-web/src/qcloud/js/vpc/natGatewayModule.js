import "./natGatewaySrv";

var natGatewayModule = angular.module("natGatewayModule", ["ngSanitize","ngTable", "ngAnimate", "ui.bootstrap","ui.select","natGatewaySrvModule","vpcSrvModule"]);

natGatewayModule.controller("natGatewayCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","$interval","$timeout","NgTableParams","natGatewaySrv","vpcSrv","RegionID",
    function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,$interval,$timeout,NgTableParams,natGatewaySrv,vpcSrv,RegionID) {
    var self = $scope;

    self.regions = {
        options:vpcSrv.regionOptions
    };
    self.vpcs = {
        options:[{"vpcName":"全部私有网络","vpcId":""}]
    };
    self.queryLimit = {
        regionId:RegionID.Region()
    };
    var vpcData = JSON.parse(sessionStorage.getItem("VPC"));
    self.queryLimit.vpc = vpcData?vpcData:self.vpcs.options[0];
    sessionStorage.setItem("VPC",JSON.stringify(self.queryLimit.vpc));
    self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];

    function getAllVpcData(){
        vpcSrv.getVpcList({
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }    
        }).then(function(res){
            if(res && res.data){
                res.data.forEach(item => self.vpcs.options.push(item));
                if($routeParams.vpcId){
                    self.vpcs.options.forEach(item => {
                        if($routeParams.vpcId == item.vpcId){
                            self.queryLimit.vpc = item;
                        }
                    })
                }
            }
        });
    }

    function initNatGatewayList(){
        self.globalSearchTerm = "";
        var params = {
            "params":{
                "Region":self.queryLimit.regionId,
                "all":"True"
            }
        };
        if($routeParams.vpcId){
            params.params.vpcId = $routeParams.vpcId
        }else if(self.queryLimit.vpc.vpcId){
            params.params.vpcId = self.queryLimit.vpc.vpcId;
        }
        natGatewaySrv.queryNatGateway(params).then(function(res){
            if(res && res.data){
                var natGatewayTableData = _.map(res.data,function(item){
                    if(item.productionStatus != 1){  //如果还没有创建成功,显示productionStatus
                        item.stateLoading = true;
                        item._state = $translate.instant("CN.vpc.natProductionStatus." + item.productionStatus);
                    }else{ //创建成功后state 0:运行中 1:不可用 2:欠费停服
                        item.stateLoading = false;
                        item._state = $translate.instant("CN.vpc.natState." + item.state);
                    }
                    item.vpcId = self.queryLimit.regionId + "_vpc_" + item.vpcId;
                    item.delLoading = false;
                    return item;
                });
                self.natGatewayTable = new NgTableParams(
                { count: 10 }, 
                { counts: [], dataset: natGatewayTableData });
            }
        });
    }

    function getNatGatewayDetailData(natId){
        natGatewaySrv.queryNatGateway({
            "params":{
                //"Region":self.queryLimit.regionId,
                "natId":natId
            }
        }).then(function(res){
            if(res && res.data){
                self.natDetailItem = res.data[0] ;
                self.natDetailItem.vpcId = self.queryLimit.regionId + "_vpc_" + self.natDetailItem.vpcId;
                self.elasticIPList = [];
                res.data[0].eipSet && res.data[0].eipSet.forEach(function(item){
                    var eipObj = {
                        "eip":item,
                        "natId":natId,
                        "vpcId":self.natDetailItem.vpcId,
                        "showEipLoading":false
                    };
                    if(res.data[0].eipSet.length == 1){
                        eipObj.unbindEipTip = "至少需要保留一个弹性IP";
                    }
                    self.elasticIPList.push(eipObj);
                })
            }
        })
    }

    getAllVpcData();
    initNatGatewayList();

    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        self.subzones = (vpcSrv.zoneOptions())[self.queryLimit.regionId];
        self.vpcs.options.splice(1,self.vpcs.options.length);
        self.queryLimit.vpc = {"vpcName":"全部私有网络","vpcId":""};
        sessionStorage.setItem("RegionSession",regionId);
        sessionStorage.setItem("VPC",JSON.stringify(self.queryLimit.vpc));
        initNatGatewayList();
        getAllVpcData();
    };

    self.changeVpc = function(vpc){
        self.queryLimit.vpc = vpc;
        sessionStorage.setItem("VPC",JSON.stringify(vpc));
        initNatGatewayList();
    };

    self.refreshNatList = function(){
        initNatGatewayList();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.natGatewayTable.filter({ $: term });
    };

    function getContinueNum(min,max){
        var numlist = [];
        for(let i = min ; i <= max ; i++){
            numlist.push(i);
        }
        return numlist;
    }

    self.natTypesOtions = [
        {"name":"小型(最大并发连接数100W)","value":1000000},
        {"name":"中型(最大并发连接数300W)","value":3000000},
        {"name":"大型(最大并发连接数1000W)","value":10000000},
    ];
    self.BWLimitOptions = [10,20,50,100,200,500,1000,2000,5000];
    self.maxConcurrentObj = {};
    self.EipOptions = [  //弹性公网IP模块未做,目前只支持默认新建
        {"name":"默认新建","value":"default"}/*,
        {"name":"118.89.18.247","value":"118.89.18.247"},
        {"name":"10.10.10.2","value":"10.10.10.2"},
        {"name":"10.10.10.3","value":"10.10.10.3"}*/
    ];
    self.autoAllocEipNumOptions = getContinueNum(0,10);

    self.changeNatType = function(maxConcurrent){
        self.priceIng = true;
        self.natCost = self.maxConcurrentObj[maxConcurrent];
        queryNatPrice(maxConcurrent);
    };

    function queryNatPrice(maxConcurrent){

        natGatewaySrv.queryNatPrice({
            "params":{
                "maxConcurrent":maxConcurrent
            }
        }).then(function(res){
            if(res && res.code == 0){
                var natprice = res.price.device/100; //单位由分转化为元
                self.maxConcurrentObj[maxConcurrent] = natprice;
                self.natCost = self.maxConcurrentObj[maxConcurrent];
                self.networkPrice = res.price.traffic/100;
            }
        }).finally(function(){
            self.priceIng = false;
        });
    }

    self.creatNatModal = function(){
        var scope = self.$new();
        var createNatGatewayModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"createNatGatewayModal.html",
            scope:scope
        });
        
        scope.vpcsOptions = angular.copy(scope.vpcs.options);
        scope.vpcsOptions.splice(0,1);


        scope.natForm = {
            "natName":"",
            "maxConcurrent":scope.natTypesOtions[0].value,
            "vpcId":scope.vpcsOptions[0].vpcId,
            "bandwidth":100,
            "assignedEipSet":[],
            "autoAllocEipNum":""
        };
        queryNatPrice(scope.natForm.maxConcurrent);

        scope.changeEipset = function(selectedEip){
            scope.autoAllocEip = _.include(selectedEip,"default");
            scope.autoAllocEipNumOptions = getContinueNum(1,10-self.EipOptions.length+1);
            scope.natForm.autoAllocEipNum = _.include(selectedEip,"default")?scope.natForm.autoAllocEipNum:"";
        };

        createNatGatewayModal.opened.then(function(){
            self.priceIng = true;
            scope.submitted = false;
            scope.interacted = function(field) {
                if(field){
                    return scope.submitted || field.$dirty;
                }
            };
            scope.createNatConfirm = function(natGatewayModalForm){ //每个私有网络支持的nat网关数为3个,每个nat网关支持的弹性IP数为10个,每个腾讯云账户每个地域（region）配额20个弹性公网IP
                if(natGatewayModalForm.$valid ){
                    var params = angular.copy(scope.natForm);
                    params.assignedEipSet = _.remove(params.assignedEipSet,function(item){
                        return item != "default"
                    });
                    params.Region = scope.queryLimit.regionId;
                    createNatGatewayModal.close();
                    natGatewaySrv.createNatGateway({
                        "params":params
                    }).then(function(res){
                        if(res && res.code == 0){
                            initNatGatewayList();
                            var timer = $interval(function(){ 
                                natGatewaySrv.queryNatGatewayProductionStatus({
                                    "params":{
                                        "billId":res.billId
                                    }
                                }).then(function(res){
                                    self.natOperateStatus = res.data.status; //查询nat网关操作状态：0: 成功, 1:失败, 2:进行中
                                    if(self.natOperateStatus != 2){ //0 成功 1失败 2 进行中
                                        $interval.cancel(timer);  
                                        initNatGatewayList();
                                    }
                                });
                            },3000);
                        }
                    });
                }else{
                    scope.submitted = true;
                }
            };
        })
    };

    self.editNatModal = function(editData,type){
        var scope = self.$new();
        var editNatModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"editNatModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        scope.editNatForm = angular.copy(editData);
        scope.editType = type;

        switch(type){
            case "name":
            scope.editNatModal_title = "修改网关名称";
            break;
            case "maxConcurrent":
            scope.editNatModal_title = "修改网关类型";
            scope.currPrice = true;
            natGatewaySrv.queryNatPrice({
                "params":{
                    "maxConcurrent":editData.maxConcurrent
                }
            }).then(function(res){
                if(res && res.code == 0){
                    var natprice = res.price.device/100; //单位由分转化为元
                    scope.currentNatCost = natprice;
                    self.natCost = natprice;
                }
            }).finally(function(){
                scope.currPrice = false;
            });
            break;
            case "bandwidth":
            scope.editNatModal_title = "修改带宽上限";
            break;
        };

        scope.editNatConfirm = function(editNatModalForm){
            if(editNatModalForm.$valid){
                var params = {
                    //"Region":scope.queryLimit.regionId,
                    "natId":editData.natId,
                    "vpcId":editData.vpcId,
                    "natName":scope.editNatForm.natName,
                    "maxConcurrent":scope.editNatForm.maxConcurrent,
                    "bandwidth":scope.editNatForm.bandwidth
                };
                if(type == "maxConcurrent"){
                    natGatewaySrv.upgradeNatGateway({
                        "params":params
                    }).then(function(res){
                        if(res && res.code == 0){
                            var timer = $interval(function(){ 
                                natGatewaySrv.queryNatGatewayProductionStatus({
                                    "params":{
                                        "billId":res.billId
                                    }
                                }).then(function(res){
                                    self.natOperateStatus = res.data.status; //查询nat网关操作状态：0: 成功, 1:失败, 2:进行中
                                    if(self.natOperateStatus != 2){ //0 成功 1失败 2 进行中
                                        $interval.cancel(timer);  
                                        initNatGatewayList();
                                        getNatGatewayDetailData(editData.natId);
                                    }
                                });
                            },3000);
                            editNatModal.close();
                        }
                    });
                }else{
                    natGatewaySrv.editNatGateway({
                        "params":params
                    }).then(function(res){
                        if(res && res.code == 0){
                            initNatGatewayList();
                            if($routeParams.natId){
                                getNatGatewayDetailData(editData.natId);
                            }
                            editNatModal.close();
                        }
                    });
                }
            }else{
                scope.submitted = true;
            }
        };
    };

    self.deleteNatGateway = function(deleteData){
        if(deleteData.productionStatus!=0){  //创建中不可删除
            var content = {
                target: "deleteNatGateway",
                msg: "<span>确定删除该NAT网关？</span>",
                data:deleteData
            };
            self.$emit("delete", content);
        }
    };

    self.$on("deleteNatGateway",function(e,deleteData){
        natGatewaySrv.deleteNatGateway({
            "params":{
                //"Region":self.queryLimit.regionId,
                "natId":deleteData.natId, 
                "vpcId":deleteData.vpcId
            }
        }).then(function(res){
            //删除需要轮询
            if(res && res.code == 0){
                var taskStatusTimer = $interval(function(){
                     natGatewaySrv.queryTaskStatus({
                        "params":{
                            "taskId":res.taskId
                        }
                    }).then(function(res){
                        if(res.data.status != 2){  //任务的当前状态。0：成功，1：失败，2：进行中。
                            $interval.cancel(taskStatusTimer);
                            initNatGatewayList();
                        }
                    });
                },3000);
                deleteData.delLoading = true;
            }
        })
    });

    self.setNatgatewayDetail = function(nat){
        if(!nat.delLoading){
            $location.url("/vpc/natgateway?natId="+nat.natId);
        }
    };

    self.$watch(function () {
        return $routeParams.natId;
    }, function (natId) {
        self.animation = natId ? "animateIn" : "animateOut";
        if (natId) {
            self.basicInfoTab = true;
            self.bindEipTab = false;
            self.monitorTab = false;
            getNatGatewayDetailData(natId);
        }
    });

    self.choseNatDetailTab = function(tab){
        self.basicInfoTab = tab == "basic" ? true : false;
        self.bindEipTab = tab == "eip" ? true : false;
        self.monitorTab = tab == "monitor" ? true : false;
    };

    self.bindEip = function(editData){
        var scope = self.$new();
        var bindEipModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"bindEipModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            if(field){
                return scope.submitted || field.$dirty;
            }
        };

        scope.bindEipForm = {
            "assignedEipSet":[],
            "autoAllocEipNum":""
        };

        scope.changeEipset = function(selectedEip){
            scope.autoAllocEip = _.include(selectedEip,"default");
            scope.autoAllocEipNumOptions = getContinueNum(1,10-self.elasticIPList.length-self.EipOptions.length+1);
            scope.bindEipForm.autoAllocEipNum = _.include(selectedEip,"default")?scope.bindEipForm.autoAllocEipNum:"";
        };

        scope.bindEipConfirm = function(bindEipModalForm){
            if(bindEipModalForm.$valid){
                var _assignedEipSet = _.remove(angular.copy(scope.bindEipForm.assignedEipSet),function(item){
                    return item != "default"
                });
                var postData = {
                    //"Region":scope.queryLimit.regionId,
                    "natId":editData.natId,
                    "vpcId":editData.vpcId
                };
                if(_assignedEipSet.length > 0){
                    postData.assignedEipSet = _assignedEipSet; 
                }
                if(scope.bindEipForm.autoAllocEipNum != ""){
                    postData.autoAllocEipNum = scope.bindEipForm.autoAllocEipNum;
                }
                natGatewaySrv.bindEipNatGateway({
                    "params":postData
                }).then(function(res){
                    //需要轮询
                    if(res && res.code == 0){
                        var taskStatusTimer = $interval(function(){
                            natGatewaySrv.queryTaskStatus({
                                "params":{
                                    "taskId":res.taskId
                                }
                            }).then(function(res){
                                if(res.data.status != 2){  //任务的当前状态。0：成功，1：失败，2：进行中。
                                    $interval.cancel(taskStatusTimer);
                                    initNatGatewayList();
                                    getNatGatewayDetailData(editData.natId); 
                                    self.bindeipLoading = false;
                                }
                            });
                        },3000);
                        bindEipModal.close();
                        self.bindeipLoading = true;
                    }
                });
            }else{
                scope.submitted = true;
            }
        };
    };

    self.unbindElasticIp = function(data){
        if(!data.unbindEipTip){
            var content = {
                target: "unbindElasticIp",
                msg: "<span>确定解绑该公网IP？</span>",
                data:data
            };
            self.$emit("delete", content);
        }
    }; 

    self.$on("unbindElasticIp",function(e,data){
        data.showEipLoading = true;
        natGatewaySrv.unBindEipNatGateway({
            "params":{
                //"Region":self.queryLimit.regionId,
                "natId":data.natId, 
                "vpcId":data.vpcId,
                "assignedEipSet.0":data.eip
            }
        }).then(function(res){
            //需要轮询
            if(res && res.code == 0){
                var taskStatusTimer = $interval(function(){
                    natGatewaySrv.queryTaskStatus({
                        "params":{
                            "taskId":res.taskId
                        }
                    }).then(function(res){
                        if(res.data.status != 2){  //任务的当前状态。0：成功，1：失败，2：进行中。
                            $interval.cancel(taskStatusTimer);
                            initNatGatewayList();
                            getNatGatewayDetailData(data.natId); 
                        }
                    });
                },3000);
            }
        });
    });

}]);