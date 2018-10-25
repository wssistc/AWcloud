var componentModule = angular.module("componentModule", []);
componentModule.directive("helpInformation", ["$rootScope", "$location", "$http", "$route", "helpSrv", "$translate", function(rootScope, $location, $http, $route, helpSrv, translate) {
    return {
        restrict: "EA",
        scope: {
            modular: '='
        },
        replace: true,
        template: `<div class ="detail-row">
                    <div class="detail-title">
                        <div class="help-title clearfix">
                          <a class = "an-close" ng-href="{{InformationData.route}}"><i class="icon-aw-mail-reply"></i></a>
                          <span>帮助信息</span>
                        </div>
                    </div>                        
                    <div class="detail-info">
                        <div ng-repeat="item in InformationData.data">
                            <label class="help-title" ng-show="item.title!=''">{{item.title}}</label>
                            <div ng-class="{'subdes':item.title!=''}">{{item.describe}}</div>
                        </div>
                    </div>
                    <div class="more">
                        <a ng-href="{{InformationData.detailRoute}}"  target="_blank" ng-show="InformationData.detailRoute!=''">查看详细使用手册</a>
                    </div>
                </div>`,
        replace: true,
        link: function(scope, elem, attr) {
            var self = scope;
            var modular = self.modular;
            self.InformationData = helpSrv.helpInformation[modular];
        }
    }
}]);
componentModule.directive("intoInformation", ["$rootScope","$location","$http","$route","$translate",function(rootScope,$location,$http,$route,translate) {
    return {
        restrict: "EA",
        scope:{
            modular:'='
        },
        replace: true,
        template: `<div type="button" class="btn btn-renovat right-ports" ng-click="systemCheckHelp()">
            <i class="icon-aw-question-mark1"></i>
        </div>`,
        replace: true,
        link: function(scope, elem, attr) {
            var self = scope;
            self.systemCheckHelp = function(){
                $location.search('helpmodular='+scope.modular)
            }
        }
    }
}]); 
componentModule.directive("pageComponent",[function(){
    function countPage(totalNum,pageStep,currentPage){
        var pages = [];
        var _length = Math.ceil(totalNum / pageStep);
        if (_length > 1) {
            pages.push({
                type: "first",
                number: 1
            })
            var maxPivotPages = 2; //5
            var minPage = Math.max(2, currentPage - maxPivotPages); //
            var maxPage = Math.min(_length - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
            minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
            for (let i = minPage; i <= maxPage; i++) {
                if ((i == minPage && i != 2) || (i == maxPage && i != _length - 1)) {
                    pages.push({
                        type: 'more'
                    })
                } else {
                    pages.push({
                        number: i,
                        type: "page"
                    });
                }

            }
            pages.push({
                type: 'last',
                number: _length
            });
        }

        return pages;
    }
    return {
        restrict: "E",
        scope: {
            total: "=",
            changePage: "&",
            step: "="
        },
        templateUrl: "/tmpl/page.html",
        replace: true,
        link: function(scope, ele) {
            scope.$watch(function() {
                if (scope.total) {
                    return scope.total + ',' + scope.step;
                }
            }, function(ne) {
                if (scope.total > 0) {
                    scope.totalNum = ne.split(",")[0];
                    scope.pageStep = ne.split(",")[1];
                    scope.numPages = Math.ceil(scope.totalNum / scope.pageStep);
                    scope.currentPage = 1;
                    if (scope.totalNum && scope.totalNum > 0) {
                        scope.pages = countPage(scope.totalNum, scope.pageStep, scope.currentPage);
                    }
                } else {
                    scope.pages = [];
                }

            })
            scope.goPage = function(item) {
                if (item.number) {
                    if (scope.currentPage == item.number) {
                        return;
                    };
                    scope.currentPage = item.number;
                    scope.prevDisabled = scope.currentPage == 1;
                    scope.nextDisabled = scope.currentPage == scope.numPages;
                    var postData = {
                        limit: scope.step,
                        offset: (scope.currentPage - 1) * scope.step
                    }
                    scope.changePage({ obj: postData });
                    scope.pages = countPage(scope.totalNum, scope.pageStep, scope.currentPage)
                }
            }
            scope.prevNext = function(type) {
                if (type == 'prev') {
                    if (scope.currentPage == 1) { return; }
                    scope.currentPage = scope.currentPage - 1 > 0 ? scope.currentPage - 1 : 1;
                    scope.nextDisabled = scope.currentPage == scope.numPages;
                    scope.prevDisabled = scope.currentPage == 1;
                } else if (type == 'next') {
                    if (scope.currentPage == scope.numPages) { return; }
                    scope.currentPage = scope.currentPage + 1 < scope.numPages ? scope.currentPage + 1 : scope.numPages
                    scope.nextDisabled = scope.currentPage == scope.numPages;
                    scope.prevDisabled = scope.currentPage == 1;
                }
                var postData = {
                    limit: scope.step,
                    offset: (scope.currentPage - 1) * scope.step
                }
                scope.changePage({ obj: postData });
                scope.pages = countPage(scope.totalNum, scope.pageStep, scope.currentPage)
            }
        }
    }
}]);
componentModule.directive("consumeChartBar", function($timeout, $translate, resize) {
    return {
        restrict: "A",
        replace: true,
        transclude: true,
        scope: {
            bardata: "="
        },
        template: function(elem) {
            return "<div>\
                        <div class=\"left\">{{bardata.name}}</div>\
                        <div class=\"right\">{{'aws.bill.consumption'|translate}}：  <span class=\"value progress-bar-{{barTypeFunc(inUsepercent)}}\" >{{bardata.inUsed}}</span>/{{bardata.total}}</div>\
                        <div class=\"progress active width pull\">\
                            <div class=\"progress-bar progress-bar-{{barTypeFunc(inUsepercent)}}\" aria-valuenow=\"used\" aria-valuemin=\"0\" aria-valuemax=\"bardata.total\" ng-style=\"{width: (inUsepercent?(inUsepercent < 100 ? inUsepercent : 100):0) + \'%\'}\"></div>\
                        </div>\
                    </div>";
        },
        link: function(scope, elem, attr) {
            scope.used = 0;
            scope.inUsepercent = 0;
            scope.$watch(function() {
                return scope.bardata;
            }, function(bardata) {
                if (bardata) {
                    $timeout(function() {
                        scope.used = scope.bardata.inUsed || 0;
                        scope.inUsepercent = scope.bardata.total > 0 ? (scope.bardata.inUsed / scope.bardata.total * 100).toFixed(1) : 0 || 0;
                    }, 10);
                }
            });

            scope.barTypeFunc = function(percent) {
                if (percent <= 30) {
                    return "green";
                } else if (percent > 30 && percent <= 50) {
                    return "blue";
                } else if (percent > 50 && percent <= 65) {
                    return "blueDark";
                } else if (percent > 65 && percent <= 75) {
                    return "orange";
                } else if (percent > 75 && percent <= 85) {
                    return "orangeDark";
                } else if (percent > 85 && percent <= 95) {
                    return "red";
                } else if (percent > 95) {
                    return "redDark";
                } else {
                    return "default";
                }
            };

        }
    };
});
componentModule.directive("tableAction", function() {
    return {
        restrict: "A",
        scope: {
            filterData: "=",
            csvHeader: "=",
            fileName: "=",
            query: "&",
            downloadData: "&",
            definedDownloadData: "&",
            search: "&",
            refresh: "&",
            colsConfig: "=",
            selectCol: "&",
            timePrecision: "="
        },
        templateUrl: "/tmpl/timeFilterTableAction.html",
        replace: true,
        transclude: true,
        link: function(scope, elem, attr) {
            if (!attr.search) {
                scope.search = false;
            }
            if (!attr.refresh) {
                scope.refresh = false;
            }
            if (!attr.downloadData) {
                scope.downloadData = false;
            }
            if (!attr.definedDownloadData) {
                scope.definedDownloadData = false;
            }

            scope.timeFormat = "yyyy-mm-dd";
            scope.timePattern = /^\d{4}-([0][1-9]|[1][0-2])-([0-2][1-9]|[1-2][0]|[3][0-1])$/;

            if (scope.timePrecision == "sec") {
                scope.timeFormat = "yyyy-mm-dd hh:mm:ss";
                scope.timePattern = /^\d{4}-([0][1-9]|[1][0-2])-([0-2][1-9]|[1-2][0]|[3][0-1]) ([0-1][0-9]|[2][0-4]):([0-6][0-9]):([0-6][0-9])$/;
            }

            function init_dateTimepicker() {
                elem.find(".form_date").datetimepicker({
                    language: "zh-CN",
                    weekStart: 1,
                    todayBtn: 1,
                    autoclose: 1,
                    todayHighlight: 1,
                    minView: "month",
                    forceParse: 0,
                    format: scope.timeFormat,
                    pickerPosition: "bottom-left"
                });
            }

            scope.$watch(function() {
                return elem.find(".form_date").length;
            }, function(elem) {
                if (elem) {
                    init_dateTimepicker();
                }
            });

            scope.timeType = {
                options: [{
                    "name": "未选择",
                    "value": ""
                }, {
                    "name": "自定义",
                    "value": "defined"
                }, {
                    "name": "最近三天",
                    "value": "3d"
                }, {
                    "name": "最近一周",
                    "value": "7d"
                }, {
                    "name": "最近一个月",
                    "value": "30d"
                }, {
                    "name": "最近三个月",
                    "value": "90d"
                }]
            };

            scope.timeSelectTab = function(step) {
                scope.filterData.from = null;
                scope.filterData.to = null;
                if (step != "" && step != "defined") {
                    let start = moment().subtract(Number(step.substring(0, step.length - 1)) - 1, step.substring(step.length - 1, step.length)).format("YYYY-MM-DD");
                    let end = moment().format("YYYY-MM-DD");
                    if (scope.timePrecision == "sec") {
                        start = moment().subtract(Number(step.substring(0, step.length - 1)) - 1, step.substring(step.length - 1, step.length)).format("YYYY-MM-DD 00:00:00");
                        end = moment().format("YYYY-MM-DD 24:00:00");
                    }
                    scope.filterData.from = start;
                    scope.filterData.to = end;
                }
            };
        }
    }
});
componentModule.directive("myDaterangepicker", function($translate) {
    return {
        restrict: "A",
        scope: {
            filterData: "=",
            timeType: "=?",
            csvHeader: "=",
            fileName: "=",
            query: "&",
            downloadData: "&",
            definedDownloadData: "&",
            search: "&",
            refresh: "&",
            colsConfig: "=",
            selectCol: "&",
            timePrecision: "="
        },
        templateUrl: "/tmpl/timeRangeFilterAction.html",
        replace: true,
        transclude: true,
        link: function(scope, elem, attr) {
            if (!attr.query) {
                scope.query = false;
            }
            if (!attr.search) {
                scope.search = false;
            }
            if (!attr.refresh) {
                scope.refresh = false;
            }
            if (!attr.downloadData) {
                scope.downloadData = false;
            }
            if (!attr.definedDownloadData) {
                scope.definedDownloadData = false;
            }
            // scope.filterData.definedTime = false;
            // scope.filterData.definedTimeText = "选择日期";
            if(!attr.timeType) {
                scope.timeType = {
                    options: [{
                        "name": $translate.instant('aws.bill.timeType.threeDays'),
                        "value": "3d"
                    }, {
                        "name": $translate.instant('aws.bill.timeType.oneWeek'),
                        "value": "7d"
                    }, {
                        "name": $translate.instant('aws.bill.timeType.oneMonth'),
                        "value": "30d"
                    }]
                };
            }
            
            elem.find('#config-demo').daterangepicker({
                "language": 'zh-CN',
                "startDate": moment().subtract(1, "months"),
                "maxDate" : moment(),
                "timePicker": false,
                "timePicker24Hour": false,
                "linkedCalendars": false,
                "autoUpdateInput": false,
                "opens": "left",
                "locale": {
                    format: 'YYYY-MM-DD',
                    separator: ' 至 ',
                    applyLabel: "确定",
                    cancelLabel: "取消",
                    daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
                    monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
                }
            });

            elem.find('#config-demo').on('apply.daterangepicker',function(ev, picker) {
                let startTime = picker.startDate.format(picker.locale.format);
                let endTime = picker.endDate.format(picker.locale.format);
                let separator = picker.locale.separator;
                scope.filterData.from = startTime;
                scope.filterData.to = endTime;
                if(scope.timePrecision == "sec") {
                    scope.filterData.from = picker.startDate.format("YYYY-MM-DD 00:00:00");
                    scope.filterData.to = picker.endDate.format("YYYY-MM-DD 23:59:59");
                }
                if(!picker.startDate || !picker.endDate) {
                    elem.find(".time-input").val('');
                }else {
                    let definedTimeText = startTime + separator + endTime;
                    elem.find(".time-input").val(definedTimeText);
                    scope.filterData.definedTime = true;
                    scope.filterData.definedTimeText = definedTimeText;
                }
                scope.$apply();
            });
            
            scope.timeSelectTab = function(step) {
                //采集周期选择的1小时，时间筛选不可以选择实时
                if(scope.filterData.precision==3600&&!step){
                   return;
                }
                //时间筛选的高亮
                scope.filterData.timeStep = step;
                scope.filterData.from = null;
                scope.filterData.to = null;
                if (step != "" && step != "defined") {
                    let start = moment().subtract(Number(step.substring(0, step.length - 1)) - 1, step.substring(step.length - 1, step.length)).format("YYYY-MM-DD");
                    let end = moment().format("YYYY-MM-DD");
                    if (scope.timePrecision == "sec") {
                        start = moment().subtract(Number(step.substring(0, step.length - 1)) - 1, step.substring(step.length - 1, step.length)).format("YYYY-MM-DD 00:00:00");
                        end = moment().format("YYYY-MM-DD 23:59:59");
                    }
                    if(step.substring(step.length - 1, step.length) == "h") {
                        start = moment().subtract(Number(step.substring(0, step.length - 1)) - 1, step.substring(step.length - 1, step.length)).format("YYYY-MM-DD HH:mm:ss");
                        end = moment().format("YYYY-MM-DD HH:mm:ss");
                    }
                    scope.filterData.from = start;
                    scope.filterData.to = end;
                }
                if(step != "defined"){
                    scope.filterData.definedTime = false;
                    scope.filterData.definedTimeText = "选择日期";
                }
            };
            
            if(scope.filterData&&scope.filterData.precision){
                scope.$watch(function(){
                   return scope.filterData.precision;
                },function(value){
                   if(value==3600&&!scope.filterData.timeStep){
                      scope.timeSelectTab("6h");
                   }
                });
            }

            if(scope.filterData && scope.timeType) {
                scope.filterData.timeStep = scope.timeType.options[0].value;
                scope.timeSelectTab(scope.filterData.timeStep);
            }
        }
    }
});
componentModule.directive("billingDetailSelect",function($translate){
    return {
        restrict:"A",
        scope:{
            billOptions:"=",
            filterData:"=",
            currPage:"=",
            inBillingModule:"=",
            changeBillFilter:"&"
        },
        template:`
            <div>
                <div class="control-group" ng-show="inBillingModule">
                    <div class="control-label">数据中心：</div>
                    <div class="controls">
                        <ui-select ng-model="filterData.region" ng-change="changeBillFilter({data: filterData.region,type: 'region'})" >
                            <ui-select-match title="{{$select.selected.name}}">{{$select.selected.name}}</ui-select-match>
                            <ui-select-choices repeat="item in billOptions.regionsList">
                                <div ng-bind-html="item.name" titlt="{{item.name}}" class="bill-select"></div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
                <div class="control-group" ng-show="(currPage=='dep' || currPage =='pro' || currPage=='user') && inBillingModule">
                    <div class="control-label">部门：</div>
                    <div class="controls">
                        <ui-select ng-model="filterData.domain" ng-change="changeBillFilter({data: filterData.domain,type: 'domain'})" >
                            <ui-select-match title="{{$select.selected.name}}">{{$select.selected.name}}</ui-select-match>
                            <ui-select-choices repeat="item in billOptions.domainsList">
                                <div ng-bind-html="item.name" title="{{item.name}}" class="bill-select"></div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
                <div class="control-group" ng-show="(currPage =='pro' || currPage=='user') && inBillingModule">
                    <div class="control-label">项目：</div>
                    <div class="controls">
                        <ui-select ng-model="filterData.project" ng-change="changeBillFilter({data: filterData.project,type: 'project'})" >
                            <ui-select-match title="{{$select.selected.name}}">{{$select.selected.name}}</ui-select-match>
                            <ui-select-choices repeat="item in billOptions.projectsList">
                                <div ng-bind-html="item.name" title="{{item.name}}" class="bill-select"></div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
                <div class="control-group" ng-show="currPage=='user' && inBillingModule">
                    <div class="control-label">用户：</div>
                    <div class="controls">
                        <ui-select ng-model="filterData.user" ng-change="changeBillFilter({data: filterData.user,type: 'user'})" >
                            <ui-select-match title="{{$select.selected.name}}">{{$select.selected.name}}</ui-select-match>
                            <ui-select-choices repeat="item in billOptions.usersList">
                                <div ng-bind-html="item.name" title="{{item.name}}" class="bill-select"></div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
                <div class="control-group" ng-show="currPage=='user' && inBillingModule && filterData.userRes">
                    <div class="control-label">资源：</div>
                    <div class="controls">
                        <ui-select ng-model="filterData.userRes"ng-change="changeBillFilter({data: filterData.userRes,type: 'userRes'})" >
                            <ui-select-match title="{{$select.selected.name}}">{{$select.selected.name}}</ui-select-match>
                            <ui-select-choices repeat="item in billOptions.resList">
                                <div ng-bind-html="item.name" title="{{item.name}}" class="bill-select"></div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                </div>
            </div>
        `,
        replace:true,
        link:function(scope,elem,attr){
            
        }
    }
});
componentModule.directive("regionDomainProject", ["$rootScope", "$location", "$http", "$route", "bobMesSrv", "$translate", function(rootScope, $location, $http, $route, bobMesSrv, translate) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: "/tmpl/region_domain_project.html",
        replace: true,
        link: function(scope, elem, attr) {
            var self = scope;
            self.isDomainProjectShow = false;
            self.isRegionShow = false;
            self.REGION_ADMIN = false;
            // var parentRule = ['Resource',"Monitoring"];//根据菜单判定是否显示
            // var unActiveRule = ['cephview',"topology"];//根据菜单判定是否显示
            function getProjectDomainData() {
                self.tops = {
                    depart: { selected: "" },
                    deparList: [],
                    pro: { selected: "" },
                    projectsList: []
                };
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/domains/projects"
                }).success(function(res) {

                    if (res) {
                        self.tops.deparList = res;
                        for (var i = 0; i < self.tops.deparList.length; i++) {
                            if (self.tops.deparList[i].domainUid == 'default') {
                                self.tops.deparList[i].disDomainName = '默认部门';
                            } else {
                                self.tops.deparList[i].disDomainName = self.tops.deparList[i].domainName;
                            }
                            if (self.tops.deparList[i].projects && self.tops.deparList[i].projects.length > 0) {
                                for (var j = 0; j < self.tops.deparList[i].projects.length; j++) {
                                    if (self.tops.deparList[i].projects[j].projectName == 'admin' && self.tops.deparList[i].domainUid == 'default') {
                                        self.tops.deparList[i].projects[j].disProjectName = '默认项目';
                                    } else {
                                        self.tops.deparList[i].projects[j].disProjectName = self.tops.deparList[i].projects[j].projectName;
                                    }
                                }
                            }
                        }
                        self.tops.deparList.map(function(item) {
                            if (item.domainName == localStorage.domainName) {
                                self.tops.depart.selected = item;
                            }
                        });
                        if (!localStorage.domainName) {
                            self.tops.depart.selected = res[0];
                            localStorage.domainName = self.tops.depart.selected.domainName;
                            localStorage.domainUid = self.tops.depart.selected.domainUid
                        }
                    }
                    self.tops.projectsList = self.tops.depart.selected.projects
                    if (self.tops.projectsList) {
                        self.tops.pro.selected = self.tops.projectsList[0];
                        self.tops.projectsList.map(function(item) {
                            if (item.projectId == localStorage.projectUid) {
                                self.tops.pro.selected = item;
                                self.getRoleFormUserInProject()
                            }
                        });
                        localStorage.projectName = self.tops.pro.selected.projectName;
                        localStorage.projectUid = self.tops.pro.selected.projectId;
                    }
                });
            }

            function changeRole() {
                self.REGION_ADMIN = false;
                switch (localStorage.managementRole) {
                    case "2":
                        self.REGION_ADMIN = true;
                        break;
                }
            }

            function getRegionList() {
                self.regionModel = {
                    selected: ""
                };
                $http({
                    method: "GET",
                    url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions"
                }).then(function(res) {
                    if (res && res.data) {
                        self.regionList = res.data.filter(item => {
                            return item.status == 3;
                        })
                        self.regionModel.selected = self.regionList[0];
                        self.regionList.forEach(item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.regionModel.selected = item;
                            }
                        })
                    }
                })
            }

            function init() {
                if ($route.current) { //初始化项目部门是否可见
                    self.isDomainProjectShow = $route.current.domainProject ? true : false; //项目和部门显示隐藏
                    self.isRegionShow = $route.current.region ? true : false; //region状态的显示隐藏
                }
                //if(self.isDomainProjectShow){
                getProjectDomainData(); //初始
                //}
                changeRole();
                getRegionList();
            }
            self.changedepart = function(m) {
                if (!m.projects || m.projects.length == 0) {
                    self.tops.pro.selected = '';
                    self.tops.deparList.forEach(item => {
                        if (item.domainUid == localStorage.defaultdomainUid) {
                            self.tops.depart.selected = item
                            self.changedepart(item);
                        }
                    })
                    return;
                } else {
                    localStorage.domainName = m.domainName;
                    localStorage.domainUid = m.domainUid;
                    self.tops.projectsList = m.projects;
                    self.changeproject(m.projects[0]);
                }
            };

            self.changeproject = function(n) {
                self.tops.pro.selected = n;
                localStorage.projectName = n.projectName;
                localStorage.projectUid = n.projectId;
                if (/\/cvm\/loadbalancers/.test($location.path())) {
                    $location.url("/cvm/loadbalancers");
                } else {
                    $location.url($location.path());
                }
                self.getRoleFormUserInProject()
                if (/\/quickconfig\/createins/.test($location.path())) {
                    $location.url("/quickconfig/createins?type=quick");
                }
                $route.reload();

            };

            function getTotalData() {
                localStorage.TotalListName = "";
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/" + localStorage.regionKey + "/getTotalResourcesStatistics"
                }).then(function(res) {
                    if (res && res.data) {
                        if (res.data.length > 0) {
                            for (var i = 0; i < res.data.length; i++) {
                                if (res.data[i] == "ceph") {
                                    res.data[i] = translate.instant('aws.indextran.ceph');
                                } else if (res.data[i] == "memory") {
                                    res.data[i] = translate.instant('aws.indextran.memory');
                                }
                            }
                        }
                        localStorage.TotalListName = res.data.join("、");
                        var totalata = angular.copy(res.data);
                        for (var i = 0; i < totalata.length; i++) {
                            if (totalata[i].indexOf(":") > -1) {
                                totalata[i] = totalata[i].split(":")[1] + translate.instant('aws.indextran.ceph');
                            }
                        }
                        rootScope.ListName = totalata.join("、");
                        if (localStorage.TotalListName != "" && localStorage.$AWLOGINED == "true") {
                            rootScope.totalResShow = true;
                        } else {
                            rootScope.totalResShow = false;
                        }
                    }

                });
            }
            self.changeRegion = function(n) {
                $http({
                    method: "post",
                    url: "/awstack-user/v1/newregion",
                    data: { 'regionKey': n.regionKey }
                }).then(function(res) {
                    if (res && res.data && res.data.token) {
                        bobMesSrv.closed();
                        localStorage.$AUTH_TOKEN = res.data.token;
                        getProjectDomainData();
                        localStorage.$LOGINDATA = JSON.stringify(res.data);
                        localStorage.regionName = n.regionName;
                        localStorage.regionKey = n.regionKey;
                        localStorage.regionUid = n.regionUid;
                        bobMesSrv.opened();
                        if (localStorage.managementRole == "2") {
                            getTotalData();
                            if (localStorage.TotalListName != "") {
                                rootScope.totalResShow = true;
                            }
                        } else {
                            rootScope.totalResShow = false;
                        }
                        localStorage.backupsService = res.data.backupService ? "backups" : "";
                        localStorage.cinderService = (res.data.cinderService || res.data.isCustom) ? "cinder" : "";
                        localStorage.isCustom = res.data.isCustom; //true为超融合模式，false为软件交付模式
                        localStorage.isEnabledArbiter = res.data.isEnabledArbiter; // true 为两节点
                        localStorage.cephService = res.data.enabledCeph ? "ceph" : "";
                        localStorage.installK8s = res.data.installK8s ? 1 : 2;
                        localStorage.installIronic = res.data.installIronic ? 1 : 2;
                        self.services.backups = localStorage.backupsService;
                        self.services.cinder = localStorage.cinderService;
                        self.services.ceph = localStorage.cephService;
                        if (/\/quickconfig\/createins/.test($location.path())) {
                            $location.url("/quickconfig/createins?type=quick");
                        }
                        $route.reload();
                    } else {
                        self.regionList.forEach(item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.regionModel.selected = item;
                            }
                        })
                    }

                })
            }
            self.getRoleFormUserInProject = function() {
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/project/" + localStorage.projectUid + "/roles"
                }).success(function(res) {
                    if (res) {
                        localStorage.rolename = res.roleName;
                    }
                })
            }

            self.$on("send-create-pd", function(e, val) { //快捷创建项目或者部门时接收消息，同时更新部门列表
                if (val.type == "domain" || val.type == "project") {
                    getProjectDomainData();
                } else if (val.type == "region") {
                    getRegionList()
                }
            })

            self.$on('$routeChangeSuccess', function(event, current, prev) {
                changeRole();
                if (current) {
                    var old = self.isDomainProjectShow; //保存上一个路由时的值
                    self.isDomainProjectShow = current.domainProject ? true : false; //项目和部门的显示影藏
                    self.isRegionShow = current.region ? true : false; //region的显示影藏
                    if (self.isDomainProjectShow && !old) { //根据old和self.isDomainProjectShow 判断是否调用api;
                        getProjectDomainData()
                    }
                }
            })
            init();
        }
    }
}]);

