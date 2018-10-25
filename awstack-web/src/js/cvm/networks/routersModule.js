import "./routersSrv";

var routersModule = angular.module("routersModule", ["ngSanitize", "ngTable", "ngAnimate", "ui.bootstrap", "routersSrvModule", "ui.select", "ngMessages"]);

routersModule.controller("routersCtrl", ["$scope", "$rootScope", "$routeParams", "NgTableParams", "routersSrv", "checkedSrv", "commonFuncSrv", "$uibModal", "$translate", "GLOBAL_CONFIG","$location","TableCom","modalCom",
    function($scope, $rootScope, $routeParams, NgTableParams, routersSrv, checkedSrv, commonFuncSrv, $uibModal, $translate, GLOBAL_CONFIG,$location,TableCom,modalCom) {
        var self = $scope;
        self.headers = {
            "routerName": $translate.instant("aws.routers.routerName"),
            "extNetwork": $translate.instant("aws.routers.extNetwork"),
            "adminState": $translate.instant("aws.routers.adminState"),
            "status": $translate.instant("aws.routers.state"),
            "enableSnat": $translate.instant("aws.routers.enableSnat"),
            "projectName": $translate.instant("aws.routers.projectName"),
            "portName": $translate.instant("aws.routers.portName"),
            "portIp": $translate.instant("aws.routers.portIp"),
            "linkSubnet": $translate.instant("aws.routers.linkSubnet"),
            "deviceOwner": $translate.instant("aws.routers.deviceOwner"),
            "gatewayIp": $translate.instant("aws.routers.gatewayIp")
        };
        //路由器数据列表初始化
        var initRoutersTableData = function() {
            routersSrv.getRoutersTableData().then(function(result) {
                result ? self.loadData = true : "";
                if (result && result.data) {
                    self.init_router_data(result.data);
                }
            });
        };
        

        self.refreshRouter = function() {
            initRoutersTableData();
        };

        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.routersTable.filter({
                searchTerm: term
            });
        };
        function tableDataJoin(data){
            data.map(item=>{
                item._status = $translate.instant("aws.routers.status." + item.status.toString().toLowerCase());
                item._enableSnat = item.enableSnat == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                item.searchTerm = [item.name,item._status,item.network,item.gatewayIp,item._enableSnat].join("\b")
            })
            return data;
        }
        
        self.init_router_data = function(data) {
            var routers_data = tableDataJoin(data);
            self.routersTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE,
                sorting: {
                    router: "asc"
                }
            }, {
                counts: [],
                dataset: routers_data
            });

            self.routers_chkboxs = {
                checked: false,
                items: {}
            };

            self.$watch(function() {
                return self.routersTable.page();
            }, function() {
                self.routers_chkboxs.checked = false;
            });

            self.$watch(function() {
                return self.routers_chkboxs.checked;
            }, function(value) {
                angular.forEach(self.routersTable.data, function(item) {
                    if (!item.unChecked) {
                        self.routers_chkboxs.items[item.id] = value;
                    }
                });
            });

            self.$watch(function() {
                return self.routers_chkboxs.items;
            }, function() {
                //if (self.routersTable.data.length === 0) return;
                self.checkedRouterItems = [];
                var checked = 0,
                    unchecked = 0,
                    total = self.routersTable.data.length;

                angular.forEach(self.routersTable.data, function(item) {
                    checked += (self.routers_chkboxs.items[item.id]) || 0;
                    unchecked += (!self.routers_chkboxs.items[item.id]) || 0;
                    if (self.routers_chkboxs.items[item.id]) {
                        self.checkedRouterItems.push(item);
                        self.editRouterData = angular.copy(item);
                    }
                });

                if ((unchecked == 0) || (checked == 0)) {
                    if (total > 0) {
                        self.routers_chkboxs.checked = (checked == total);
                    }
                }
                if (checked === 1) {
                    self.canEdit = true;
                    self.canDel = true;
                    if (self.editRouterData.network && self.editRouterData.networkId) {
                        self.setGatewayBtn = false;
                        self.delGatewayBtn = true;
                    } else {
                        self.setGatewayBtn = true;
                        self.delGatewayBtn = false;
                    }
                } else if (checked > 1) {
                    self.canEdit = false;
                    self.canDel = true;
                    self.setGatewayBtn = false;
                    self.delGatewayBtn = false;
                } else {
                    self.canEdit = false;
                    self.canDel = false;
                    self.setGatewayBtn = false;
                    self.delGatewayBtn = false;
                }
                angular.element(".select-all-routersTable").prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        };
        //
        initRoutersTableData();
        //新建路由
        self.openRouterModel = function() {
            $rootScope.refreshRoutersTable = initRoutersTableData;
            $uibModal.open({
                animation: true,
                templateUrl: "js/commonModal/tmpl/routerModal.html",
                controller: "routerModelCtrl"
            });
        };

        //编辑路由
        self.editRouterModel = function(editdata) {
            var scope = self.$new();
            var editRouterModel = $uibModal.open({
                animation: true,
                templateUrl: "editRouterModel.html",
                scope: scope
            });
            let preName = angular.copy(editdata.name);
            scope.submitted = false;
            scope.routerForm = {
                name: editdata.name
            };
            scope.editConfirm = function(form) {
                if (form.$valid) {
                    scope.formInvalid = true;
                    editRouterModel.close();
                    if (preName != scope.routerForm.name) {
                        routersSrv.editRouterName({
                            "name": scope.routerForm.name,
                            "router_id": editdata.id
                        }).then(function() {
                            initRoutersTableData();
                        });
                    }
                } else {
                    scope.submitted = true;
                }
            };

        };

        //设置路由网关
        self.setGateway = function(editdata) {
            var scope = self.$new();
            var setGatewayModal = $uibModal.open({
                animation: true,
                templateUrl: "setGatewayModal.html",
                scope: scope
            });
            scope.extNetsPlaceholder = $translate.instant("aws.routers.placeholder.routerExtNet");

            scope = commonFuncSrv.setAssignIpFun(scope, "setGatewayForm","addGatewayForm","external");
            
            scope.field_form = {};
            scope.submitted = false;
            scope.interacted = function(field) {
                if (field) {
                    scope.field_form.addGatewayForm = field;
                    return scope.submitted || field.extnet.$dirty || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
                }
            };

            scope.setGatewayConfirm = function(form) {
                if (form.$valid) {
                    let params = {
                        "router_id": editdata.id,
                        "network_id": scope.setGatewayForm.selectedNet.id
                    };
                    if (scope.setGatewayForm.assignSub) {
                        params.external_fixed_ips = [];
                        let externalFixedIps = {};
                        externalFixedIps.subnet_id = scope.setGatewayForm.selectedSubnet.id;
                        if (scope.setGatewayForm.assignIP == true) {
                            let gatewayIp = scope.setGatewayForm.init_cidr.ip_0 + "." +
                                scope.setGatewayForm.init_cidr.ip_1 + "." +
                                scope.setGatewayForm.init_cidr.ip_2 + "." +
                                scope.setGatewayForm.init_cidr.ip_3;
                            externalFixedIps.ip_address = gatewayIp;
                            delete externalFixedIps.subnet_id;
                            scope.setCheckValueFunc();
                        }
                        params.external_fixed_ips.push(externalFixedIps);
                    }
                    if (scope.field_form.addGatewayForm.$valid) {
                        scope.formSubmitted = true;
                        routersSrv.updateRouterGateway(params).then(function() {
                            initRoutersTableData();
                        });
                        setGatewayModal.close();
                    } else {
                        scope.submitted = true;
                    }
                } else {
                    scope.submitted = true;
                }
            };

        };

        //删除路由器网关
        self.deleteGateway = function(editdata) {
            var content = {
                target: "delRouterGateway",
                msg: "<span>" + $translate.instant("aws.routers.del.delRouterGateway") + "</span>",
                data: editdata
            };
            self.$emit("delete", content);
        };
        self.$on("delRouterGateway", function(e, editdata,delScope) {
            var params = {
                "router_id": editdata.id,
                "network_id": ""
            };
            //不让重复点击删除按钮
            delScope.notDel=true;
            routersSrv.updateRouterGateway(params).then(function() {
                initRoutersTableData();
            });
        });

        //删除路由器
        self.deleteRouters = function() {
            self.refreshRoutersTable = initRoutersTableData;
            commonFuncSrv.deleteRouter(self,self.checkedRouterItems);
        };

        //路由器详情
        self.$on("getDetail", function(event, router_id) {
            self.routerDetailSearch = {
                routerSubItem: "",
                staticRouterItem: ""
            };
            var routerSubData, staticRoutersData = [];
            self.loadRouterSubData = false;
            self.loadStaticRouteData = false;
            self.routerSubTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
            }, {
                counts: [],
                dataset: []
            });
            self.staticRouteTable = new NgTableParams({
                count: GLOBAL_CONFIG.PAGESIZE
            }, {
                counts: [],
                dataset: []
            });
            self.routerDetailTitleName = "routerDetail";
            if (sessionStorage["routerDetail"]) {
                self.routerDetailTitleData = JSON.parse(sessionStorage["routerDetail"]);
            } else {
                self.routerDetailTitleData = [{
                    name: 'routers.portName',
                    value: true,
                    disable: true,
                    search: '_name'
                }, {
                    name: 'routers.portIp',
                    value: true,
                    disable: false,
                    search: 'ip'
                }, {
                    name: 'routers.linkSubnet',
                    value: true,
                    disable: false,
                    search: 'linkSubnet'
                }, {
                    name: 'routers.state',
                    value: true,
                    disable: false,
                    search: '_status'
                }, {
                    name: 'routers.adminState',
                    value: true,
                    disable: false,
                    search: '_adminState'
                }, {
                    name: 'routers.deviceOwner',
                    value: true,
                    disable: false,
                    search: 'deviceOwner'
                }];
                sessionStorage.setItem(self.routerDetailTitleName,JSON.stringify(self.routerDetailTitleData));
            };

            self.routerDetailSearchTearm = function(obj) {
                var tableData = obj.tableData;
                var titleData = obj.titleData;
                tableData.map(function(item) {
                    item.searchTerm = "";
                    titleData.forEach(function(showTitle) {
                        if (showTitle.value) {
                            if (showTitle.search == 'linkSubnet') {
                                item.subnetIP.forEach(ip=>{
                                     item.searchTerm += ip +"\b";
                                });
                            } else {
                                item.searchTerm += item[showTitle.search] +"\b";
                            }
                        }
                    });
                    return item;
                });
            };
            //路由器详情子网列表
            var initInterfacetable = function(router_id) {
                self.routerDetailSearch.routerSubItem="";
                routersSrv.getRouterDetail(router_id).then(function(result) {
                    if($routeParams.id!=router_id){return;}
                    result ? self.loadRouterSubData = true : "";
                    if (result && result.data) {
                        routerSubData = _.map(result.data, function(item) {
                            if (item.name.substr(0, 1) + "" + item.name.substr(-1) == "()") {
                                item._name = "无";
                            }else{
                                item._name = item.name;
                            }
                            item._status = item.status == "ACTIVE" ? $translate.instant("aws.common.active") : $translate.instant("aws.common.down");
                            item._adminState = item.adminState == true ? $translate.instant("aws.common.yes") : $translate.instant("aws.common.no");
                            if (item.deviceOwner == "network:router_gateway") {
                                item.unChecked = true;
                            } else {
                                item.unChecked = false;
                            }
                            return item;
                        });
                        self.routerDetailSearchTearm({"titleData":self.routerDetailTitleData,"tableData":routerSubData});
                        self.routerSubTable = new NgTableParams({
                            count: GLOBAL_CONFIG.PAGESIZE
                        }, {
                            counts: [],
                            dataset: routerSubData
                        });
                        checkedSrv.checkDo(self, "", "id", "routerSubTable");
                    }

                });
            };

            //路由器详情静态路由表列表
            var initStaticRouteTable = function() {
                self.routerDetailSearch.staticRouterItem=""
                routersSrv.getStaticRoutes().then(function(res) {
                    res ? self.loadStaticRouteData = true : "";
                    _.each(res.data, function(item) {
                        if (item.id == router_id) {
                            staticRoutersData = _.map(item.routes, function(v, i) {
                                v.index = i;
                                v.searchTerm = [v.destination,v.nexthop].join("\b");
                                return v;
                            });
                        }
                    });
                    self.staticRouteTable = new NgTableParams({
                        count: GLOBAL_CONFIG.PAGESIZE
                    }, {
                        counts: [],
                        dataset: staticRoutersData
                    });
                    checkedSrv.checkDo(self, "", "index", "staticRouteTable");
                });
            };

            initInterfacetable(router_id);
            initStaticRouteTable();

            self.interfaceListTab = function() {
                self.routerDetailSearch.routerSubItem = "";
                self.routerSubTable = new NgTableParams({
                    count: GLOBAL_CONFIG.PAGESIZE
                }, {
                    counts: [],
                    dataset: routerSubData
                });
                checkedSrv.checkDo(self, "", "id", "routerSubTable");
            };

            self.staticRouteTab = function() {
                self.routerDetailSearch.staticRouterItem = "";
                self.staticRouteTable = new NgTableParams({
                    count: GLOBAL_CONFIG.PAGESIZE
                }, {
                    counts: [],
                    dataset: staticRoutersData
                });
                checkedSrv.checkDo(self, "", "index", "staticRouteTable");
            };

            self.refreshRouterDetail = function() {
                initInterfacetable(router_id);
            };
            self.refreshStaticRoute = function() {
                initStaticRouteTable();
            };

            self.routerSubSearch = function() {
                self.routerSubTable.filter({
                    searchTerm: self.routerDetailSearch.routerSubItem
                });
            };

            self.staticRouterSearch = function() {
                self.staticRouteTable.filter({
                    searchTerm: self.routerDetailSearch.staticRouterItem
                });
            };

            //路由器详情页面关联子网以及修改操作功能
            self.updateSubnet = function(type, editdata) {
                var scope = self.$new(); // 子 scope 原型 继承父 scope ..
                var routerDetailModal = $uibModal.open({
                    animation: true,
                    templateUrl: "routerDetailModal.html",
                    scope: scope
                });
                scope.submitted = false;
                scope.interacted = function(field) {
                    if (field) {
                        return scope.submitted || field.$dirty;
                    }
                };
                scope.routerDetail = {};
                switch (type) {
                    case "new":
                        scope.modalTitle = $translate.instant("aws.routers.linkSubnet");
                        scope.editRouterDetail = false;
                        routerDetailModal.opened.then(function() {
                            routersSrv.getTenantSubs().then(function(res) {
                                var sub_data = _.map(res.data, function(item) {
                                    item.name = item.name + "---" + item.cidr;
                                    return item;
                                });
                                sub_data=sub_data.filter(function(item){
                                    return item.gatewayIp;
                                });
                                scope.subnetsInfo = {
                                    options: sub_data,
                                    selected: sub_data[0]
                                };
                                scope.routerDetail.selectedSub = scope.subnetsInfo.selected;
                                if (sub_data.length == 0) {
                                    scope.subPlaceholder = $translate.instant("aws.routers.placeholder.noSubToChose");
                                } else {
                                    scope.subPlaceholder = $translate.instant("aws.routers.choseLinkSubnetHolder");
                                }
                            });
                        });
                        scope.routerDetailConfirm = function(data, form) {
                            if (form.$valid) {
                                scope.formSubmitted = true;
                                let params = {
                                    "subnet_id": data.selectedSub.id,
                                    "router_id": router_id
                                };
                                routersSrv.interfaceAdd(params).then(function() {
                                    initInterfacetable(router_id);
                                    initRoutersTableData();
                                });
                                routerDetailModal.close();
                            } else {
                                scope.submitted = true;
                            }

                        };
                        break;

                    case "edit":
                        scope.modalTitle = $translate.instant("aws.routers.editPort");
                        scope.editRouterDetail = true;
                        if (editdata.name.substr(0, 1) + "" + editdata.name.substr(-1) == "()") {
                            scope.routerDetail.portName = "";
                        } else {
                            scope.routerDetail.portName = editdata.name;
                        }
                        scope.routerDetailConfirm = function(data, form) {
                            if (form.$valid) {
                                scope.formSubmitted = true;
                                let params = {
                                    "port_id": editdata.id,
                                    "portName": {
                                        "name": data.portName
                                    }
                                };
                                routersSrv.updatePortName(params).then(function() {
                                    initInterfacetable(router_id);
                                    initRoutersTableData();
                                });
                                routerDetailModal.close();
                            } else {
                                scope.submitted = true;
                            }
                        };
                        break;
                }
            };

            //路由器详情页面解除关联子网
            self.unLinkSubnet = function(checkedItems) {
                var content = {
                    target: "routerUnLinkSubnet",
                    msg: "<span>" + $translate.instant("aws.routers.del.unLinkSubnetMsg") + "</span>",
                    data: checkedItems
                };
                self.$emit("delete", content);
            };
            self.$on("routerUnLinkSubnet", function(e, checkedItems) {
                if (!e.defaultPrevented) {
                    var params = {
                        "port_id": [],
                        "router_id": $routeParams.id
                    };
                    _.each(checkedItems, function(item) {
                        params.port_id.push(item.id);
                    });
                    routersSrv.interfaceRemove(params).then(function() {
                        initInterfacetable($routeParams.id);
                        initRoutersTableData();
                    });
                }
                e.defaultPrevented = true;
            });

            function deleteExtraKey(data) {
                _.each(data, function(item) {
                    delete(item["index"]);
                    delete(item["$$hashKey"]);
                });
            }

            //添加路由表
            self.addStaticRoute = function() {
                var scope = self.$new();
                var staticRouteModal = $uibModal.open({
                    animation: true,
                    templateUrl: "addStaticRoute.html",
                    scope: scope
                });
                scope.submitted = false;
                scope.interacted = function(field) {
                    return scope.submitted || field.$dirty;
                };
                scope.addStaticRoute = {
                    destination: "",
                    nexthop: ""
                };
                scope.staticRouteConfirm = function(staticRouteForm) {
                    if (staticRouteForm.$valid) {
                        scope.formSubmitted = true;
                        var _staticRoutes = angular.copy(staticRoutersData);
                        deleteExtraKey(_staticRoutes);
                        _staticRoutes.push({
                            destination: scope.addStaticRoute.destination,
                            nexthop: scope.addStaticRoute.nexthop
                        });
                        var params = {
                            "router_id": router_id,
                            "router": {
                                "router": {
                                    "routes": _staticRoutes
                                }
                            }
                        };
                        routersSrv.editStaticRoutes(params).then(function(res) {
                            if (res && res.status == 200) {
                                initStaticRouteTable();
                                $rootScope.$broadcast("alert-success", 0);
                            }

                        });
                        staticRouteModal.close();
                    } else {
                        scope.submitted = true;
                    }
                };
            };

            //删除路由表
            self.delStaticRoute = function(checkedItems) {
                var content = {
                    target: "delStaticRoute",
                    msg: "<span>" + $translate.instant("aws.routers.del.delStaticRoutingTable") + "</span>",
                    data: checkedItems
                };
                self.$emit("delete", content);
            };
            self.$on("delStaticRoute", function(e, checkedItems) {
                if (!e.defaultPrevented) {
                    var _staticRoutes = _.difference(staticRoutersData, checkedItems);
                    deleteExtraKey(_staticRoutes);
                    var params = {
                        "router_id": $routeParams.id,
                        "router": {
                            router: {
                                routes: _staticRoutes
                            }
                        }
                    };
                    routersSrv.editStaticRoutes(params).then(function(res) {
                        if (res && res.status == 200) {
                            initStaticRouteTable();
                            $rootScope.$broadcast("alert-success", 0);
                        }
                    });
                }
                e.defaultPrevented = true;
            });

            self.$watch(function() {
                if (self.routerSubTable) {
                    return self.routerSubTable.checkedItems;
                }
            }, function(chkItems) {
                self.editRouterSubBtn = true;
                self.delRouterSubBtn = true;
                if (chkItems) {
                    if (chkItems.length == 1) {
                        self.editRouterSubBtn = false;
                        self.delRouterSubBtn = false;
                    } else if (chkItems.length > 1) {
                        self.delRouterSubBtn = false;
                    }
                }
            });
            self.$watch(function() {
                if (self.staticRouteTable) {
                    return self.staticRouteTable.checkedItems;
                }
            }, function(chkItems) {
                self.staticRouterBtn = true;
                if (chkItems) {
                    if (chkItems.length == 1) {
                        self.staticRouterBtn = false;
                    }
                }
            });

            self.isPortForwarding=true;
            //路由详情端口转发
            self.checkFirst = {
                checked: false,
                items: {}
            };
            self.noData = false
            self.loadData = true
            self.prompt = false
            // 监听id改变
            self.$watch(function(){
                $location.search().id
            },function(){
                initPortForwarding()
            },true)

            self.portForwardingTab=function(){
                initPortForwarding()
            }
            function initPortForwarding(){
                self.routerDetailSearch.portForwardingItem="";
                self.portForwardingData = []
                routersSrv.getStaticRoutes().then(function(res){
                    if(res&&res.data){
                        self.routersList=res.data
                        self.routersList.forEach(function(item){
                            if($location.search().id==item.id){
                                if(item.external_gateway_info){
                                    self.routerIpAddress=item.external_gateway_info.external_fixed_ips[0].ip_address
                                    routersSrv.getPortForwardingList($location.search().id).then(function(res){
                                        if(res&&res.data){
                                            self.portForwardingData = res.data
                                            self.portForwardingData.forEach(function(item,index){
                                                item.outer_add = self.routerIpAddress;
                                                item.id = index+1; 
                                                item.searchPortForwardingTerm=[item.protocol,item.outer_add,item.out_port,item.in_addr,item.in_port].join("\b")
                                            })
                                            self.loadData = false
                                            self.noData = false
                                            if(res.data.length==0){
                                                self.noData = true
                                            }else{
                                                self.noData = false
                                            }
                                            // console.log(self.portForwardingData)
                                            TableCom.init(self,'portForwardingTable',self.portForwardingData,'id',10,'checkFirst');
                                        }else{
                                            self.noData = true
                                        }
                                    })
                                }else{
                                    self.prompt=true
                                    self.noData = false
                                    self.loadData = false
                                    self.portForwardingData = []
                                    TableCom.init(self,'portForwardingTable',self.portForwardingData,'id',10,'checkFirst');
                                }    
                            }
                        })
                    }
                })
            }
            // 搜索
            self.portForwardingSearch=function(globalSearchTerm){
                self.portForwardingTable.filter({
                    searchPortForwardingTerm: self.routerDetailSearch.portForwardingItem
                });
            }
            // 刷新
            self.portForwardReset=function(){
                initPortForwarding()
            }

            self.titleData=[ 
                {name:'routers.agreement',value:true,disable:true},
                {name:'routers.outerAddress',value:true,disable:false},
                {name:'routers.outerPort',value:true,disable:false},
                {name:'routers.innerAddress',value:true,disable:false},
                {name:'routers.innerPort',value:true,disable:false},
             ];
             //第一次进来没有数据
             sessionStorage.setItem("routers",JSON.stringify(self.titleData))

             self.isShowTitle=function(index,title){
                 var currentSession=JSON.parse(sessionStorage["routers"]);
                 currentSession[index].value=title.value;
                 sessionStorage.setItem(self.siteTitle,JSON.stringify(currentSession));
             };
            self.$watch(function() {
                return self.checkFirst.items;//监控checkbox
            }, function(val) {
                self.checkedItems = [];
                var arr=[];
                for(var i in self.checkFirst.items){
                  arr.push(self.checkFirst.items[i])
                }
                self.checkedEdit = null;
                self.powerEdit = null;
                self.delEdit = {};
                if(val && arr.length>=0){
                    for(var key in val){
                        if(val[key]){
                            self.portForwardingData.forEach(item=>{
                                if(item.id==key){
                                    self.checkedItems.push(item);
                                }
                            })
                        }
                    }
                }
                if(self.checkedItems.length==1){
                    self.isPortForwarding = true;
                    self.checkeDel = angular.copy(self.checkedItems[0]);
                }else if(self.checkedItems.length>1){
                    self.isPortForwarding = true;
                }else if(self.checkedItems.length==0){
                    self.isPortForwarding = false;
                }
            },true);
            // 新建
            self.creatPortForwarding=function(){
                var scope = self.$new(); 
                var createPortForwarding = $uibModal.open({
                    animation: true,
                    templateUrl: "createPortForwarding.html",
                    scope: scope
                });
                scope.routerIpAddress=self.routerIpAddress
                scope.ipAddress=$translate.instant("aws.routers.placeholder.ipTitle")
                scope.portLimit=$translate.instant("aws.routers.placeholder.portLimit")
                scope.newPortForwarding={}
                scope.submitted = false;
                scope.subnetLimit = false;
                scope.noPortLimit = false;
                scope.noSubnetLimit = false;
                scope.isGetCouldIpAddressList = false
                scope.protocolList=[{"name":"TCP"},{"name":"UDP"}]
                scope.choiceOrcustom = 1;
                scope.customIpAddress = {
                    inAddr : ""
                }
                scope.agreement={
                    name:scope.protocolList[0]
                }
                scope.couldIpAddressList = [];
                scope.couldIpAddress = {
                    name:""
                }
                
                let url=$location.search().id
                scope.newPortForwarding = {     
                    "routerId":"",
                    "outPort":scope.outPort,
                    "inAddr":scope.inAddr,
                    "inPort":scope.inPort,
                    "protocol":"",
                    "status":"",
                    "action":"add",
                }

                routersSrv.getRouterDetail(url).then(function(result) {
                    let subnets = []
                    self.subnetLimitList = []
                    if(result&&result.data){
                        result.data.forEach(function(item){
                            if(item.deviceOwner!="network:router_gateway"){
                                subnets.push(item.subnetId)
                            }
                        })
                    }
                    routersSrv.getSubnetsTableData().then(function(res){
                        if(res&&res.data&&angular.isArray(res.data)){
                            scope.noSubnetLimit = true
                            res.data.forEach(function(item){
                                subnets.forEach(function(value){
                                    if(value==item.id){
                                        item.allocationPools.forEach(function(pools){
                                            self.subnetLimitList.push(pools)
                                        })
                                    }
                                })
                            })
                            self.subnetLimitList.sort(function(a,b){
                                return _IP.toLong(a.start) - _IP.toLong(b.end);
                            });
                        } 
                    })
                })

                function initCouldIpAddressList(){
                    routersSrv.getCouldIpAddressList($location.search().id).then(function(res){
                        if(res&&res.data){
                            // console.log(res)
                            scope.isGetCouldIpAddressList = true;
                            res.data.forEach(function(item){
                                scope.couldIpAddressList.push({
                                    name:item.name + " " + "ip:" + item.ip,
                                    ip: item.ip
                                })
                            })
                            scope.couldIpAddress = {
                                name:scope.couldIpAddressList[0]
                            }
                        }
                    })  
                }

                initCouldIpAddressList();
            
                scope.portForwardingConfirm=function(fileFrom,value){
                    if(fileFrom.$valid){ 
                        if(value=="1"){
                            scope.newPortForwarding.inAddr = scope.couldIpAddress.name.ip
                        }else{
                            scope.newPortForwarding.inAddr = scope.customIpAddress.inAddr
                        }
                        scope.newPortForwarding.protocol = scope.agreement.name.name
                        let postData = []
                        postData.push(scope.newPortForwarding)
                        if(!scope.subnetLimit){
                            routersSrv.creatPortForwarding(url,postData).then(function(res){
                                routersSrv.getPortForwardingList($location.search().id).then(function(res){
                                    if(res&&res.data){
                                        self.portForwardingData = res.data
                                        self.portForwardingData.forEach(function(item,index){
                                            item.outer_add = self.routerIpAddress;
                                            item.id = index + 1 ;
                                            item.searchPortForwardingTerm=[item.protocol,item.outer_add,item.out_port,item.in_addr,item.in_port].join("\b")

                                        })
                                        if(res.data.length==0){
                                            self.noData = true
                                        }else{
                                            self.noData = false
                                        }
                                        TableCom.init(self,'portForwardingTable',self.portForwardingData,'id',10,'checkFirst');
                                    }
                                })
                            })
                            createPortForwarding.close();
                        }   
                    }else{
                        scope.submitInValid = true;
                    }
                }
            }
            // 删除端口转发
            self.delPortForwarding = function(){ 
                var content = {
                    target: "delPortForward",
                    msg: "<span>" + $translate.instant("aws.routers.del.delPortForwarding") + "</span>",
                    data: self.checkeDel 
                };
                self.$emit("delete", content);
            }
            self.$on("delPortForward", function(e) {
                let postData = []
                let postDataOne = {}

                if (!e.defaultPrevented) {
                    self.checkedItems.forEach(function(item){
                        postDataOne = {
                            "outPort":item.out_port,
                            "inAddr":item.in_addr,
                            "inPort":item.in_port,
                            "protocol":item.protocol,
                            "status":"",
                            "action":"del",
                        }
                        postData.push(postDataOne)
                    })
                    
                    routersSrv.creatPortForwarding($location.search().id,postData).then(function(){
                        routersSrv.getPortForwardingList($location.search().id).then(function(res){
                            if(res&&res.data){
                                self.portForwardingData = res.data
                                self.portForwardingData.forEach(function(item,index){
                                    item.outer_add = self.routerIpAddress;
                                    item.id = index+1;
                                    item.searchPortForwardingTerm=[item.protocol,item.outer_add,item.out_port,item.in_addr,item.in_port].join("\b")
                                })
                                if(res.data.length==0){
                                    self.noData = true
                                }else{
                                    self.noData = false
                                }
                                TableCom.init(self,'portForwardingTable',self.portForwardingData,'id',10,'checkFirst');
                            }
                        })
                    })
                }
                e.defaultPrevented = true;
            });
        });
    }
]);
routersModule.directive("portTransfer", function() { //校验端口转发自定义ip是否正确
    return {
        restrict: "A",
        require: "ngModel",
        scope:{
           subnetlist:"="  
        },
        link: function(scope, elem, attrs, ngModel) {
            ngModel.$parsers.push(function(viewValue) {
                for(let i = 0;i<scope.subnetlist.length;i++){
                    let subLimit=scope.subnetlist[i];
                    let isInrange=_IP.toLong(viewValue)>=_IP.toLong(subLimit.start)&&_IP.toLong(viewValue)<=_IP.toLong(subLimit.end)
                    if(isInrange){
                       ngModel.$setValidity("ipinrange", true);
                       break ; 
                    }else{
                       ngModel.$setValidity("ipinrange", false);
                    }
                }
                return viewValue;
            });
            ngModel.$formatters.push(function(viewValue) {
                for(let i = 0;i<scope.subnetlist.length;i++){
                    let subLimit=scope.subnetlist[i];
                    let isInrange=_IP.toLong(viewValue)>=_IP.toLong(subLimit.start)&&_IP.toLong(viewValue)<=_IP.toLong(subLimit.end)
                    if(isInrange){
                       ngModel.$setValidity("ipinrange", true);
                       break ; 
                    }else{
                       ngModel.$setValidity("ipinrange", false);
                    }
                }
                return viewValue;
            });
        }

    };
});

