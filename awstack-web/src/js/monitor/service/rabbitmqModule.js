import "./rabbitmqSrv";
import { AreaPanelDefault } from "../../chartpanel";
import { rabbitmqAreaChartDefault } from "../../chartpanel";

var rabbitmqModule = angular.module("rabbitmqModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ngSanitize", "rabbitmqSrv", "usersrv"])
    .filter('millSecondsToTimeString', function() {
        return function(millseconds) {
            var oneSecond = 1000;
            var oneMinute = oneSecond * 60;
            var oneHour = oneMinute * 60;
            var oneDay = oneHour * 24;

            var seconds = Math.floor((millseconds % oneMinute) / oneSecond);
            var minutes = Math.floor((millseconds % oneHour) / oneMinute);
            var hours = Math.floor((millseconds % oneDay) / oneHour);
            var days = Math.floor(millseconds / oneDay);

            var timeString = '';
            if (days !== 0) {
                timeString += (days !== 1) ? (days + ' d ') : (days + ' d ');
            }
            if (hours !== 0) {
                timeString += (hours !== 1) ? (hours + ' h ') : (hours + ' h ');
            }
            if (minutes !== 0) {
                timeString += (minutes !== 1) ? (minutes + ' m ') : (minutes + ' m ');
            }
            if (seconds !== 0 || millseconds < 1000) {
                timeString += (seconds !== 1) ? (seconds + ' s ') : (seconds + ' s ');
            }

            return timeString;
        };
    });

rabbitmqModule.controller("rabbitmqCtrl", ["$scope", "$rootScope", "NgTableParams", "$translate", "rabbitmqSrv", "userDataSrv", "$routeParams",
    function($scope, $rootScope, NgTableParams, $translate, rabbitmqSrv, userDataSrv, $routeParams) {
        var self = $scope;
        self.panels = {};
        self.queue = true;
        
        function rabbitmqBasicInfoFunc(regionKey) {
            rabbitmqSrv.getRabbitmqBasicData(regionKey).then(function(res) {
                if (res && res.data) {
                    self.rabbitmqBasicInfo = res.data[0];
                }
            });
        }

        function rabbitmqNodesInfoFunc(regionKey) {
            rabbitmqSrv.getRabbitmqNodesData(regionKey).then(function(res) {
                if (res && res.data) {
                    var nodesInfoTableData = _.map(res.data, function(item) {
                        item.mem_used = (item.mem_used / 1024 / 1024).toFixed(2); //b to MB
                        item.disk_free = (item.disk_free / 1024 / 1024 / 1024).toFixed(2); // b to GB
                        return item;
                    });
                    self.tableParams = new NgTableParams({
                        count: 10
                    }, { counts: [], dataset: nodesInfoTableData });
                }
            })
        }

        function panelsDataFunc(item, key, color) {
            self.panels[key] = (self.panels[key]).slice((self.panels[key]).length, 0);
            var areaChart = new AreaPanelDefault();
            areaChart.panels.title = $translate.instant("aws.monitor." + item.chartPerm.title);
            areaChart.panels.unit = item.chartPerm.unit;
            areaChart.panels.chartName = item.chartPerm.title;
            areaChart.panels.priority = item.chartPerm.priority;
            if (color % 2 == 0) {
                areaChart.panels.colors = ["#51a3ff"];
            } else {
                areaChart.panels.colors = ["#1bbc9d"];
            }
            rabbitmqSrv.sqlQuery(
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
                        "default":true
                    };
                    areaChart.panels.data.push(defaultChartData);
                }
                self.panels[key].push(areaChart.panels);
            })
        }

        function rabbitmqChart() {
            self.panels = {};
            var areaChartPermas = new rabbitmqAreaChartDefault();
            var count = 0;
            for (let key in areaChartPermas.chartSqls) {
                self.panels[key] = [];
                count++
                _.each(areaChartPermas.chartSqls[key], function(item) {
                    panelsDataFunc(item, key, count);
                })
            }
        }

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
                rabbitmqBasicInfoFunc(self.region_key);
                rabbitmqNodesInfoFunc(self.region_key);
            }
        });
        rabbitmqChart();


        $scope.$watch(function() {
            return $routeParams.id;
        }, function(value) {
            $scope.animation = value ? "animateIn" : "animateOut";
            if (value) {
                $scope.$broadcast("nodeDetail", value);
            }
        });
    }
]);
rabbitmqModule.controller("rabbitmqNodeDetailCtrl", ["$scope", "$rootScope", "NgTableParams", "rabbitmqSrv", "$uibModal", "$translate",
    function($scope, $rootScope, NgTableParams, rabbitmqSrv, $uibModal, $translate) {
        var self = $scope;

        self.$on("nodeDetail", function(e, id) {

        })
    }
])