componentModule.directive("domainProjects", ["$rootScope", "$location", "$http", "$route", "bobMesSrv", "$translate","$timeout", function(rootScope, $location, $http, $route, bobMesSrv, translate,$timeout) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: "/tmpl/domain_project.html",
        replace: true,
        link: function(scope, elem, attr) {
            var self = scope;
            self.isDomainProjectShow = false;
            self.REGION_ADMIN = false;
            // var parentRule = ['Resource',"Monitoring"];//根据菜单判定是否显示
            // var unActiveRule = ['cephview',"topology"];//根据菜单判定是否显示
            function getProjectDomainData(del) {
                self.tops = {
                    depart: { selected: "" },
                    deparList: [],
                    pro: { selected: "" },
                    projectsList: []
                };
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/domains/projects"
                }).success(function(res) {
                    if (res) {
                        self.tops.deparList = res;
                        for (var i = 0; i < self.tops.deparList.length; i++) {
                            if (self.tops.deparList[i].domainUid == 'default') {
                                self.tops.deparList[i].disDomainName = '默认部门';
                            } else {
                                self.tops.deparList[i].disDomainName = self.tops.deparList[i].domainName;
                            }
                            if (self.tops.deparList[i].projects && self.tops.deparList[i].projects.length > 0) {
                                for (var j = 0; j < self.tops.deparList[i].projects.length; j++) {
                                    if (self.tops.deparList[i].projects[j].projectName == 'admin' && self.tops.deparList[i].domainUid == 'default') {
                                        self.tops.deparList[i].projects[j].disProjectName = '默认项目';
                                    } else {
                                        self.tops.deparList[i].projects[j].disProjectName = self.tops.deparList[i].projects[j].projectName;
                                    }
                                }
                            }
                        }
                        self.tops.deparList.map(function(item) {
                            if (item.domainName == localStorage.domainName) {
                                self.tops.depart.selected = item;
                            }
                        });
                        if (!localStorage.domainName||del) {
                            self.tops.depart.selected = res[0];
                            localStorage.domainName = self.tops.depart.selected.domainName;
                            localStorage.domainUid = self.tops.depart.selected.domainUid
                        }
                    }
                    self.tops.projectsList = self.tops.depart.selected.projects
                    if (self.tops.projectsList) {
                        self.tops.pro.selected = self.tops.projectsList[0];
                        self.tops.projectsList.map(function(item) {
                            if (item.projectId == localStorage.projectUid) {
                                self.tops.pro.selected = item;
                                self.getRoleFormUserInProject()
                            }
                        });
                        localStorage.projectName = self.tops.pro.selected.projectName;
                        localStorage.projectUid = self.tops.pro.selected.projectId;
                    }
                });
            }

            function changeRole() {
                self.REGION_ADMIN = false;
                switch (localStorage.managementRole) {
                    case "2":
                        self.REGION_ADMIN = true;
                        break;
                }
            }

            function init() {
                if ($route.current) { //初始化项目部门是否可见
                    self.isDomainProjectShow = $route.current.domainProject ? true : false; //项目和部门显示隐藏
                }
                getProjectDomainData(); //初始
                changeRole();
            }
            // self.changedepart = function(m) {
            //     if (!m.projects || m.projects.length == 0) {
            //         self.tops.pro.selected = '';
            //         self.tops.deparList.forEach(item => {
            //             if (item.domainUid == localStorage.defaultdomainUid) {
            //                 self.tops.depart.selected = item
            //                 self.changedepart(item);
            //             }
            //         })
            //         return;
            //     } else {
            //         localStorage.domainName = m.domainName;
            //         localStorage.domainUid = m.domainUid;
            //         self.tops.projectsList = m.projects;
            //         self.changeproject(m.projects[0]);
            //     }
            // };
            self.showListTips = true;
            var domainH = null;
            self.domainMouse = function(m){
                domainH = m;
            }
            self.changeproject = function(n) {
                self.showListTips = false;
                $timeout(function(){
                    self.showListTips = true;
                },300)
                self.tops.pro.selected = n;
                self.tops.depart.selected = domainH;
                localStorage.domainName = domainH.domainName;
                localStorage.domainUid = domainH.domainUid;
                self.tops.projectsList = domainH.projects;
                localStorage.projectName = n.projectName;
                localStorage.projectUid = n.projectId;
                if (/\/cvm\/loadbalancers/.test($location.path())) {
                    $location.url("/cvm/loadbalancers");
                } else {
                    $location.url($location.path());
                }
                self.getRoleFormUserInProject()
                if (/\/quickconfig\/createins/.test($location.path())) {
                    $location.url("/quickconfig/createins?type=quick");
                }
                $route.reload();

            };
            self.getRoleFormUserInProject = function() {
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/project/" + localStorage.projectUid + "/roles"
                }).success(function(res) {
                    if (res) {
                        localStorage.rolename = res.roleName;
                    }
                })
            }

            self.$on("send-create-pd", function(e, val) { //快捷创建项目或者部门时接收消息，同时更新部门列表
                if (val.type == "domain" || val.type == "project") {
                    getProjectDomainData();
                }
            })
            self.$on("delete-current-p", function(e, val) { //删除当前项目时跳到默认部门默认项目
                getProjectDomainData(true)
            })
            self.$on('$routeChangeSuccess', function(event, current, prev) {
                changeRole();
                if (current) {
                    var old = self.isDomainProjectShow; //保存上一个路由时的值
                    self.isDomainProjectShow = current.domainProject ? true : false; //项目和部门的显示影藏
                    if (self.isDomainProjectShow && !old) { //根据old和self.isDomainProjectShow 判断是否调用api;
                        getProjectDomainData()
                    }
                }
            })
            init();
        }
    }
}]);
componentModule.directive("regionChange", ["$rootScope", "$location", "$http", "$route", "bobMesSrv", "$translate", function(rootScope, $location, $http, $route, bobMesSrv, translate) {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: "/tmpl/region_change.html",
        replace: true,
        link: function(scope, elem, attr) {
            var self = scope;
            self.isRegionShow = false;
            // var parentRule = ['Resource',"Monitoring"];//根据菜单判定是否显示
            // var unActiveRule = ['cephview',"topology"];//根据菜单判定是否显
            function getRegionList() {
                self.regionModel = {
                    selected: ""
                };
                $http({
                    method: "GET",
                    url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/regions"
                }).then(function(res) {
                    if (res && res.data) {
                        self.regionList = res.data.filter(item => {
                            return item.status == 3;
                        })
                        self.regionModel.selected = self.regionList[0];
                        self.regionList.forEach(item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.regionModel.selected = item;
                            }
                        })
                    }
                })
            }
            function init() {
                if ($route.current) { //初始化项目部门是否可见
                    self.isRegionShow = $route.current.region ? true : false; //region状态的显示隐藏
                }
                getRegionList();
            }
            function getTotalData() {
                localStorage.TotalListName = "";
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/" + localStorage.regionKey + "/getTotalResourcesStatistics"
                }).then(function(res) {
                    if (res && res.data) {
                        if (res.data.length > 0) {
                            for (var i = 0; i < res.data.length; i++) {
                                if (res.data[i] == "ceph") {
                                    res.data[i] = translate.instant('aws.indextran.ceph');
                                } else if (res.data[i] == "memory") {
                                    res.data[i] = translate.instant('aws.indextran.memory');
                                }
                            }
                        }
                        localStorage.TotalListName = res.data.join("、");
                        var totalata = angular.copy(res.data);
                        for (var i = 0; i < totalata.length; i++) {
                            if (totalata[i].indexOf(":") > -1) {
                                totalata[i] = totalata[i].split(":")[1] + translate.instant('aws.indextran.ceph');
                            }
                        }
                        rootScope.ListName = totalata.join("、");
                        if (localStorage.TotalListName != "" && localStorage.$AWLOGINED == "true") {
                            rootScope.totalResShow = true;
                        } else {
                            rootScope.totalResShow = false;
                        }
                    }

                });
            }
            self.changeRegion = function(n) {
                $http({
                    method: "post",
                    url: "/awstack-user/v1/newregion",
                    data: { 'regionKey': n.regionKey }
                }).then(function(res) {
                    if (res && res.data && res.data.authToken) {
                        bobMesSrv.closed();
                        self.regionModel.selected = n;
                        localStorage.$AUTH_TOKEN = res.data.authToken;
                        localStorage.$LOGINDATA = JSON.stringify(res.data);
                        localStorage.regionName = n.regionName;
                        localStorage.regionKey = n.regionKey;
                        localStorage.regionUid = n.regionUid;
                        bobMesSrv.opened();
                        if (localStorage.managementRole == "2") {
                            getTotalData();
                            if (localStorage.TotalListName != "") {
                                rootScope.totalResShow = true;
                            }
                        } else {
                            rootScope.totalResShow = false;
                        }
                        localStorage.backupsService = res.data.backupService ? "backups" : "";
                        localStorage.cinderService = (res.data.cinderService || res.data.isCustom) ? "cinder" : "";
                        localStorage.isCustom = res.data.isCustom; //true为超融合模式，false为软件交付模式
                        localStorage.isEnabledArbiter = res.data.isEnabledArbiter; // true 为两节点
                        localStorage.cephService = res.data.enabledCeph ? "ceph" : "";
                        localStorage.installK8s = res.data.installK8s ? 1 : 2;
                        localStorage.installIronic = res.data.installIronic ? 1 : 2;
                        self.services.backups = localStorage.backupsService;
                        self.services.cinder = localStorage.cinderService;
                        self.services.ceph = localStorage.cephService;
                        if (/\/quickconfig\/createins/.test($location.path())) {
                            $location.url("/quickconfig/createins?type=quick");
                        }
                        $route.reload();
                    } else {
                        self.regionList.forEach(item => {
                            if (item.regionKey == localStorage.regionKey) {
                                self.regionModel.selected = item;
                            }
                        })
                    }

                })
            }
            self.$on("send-create-pd", function(e, val) { //快捷创建项目或者部门时接收消息，同时更新部门列表
                if (val.type == "region") {
                    getRegionList()
                }
                if(val.type == "changeRegion"){
                    self.regionModel.selected = val.data;
                }
            })
            self.$on('$routeChangeSuccess', function(event, current, prev) {
                if (current) {
                    self.isRegionShow = current.region ? true : false; //region的显示影藏
                }
            })
            init();
        }
    }
}]);





