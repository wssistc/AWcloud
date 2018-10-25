import "./floatipsSrv";
import "./routersSrv";

var floatipsModule = angular.module("floatipsModule", ["ngSanitize", "ngTable", "ngAnimate", "ui.bootstrap", "floatipsSrvModule", "routersSrvModule", "ui.select"]);

floatipsModule.controller("floatipsCtrl", ["$scope", "$rootScope", "NgTableParams", "floatipsSrv", "routersSrv", "checkedSrv", "checkQuotaSrv", "$uibModal", "$translate", "GLOBAL_CONFIG","commonFuncSrv",
    function($scope, $rootScope, NgTableParams, floatipsSrv, routersSrv, checkedSrv, checkQuotaSrv, $uibModal, $translate, GLOBAL_CONFIG,commonFuncSrv) {
        var self = $scope;
        // var checkedItems = [];
        self.headers = {
            "ipAddr": $translate.instant("aws.floatingIps.ipAddr"),
            "instanceName": $translate.instant("aws.floatingIps.resourceName"),
            "fixedIP": $translate.instant("aws.floatingIps.fixedIP"),
            "status": $translate.instant("aws.floatingIps.status"),
            "projectName": $translate.instant("aws.floatingIps.projectName"),
            "routerId": $translate.instant("aws.floatingIps.routerId"),
            "portId": $translate.instant("aws.floatingIps.portId"),
            "resourcePool": $translate.instant("aws.floatingIps.resourcePool")
        };
        //公网IP数据列表初始化
        var initFloatingIpTable = function() {
            self.globalSearchTerm = "";
            floatipsSrv.getFloatipsTableData().then(function(result) {
                result ? self.loadData = true : "";
                if (result && result.data) {
                    self.init_floatip_data(result.data);
                }
            });
        };
        initFloatingIpTable();

        self.init_floatip_data = function(data) {
            var floatips_data = _.map(data, function(item) {
                //处理返回的数据
                if (item.fixedIP) {
                    item.statu = "active"; //由于底层状态改变延迟，当已成功绑定云主机时，前端先手动将ip状态置为active
                    if (item.instanceName) {
                        item.instanceName = item.instanceName == "LOADBALANCER" ? $translate.instant("aws.floatingIps.loadBalance") : item.instanceName;
                    } else {
                        item.instanceName = $translate.instant("aws.floatingIps.loadBalance");
                    }
                } else {
                    item.statu = "down";
                    item.fixedIP = "";
                }
                if (item.instanceName == null) {
                    item.instanceName = "";
                }
                item._status = $translate.instant('aws.routers.status.' + item.statu);
                item.searchTerm = [item.ip, item.instanceName, item.fixedIP, item._status, item.poolName].join("\b");
                return item;
            });
            self.tableParams = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
            }, {
                counts: [],
                dataset: floatips_data
            });
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableParams.filter({
                   searchTerm : term
                });
            };
            checkedSrv.checkDo(self, floatips_data, "id");
        };
        //刷新公网IP列表
        self.refreshFloatIp = function() {
            initFloatingIpTable();
        };

        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            if (!value) {
                self.isDisabled = true;
                self.delisDisabled = true;
            }else if(value){
                if (value.length === 1) {
                    if (self.checkedItems[0].instanceName && self.checkedItems[0].fixedIP) {
                        self.canBind = false;
                        self.canUnbundling = true;
                    } else {
                        self.canBind = true;
                        self.canUnbundling = false;
                    }
                }else {
                    self.canBind = false;
                    self.canUnbundling = false;
                }
            }
        });

        //申请公网IP
        self.addFloatIp = function() {
            var scope = self.$new();
            var addFloatIpModal = $uibModal.open({
                animation: true,
                templateUrl: "addFloatipModal.html",
                scope: scope
            });
            getPrice()
            checkQuotaSrv.checkQuota(scope, "floatingip");
            
            scope = commonFuncSrv.setAssignIpFun(scope, "floatipForm","createfloatipForm","external");
            
            var addFloatipFunc = function(params) {
                floatipsSrv.addFloatipAction(params).success(function() {
                    initFloatingIpTable();
                });
            };

            scope.floatipConfirm = function() {
                var postfloatipParams = {
                    "pool_id": scope.floatipForm.selectedNet.id
                };
                if (scope.floatipForm.assignSub) {
                    postfloatipParams.subnet_id = scope.floatipForm.selectedSubnet.id;
                    if (scope.floatipForm.assignIP) {
                        postfloatipParams.floating_ip_address = scope.floatipForm.init_cidr.ip_0 + "." +
                            scope.floatipForm.init_cidr.ip_1 + "." +
                            scope.floatipForm.init_cidr.ip_2 + "." +
                            scope.floatipForm.init_cidr.ip_3;
                        delete postfloatipParams.subnet_id;
                        scope.setCheckValueFunc();
                    }
                }
                if (scope.field_form.createfloatipForm.$valid) {
                    scope.formSubmitted = true;
                    addFloatipFunc(postfloatipParams);
                    addFloatIpModal.close();
                } else {
                    scope.submitted = true;
                }
            };
            function getPrice(){
                if(!$rootScope.billingActive){
                    return ;
                }
                var postData ={
                    "region":localStorage.regionName?localStorage.regionName:"default",
                    "floatingIpCount":1
                }
                floatipsSrv.getPrice(postData).then(function(data){
                    if( data && data.data && !isNaN(data.data)){
                        self.showPrice = true;
                        self.price =data.data;
                        self.priceFix =  self.price.toFixed(2)
                        self.totalPrice = (self.price*30*24).toFixed(2)
                    }else{
                        self.showPrice = true;
                        self.price ="N/A";
                        self.priceFix =  "N/A";
                        self.totalPrice = "N/A"
                    }
                    
                })
            }
        };

        //绑定公网IP
        self.bindFloatingIp = function(editData) {
            var scope = self.$new();
            var bindFloatIpModal = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "bindIpModal.html",
                scope: scope
            });
            scope.submitted = false;
            scope.interacted = function(field) {
                return scope.submitted || field.$dirty;
            };
            editData = angular.copy(editData);
            floatipsSrv.getInstanceInfo(editData.projectId).then(function(res) {
                var instances_info = [];
                if (res && res.data) {
                    _.forEach(res.data, function(item) {
                        instances_info.push(angular.fromJson(item));
                    });
                    instances_info = instances_info.map(item => {
                        //item.instance_name = item.instance_name.split(":")[0] == "null"?$translate.instant("aws.floatingIps.loadBalance")+":"+item.instance_name.split(":")[1]:item.instance_name;
                        if (item.instance_name.split(":")[0] == "null") {
                            if (item.deviceOwner && item.deviceOwner.toLowerCase().indexOf("loadbalancer") > -1) {
                                item.instance_name = $translate.instant("aws.floatingIps.loadBalance") + ":" + item.instance_name.split(":")[1];
                            } else if(item.deviceOwner==""){
                                item.instance_name = $translate.instant("aws.floatingIps.ports") + ":" + item.instance_name.split(":")[1];
                            }else{
                                item.instance_name = item.deviceOwner + ":" + item.instance_name.split(":")[1];
                            }
                        }
                        return item;
                    })
                    scope.instances = {
                        options: instances_info,
                        selected: instances_info[0]
                    };
                    scope.bindFloatIpForm = {
                        selectedInstance: scope.instances.selected
                    };
                }
            });
            scope.confirmBind = function(data, formField) {
                if (formField.$valid) {
                    scope.formSubmitted = true;
                    let params = {
                        "floatingip_id": editData.id,
                        "port_id": data.selectedInstance.port_id
                    };
                    floatipsSrv.bindFloatipAction(params).then(function() {
                        initFloatingIpTable();
                    });
                    bindFloatIpModal.close();
                } else {
                    scope.submitted = true;
                }
            };
        };


        //编辑公网IP
        self.editFloatingIp = function(editData) {
            var scope = self.$new();
            var editFloatIpModal = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "editIpModal.html",
                scope: scope
            });
            scope.submitValid = false;

            scope.confirmedit = function(formField) {
                if (formField.$valid) {
                    editFloatIpModal.close();
                } else {
                    scope.submitValid = true;
                }
            };
        };
        //解绑公网IP
        self.unBindFloatip = function(editData) {
            var content = {
                target: "unBindFloatip",
                msg: "<span>" + $translate.instant("aws.floatingIps.del.unBindFloatIpMsg") + "</span>",
                data: editData
            };
            self.$emit("delete", content);
        };
        self.$on("unBindFloatip", function(e, data) {
            var params = {
                floatingip_id: data.id
            };
            floatipsSrv.unBindFloatipAction(params).then(function() {
                initFloatingIpTable();
            });
        });
        //删除公网IP
        self.deleteFloatip = function(checkedItems) {
            var inusd = false;
            var delmsg = "";
            checkedItems.map(item => {
                if (item.portId) {
                    inusd = true;
                }
            })
            inusd ? delmsg = "<span>" + $translate.instant("aws.floatingIps.del.confirmDelFloatingIpMsg") + "</span>" + "</br>" + "<span>" + $translate.instant("aws.floatingIps.del.delFloatingIpMsg") + "</span>" :
                delmsg = "<span>" + $translate.instant("aws.floatingIps.del.delFloatingIpMsg") + "</span>";
            var content = {
                target: "delFloatingIp",
                msg: delmsg,
                data: checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("delFloatingIp", function(e, data) {
            var del_obj_ids = [];
            _.forEach(data, function(item) {
                del_obj_ids.push(item.id);
            });
            var delParams = {
                floatingips_list: del_obj_ids
            };
            floatipsSrv.delFloatipAction(delParams).then(function() {
                initFloatingIpTable();
            });
        });
    }
]);