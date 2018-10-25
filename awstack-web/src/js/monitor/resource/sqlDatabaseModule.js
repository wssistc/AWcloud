import "./phyHostSrv";
import "../../user/userDataSrv";
import { sqlDatabaseParams } from "../../chartpanel";
import { AreaPanelDefault } from "../../chartpanel";

angular.module("sqlDatabaseModule", ["ngSanitize", "ngTable", "phyHostSrv", "usersrv"])

    .controller("sqlDatabaseCtrl", ["$scope", "$interval", "$rootScope", "NgTableParams", "$uibModal", "$timeout", "phyhostSrv", "$translate",
        "userDataSrv", "$routeParams", "kbnSrv", "vmFuncSrv", "NOPROJECTMENU",
        function ($scope, $interval, $rootScope, NgTableParams, $uibModal, $timeout, phyhostSrv, $translate,
            userDataSrv, $routeParams, kbn, vmFuncSrv, NOPROJECTMENU) {
            var self = $scope;
            self.instances={};
            self.collectCycleList = [
                {name: "1分钟", value: 60},
                {name: "5分钟", value: 300},
                {name: "1小时", value: 3600},
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
            //获取实例列表
            self.instancesList=[];
            phyhostSrv.getInstancesList().then(function(res){
                if(res&&res.data&&angular.isArray(res.data)){
                    self.instancesList=res.data;
                    self.instances.selectedInstance=self.instancesList[0];
                    self.query();
                }
            });
            self.changeCluster=function(){
                self.query();
            };
            vmFuncSrv.getSqlDatabaseChartFunc(self, sqlDatabaseParams, AreaPanelDefault);
            var memChartListener, diskChartListener, netcardChartListener;
            var initFilterData = function () {
                self.filterData = {
                    timeStep: "",
                    from: "",
                    to: "",
                    rangeHours: 0.5,
                    precision: self.collectCycleList[0].value,
                    definedTimeText: $translate.instant('aws.bill.chooseDate')
                };
            };
            initFilterData();
            self.query = function () {
                self.getHostAreaChart(localStorage.regionKey,self.filterData,"",self.instances.selectedInstance.clusterName);
            };
            
        }]);
    
