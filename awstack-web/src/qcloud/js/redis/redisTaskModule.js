import "./redisTaskSrv";
import "./redisSrv";

var redisTaskModule = angular.module("redisTaskModule", ["ngAnimate","ngSanitize","ui.bootstrap","ngTable", "ui.select","ngFileSaver","redisTaskSrvModule","redissrv"]);

redisTaskModule.controller("redisTaskCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","NgTableParams","redisTaskSrv","redisSrv","RegionID",
function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,NgTableParams,redisTaskSrv,redisSrv,RegionID) {
    var self = $scope;
    self.regions = {
        options:redisSrv.getRegionList()
    };
    function initQueryLimit(){
        return {
            "regionId":RegionID.Region(),
            "timeStep":"today",
            "timeRange":{},
            "page":{},
            "taskType":[],
            "taskStatus":[],
            "redisName":""
        };
    }
    self.queryLimit = initQueryLimit();
    self.checkLimit = {};

    self.typeOptions = [
        {"name":"导入Rdb","value":"task_importRdb"},
        {"name":"导出备份","value":"task_exportBackup"},
        {"name":"恢复实例","value":"task_restoreBackup"},
        {"name":"回档实例","value":"task_restoreStream"},
        {"name":"备份实例","value":"task_backupInstance"},
        {"name":"清空实例","value":"task_cleanInstance"},
        {"name":"升级实例","value":"task_resizeInstance"}
    ];

    self.taskStatusOptions = [
        {"name":"待执行","value":"0"},
        {"name":"执行中","value":"1"},
        {"name":"成功","value":"2"},
        {"name":"失败","value":"3"},
        {"name":"执行出错","value":"-1"}
    ];

	function initRedisTaskTable(){
        var postData = {
            "offset":self.queryLimit.page.offset?self.queryLimit.page.offset:0,
            "limit":self.queryLimit.page.limit?self.queryLimit.page.limit:10,
            "beginTime":moment().format('YYYY-MM-DD 00:00:00'),
            "endTime":moment().format('YYYY-MM-DD HH:mm:ss')
        };
        if(self.queryLimit.timeRange.start){
            postData.beginTime = self.queryLimit.timeRange.start;
        }
        if(self.queryLimit.timeRange.end){
            postData.endTime = self.queryLimit.timeRange.end;
        }
        if(self.queryLimit.taskType.length > 0){
            for(let i = 0; i < self.queryLimit.taskType.length ; i++){
                postData["taskType." + i] = self.queryLimit.taskType[i];
            }
        }
        if(self.queryLimit.taskStatus.length > 0){
            for(let i = 0; i < self.queryLimit.taskStatus.length ; i++){
                postData["taskStatus." + i] = self.queryLimit.taskStatus[i];
            }
        }
        if(self.queryLimit.redisName){
            postData.redisName = self.queryLimit.redisName;
        }

        redisTaskSrv.queryRedisTask({
            "params":postData
        }).then(function(res){
            if(res && res.data){
                res.data.redisTaskSet.map(function(item){
                    item.region = self.queryLimit.regionId
                    return item;
                });
                self.redisTaskData = res.data.redisTaskSet;
                self.totalDataCount = res.totalCount;
                self.pageStep = postData.limit;
            }
        })
    }
    initRedisTaskTable();

    self.limitConfirm = function(){
        self.queryLimit.taskType = self.queryLimit.taskType.splice(self.queryLimit.taskType.length,0);
        self.queryLimit.taskStatus = self.queryLimit.taskStatus.splice(self.queryLimit.taskStatus.length,0);
        for(let key in self.checkLimit.taskType){
            if(self.checkLimit.taskType[key]){
                self.queryLimit.taskType.push(key);
            }
        }
        for(let key in self.checkLimit.taskStatus){
            if(self.checkLimit.taskStatus[key]){
                self.queryLimit.taskStatus.push(key);
            }
        }
        initRedisTaskTable();
    };

    self.refreshtasklist = function(){
        self.queryLimit = initQueryLimit();
        self.checkLimit = {};
        self.globalSearchTerm = "";
        initRedisTaskTable();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        if(term){
            self.queryLimit.redisName = term;
            self.queryLimit.page.offset = 0;
            self.queryLimit.page.limit = 10;
            initRedisTaskTable();
        }else{
            self.queryLimit.redisName = "";
            initRedisTaskTable();
        }
    };

    self.$watch(function(){
        return self.globalSearchTerm;
    },function(searchTerm){
        if(searchTerm == ""){
            self.queryLimit.redisName = "";
            initRedisTaskTable();
        }
    });

    self.changePage = function(obj){
        self.queryLimit.page.offset = obj.offset/obj.limit;
        self.queryLimit.page.limit = obj.limit;
        self.globalSearchTerm = "";
        initRedisTaskTable({
            "offset":obj.offset/obj.limit,
            "limit":obj.limit
        });
    };

    self.timeSelectTab = function(step){
        self.queryLimit.timeStep = step;
        var time_start = "",tiem_end = "";
        self.queryLimit.page.offset = 0;
        self.queryLimit.page.limit = 10;
        self.globalSearchTerm = "";
        if(step =="today"){
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
        initRedisTaskTable();
    };

    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        sessionStorage.setItem("RegionSession",regionId);
        self.queryLimit = initQueryLimit();
        self.checkLimit = {};
        self.globalSearchTerm = "";
        self.showLimit = false;
        initRedisTaskTable();
    };

}]);