//路由器新建功能
// routersModule.controller("routerModelCtrl", ["$scope","$rootScope", "routersSrv", "checkQuotaSrv", "commonFuncSrv", "refreshRoutersTable", "$uibModalInstance", "$translate",
//     function($scope,$rootScope, routersSrv, checkQuotaSrv, commonFuncSrv, refreshRoutersTable, $uibModalInstance, $translate) {
//         var self = $scope;

//         checkQuotaSrv.checkQuota(self, "router");
//         getPrice();
//         self = commonFuncSrv.setAssignIpFun(self, "routerForm","createrouterForm","external");

//         self.routerForm = {
//             name: "",
//             selectedNet: "",
//             selectedSubnet: "",
//             selectedSubPool: "",
//             assignSub: false,
//             assignIP: false,
//             init_cidr: {
//                 ip_0: "",
//                 ip_1: "",
//                 ip_2: "",
//                 ip_3: ""
//             },
//             selectedTenantSub: ""
//         };
        
//         self.routerModal_title = $translate.instant("aws.routers.newRouter");
//         self.extNetsPlaceholder = $translate.instant("aws.routers.placeholder.routerExtNet");
//         self.subPlaceholder = $translate.instant("aws.routers.choseLinkSubnetHolder");
        
//         self.field_form = {};
//         self.submitted = false;
//         self.interacted = function(field) {
//             if (field) {
//                 self.field_form.createrouterForm = field;
//                 return self.submitted || field.name.$dirty || field.extnet.$dirty || field.tenantsub.$dirty || field.ip_0.$dirty || field.ip_1.$dirty || field.ip_2.$dirty || field.ip_3.$dirty;
//             }
//         };
        
