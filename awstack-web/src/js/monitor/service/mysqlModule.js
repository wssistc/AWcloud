import "./mysqlSrv";
import {
    AreaPanelDefault
} from "../../chartpanel";
import {
    mysqlAreaChartDefault
} from "../../chartpanel";

var mysqlModule = angular.module("mysqlModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ngSanitize", "mysqlSrv", "usersrv"]);
mysqlModule.controller("mysqlCtrl", ["$scope", "$rootScope", "NgTableParams", "$translate", "mysqlSrv", "userDataSrv",
    function($scope, $rootScope, NgTableParams, $translate, mysqlSrv, userDataSrv) {
        var self = $scope;
        $rootScope.loading = true;
        self.queryLimit = {};

        function panelsDataFunc(item, key, color) {
            self.panels[key] = (self.panels[key]).slice((self.panels[key]).length, 0);
            var areaChart = new AreaPanelDefault();
            areaChart.panels.title = $translate.instant("aws.monitor." + item.chartPerm.title);
            areaChart.panels.unit = item.chartPerm.unit;
            areaChart.panels.priority = item.chartPerm.priority;
            if (color % 2 == 0) {
                areaChart.panels.colors = ["#51a3ff"];
            } else {
                areaChart.panels.colors = ["#1bbc9d"];
            }
            mysqlSrv.sqlQuery(
                item.sqlPerm
            ).then(function(res) {
                if (res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series) {
                    areaChart.panels.data.push(res.data.results[0].series[0]);
                } else {
                    var defaultChartData = {
                        "columns": ["time", item.chartPerm.title],
                        "values": [
                            [moment().subtract(30, "m"), 0],
                            [moment(), 0]
                        ],
                        "default": true
                    };
                    areaChart.panels.data.push(defaultChartData);

                }
                self.panels[key].push(areaChart.panels);
                $rootScope.loading = true;
            })
        }

        function mysqlChart(regionKey, timeRange, target) {
            self.panels = {};
            var areaChartPermas = new mysqlAreaChartDefault(regionKey, timeRange, target);
            $rootScope.lazyOnType = {};
            var count = 0;
            for (let key in areaChartPermas.chartSqls) {
                self.panels[key] = [];
                if (key == "visit") {
                    $rootScope.lazyOnType[key] = true;
                } else {
                    count++;
                    _.each(areaChartPermas.chartSqls[key], function(item) {
                        panelsDataFunc(item, key, count);
                    })
                }
            }

            /*var mysqlVisitListener = self.$on("visit", function(e) {
                $rootScope.loading = false;
                _.each(areaChartPermas.chartSqls.visit, function(item) {
                    panelsDataFunc(item, "visit", "3");
                })
                mysqlVisitListener();
            });*/
            _.each(areaChartPermas.chartSqls.visit, function(item) {
                panelsDataFunc(item, "visit", "3");
            })
        }

        self.changeMysql = function() {
            mysqlChart(self.queryLimit.regionKey, self.queryLimit.timeRange, self.queryLimit.selectedMysql.server);
        };

        userDataSrv.getRegionData().then(function(res) {
            if (res && res.data && res.data[0] && res.data[0].regionKey) { 
                res.data = res.data.filter(item => {
                    return item.status == 3;
                });
                self.queryLimit.regionKey = res.data[0].regionKey;
                _.each(res.data, item => {
                    if (item.regionKey == localStorage.regionKey) {
                        self.queryLimit.regionKey = item.regionKey;
                    }
                });
                mysqlSrv.getMysqlBasicData(self.queryLimit.regionKey).then(function(res) {
                    if (res && res.data.length > 0) {
                        self.mysqls = {
                            options: res.data
                        };
                        self.queryLimit.selectedMysql = self.mysqls.options[0];
                        mysqlChart(self.queryLimit.regionKey, self.queryLimit.timeRange, self.queryLimit.selectedMysql.server);
                    }
                });
            }
        });

    }
]);