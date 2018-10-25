import "./instanceSrv";

var secGroupsModule = angular.module("secGroupsModule", ["ngSanitize", "ui.bootstrap.tpls", "ui.select"]);
secGroupsModule.controller("secGroupsCtrl", ["$scope","checkedSrv", "$uibModal","instanceSrv","$rootScope","$routeParams","$location","NgTableParams","RegionID",
    function($scope,checkedSrv,$uibModal,instanceSrv,$rootScope,$routeParams,$location,NgTableParams,RegionID){
        var self =$scope;
        self.options = {};
        self.regionList = instanceSrv.getRegionList();
        self.options.region = RegionID.Region();
        self.projectList = [{projectId:0,projectName:"默认项目"}];
        self.options.proselected = self.projectList[0];

        //获取安全组列表
        function getSecurityGroups(chkregion){
            self.tabledata =[];
            self.globalSearchTerm = "";
            var postData = {
                Region:self.options.region,
                projectId:self.options.proselected.projectId
            }
            instanceSrv.getSecurityGroups(postData).then(function(result){
                if(result && result.data){
                    self.secGroups = result.data;
                    successFunc(result.data)
                }
            })
        };
        function successFunc(data) {
            self.tabledata = data;
            self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset:self.tabledata});
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableParams.filter({ $: term });
            };
            checkedSrv.checkDo(self, self.tabledata, "sgId","tableParams");
        }
        self.changeRegion = function(item = self.options.region){
            self.options.region = item;
            sessionStorage.setItem("RegionSession",item);
            getSecurityGroups()
        };
        self.editRule = function(item,region){
            if(item.sys == 0){
                var url = "/cvm/securitygroup/"+item.sgId + "?type=edit";
                $location.url(url);
            }
        };
        //新建安全组
        self.addSecGroup = function(){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "addSecGroup.html",
               scope:scope
            });
            scope.submitform = false;
            scope.sec ={};
            scope.confirmAddSecGroup = function(filed){
                if(filed.$valid) {
                    var postData ={
                        "Region": self.options.region,
                        "sgName":scope.sec.sgName,
                        "sgRemark":scope.sec.sgRemark,
                        "projectId":self.options.proselected.projectId
                    };
                    instanceSrv.CreateSecurityGroup(postData).then(function(){
                        self.changeRegion()
                    })
                    modalInstance.close();
                }else {
                    scope.submitform = true;
                }
            }
        };
        //加入云主机
        self.joinvm = function(item){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
               animation: $scope.animationsEnabled,
               templateUrl: "joinvm.html",
               scope:scope
            });
            //获取云主机列表
            var postData_1 ={
                "Region": self.options.region,
                "projectId":0
            };
            var postData_2 ={
                "Region": self.options.region,
                "sgId":item.sgId
            };
            scope.vm={};
            scope.checkboxes = {
                checked: false,
                vms: {},
                chk:{}
            };
            //将选中的同步到右边的table
            scope.listChek = function(){
                if (scope.vm.allVm && scope.vm.allVm.length){
                    _.forEach(scope.vm.allVm, function(item) {
                        if (scope.checkboxes.vms[item.unInstanceId]) {
                            scope.vm.checkVms.push(item);
                        }
                    });
                } ;
            };
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
            //查询某一区域下的所有云主机
            instanceSrv.getVms(postData_1).then(function(result1) {
                if (result1 && result1.instanceSet && result1.instanceSet.length) {
                    //查询与安全组关联的云主机列表
                    instanceSrv.instancesOfSecurityGroup(postData_2).then(function(result2) {
                        if (result2 && result2.data) {
                            scope.vm.allVm = [];
                            result1.instanceSet.map(item1 =>{
                                var count = 0 
                                result2.data.map(item2 =>{
                                    if(item2.instanceId == item1.unInstanceId){
                                        count +=1;
                                    }
                                });
                                if(!count){
                                    scope.vm.allVm.push(item1)
                                }
                            })
                        }
                    });
                }
            });
            scope.confirmJoinvm = function(){
                var postDataArray = [];
                if(scope.vm.checkVms.length){
                    var insIds = [];
                    var postData = {};
                    scope.vm.checkVms.map(function(val){
                        postData[val.unInstanceId] = [item.sgId]
                    })
                    instanceSrv.ModifySecurityGroupsOfInstance({
                        "instanceSet":postData,
                        "Region":self.options.region
                    }).then(function(){
                        self.changeRegion()
                    })
                }
                modalInstance.close();
            };
        };
        //删除安全组
        self.deleteSecurityGroup = function(item){
            if(item.sys == 0){
                var scope = $rootScope.$new();
                if(item.deviceNum == 0){
                    var modalInstance =  $uibModal.open({
                       animation: $scope.animationsEnabled,
                       templateUrl: "delSecGroup.html",
                       scope:scope
                    });
                    var postData ={
                        "Region": self.options.region,
                        "sgId":item.sgId
                    };
                    scope.delSecGroup = function(){
                        instanceSrv.DeleteSecurityGroup(postData).then(function(){
                            self.changeRegion()
                        })
                        modalInstance.close();
                    }
                    
                }else{
                    scope.sg={};
                    scope.sg.sgId = item.sgId;
                    var modalInstance =  $uibModal.open({
                       animation: $scope.animationsEnabled,
                       templateUrl: "cannotDelSecGroup.html",
                       scope:scope
                    });
                }
            }
        }
        self.editName = function(item){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: "editsec.html",
                   scope:scope
                });
            scope.submitform = false;
            scope.sec=item;
            scope.confirmEditSec = function(field){
                if(field.$valid){
                    var postData ={
                        "Region":self.options.region,
                        "sgId":item.sgId,
                        "sgName":scope.sec.sgName,
                        "sgRemark":scope.sec.sgRemark,

                    }
                    instanceSrv.lbpriceModifySecurityGroupAttributes(postData).then(function(){
                        self.changeRegion()
                    })
                    modalInstance.close();
                }else{
                    scope.submitform = true;
                }
            }
        }
        self.clonesec = function(item){
            var scope = $rootScope.$new();
            var modalInstance =  $uibModal.open({
                   animation: $scope.animationsEnabled,
                   templateUrl: "clonesec.html",
                   scope:scope
                });
            scope.submitform = false;
            scope.sce = item;
            scope.options ={};
            scope.regionList = instanceSrv.getRegionList();
            scope.options.region = self.regionList[0];
            scope.projectList = self.projectList;
            scope.options.proselected = self.projectList[0];
            scope.changeRegion = function(item){
                scope.options.region = item;
            }
            
        }
        self.changeRegion()
    }]
);