import "./instanceSrv";
var instancesModule = angular.module("instancesModule", ["ngSanitize", "ngTable", "ui.bootstrap","ui.bootstrap.tpls", "ui.select","instanceSrvModule"]);
instancesModule.controller("InstancesCtrl", ["$scope","NgTableParams","checkedSrv", "$uibModal","$location","instanceSrv","$rootScope","$interval","$translate","$routeParams","$filter","RegionID","resize","$timeout","$window",
    function($scope,NgTableParams,checkedSrv,$uibModal,$location,instanceSrv,$rootScope,$interval,$translate,$routeParams,$filter,RegionID,resize,$timeout,$window){
	var self = $scope;
    self.returnList=function(){
        self.showtip=false
        $location.url("/cvm/instances")
        self.getInstance();
        self.globalSearchTerm="";
    }
    self.options = {};
    self.regionList = instanceSrv.getRegionList();
    self.options.region = RegionID.Region();
    self.projectList = [{projectId:0,projectName:"默认项目"}];
    self.options.proselected = self.projectList[0];
	self.getInstance =function() {
        if($location.search().regionid){
            var regionid=$location.search().regionid;
            var regionidString="";
            if(regionid==1){
                regionidString="gz";
            }else if(regionid==4){
                regionidString="sh";
            }else if(regionid==5){
                regionidString="hk";
            }else if(regionid==6){
                regionidString="ca";
            }else if(regionid==7){
                regionidString="shjr";
            }else if(regionid==8){
                regionidString="bj";
            }
            self.options.region=regionidString;
            sessionStorage.setItem("RegionSession",regionidString);
        }
        var postData ={
            "Region": self.options.region,
            "limit":100,
            "projectId":0
        };
        if($routeParams.vpcId){
            postData.vpcId = $routeParams.vpcId;
        }
        if($routeParams.subnetId){
            postData.subnetId = $routeParams.subnetId;
        }
        $timeout(function(){
            instanceSrv.DescribeInstancesAll(postData).then(function(result) {
                if (result && result.instanceSet) {
                    successFunc(result.instanceSet);
                }
            });
        },500);
    }
    function searchEdit(data){
        data.map(function(item){
            item.status_t = $translate.instant('CN.instances.table.status.'+item.status);
            item.rootType_t =$translate.instant('CN.instances.table.rootType.'+item.diskInfo.rootType);
            item.cvmPayMode_t = $translate.instant('CN.instances.table.cvmPayMode.'+item.cvmPayMode);
            item.deadlineTime_t = $filter("date")(item.deadlineTime,"yyyy-MM-dd HH:mm:ss");
            item.createTime_t = $filter("date")(item.createTime,"yyyy-MM-dd HH:mm:ss");
            item.searchTerm = [item.unInstanceId,item.instanceName,item.status_t,item.zoneName,item.rootType_t,item.wanIpSet,item.lanIp,item.cvmPayMode_t,item.deadlineTime_t,item.createTime_t]
        })
        return data;
    }

    function successFunc(data) {
        //初始化表格
        //self.tabledata = data;
        self.tabledata = searchEdit(data)
        self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.tabledata});
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ searchTerm: term });
        };

        var tableId = "unInstanceId";
        checkedSrv.checkDo(self, self.tabledata, tableId,"tableParams");
        var idsArr=self.buildIds(data);
        if(idsArr.length){
            idsArr.map(item => {
                if(item.ids.length){
                    $window.vmInterFunc(item.status,item.ids,item.type);
                }
            })
        }
        if($location.search().vmid){
            self.showtip=true;
           self.globalSearchTerm=$location.search().vmid;
            self.applyGlobalSearch();
        }
    }
    //轮询
    /*function intervalFunc(v,ids,type){
        self.checkboxes.items = {};
        var region = self.options.region;
        var continuePost = $interval(function(){
            instanceSrv.getVmsPolling(region,ids).then(function(result){
                if(result && result.instanceSet && result.instanceSet.length){
                    //更新列表状态
                    var SatisfyCount = 0;
                    _.forEach(result.instanceSet,function(obj){
                        if(obj.status == v){
                            SatisfyCount+=1;
                        }
                        _.forEach(self.tabledata,function(val){
                            if(val.unInstanceId == obj.unInstanceId ){
                                val.status =  obj.status;
                                val.bandwidth = obj.bandwidth;
                                val.cpu = obj.cpu;
                                val.mem = obj.mem;
                                val.lanIp = obj.lanIp;
                                val.statusTR = $translate.instant("CN.instances.table.status."+val.status);
                                //创建中不允许点击详情
                                if(val.status == "3"){
                                   val.isbuilding = true
                                }else{
                                    val.isbuilding = false
                                }
                                searchEdit(self.tabledata);
                            }
                        })
                    })
                    
                    //停止轮询
                    if(SatisfyCount == ids.length){
                        $interval.cancel(continuePost);
                        continuePost = undefined;
                        //详情里面解绑ssh密钥
                        if(type=="detail"){
                            self.detail_param(self.detailInfo.unInstanceId);
                        }
                        //创建成功，手动配置安全组
                        if(type == "new"){
                            instanceSrv.UpdateInstanceAttributes({
                                Region:region,
                                instanceIds:ids
                            }).then(function(){

                            })
                        }
                    }
                }else if(result && result.instanceSet && result.instanceSet.length ==0){
                    //删除时更新列表
                    var data =angular.copy(self.tabledata);
                     _.remove(self.tabledata,function(val){
                        return (val.unInstanceId == ids[0]);
                    });
                    self.tableParams.reload();
                    $interval.cancel(continuePost);
                    continuePost = undefined;
                }
            });
        },5000)
    };*/
    $window.vmInterFunc = function(v,ids,type){
        var region = self.options.region;
        var flag=false;
        ids.map(item =>{
            self.checkboxes.items[item] = false;
        })

        var timer = $timeout(function(){
            instanceSrv.getVmsPolling(region,ids).then(function(result){
                if(result && result.instanceSet && result.instanceSet.length){
                    //更新列表状态
                    var SatisfyCount = 0;
                    _.forEach(result.instanceSet,function(obj){
                        if(obj.status == v){
                            SatisfyCount+=1;
                        }
                        _.forEach(self.tabledata,function(val){
                            if(val.unInstanceId == obj.unInstanceId ){
                                val.status =  obj.status;
                                val.bandwidth = obj.bandwidth;
                                val.cpu = obj.cpu;
                                val.mem = obj.mem;
                                val.lanIp = obj.lanIp;
                                val.statusTR = $translate.instant("CN.instances.table.status."+val.status);
                                //创建中不允许点击详情
                                if(val.status == "3"){
                                   val.isbuilding = true
                                }else{
                                    val.isbuilding = false
                                }
                                searchEdit(self.tabledata);
                            }
                        })
                    })
                    
                    //停止轮询
                    if(SatisfyCount == ids.length){
                       /* $interval.cancel(continuePost);
                        continuePost = undefined;*/
                        flag=true;
                        //详情里面解绑ssh密钥
                        if(type=="detail"){
                            self.detail_param(self.detailInfo.unInstanceId);
                        }
                        //创建成功，手动配置安全组
                        if(type == "new"){
                            instanceSrv.UpdateInstanceAttributes({
                                Region:region,
                                instanceIds:ids
                            }).then(function(){

                            })
                        }
                    }
                }else if(result && result.instanceSet && result.instanceSet.length ==0){
                    //删除时更新列表
                    var data =angular.copy(self.tabledata);
                     _.remove(self.tabledata,function(val){
                        return (val.unInstanceId == ids[0]);
                    });
                    self.tableParams.reload();
                    flag=true;
                   /* $interval.cancel(continuePost);
                    continuePost = undefined;*/
                }
            }).finally(function(){
                if(!flag){
                    $window.vmInterFunc(v,ids,type);
                }else{
                    $timeout.canel(timer);
                }
            })
        },5000)
    }
    //切换地域
    self.changeRegion = function(item = self.options.region){
        self.options.region = item;
        sessionStorage.setItem("RegionSession",item);
        self.tabledata =[];
        self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.tabledata});
        self.globalSearchTerm = "";
        self.getInstance();
    };
    //获取选中的id
    self.getIds = function(){
        var ids = [];
        self.checkedItems.map(item =>{
            ids.push(item.unInstanceId)
        })
        return ids;
    }
    //获取中间状态的所有Id
    self.buildIds = function(data){
        var buildIds = [];
        var resizeIds = [];
        var rebootIds = [];
        var bootIds = [];
        var shutoffIds = [];
        var repassIds = [];
        data.map(item =>{
            if(item.status == 3){
                buildIds.push(item.unInstanceId)
            }
            if(item.status == 20){
                resizeIds.push(item.unInstanceId)
            }
            if(item.status == 7){
                rebootIds.push(item.unInstanceId)
            }
            if(item.status == 8){
                bootIds.push(item.unInstanceId)
            }
            if(item.status == 9){
                shutoffIds.push(item.unInstanceId)
            }
            if(item.status == 10){
                repassIds.push(item.unInstanceId)
            }
            
        })
        return [
            {
                status:2,
                ids:buildIds,
                type:"new"
            },
            {
                status:4,
                ids:resizeIds
            },{
                status:2,
                ids:rebootIds
            },
            {
                status:2,
                ids:bootIds
            },{
                status:4,
                ids:shutoffIds
            },{
                status:4,
                ids:repassIds
            }
        ]
    };
    //配置安全组
    self.loadsg = function(ins,type){
        var scope = $rootScope.$new();
        var modalInstance =  $uibModal.open({
           animation: $scope.animationsEnabled,
           templateUrl: "loadsg.html",
           scope:scope
        });
         var postData = {
            "Region":self.options.region,
            "projectId":0
        }
        var sgIds =[];
        scope.checkedItems = ins;
        scope.sec = ins[0];
        scope.checkboxes ={};
        scope.checkboxesDis ={};

        instanceSrv.getVmsInfo(self.options.region,scope.sec.unInstanceId).then(function(result){
            scope.detailInfo = result.instanceSet[0];
            instanceSrv.getSecurityGroups(postData).then(function(result){
                scope.secGroups = result.data;
                scope.secGroups.map(item => {
                    scope.detailInfo.sgInfo.map(val => {
                        if(val == item.sgId){
                            scope.checkboxes[item.sgId] = true;
                        }
                    })
                })
            })
        })
        scope.$watch(function() {
            return scope.checkboxes;
        }, function() {
            sgIds =[];
            angular.forEach(scope.secGroups, function(item) {
                if(scope.checkboxes[item.sgId]){
                    sgIds.push(item.sgId)
                }
            });
            if(sgIds.length == 1){
                scope.checkboxesDis[sgIds[0]] = true;
            }else{
                sgIds.map(item =>{
                    scope.checkboxesDis[item] = false;
                })
            }     
        }, true)        
        scope.confirmLoadsg = function(){
            var postData = {
                "instanceSet":{[scope.sec.unInstanceId]:sgIds},
                "Region":self.options.region
            };
            confirmLoadsgsrv(ins,type,postData);
            modalInstance.close()
        }
    }
    function confirmLoadsgsrv(ins,type,postData){
        instanceSrv.ModifySecurityGroupsOfInstance(postData).then(function(){
            if(type == "info"){
                instanceSrv.getVmsInfo(self.options.region,ins[0].unInstanceId).then(function(result){
                    if(result && !result.code){
                        self.detailInfo = result.instanceSet[0];
                        self.detail_sg(self.detailInfo);
                    }
                })
            }
           
        })
    }
    /*    云主机详情    */
    //切换到参数tab
    self.detail_param = function(value,tab){
        self.sg_tab = false;
        if(!tab){
            self.param_tab = false;
            instanceSrv.getVmsInfo(self.options.region,value).then(function(result){
                if(result && result.code==0){
                    self.param_tab = true;
                    self.detailInfo = result.instanceSet[0];
                }
            })
        }else{
            self.param_tab = true;
        }
        //self.detailInfo =[];
        
    }
    //解绑ssh密钥
    self.unbindsshkey = function(item){
        if(self.detailInfo.status == 4){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "unbindsshkey.html",
               scope:scope
            }); 
            var postData = {
                "Region":self.options.region,
                "instanceId": self.detailInfo.unInstanceId,
                "keypairList": [item.keyId]
            };
            scope.confirmunbindsshkey = function(){
                instanceSrv.UnBindInstanceKey(postData).then(function(result){
                    if(result && !result.code){
                        $window.vmInterFunc(self.detailInfo.status,[self.detailInfo.unInstanceId],"detail")
                    }
                })
                modalInstance.close();
            }
        }
        
    }
    //切换安全组
    self.detail_sg = function(info){
        if(info.sgInfo){
            self.sg_tab = true
            self.param_tab = false; 
            self.gress_tab = "ingress";
            self.detail_ingress = {};
            self.detail_egress = {};
            var postData ={
                Region:self.options.region,
                instanceIds:[info.unInstanceId]
            }
            instanceSrv.DescribeSecurityGroupsOfInstance(postData).then(function(res){
                if(res && res.code == 0){
                    self.detailsgs_init = angular.copy(res.data[0].sgInfo);
                    self.detailsgs = res.data[0].sgInfo;
                }
            })
            info.sgInfo.map(val =>{
                instanceSrv.DescribeSecurityGroupPolicy({
                    Region:self.options.region,
                    sgId:val
                }).then(function(res){
                    if(res && !res.code){
                        res.data.ingress.map(item => {
                            if(!item.ipProtocol){
                                item.ipProtocol = "All traffic";
                                if(!item.portRange){
                                    item.portRange = "All"
                                }
                            }else{
                                if(!item.portRange){
                                    item.portRange = "-"
                                }
                            }
                            if(!item.cidrIp && !item.sgId){
                                item.cidrIp = "0.0.0.0/0"
                            }

                        })
                        res.data.egress.map(item => {
                            if(!item.ipProtocol){
                                 item.ipProtocol = "All traffic";
                                 if(!item.portRange){
                                     item.portRange = "All"
                                 }
                            }else{
                                if(!item.portRange){
                                    item.portRange = "-"
                                }
                            }
                             if(!item.cidrIp && !item.sgId){
                                 item.cidrIp = "0.0.0.0/0"
                             }
                         })
                        self.detail_ingress[val] = res.data.ingress;
                        self.detail_egress[val] = res.data.egress;
                    }

                })
            })
        }
    };
    
    var swapItems = function(arr, index1, index2) {
            arr[index1] = arr.splice(index2, 1, arr[index1])[0];
            return arr;
    };
     
    // 上移
    self.upRecord = function(arr, $index) {
        if($index == 0) {
            return;
        }
        swapItems(arr, $index, $index - 1);
    };
     
    // 下移
    self.downRecord = function(arr, $index) {
        if($index == arr.length -1) {
            return;
        }
        swapItems(arr, $index, $index + 1);
    };
    //删除
    self.rmsg = function(arr, $index){
        arr.splice($index, 1);
        return arr
    };
    //切换详情里面安全组的规则
    self.changegress = function(type){
        self.gress_tab = type;
    };
    //确认详情里面编辑安全组
    self.confirmInfoSg = function(ins,detailsgs){
        var sgIds = [];
        detailsgs.map(item => {
            sgIds.push(item.sgId);
        })
        var postData = {
            "instanceSet":{[ins[0].unInstanceId]:sgIds},
            "Region":self.options.region
        };
         confirmLoadsgsrv(ins,"info",postData);
        /*instanceSrv.ModifySecurityGroupsOfInstance(postData).then(function(){
           
        })*/
    }
    //取消详情里面编辑安全组
    self.cancelInfoSg = function() {
        self.detailsgs = angular.copy(self.detailsgs_init);
    }
    //获取云主机详情
    $scope.$on("getDetail", function(event, value) {
       self.detail_param(value)
    });
    //不同状态下某些按钮的可操作性
    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        if(value){
            var activeChk = 0,stopChk = 0,errorChk = 0,flowPay = 0,byTraffic=0,byBandwidth = 0;
            self.boot_btn = true;
            self.shutoff_btn = true;
            self.reboot_btn = true;
            self.rename_btn = true;
            self.repass_btn = true;
            self.destory_btn = true;
            self.keypair_btn = true;
            self.net_btn = true;
            self.mkImg_btn = true;
            self.resize_btn = true;
            self.resystem_btn = true;
            self.loadsg_btn = true;
            value.map(function(item) {
                //故障状态的个数
                errorChk += (item.status === 1) || 0;
                //开机状态的个数
                activeChk += (item.status === 2) || 0;  
                //关机状态的个数
                stopChk += (item.status === 4 ) || 0; 
                //按量计费的个数
                flowPay += (item.cvmPayMode === 2 ) || 0;
                //宽带按宽带上线计费
                byBandwidth +=(item.networkPayMode ==1) || 0;
                //宽带按流量计费
                byTraffic +=(item.networkPayMode == 2) || 0
            });
            var values = [activeChk, stopChk, errorChk];
            //不同种状态操作
            /*if(stopChk + activeChk > 0){
                 self.repass_btn = false;
            }*/

            if(value.length !=0){
                if(value.length > 1){
                    self.resizetip ="调整配置不允许批量操作";
                    self.repasstip ="重装系统不允许批量操作";
                }
                //同种状态操作
                if (values[0] == value.length) { 
                    //开机可操作
                    self.shutoff_btn = false;
                    self.reboot_btn = false;
                    if (values[0] == 1) {
                        //单选操作 
                        self.resizetip ="调整配置必须在关机状态下进行";
                        self.repasstip = "重置密码必须在关机状态下进行"
                        self.rename_btn = false;
                        self.net_btn = false;
                        self.loadsg_btn = false
                        self.destory_btn = false;
                        self.resystem_btn = false;
                    } 
                } else if (values[1] == value.length) {
                    //关机允许的操作
                    self.boot_btn = false;
                    self.keypair_btn = false;
                    if (values[1] == 1) { 
                        //单选操作
                        self.repass_btn = false;
                        self.rename_btn = false;
                        self.net_btn = false;
                        self.mkImg_btn = false;
                        self.resize_btn = false;
                        self.resystem_btn = false;
                        self.loadsg_btn = false;
                        self.destory_btn = false;
                    } 
                } else if (values[2] == value.length) {
                    //错误状态时允许操作
                    self.errorEnable = false; 
                } 
                if(value.length == 1){
                    //按量计费允许操作
                    if(flowPay>0 && flowPay == value.length ){
                        self.detory_btn = false; 
                    }
                    //调整配置
                    if(value[0].diskInfo.rootType == 2 ){
                        self.resize_btn = false;
                        //调整配置时必须关机
                        if(value[0].status != 4 ){
                             self.resizetip ="调整配置需要在关机状态下操作";
                             self.resize_btn = true;
                        }else if(value[0].status != 4 ){
                            self.resize_btn = false;
                        }
                    }else{
                        self.resize_btn = true; 
                        self.resizetip ="系统盘和数据盘均为云盘才可以调整配置";
                    }
                    //Windows不允许重装系统
                    if(value[0].os.indexOf("Xserver")>-1){
                        self.resystem_btn = true;
                    }
                }
                
                
            }
            
        }
    });
    //创建云主机
    self.addVm = function(){
        $location.path("/buy/instances")
    }
    //开机
    self.bootVms = function(){
        if(!self.boot_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "bootVm.html",
               scope:scope
            }); 
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            scope.confirmBoot = function(){
                var postData = {
                    "Region": self.options.region,
                    "instanceIds":self.getIds()
                };
                instanceSrv.bootVms(postData).then(function(result){
                    if(result && !result.code){
                        self.getInstance();
                    }
                })
                modalInstance.close();

            }
        }
        
    }
    //关机
    self.shutoffVms = function(){
        if(!self.shutoff_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "shutoffVm.html",
               scope:scope
            }); 
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            scope.confirmShutoff = function(){
                var postData = {
                    "Region": self.options.region,
                    "instanceIds":self.getIds(),
                    "forceStop": 0
                };
                instanceSrv.shutoffVms(postData).then(function(result){
                    if(result && !result.code){
                        //$window.vmInterFunc("4",self.getIds())
                        self.getInstance();
                    }
                })
                modalInstance.close();

            }
        }
        
    }
    //重启
    self.rebootVms = function(){
        if(!self.reboot_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "rebootVm.html",
               scope:scope
            }); 
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            scope.confirmReboot = function(){
                var postData = {
                    "Region": self.options.region,
                    "instanceIds":self.getIds()
                };
                instanceSrv.rebootVms(postData).then(function(result){
                    if(result && !result.code){
                        $window.vmInterFunc("2",self.getIds())
                    }
                })
                modalInstance.close();

            }
        }
        
    }
    //销毁
    self.destory = function(){
        if(!self.destory_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "destoryVm.html",
               scope:scope
            }); 
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            scope.confirmDestory = function(){
                var postData = {
                    "Region": self.options.region,
                    "instanceId":self.getIds()[0]
                };
                instanceSrv.destoryVms(postData).then(function(result){
                    if(result && !result.code){
                        $window.vmInterFunc("0",self.getIds())
                    }
                })
                modalInstance.close();

            }
        }
    }
    //改名
    self.rename = function(item,tbs){
        if(!self.rename_btn || tbs){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "rename.html",
               scope:scope
            }); 
            scope.editData = angular.copy(item);
            scope.submitInValid = false;
            scope.confirmRename = function(form){
                if(form.$valid){
                    var postData ={
                        "Region": self.options.region,
                        "instanceId": scope.editData.unInstanceId,
                        "instanceName": scope.editData.instanceName
                    }

                    instanceSrv.rename(postData).then(function(){
                        self.getInstance()
                    })
                    modalInstance.close();
                }else{
                    scope.submitInValid = true;
                }
                
            }
        }
        
    }
    //重置密码
    self.repassword = function(){
        if(!self.repass_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "repassword.html",
               scope:scope
            }); 
            scope.submitform = false;
            scope.pass = {};
            scope.userNameStyles = [{name:"系统默认",value:"root"},{name:"指定用户名",value:""}];
            scope.pass.userNameStyle = scope.userNameStyles[0];
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            if(scope.checkedItems[0].os.indexOf("Xserver")>-1){
                scope.passpattern = /^[0-9]+[a-zA-Z]+[^0-9a-zA-Z\s]+|[0-9]+[^0-9a-zA-Z\s]+[a-zA-Z]+|[a-zA-Z]+[0-9]+[^0-9a-zA-Z\s]+|[a-zA-Z]+[^0-9a-zA-Z\s]+[0-9]+|[^0-9a-zA-Z\s]+[a-zA-Z]+[0-9]+|[^0-9a-zA-Z\s]+[0-9]+[a-zA-Z]+\S*$/;
                scope.passminnum = 12;
                scope.passtip = $translate.instant('CN.errors.wspecial');
            }else{
                
            }
            scope.confirmRepassword = function(form){
                if(form.$valid){
                    var postData ={
                        "Region": self.options.region,
                        "instanceIds": self.getIds(),
                        "password": scope.pass.password
                    }
                    instanceSrv.repassword(postData).then(function(result){
                        if(result && !result.code){
                            $window.vmInterFunc("4",self.getIds())
                        }
                    })
                    modalInstance.close();
                }else{
                    scope.submitform = true;
                }
                
            }
        }
        
    };
    //加载密钥对
    self.loadKeypair=function(){
        if(!self.keypair_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "keypair.html",
               scope:scope
            }); 
            var postData = {
                "Region": self.options.region,
                "projectId": "",
                "keypairIds":[]
            }
            scope.submitform = false;
            scope.keypair = {};
            scope.checkboxes = {};
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            instanceSrv.getKeypairs(postData).then(function(result){
                if(result && result.data && result.data.sshSet){
                    scope.keypair.keypairsList = result.data.sshSet;
                }
            })
            scope.confirmLoadkeypair = function(form){
                /*var keyIds =[];
                 scope.keypair.keypairsList.map(kp =>{
                    if(scope.checkboxes[kp.keyId]){
                        keyIds.push(kp.keyId)
                    }
                 })*/
                if(scope.keypair.sshkeypair){
                    var postData = {
                        "Region": self.options.region,
                        "instanceList": self.getIds(),
                        "keypairList":[scope.keypair.sshkeypair]
                    }
                    instanceSrv.BindInstanceKey(postData).then(function(result){
                        if(result && !result.code){
                            //$window.vmInterFunc("",self.getIds())
                        }
                    })
                    modalInstance.close();
                }else{
                    scope.submitform = true;
                }   
            }
        }    
    };
    //获取价格
    function getPrice(scope,type,ins,bandwidth,cpu,mem){
        scope.priceIng = true;
        if(type == "net" && ins.networkPayMode == 2) return;
        var postData={};
        if(ins.cvmPayMode == "1" ){ //包年包月
            if(type=="conf"){
                postData = {
                    "Region": ins.Region,
                    "instanceType":4,
                    "cpu":cpu,
                    "mem": mem,
                    "storageType": ins.diskInfo.storageType,
                    "storageSize": ins.diskInfo.storageSize||0,
                    "instanceId":ins.unInstanceId,
                    "UpgradeStartTime":moment().format('YYYY-MM-DD'),
                    "UpgradeEndTime":moment(ins.deadlineTime).format('YYYY-MM-DD')
                };
                
            }else if(type =="net"){
                postData = {
                    "Region": ins.Region,
                    "instanceType":5,
                    "instanceId":ins.unInstanceId,
                    "startTime":moment().format('YYYY-MM-DD'),
                    "endTime":moment(ins.deadlineTimespan).format('YYYY-MM-DD'),
                    "bandwidth":bandwidth,
                    "bandwidthType":ins.networkPayMode == "2"?"PayByTraffic":"PayByBandwidth",
                };
            }
            instanceSrv.getPrice(postData).then(function(result){
                scope[type].adjustCvmPrice = result.price/100;
                scope[type].adjustbandwidthPrice = result.price/100;
                scope.priceIng = false;
            })
        }else if(ins.cvmPayMode =="2"){  //按量计费
            postData = {
                "Region": ins.Region,
                "cpu":cpu,
                "mem": mem,
                "imageId": ins.imageId,
                "imageType": ins.imageType == "公有镜像"?2:1,
                "bandwidth": bandwidth,
                "bandwidthType": ins.networkPayMode == "2"?"PayByTraffic":"PayByHour",
                "storageType": ins.diskInfo.storageType,
                "storageSize":ins.diskInfo.storageSize||0,
                "goodsNum":1
            };
            instanceSrv.getPriceHour(postData).then(function(result){
                scope[type].adjustCvmPrice = result.data.cvm.price;
                scope[type].adjustbandwidthPrice = result.data.bandwidth.price;
                scope[type].adjustbeforePrice = scope[type].adjustbeforePrice || result.data.bandwidth.price;
                //scope[type].adjustbeforeCvmPrice =scope[type].adjustbeforeCvmPrice ||  result.data.cvm.price;

                scope.priceIng = false;


            })
        }
    }
    //调整网络
    self.changeNet = function(){
        if(!self.net_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "net.html",
               scope:scope
            }); 
            var timer;
            scope.checkedItems = self.checkedItems;
            scope.net = scope.checkedItems[0];
            scope.slider={
                bandwidthValue:scope.net.bandwidth
            };
            $timeout(function(){
                scope.slider.options = {
                    floor: 1,
                    ceil: 100,
                    step:1,
                    ticksArray: [5, 20, 100]
                };
            }, 200);
            
            scope.submitform = false;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            };
            scope.startTime = moment().format('YYYY-MM-DD');
            self.$watch(function(){
                return scope.slider.bandwidthValue
            },function(value){
                if(value){
                    $timeout.cancel(timer);
                    timer = $timeout(function(){
                         getPrice(scope,"net",scope.net,scope.slider.bandwidthValue,scope.net.cpu,scope.net.mem)
                    },600); 
                }
            })
            scope.confirmChnagenet = function(){
                if(scope.net.cvmPayMode == "1"){ //包年包月
                    var postData = {
                        "Region":self.options.region, 
                        "instanceId":scope.net.unInstanceId,
                        "bandwidth":scope.slider.bandwidthValue,//升级后的带宽值(Mbps)。升级后的带宽不能小于当前带宽；带宽包用户可调整为65535，并且可以升高或者降低（0-65535）。[必填]
                    }
                    if(scope.net.networkPayMode == "1"){
                        postData.startTime = scope.net.startTimespan;
                        postData.endTime = scope.net.deadlineTimespan;
                    }else{
                        postData.startTime =  moment().format('YYYY-MM-DD');
                        postData.endTime =  moment(scope.net.deadlineTime).format('YYYY-MM-DD');
                    }
                    instanceSrv.UpdateInstanceBandwidth(postData).then(function(result){
                        if(result && !result.code){
                            $window.vmInterFunc(scope.net.status,self.getIds())
                        }
                    })
                }else if(scope.net.cvmPayMode == "2"){  //按量计费
                    var postData = {
                        "Region":self.options.region, 
                        "instanceId":scope.net.unInstanceId,
                        "bandwidth":scope.slider.bandwidthValue
                    }
                    instanceSrv.UpdateInstanceBandwidthHour(postData).then(function(result){
                        if(result && !result.code){
                            $window.vmInterFunc(scope.net.status,self.getIds())
                        }
                    })
                }
                modalInstance.close()
            }
        }      
    };
    //制作镜像
    self.mkImg=function(){
        if(!self.mkImg_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "mkImg.html",
               scope:scope
            }); 
            scope.submitform = false;
            scope.checkedItems = self.checkedItems;
            scope.image = {};
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            scope.confirmMkImg = function(field){
                if(field.$valid){
                    var postData ={
                        "Region":self.options.region,
                        "instanceId": self.checkedItems[0].unInstanceId,
                        "imageName":scope.image.name,
                        "imageDescription": scope.image.desc
                    };
                    instanceSrv.mkImg(postData).then(function(result){
                        if(result && !result.code){
                            $window.vmInterFunc("4",self.getIds())
                        }
                    })
                    modalInstance.close();

                }else{
                    scope.submitform = true;
                }

            }      
        }    
    };
    //调整配置
    self.resize = function(){
        if(!self.resize_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "resize.html",
               scope:scope
            }); 
            scope.submitform = false;
            scope.checkedItems = self.checkedItems;
            scope.conf = scope.checkedItems[0];
            scope.options ={
                cpu :scope.conf.cpu,
                mem:scope.conf.mem
            };
            var cpu_mem = {
                100002:{  //广州二区
                    "标准型S1":{
                        1:[1,2,4],
                        2:[2,4,8,12],
                        4:[4,8,12,16,24],
                        8:[8,12,24,32],
                        12:[12,24,28],
                        16:[16,32,48],
                        24:[56]
                    },
                    "高IO型I1":{
                        2:[4,8,16],
                        4:[8,16,32],
                        8:[16,24,32,40],
                        12:[24,36,48,60],
                        24:[120]
                    }
                },
                100003:{ //广州三区
                    "标准型S1":{
                        1:[1,2,4],
                        2:[2,4,8,12],
                        4:[4,8,12,16,24],
                        8:[8,12,24,32],
                        12:[12,24,28],
                        16:[16,32,48],
                        24:[24,48,56],
                        32:[64]
                    },
                    "高IO型I1":{
                        2:[4,8,16],
                        4:[8,6,32],
                        8:[16,24,32,40],
                        12:[24,36,48,60],
                        16:[80],
                        24:[120],
                        32:[160],
                        48:[240]
                    },
                    "内存型M1":{
                        1:[8],
                        2:[16],
                        4:[32],
                        8:[64],
                        12:[96],
                        16:[128],
                        24:[192],
                        32:[256],
                        48:[368]
                    },
                    "标准型S2":{
                        1:[1,2,4],
                        2:[4,8],
                        4:[8,16],
                        8:[16,32],
                        12:[24,48],
                        16:[32,48],
                        24:[48,56],
                        32:[64,120]
                    },
                    "高IO型I2":{
                        2:[4,8,16],
                        4:[8,16,32],
                        8:[16,24,32],
                        12:[24,48],
                        16:[32,64],
                        24:[96],
                        32:[120]
                    },
                    "内存型M2":{
                        1:[8],
                        2:[16],
                        4:[32],
                        8:[64],
                        12:[96],
                        16:[128],
                        24:[192],
                        32:[256],
                        48:[384]
                    },
                    "计算型C2":{
                        4:[8,16,32],
                        8:[16,32],
                        16:[32,60],
                        32:[120]
                    }
                },
                200001:{  //上海一区
                    "标准型S1":{
                        1:[1,2,4],
                        2:[2,4,8,12],
                        4:[4,8,12,16,24],
                        8:[8,16,24,32],
                        12:[12,24,28],
                        16:[16,32,48],
                        24:[56],
                    },
                    "高IO型I1":{
                        2:[4,8,16],
                        4:[8,16,32],
                        8:[16,24,32,40],
                        12:[24,36,48,60],
                        24:[120]
                    },
                    "内存型M1":{
                        1:[8],
                        2:[16],
                        4:[32],
                        8:[64],
                        12:[96],
                        16:[128],
                        24:[192],
                        32:[256],
                        48:[368]
                    },
                    "标准型S2":{
                        1:[1,2,4],
                        2:[4,8],
                        4:[8,16],
                        8:[16,32],
                        12:[24,48],
                        16:[32,48],
                        24:[48,56],
                        32:[64,120]
                    },
                    "高IO型I2":{
                        2:[4,8,16],
                        4:[8,16,32],
                        8:[16,24,32],
                        12:[24,48],
                        16:[32,64],
                        24:[96],
                        32:[120]
                    },
                    "内存型M2":{
                        1:[8],
                        2:[16],
                        4:[32],
                        8:[64],
                        12:[96],
                        16:[128],
                        24:[192],
                        32:[256],
                        48:[384]
                    },
                    "计算型C2":{
                        4:[8,16,32],
                        8:[16,32],
                        16:[32,60],
                        32:[120]
                    }
                },
                800001:{  //北京一区
                    "标准型S1":{
                        1:[1,2,4],
                        2:[2,4,8,12],
                        4:[4,8,12,16,24],
                        8:[8,16,24,32],
                        12:[12,24,48],
                        16:[16,32,48],
                        24:[24,48,56],
                        32:[64]
                    },
                    "高IO型I1":{
                        2:[4,8,16],
                        4:[8,16,32],
                        8:[16,24,32,40],
                        12:[24,36,48,60],
                        16:[80],
                        24:[120],
                        32:[160],
                        48:[240]
                    },
                    "内存型M1":{
                        1:[8],
                        2:[16],
                        4:[32],
                        8:[64],
                        12:[96],
                        16:[128],
                        24:[192],
                        32:[256],
                        48:[368]
                    }
                }
              };
            scope.cpuModel = [{text:"1核",value:1},{text:"2核",value:2},{text:"4核",value:4},{ text:"8核",value:8},{ text:"12核",value:12},{ text:"16核",value:16},{ text:"24核",value:24},{ text:"32核",value:32},{ text:"48核",value:48}];
            scope.memModel = ((cpu_mem[scope.conf.zoneId])[scope.conf.cvmType])[scope.options.cpu];
           
            scope.cpuFlag=function(val){
                if(((cpu_mem[scope.conf.zoneId])[scope.conf.cvmType])[val]==undefined){
                    return false;
                }else{
                    return true;
                }
            };    
            if(scope.conf.cvmPayMode =="2"){ //获取初始价格
                instanceSrv.getPriceHour({
                    "Region": scope.conf.Region,
                    "cpu":scope.options.cpu,
                    "mem": scope.options.mem,
                    "imageId": scope.conf.imageId,
                    "imageType": scope.conf.imageType == "公有镜像"?2:1,
                    "bandwidth": scope.conf.bandwidth,
                    "bandwidthType": scope.conf.networkPayMode == "2"?"PayByTraffic":"PayByHour",
                    "storageType": scope.conf.diskInfo.storageType,
                    "storageSize":scope.conf.diskInfo.storageSize||0,
                    "goodsNum":1
                }).then(function(result){
                    scope.conf.adjustCvmPrice = result.data.cvm.price;
                    scope.conf.adjustbeforeCvmPrice = result.data.cvm.price;
                }).finally(function(){
                    scope.priceIng = false;
                });
            };
            scope.chooseMem = function(value = scope.options.mem){
                scope.priceIng = true;
                scope.options.mem = value;
                getPrice(scope,"conf",scope.conf,scope.conf.bandwidth,scope.options.cpu,scope.options.mem)
            };
            scope.chooseCpu = function(value = scope.options.cpu){
                scope.priceIng = true;
                scope.memModel= ((cpu_mem[scope.conf.zoneId])[scope.conf.cvmType])[value];
                scope.options.cpu = value;
                scope.chooseMem(scope.memModel[0])
            };
            //scope.chooseMem();
            
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            };
            scope.confirmResize = function(){
                if(scope.options.cpu !=scope.conf.cpu || scope.options.mem !=scope.conf.mem ){
                    if(scope.conf.cvmPayMode == "1"){ //包年包月
                        var postData = {
                            Region:self.options.region,
                            instanceId:scope.conf.unInstanceId,
                            cpu:scope.options.cpu,
                            mem:scope.options.mem,
                            UpgradeStartTime:moment().format('YYYY-MM-DD'),
                            UpgradeEndTime:moment(scope.conf.deadlineTime).format('YYYY-MM-DD'),
                            storageType:scope.conf.diskInfo.storageType,
                            storageSize:scope.conf.diskInfo.storageSize
                        }
                        instanceSrv.ResizeInstance(postData).then(function(result){
                            if(result && !result.code){
                                $window.vmInterFunc("4",self.getIds())
                            }
                        })
                    }else if(scope.conf.cvmPayMode == "2"){  //按量计费
                        var postData = {
                            Region:self.options.region,
                            instanceId:scope.conf.unInstanceId,
                            cpu:scope.options.cpu,
                            mem:scope.options.mem,
                            storageSize:scope.conf.diskInfo.storageSize
                        }
                        instanceSrv.ResizeInstanceHour(postData).then(function(result){
                            if(result && !result.code){
                                $window.vmInterFunc("4",self.getIds())
                            }
                        })
                    }
                    modalInstance.close()
                    
                }
            }
            
                  
        } 
    };
    //获取镜像
    function getImage(scope){
        var postData = {
            "Region":self.options.region,
            "imageType": scope.options.imageType ,// 镜像类型，1: 私有镜像 2: 公共镜像 3: 服务市场 4: 共享镜像
            "imageIds": [] 
        };
        instanceSrv.getImage(postData).then(function(result){
            if(result && result.imageSet){
                scope.osListAll = result.imageSet;
                scope.osList = result.imageSet.filter(item=> item.osName.indexOf("Xserver")<0);
                if(scope.options.imageType ==2 ){
                    scope.osList = getOs(scope);
                }
                scope.options.os = scope.osList[0];                
            }
        })
    };
    
    function getOs(scope,ostype = "CentOS"){
         return scope.osListAll.filter( os => os.imageName.indexOf(ostype)>-1);
    };
    //重装系统
    self.resystem = function(){
        if(!self.resystem_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "resystem.html",
               scope:scope
            }); 
            scope.submitform = false;
            scope.imageType = [{name:"当前镜像",value:0},{name:"私有镜像",value:1},{name:"公共镜像",value:2},{name:"服务市场",value:3}];
            scope.osType = ["CentoOS","Ubuntu"];
            scope.loginStyle = [{name:"设置密码",value:"1"}/*,{name:"SSH密钥",value:"2"}*/]
            scope.category =[
            {name:"基础环境",value:"BASIC_ENVIRONMENT"},
            {name:"全能环境",value:"UNIVERSAL_ENVIRONMENT"},
            {name:"管理与监控",value:"MANAGER_MONITOR"},
            {name:"建站模板",value:"WEBSITE_TEMPLATE"},
            {name:"安全高可用",value:"HIGH_AVAILABILITY_OF_SAFETY"},
            {name:"Docker容器",value:"DOCKER_CONTAINER"},
            {name:"业务管理",value:"BUSINESS_MANAGEMENT"}
            ];
            scope.options ={
                imageType:scope.imageType[0].value,
                osType :scope.osType[0],
                loginStyle:scope.loginStyle[0].value
            };
            scope.system = self.checkedItems[0];
            scope.options.os ={
                osName:scope.system.os
            };
            scope.slider = {
                rootSizeValue:scope.system.diskInfo.rootSize,
                options: {
                    floor: scope.system.diskInfo.rootSize,
                    ceil: 50,
                    step:10,
                    ticksArray: [20, 35, 50]
                }
            };
            scope.chooseImgType = function(item){
                scope.options.imageType = item;
                if(item == 2 || item == 1){
                    getImage(scope);
                }else if(item == 3){
                    scope.options.osType= scope.category[0].value;
                    scope.chooseMosType(scope.options.osType);
                }
            };
            scope.chooseMosType = function(value){
                scope.options.osType = value;
                instanceSrv.DescribeMarketImages({
                    Region:self.options.region,
                    categoryId:value
                }).then(function(result){
                    if(result && !result.code){
                        scope.osListAll = result.imageSet;
                        scope.osList = result.imageSet.filter(item=>item.osType!="windows");
                        scope.options.os = scope.osList[0];
                        if(!scope.options.os){
                            scope.options.os = {
                                osName:""
                            }
                        } 
                    }
                })
            };
            scope.chooseosType = function(item){
                scope.options.osType = item;
                scope.osList = getOs(scope,item);
                scope.options.os = scope.osList[0];
                if(!scope.options.os){
                    scope.options.os = {
                        osName:""
                    }
                } 
            };
            scope.$watch(function(){
                return scope.options.os.osName
            },function(val){
                scope.options.password = "";
                scope.options.cfmPassword = "";
                if(val){
                    if(val.indexOf("Xserver")>-1){
                        scope.passpattern = /^[0-9]+[a-zA-Z]+[^0-9a-zA-Z\s]+|[0-9]+[^0-9a-zA-Z\s]+[a-zA-Z]+|[a-zA-Z]+[0-9]+[^0-9a-zA-Z\s]+|[a-zA-Z]+[^0-9a-zA-Z\s]+[0-9]+|[^0-9a-zA-Z\s]+[a-zA-Z]+[0-9]+|[^0-9a-zA-Z\s]+[0-9]+[a-zA-Z]+\S*$/;
                        scope.passminnum = 12;
                        scope.passtip = $translate.instant('CN.errors.wspecial');
                    }else{
                        scope.passpattern = /^[0-9]+[^0-9/\s]+|[a-zA-Z]+[^a-zA-Z/\s]+|[^0-9a-zA-Z\s]+[0-9a-zA-Z]+\S*$/;
                        scope.passminnum = 8;
                        scope.passtip = $translate.instant('CN.errors.lspecial');
                    }
                }
                
            });
            scope.chooseLoginStyle = function(item){
                scope.options.loginStyle = item;
            };
            scope.confirmResystem = function(field){
                if(field.$valid){
                    var postData = {
                        "Region":self.options.region,
                        "instanceId": scope.system.unInstanceId,  //云主机ID[必填]，除了必填都是可选
                        "password": scope.system.password,  //云主机密码
                        "needSecurityAgent": 1,  //安装安全Agent，0：不安装，1：安装，默认安装。
                        "needMonitorAgent": 1
                    }
                    if(scope.system.diskInfo.rootType == "1"){
                        //postData.rootSize = scope.system.diskInfo.rootSize;
                    }else if(scope.system.diskInfo.rootType == "2"){
                        if(scope.slider.rootSizeValue>scope.system.diskInfo.rootSize){
                            postData.rootSize = scope.slider.rootSizeValue;
                        }
                        if(scope.options.os && scope.options.os.osName.indexOf('Xserver')>-1){
                            postData.rootSize = 50;
                        }
                    }
                    if(scope.options.imageType == 0){
                        scope.imageType.map(item => {
                            if(item.name == "scope.system.imageType"){
                                postData.imageType = item.value;
                                postData.imageId = scope.system.unImgId;
                            }
                        })
                    }else if(scope.options.imageType !=0){
                        postData.imageType = scope.options.imageType;
                        postData.imageId = scope.options.os.unImgId;

                    }
                    instanceSrv.ResetInstances(postData).then(function(result){
                        if(result && !result.code){
                            $window.vmInterFunc("2",self.getIds())
                        }
                    })
                    modalInstance.close();
                }else{
                     scope.submitform = true;
                }

            }
        }
        
    }
    
    self.getInstance();	
    
    //instanceSrv.getToken();
}]);