//         routersSrv.getTenantSubs().then(function(res) {
//             if (res && res.data&&angular.isArray(res.data)) {
//                 var tenantSubs_data = res.data.filter(function(item){
//                     item.name = item.name + "---" + item.cidr;
//                     return item.gatewayIp
//                 });
//                 self.tenantSubs = {
//                     options: tenantSubs_data,
//                     selected: tenantSubs_data[0]
//                 };
//                 self.routerForm.selectedTenantSub = self.tenantSubs.selected;
//                 if (tenantSubs_data.length == 0) {
//                     self.subPlaceholder = $translate.instant("aws.routers.placeholder.noSubToChose");
//                 }
//             }
//         });
//         function getPrice(){
//             if(!$rootScope.billingActive){
//                 return ;
//             }
//             var postData ={
//                 "region":localStorage.regionName?localStorage.regionName:"default",
//                 "routerCount":1
//             }
//             routersSrv.getPrice(postData).then(function(data){
//                 if(data && data.data &&!isNaN(data.data)){
//                     self.showPrice = true;
//                     self.price =data.data;
//                     self.priceFix =  self.price.toFixed(2)
//                     self.totalPrice = (self.price*30*24).toFixed(2)
//                 }else{
//                     self.showPrice = true;
//                     self.price ="N/A";
//                     self.priceFix =  "N/A";
//                     self.totalPrice = "N/A"
//                 }
                