componentModule.directive("domainProjectSelect", ["$rootScope", "$location", "$http", "$route", "bobMesSrv", "checkQuotaSrv", "$translate", function(rootScope, $location, $http, $route, bobMesSrv, checkQuotaSrv, translate) {
    return {
        restrict: "EA",
        scope: {
            domainproject: '='
        },
        template: `<div>
                        <div class="control-group">
                            <label class="control-label">部门：</label>
                            <div class="controls">
                                <ui-select ng-model="singleRegion.depart.selected" ng-change="changedepart(singleRegion.depart.selected)">
                                    <ui-select-match placeholder="部门名称" title="{{$select.selected.domainName}}">{{$select.selected.disDomainName}}</ui-select-match>
                                    <ui-select-choices repeat=" depart in singleRegion.deparList | filter:{domainName:$select.search}">
                                        <div ng-bind-html="depart.disDomainName | highlight: $select.search" class="ui-select-item-ellips"  title="{{depart.disDomainName}}"></div>
                                    </ui-select-choices>
                                </ui-select>
                            </div>
                        </div>
                        <div class="control-group">
                            <label class="control-label">项目：</label>
                            <div class="controls">
                                <ui-select ng-model="singleRegion.pro.selected" ng-change="changeproject(singleRegion.pro.selected)">
                                    <ui-select-match placeholder="项目名称" title="{{$select.selected.projectName}}">{{$select.selected.disProjectName}}</ui-select-match>
                                    <ui-select-choices repeat="pro in singleRegion.projectsList | filter:{projectName:$select.search}">
                                        <div ng-bind-html="pro.disProjectName | highlight: $select.search" class="ui-select-item-ellips"  title="{{pro.disProjectName}}"></div>
                                    </ui-select-choices>
                                </ui-select>
                            </div>
                        </div> 
                    </div>`,
        replace: true,
        link: function(scope, elem, attr) {
            var self = scope;

            function getProjectDomainData() {
                self.singleRegion = {
                    depart: { selected: "" },
                    deparList: [],
                    pro: { selected: "" },
                    projectsList: []
                };
                scope.domainproject = self.singleRegion;
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/domains/projects"
                }).success(function(res) {
                    if (res) {
                        self.singleRegion.deparList = res;
                        for (var i = 0; i < self.singleRegion.deparList.length; i++) {
                            if (self.singleRegion.deparList[i].domainUid == 'default') {
                                self.singleRegion.deparList[i].disDomainName = '默认部门';
                            } else {
                                self.singleRegion.deparList[i].disDomainName = self.singleRegion.deparList[i].domainName;
                            }
                            if (self.singleRegion.deparList[i].projects && self.singleRegion.deparList[i].projects.length > 0) {
                                for (var j = 0; j < self.singleRegion.deparList[i].projects.length; j++) {
                                    if (self.singleRegion.deparList[i].projects[j].projectName == 'admin' && self.singleRegion.deparList[i].domainUid == 'default') {
                                        self.singleRegion.deparList[i].projects[j].disProjectName = '默认项目';
                                    } else {
                                        self.singleRegion.deparList[i].projects[j].disProjectName = self.singleRegion.deparList[i].projects[j].projectName;
                                    }
                                }
                            }
                        }
                        self.singleRegion.deparList.map(function(item) {
                            if (item.domainName == localStorage.domainName) {
                                self.singleRegion.depart.selected = item;
                            }
                        });
                        if (!localStorage.domainName) {
                            self.singleRegion.depart.selected = res[0];
                        }
                    }
                    self.singleRegion.projectsList = self.singleRegion.depart.selected.projects
                    if (self.singleRegion.projectsList) {
                        self.singleRegion.pro.selected = self.singleRegion.projectsList[0];
                        self.singleRegion.projectsList.map(function(item) {
                            if (item.projectId == localStorage.projectUid) {
                                self.singleRegion.pro.selected = item;
                            }
                        });
                    }
                });
            }
            self.changedepart = function(m) {
                if (!m.projects || m.projects.length == 0) {
                    self.singleRegion.pro.selected = '';
                    self.singleRegion.deparList.forEach(item => {
                        if (item.domainUid == localStorage.defaultdomainUid) {
                            self.singleRegion.depart.selected = item
                            self.changedepart(item);
                        }
                    })
                    return;
                } else {
                    self.singleRegion.projectsList = m.projects;
                    self.changeproject(m.projects[0]);
                }
            };

            self.changeproject = function(n) {
                self.singleRegion.pro.selected = n;
            };
            getProjectDomainData()
        }
    }
}]);
componentModule.directive("serviceTip", ["$translate", function($translate) {
    return {
        restrict: "EA",
        scope: {
            service: "=",
            menus: "=",
            menuHref: "="
        },
        template: `
                <div class="service-tip" ng-show="!obj[service]">
                    {{"aws.serviceTip.begin" | translate}} 
                    <span ng-repeat="menu in menus track by $index">
                        <a  ng-show="$index == menus.length-1" ng-href="{{menuHref}}" >{{menu}}</a>
                        <span ng-show="$index != menus.length-1">{{menu}} > </span>
                    </span>
                    {{"aws.serviceTip." + service | translate}} 
                </div>
            `,
        replace: true,
        link: function(scope, elem, attr) {
            scope.obj = {};
            scope.obj[scope.service] = false;
            if (scope.$root.services[scope.service]) scope.obj[scope.service] = true;
            //if(localStorage[scope.service + "Service"]) scope.obj[scope.service] = true;

        }
    }
}]);
componentModule.directive("cephSsd", [function() {
    return {
        restrict: "EA",
        scope: {
            bardata: "=",
            delfn: "&"
        },
        templateUrl: "js/system/cephView/tmpl/ceph-ssd.html",
        replace: true,
        link: function(scope, elem, attr) {
            $(elem).find(".disk-box").on("click", function(e) {
                $(".disk-box").removeClass("checked");
                $(this).addClass("checked")
                e.stopPropagation();
                e.preventDefault();
                scope.osdBtn ? scope.osdBtn(scope.bardata) : ""
            });
            $(".ceph-grid").on("click", function(e) {
                $(".disk-box").removeClass("checked");
            });
            scope.showInfo = false;
            $(elem).hover(function(e) {
                //scope.showInfo = true;
                $(this).find(".disk-info").show();
                scope.$apply();
            }, function(e) {
                //scope.showInfo = true;
                $(this).find(".disk-info").hide();
                scope.$apply();
            });
            elem.on('mouseup', function(e) {
                //scope.showInfo = true;
                $(this).find(".disk-info").show();
                scope.$apply();
            });
            elem.on('mousedown', function(e) {
                //scope.showInfo = false;
                $(this).find(".disk-info").hide();
                scope.$apply();
            });
            scope.del = function() {
                scope.delfn ? scope.delfn() : "";
            }
        }
    }
}]);
componentModule.directive("cephHdd", [function() {
    return {
        restrict: "EA",
        scope: {
            bardata: "=",
            osdBtn: "=", //选中后支持其他操作
            delfn: "&" //是否可以删除
        },
        templateUrl: "js/system/cephView/tmpl/ceph-hdd.html",
        replace: true,
        link: function(scope, elem, attr) {
            $(elem).find(".disk-box").on("click", function(e) {
                $(".disk-box").removeClass("checked");
                $(this).addClass("checked")
                e.stopPropagation();
                e.preventDefault();
                scope.osdBtn ? scope.osdBtn(scope.bardata) : ""
            });
            $(".ceph-grid").on("click", function(e) {
                $(".disk-box").removeClass("checked");
            });
            $(elem).hover(function(e) {
                $(this).find(".disk-info").show();
                scope.$apply();
            }, function(e) {
                $(this).find(".disk-info").hide();
                scope.$apply();
            });
            elem.on('mouseup', function(e) {
                $(this).find(".disk-info").show();
                scope.$apply();
            });
            elem.on('mousedown', function(e) {
                $(this).find(".disk-info").hide();
                scope.$apply();
            });
            scope.del = function() {
                scope.delfn ? scope.delfn() : "";
            }

        }
    }
}])

