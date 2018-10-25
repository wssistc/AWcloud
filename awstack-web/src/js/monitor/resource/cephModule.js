import "./cephSrv";
import { PiePanelDefault } from "../../chartpanel";
import { AreaPanelDefault } from "../../chartpanel";
import { cephAreaChartDefault} from "../../chartpanel";

angular.module("cephModule", ["ngSanitize", "phyHostSrv", "usersrv", "ui.bootstrap.tpls", "ngTable", "cephSrv"])
.controller("cephCtrl", function($scope, phyhostSrv, userDataSrv, $rootScope, GLOBAL_CONFIG, NgTableParams, $uibModal, cephSrv, $translate) {
    if(!localStorage.cephService) return;
    var self = $scope;
    self.panels = {};
    self.dynamicPopover = {};
    // 获取ceph状态
    cephSrv.getCephStatus().then(function(result) {
        if (result && result.data) {
            self.cephstatus = $translate.instant("aws.monitor.ceph.status." + result.data);
        }
    });

    cephSrv.getCephWarnig().then(function(result) {
        if (result && result.data) {
            self.totalWarnings = result.total;
            self.warnInfos = angular.fromJson(result.data);
            self.dynamicPopover.warnTmplUrl = self.totalWarnings>0?"warningTable.html":"";
        }
    });

    // 获取monitor状态
    cephSrv.getMonitorStatus().then(function(result) {
        if (result && result.data) {
            var monitorstatus = angular.fromJson(result.data);
            self.monitorstatusavailable = monitorstatus.available.toString();
            self.monitorstatustotal = monitorstatus.total.toString();
            self.monMsgs = monitorstatus.monitors;
            self.dynamicPopover.hostTmplUrl = self.monitorstatusavailable>0?"hostInfoTable.html":"";
        }
    });

    // 获取PG状态
    cephSrv.getPgStatus().then(function(result) {
        if (result && result.data) {
            var item = angular.fromJson(result.data);
            // { "pg_status": [{ "numbers": "704", "status": "active+clean" }], "pg_nums": "704" }
            if (item) {
                self.pg_nums = item.pg_nums;
                var pgData = [];
                for (var i = 0; i < item.pg_status.length; i++) {
                    pgData.push({
                        "name": item.pg_status[i].status,
                        "value": item.pg_status[i].numbers
                    });
                }
            }
            self.pieshow = true;
            self.PGStatusChart = new PiePanelDefault();
            self.PGStatusChart.panels.data = pgData;
            self.PGStatusChart.panels.pieType = "category";
            self.pgCenterTex = function() {
                var sum = 0,
                    active_clean_num = 0;
                _.forEach(pgData, function(v) {
                    if (v.name === "active+clean") {
                        active_clean_num = v.value;
                    }
                    sum += v.value;
                });
                // return (active_clean_num / 1000).toFixed(1) + "K/" + (sum / 1000).toFixed(1) + "K";
                return (active_clean_num / 1000).toFixed(1) + "K/" + (self.pg_nums / 1000).toFixed(1) + "K";
            }();
        }
    });

    function bytesToSize(bytes) {
        var k = 1024, // or 1000
            sizes = ["GB", "TB", "PB", "EB", "ZB", "YB"], // sizes = ['Bytes', 'KB', 'MB',"GB", "TB", "PB", "EB", "ZB", "YB"],
            i;
        if (bytes < 0) i = Math.floor(Math.log(-bytes) / Math.log(k));
        if (bytes >= 0 && bytes < 1) return { a: 0, b: "0 GB" };
        if (bytes >= 1)
            i = Math.floor(Math.log(bytes) / Math.log(k));
        //var gtZero = ((bytes / Math.pow(k, i)).toPrecision(3)) >= 0 ? ((bytes / Math.pow(k, i)).toPrecision(3)) : 0;
        //解决页面使用科学计算法展示数据的bug
        var gtZero = (bytes / Math.pow(k, i)).toPrecision(3) >= 0 ? (bytes / Math.pow(k, i)): 0;
        if(gtZero.toString().indexOf(".")>-1) {
            if(gtZero.toString().split(".")[1].length>2){
                gtZero = gtZero.toFixed(2)
            }
        }
        return {
            a: (bytes).toPrecision(3),
            b: gtZero + " " + sizes[i]
        };
    }

    function storageChartFunc(used, total) {
        self.storageChart = new PiePanelDefault();
        self.storageChart.panels.data = [
            { name: $translate.instant("aws.overview.inUsed"), value: bytesToSize(used).a, valueB: bytesToSize(used).b },
            { name: $translate.instant("aws.overview.unUsed"), value: bytesToSize(total - used).a, valueB: bytesToSize(total - used).b }
        ];
        self.storageChart.panels.colors = ["#1ABC9C", "#e5e5e5"];
        self.storageChart.panels.pieType = "percent";
    }
    
    //磁盘存储pie
    cephSrv.getDiskUsage().then(function(result) {
        if (result && result.data) {
            self.diskpieshow = true;
            var item = angular.fromJson(result.data);
            let total_gb = item.total_bytes/1024/1024/1024;
            let used_gb = item.total_used_bytes/1024/1024/1024;
            self.storageTotal = bytesToSize(total_gb);
            storageChartFunc(used_gb, total_gb);
        }
    });

    //获取pools表格数据
    function getPoolInstance() {
        cephSrv.getData().then(function(result) {
            result ? self.loadData = true : "";
            if (result && result.data) {
                var tableData = result.data;
                _.forEach(tableData,function(item){
                    item.rate =(item.used_gb*100/(item.used_gb+item.space_gb)).toFixed(2);
                })
                self.tableParamsPools = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: tableData });
            }
        });
    }

    //获取osd表格数据
    function getOsdInstance() {
        cephSrv.getOsdData().then(function(result) {
            if (result && result.data) {
                self.tableParamsOsds = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: result.data });
            }
        });
    }
   
    function renderAreaChart(region_key,type,target){
        var cephChartPermas = new cephAreaChartDefault(region_key,type,target);
        var count = 0;
        for(let key in cephChartPermas[type+"ChartSqls"]){
            self.panels[key] = [];
            count++;
            _.each(cephChartPermas[type+"ChartSqls"][key],function(item){
                panelsDataFunc(item,key,count);
            })
        }
    }

    function panelsDataFunc(item,key,color){
        self.panels[key] = (self.panels[key]).slice((self.panels[key]).length,0);
        var areaChart = new AreaPanelDefault();
        areaChart.panels.title = $translate.instant("aws.monitor."+item.chartPerm.title);
        areaChart.panels.unit = item.chartPerm.unit;
        areaChart.panels.priority = item.chartPerm.priority;
        if(color%2 == 0){
            areaChart.panels.colors = ["#51a3ff"];
        }else{
             areaChart.panels.colors = ["#1bbc9d"];
        }
        phyhostSrv.sqlQuery(
            item.sqlPerm
        ).then(function(res){
            if(res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                areaChart.panels.data.push(res.data.results[0].series[0]);
            }else{
                var defaultChartData = {
                    "columns":["time",item.chartPerm.title],
                    "values":[
                        [moment().subtract(30,"m"),0],
                        [moment(),0]
                    ],
                    "default":true
                };
                areaChart.panels.data.push(defaultChartData);

            }
            self.panels[key].push(areaChart.panels);
        })
    }

    getPoolInstance();
    getOsdInstance();

    self.poolsTab = function() {
        getPoolInstance();
    };

    self.osdTab = function() {
        getOsdInstance();
    };

    userDataSrv.getRegionData().then(function(res) {
        self.region_key = res.data[0].regionKey;
        renderAreaChart(self.region_key,"cluster");
    });
    
    //获取PG详情的数据
    $scope.$on("getDetail", function(event, value) {
        self.poolName = value;
        userDataSrv.getRegionData().then(function(res) {
            if (res && res.data && res.data[0] && res.data[0].regionKey) {
                res.data = res.data.filter(item => {
                    return item.status == 3;
                });
                self.region_key = res.data[0].regionKey;
                _.each(res.data, item => {
                    if (item.regionKey == localStorage.regionKey) {
                        self.region_key = item.regionKey;
                    }
                });
                renderAreaChart(self.region_key, "pool", value);
            }
        });
    });
});
