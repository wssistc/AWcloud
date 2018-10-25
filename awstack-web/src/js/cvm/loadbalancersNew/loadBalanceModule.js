import './loadBalanceSrv';

var loadBalanceModule = angular.module("loadBalanceModule", ["loadBalanceSrvModule", "ngAnimate"]);
loadBalanceModule.controller("balanceNewCtrl", ["$scope", "$rootScope", "$location", "$routeParams", "$filter", "$uibModal", "$translate", "NgTableParams",
    "newCheckedSrv", "instancesSrv", "loadBalanceSrv", "GLOBAL_CONFIG", function ($scope, $rootScope, $location, $routeParams, $filter, $uibModal, $translate,
    NgTableParams, newCheckedSrv, instancesSrv, loadBalanceSrv, GLOBAL_CONFIG) {
    var self = $scope;
    self.editDisabled = true;
    self.deleteDisabled = true;

    self.openBalanceModel = openBalanceModel;
    self.startUp = startUp;
    self.forbidden = forbidden;
    self.bindPublicIp = bindPublicIp;
    self.unbindPublicIp = unbindPublicIp;
    self.deleteBalance = deleteBalance;
    self.lbNameList = [];
    self.refreshStorageTable = function() {
        self.globalSearchTerm = "";
        initTabData();
    }

    self.statusList = [
        {id: "", name: "请选择状态"},
        {id: "true", name: "运行"},
        {id: "false", name: "关闭"},
        {id: "creating", name: "创建中"},
        {id: "error", name: "故障"}
    ];
    self.select = {
        status: self.statusList[0]
    }
    self.titleData = [
        {name:'name', value:true},
        {name:'privateIP', value:true},
        {name:'publicIP', value:true},
        {name:'status', value:true},
        // {name:'maxConnections', value:true},
        {name:'description', value:true}
    ];

    // 状态下拉框过滤列表
    self.changeLbstatus = function(item) {
        self.applyGlobalSearch(item);
    }

    initTabData();

    // 初始化列表数据
    function initTabData() {
        self.createDisabled = true;
        self.blance_data = "";
        self.balanceTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        loadBalanceSrv.getBlanceTableData().then(function(result) {
            result.data?self.loadData = true:"";
            self.lbNameList = [];
            if(result && result.data && angular.isArray(result.data)) {
                self.blance_data = result.data;
                self.blance_data.map(item => {
                    self.lbNameList.push(item.name);
                    item.admin_state_up_ori =  $translate.instant('aws.loadbalance.table.admin_state_up.'+ item.admin_state_up);
                    item.searchTerm = [item.name, item.vip_address, item.fip, item.admin_state_up_ori, item.description].join('\b');
                });
                successFunc('balanceTable');
            }           
        });
    }

    function successFunc(tableType) {
        self.createDisabled = false;
        self.balanceTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.blance_data });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm || "";
            self.balanceTable.filter({
                searchTerm: term 
            });
        };
        var tableId = "id";
        newCheckedSrv.checkDo(self, self.blance_data, tableId, tableType);
    }

    self.$watch(function(){
        return self.checkedItemsbalanceTable;
    },function(values){
        if(!values){return}
        self.editDisabled = true;       // 编辑
        self.deleteDisabled = true;     // 删除
        self.UpDisabled = true;         // 启用
        self.forbiddenDisabled = true;  // 禁用
        self.bindIpDisabled = true;     // 绑定公网IP
        self.unbindIpDisabled = true;   // 解绑公网IP
        if(values.length == 1) {
            self.editDisabled = false;
            if(values[0].admin_state_up) {
                self.forbiddenDisabled = false;
            }else if(!values[0].admin_state_up) {
                self.UpDisabled = false;
            }

            if(values[0].fip) {
                self.unbindIpDisabled = false;
            }else if(!values[0].fip) {
                self.bindIpDisabled = false;
            }
        }
        if(values.length > 0) {
            self.deleteDisabled = false;
        }
    });

    //新建&编辑 负载均衡
    function openBalanceModel(type) {
        var editData = angular.copy(self.editData);
        $uibModal.open({
            animation: true,
            templateUrl: "balanceModel.html",
            controller: "balanceController",
            resolve: {
                type: function() {
                    return type;
                },
                editData: function() {
                    return editData;
                },
                lbNameList: function() {
                    return self.lbNameList;
                },
                initBalanceTable: function() {
                    return initTabData;
                }
            }
        });
    }

    //启用
    function startUp(item) {
        var options = {
            id: item.id,
            status: true
        }
        loadBalanceSrv.modifyBalanceStatus(options).then(function(res) {
            if(res && res.status == "0") {
                initTabData();
            }
        });
    }

    //禁用
    function forbidden(item) {
        var content = {
            target: "forbiddenLb",
            msg: "<span>" + $translate.instant("aws.loadbalance.forbiddenTip") + "</span>",
            data: item
        };
        self.$emit("delete", content);
    }
    self.$on("forbiddenLb", function(e, data) {
        var options = {
            id: data.id,
            status: false
        }
        loadBalanceSrv.modifyBalanceStatus(options).then(function(res) {
            if(res && res.status == "0") {
                initTabData();
            }
        });
    });

    //解绑公网IP
    function unbindPublicIp(item) {
        var content = {
            target: "unbindlbIP",
            msg: "<span>" + $translate.instant("aws.loadbalance.unbindIpTip") + "</span>",
            data: item
        };
        self.$emit("delete", content);
    }
    self.$on("unbindlbIP", function(e, data) {
        instancesSrv.getAllfloalingIp().then(function(result) {
            if(result && result.data && angular.isArray(result.data)) {
                var floatingIp = result.data.filter(item => item.portId == data.vip_port_id)[0];
                var options = {
                    floatingip_id: floatingIp.id
                };
                instancesSrv.relieve_floatingip(options).then(function(result) {
                    initTabData();
                });
            }
        });
    });

    //删除操作
    function deleteBalance(checkedItems) {
        var content = {
            target: "delBalance",
            msg: "<div>" + $translate.instant("aws.loadbalance.deleteTip") + "</div>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delBalance", function(e, data) {
        if (data && data.length > 0) {
            var balanceIds = [];
            _.forEach(data,function(item) {
                balanceIds.push(item.id);
            });
            var options = {
                ids: balanceIds
            };
            loadBalanceSrv.deleteBalance(options).then(function() {
                initTabData();
            });
        }
    });

    //绑定公网IP
    function bindPublicIp(item) {
        var editData = angular.copy(item);
        $uibModal.open({
            animation: true,
            templateUrl: "bindPublicIp.html",
            controller: "bindIPLbController",
            resolve: {
                editData: function() {
                    return editData;
                },
                initBalanceTable: function() {
                    return initTabData;
                }
            }
        });
    }

    //详情页面
    $scope.$on("getDetail", function(event, value) {
        if($routeParams.from && $routeParams.from == "edit") {
            self.lbBasicInfoShow = false;
            self.lbListerInfoShow = true;
            self.lbMonitorInfoShow = false;
            self.canClick = false;
            self.detailData = {};
            self.detailData.id = value;
            self.lisTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
            initListenerTab();
        }else {
            self.lbBasicInfoShow = true;
            self.lbListerInfoShow = false;
            self.lbMonitorInfoShow = false;
            self.canClick = false;
        }
        loadBalanceSrv.getBalanceDetail(value).then(function(result){
            if($routeParams.id != value) {
                return;
            }
            self.detailData = result.data;
            self.canClick = true;
        });
    });

    self.openListenerModel = openListenerModel;
    self.showLisDetail = showLisDetail;
    self.showLbDetail = showLbDetail;
    self.lisStartUp = lisStartUp;
    self.lisForbidden = lisForbidden;
    self.deleteListener = deleteListener;
    self.canClick = false;
    self.lisChecked = false;
    self.radiolisTab = {
        checked: ""
    }

    //设置项的初始化
    self.titleName="loadBalance_lis";
    if(sessionStorage["loadBalance_lis"]){
       self.lisTitleData = JSON.parse(sessionStorage["loadBalance_lis"]);
    }else {
        self.lisTitleData = [
            {name:'loadbalance.name', value:true, disable:true, search:"name"},
            {name:'loadbalance.listenerProtocol', value:true, disable:false, search:"protocol"},
            {name:'loadbalance.port', value:true, disable:false, search:"protocol_port"},
            {name:'loadbalance.balanceAlgorithm', value:true, disable:false, search:"lb_algorithm_ori"},
            {name:'loadbalance.maxConnections', value:true, disable:false, search:"connection_limit_ori"},
            // {name:'healthcheck', value:true},
            {name:'loadbalance.status', value:true, disable:false, search:"admin_state_up_ori"}
        ];
    }
    self.lisSearchTerm = function(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
            item.searchTerm = "";
            titleData.forEach(function(showTitle){
                if(showTitle.value){
                    item.searchTerm += item[showTitle.search] + "\b";
                }
            });
        });
    };

    self.lisEditDisabled = true;       // 编辑
    self.lisDeleteDisabled = true;     // 删除
    self.lisUpDisabled = true;         // 启用
    self.lisForbiddenDisabled = true;  // 禁用

    self.lbBasicTabShow = function() {
        if(self.canClick) {
            self.lbBasicInfoShow = true;
            self.lbListerInfoShow = false;
            self.lbMonitorInfoShow = false;
        }
    }
    self.lbListerTabShow = function() {
        if(self.canClick) {
            self.lbBasicInfoShow = false;
            self.lbListerInfoShow = true;
            self.lbMonitorInfoShow = false;
            self.listenerTabFresh();
        }
    }
    self.lbMonitorTabShow = function() {
        if(self.canClick) {
            self.lbBasicInfoShow = false;
            self.lbListerInfoShow = false;
            self.lbMonitorInfoShow = true;
        }
    }

    self.listenerTabFresh = function() {
        if(self.canClick){
            self.listener_data = "";
            self.lisTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
            initListenerTab();
        }
    }

    self.refreshLisTable = function() {
        self.globalSearchLisTerm = "";
        self.listenerTabFresh();
    }

    // 初始化监听器列表数据
    function initListenerTab() {
        self.canClick = false;
        self.radiolisTab.checked = "";
        var lbId = self.detailData.id;
        loadBalanceSrv.getListenerTableData(lbId).then(function(result) {
            if(result && result.data && angular.isArray(result.data)) {
                self.listener_data = result.data;
                self.listener_data.map(item => {
                    item.lb_algorithm = item.pools && item.pools[0].lb_algorithm;
                    item.lb_algorithm_ori = $translate.instant('aws.loadbalance.lisTab.lb_algorithm.' + item.lb_algorithm);
                    if(item.connection_limit == "-1") {
                        item.connection_limit_ori = $translate.instant('aws.loadbalance.noLimit');
                    }else {
                        item.connection_limit_ori = item.connection_limit;
                    }
                    item.provisioning_status = item.pools && item.pools[0].provisioning_status;
                    item.provisioning_status_ori = $translate.instant('aws.loadbalance.lisTab.provisioning_status.' + item.provisioning_status);
                    item.admin_state_up_ori =  $translate.instant('aws.loadbalance.table.admin_state_up.'+ item.admin_state_up);
                    // item.searchTerm = item.name + "\b" + item.protocol + "\b" + item.protocol_port + "\b" + item.lb_algorithm_ori + "\b"
                    //     +  item.connection_limit_ori + "\b" + item.provisioning_status_ori + "\b" + item.admin_state_up_ori;
                });
                self.canClick = true;
                successLisFunc('lisTable');
            }           
        });
    }

    function successLisFunc(tableType) {
        self.lisSearchTerm({tableData: self.listener_data, titleData:self.lisTitleData});
        self.lisTable = new NgTableParams({ count: 5 }, { counts: [], dataset: self.listener_data });
        self.applyGlobalSearchLis = function(item) {
            var term = item || "";
            self.lisTable.filter({
                searchTerm: term
            });
        };
        var tableId = "id";
        newCheckedSrv.checkDo(self, self.listener_data, tableId, tableType);
    }

    self.$watch(function() {
        return self.radiolisTab.checked;
    },function(value) {
        if(!value) {
            self.lisChecked = false;
            return;
        }
        self.lisChecked = true;
        self.lisEditDisabled = false;
        self.lisDeleteDisabled = false;
        checkDo(value);
    });

    function checkDo(value) {
        self.lisTable.data.forEach(function(item, index) {
            if(item.id == value) {
                self.editDatalisTable = angular.copy(item);
            }
        });
        self.lisUpDisabled = true;         // 启用
        self.lisForbiddenDisabled = true;  // 禁用
        if(self.editDatalisTable.admin_state_up) {
            self.lisForbiddenDisabled = false;
        }else if(!self.editDatalisTable.admin_state_up) {
            self.lisUpDisabled = false;
        }
        showLisDetail(self.editDatalisTable);
    }
    //监听器启用
    function lisStartUp(item) {
        var content = {
            target: "enableLis",
            msg: "<span>" + $translate.instant("aws.loadbalance.enableLisTip") + "</span>",
            data: item,
            type: "info",
            btnType: "btn-info"
        };
        self.$emit("delete", content);
    }
    self.$on("enableLis",function(e,data){
        disableLisButton();
        var options = {
            lbId: self.detailData.id,
            lisId: data.id,
            status: true
        }
        loadBalanceSrv.modifyListenerStatus(options).then(function(res) {
            self.listenerTabFresh();
        });
    });

    //监听器禁用
    function lisForbidden(item) {
        var content = {
            target: "forbiddenLis",
            msg: "<span>" + $translate.instant("aws.loadbalance.forbiddenTip") + "</span>",
            data: item
        };
        self.$emit("delete", content);
    }
    self.$on("forbiddenLis", function(e, data) {
        disableLisButton();
        var options = {
            lbId: self.detailData.id,
            lisId: data.id,
            status: false
        }
        loadBalanceSrv.modifyListenerStatus(options).then(function(res) {
            self.listenerTabFresh();
        });
    });

    //监听器删除
    function deleteListener(checkedItems) {
        var content = {
            target: "delListener",
            msg: "<span>" + $translate.instant("aws.loadbalance.deleteTip") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delListener", function(e, data) {
        disableLisButton();
        if (data && data.length > 0) {
            var options = [];
            _.forEach(data,function(item) {
                options.push({
                    listenerId: item.id,
                    poolId: item.pools[0].id,
                    healthMonitorId: item.pools[0].healthmonitor.id
                });
            });
            var lbId = self.detailData.id;
            // var options = {
            //     ids: listenerIds
            // };
            loadBalanceSrv.deleteListener(lbId, options).then(function(res) {
                self.listenerTabFresh();
            });
        }
    });

    function disableLisButton() {
        self.lisEditDisabled = true;       // 编辑
        self.lisDeleteDisabled = true;     // 删除
        self.lisUpDisabled = true;         // 启用
        self.lisForbiddenDisabled = true;  // 禁用
    }

    /*新建&编辑 监听器*/
    function openListenerModel(type) {
        var editData = angular.copy(self.editDatalisTable);
        $uibModal.open({
            animation: true,
            templateUrl: "listenerModel.html",
            controller: "lbListenerController",
            resolve: {
                type: function() {
                    return type;
                },
                lbId: function() {
                    return self.detailData.id;
                },
                editData: function() {
                    return editData;
                },
                initListenerTab: function() {
                    return self.listenerTabFresh;
                }
            }
        });
    }

    function showLisDetail(item) {
        self.lisDetailData = {
            name: item.name,
            protocol: item.protocol,
            port: item.protocol_port,
            healthcheck: $translate.instant('aws.loadbalance.lisTab.provisioning_status.' + item.provisioning_status),
            algorithm: $translate.instant('aws.loadbalance.lisTab.lb_algorithm.' + item.lb_algorithm),
            healthcheckWay: item.pools[0].healthmonitor.type,
            delay: item.pools[0].healthmonitor.delay,
            timeout: item.pools[0].healthmonitor.timeout,
            maxRetries: item.pools[0].healthmonitor.max_retries
        }
        // getListenerDetail(item);

        self.poolId = item.pools[0].id
        initMemberTab();
    }

    function showLbDetail() {
        self.lbDetailShow = true;
    }

    // function getListenerDetail(item) {
    //     var lbId = self.detailData.id;
    //     var lisId = item.id;
    //     loadBalanceSrv.getListenerDetail(lbId, lisId).then(function(result) {
    //         if(result && result.data) {
    //             self.lisDetailData = result.data;
    //         }
    //     });
    // }

    //监听器列表详情页面
    self.memStartUp = memStartUp;
    self.memForbidden = memForbidden;
    self.deleteMember = deleteMember;
    self.openServerModel = openServerModel;
    self.memCreateDisabled = true;
    self.memIpList = [];
    
    self.memEditDisabled = true;       // 编辑
    self.memDeleteDisabled = true;     // 删除
    self.memUpDisabled = true;         // 启用
    self.memForbiddenDisabled = true;  // 禁用

    self.refreshMemTable = function() {
        self.globalSearchMemTerm = "";
        initMemberTab();
    }

    //设置项的初始化
    self.titleName="loadBalance_mem";
    if(sessionStorage["loadBalance_mem"]){
       self.insTitleData = JSON.parse(sessionStorage["loadBalance_mem"]);
    }else {
        self.insTitleData = [
            {name:'loadbalance.insName', value:true, disable:true, search:"name"},
            {name:'loadbalance.status', value:true, disable:false, search:"admin_state_up_ori"},
            {name:'loadbalance.healthcheck', value:true, disable:false, search:"operating_status_ori"},
            {name:'loadbalance.ipAddr', value:true, disable:false, search:"address"},
            {name:'loadbalance.port', value:true, disable:false, search:"protocol_port"},
            {name:'loadbalance.weight', value:true, disable:false, search:"weight"}
        ];
    }
    self.memSearchTerm = function(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
            item.searchTerm = "";
            titleData.forEach(function(showTitle){
                if(showTitle.value){
                    item.searchTerm += item[showTitle.search] + "\b";
                }
            });
        });
    };

    /*初始化后端服务器列表*/
    function initMemberTab() {
        self.memCreateDisabled = true;
        self.member_data = "";
        self.memberTable = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: [] });
        var lbId = self.detailData.id;
        var poolId = self.poolId;
        loadBalanceSrv.getMemberTableData(lbId, poolId).then(function(result) {
            if(result && result.data && angular.isArray(result.data)) {
                self.member_data = result.data;
                self.memIpList = [];
                self.member_data.map(item => {
                    self.memIpList.push(item.address);
                    item.admin_state_up_ori =  $translate.instant('aws.loadbalance.table.admin_state_up.'+ item.admin_state_up);
                    item.operating_status_ori = $translate.instant('aws.loadbalance.insTab.operating_status.'+ item.operating_status);
                    // item.searchTerm = [item.name, item.admin_state_up_ori, item.address, item.protocol_port, item.weight, item.operating_status_ori].join("\b");
                });
                successServerFunc('memberTable');
            }           
        });
    }

    function successServerFunc(tableType) {
        self.memSearchTerm({tableData: self.member_data, titleData:self.insTitleData});
        self.memberTable = new NgTableParams({ count: 9999 }, { counts: [], dataset: self.member_data });
        self.memCreateDisabled = false;
        self.applyGlobalSearchMem = function(item) {
            var term = item || "";
            self.memberTable.filter({
                searchTerm: term
            });
        };
        var tableId = "id";
        newCheckedSrv.checkDo(self, self.member_data, tableId, tableType);
    }

    self.$watch(function(){
        return self.checkedItemsmemberTable;
    },function(values){
        if(!values){return}
        self.memEditDisabled = true;       // 编辑
        self.memDeleteDisabled = true;     // 删除
        self.memUpDisabled = true;         // 启用
        self.memForbiddenDisabled = true;  // 禁用
        if(values.length == 1) {
            self.memEditDisabled = false;
            if(values[0].admin_state_up) {
                self.memForbiddenDisabled = false;
            }else if(!values[0].admin_state_up) {
                self.memUpDisabled = false;
            }
        }
        if(values.length > 0) {
            self.memDeleteDisabled = false;
        }
    });

    //成员启用
    function memStartUp(item) {
        var content = {
            target: "startUpMem",
            msg: "<span>" + $translate.instant("aws.loadbalance.enableLisTip") + "</span>",
            data: item,
            type: "info",
            btnType: "btn-info"
        };
        self.$emit("delete", content);
    }
    self.$on("startUpMem", function(e,data) {
        disableMemberButton();
        var options = {
            lbId: self.detailData.id,
            poolId: self.poolId,
            memId: data.id,
            status: true
        }
        loadBalanceSrv.modifyMemberStatus(options).then(function(res) {
            initMemberTab();
        });
    });

    //成员禁用
    function memForbidden(item) {
        var content = {
            target: "forbiddenMem",
            msg: "<span>" + $translate.instant("aws.loadbalance.forbiddenTip") + "</span>",
            data: item
        };
        self.$emit("delete", content);
    }
    self.$on("forbiddenMem", function(e, data) {
        disableMemberButton();
        var options = {
            lbId: self.detailData.id,
            poolId: self.poolId,
            memId: data.id,
            status: false
        }
        loadBalanceSrv.modifyMemberStatus(options).then(function(res) {
            initMemberTab();
        });
    });

    //成员删除
    function deleteMember(checkedItems) {
        var content = {
            target: "delMember",
            msg: "<span>" + $translate.instant("aws.loadbalance.deleteTip") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delMember", function(e, data) {
        disableMemberButton();
        if (data && data.length > 0) {
            var memberIds = [];
            _.forEach(data,function(item) {
                memberIds.push(item.id);
            });
            var lbId = self.detailData.id;
            var poolId = self.poolId;
            var options = {
                ids: memberIds
            };
            loadBalanceSrv.deleteMember(lbId, poolId, options).then(function(res) {
                initMemberTab();
            });
        }
    });

    function disableMemberButton() {
        self.memCreateDisabled = true;
        self.memEditDisabled = true;
        self.memDeleteDisabled = true;
        self.memUpDisabled = true;
        self.memForbiddenDisabled = true;
    }

    /*新建&编辑 后端*/
    function openServerModel(type) {
        var editData = angular.copy(self.editDatamemberTable);
        if(type == "new") {
            $uibModal.open({
                animation: true,
                templateUrl: "createServerModel.html",
                controller: "lbServerController",
                resolve: {
                    type: function() {
                        return type;
                    },
                    lbId: function() {
                        return self.detailData.id;
                    },
                    poolId: function() {
                        return self.poolId;
                    },
                    subnetId: function() {
                        return self.detailData.vip_subnet_id;
                    },
                    memIpList: function() {
                        return self.memIpList;
                    },
                    editData: function() {
                        return editData;
                    },
                    initServerTable: function() {
                        return initMemberTab;
                    }
                }
            });
        }else if(type == "edit") {
            $uibModal.open({
                animation: true,
                templateUrl: "editServerModel.html",
                controller: "lbServerController",
                resolve: {
                    type: function() {
                        return type;
                    },
                    lbId: function() {
                        return self.detailData.id;
                    },
                    poolId: function() {
                        return self.poolId;
                    },
                    subnetId: function() {
                        return self.detailData.vip_subnet_id;
                    },
                    memIpList: function() {
                        return self.memIpList;
                    },
                    editData: function() {
                        return editData;
                    },
                    initServerTable: function() {
                        return initMemberTab;
                    }
                }
            });
        }
    }

}]);