componentModule.directive("cephBox", [function() {
    return {
        restrict: "EA",
        scope: {
            cephlist: "=",
            osdBtn: "="
        },
        templateUrl: "js/system/cephView/tmpl/ceph-box.html",
        replace: true,
        link: function(scope, elem, attr) {}
    }
}])

componentModule.directive("searchRefresh", ["NgTableParams", function(NgTableParams) {
    return {
        restrict: "EA",
        scope: {
            refreshFuc: "=", //刷新函数  必填
            tableContent: "=", //table名称 必填
            context: "=", //上下文    必填
            tableData: "=", //table数据 
            btnType: "@", //选择button type
            changeSelect: "=", //切换选项框回调函数
            statusList: "=" //状态搜索
        },
        template: `<div>
                    <div class="search-list" ng-show="statusList.length">
                        <ui-select ng-model="x.searchItem"  ng-change="applyGlobalSearch()">
                            <ui-select-match placeholder='请选择'>
                                {{$select.selected.name}}
                            </ui-select-match>
                            <ui-select-choices repeat="search in statusList | propsFilter:{name:$select.search}">
                                <div ng-bind-html="search.name | highlight: $select.search"></div>
                            </ui-select-choices>
                        </ui-select>
                    </div>
                    <div class="search-box">
                        <form name="searchForm" novalidate>
                            <button class="btn" type="submit"  ><i class="icon-aw-search"></i></button>
                            <input type="text" class="form-control" ng-change="applyGlobalSearch()" autocomplete="off" maxlength="128" name="searchTerm" ng-model="globalSearchTerm" placeholder="{{\'aws.action.search\' |translate}}" />
                        </form>
                    </div>
                    <div type="button" class="btn btn-renovat" ng-click="refresh()">
                        <i class="icon-aw-refresh"></i>
                    </div>
                </div>`,
        replace: true,
        link: function(scope, elem, attr) {
            var searchItem;
            scope.x = {};

            function globalSearchFunc(data) {
                data = data.filter(item => {
                    if (scope.globalSearchTerm) {
                        return item.searchTerm.indexOf(scope.globalSearchTerm) > -1
                    } else {
                        return true
                    }
                })
                return data;
            }

            function statusFunc(data) {
                searchItem = scope.x.searchItem;
                data = data.filter(item => {
                    if (searchItem && searchItem.key) {
                        return item[searchItem.key] && item[searchItem.key].indexOf(searchItem.value) > -1
                    } else {
                        return true
                    }
                })
                return data
            }
            scope.applyGlobalSearch = function() {
                var table = scope.context[scope.tableContent];
                var data = angular.copy(scope.tableData);
                if (!data) return;
                data = statusFunc(data);
                data = globalSearchFunc(data);
                table.data = data; //设置过滤后的数据
                table.settings().dataset = data;
                table.reload()
                if (scope.btnType == "radio") {
                    scope.changeSelect(filterData[0] || {});
                }
            }
            scope.refresh = function() {
                scope.globalSearchTerm = "";
                if (scope.statusList && scope.statusList.length) {
                    scope.x.searchItem = scope.statusList[0];
                }
                scope.refreshFuc()
            }
            scope.$watch(function() {
                return sessionStorage[scope.context.titleName]
            }, function(val) {
                if (val) {
                    clearFunc()
                }

            }, true)

            function clearFunc() {
                if (scope.tableData) {
                    scope.globalSearchTerm = "";
                    if (scope.statusList && scope.statusList.length) {
                        scope.x.searchItem = scope.statusList[0];
                    }
                    scope.applyGlobalSearch()
                }
            }
            scope.$watch(function(){
                return scope.tableData
            },function(val){
                if(val){
                    scope.applyGlobalSearch()
                }

            },true)
        }
    }
}])

