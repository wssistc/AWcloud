/**
 * Created by Weike on 2016/6/13.
 */
import "./flavorsSrv";

angular.module("flavorsModule", ["ngSanitize", "ngRoute", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select", "flavorsSrvModule"])
    .controller("FlavorsCtrl", function($scope, $rootScope, $uibModal, $translate, $routeParams, NgTableParams, checkedSrv, projectDataSrv, flavorsSrv, GLOBAL_CONFIG,NOPROJECTMENU) {
        $scope.type = 'vmHost';
        $scope.search={
            vMHostSearchTerm:""
        };
        $scope.choseVhost = function() {
            $scope.loadData = "";
            $scope.type = 'vmHost';
            $scope.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
            initFlavorsTable()
        };
        $scope.chosePhyMac = function() {
            var self = $scope;
            $scope.type = 'phyMac';
            if(localStorage.installIronic==1){
                self.pluginSwitch=1;
            }else{
                self.pluginSwitch=2;
                return;
            }
            $scope.loadDataphyMac = "";
            $scope.PhyMacTableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
            initPhyMacTable()
        }
        var initFlavorsTable = function() {
            $scope.search.vMHostSearchTerm="";
            flavorsSrv.getFlavors()
                .then(function(result) {
                    result ? $scope.loadData = true : "";
                    if (result && result.data) {
                        flavorsSrv.flavorsTable = result.data;
                        result.data.forEach(function(item) {
                            item.ram = (item.ram / 1024).toFixed(1);
                            if (item.ram.split(".")[1] == "0") {
                                item.ram = item.ram.split(".")[0];
                            }
                            item.ram = Number(item.ram);
                            //系统预制的规格为云硬盘类型
                            if(item.local == null) item.local=false;
                        });
                        var flavorTableData = _.map(result.data, function(item) {
                            item.ispublic = item._public == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                            item.local_ts= $translate.instant("aws.system.flavor.src."+item.local);
                            item.searchTerm = [item.vcpus , item.name , item.ispublic , item.ram,item.local_ts].join('\b');
                            return item;
                        });
                        $scope.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: flavorTableData });
                        $scope.applyGlobalSearch = function(searchTerm) {
                            var term = searchTerm;
                            $scope.tableParams.filter({ searchTerm: term });
                        };
                        checkedSrv.checkDo($scope, flavorTableData, "id");
                    }

                });
        };
        //物理机列表数据获取
        var initPhyMacTable = function() {
            flavorsSrv.getPhyMacFlavors()
                .then(function(result) {
                    result ? $scope.loadDataphyMac = true : "";
                    if (result && result.data) {
                        flavorsSrv.flavorsTable = result.data;
                        result.data.forEach(function(item) {
                            item.ram = (item.ram / 1024).toFixed(1);
                            item.disk = item.disk ;
                            if (item.ram.split(".")[1] == "0") {
                                item.ram = item.ram.split(".")[0];
                            }
                            
                            item.ram = Number(item.ram);
                        });
                        var phyMacTableData = _.map(result.data, function(item) {
                            item.ispublic = item._public == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                            item.searchTerm = [item.vcpus , item.name , item.ispublic , item.ram,item.disk].join('\b');
                            return item;
                        });
                        $scope.PhyMacTableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: phyMacTableData });
                        $scope.applyGlobalSearch = function(searchTerm) {
                            var term = searchTerm;
                            $scope.PhyMacTableParams.filter({ searchTerm: term });
                        };
                        checkedSrv.checkDo($scope, phyMacTableData, "id", "PhyMacTableParams");
                    }

                });
        };
        initFlavorsTable();


        $scope.$watch(function() {
            return $scope.checkedItems;
        }, function(value) {
            if (value) {
                if (value.length == 1) {
                    value[0]._public == true ? $scope.isDisabled = true : $scope.isDisabled = false;
                } else {
                    $scope.isDisabled = true;
                }
            } else {
                $scope.isDisabled = true;
                $scope.delisDisabled = true;
            }
        });

        $scope.refreshFlavors = function(searchTerm) {
            $scope.search.vMHostSearchTerm="";
            $scope.search.phyHostSearchTerm="";
            if ($scope.type == "vmHost") {
                initFlavorsTable();
            } else {
                initPhyMacTable();
            }

        };
        $scope.createFlavor = function() {
            var templateUrl;
            if ($scope.type == "vmHost") {
                templateUrl="js/system/tmpl/newFlavor.html"
            } else {
                templateUrl="phyNewFlavor.html"
            }
            
            var newFlavorModel = $uibModal.open({
                animation: true,
                templateUrl: templateUrl,
                controller: "newFlavorCtrl",
                resolve:{
                    type:function(){
                        return $scope.type
                    },
                    refreshFlavors:function(){
                        return $scope.refreshFlavors
                    },
                    fromIns:function(){   //不是从云主机入口
                        return "";
                    }
                }
            });
            

        };

        $scope.deleteFlavor = function() {
            var msg;
            if ($scope.type == 'vmHost') {
                msg = $translate.instant("aws.system.aggregate.deleteFlavor")
            } else {
                msg = "您确定要删除所选物理机配置吗？"
            }
            var content = {
                target: "deleteFlavor",
                msg: "<span>" + msg + "</span>"
            };
            $scope.$emit("delete", content);
        };
        $scope.$on("deleteFlavor", function() {

            var flavorIds = [],
                flavorNames = [];
            _.each($scope.checkedItems, function(item) {
                flavorIds.push(item.id);
                flavorNames.push(item.name);
            });
            if ($scope.type == 'vmHost') {
                flavorsSrv.deleteFlavor({
                    "flavorIds": flavorIds,
                    "flavorNames": flavorNames
                }).then(function() {
                    $scope.refreshFlavors();
                });
            } else {
                flavorsSrv.deletePhyMacFlavors({
                    "flavorIds": flavorIds,
                    "flavorNames": flavorNames
                }).then(function() {
                    $scope.refreshFlavors();
                });
            }

        });
        //编辑功能  被屏蔽
        $scope.modifyFlavorAccess = function(editData) {
            var scope = $scope.$new();
            var modifyFlavorAccessModel = $uibModal.open({
                animation: true,
                templateUrl: "modifyFlavorAccess.html",
                scope: scope
            });

            scope.allTenants = {
                options: []
            };
            scope.selectedTenants = {
                tenantsIdList: []
            };
            var origenTenantsIdList = [];
            projectDataSrv.getProject().then(function(result) {
                if (result && result.data) {
                    _.each(result.data, function(item) {
                        if (item.name != "admin") {
                            scope.allTenants.options.push({ name: item.name, tenantId: item.projectUid });

                        }
                    });
                }
            });
            flavorsSrv.getFlavorAccess(editData.id).then(function(result) {
                if (result && result.data) {
                    _.each(result.data, function(item) {
                        scope.selectedTenants.tenantsIdList.push(item.tenantId);
                        origenTenantsIdList.push(item.tenantId);
                    });
                }
            });

            scope.confirmFlavorAccess = function() {
                var _deletedTenants = [],
                    _addedTenants = [];
                _addedTenants = _.difference(scope.selectedTenants.tenantsIdList, origenTenantsIdList);
                _deletedTenants = _.difference(origenTenantsIdList, scope.selectedTenants.tenantsIdList);

                if (_addedTenants.length > 0) {
                    flavorsSrv.addFlavorAccess(editData.id, { tenant_id: _addedTenants }).then(function() {
                        initFlavorsTable();
                    });
                    modifyFlavorAccessModel.close();
                }

                if (_deletedTenants.length > 0) {
                    flavorsSrv.removeFlavorAccess(editData.id, { tenant_id: _deletedTenants }).then(function() {
                        initFlavorsTable();
                    });
                    modifyFlavorAccessModel.close();
                }
            };

        };


        $scope.$watch(function() {
            return $routeParams;
        }, function(value) {
            $scope.animation = value.id ? "animateIn" : "animateOut";
            if (value.id) {
                $scope.$emit("flavorExtrasDetail", value);
            }
        }, true);
    })
    .controller("FlavorExtrasCtrl", function($scope, $rootScope, $uibModal, $translate, $routeParams, NgTableParams, checkedSrv, flavorsSrv, GLOBAL_CONFIG) {
        $scope.flavorExtrasData = [];
        var allFlavorExtraKeys;
        $rootScope.$on("flavorExtrasDetail", function(event, data) {
            $scope.flavorId = data.id;
            $scope.flavorType = data.type;
            if ($scope.flavorType == 'vmHost') {
                $scope.vmHostInput = true;
                //所有下拉列表
                allFlavorExtraKeys = {
                    // "quota:disk_read_bytes_sec": $translate.instant("aws.system.flavor.disk_read_bytes_sec"),
                    // "quota:disk_read_iops_sec": $translate.instant("aws.system.flavor.disk_read_iops_sec"),
                    // "quota:disk_write_bytes_sec": $translate.instant("aws.system.flavor.disk_write_bytes_sec"),
                    // "quota:disk_write_iops_sec": $translate.instant("aws.system.flavor.disk_write_iops_sec"),
                    //"quota:vif_inbound_average":$translate.instant("aws.system.flavor.vif_inbound_average"),
                    //"quota:vif_inbound_burst":$translate.instant("aws.system.flavor.vif_inbound_burst"),
                    //"quota:vif_inbound_peak":"",
                    //"quota:vif_outbound_average":$translate.instant("aws.system.flavor.vif_outbound_average"),
                    //"quota:vif_outbound_peak":"",
                    //"qutoa:vif_outbound_burst":$translate.instant("aws.system.flavor.vif_outbound_burst"),
                    "hw:cpu_sockets": "hw:cpu_sockets",
                    "hw:cpu_cores": "hw:cpu_cores",
                    "hw:cpu_threads": "hw:cpu_threads",
                    "resource:mem_max": "resource:mem_max",//最大内存（GB）
                    "resource:cpu_max": "resource:cpu_max",//最大CPU核数（个）
                    "hw:cpu_policy":"hw:cpu_policy",
                    "hw:cpu_thread_policy":"hw:cpu_thread_policy"
                };
            } else {
                $scope.vmHostInput = false;
                allFlavorExtraKeys = {
                    "cpu_arch": "CPU类型",
                    "capabilities:disk_label": "磁盘分区格式"
                }

            }
            _.forEach(flavorsSrv.flavorsTable, function(item) {
                if (item.id == $scope.flavorId) {
                    $scope.specifiedFlavor = angular.copy(item);
                }
            });
            $scope.getFlavorExtras();
            $scope.flavorExtrasTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
            }, { counts: [], dataset: [] });
        });

        // 初始化table
        $scope.getFlavorExtras = function() {
            if ($scope.flavorType == "vmHost") {
                flavorsSrv.getFlavorExtras($scope.flavorId).then(function(result) {
                    $scope.existedFlavorExtraKeys = Object.keys(result.data);
                    //重组返回的数据用于table的显示
                    $scope.flavorExtrasData = _.map(result.data, function(value, key) {
                        switch (key) {
                            case "resource:mem_max":
                                var memVal_gb = value / 1024
                                return {
                                    key: key,
                                    value: Math.ceil(memVal_gb) == memVal_gb ? memVal_gb : memVal_gb.toFixed(2),
                                    name: $translate.instant("aws.system.flavor.mem_max")
                                };
                                break;
                            case "resource:cpu_max":
                                return {
                                    key: key,
                                    value: value,
                                    name: $translate.instant("aws.system.flavor.cpu_max")
                                };
                                break;
                            case "hw:cpu_sockets":
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 颗数"
                                };
                                break;
                            case "hw:cpu_cores":
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 核数"
                                };
                                break;
                            case "hw:cpu_threads":
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 线程"
                                };
                                break;
                            case "hw:cpu_policy":
                                if(value=='dedicated'){
                                   return {
                                        key: key,
                                        value: value,
                                        name: "CPU 策略",
                                        "hw:cpu_thread_policy":result.data["hw:cpu_thread_policy"]
                                   };
                                }
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 策略"
                                };
                            break;
                            default:
                                return {
                                    key: key,
                                    value: value,
                                    name: allFlavorExtraKeys[key]
                                };
                                break;
                        }

                    });
                    $scope.initFlavorExtras();
                });
            } else {
                flavorsSrv.getPhymacFlavorExtras($scope.flavorId).then(function(result) {
                    $scope.existedFlavorExtraKeys = Object.keys(result.data);
                    $scope.flavorExtrasData = _.map(result.data, function(value, key) {
                        switch (key) {
                            case "resource:mem_max":
                                var memVal_gb = value / 1024
                                return {
                                    key: key,
                                    value: Math.ceil(memVal_gb) == memVal_gb ? memVal_gb : memVal_gb.toFixed(2),
                                    name: $translate.instant("aws.system.flavor.mem_max")
                                };
                                break;
                            case "resource:cpu_max":
                                return {
                                    key: key,
                                    value: value,
                                    name: $translate.instant("aws.system.flavor.cpu_max")
                                };
                                break;
                            case "hw:cpu_sockets":
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 颗数"
                                };
                                break;
                            case "hw:cpu_cores":
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 核数"
                                };
                                break;
                            case "hw:cpu_threads":
                                return {
                                    key: key,
                                    value: value,
                                    name: "CPU 线程"
                                };
                                break;
                            default:
                                return {
                                    key: key,
                                    value: value,
                                    name: allFlavorExtraKeys[key]
                                };
                                break;
                        }

                    });
                    $scope.initFlavorExtras();
                });
            }

        };
        
        // 初始化table
        $scope.initFlavorExtras = function() {
            $scope.$watch(function() {
                return $scope.flavorExtrasData;
            }, function(data) {
                $scope.flavorExtrasTable = new NgTableParams({
                    count: GLOBAL_CONFIG.PAGESIZE
                }, { counts: [], dataset: data });
            }, true);

            $scope.checkboxes = {
                checked: false,
                items: {}
            };
            $scope.$watch(function() {
                return $scope.flavorExtrasTable.page();
            }, function() {
                $scope.checkboxes.checked = false;
                $scope.checkboxes.items = {};
            });
            // watch for checking all checkboxes.
            $scope.$watch(function() {
                return $scope.checkboxes.checked;
            }, function(value) {
                angular.forEach($scope.flavorExtrasData, function(item) {
                    if (angular.isDefined(item.key)) {
                        $scope.checkboxes.items[item.key] = value;
                    }
                });
            });

            $scope.modifyDisabled = true;
            $scope.deleteDisabled = true;
            // watch for data checkboxes.
            $scope.$watch(function() {
                return $scope.checkboxes.items;
            }, function() {
                var checked = 0,
                    unchecked = 0,
                    total = $scope.flavorExtrasData.length;
                    $scope.checkedItems = [];
                angular.forEach($scope.flavorExtrasData, function(item) {
                    checked += ($scope.checkboxes.items[item.key]) || 0;
                    unchecked += (!$scope.checkboxes.items[item.key]) || 0;
                    if ($scope.checkboxes.items[item.key]) {
                        $scope.editData = angular.copy(item);
                        $scope.checkedItems.push(item);
                    }
                });
                if ((unchecked == 0) || (checked == 0)) {
                    if (total > 0) {
                        $scope.checkboxes.checked = (checked == total);
                    }
                }

                // determine the variable for `ng-disable`.
                if (checked === 1) {
                    $scope.modifyDisabled = false;
                    $scope.deleteDisabled = false;
                } else if (checked > 1) {
                    $scope.modifyDisabled = true;
                    $scope.deleteDisabled = false;
                } else {
                    $scope.modifyDisabled = true;
                    $scope.deleteDisabled = true;
                }

                // grayed checkbox which controls all checkboxes.
                angular.element(document.getElementById("select_all"))
                    .prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        };

        $scope.refreshFlavorExtras = function() {
            $scope.getFlavorExtras();
        };

        $scope.editFlavorExtra=function(editData){
             $scope.flavorExtrasModel = $uibModal.open({
                animation: true,
                templateUrl: "editFlavorExtras.html",
                controller:"editFlavorExtraCtrl",
                resolve:{
                    editData:function(){
                        return editData
                    },
                    context:function(){
                        return $scope
                    }
                }
            });
        };
        
        $scope.flavorExtra = function(type, editData) {
            var scope = $scope.$new();
            var flavorExtrasModel = $uibModal.open({
                animation: true,
                templateUrl: "flavorExtras.html",
                scope: scope
            });
            scope.cpu_policy_dedicated = [{
                name:"prefer",
                text:"Prefer：每个VCPU将尽可能的绑定到同一个物理CPU核的不同线程中。"
            },{
                name:"isolate",
                text:"Isolate：每个VCPU将绑定到不同的物理CPU核（core）上，并且独占这个CPU核。其他VCPU不能再放置到该物理CPU核上。"
            },{
                name:"require",
                text:"Require：每个VCPU绑定到同一CPU的不同线程上。"
            }];
            flavorExtrasModel.rendered.then(function() {
                scope.submitted = false;
                scope.interacted = function(field) {
                    return scope.submitted || field.$dirty;
                };
                scope.flavorExtraKeysList = [];
                var flavorExtraKeys = _.difference(Object.keys(allFlavorExtraKeys), $scope.existedFlavorExtraKeys);
                
                _.each(flavorExtraKeys, function(key) {
                    switch(key){
                        case "resource:mem_max":
                            scope.flavorExtraKeysList.push({
                                "key": key,
                                "name": $translate.instant("aws.system.flavor.mem_max")
                            })
                            break;
                        case "resource:cpu_max":
                            scope.flavorExtraKeysList.push({
                                key: key,
                                name: $translate.instant("aws.system.flavor.cpu_max")
                            })
                            break;
                        // default:
                        //     scope.flavorExtraKeysList.push({
                        //         "key": key,
                        //         "name": allFlavorExtraKeys[key]
                        //     })
                        //     break;
                    }
                });
                if( $scope.existedFlavorExtraKeys.indexOf("hw:cpu_policy")==-1){
                    scope.flavorExtraKeysList.push({
                        name:"CPU策略",
                        equal:"cpuPolicy"
                    })
                }
                if( $scope.existedFlavorExtraKeys.indexOf("hw:cpu_cores")==-1
                 ||  $scope.existedFlavorExtraKeys.indexOf("hw:cpu_sockets")==-1 
                 ||  $scope.existedFlavorExtraKeys.indexOf("hw:cpu_threads")==-1){
                    scope.flavorExtraKeysList.push({
                        name:"CPU拓扑",
                        equal:"cpuTopu"
                    })
                }

                scope.min_num = "";
                scope.max_num = "";

                scope.changeKey = function(data, type) {
                    if (type == "new") {
                        scope.flavorExtrasData = data;
                        scope.flavorExtrasData.value = "";
                        scope.flavorExtrasData.cpu_policy = "shared";
                    }
                    switch (data.key) {
                        case "hw:cpu_sockets":
                        case "hw:cpu_cores":
                        case "hw:cpu_threads":
                            scope.selecthw = true;
                            scope.mbTob = false;
                            scope.mbpsTobps = false;
                            scope.min_num = 1;
                            //scope.max_num = 1;

                            let tmpval = 1;
                            for (let i = 0; i < $scope.flavorExtrasData.length; i++) {
                                if ($scope.flavorExtrasData[i].key == "hw:cpu_sockets" || $scope.flavorExtrasData[i].key == "hw:cpu_cores" || $scope.flavorExtrasData[i].key == "hw:cpu_threads") {
                                    tmpval = tmpval * $scope.flavorExtrasData[i].value;
                                }
                            }
                            if (!$scope.specifiedFlavor) {
                                _.forEach(flavorsSrv.flavorsTable, function(item) {
                                    if (item.id == $scope.flavorId) {
                                        $scope.specifiedFlavor = angular.copy(item);
                                    }
                                });
                            }
                            if (type == "new") {
                                scope.max_num = Math.floor($scope.specifiedFlavor.vcpus / tmpval);
                            }
                            if (type == "edit") {
                                scope.max_num = Math.floor($scope.specifiedFlavor.vcpus / (tmpval / Number(editData.value)));
                            }
                            break;
                        case "quota:disk_read_bytes_sec": // 磁盘读取速度限制 字节/秒 
                        case "quota:disk_write_bytes_sec":
                            scope.min_num = 1;
                            scope.max_num = 2048 * 1024 * 1024; // 1MB = 1024*1024 B
                            scope.selecthw = false;
                            scope.mbTob = true;
                            scope.mbpsTobps = false;
                            break;
                        case "quota:disk_read_iops_sec":
                        case "quota:disk_write_iops_sec":
                            scope.min_num = 1;
                            scope.max_num = 10000;
                            scope.selecthw = false;
                            scope.mbTob = false;
                            scope.mbpsTobps = false;
                            break;
                        case "quota:vif_inbound_average": //1Mbps = 1024/8 KB/s 上限 10000Mbps
                        case "quota:vif_inbound_burst":
                        case "quota:vif_outbound_average":
                        case "qutoa:vif_outbound_burst":
                            scope.min_num = 1;
                            scope.max_num = 10000 * 1024 / 8;
                            scope.selecthw = false;
                            scope.mbTob = false;
                            scope.mbpsTobps = true;
                            break;
                        case "resource:cpu_max":
                            if (!$scope.specifiedFlavor) {
                                _.forEach(flavorsSrv.flavorsTable, function(item) {
                                    if (item.id == $scope.flavorId) {
                                        $scope.specifiedFlavor = angular.copy(item);
                                    }
                                });
                            }
                            scope.min_num = $scope.specifiedFlavor.vcpus;
                            scope.max_num = 240;
                            break;
                        case "resource:mem_max":
                            if (!$scope.specifiedFlavor) {
                                _.forEach(flavorsSrv.flavorsTable, function(item) {
                                    if (item.id == $scope.flavorId) {
                                        $scope.specifiedFlavor = angular.copy(item);
                                    }
                                });
                            }
                            scope.min_num = $scope.specifiedFlavor.ram;
                            scope.max_num = 4000; //GB
                            break;
                        case "cpu_arch":
                        case "capabilities:disk_label":
                    }
                };
                scope.$watch(function() {
                    return scope.flavorExtrasData.cpu_sockets + scope.flavorExtrasData.cpu_cores + scope.flavorExtrasData.cpu_threads;
                }, function() {
                    if (scope.flavorExtrasData.equal == "cpuTopu") {
                        scope.min_num = 1;
                        let cpu_sockets = scope.flavorExtrasData.cpu_sockets ? scope.flavorExtrasData.cpu_sockets : 1;
                        let cpu_cores = scope.flavorExtrasData.cpu_cores ? scope.flavorExtrasData.cpu_cores : 1;
                        let cpu_threads = scope.flavorExtrasData.cpu_threads ? scope.flavorExtrasData.cpu_threads : 1;
                        let tmpval = cpu_sockets * cpu_cores * cpu_threads;

                        if (!$scope.specifiedFlavor) {
                            _.forEach(flavorsSrv.flavorsTable, function(item) {
                                if (item.id == $scope.flavorId) {
                                    $scope.specifiedFlavor = angular.copy(item);
                                }
                            });
                        }
                        if (type == "new") {
                            scope.max_num = angular.copy($scope.specifiedFlavor.vcpus);
                            if ( cpu_sockets && cpu_cores && cpu_threads ) {
                                if (tmpval <= scope.max_num) {
                                    scope.invalidCPUTopuVal = false;
                                } else {
                                    scope.invalidCPUTopuVal = true;
                                }
                            }
                        }
                    }
                });

                if (type == "new") {
                    scope.editExtra = false;
                    //cpu策略专用的下拉列表
                    scope.cpuPolicy={};
                    scope.cpuPolicy.flavorExtrasSet_dedicated = scope.cpu_policy_dedicated[0];
                    //弹出框的标题
                    scope.flavorExtrasTitle = $scope.type == "vmHost" ? $translate.instant("aws.system.flavor.createFlavorExtra") : $translate.instant("aws.system.flavor.createPhyMacFlavorExtra");
                    //没有可选的设置项禁用button
                    if (scope.flavorExtraKeysList.length == 0) {
                        scope.emptyExtras = true;
                  
                    } else {
                        scope.emptyExtras = false;
                    }
                    scope.flavorExtrasData = scope.flavorExtraKeysList[0] ? scope.flavorExtraKeysList[0] : "",
                    scope.flavorExtrasData.cpu_policy = "shared";
                    scope.flavorExtraType = "new";
                    scope.changeKey(scope.flavorExtrasData, scope.flavorExtraType);
                    scope.confirmFlavorExtras = function(FlavorExtraForm) {
                        if (FlavorExtraForm.$valid) {
                            var flavorExtrasData = scope.flavorExtrasData;
                            //选择的是CPU拓扑
                            if(flavorExtrasData.equal == "cpuTopu"){
                                flavorExtrasData = [];
                                if(scope.flavorExtrasData.cpu_cores){
                                    flavorExtrasData.push({
                                        key:"hw:cpu_cores",
                                        value:scope.flavorExtrasData.cpu_cores
                                    })
                                }
                                if(scope.flavorExtrasData.cpu_sockets){
                                    flavorExtrasData.push({
                                        key:"hw:cpu_sockets",
                                        value:scope.flavorExtrasData.cpu_sockets
                                    })
                                }
                                if(scope.flavorExtrasData.cpu_threads){
                                    flavorExtrasData.push({
                                        key:"hw:cpu_threads",
                                        value:scope.flavorExtrasData.cpu_threads
                                    })
                                }
                            //选择的是CPU策略
                            }else if(flavorExtrasData.equal == "cpuPolicy"){
                                flavorExtrasData=[{
                                    key:"hw:cpu_policy",
                                    value:scope.flavorExtrasData.cpu_policy
                                }]
                                //选择的专用
                                if(scope.flavorExtrasData.cpu_policy == "dedicated"){
                                    flavorExtrasData.push({
                                        key:"hw:cpu_thread_policy",
                                        value:scope.cpuPolicy.flavorExtrasSet_dedicated.name
                                    })
                                }
                            }else{
                                //最大内存和最大cpu核数需要区分
                                if(flavorExtrasData.key=="resource:mem_max"){
                                    flavorExtrasData=[{
                                        key:scope.flavorExtrasData.key,
                                        value:scope.flavorExtrasData.value*1024
                                    }]
                                }else{
                                    flavorExtrasData=[{
                                        key:scope.flavorExtrasData.key,
                                        value:scope.flavorExtrasData.value
                                    }]
                                }
                                
                            }
                            if(!scope.invalidCPUTopuVal){
                                if ($scope.flavorType == 'vmHost') {
                                    flavorsSrv.createFlavorExtra($scope.flavorId, flavorExtrasData).then(function() {
                                        $scope.getFlavorExtras();
                                    });
                                } else {
                                    flavorsSrv.createPhymacFlavorExtra($scope.flavorId, flavorExtrasData).then(function() {
                                        $scope.getFlavorExtras();
                                    });
                                }
                                flavorExtrasModel.close();
                            }
                        } else {
                            scope.submitted = true;
                        }
                    };
                }
                if (type == "edit") {
                    scope.editExtra = true;
                    scope.flavorExtrasTitle = $scope.type == "vmHost" ? $translate.instant("aws.system.flavor.modifyFlavorExtra") : $translate.instant("aws.system.flavor.modifyPhyMacFlavorExtra");
                    scope.flavorExtrasData = angular.copy(editData);
                    scope.flavorExtraType = "edit";
                    scope.changeKey(scope.flavorExtrasData, scope.flavorExtraType);
                    scope.confirmFlavorExtras = function(FlavorExtraForm) {
                        var flavorExtrasData = scope.flavorExtrasData;
                        if (FlavorExtraForm.$valid) {
                            if ($scope.type == 'vmHost') {
                                if (flavorExtrasData.value !== editData.value) {
                                    if (flavorExtrasData.key == "resource:mem_max") {
                                        flavorExtrasData.value = flavorExtrasData.value * 1024; //页面限制的是GB，底层接受的是MB
                                    }
                                    flavorsSrv.deleteFlavorExtra($scope.flavorId, {
                                        key: [editData.key]
                                    }).then(function() {
                                        flavorsSrv.createFlavorExtra($scope.flavorId, {
                                            flavor_id: $scope.flavorId,
                                            key: editData.key,
                                            value: flavorExtrasData.value
                                        }).then(function() {
                                            $scope.getFlavorExtras();
                                        });
                                    });
                                }
                            } else {
                                flavorsSrv.editPhyMacFlavorExtra($scope.flavorId, {
                                    key: editData.key,
                                    value: flavorExtrasData.value
                                }).then(function() {
                                    $scope.getFlavorExtras();
                                });
                            }

                            flavorExtrasModel.close();
                        } else {
                            scope.submitted = true;
                        }
                    };

                }
            })
        };

        $scope.deleteFlavorExtra = function() {
            var content = {
                target: "deleteFlavorExtra",
                msg: "<span>" + $translate.instant("aws.system.aggregate.deleteFlavorExtra") + "</span>"
            };
            $scope.$emit("delete", content);
        };
        $scope.$on("deleteFlavorExtra", function() {
            var deleteFlavorExtra = { key: [] },
                checkboxItems = $scope.checkboxes.items;
            for (var key in checkboxItems) {
                if (checkboxItems[key] && key !== "undefined") {
                    //"hw:cpu_policy","hw:cpu_thread_policy"不可同时存在
                    if(key=='hw:cpu_policy'||key=='hw:cpu_thread_policy'){
                       deleteFlavorExtra.key=["hw:cpu_policy","hw:cpu_thread_policy"]
                    }else{
                       deleteFlavorExtra.key.push(key);
                    }
                    
                }
            }
            if ($scope.flavorType == 'vmHost') {
                flavorsSrv.deleteFlavorExtra($scope.flavorId, deleteFlavorExtra)
                    .then(function() {
                        $scope.getFlavorExtras();
                    });
            } else {
                flavorsSrv.deletePhymacFlavorExtra($scope.flavorId, deleteFlavorExtra)
                    .then(function() {
                        $scope.getFlavorExtras();
                    });
            }

        });
    })
    .directive("flavorExtras", function() {
        return {
            require: "?ngModel",
            restrict: "E",
            transclude: true,
            scope: {
                animation: "=",
                detailData: "="
            },
            template: "<div class= 'animateContent {{animation}} '>" +
                "<div class='detailInner'><ng-transclude></ng-transclude>" +
                "</div></div><div class='animate-backup'></div>"
        };
    })
    .controller("editFlavorExtraCtrl", ["$scope", "$rootScope", "$uibModal", "$translate", "$routeParams", "NgTableParams", "checkedSrv", "flavorsSrv", "GLOBAL_CONFIG","editData","context",function($scope, $rootScope, $uibModal, $translate, $routeParams, NgTableParams, checkedSrv, flavorsSrv, GLOBAL_CONFIG,editData,context) {
        var self=$scope;
        self.submitted=false;
        self.flavorExtrasData = angular.copy(editData);
        self.editFlavor={};
        self.cpu_policy_dedicated = [{
            name:"prefer",
            text:"Prefer：每个VCPU将尽可能的绑定到同一个物理CPU核的不同线程中。"
        },{
            name:"isolate",
            text:"Isolate：每个VCPU将到绑定到不同的物理CPU核（core）上，并且独占这个CPU核。其他VCPU不能再放置到该物理CPU核上。"
        },{
            name:"require",
            text:"Require：每个VCPU绑定到同一CPU的不同线程上。"
        }];
        //cpu策略为专用
        if(self.flavorExtrasData["hw:cpu_thread_policy"]){
           self.cpu_policy_dedicated.forEach(function(item){
               if(item.name==self.flavorExtrasData["hw:cpu_thread_policy"]){
                  self.editFlavor["hw:cpu_thread_policy"]=item;
               }
           });
        }else{
           self.editFlavor["hw:cpu_thread_policy"]=self.cpu_policy_dedicated[0]; 
        }
        _.forEach(flavorsSrv.flavorsTable, function(item) {
            if (item.id == context.flavorId) {
                $scope.specifiedFlavor = angular.copy(item);
            }
        });
        self.interacted = function(field,form) {
            return self.submitted || field.$dirty;
        };
        self.cpuPolicySelectList=["dedicated","shared"];
        self.threadPolicyList=["prefer","isolate","require"];
        self.flavorExtrasTitle=$translate.instant("aws.system.flavor.modifyFlavorExtra")
        self.changeKey = function(data, type) {
                    if (type == "new") {
                        self.flavorExtrasData = data;
                        self.flavorExtrasData.value = "";
                        self.flavorExtrasData.cpu_policy = "shared";
                    }
                    switch (data.key) {
                        case "hw:cpu_sockets":
                        case "hw:cpu_cores":
                        case "hw:cpu_threads":
                            self.selecthw = true;
                            self.mbTob = false;
                            self.mbpsTobps = false;
                            self.min_num = 1;
                            //scope.max_num = 1;

                            let tmpval = 1;
                            for (let i = 0; i < context.flavorExtrasData.length; i++) {
                                if (context.flavorExtrasData[i].key == "hw:cpu_sockets" || context.flavorExtrasData[i].key == "hw:cpu_cores" || context.flavorExtrasData[i].key == "hw:cpu_threads") {
                                    tmpval = tmpval * context.flavorExtrasData[i].value;
                                }
                            }
                            if (!$scope.specifiedFlavor) {
                                _.forEach(flavorsSrv.flavorsTable, function(item) {
                                    if (item.id == $scope.flavorId) {
                                        $scope.specifiedFlavor = angular.copy(item);
                                    }
                                });
                            }
                            if (type == "new") {
                                self.max_num = Math.floor($scope.specifiedFlavor.vcpus / tmpval);
                            }
                            if (type == "edit") {
                                self.max_num = Math.floor($scope.specifiedFlavor.vcpus / (tmpval / Number(editData.value)));
                            }
                            break;
                        case "quota:disk_read_bytes_sec": // 磁盘读取速度限制 字节/秒 
                        case "quota:disk_write_bytes_sec":
                            self.min_num = 1;
                            self.max_num = 2048 * 1024 * 1024; // 1MB = 1024*1024 B
                            self.selecthw = false;
                            self.mbTob = true;
                            self.mbpsTobps = false;
                            break;
                        case "quota:disk_read_iops_sec":
                        case "quota:disk_write_iops_sec":
                            self.min_num = 1;
                            self.max_num = 10000;
                            self.selecthw = false;
                            self.mbTob = false;
                            self.mbpsTobps = false;
                            break;
                        case "quota:vif_inbound_average": //1Mbps = 1024/8 KB/s 上限 10000Mbps
                        case "quota:vif_inbound_burst":
                        case "quota:vif_outbound_average":
                        case "qutoa:vif_outbound_burst":
                            self.min_num = 1;
                            self.max_num = 10000 * 1024 / 8;
                            self.selecthw = false;
                            self.mbTob = false;
                            self.mbpsTobps = true;
                            break;
                        case "resource:cpu_max":
                            if (!$scope.specifiedFlavor) {
                                _.forEach(flavorsSrv.flavorsTable, function(item) {
                                    if (item.id == context.flavorId) {
                                        $scope.specifiedFlavor = angular.copy(item);
                                    }
                                });
                            }
                            self.min_num = $scope.specifiedFlavor.vcpus;
                            self.max_num = 240;
                            break;
                        case "resource:mem_max":
                            if (!$scope.specifiedFlavor) {
                                _.forEach(flavorsSrv.flavorsTable, function(item) {
                                    if (item.id == context.flavorId) {
                                        $scope.specifiedFlavor = angular.copy(item);
                                    }
                                });
                            }
                            self.min_num = $scope.specifiedFlavor.ram;
                            self.max_num = 4000; //GB
                            break;
                        case "cpu_arch":
                        case "capabilities:disk_label":
                    }
                };
        self.changeKey(self.flavorExtrasData,"edit");
        self.confirmFlavorExtras=function(editFlavorExtraForm){
            if(editFlavorExtraForm.$valid){
                if (self.flavorExtrasData.key == "resource:mem_max") {
                    self.flavorExtrasData.value = self.flavorExtrasData.value * 1024; //页面限制的是GB，底层接受的是MB
                }
                context.flavorExtrasModel.close();
                if(self.flavorExtrasData.key=='hw:cpu_policy'&&self.flavorExtrasData.value == 'dedicated'){
                    flavorsSrv.deleteFlavorExtra(context.flavorId, {
                        key: [editData.key]
                    }).then(function() {
                        flavorsSrv.createFlavorExtra(context.flavorId, [
                          {
                            //flavor_id: context.flavorId,
                            key: editData.key,
                            value: self.flavorExtrasData.value
                          },{
                            key: "hw:cpu_thread_policy",
                            value: self.editFlavor['hw:cpu_thread_policy'].name
                          }
                        ]).then(function() {
                            context.getFlavorExtras();
                        });
                    });
                }else if(self.flavorExtrasData.key=='hw:cpu_policy'&&self.flavorExtrasData.value == 'shared'){
                    //从专用变化为共享
                    if(editData.value=='dedicated'){
                        flavorsSrv.deleteFlavorExtra(context.flavorId, {
                            key: [editData.key,"hw:cpu_thread_policy"]
                        }).then(function() {
                            flavorsSrv.createFlavorExtra(context.flavorId, [
                              {
                                //flavor_id: context.flavorId,
                                key: editData.key,
                                value: self.flavorExtrasData.value
                              }
                            ]).then(function() {
                                context.getFlavorExtras();
                            });
                        });
                    }else{
                    //从共享变化为共享
                        flavorsSrv.deleteFlavorExtra(context.flavorId, {
                            key: [editData.key]
                        }).then(function() {
                            flavorsSrv.createFlavorExtra(context.flavorId, [
                              {
                                //flavor_id: context.flavorId,
                                key: editData.key,
                                value: self.flavorExtrasData.value
                              }
                            ]).then(function() {
                                context.getFlavorExtras();
                            });
                        });
                    }
                    
                }else{
                   flavorsSrv.deleteFlavorExtra(context.flavorId, {
                        key: [editData.key]
                   }).then(function() {
                        flavorsSrv.createFlavorExtra(context.flavorId, [
                          {
                            //flavor_id: context.flavorId,
                            key: editData.key,
                            value: self.flavorExtrasData.value
                          }
                        ]).then(function() {
                            context.getFlavorExtras();
                        });
                    });
                }
            }else{
               self.submitted=true;
            }
        }
        
    }])
    .controller("newFlavorCtrl",["$scope", "$rootScope", "$uibModalInstance","flavorsSrv","refreshFlavors","type","fromIns",function(scope,$rootScope, $uibModalInstance,flavorsSrv,refreshFlavors,type,fromIns){
        scope.submitted = false;
        scope.fromIns = fromIns;
        scope.isPublic = {
            options: [
                { "name": "是", "value": true },
                { "name": "否", "value": false }
            ]
        };
        // if(localStorage.isCustom == "false"){
        //     scope.src = "local";
        // }else if(localStorage.isCustom == "true"){
        //     scope.src = "volume";
        // }
        // if( fromIns==true){
        //     scope.src = "local";
        // }else if(!angular.isString(fromIns) && fromIns==false){
        //     scope.src = "volume";
        //     scope.disableLocal = true;
        // }
        // scope.choseSrc = function(src){
        //     scope.src = src;
        // }
        scope.interacted = function(field, name) {
            scope.field_form = field;
            return scope.submitted || field[name].$dirty;
        };
        
        scope.newFlavorData = {
            name: "",
            vcpus: 1,
            ram: 1,
            is_public: true,
        };
        scope.ram_gb =1;

        scope.confirmNewFlavor = function(flavorData, flavorForm) {
            if (flavorForm.$valid) {
                if (type == 'vmHost') {
                    if(scope.ram_gb <= 16){
                        flavorData.ram_max = scope.ram_gb * 2 * 1024;
                    }
                    if(scope.ram_gb > 16 && scope.ram_gb <= 32){
                        flavorData.ram_max = 32 * 1024;
                    }
                    if(flavorData.vcpus <= 8){
                        flavorData.vcpus_max = flavorData.vcpus * 2;
                    }
                    if(flavorData.vcpus > 8 && flavorData.vcpus <= 16){
                        flavorData.vcpus_max = 16;
                    }
                    flavorData.ram = scope.ram_gb * 1024;
                    flavorsSrv.createFlavor(flavorData).then(function() {
                        refreshFlavors();
                    });
                    $uibModalInstance.close();
                } else {
                    flavorData.ram = scope.ram_gb * 1024;
                    flavorData.disk = flavorData.disk;
                    var data = flavorData;
                    flavorsSrv.createPhyMacFlavors(data).then(function() {
                        refreshFlavors();
                    });
                    $uibModalInstance.close();
                }
            } else {
                scope.submitted = true;
            }
        };
    }])