//新建&编辑 负载均衡
loadBalanceModule.controller('balanceController', ["$scope", "$rootScope", "$translate", "$location", "$uibModalInstance", "type", "editData", "lbNameList",
    "initBalanceTable", "loadBalanceSrv", "$uibModal", function($scope, $rootScope, $translate, $location, $uibModalInstance, type, editData, lbNameList,
    initBalanceTable, loadBalanceSrv, $uibModal) {
    var self = $scope;
    self.submitValid = false;
    self.nameCheck = false;
    self.priceHour = 0;
    self.priceHourAbout = 0;
    self.priceMonth = 0;
    self.balanceNameList = [];

    self.checkedName = checkedName;

    // getAllBalanceName();

    if(type == "new") {
        self.modalTitle = $translate.instant("aws.loadbalance.addTitle");
        self.balance = {
            name: "",
            description: ""
        }
        self.showPriceTip = $rootScope.billingActive;
        self.isEdit = false;
        self.balanceNameList = lbNameList;
        getBalanceAmount();
        getsubnets();
        self.balanceConfirm = function(balanceForm) {
            if(balanceForm.$valid && !self.nameCheck) {
                var postData = {
                    name: self.balance.name,
                    description: self.balance.description,
                    vipSubnetId: self.balance.subnet.id,
                    vipAddress: "",
                    adminStateUp: true
                }
                loadBalanceSrv.createBalancer(postData).then(function(result){
                    initBalanceTable();
                    if(result && result.data) {
                        $uibModal.open({
                            animation: true,
                            templateUrl: "balanceSuccess.html",
                            controller: "balanceSuccessController",
                            resolve: {
                                editData: function() {
                                    return result.data;
                                },
                                initBalanceTable: function() {
                                    return initBalanceTable;
                                }
                            }
                        });
                    }
                });
                $uibModalInstance.close();
            }else {
                self.submitValid = true;
            }
        }
    } else if (type == "edit") {
        self.modalTitle = $translate.instant("aws.loadbalance.editTitle");
        self.showPriceTip = false;
        self.isEdit = true;
        self.balanceNameList = lbNameList.filter(item => !(item == editData.name));
        self.balance = {
            name: editData.name || "",
            description: editData.description || ""
        }
        getsubnets(editData.vip_subnet_id);

        self.balanceConfirm = function(balanceForm) {
            if(balanceForm.$valid && !self.nameCheck) {
                var postData = {
                    id: editData.id,
                    name: self.balance.name,
                    description: self.balance.description,
                    adminStateUp: true
                };
                
                loadBalanceSrv.editBalancer(postData).then(function(){
                    initBalanceTable();
                });
                $uibModalInstance.close();
            }else {
                self.submitValid = true;
            }
        }
    }

    //计费信息
    function getBalanceAmount() {
        if(self.showPriceTip) {
            var option = {
                loadbalancerCount: 1,
                region: localStorage.regionName || "default"
            }
            loadBalanceSrv.getBalanceAmount(option).then(function(result) {
                if(result && result.data && !isNaN(result.data)) {
                    self.priceHour = result.data;
                    self.priceHourAbout = result.data.toFixed(2);
                    self.priceMonth = (result.data * 24 * 30).toFixed(2);
                }
            });
        }
    }

    //获取子网
    function getsubnets(id) {           
        loadBalanceSrv.getsubnets().then(function(result) {
            if(result && result.data) {
                result.data.map(obj => {obj.name = obj.name + "--" + obj.cidr});
                self.subnetList = result.data.filter(function(subnet){
                    return subnet.ipVersion=='4';
                });
                if(id){
                    self.balance.subnet = self.subnetList.filter(item => item.id == id)[0];
                }else {
                    self.balance.subnet = self.subnetList[0];
                }
            }
        })
    }

    //获取负载均衡名称
    // function getAllBalanceName() {
    //     loadBalanceSrv.getBlanceTableData().then(function(result) {
    //         if(result && result.data && angular.isArray(result.data)) {
    //             result.data.map(item => {
    //                 self.balanceNameList.push(item.name);
    //             });
    //             if(type == "edit") {
    //                 self.balanceNameList = self.balanceNameList.filter(item => !(item == editData.name));
    //             }
    //         }           
    //     });
    // }

    //校验负载均衡名称是否已存在
    function checkedName(value) {
        self.nameCheck = false;
        if(self.balanceNameList.length) {
            for(var i = 0; i < self.balanceNameList.length; i++) {
                if(self.balanceNameList[i] == value) {
                    self.nameCheck = true ;
                    break;
                }
            }
        }
    }


}]);