componentModule.directive("servicePermit", [function() {
    return {
        restrict: "EA",
        scope: {
            serviceName: "=",
        },
        replace: true,
        link: function(scope, elem, attr) {
            var services = angular.fromJson(scope.serviceName);
            for (let i = 0; i < services.length; i++) {
                if (localStorage[services[i] + "Service"] != services[i]) {
                    $(elem).css('display', 'none');
                    break;
                } else {
                    $(elem).css('display', 'block')
                }
            }
            services.map(item => {

            })

        }
    }
}])

componentModule.directive("sourcePrice", [function() {
    return {
        restrict: "EA",
        scope: true,
        replace: true,
        template: '<div class="des-info" ng-if = "billingActive">\
                <span>总价格：</span>\
                <strong>¥{{priceHour}}</strong>\
                <span>每小时 × 1 =</span>\
                <strong>¥{{priceHourAbout}}</strong>\
                <span>每小时 (合 ¥{{priceMonth}} 每月)</span>\
            </div>',
        link: function(scope, elem, attr) {

        }
    }
}])

// 普通按钮 licenceType = "btn"
// 下拉框 licenceType = "btn-group"
// 详情 licenceType = "btn-details" 
// ui-table licenceType = "btn-tab"
// 列表中测option栏 licenceType = "btn-list"