//             })
//         }
//         self.routerConfirm = function(form) {
//             let postrouterParams = {};
//             if (form.$valid) {
//                 postrouterParams = {
//                     "name": self.routerForm.name,
//                     "network_id": self.routerForm.selectedNet.id,
//                     "subnet_id": self.routerForm.selectedTenantSub.id
//                 };
//             } else {
//                 self.submitted = true;
//             }
//             if (self.routerForm.assignSub) {
//                 postrouterParams.external_fixed_ips = [];
//                 let externalFixedIps = {};
//                 externalFixedIps.subnet_id = self.routerForm.selectedSubnet.id;
//                 if (self.routerForm.assignIP == true) {
//                     let gatewayIp = self.routerForm.init_cidr.ip_0 + "." +
//                         self.routerForm.init_cidr.ip_1 + "." +
//                         self.routerForm.init_cidr.ip_2 + "." +
//                         self.routerForm.init_cidr.ip_3;
//                     externalFixedIps.ip_address = gatewayIp;
//                     delete externalFixedIps.subnet_id;
//                     self.setCheckValueFunc();
//                 }
//                 postrouterParams.external_fixed_ips.push(externalFixedIps);
//             }

//             if (self.field_form.createrouterForm.$valid) {
//                 self.formSubmitted = true;
//                 routersSrv.addRouterAction(postrouterParams).then(function() {
//                     refreshRoutersTable();
//                 });
//                 $uibModalInstance.close();
//             } else {
//                 self.submitted = true;
//             }
//         };

//     }
// ]);