//新建负载均衡成功提示页面
loadBalanceModule.controller('balanceSuccessController', ["$scope", "$location", "$uibModalInstance", "editData", "initBalanceTable",
    function($scope, $location, $uibModalInstance, editData, initBalanceTable) {
    var self = $scope;

    self.addConfigNow = function() {
        $uibModalInstance.close();
        var path = "#/cvm/loadbalancing?id=" + editData.id + "&from=edit";
        window.location.href = path;
    }

    self.addConfigLater = function() {
        $uibModalInstance.close();
    }
    
}]);

//绑定公网IP
loadBalanceModule.controller('bindIPLbController', ["$scope", "$translate", "$uibModal", "$uibModalInstance", "editData", "initBalanceTable", "instancesSrv",
    "loadBalanceSrv", function($scope, $translate, $uibModal, $uibModalInstance, editData, initBalanceTable, instancesSrv, loadBalanceSrv) {
    var self = $scope;
    self.submitValid = false;
    self.IpsList = [];
    self.bindIp = {
        ip: ""
    }
    self.applyPublicIp = applyPublicIp;

    getAllPublicIp();

    self.bindIpConfirm = function(bindIpForm) {
        if(bindIpForm.$valid) {
            var options = {
                floatingip_id: self.bindIp.ip.id,
                port_id: editData.vip_port_id
            };
            instancesSrv.bind_floatingip(options).then(function(result) {
                initBalanceTable();
            });
            $uibModalInstance.close();
        }else {
            self.submitValid = true;
        }
    }

    // 申请公网IP
    function applyPublicIp() {
        $uibModal.open({
            animation: true,
            templateUrl: "applyIp.html",
            controller: "applyIPLbController",
            resolve: {
                getAllPublicIp: function() {
                    return getAllPublicIp;
                }
            }
        });
    }

    //获取所有的公网IP
    function getAllPublicIp() {
        instancesSrv.getAllfloalingIp().then(function(result) {
            if(result && result.data && result.data.length) {
                self.IpsList = result.data.filter(item => !(item.portId));
                self.bindIp.ip = self.IpsList[0];
                return result.data;
            }
        })
    }
    
}]);