componentModule.directive("licenceType", function($rootScope) {
    return {
        restrict: "A",
        scope: {
            licenceType: "@",
            id: "@",
            licenceIf: "@"
        },
        link: function(scope, elem, attr) {
            let LicenceList = JSON.parse(localStorage.getItem("LicenseList"))
            if (attr.licenceIf) {
                if ($rootScope.ADMIN) {
                    if (attr.licenceIf == "!ADMIN") {
                        $(elem).remove()
                    }
                } else {
                    if (attr.licenceIf == "ADMIN") {
                        $(elem).remove()
                    }
                }
            }
            switch (attr.licenceType) {
                case "btn-group":
                    let count = 0
                    let liCount = $(elem).find("ul").find("li").length

                    if (!liCount) {
                        $(elem).remove()
                    }
                    break;
                case "btn":
                    if (LicenceList) {
                        for (let i = 0; i <= LicenceList.length - 1; i++) {
                            let licenceInfo = LicenceList[i]
                            if (attr.id == licenceInfo.keywords && !licenceInfo.selected) {
                                $(elem).remove()
                            }
                        }
                    }
                    break;
                case "btn-list":
                    let uid = attr.id.split("_")[0]
                    if (LicenceList) {
                        LicenceList.forEach(item => {
                            if (item.keywords == uid && !item.selected) {
                                $(elem).remove()
                            }
                        });
                    }
                    break;
            }
        }
    };
});
//下拉控制table栏的指令
componentModule.directive("setting", ["$translate", function(translate) {
    return {
        restrict: "E",
        scope: {
            titleData: "=",
            siteTitle: "=",
            searchTearm: "&",
            tableData: "="
        },
        template: `<div class='dropdown show-title'>
                    <button type='button' class='btn btn-renovat dropdown-toggle'>
                      <i class='icon-aw-list'></i>
                    </button>
                    <ul class='dropdown-menu'>
                        <li ng-repeat='title in titleData track by $index' ng-if="!title.isShow">
                          <div class='checkbox'>
                            <label>
                               <input type='checkbox' ng-model='title.value' ng-change='isShowTitle($index,title)' ng-disabled='title.disable'/>
                               <i class='iconfont'></i>
                               <span>{{'aws.'+title.name|translate}}</span>
                            </label>
                          </div>
                        </li>
                    </ul>
                  </div>`,
        link: function(scope, ele, attr, ctrl) {
            $(ele).find(".dropdown-toggle").on("click", function(e) {
                $(this).parent().toggleClass("open");
                e.stopPropagation();
                e.preventDefault();
            });
            $(ele).find(".dropdown-menu").on("click", function(e) {
                if (e.target.className == "checkbox" || $(e.target).closest(".checkbox").length > 0) { e.stopPropagation(); }
            });
            $("html").on("click", function(e) {
                $(ele).find(".dropdown").removeClass("open");
            });
            //第一次进来没有数据
            if (!sessionStorage[scope.siteTitle] && scope.siteTitle != undefined) {
                sessionStorage.setItem(scope.siteTitle, JSON.stringify(scope.titleData));
            }
            scope.isShowTitle = function(index, title) {
                var postData = {
                    tableData: scope.tableData,
                    titleData: scope.titleData
                };
                var currentSession = JSON.parse(sessionStorage[scope.siteTitle]);
                currentSession[index].value = title.value;
                sessionStorage.setItem(scope.siteTitle, JSON.stringify(currentSession));
                if (scope.tableData) {
                    scope.searchTearm({ obj: postData });
                }
            };
        }
    };
}]);

