import "./serviceMonitorSrv";
import "../../user/userDataSrv";
import {PiePanelDefault} from"../../chartpanel";
import {AreaPanelDefault} from"../../chartpanel";

var serviceModule = angular.module("serviceModule", ["ngTable", "usersrv", "ngAnimate", "ui.bootstrap", "phyHostSrv", "overviewSrvModule", "ngSanitize", "operatelogSrv", "serviceMonitorSrv"]);
serviceModule.controller("ServiceCtrl", function($scope, $rootScope, userDataSrv, NgTableParams, overviewSrv, $translate, phyhostSrv, operatelogSrv, serviceMonitorSrv) {
    var self = $scope;

    //区域选择
    // userDataSrv.getRegionData().then(function(res) {
    //     self.zonetypes = {
    //         options: res.data,
    //         selected: res.data[0],
    //     }
    //     self.zoneForm.selectedZonetype = self.zonetypes.selected;
    //     return self.zoneForm.selectedZonetype.regionUid;
    // }).then(function(id) {
    //     getHost(id);
    // });
    // self.zonetypechange = function(item) {
    //     getHost(item.regionUid);
    // };
    userDataSrv.getRegionData().then(function(res) {
        self.zoneForm = {};
        self.regionName = res.data[0].regionName;
        self.regionKey = res.data[0].regionKey;

        //mysql
        var mysqlNode = {
            "regionKey": self.regionKey,
            // "sql": "select DERIVATIVE(bytes_received)/1024 as read_flow,DERIVATIVE(bytes_sent)/1024 as write_flow from mysql where time> now() - 30m and code= '" + mysqlkey + "' and server= '" + mysqlhost + "' "
            "sql": "SHOW TAG VALUES FROM \"mysql\" WITH KEY = \"server\" "
        };


        phyhostSrv.sqlQuery(mysqlNode).then(function(res) {
        // serviceMonitorSrv.mysqlData(self.regionKey).then(function(res) {
            if (res.data) {
                var mysqlres = [
                    { host: res.data.results[0].series[0].values[0][1].substring(0,6) },
                    { host: res.data.results[0].series[0].values[1][1].substring(0,6) },
                    { host: res.data.results[0].series[0].values[2][1].substring(0,6) }
                ];
            } else {
                mysqlres = [{ host: 0 }, { host: 0 }, { host: 0 }];
            }


            // var mysqlres = [
            //     { host: res.data.results[0].series[0].values[0][1] },
            //     //     { host: res.data.results[0].series[0].values[1][1] },
            //     //     { host: res.data.results[0].series[0].values[2][1]}
            // ];
            self.mysqlhosts = {
                options: mysqlres,
                selected: mysqlres[0]
            };
            self.zoneForm.selectedMysqlhost = self.mysqlhosts.selected;
            return self.zoneForm.selectedMysqlhost.host;
        }).then(function(mysqlinfo) {
            getMysql(mysqlinfo);
        });
        self.mysqlchange = function(mysql_change) {
            getMysql(mysql_change.host);
        };
        var getMysql = function(mysql_info) {
            self.mysqlhost = mysql_info;
            self.mysqlChart(self.mysqlhost, self.regionKey);
        };
        self.mysqlChart = function(mysqlhost, mysqlkey) {
            var mysqlList = {
                "regionKey": mysqlkey,
                // "sql": "select DERIVATIVE(bytes_received)/1024 as read_flow,DERIVATIVE(bytes_sent)/1024 as write_flow from mysql where time> now() - 30m and code= '" + mysqlkey + "' and host= '" + mysqlhost + "' "
                "sql": "select DERIVATIVE(bytes_received)/1024 as read_flow,DERIVATIVE(bytes_sent)/1024 as write_flow from mysql where time> now() - 30m and code= '" + mysqlkey + "' and server= '" + mysqlhost + ":3307" + "'   "
            };
            phyhostSrv.sqlQuery(mysqlList).then(function(res) {
                var _mysqlData = [];
                if (res.data && res.data.results[0].series) {
                    _mysqlData.push(res.data.results[0].series[0]);
                }
                self.mysqlAreaChart = new AreaPanelDefault();
                self.mysqlAreaChart.panels.unit = "KBps";
                self.mysqlAreaChart.panels.data = _mysqlData;
            });
        };


        //memcached
        serviceMonitorSrv.memcachedData(self.regionKey).then(function(res) {
            if (res.data) {
                var memres = [
                    { host: res.data[0] }

                ];
            } else {
                memres = [{ host: 0 }];
            }

            // var memres = [
            //     { host: res.data[0] },
            //     // { host: res.data[1] },
            //     // { host: res.data[2] }
            // ];
            self.memhosts = {
                options: memres,
                selected: memres[0]
            };
            self.zoneForm.selectedMemhost = self.memhosts.selected;
            return self.zoneForm.selectedMemhost.host;
        }).then(function(meminfo) {
            getMem(meminfo);
        });
        self.memchange = function(mem_change) {
            getMem(mem_change.host);
        };
        var getMem = function(mem_info) {
            self.memhost = mem_info;
            self.memChart(self.memhost, self.regionKey);
        };
        self.memChart = function(memhost, memkey) {
            var memList = {
                "regionKey": memkey,
                // "sql": "select DERIVATIVE(bytes_read)/1024 as read_flow,DERIVATIVE(bytes_written)/1024 as write_flow from memcached  where time> now() - 30m and code= '" + memkey + "' and host= '" + memhost + "' "
                "sql": "select DERIVATIVE(bytes_read)/1024 as read_flow,DERIVATIVE(bytes_written)/1024 as write_flow from memcached  where time> now() - 30m and code= '" + memkey + "' "
            };
            phyhostSrv.sqlQuery(memList).then(function(res) {
                var _memcachedData = [];
                if (res.data && res.data.results[0].series) {
                    _memcachedData.push(res.data.results[0].series[0]);
                }
                self.memcachedAreaChart = new AreaPanelDefault();
                self.memcachedAreaChart.panels.unit = "KiB";
                self.memcachedAreaChart.panels.data = _memcachedData;

            });
        };


        //rabbitmq
        serviceMonitorSrv.rabbitmqData(self.regionKey).then(function(res) {

            if (res.data) {
                var mqres = [
                    { host: res.data[0] },
                    { host: res.data[1] },
                    { host: res.data[2] }
                ];
            } else {
                mqres = [{ host: 0 }, { host: 0 }, { host: 0 }];
            }

            // var mqres = [
            //     { host: res.data[0] },
            //     { host: res.data[1] },
            //     { host: res.data[2] }
            // ];
            self.mqhosts = {
                options: mqres,
                selected: mqres[0]
            };
            self.zoneForm.selectedMqhost = self.mqhosts.selected;
            return self.zoneForm.selectedMqhost.host;
        }).then(function(mqinfo) {
            getMq(mqinfo);
        });
        self.mqchange = function(mq_change) {
            getMq(mq_change.host);
        };
        var getMq = function(mq_info) {
            self.mqhost = mq_info;
            self.mqChart(self.mqhost, self.regionKey);
        };
        self.mqChart = function(mqhost, mqkey) {
            var mqList = {
                "regionKey": mqkey,
                // "sql": "select connections as rabbitmq_connections from rabbitmq_overview  where time> now() - 30m and code= '" + mqkey + "' and host= '" + mqhost + "' "
                "sql": "select connections as rabbitmq_connections from rabbitmq_overview  where time> now() - 30m and code= '" + mqkey + "' "
            };

            phyhostSrv.sqlQuery(mqList).then(function(res) {
                var _exchangeData = [];
                if (res.data && res.data.results[0].series) {
                    _exchangeData.push(res.data.results[0].series[0]);
                }
                self.exchangeAreaChart = new AreaPanelDefault();
                // self.exchangeAreaChart.panels.unit = "Bps";
                self.exchangeAreaChart.panels.data = _exchangeData;
            });

        };
        // serviceMonitorSrv.rabbitmqData(self.regionKey).then(function(res) {
        //     self.mqhosts = {
        //         options: res.data,
        //         selected: res.data[0],
        //     }
        //     self.zoneForm.selectedMqhost = self.mqhosts.selected;
        //     self.node_id = self.zoneForm.selectedMqhost.node_id;
        //     var mqList = {
        //         "regionKey": self.region_key,
        //         "sql": "select connections as connections,exchanges as exchanges from rabbitmq_overview where time> now() - 30min and code= '" + self.regionKey + "' and node_id= '" + self.node_id + "'"
        //     };
        //     phyhostSrv.sqlQuery(mqList).then(function(res) {
        //         // console.log(res.data)
        //         var _exchangeData = [];
        //         _netPacketData.push(res.data.results[0].series[0]);
        //         self.exchangeAreaChart = new AreaPanelDefault();
        //         // self.exchangeAreaChart.panels.unit = "Bps";
        //         self.exchangeAreaChart.panels.data = _exchangeData;
        //     });
        // });

    });

    serviceMonitorSrv.getDatas().then(function(result) {
        if(result && result.data){
            return result.data;
        }
    }).then(function(data) {
        // var item = "";
        var alldatas = angular.fromJson(data);
        for (var key in alldatas) {
            if (key == "compute") {
                self.novaPieChart = new PiePanelDefault();
                self.novaPieChart.panels.data = alldatas[key];
                var sum = 0;
                angular.forEach(self.novaPieChart.panels.data, function(v) {
                    for (var a in v) {
                        // var b = "";
                        v.name = a;
                        v.value = v[a].success;
                        v.abnormal = v[a].error;
                        delete v[a];
                    }
                    sum += v.value + v.abnormal;
                });
                self.novaTotal = sum;
                self.novaPieChart.panels.pieType = "category";
            }
            if (key == "storage") {
                self.cinderPieChart = new PiePanelDefault();
                self.cinderPieChart.panels.data = alldatas[key];
                sum = 0;
                angular.forEach(self.cinderPieChart.panels.data, function(v) {
                    for (var a in v) {
                        // var b = "";
                        v.name = a;
                        v.value = v[a].success;
                        v.abnormal = v[a].error;
                        delete v[a];
                    }
                    sum += v.value + v.abnormal;
                });
                self.cinderTotal = sum;
                self.cinderPieChart.panels.pieType = "category";
            }
            if (key == "network") {
                self.networkPieChart = new PiePanelDefault();
                self.networkPieChart.panels.data = alldatas[key];
                sum = 0;
                angular.forEach(self.networkPieChart.panels.data, function(v) {
                    for (var a in v) {
                        // var b = "";
                        v.name = a;
                        v.value = v[a].success;
                        v.abnormal = v[a].error;
                        delete v[a];
                    }
                    sum += v.value + v.abnormal;
                });
                self.networkTotal = sum;
                self.networkPieChart.panels.pieType = "category";
            }
        }
    });

});