//申请公网IP
loadBalanceModule.controller('applyIPLbController', ["$scope", "$rootScope","$translate", "$uibModalInstance", "checkQuotaSrv", "commonFuncSrv",
    "floatipsSrv", "loadBalanceSrv", "getAllPublicIp", function($scope, $rootScope, $translate, $uibModalInstance, checkQuotaSrv, commonFuncSrv,
    floatipsSrv, loadBalanceSrv, getAllPublicIp) {
    var self = $scope;
    self.showPriceTip = $rootScope.billingActive;
    self.priceHour = 0;
    self.priceHourAbout = 0;
    self.priceMonth = 0;

    checkQuotaSrv.checkQuota(self, "floatingip");
    self = commonFuncSrv.setAssignIpFun(self, "floatipForm","createfloatipForm","external");

    //计费信息
    getFloatingIpAmount();
    function getFloatingIpAmount() {
        if(self.showPriceTip) {
            var options = {
                "region": localStorage.regionName || "default",
                "floatingIpCount": 1
            }
            floatipsSrv.getPrice(options).then(function(result) {
                if(result && result.data && !isNaN(result.data)) {
                    self.priceHour = result.data;
                    self.priceHourAbout = result.data.toFixed(2);
                    self.priceMonth = (result.data * 24 * 30).toFixed(2);
                }
            });
        }
    }

    self.applyIpConfirm = function() {
        var postfloatipParams = {
            "pool_id": self.floatipForm.selectedNet.id
        };
        if (self.floatipForm.assignSub) {
            postfloatipParams.subnet_id = self.floatipForm.selectedSubnet.id;
            if (self.floatipForm.assignIP) {
                postfloatipParams.floating_ip_address = self.floatipForm.init_cidr.ip_0 + "." +
                    self.floatipForm.init_cidr.ip_1 + "." +
                    self.floatipForm.init_cidr.ip_2 + "." +
                    self.floatipForm.init_cidr.ip_3;
                delete postfloatipParams.subnet_id;
                self.setCheckValueFunc();
            }
        }
        if (self.field_form.createfloatipForm.$valid) {
            self.formSubmitted = true;
            addFloatipFunc(postfloatipParams);
            $uibModalInstance.close();
        } else {
            self.submitted = true;
        }
    };

    function addFloatipFunc(params) {
        floatipsSrv.addFloatipAction(params).success(function() {
            getAllPublicIp();
        });
    };

}]);

