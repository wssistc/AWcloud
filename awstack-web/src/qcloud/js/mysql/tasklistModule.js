import "./tasklistSrv";

var tasklistModule = angular.module("tasklistModule", ["ngAnimate","ngSanitize","ui.bootstrap","ngTable", "ui.select","tasklistSrvModule","paramTmplSrvModule"]);

tasklistModule.controller("tasklistCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","$timeout","$window","NgTableParams","tasklistSrv","paramTmplSrv","RegionID",
function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,$timeout,$window,NgTableParams,tasklistSrv,paramTmplSrv,RegionID) {
    var self = $scope;
    self.timeStep = "all";
    
    self.regions = {
        options:paramTmplSrv.regionOptions
    };
    self.queryLimit = {
        "regionId":RegionID.Region(),
        "timeRange":{},
        "page":{},
        "jobId":""
    };

    function initDaterangepicker(){
        $('.calendar-select i').click(function() {
          $(this).parent().find('input').click();
        });

        $('#time-calendar').daterangepicker({
            //"startDate": moment().subtract(6, 'days'),
            "endDate": moment(),
            "maxDate" : moment(), //最大时间 
            "opens": "left",
            "showDropdowns": true,
            "locale" : {  
                "format" : 'YYYY-MM-DD', //控件中from和to 显示的日期格式  
                "separator" : '  至  ', 
                "applyLabel" : '确定',  
                "cancelLabel" : '取消',  
                "fromLabel" : '起始时间',  
                "toLabel" : '结束时间',  
                "customRangeLabel" : '自定义',  
                "daysOfWeek" : [ '日', '一', '二', '三', '四', '五', '六' ],  
                "monthNames" : [ '一月', '二月', '三月', '四月', '五月', '六月','七月', '八月', '九月', '十月', '十一月', '十二月' ],  
                "firstDay" : 1  
            }   
        }, function(start, end, label) {
            self.queryLimit.timeRange = {
                "start":start.format('YYYY-MM-DD HH:mm:ss'),
                "end":end.format('YYYY-MM-DD HH:mm:ss')
            };
            self.timeStep = "";
            self.queryLimit.page.offset = 0;
            self.queryLimit.page.limit = 10;
            self.globalSearchTerm = "";
            //initTasklistTable();
        }); 
        $('#time-calendar').val("");
    }

    initDaterangepicker();

    function getQueryTaskParams(){
        var postData = {
            "offset":self.queryLimit.page.offset?self.queryLimit.page.offset:0,
            "limit":self.queryLimit.page.limit?self.queryLimit.page.limit:10
        };
        if(self.queryLimit.timeRange.start){
            postData.startTimeBegin = self.queryLimit.timeRange.start;
        }
        if(self.queryLimit.timeRange.end){
            postData.startTimeEnd = self.queryLimit.timeRange.end;
        }
        if(self.queryLimit.jobId){
            postData.jobId = self.queryLimit.jobId;
        }
        return postData;
    }

    function succData(params,res){
        if(res && res.data){
            res.data.map(function(item){
                item.region = self.queryLimit.regionId
                return item;
            });
            self.tasklistData = res.data;
            self.mysqlTotal = res.totalCount;
            self.pageStep = params.limit;
        }
    }

    function initTasklistTable(){
        var params = getQueryTaskParams();
        console.trace();
        tasklistSrv.queryTasklist({
            "params":params
        }).then(function(res){
            succData(params,res);
        }).then(function(){
            $window.taskListTimer = null;
            $window.taskListTimer = taskListTimer
            $window.taskListTimer();
        })
    }
    initTasklistTable();

    
    function taskListTimer(){
        $window.taskListTimer = null;
        $window.taskInterFunc = $timeout(function(){
             var params = getQueryTaskParams();
            tasklistSrv.queryTasklist({
                "params":params
            }).then(function(res){
                succData(params,res);
            }).finally(function(res){
                    $window.taskListTimer = null;
                    $window.taskListTimer = taskListTimer
                    $window.taskListTimer();
            })
        }, 5000)
    }

    self.refreshtasklist = function(){
        self.timeStep = "all";
        initDaterangepicker();
        self.queryLimit.timeRange = {};
        self.queryLimit.page.offset = 0;
        self.queryLimit.page.limit = 10;
        self.globalSearchTerm = "";
        initTasklistTable();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        if(term){
            self.queryLimit.jobId = term;
            self.queryLimit.page.offset = 0;
            self.queryLimit.page.limit = 10;
        }else{
            self.queryLimit.jobId = "";
        }
        $timeout.cancel($window.taskInterFunc);
        $window.taskListTimer = null;
        initTasklistTable()
    };

    self.$watch(function(){
        return self.globalSearchTerm;
    },function(searchTerm,old){
        if(old&&searchTerm == ""){
            self.queryLimit.jobId = "";
            $timeout.cancel($window.taskInterFunc);
            $window.taskListTimer = null;
            initTasklistTable()
        }
    });

    self.changePage = function(obj){
        self.queryLimit.page.offset = obj.offset;
        self.queryLimit.page.limit = obj.limit;
        self.globalSearchTerm = "";
        /*initTasklistTable({
            "offset":obj.offset,
            "limit":obj.limit
        });*/
        $timeout.cancel($window.taskInterFunc);
        $window.taskListTimer = null;
        initTasklistTable()
    };

    self.timeSelectTab = function(step){
        var time_start = "",tiem_end = "";
        self.timeStep = step;
        initDaterangepicker();
        self.queryLimit.page.offset = 0;
        self.queryLimit.page.limit = 10;
        $('#time-calendar').val("");
        self.globalSearchTerm = "";
        if(step == "all"){
            time_start = "";
            tiem_end = moment();
        }else if(step =="today"){
            time_start = moment();
            tiem_end = moment();
        }else if(step == "yesterday"){
            time_start = moment().subtract(1, 'days');
            tiem_end = moment().subtract(1, 'days');
        }else{
            time_start = moment().subtract(step.substring(0,step.length-1),step.substring(step.length-1,step.length));
            tiem_end = moment();
        }
        self.queryLimit.timeRange = {
            "start": step =="today" || step =="yesterday"?time_start.format('YYYY-MM-DD 00:00:00'):time_start?time_start.format('YYYY-MM-DD HH:mm:ss'):"",
            "end": tiem_end.format('YYYY-MM-DD HH:mm:ss')
        };
        $timeout.cancel($window.taskInterFunc);
        $window.taskListTimer = null;
        initTasklistTable()
    };

    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        sessionStorage.setItem("RegionSession",regionId);
        self.timeStep = "all";
        self.queryLimit.page.offset = 0;
        self.queryLimit.page.limit = 10;
        initDaterangepicker();
        self.queryLimit.timeRange = {};
        self.globalSearchTerm = "";
        $timeout.cancel($window.taskInterFunc);
        $window.taskListTimer = null;
        initTasklistTable()
    };

    self.viewTaskDetail = function(item){
        var scope = self.$new();
        var taskDetailModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"taskDetailModal.html",
            scope:scope
        });
        scope.taskType = item.type;
        switch(item.type){
            case "1": //"数据库回档",
            scope.taskTypeDetail_title = "数据库回档详情";
            tasklistSrv.getCdbRollbackJobTask({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "jobId":item.jobId
                }
            }).then(function(res){
                if(res && res.data){
                    scope.taskDetailData = res.data;
                }
            });
            break;
            case "2": //"批量SQL操作" 缺API
            scope.taskTypeDetail_title = "批量SQL操作详情";
            break;
            case "3": //"数据导入", 缺API
            scope.taskTypeDetail_title = "数据导入详情";
            break;
            case "5": //"参数设置",
            scope.taskTypeDetail_title = "参数设置详情";
            tasklistSrv.getCdbModifyParamsJobTask({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "jobId":item.jobId
                }
            }).then(function(res){

                if(res && res.data){
                    scope.taskDetailData = res.data;
                    scope.cdbid = res.data.detail[0].cdbInstanceId;
                    tasklistSrv.getInstanceName({
                       "params":{
                            "Region":self.queryLimit.regionId,
                            "cdbInstanceIds.0":scope.cdbid
                        }
                    }).then(function(res){
                        if(res.cdbInstanceSet[0]){
                            var res = res
                             scope.cdbName = res.cdbInstanceSet[0].cdbInstanceName;
                            
                        }else{
                            scope.cdbName = "undefined";
                        }
                    })
                }
            });
            break;
            case "6": //"初始化", 
            scope.taskTypeDetail_title = "初始化详情";
            tasklistSrv.getCdbInitInfo({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "jobId":item.jobId
                }
            }).then(function(res){
                if(res && res.data){
                    scope.taskDetailData = res.data;
                    scope.cdbid = res.data.detail[0].cdbInstanceId
                    tasklistSrv.getInstanceName({
                        "params":{
                            "Region":self.queryLimit.regionId,
                            "cdbInstanceIds.0":scope.cdbid
                        }
                    }).then(function(res){
                        if(res.cdbInstanceSet[0]){
                            var res = res
                            scope.cdbName = res.cdbInstanceSet[0].cdbInstanceName;
                            
                        }else{
                            scope.cdbName = "undefined";
                        }
                    })
                }
            });
            break;
            case "7": //"重启", 缺API
            scope.taskTypeDetail_title = "重启详情";
            break;
            case "8": //"开启GTID", 缺API
            scope.taskTypeDetail_title = "开启DTID详情";
            break;
            case "9": //"只读实例升级", 
            scope.taskTypeDetail_title = "只读实例升级详情";
            tasklistSrv.getCdbUpgradeJobInfo({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "jobId":item.jobId
                }
            }).then(function(res){
                if(res && res.data){
                    scope.taskDetailData = res.data;
                    scope.cdbid = res.data.detail[0].cdbInstanceId
                    tasklistSrv.getInstanceName({
                        "params":{
                            "Region":self.queryLimit.regionId,
                            "cdbInstanceIds.0":scope.cdbid
                        }
                    }).then(function(res){
                        if(res.cdbInstanceSet[0]){
                            var res = res
                             scope.cdbName = res.cdbInstanceSet[0].cdbInstanceName;
                            
                        }else{
                            scope.cdbName = "undefined";
                        }
                    })
                }
            });
            break;
            case "10": //"实例回档", 缺API
            scope.taskTypeDetail_title = "实例回档详情";
            break;
            case "11": //"主实例升级", 
            scope.taskTypeDetail_title = "主实例升级详情";
            tasklistSrv.getCdbUpgradeJobInfo({
                "params":{
                    "Region":self.queryLimit.regionId,
                    "jobId":item.jobId
                }
            }).then(function(res){
                if(res && res.data){
                    scope.taskDetailData = res.data;
                    scope.cdbid = res.data.detail[0].cdbInstanceId
                    tasklistSrv.getInstanceName({
                        "params":{
                            "Region":self.queryLimit.regionId,
                            "cdbInstanceIds.0":scope.cdbid
                        }
                    }).then(function(res){
                        if(res.cdbInstanceSet[0]){
                            var res = res
                             scope.cdbName = res.cdbInstanceSet[0].cdbInstanceName;
                            
                        }else{
                            scope.cdbName = "undefined";
                        }
                    })
                }
            });
            break;
            case "12": //"删除库表",缺API
            scope.taskTypeDetail_title = "删除库表详情";
            break;
            case "13": //"切换为主实例" 缺API
            scope.taskTypeDetail_title = "切换主实例详情";
            break;
        }
    }
}]);