import "./monitorViewSrv";
import "../../overview/overviewSrv";
import "../../user/userDataSrv";
import { AreaPanelDefault } from "../../chartpanel";
import { monitorViewChartDefault } from "../../chartpanel";

var monitoroverviewModule = angular.module("monitorview", ["ngTable", "usersrv", "overviewSrvModule", "viewSrv", "ngAnimate", "ui.bootstrap", "overviewSrvModule", "ngSanitize"]);
monitoroverviewModule.controller("monitorviewCtrl", function($scope, $rootScope, overviewSrv, userDataSrv, viewSrv, NgTableParams, $translate, $uibModal, resviewSrv) {
    var self = $scope;
    self.visionPermission = localStorage.permission;
    var bar_style = {
        a: "progress-bar-redDark",
        b: "progress-bar-red",
        c: "progress-bar-orangeDark",
        d: "progress-bar-orange",
        e: "progress-bar-blueDark",
        f: "progress-bar-blue",
        g: "progress-bar-green"
    };
    function formatBarStyle(item, percent, barType) {
        if (percent <= 30)
            item[barType] = bar_style.g;
        else if (percent <= 50)
            item[barType] = bar_style.f;
        else if (percent <= 65)
            item[barType] = bar_style.e;
        else if (percent <= 75)
            item[barType] = bar_style.d;
        else if (percent <= 85)
            item[barType] = bar_style.c;
        else if (percent <= 95)
            item[barType] = bar_style.b;
        else
            item[barType] = bar_style.a;
    }

    // 获取告警物理机以及虚拟机数量
    viewSrv.nodeCounts().then(function(result) {
        if (result && result.data) {
            self.alarmphy = result.data.phyCounts ? result.data.phyCounts : 0;
            self.alarmVm = result.data.virCounts ? result.data.virCounts : 0;
        }
        // 获取物理机总数
        overviewSrv.getHostInfo().then(function(result) {
            if (result && result.data) {
                self.phyTotal = result.data.host_registered_total ? result.data.host_registered_total : 0;
                formatBarStyle(self, (self.alarmphy * 100 / self.phyTotal), "PhyAlarmBar");
            }
        });

        //获取虚拟机总数
        // viewSrv.getInsInfo().then(function(result) {
        //     if (result && result.data) {
        //         self.vmTotal = result.total ? result.total : 0;
        //         formatBarStyle(self, (self.alarmVm * 100 / self.vmTotal), "VmAlarmBar");
        //     }
        // });
    });

    //区域选择
    // userDataSrv.getRegionData().then(function(res) {
        // self.regionKey = res.data[0].regionKey;
        //获取top5物理机数据
        // viewSrv.phyTop(self.regionKey).then(function(result) {
        //     if (result && result.data) {
        //         self.phyTopData = _.map(result.data, function(v) {
        //             formatBarStyle(v, v.usage_total, "phyTopBar");
        //             return v;
        //         });
        //     }
        // });
        //获取top5虚拟机数据
        // self.cpuInfo = {};
        // self.cpuInfo.noData = false;
        //self.cpuInfo.loading = true;
        viewSrv.virtualTop(localStorage.regionKey).then(function(result) {
            // if (result && result.data && result.data.cpuUsageTop5) {
            //     if(result.data.cpuUsageTop5.length==0){
            //         self.cpuInfo.noData = true;
            //     }
            //     self.virtualTopData = _.map(result.data.cpuUsageTop5, function(v) {
            //         formatBarStyle(v, v.usage_total, "vmTopBar");
            //         return v;
            //     });
                
            // }
            if(result && result.data && result.data.virtualhostsCount){
                self.vmTotal = result.data.virtualhostsCount;
                formatBarStyle(self, (self.alarmVm * 100 / self.vmTotal), "VmAlarmBar");
            }
        });
    // });

    //获取top5物理机数据
    resviewSrv.queryNew({
        "regionCode": localStorage.regionKey,
        "metrics": "cpu",
        "objType": "physical",
        "topType": "top",
        "topLength": 5
    }).then(function(res) {
        if (res && res.data) {
            if(!res.data.chartData) {
                self.phyTopData = {
                    data: {
                        xAxis: [],
                        series: []
                    }
                }
                return;
            }
            var series = [];
            var xData = [];
            res.data.chartData.columes.map(item => {
                xData.push(moment(item).format('HH:mm'));
            })
            for(let k in res.data.chartData.data) {
                res.data.chartData.data[k].map((item, index) => {
                    res.data.chartData.data[k][index] = item?item.toFixed(2):item;
                });
            }
            res.data.chartData.legend.map(item => {
                var seriesItem = {
                    name: item,
                    type: "line",
                    data: res.data.chartData.data[item]
                }
                series.push(seriesItem);
            })
            self.phyTopData = {
                title: $translate.instant('aws.monitor.overview.phyTop5'),
                data: {
                    legend: {
                        show: true,
                        orient: 'horizontal',
                        top: 'bottom',
                        left: 20,
                    },
                    gridBottom: "15%",
                    unit: "%",
                    toolboxShow: false,
                    xAxis: xData,
                    series: series
                }
            }
        }
    });

    //获取top5虚拟机数据
    resviewSrv.queryNew({
        "regionCode": localStorage.regionKey,
        "metrics": "cpu",
        "objType": "virtual",
        "topType": "top",
        "topLength": 5
    }).then(function(res) {
        if (res && res.data) {
            if(!res.data.chartData) {
                self.virtualTopData = {
                    data: {
                        xAxis: [],
                        series: []
                    }
                }
                return;
            }
            var series = [];
            var xData = [];
            res.data.chartData.columes.map(item => {
                xData.push(moment(item).format('HH:mm'));
            })
            for(let k in res.data.chartData.data) {
                res.data.chartData.data[k].map((item, index) => {
                    res.data.chartData.data[k][index] = item?item.toFixed(2):item;
                });
            }
            // res.data.chartData.legend.map(item => {
            //     var seriesItem = {
            //         name: item,
            //         type: "line",
            //         data: res.data.chartData.data[item]
            //     }
            //     series.push(seriesItem);
            // })
            for(var n in res.data.chartData.data){
                res.data.chartData.legend.push(n)
                var seriesItem = {
                    name: n,
                    type: "line",
                    data: res.data.chartData.data[n]
                }
                series.push(seriesItem);
            }
            self.virtualTopData = {
                title: $translate.instant('aws.monitor.overview.virtualTop5'),
                data: {
                    legend: {
                        show: true,
                        orient: 'horizontal',
                        top: 'bottom',
                        left: 20,
                        type:'scroll'
                    },
                    gridBottom: "15%",
                    unit: "%",
                    toolboxShow: false,
                    xAxis: xData,
                    series: series
                }
            }
        }
    })

    self.panels = [];
    self.barDatas = [];
    self.filterData = {
        timeStep: "3d",
        from: null,
        to: null,
        definedTimeText:$translate.instant('aws.bill.chooseDate')
    };
    var chartOrder = {
        "virtual": 1,
        "cpu": 2,
        "mem": 3,
        "storage": 4,
        "floatingip": 5,
        "project": 6,
    }
    
    function panelsDataFunc(item,key,color){
        self.panels = self.panels.slice(self.panels.length,0);
        var areaChart = new AreaPanelDefault();
        areaChart.panels.title = $translate.instant("aws.monitor.overview." + item.chartPerm.title);
        areaChart.panels.unit = item.chartPerm.unit;
        areaChart.panels.chartName =  item.chartPerm.title;
        areaChart.panels.priority = item.chartPerm.priority;
        areaChart.panels.xAxisType = "date";

        if(color%2 == 0){
            areaChart.panels.colors = ["#51a3ff"];
        }else{
             areaChart.panels.colors = ["#1bbc9d"];
        }

        var chartType = "line";
        var barChart = {
            title: $translate.instant("aws.monitor.overview." + item.chartPerm.title),
            chartName: item.name,
            order: chartOrder[item.chartPerm.title],
            data:{
                legend: {
                    show: false
                },
                dateType: "day",
                toolboxShow: true,
                xAxis: [],
                series: []
            }
        }
        var dateType = self.filterData.timeStep == "defined" ? "custom" : "day";
        var amount = null;
        if(self.filterData.timeStep != "defined") {
            amount = self.filterData.timeStep.substring(0, self.filterData.timeStep.length - 1);
        }
        var data={
            enterpriseUid: localStorage.enterpriseUid,
            regionName: localStorage.regionName,
            regionKey: localStorage.regionKey,
            dateType: dateType,
            amount: amount,
            startTime: moment(self.filterData.from).format("YYYY-MM-DD 00:00:00"),
            endTime: moment(self.filterData.to).subtract(1, "d").format("YYYY-MM-DD 23:59:59"),
            resourceName: item.name
        }
        viewSrv.getHistoryDetailNew(
            data
        ).then(function(res){
            if(res && res.data) {
                //当前内存传过来的实际是kb值
                if(areaChart.panels.chartName == "mem"){
                    res.data.values.map(value => {
                        value[1]?value[1] = (value[1]/1024).toFixed(1):"";
                    })
                }else if(areaChart.panels.chartName == "storage"){
                    res.data.values.map(value => {
                        value[1]?value[1] = value[1].toFixed(1):"";
                    })
                }
                var seriesData = [];
                var xData = [];
                res.data.values.map(item => {
                    seriesData.push(item[1] || 0);
                    xData.push(moment(item[0]).format("YYYY-MM-DD"));
                })

                var obj = {
                    name: res.data.columns[1],
                    type: chartType,
                    data: seriesData,
                    areaStyle: {
                        opacity: 0.2,
                    }
                }
                barChart.data.xAxis = xData;
                barChart.data.unit ="";
                barChart.data.series.push(obj);
                self.barDatas.push(barChart);
            }
        })
    }

    var monitorviewChartPermas = new monitorViewChartDefault(localStorage.enterpriseUid);
    self.resourceQuery = function() {
        self.barDatas = [];
        for(let key in monitorviewChartPermas.chartSqls){
            self.panels[key] = [];
            _.each(monitorviewChartPermas.chartSqls[key],function(item){
                panelsDataFunc(item,key,"1");
            })
        }
    }
    self.resourceQuery();

    self.goToChartView = function(item){
        $rootScope.clickedHostInfo = item;
    };

    self.chartClick = function(chartName) {
        // $uibModal.open({
        //     animation: true,
        //     templateUrl: "js/monitor/monitorview/tmpl/echartsModel.html",
        //     controller: "monitorEchartsCtrl",
        //     resolve: {
        //         chartName: function() {
        //             return chartName;
        //         }
        //     }
        // });
    }
        

    /*self.panels_list = [];
    // 1
    viewSrv.getHistoryDetail({
        "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + localStorage.enterpriseUid + "' and resource_name='cpu' group by time(1d) "
    }).then(function(res) {
        if (res && res.data) {
            var _cpuData = [];
            if (res.data.results && res.data.results[0] && res.data.results[0].series && res.data.results[0].series[0]) {
                _cpuData.push(res.data.results[0].series[0]);
            }
            self.CPUAreaChart = new AreaPanelDefault();
            self.CPUAreaChart.panels.title = $translate.instant("aws.monitor.overview.cpu");
            self.CPUAreaChart.panels.data = _cpuData;
            self.CPUAreaChart.panels.xAxisType = "date";
            self.CPUAreaChart.panels.sorts = "a";
            self.panels_list.push(self.CPUAreaChart.panels);
        }

    });

    // 2
    viewSrv.getHistoryDetail({
        "sql": "select max(value)/1024 as region1 from quota where time > now() - 30d and enterprise_uid= '" + localStorage.enterpriseUid + "' and resource_name='mem' group by time(1d) "
    }).then(function(res) {
        if (res && res.data) {
            var _memData = [];
            if (res.data.results && res.data.results[0] && res.data.results[0].series && res.data.results[0].series[0]) {
                _memData.push(res.data.results[0].series[0]);
            }
            self.memeryAreaChart = new AreaPanelDefault();
            self.memeryAreaChart.panels.title = $translate.instant("aws.monitor.overview.mem");
            self.memeryAreaChart.panels.xAxisType = "date";
            self.memeryAreaChart.panels.data = _memData;
            self.memeryAreaChart.panels.sorts = "b";
            self.panels_list.push(self.memeryAreaChart.panels);
        }

    });

    // 3
    viewSrv.getHistoryDetail({
        "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + localStorage.enterpriseUid + "' and resource_name='disk' group by time(1d) "
    }).then(function(res) {
        if (res && res.data) {
            var _storageData = [];
            if (res.data.results && res.data.results[0] && res.data.results[0].series && res.data.results[0].series[0]) {
                _storageData.push(res.data.results[0].series[0]);
            }
            self.storageAreaChart = new AreaPanelDefault();
            self.storageAreaChart.panels.title = $translate.instant("aws.monitor.overview.storage");
            self.storageAreaChart.panels.xAxisType = "date";
            self.storageAreaChart.panels.data = _storageData;
            self.storageAreaChart.panels.sorts = "c";
            self.panels_list.push(self.storageAreaChart.panels);
        }

    });

    // 4
    viewSrv.getHistoryDetail({
        "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + localStorage.enterpriseUid + "' and resource_name='instances' group by time(1d) "
    }).then(function(res) {
        if (res && res.data) {
            var _vmhostData = [];
            if (res.data.results && res.data.results[0] && res.data.results[0].series && res.data.results[0].series[0]) {
                _vmhostData.push(res.data.results[0].series[0]);
            }
            self.vmHostsAreaChart = new AreaPanelDefault();
            self.vmHostsAreaChart.panels.title = $translate.instant("aws.monitor.overview.virtual");
            self.vmHostsAreaChart.panels.xAxisType = "date";
            self.vmHostsAreaChart.panels.data = _vmhostData;
            self.vmHostsAreaChart.panels.sorts = "d";
            self.panels_list.push(self.vmHostsAreaChart.panels);
        }

    });

    // 5
    viewSrv.getHistoryDetail({
        "sql": "select max(value) as region1 from quota where time > now() - 30d and enterprise_uid= '" + localStorage.enterpriseUid + "' and resource_name='project' group by time(1d) "
    }).then(function(res) {
        var _projectData = [];
        if (res.data && res.data.results[0].series) {
            _projectData.push(res.data.results[0].series[0]);
        }
        self.projectAreaChart = new AreaPanelDefault();
        self.projectAreaChart.panels.title = $translate.instant("aws.monitor.overview.project");
        self.projectAreaChart.panels.xAxisType = "date";
        self.projectAreaChart.panels.data = _projectData;
        self.projectAreaChart.panels.sorts = "e";
        self.panels_list.push(self.projectAreaChart.panels);
    });*/
});

monitoroverviewModule.controller("monitorEchartsCtrl", ["$scope", "$translate", "$uibModalInstance", "chartName",
    function($scope, $translate, $uibModalInstance, chartName) {
        var self = $scope;
        self.timeType = {
            options: [{
                "name": $translate.instant('aws.bill.timeType.oneWeek'),
                "value": "7d"
            }, {
                "name": $translate.instant('aws.bill.timeType.oneMonth'),
                "value": "30d"
            }]
        };
        self.filterData = {
            timeStep: "",
            from: null,
            to: null,
            definedTimeText:$translate.instant('aws.bill.chooseDate')
        };
        self.modelTitle = $translate.instant('aws.monitor.overview.compare.' + chartName);
        self.query = function() {
            
        }
}]);