//新建&编辑 监听器
loadBalanceModule.controller('lbListenerController', ["$scope", "$translate", "$location", "$uibModalInstance", "type", "editData", "initListenerTab",
    "lbId", "loadBalanceSrv", function($scope, $translate, $location, $uibModalInstance, type, editData, initListenerTab, lbId, loadBalanceSrv) {
    var self = $scope;
    self.submitValid = false;
    self.protocolList = [
        { id:"tcp", name:"TCP" },
        { id:"http", name:"HTTP" },
        { id:"https", name:"HTTPS"}
    ];
    self.keepSessionList = [
        { id:"sourceIp", name:"SOURCE_IP" },
        { id:"httpCookie", name:"HTTP_COOKIE" },
        { id:"appCookie", name:"APP_COOKIE"}
    ];
    self.algorithmList = [
        { id:"ROUND_ROBIN", name:"轮询" },
        { id:"LEAST_CONNECTIONS", name:"最小连接数" },
        { id:"SOURCE_IP", name:"源IP" }
    ];
    self.healthcheckWayList = [
        { id:"tcp", name:"TCP" },
        { id:"http", name:"HTTP" },
        { id:"https", name:"HTTPS"},
        { id:"ping", name:"PING" }
    ];
    self.keepSessionShow = false;
    self.cookieNameShow = false;
    self.urlShow = false;
    self.changeProtocol = changeProtocol;
    self.changeSession = changeSession;
    self.changeHealthcheckWay = changeHealthcheckWay;

    if(type == "new") {
        self.modalTitle = $translate.instant("aws.loadbalance.createListener");
        self.lisEdit = false;
        self.listener = {
            name: "",
            protocol: self.protocolList[0],
            port: "",
            keepSession: self.keepSessionList[0],
            cookieName: "",
            algorithm: self.algorithmList[0],
            connectionLimit: "",
            healthcheckWay: self.healthcheckWayList[0],
            delay: "",
            overtime: "",
            maxRetries: "",
            url: "",
            httpStatus: "200"
        }

        self.listenerConfirm = function(listenerForm) {
            if(listenerForm.$valid) {
                var sessionPersistenceType = self.listener.protocol.name == "HTTP" ? self.listener.keepSession.name : "";
                var httpStatus = "";
                if(self.listener.healthcheckWay.id == "http" || self.listener.healthcheckWay.id == "https") {
                    httpStatus = self.listener.httpStatus;
                }
                var options = {
                    adminStateUp: true,
                    connectionLimit: self.listener.connectionLimit || -1,
                    defaultPoolId: "",
                    description:"",
                    name: self.listener.name,
                    protocol: self.listener.protocol.name,
                    protocolPort: self.listener.port,
                    sessionPersistenceType: sessionPersistenceType,
                    cookieName: self.listener.cookieName || "",
                    lbAlgorithm: self.listener.algorithm.id,
                    type: self.listener.healthcheckWay.name,
                    delay: self.listener.delay,
                    timeout: self.listener.overtime,
                    maxRetries: self.listener.maxRetries,
                    urlPath: self.listener.url || "",
                    expectedCodes: httpStatus
                }
                loadBalanceSrv.createListener(lbId, options).then(function(result) {
                    if(result && result.status == "0") {
                        initListenerTab();
                    }
                });
                $uibModalInstance.close();
            }else {
                self.submitValid = true;
            }
        }
    } else if (type == "edit") {
        self.modalTitle = $translate.instant("aws.loadbalance.editListener");
        self.lisEdit = true;
        var connectionLimit = editData.connection_limit;
        if(connectionLimit == "-1") {
            connectionLimit = "";
        }
        self.listener = {
            name: editData.name,
            port: editData.protocol_port,
            cookieName: editData.pools[0].session_persistence && editData.pools[0].session_persistence.cookie_name || "",
            connectionLimit: connectionLimit,
            delay: editData.pools[0].healthmonitor.delay,
            overtime: editData.pools[0].healthmonitor.timeout,
            maxRetries: editData.pools[0].healthmonitor.max_retries,
            url: editData.pools[0].healthmonitor.url_path,
            httpStatus: editData.pools[0].healthmonitor.expected_codes || "200"
        }
        self.protocolList.forEach(function(item, index) {
            if(item.name == editData.protocol) {
                self.listener.protocol = self.protocolList[index];
                changeProtocol(self.listener.protocol);
            }
        });

        if(editData.pools[0].session_persistence) {
            self.keepSessionList.forEach(function(item, index) {
                if(item.name == editData.pools[0].session_persistence.type) {
                    self.listener.keepSession = self.keepSessionList[index];
                    changeSession(self.listener.keepSession);
                }
            });
        }

        self.algorithmList.forEach(function(item, index) {
            if(item.id == editData.lb_algorithm) {
                self.listener.algorithm = self.algorithmList[index];
            }
        });
        self.healthcheckWayList.forEach(function(item, index) {
            if(item.name == editData.pools[0].healthmonitor.type) {
                self.listener.healthcheckWay = self.healthcheckWayList[index];
                changeHealthcheckWay(self.listener.healthcheckWay);
            }
        });

        self.listenerConfirm = function(listenerForm) {
            if(listenerForm.$valid) {
                var sessionPersistenceType = self.listener.protocol.name == "HTTP" ? self.listener.keepSession.name : "";
                var httpStatus = "";
                if(self.listener.healthcheckWay.id == "http" || self.listener.healthcheckWay.id == "https") {
                    httpStatus = self.listener.httpStatus;
                }
                var options = {
                    adminStateUp: true,
                    connectionLimit: self.listener.connectionLimit || -1,
                    defaultPoolId: "",
                    description:"",
                    name: self.listener.name,
                    protocol: self.listener.protocol.name,
                    protocolPort: self.listener.port,
                    sessionPersistenceType: sessionPersistenceType,
                    cookieName: self.listener.cookieName || "",
                    lbAlgorithm: self.listener.algorithm.id,
                    type: self.listener.healthcheckWay.name,
                    delay: self.listener.delay,
                    timeout: self.listener.overtime,
                    maxRetries: self.listener.maxRetries,
                    urlPath: self.listener.url || "",
                    expectedCodes: httpStatus,
                    poolId: editData.pools[0].id,
                    healthmonitorId: editData.pools[0].healthmonitor_id
                }
                var lisId = editData.id;
                loadBalanceSrv.editListener(lbId, lisId, options).then(function(result) {
                    if(result && result.status == "0") {
                        initListenerTab();
                    }
                });
                $uibModalInstance.close();
            }else {
                self.submitValid = true;
            }
        }
    }

    function changeProtocol(item) {
        if(item.id == "http"){
            self.keepSessionShow = true;
        }else {
            self.keepSessionShow = false;
        }
    }

    function changeSession(item) {
        if(item.id == "appCookie"){
            self.cookieNameShow = true;
        }else {
            self.cookieNameShow = false;
        }
    }

    function changeHealthcheckWay(item) {
        if(item.id == "http" || item.id == "https"){
            self.urlShow = true;
        }else {
            self.urlShow = false;
        }
    }
}]);

