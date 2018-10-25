import "./consumeViewSrv";
import { PiePanelDefault } from "../../chartpanel";
import { AreaPanelDefault2 } from "../../chartpanel";
var consumeCtrlModule = angular.module("consumeCtrlModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "ngSanitize", "consumeSrvModule", "ngFileSaver"]);
consumeCtrlModule.controller("consumeViewCtrl", ["$scope","$routeParams", "consumeViewSrv", "NgTableParams", "$translate", "getSelectOptionsSrv", "FileSaver", "Blob", "$q",
    function ($scope,$routeParams, consumeViewSrv, NgTableParams, $translate, getSelectOptionsSrv, FileSaver, Blob, $q) {
        var self = $scope;
        self.displayDate=[
            {"name":"金额","values":"1"},
            {"name":"用量","values":"2"}
        ]
        self.dIndex={
            selected:self.displayDate[0].values
        }
        self.trendBlock=false;
        self.treDisplay=function(i){
            if(i==1){
                self.trendBlock=false;
            }else if(i==0){
                self.trendBlock=true;
            }
            
        }
        self.disIndexFun=function(cur){
            //console.log(cur)
        }
        function loginUser() {
            if(localStorage.managementRole == "2") {
                self.isAdmin = true;
            }else {
                self.isAdmin = false;
            }
            if(localStorage.managementRole == "4") {
                self.isProject = false;
            }else {
                self.isProject = true;
            }
            if(localStorage.managementRole == "5") {
                self.isProject = false;
                self.isUser = true;
            }else {
                self.isUser = false;
            }
        }
        loginUser();
       
        function init_dateTimepicker() {
            $(".form_date").datetimepicker({
                language: "zh-CN",
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                //startView: 2,
                minView: "month",
                //minuteStep:5,
                forceParse: 0,
                format: "yyyy-mm-dd",
                pickerPosition: "bottom-left"
            });
        }

        init_dateTimepicker();

        function initTableCnsForm() {
            return {
                enterpriseId: localStorage.enterpriseUid,
                domainId: "",
                projectId: "",
                region: "",
                prodTypeId: "",
                startAt: "",
                endAt: "",
                start: "1",
                pageSize: "5"
            };
        }

        self.filterData = {
            enterpriseId: localStorage.enterpriseUid,
            startAt: "",
            endAt: ""
        };

        self.tableCnsForm = initTableCnsForm();

        function getEnterpriseConsumeData(params) {
            consumeViewSrv.getEnterpriseCnsData(params).then(function (result) {
                if (result && result.data) {
                    self.regionsDataNull = false;
                    self.domainsDataNull = false;
                    self.projectsDataNull = false;
                    if (result.data.regions.length === 0) {
                        self.regionsDataNull = true;
                    }
                    if (result.data.domains.length === 0) {
                        self.domainsDataNull = true;
                    }
                    if (result.data.projects.length === 0) {
                        self.projectsDataNull = true;
                    }
                    self.consume_total = {};
                    var accountTotal = function (name) {
                        self.consume_total[name] = 0;
                        _.each(result.data[name], function (item) {
                            self.consume_total[name] += Number(item.value);
                        });
                    };

                    var formatData = function (name) {
                        self[[name] + "_consume_data"] = [];
                        _.map(_.sortBy(result.data[name], "value").reverse(), function (item, i) {
                            if (i > 4) {
                                return;
                            }
                            self[[name] + "_consume_data"].push({
                                name: item.name,
                                inUsed: (Number(item.value)).toFixed(2),
                                total: (Number(self.consume_total[name])).toFixed(2)
                            });
                        });
                    };

                    self.regionConsumePie = new PiePanelDefault();
                    self.regionConsumePie.panels.data = _.sortBy(result.data.regions, "value");
                    self.regionConsumePie.panels.pieType = "category";
                    accountTotal("regions");
                    accountTotal("domains");
                    accountTotal("projects");
                    formatData("projects");
                    formatData("domains");
                }
            });
        }

        function getTableCnsDataFun(params) {
            consumeViewSrv.getResourceAmount(params).then(function (result) {
                if (result && result.data) {
                    self.resTable = result.data;
                    self.resDataTotal = result.total;
                    self.resPageStep = params.pageSize;
                }
            });
            consumeViewSrv.getResourceAmount({
                enterpriseId: params.enterpriseId,
                domainId: params.domainId,
                projectId: params.projectId,
                region: params.region,
                prodTypeId: params.prodTypeId,
                startAt: params.startAt,
                endAt: params.endAt,
                start: params.start,
                pageSize: 0
            }).then(function (result) {
                if (result && result.data) {
                    self.allDataList = [];
                    _.map(result.data, function (billRes) {
                        self.allDataList.push([
                            billRes["enterprise_name"],
                            billRes["region"],
                            billRes["domain_name"],
                            billRes["project_name"],
                            billRes["resTypeName"],
                            billRes["res_name"],
                            billRes["amount"],
                            billRes["start_at"].replace(/\s+/, "/")
                        ]);
                    });
                }
            });
        }



        //getTableCnsDataFun(self.tableCnsForm);

        function getEnterpriseOptions() {
           /* consumeViewSrv.getEnterprises().then(function (result) {
                if (result && result.data) {
                    self.enterprises = {
                        options: result.data
                    };
                    //self.enterprises.options.push({enterpriseName:"全部",enterpriseId:""});
                    self.filterData.enterpriseId = self.enterprises.options[0].enterpriseId;
                    self.tableCnsForm.enterpriseId = self.enterprises.options[0].enterpriseId;
                    getEnterpriseConsumeData(self.filterData);
                    //getTableCnsDataFun(self.tableCnsForm);
                    enterpriseQueryFun();
                }
            });*/
            getEnterpriseConsumeData(self.filterData);
            enterpriseQueryFun();
        }
        function enterpriseQueryFun() {
            if (self.tableCnsForm.region == "全部") {
                self.tableCnsForm.region = "";
            }
            getSelectOptionsSrv.getRegionList(self).then(function () {
                var deferred = $q.defer();
                getSelectOptionsSrv.getDomainsOptionsList(self).then(function () {
                    deferred.resolve(self);
                })
                return deferred.promise;
            }).then(function () {
                var deferred = $q.defer();
                getSelectOptionsSrv.getProjectsOptions(self).then(function () {
                    self.tableCnsForm.projectId = self.projects.selected.projectId;
                    //self.tableQueryFun(self.tableCnsForm);
                    deferred.resolve(self);
                })
                return deferred.promise;
            }).then(function(){
                var deferred = $q.defer();
                getSelectOptionsSrv.getUserOptions(self).then(function(){
                    self.tableCnsForm.userName = self.users.selected;
                    self.tableCnsForm.startMonth = self.tableCnsForm.startMonth ? self.tableCnsForm.startMonth : "";
                    self.tableCnsForm.endMonth = self.tableCnsForm.endMonth ? self.tableCnsForm.endMonth : "";
                    self.tableQueryFun(self.tableCnsForm);
                })
                return deferred.promise;
            })
        }
        getEnterpriseOptions();
        /*getSelectOptionsSrv.getDomainsOptions(self);
         getSelectOptionsSrv.getProjectsOptions(self);
         getSelectOptionsSrv.getRegionsOptions(self);
         //getSelectOptionsSrv.getProductTypeOptions(self);*/
        getSelectOptionsSrv.getResourceTypeOptions(self);

        self.queryFun = function () {
            getEnterpriseConsumeData(self.filterData);
        };
        self.tableQueryFun = function () {
            if (self.tableCnsForm.region == "全部") {
                self.tableCnsForm.region = "";
            }
            //downloadExcelHref(self.tableCnsForm);
            getTableCnsDataFun(self.tableCnsForm);
        };
        self.enterpriseQueryFun = function () {
            /*getSelectOptionsSrv.getRegionsOptions(self);
             self.tableCnsForm.region = self.regions.selected.region;
             getSelectOptionsSrv.getDomainsOptions(self);
             self.tableCnsForm.domainId = self.regions.selected.domainId;
             getSelectOptionsSrv.getProjectsOptions(self);
             self.tableCnsForm.projectId = self.regions.selected.projectId;
             if(self.tableCnsForm.region == "全部"){
             self.tableCnsForm.region = "";
             }
             getTableCnsDataFun(self.tableCnsForm);*/

            self.tableCnsForm.start = "1";
            enterpriseQueryFun();


        };
        self.changeRegion = function () {
            getSelectOptionsSrv.getDomainsOptionsList(self).then(function () {
                var deferred = $q.defer();
                getSelectOptionsSrv.getProjectsOptions(self).then(function () {
                    deferred.resolve(self);
                })
                return deferred.promise;
            }).then(function () {
                self.tableCnsForm.projectId = self.projects.selected.projectId;
                self.tableCnsForm.start = "1";
                self.tableQueryFun();
            });

        };

        self.changeDomain = function () {
            getSelectOptionsSrv.getProjectsOptions(self).then(function () {
                self.tableCnsForm.projectId = self.projects.selected.projectId;
                self.tableCnsForm.start = "1";
                self.tableQueryFun();
                TrendFun();
            })
        };

        self.changeProject = function (cur) {
            self.tableCnsForm.projectId = cur;
            self.tableCnsForm.start = "1";
            self.tableQueryFun();
            TrendFun();
        };

        self.changeUsers = function (cur) {
            self.tableCnsForm.userName = cur;
            self.tableCnsForm.start = "1";
            self.tableQueryFun();
            TrendFun();
        };

        self.changeProdType = function () {
            self.tableCnsForm.start = "1";
            self.tableQueryFun();
            TrendFun();
        };

        self.refresResTable = function () {
            //self.tableCnsForm = initTableCnsForm();
            getTableCnsDataFun(self.tableCnsForm);
            //downloadExcelHref(self.tableCnsForm);
        };

        self.changeResTablePage = function (obj) {
            self.tableCnsForm.start = Number(obj.offset) / Number(obj.limit) + 1;
            self.tableCnsForm.pageSize = obj.limit;
            getTableCnsDataFun(self.tableCnsForm);
        };

        function getConsumptionDetailsData(params) {
            consumeViewSrv.getConsumptionDetails(params).then(function (result) {
                if (result && result.data) {
                    self.resDetailTable = result.data;
                    for (var resource in result.data) {
                        var resTable = (result.data)[resource];
                        var extra = resTable.extra;
                        var extraJson = JSON.parse(extra);
                        var cpu = extraJson.cpu;
                        var mem = extraJson.mem;
                        var size = extraJson.size;
                        if (cpu && mem) {
                            resTable.configInfo = cpu + '核' + mem / 1024 + 'G';
                        }
                        if (size) {
                            resTable.configInfo = '硬盘大小' + size + 'G';
                        }
                    }
                    self.resDetailTotal = result.total;
                    self.resDetailPageStep = params.pageSize;
                }
            });
        }

        self.$watch(function () {
            return $routeParams.resId;
        }, function (resId) {
            self.animation = resId ? "animateIn" : "animateOut";
            if (resId) {
                var params = {
                    "resId": resId,
                    "start": "1",
                    "pageSize": 10
                };
                getConsumptionDetailsData(params);
                self.changeDetailDataPage = function (obj) {
                    params.start = Number(obj.offset) / Number(obj.limit) + 1;
                    params.pageSize = obj.limit;
                    getConsumptionDetailsData(params);
                };
            }
        });
        $scope.downloadAllData = function () {
            // 过滤出需要在CSV文件中显示的字段。
            return self.allDataList;
        };


        /*趋势图代码*/
        self.panels = [];
        function panelsDataFunc(item,key,color){
            self.panels = self.panels.slice(self.panels.length,0);
            var areaChart = new AreaPanelDefault2();
            areaChart.panels.title =  item.chartPerm.title;
            areaChart.panels.unit = item.chartPerm.unit;
            areaChart.panels.priority = item.chartPerm.priority;
            areaChart.panels.xAxisType = "year";

            if(color%2 == 0){
                areaChart.panels.colors = ["#51a3ff"];
            }else{
                 areaChart.panels.colors = ["#1bbc9d"];
            }

            var params=self.tableCnsForm;
            consumeViewSrv.getResamountPerTime({
                enterpriseId: params.enterpriseId,
                domainId: params.domainId,
                prodTypeId:params.prodTypeId,
                projectId: params.projectId,
                region: params.region,
                userName: params.userName
            }).then(function(res){
                if(res && res.data && res.data.results && res.data.results[0] && res.data.results[0].series[0].values.length) {
                    areaChart.panels.data.push(res.data.results[0].series[0]);
                }else{
                    var defaultChartData = {
                        "columns":["time",item.chartPerm.title],
                        "values":[
                            [moment().subtract(7, 'month'),0],
                            [moment().subtract(1, 'month'),0]
                        ],
                        "default":true,
                        "noHistoryData":true
                    };
                    areaChart.panels.data.push(defaultChartData);

                }
                self.panels.push(areaChart.panels);
            })
        }
        var Innerwith = $(".area-chart-wrap").width();
        console.log(Innerwith);
        var consumeviewChartPermas = new consumeViewSrv.consumeViewChartDefault();
        function TrendFun(){
            for(let key in consumeviewChartPermas.chartSqls){
                self.panels[key] = [];
                _.each(consumeviewChartPermas.chartSqls[key],function(item){
                    panelsDataFunc(item,key,"1");
                })
            }     
        }
        TrendFun();
        
    }]);