componentModule.directive("settingCol", ["$translate", function(translate) {
    return {
        restrict: "E",
        scope: {
            titleData: "=",
            siteTitle: "=",
            configSearch: "=",
            tableData: "="
        },
        template: `<div class='dropdown show-title'>
                    <button type='button' class='btn btn-renovat dropdown-toggle'>
                      <i class='icon-aw-list'></i>
                    </button>
                    <ul class='dropdown-menu'>
                        <li ng-repeat='title in titleData track by $index' ng-if="title.title">
                          <div class='checkbox'>
                            <label>
                               <input type='checkbox' ng-model='title.show' ng-change='isShowTitle($index,title)' ng-disabled='title.disable'/>
                               <i class='iconfont'></i>
                               <span>{{title.title}}</span>
                            </label>
                          </div>
                        </li>
                    </ul>
                  </div>`,
        link: function(scope, ele, attr, ctrl) {
            $(ele).find(".dropdown-toggle").on("click", function(e) {
                $(this).parent().toggleClass("open");
                e.stopPropagation();
                e.preventDefault();
            });
            $(ele).find(".dropdown-menu").on("click", function(e) {
                if (e.target.className == "checkbox" || $(e.target).closest(".checkbox").length > 0) { e.stopPropagation(); }
            });
            $("html").on("click", function(e) {
                $(ele).find(".dropdown").removeClass("open");
            });
            //第一次进来没有数据
            if (!sessionStorage[scope.siteTitle] && scope.siteTitle != undefined) {
                sessionStorage.setItem(scope.siteTitle, JSON.stringify(scope.titleData));
            }
            scope.isShowTitle = function(index, title) {
                var postData = {
                    titleData: scope.titleData
                };
                var currentSession = JSON.parse(sessionStorage[scope.siteTitle]);
                currentSession[index].show = title.show;
                sessionStorage.setItem(scope.siteTitle, JSON.stringify(currentSession));
                (scope.configSearch && scope.tableData) ? scope.configSearch(scope.tableData, currentSession): ""
            };
        }
    };
}]);

