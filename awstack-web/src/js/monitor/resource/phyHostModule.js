import "./phyHostSrv";
import "../../user/userDataSrv";
import { hostAreaChartSqlParams } from "../../chartpanel";
import { AreaPanelDefault } from "../../chartpanel";

angular.module("phyHostModule", ["ngSanitize", "ngTable", "phyHostSrv", "usersrv"])

    .controller("phyHostCtrl", ["$scope", "$interval", "$rootScope", "NgTableParams", "$uibModal", "$timeout", "phyhostSrv", "$translate",
        "userDataSrv", "$routeParams", "kbnSrv", "vmFuncSrv", "NOPROJECTMENU",
        function ($scope, $interval, $rootScope, NgTableParams, $uibModal, $timeout, phyhostSrv, $translate,
            userDataSrv, $routeParams, kbn, vmFuncSrv, NOPROJECTMENU) {
            var self = $scope;
            self.collectCycleList = [
                {name: "5分钟", value: 300},
                {name: "1小时", value: 3600},
                {name: "1天", value: 86400}
            ];
            self.timeType = {
                options: [{
                    "name": $translate.instant('aws.bill.timeType.realTime'),
                    "value": ""
                }, {
                    "name": $translate.instant('aws.bill.timeType.sixHours'),
                    "value": "6h"
                }, {
                    "name": $translate.instant('aws.bill.timeType.oneDay'),
                    "value": "1d"
                }, {
                    "name": $translate.instant('aws.bill.timeType.threeDays'),
                    "value": "3d"
                }, {
                    "name": $translate.instant('aws.bill.timeType.oneWeek'),
                    "value": "7d"
                }]
            };

            
            self.fliterCard = function(data) {
                if(data && data.length) {
                    var netCard = data.filter(item => item.priority != "c0");
                    return netCard;
                }
            }
            var memChartListener, diskChartListener, netcardChartListener;
            var initFilterData = function () {
                self.filterData = {
                    timeStep: "",
                    from: "",
                    to: "",
                    rangeHours: 0.5,
                    precision: self.collectCycleList[0].value,
                    definedTimeText: $translate.instant('aws.bill.chooseDate'),
                    selectedZonetype: {},
                    selectedZonehost: {}
                };
            };
            self.pluginSwitch = 1;
            initFilterData();
            self.getNum = false;
            self.phyHostNoData = false;
            self.activeTab = "node";
            vmFuncSrv.getDiskPartitionFunc(self, phyhostSrv); //磁盘使用率top5
            vmFuncSrv.getprocessMemFunc(self, phyhostSrv);    //进程占内存top5
            vmFuncSrv.getHostAreaChartFunc(self, hostAreaChartSqlParams, AreaPanelDefault); //cpu、内存、磁盘各指标的监控

            function getZone(type) {
                self.zonetypes = {
                    options: []
                };
                userDataSrv.getRegionData().then(function (res) {
                    if (res && res.data && res.data.length > 0) {
                        self.zonetypes.options = self.zonetypes.options.splice(self.zonetypes.options.length, 0);
                        self.zonetypes.options = res.data.filter(item => {
                            return item.status == 3;
                        });
                        self.filterData.selectedZonetype = self.zonetypes.options[0];
                        _.each(self.zonetypes.options, item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.filterData.selectedZonetype = item;
                            }
                        });
                        if (self.filterData.selectedZonetype) {
                            getPhyHost(self.filterData.selectedZonetype.regionUid, type);
                        }
                    }
                });
            }

            function getPhyHost(regionUid, type) {
                self.zonehosts = {
                    options: []
                };
                var formatResData = function (resData) {
                    if (resData.length) {
                        resData = _.map(resData, function (item) {
                            item.nodeUid = item.uuid || item.uid;
                            item.hostName = item.name;
                            return item;
                        });
                    }
                    self.zonehosts.options = resData;
                    self.filterData.selectedZonehost = self.zonehosts.options[0] ? self.zonehosts.options[0] : {};
                    renderHostInfo(self.filterData);
                };

                if (type == "node") {
                    phyhostSrv.TubePhyHost(regionUid).then(function (res) {
                        if (res && res.data) {
                            self.zonehosts.options = res.data;
                            if ($rootScope.clickedHostInfo) {
                                _.each(self.zonehosts.options, function (item) {
                                    if (item.hostName == $rootScope.clickedHostInfo.host) {
                                        self.filterData.selectedZonehost = item;
                                        renderHostInfo(self.filterData);
                                    }
                                })
                            } else {
                                self.filterData.selectedZonehost = self.zonehosts.options[0];
                                renderHostInfo(self.filterData);
                            }
                        }
                    });
                } else if (type == "resPhy") {
                    phyhostSrv.getResPoolPhyNodes().then(function (res) {
                        if (res && res.data && res.data) {
                            formatResData(res.data);
                        }
                    });
                } else if (type == "ipmi") {
                    phyhostSrv.getIpmiNodes().then(function (res) {
                        if (res && res.data && res.data) {
                            formatResData(res.data);
                        }
                    });
                }
            }

            //phyhost详情
            function renderHostInfo(filterData) {
                window.localStorage.filterData = JSON.stringify(filterData);
                self.hostInfo = {
                    ipList: []
                };
                if (self.activeTab == "node") {
                    if (filterData.selectedZonehost && filterData.selectedZonehost.hostInfo) {
                        self.hostInfo = angular.copy(filterData.selectedZonehost.hostInfo);
                        let hostMem_gb = self.hostInfo.mem / 1024 / 1024;
                        self.hostInfo.mem = Math.ceil(hostMem_gb) == hostMem_gb ? hostMem_gb : hostMem_gb.toFixed(2);
                        self.hostInfo.ipList = [];
                        for (let key in self.hostInfo.ips) {
                            self.hostInfo.ipList.push(self.hostInfo.ips[key]);
                        }
                        self.showAllIp = function () {
                            self.clickMore = true;
                            self.moreIp = true;
                        };
                    }
                } else {
                    phyhostSrv.getPhyMem({
                        regionKey: filterData.selectedZonetype.regionKey,
                        hostId: filterData.selectedZonehost.nodeUid
                    }).then(function (res) {
                        if (res && res.data && res.data[0]) {
                            let hostMem_gb = res.data[0].totalBytes / 1024 / 1024/1024;
                            self.hostInfo.mem = Math.ceil(hostMem_gb) == hostMem_gb ? hostMem_gb : hostMem_gb.toFixed(2);
                        }
                    });
                    if (self.activeTab == "resPhy") {
                        //self.hostInfo.ipList.push(filterData.selectedZonehost.ipmiAddress);
                        self.hostInfo.ipList = filterData.selectedZonehost.fixedIps;
                    }
                    if (self.activeTab == "ipmi") {
                        if (filterData.selectedZonehost.driverInfo) {
                            self.hostInfo.ipList.push(filterData.selectedZonehost.driverInfo.ipmi_address);
                        }
                    }
                }
                self.getDiskPartition(filterData)
                self.getprocessMem(filterData)
                self.getHostAreaChart(filterData.selectedZonetype.regionKey, filterData.selectedZonehost.nodeUid, filterData);
            }

            function clearSvgContent() {
                for (let key in self.panels) {
                    _.each(self.panels[key], function (item, i) {
                        $("#" + key + i).html("");
                    });
                }
            }

            self.changeHost = function () {
                clearSvgContent();
                self.filterData.timeStep = "";
                self.filterData.from = null;
                self.filterData.to = null;
                self.filterData.precision = self.collectCycleList[0].value;
                self.filterData.definedTimeText = $translate.instant('aws.bill.chooseDate');
                renderHostInfo(self.filterData);
                self.clickMore = false;
                self.moreIp = false;
            };

            self.query = function () {
                self.getHostAreaChart(self.filterData.selectedZonetype.regionKey, self.filterData.selectedZonehost.nodeUid, self.filterData);
            };

            self.changeTab = function (type) {

                self.activeTab = type;
                self.hostInfo = {};
                self.diskTotal = "";
                self.diskUsageTotal = "";
                self.diskPathUsageTop5Data = [];
                self.processMemTop5Data = [];
                self.diskPath = {
                    options: []
                };
                self.diskio = {
                    options: []
                };
                self.netCard = {
                    options: []
                };
                if (type == "resPhy" || type == "ipmi") {
                    if (localStorage.installIronic == 1) {
                        self.pluginSwitch = 1;
                    } else {
                        self.pluginSwitch = 2;
                        return;
                    }
                } else {
                    self.pluginSwitch = 1;
                }
                initFilterData();
                clearSvgContent();
                getZone(type);
            };

            self.$watch(function () {
                return $routeParams.id;
            }, function (value) {
                $scope.animation = value ? "animateIn" : "animateOut";
                if (value) {
                    $scope.$broadcast("processDetail", value);
                }
            });

            self.$watch(function () {
                return $rootScope.clickedHostInfo
            }, function (hostItem) {
                getZone('node');
            });

            self.getMoreDetail = function (type) {
                if (type == "process") {
                    $scope.$broadcast('toDetailchild', true);
                }
                if (type == "disk") {
                    $scope.$broadcast('toDetailchild', false);
                }
            }
        }])
    //进程详情页
    .controller("processDetailCtrl", ["$scope", "$rootScope", "NgTableParams", "phyhostSrv", "$uibModal", "$translate", "userDataSrv",
        function ($scope, $rootScope, NgTableParams, phyhostSrv, $uibModal, $translate, userDataSrv) {
            var self = $scope;
            self.filterData = {};
            self.$on('toDetailchild', function (event, data) {
                self.processDetailShow = data;
            });
            /*详情页面进行浏览器刷新，判断在磁盘详情还是进程详情*/
            var URLhash = window.location.hash.split("id=")[1];
            if (URLhash == "process_detail") {
                self.processDetailShow = true;
            }

            self.$on("processDetail", function () {
                self.processCpuData = [];
                self.processMemData = [];

                userDataSrv.getRegionData().then(function (res) {
                    if (res && res.data && res.data.length > 0) {
                        self.zonetypes.options = self.zonetypes.options.splice(self.zonetypes.options.length, 0);
                        self.zonetypes.options = res.data.filter(item => {
                            return item.status == 3;
                        });
                        self.filterData.selectedZonetype = self.zonetypes.options[0];
                        _.each(self.zonetypes.options, item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.filterData.selectedZonetype = item;
                            }
                        });
                        return self.filterData.selectedZonetype.regionUid;
                    }

                }).then(function (regionUid) {
                    userDataSrv.getVmlist(regionUid).then(function (res) {
                        if (res && res.data && res.data.length > 0) {
                            res.data = res.data.filter(item => item.status == 4)
                            self.zonehosts = {
                                options: res.data,
                                selected: res.data[0]
                            };
                            //添加可以从详情页刷新定位上次node物理机，展示数据
                            self.zonehosts.selected = JSON.parse(window.localStorage.filterData);
                            self.filterData = self.zonehosts.selected;
                            self.filterData.selectedZonehost.nodeUid = (self.filterData.selectedZonehost.nodeUid != undefined) ? self.filterData.selectedZonehost.nodeUid : self.filterData.selectedZonehost.hostName;

                            /*phyhostSrv.processCpu(self.filterData.selectedZonetype.regionKey,self.filterData.selectedZonehost.nodeUid).then(function(res){
                                if(res && res.data){
                                    self.processCpuData = self.processCpuData.slice(self.processCpuData.length,0);
                                    _.map(res.data,function(item){
                                        self.processCpuData.push({
                                            name:item.processName,
                                            inUsed:((Number(item.cpu))/100).toFixed(4),
                                            total:1,
                                            type:"percent"
                                        });
                                    })
                                }
                            });
                            phyhostSrv.processMem(self.filterData.selectedZonetype.regionKey,self.filterData.selectedZonehost.nodeUid).then(function(res){
                                if(res && res.data){
                                    self.processMemData = self.processMemData.slice(self.processMemData.length,0)
                                    _.map(res.data,function(item,i){
                                        self.processMemData.push({
                                            name:item.processName,
                                            inUsed:((Number(item.mem))/100).toFixed(4),
                                            total:1,
                                            type:"percent"
                                        });
                                    })
                                }
                            });*/
                            phyhostSrv.processDetail(self.filterData.selectedZonetype.regionKey, self.filterData.selectedZonehost.nodeUid).then(function (res) {
                                if (res && res.data) {
                                    self.processDetailTable = new NgTableParams({
                                        count: 10
                                    }, { counts: [], dataset: res.data });
                                    //从进程详情中选mem和cpu，排序并显示到页面,2.4版没有物理机纳管，暂不考虑纳管情况
                                    self.processCpuData = self.processCpuData.slice(self.processCpuData.length, 0);
                                    _.map(res.data, function (item) {
                                        self.processCpuData.push({
                                            name: item.COMMAND,
                                            inUsed: ((Number(item.CPU)) / 100).toFixed(4),
                                            total: 1,
                                            type: "percent"
                                        });
                                    })
                                    var resData = angular.copy(res.data); //防止res.data改变影响self.processCpuData ，复制给其他变量
                                    //进程详情中按照cpu降序，获取前5
                                    if (resData.length >= 5) {
                                        self.processCpuData = self.processCpuData.slice(0, 5);
                                    }
                                    self.processMemData = self.processMemData.slice(self.processMemData.length, 0);
                                    //先mem降序排序，再取前5
                                    function compare(property) {
                                        return function (a, b) {
                                            var value1 = a[property];
                                            var value2 = b[property];
                                            return value1 - value2;
                                        }
                                    }
                                    resData.sort(compare('MEM'));
                                    resData.reverse();
                                    self.processMemData = self.processMemData.slice(self.processMemData.length, 0);
                                    _.map(resData, function (item, i) {
                                        self.processMemData.push({
                                            name: item.COMMAND,
                                            inUsed: ((Number(item.MEM)) / 100).toFixed(4),
                                            total: 1,
                                            type: "percent"
                                        });
                                    })
                                    if (resData.length >= 5) {  //防止列表长度少于5
                                        self.processMemData = self.processMemData.slice(0, 5);
                                    }
                                }
                            });
                        }
                    });
                })
            });
        }])