//新建&编辑 后端服务器
loadBalanceModule.controller('lbServerController', ["$scope", "$translate", "$uibModalInstance", "NgTableParams", "checkedSrv", "type", "editData",
    "lbId", "poolId", "subnetId", "memIpList", "initServerTable", "instancesSrv", "loadBalanceSrv", "GLOBAL_CONFIG", function($scope, $translate, $uibModalInstance,
    NgTableParams, checkedSrv, type, editData, lbId, poolId, subnetId, memIpList, initServerTable, instancesSrv, loadBalanceSrv, GLOBAL_CONFIG) {
    var self = $scope;
    self.submitValid = false;
    self.inStepOne = true;
    self.inStepTwo = false;
    self.inStepOneBar = true;
    self.inStepTwoBar = false;

    self.statusList = [
        {id: "run", name: "运行"},
        {id: "closed", name: "关闭"},
        {id: "creating", name: "创建中"},
        {id: "error", name: "故障"}
    ];

    //第一步到第二步
    self.stepToTwo = function(items) {
        self.inStepOne = false;
        self.inStepTwo = true;
        self.inStepTwoBar = true;

        self.checkedInsList = items;
        _.forEach(self.checkedInsList, function(item) {
            item.port = item.port ? item.port : "";
            item.weight = item.weight ? item.weight : "";
        });
    }
    //第二步到第一步
    self.stepToOne = function() {
        self.inStepOne = true;
        self.inStepTwo = false;
        self.inStepTwoBar = false;
    }

    //刷新按钮
    self.refreshInsTable = function() {
        self.globalSearchTerm = "";
        getInstanceTableData();
    }

    if(type == "new") {
        self.modalTitle = $translate.instant("aws.loadbalance.bindIns");
        getInstanceTableData();
        self.createServer = function(portWeightForm) {
            if(portWeightForm.$valid) {
                var options = [];
                _.forEach(self.checkedInsList, function(item) {
                    options.push({
                        name: item.name,
                        subnetId: subnetId,
                        address: item.ipAddr,
                        protocolPort: item.port,
                        weight: Number(item.weight),
                        adminStateUp: true
                    });
                });
                loadBalanceSrv.createMember(lbId, poolId, options).then(function(result) {
                    if(result && result.status == "0") {
                        initServerTable();
                    }
                });
                $uibModalInstance.close();
            } else {
                self.submitValid = true;
            }
        }
    } else if (type == "edit") {
        self.modalTitle = $translate.instant("aws.loadbalance.modifyWeight");
        self.server = {
            name: editData.name,
            weight: editData.weight
        }
        self.editServerConfirm = function(editServerForm) {
            if(editServerForm.$valid) {
                var options = {
                    name: self.server.name,
                    weight: self.server.weight,
                    adminStateUp: true
                }
                var memberId = editData.id;
                loadBalanceSrv.editMember(lbId, poolId, memberId, options).then(function(result) {
                    if(result && result.status == "0") {
                        initServerTable();
                    }
                });
                $uibModalInstance.close();
            } else {
                self.submitValid = true;
            }
        }
    }

    //获取负载均衡子网id
    function getsubnetId() {
        loadBalanceSrv.getBalanceDetail(lbId).then(function(result){
            if(result && result.data) {
                self.subnetId = result.data.vip_subnet_id;
            }
        });
    }
    // getsubnetId();

    function getInstanceTableData() {
        instancesSrv.getData().then(function(result) {
            result.data?self.loadData = true:"";
            if (result && result.data) {
                var deliverData = result.data;
                self.instence_data = deliverData.filter(inst => inst.name != "fixedImageInstanceName");
                self.instence_data = self.instence_data.filter(inst => inst.status != "ERROR");
                self.ins_data = [];
                self.instence_data.map(item => {
                    item.portInfo = item.portInfo.filter(item2 => {
                        return item2.subnet_id == subnetId;
                    });
                    item.ipList = [];
                    item.ipList = item.portInfo.filter(item2 => {
                        return memIpList.indexOf(item2.ip_address) > -1;
                    });
                    if(item.portInfo.length  > 0 && item.ipList.length == 0) {
                        self.ins_data.push(item);
                    }
                });

                _.forEach(self.ins_data, function(item) {
                    item.status = item.status.toLowerCase();
                    item.status_ori = $translate.instant("aws.instances.table.status." + item.status);
                    item.ipAddrs = [];
                    item.portInfo.map(itemPort => {
                        if(itemPort.subnet_id == subnetId) {
                            item.ipAddrs.push(itemPort.ip_address)
                        }
                    });
                    item.ipAddr = item.ipAddrs[0];
                    item.searchTerm = item.name + "\b" + item.ipAddrs.join("\b") + "\b" + item.status_ori;
                    item.ipAddrs_long = item.ipAddrs.map(ip => _IP.toLong(ip));
                });
                successFunc("tableParams");
            }
        });
    }

    function successFunc(tableType) {
        self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: self.ins_data });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm || "";
            self.tableParams.filter({
                searchTerm: term
            });
        };
        var tableId = "uid";
        checkedSrv.checkDo(self, self.ins_data, tableId, tableType);
    }
}]);