componentModule.directive("loading", ["$http", "APILOADING", "$timeout", function($http, APILOADING, $timeout) {
    return {
        restrict: "EA",
        template: `<div class="global-loading" ng-class="{'shows':apiLoading}">
            <i class="loading-icon"></i>
            <span>数据加载中</span>
        </div>`,
        scope: {},
        link: function(scope, ele, attr, ctrl) {
            var time = null;
            scope.$watch(function() {
                return $http.pendingRequests;
            }, function(ne, old) {
                if (ne.length > 0) {
                    if (time) { $timeout.cancel(time) };
                    time = $timeout(function() {
                        var pendingLists = angular.copy(ne);
                        var num = 0;
                        pendingLists.forEach(item => {
                            for (var i = 0; i < APILOADING.exclude.length; i++) {
                                var cur = new RegExp(APILOADING.exclude[i]);
                                if (cur.test(item.url)) {
                                    num += 1;
                                    break;
                                }
                            }
                        })
                        if (pendingLists.length > num) {
                            scope.apiLoading = true;
                            let _height = $(window).height();
                            $(ele).find(".global-loading").css('minHeight', _height);
                        } else {
                            scope.apiLoading = false;
                        }
                    }, 0)
                } else {
                    scope.apiLoading = false;
                }
            }, true)
            scope.$on("$routeChangeStart", function() {
                if ($http.pendingRequests.length > 0) {
                    $http.pendingRequests = [];
                }
            })

        }
    }
}])
componentModule.directive("pluginTips", ["$translate", function($translate) {
    return {
        restrict: "EA",
        scope: {
            type: "="
        },
        template: `<div class="" ng-if="pluginContext.show==1">
            <span>
            {{pluginContext.message}}
            </span>
        </div>`,
        link: function(scope, elem, attr) {
            scope.pluginContext = {
                type: attr.type,
                show: 2,
                message: $translate.instant("aws.indextran." + attr.type)
            }
            switch (scope.pluginContext.type) {
                case 'installK8s':
                    scope.pluginContext.show = localStorage.installK8s ? localStorage.installK8s : '2';
                    break;
                case 'installIronic':
                    scope.pluginContext.show = localStorage.installIronic ? localStorage.installIronic : '2';
                    break;
                default:
                    scope.pluginContext.show = 2;
                    break;
            }
        }
    }
}])
componentModule.directive("pluginCollapse", ['$timeout', function($timeout) {
    return {
        restrict: "EA",
        link: function(scope, elem, attr) {
            $(elem).find('.collapse-title').on("click", function() {
                $(this).siblings(".collapse-on").toggleClass("hide");
                $timeout(function() {
                    scope.$apply();
                }, 50);
            })
        }
    }
}])
componentModule.directive("btnRightInfo", ['$timeout', function($timeout) {
    return {
        restrict: "EA",
        link: function(scope, elem, attr) {
            let infoElem = $(elem).next().find('.btn-info');
            infoElem.hide();
            scope.$watch(function() {
                return $(elem).hasClass('disabled')
            }, function(value) {
                infoElem.hide();
                $(document).ready(function() {
                    if (value) {
                        //勾选个数为1
                        $(elem).hover(function() {
                            infoElem.show();
                            let infoHeight = (infoElem.height() + 20) / 2;
                            let parentHeight = $(elem).parent().height() / 2;
                            let topHeight = infoHeight - parentHeight;
                            //调整信息上下显示的高度
                            infoElem.css("top", -topHeight + "px")
                            //调整箭头上下显示的高度
                            infoElem.find('.arrow').css("top", topHeight + "px")
                        }, function() {
                            infoElem.hide();
                        });
                    } else {
                        $(elem).hover(function() {
                            infoElem.hide();
                        });
                    }
                });
            });
        }
    }
}])

componentModule.directive("tbdsWidth", ['$timeout','resize', function($timeout,resize) {
    return {
        restrict: "EA",
        link: function(scope, elem, attr) {
            function widthFunc(){
                var width =$(".page-inner").width()-240;
                var width1 =$(".page-inner").width();
                if(width1<1035){
                    width =$(".page-inner").width()-180;
                    $(".TBDS-header-right.bottom").css("height",150)
                }else if(width1<1210){
                    $(".TBDS-header-right.bottom").css("height",100)
                } else{
                    $(".TBDS-header-right.bottom").css("height",50)
                }
                $(".TBDS-header-right").css("width",width)
            }
            resize().call(function() {
                widthFunc();
            });
        }
    }
}])
componentModule.directive("stepControl", ['$timeout','resize', function($timeout,resize) {
    return {
        restrict: "E",
        scope:{
            step:"=",
            value:"=",
            min:"=",
            max:"=",
            changeValueFunc:"=",
            unit:"="
        },
        template: `<div class="step-control-component">
            <button ng-class="reduce" ng-click="reduceStep()">-</button>
            <input class="bind-value" ng-model="value" ng-change="changeInputValue(value)" min="min" max="max" ng-model-options="{ updateOn: 'blur' }" num-range>
            <span class="unit">{{unit}}</span>
            <button ng-class="increase" ng-click="increaseStep()">+</button>
        </div>`,
        link: function(scope, elem, attr,ctrl) {
             scope.reduceStep=function(){
                 if(!scope.value){
                    return;
                 }
                 if(scope.value-scope.step<scope.min){
                    scope.value=scope.min;
                    scope.changeValueFunc(scope.min);
                 }else{
                    scope.value=scope.value-scope.step;
                    scope.changeValueFunc(scope.value);
                 }
             }
             scope.increaseStep=function(){
                 if(!scope.value){
                    return;
                 }
                 if(scope.value+scope.step>scope.max){
                    scope.value=scope.max;
                    scope.changeValueFunc(scope.max);
                 }else{
                    scope.value=scope.value+scope.step;
                    scope.changeValueFunc(scope.value);
                 }
             }
             scope.changeInputValue=function(){
                 if(scope.changeValueFunc){
                    scope.changeValueFunc(scope.value);
                 }
             }
        }
    }
}])