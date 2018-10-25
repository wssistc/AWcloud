import "./instanceSrv";
var instancesModule = angular.module("keypairsModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "ui.select","instanceSrvModule"]);
instancesModule.controller("keypairsCtrl", ["$scope","NgTableParams","checkedSrv", "$uibModal","$location","instanceSrv","$rootScope","$interval","$translate","$filter","$window","$timeout","FileSaver","Blob",
    function($scope,NgTableParams,checkedSrv,$uibModal,$location,instanceSrv,$rootScope,$interval,$translate,$filter,$window,$timeout,FileSaver,Blob){
	var self = $scope;
    self.detail ={};
    self.options ={};
    self.regionList = instanceSrv.getRegionList();
    self.projectList = [{projectId:0,projectName:"默认项目"}];
    self.options.proselected = self.projectList[0];
	self.getKeypairs =function() {
        var postData = {
            "Region": "gz", //只是必填参数，但会获取所有region的sshkey
            "projectId": 0,
            "keypairIds":[]
        }
        instanceSrv.getKeypairs(postData).then(function(result) {
            if (result && result.data && result.data.sshSet) {
                self.keypairList = result.data.sshSet.reverse();
                successFunc(self.keypairList);
            }
        });
    }
    function searchEdit(data){
        data.map(function(item){
            item.bindIps_s = item.bindIps.length;
            item.status_s = $translate.instant('CN.sshkey.table.status.'+item.status);
            item.createTime_t = $filter("date")(item.createTime,"yyyy-MM-dd HH:mm:ss");
            item.searchTerm =[item.keyId,item.keyName,item.bindIps_s,item.status_s,item.createTime_t];
        })
        return data;
    }
    function successFunc(data) {
        //初始化表格
        self.tabledata = data;
        self.tabledata = searchEdit(data)
        self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.tabledata});
        var tableId = "keyId";
        checkedSrv.checkDo(self, self.tabledata, tableId,"tableParams");
    }
    //搜索
    self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ searchTerm: term });
        };
    self.$watch(function() {
        return self.checkedItems;
    }, function(value) {
        if(value){
            self.delkp_btn = true;
            self.sig_btn = true;
            var binInsChk = 0;
            if(value.length){
                value.map(function(item) {
                    //有绑定云主机的密钥
                    binInsChk += (!item.bindIps.length) || 0;
                });
                if (binInsChk == value.length){
                    self.delkp_btn = false;
                }
                if(value.length ==1){
                    self.sig_btn = false;
                }
            }            
        }
    });
    //轮询
    /*function intervalFunc(ids,region){
        self.checkboxes.items = {};
        var continuePost = $interval(function(){
           instanceSrv.checkKeypairBindStatus({
               "Region": region, 
               "instanceIds": ids
           }).then(function(result){
               if(result && !result.code && !result.status){
                   $interval.cancel(continuePost);
                   continuePost = undefined;
                   modalInstance.close();
                   self.getKeypairs();
               }
           });
       },5000)
    };*/
    $window.keypairInterFunc = function(ids,region,type){
        var flag=false;
        var timer = $timeout(function(){
            instanceSrv.checkKeypairBindStatus({
                    "Region": region, 
                    "instanceIds": ids
            }).then(function(result){
                if(result && !result.code && !result.status){
                    flag = true;
                    if(type == "keypair"){
                        self.getKeypairs();
                    }else if(type == "vm"){
                        console.log("ddd")
                    }
                }
            }).finally(function(){
                if(!flag){
                    $window.keypairInterFunc(ids,region,type);
                }else{
                    $timeout.canel(timer);
                }
            })
        },5000)
    }
    //获取选中的id
    self.getIds = function(){
        var ids = [];
        self.checkedItems.map(item =>{
            ids.push(item.keyId)
        })
        return ids;
    }

    //创建sshkey
    self.addKeypair =function(){
        var scope = $rootScope.$new();
        var modalInstance =  $uibModal.open({
           animation: $scope.animationsEnabled,
           templateUrl: "addKeypair.html",
           scope:scope
        }); 
        scope.keypair ={};
        scope.keypair.ssh = "false";
        scope.submitform = false;
        scope.confirmAddkey = function(filed){
            if(filed.$valid){
                var postData ={
                    "Region":'bj',
                    "keyName":scope.keypair.name,
                    "projectId": 0
                };
                if(scope.keypair.ssh == "true"){
                    postData.pubKey = scope.keypair.pubKey;
                    instanceSrv.importKeyPair(postData).then(function(){
                        self.getKeypairs();
                    })
                }else{
                    instanceSrv.addKeypair(postData).then(function(result){
                        if(result && result.code == 0){
                            var pemData = new Blob(
                                [result.data.secretkey],
                                { type: "application/x-pem-file"}
                            );
                            FileSaver.saveAs(pemData, result.data.keyName + ".txt");

                        }
                        self.getKeypairs();
                    })
                }
                modalInstance.close()
            }else{
                scope.submitform = true;
            }
            
        }
    }
    //修改sshkey
    self.modifyKeypair =function(){
        if(!self.isDisabled){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "modifyKeypair.html",
               scope:scope
            }); 
            scope.keypair ={};
            scope.keypair.keyName =self.editData.keyName;
            scope.submitform = false;
            scope.confirmAddkey = function(filed){
                if(filed.$valid){
                    var postData ={
                        "Region":'bj',
                        "keyId":self.editData.keyId,
                        "keyName":scope.keypair.keyName,
                        "projectId": 0
                    };
                    
                    instanceSrv.modifyKeypair(postData).then(function(){
                        self.getKeypairs();
                    })
                    modalInstance.close()
                }else{
                    scope.submitform = true;
                }
                
            }
        }
    }

    //删除密钥
    self.deleteKeypair = function(){
        if(!self.delkp_btn){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "deleteKeypair.html",
               scope:scope
            }); 
            scope.submitInValid = false;
            scope.checkedItems = self.checkedItems;
            scope.showVm = function(){
                scope.show_vm = !scope.show_vm
            }
            scope.confirmDelete = function(){
                var postData ={
                    "Region": "bj",
                    "keypairIds": self.getIds(),
                    "projectId": 0
                }
                instanceSrv.deleteKeypair(postData).then(function(){
                    self.getKeypairs()
                })
                modalInstance.close();
                
            }
        }
    }
    //绑定解绑云主机
    self.bindVm = function(){
        if(!self.isDisabled){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "bindvm.html",
               scope:scope
            });
            scope.vm ={};
            scope.vm.regionList = instanceSrv.getRegionList();
            scope.vm.regionSelect = instanceSrv.getRegionList()[0];
            scope.disconfirm = false;
            scope.changeRegion = function(region){
                scope.checkboxes = {
                    checked: false,
                    vms: {},
                    chk:{}
                };
                scope.vm.allVm = [];
                //获取云主机列表
                var postData ={
                    "Region": scope.vm.regionSelect.region,
                    "projectId": 0
                };
                var postData_1 = {
                    "Region": scope.vm.regionSelect.region, 
                    "projectId": 0,
                    "keypairIds":[self.editData.keyId]
                }
                instanceSrv.getVms(postData).then(function(result) {
                    console.log(result)
                    if (result && result.instanceSet) {
                        scope.vm.allVm = result.instanceSet;
                        scope.vm.checkVmsBefore = [];
                        //非关机状态下不可操作 ，windows主机不支持绑定密钥
                        result.instanceSet.map(item => {
                            if(item.status != 4 || item.os.indexOf("Xserver")>-1){
                                scope.checkboxes.chk[item.unInstanceId] = true;
                            }else{
                                scope.checkboxes.chk[item.unInstanceId] = false;
                            }
                        })
                        //初始化所有云主机，勾中已经绑定的云主机
                        instanceSrv.getKeypairs(postData_1).then(function(res) {
                            if (res && res.data && res.data.sshSet) {
                                result.instanceSet.map(ins =>{
                                    res.data.sshSet[0].bindUnInstanceIds.map(item => {
                                        if(ins.unInstanceId == item){
                                            scope.checkboxes.vms[item] = true;
                                            scope.vm.checkVmsBefore.push(item)
                                        }
                                    })
                                })
                            }

                        });
                        
                        
                        scope.listChek();
                    }
                });
            };
            scope.changeRegion(scope.vm.regionSelect);

            //将选中的同步到右边的table
            scope.listChek = function(){
                if (scope.vm.allVm && scope.vm.allVm.length){
                    _.forEach(scope.vm.allVm, function(item) {
                        if (scope.checkboxes.vms[item.unInstanceId]) {
                            scope.vm.checkVms.push(item);
                        }
                    });
                } 
            }
            //监听左边的选中框
            scope.$watch(function() {
                return scope.checkboxes.vms;
            }, function() {
                scope.vm.checkVms = [];
                scope.listChek();
            }, true)
            //过滤移除的
            scope.rmVmItem = function(value){
                return scope.vm.checkVms.filter(item => item.unInstanceId != value.unInstanceId)
            }
            //移除后还原被选中的
            scope.rmVm = function(item){
                scope.checkboxes.vms[item.unInstanceId] = false;
                scope.vm.checkVms = scope.rmVmItem(item);
            }

            scope.confirmInsKey = function(){
                var bindList = [];
                scope.vm.checkVms.map(item => {
                    bindList.push(item.unInstanceId)
                })
                var postData = {
                    "Region":scope.vm.regionSelect.region,
                    "keyId": self.getIds()[0],
                    "bindListAfter": bindList,   
                    "bindListBefore": scope.vm.checkVmsBefore,
                    "projectId": 0
                };
                instanceSrv.manageInstanceKey(postData).then(function(result){
                    if(result && !result.code){
                        var ids = postData.bindListAfter.concat(postData.bindListBefore);
                        var region = scope.vm.regionSelect.region;
                        $window.keypairInterFunc(ids,region,"keypair");
                    }
                })
                modalInstance.close();
            }
        }
        

    };
    //获取密钥详情
    $scope.$on("getDetail", function(event, value) {
        self.detailTableData =[];
        self.detail.region = self.regionList[0];
        self.detail.detailKeyId = value;
        changeDetail(self.detail.detailKeyId)
    });
    //获取sshkey绑定的云主机
    function getInstance(insIds) {
        var postData ={
            "Region": self.detail.region.region,
            "instanceIds":insIds,
            "projectId": 0
        };
        instanceSrv.getVms(postData).then(function(result) {
            if (result && result.instanceSet) {
                self.detailTableData = result.instanceSet;
            }
        });
    }
    //切换详情里面的区域
    function changeDetail(value){
        var postData = {
            "Region": self.detail.region.region,
            "projectId": 0,
            "keypairIds":[value]
        };
        instanceSrv.getKeypairs(postData).then(function(result) {
            if (result && result.data && result.data.sshSet) {
                self.detailInfo = result.data.sshSet[0];
                if(self.detailInfo.bindUnInstanceIds.length){
                    getInstance(self.detailInfo.bindUnInstanceIds)
                }
            }
        });
        /*self.detail.region = item;
        if(self.detailInfo.bindUnInstanceIds.length){
            getInstance(self.detailInfo.bindUnInstanceIds)
        }*/
    }
    self.changeDetailRegion =function(item){
        self.detail.region = item;
        self.detailTableData = [];
        changeDetail(self.detail.detailKeyId)
    };
    self.unbindvm = function(item){
        if(item.status ==4){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "unbindvm.html",
               scope:scope
            }); 
            scope.confirmUnbind = function(){
                var postData ={
                    "Region": self.detail.region.region,
                    "instanceId":item.unInstanceId,
                    "keypairList":[self.detail.detailKeyId],
                    "projectId": 0
                };
                instanceSrv.UnBindInstanceKey(postData).then(function(){
                    self.changeDetailRegion(self.detail.region)
                })
                modalInstance.close();
                
            };
        }
    }
    

    //获取sshkey列表
    self.getKeypairs()
}]);