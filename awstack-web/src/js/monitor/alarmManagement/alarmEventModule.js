import "./alarmEventSrv";

var alarmEventModule = angular.module("alarmEventModule", ["ngTable", "ngAnimate", "ui.bootstrap", "alarmEventSrvModule", "ngMessages"]);

alarmEventModule.controller("alarmEventCtrl", ["$scope", "$rootScope", "NgTableParams", "alarmEventSrv", "checkedSrv", "$uibModal", "$translate","GLOBAL_CONFIG","$filter",
function($scope, $rootScope, NgTableParams, alarmEventSrv, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG,$filter) {
    var self = $scope;
    var newAlarms_data = [],oldAlarms_data = [];

    //设置项的初始化
    self.titleName="alarmevent";
    if(sessionStorage["alarmevent"]){
        self.titleData=JSON.parse(sessionStorage["alarmevent"]);
    }else{
        self.titleData=[
            {name:'monitor.alarmModule.hostName',value:true,disable:true,search:'hostname'},
            {name:'monitor.alarmModule.alarmType',value:true,disable:false,search:'_alarmType'},
            {name:'monitor.alarmModule.alarmReason',value:true,disable:false,search:'reason'},
            {name:'monitor.alarmModule.severity',value:true,disable:false,search:'severity'},
            {name:'monitor.alarmModule.handleStatus',value:true,disable:false,search:'status'},
            {name:'monitor.alarmModule.alarmTime',value:true,disable:false,search:'createtime'}/*,
            {name:'monitor.alarmModule.operate',value:true,disable:false},*/
        ];
    }

    //设置项的初始化
     self.oldTitleName="historyAlarmevent";
     if(sessionStorage["historyAlarmevent"]){
         self.oldTitleData=JSON.parse(sessionStorage["historyAlarmevent"]);
     }else{
        self.oldTitleData=[
            {name:'monitor.alarmModule.hostName',value:true,disable:true,search:'hostname'},
            {name:'monitor.alarmModule.alarmType',value:true,disable:false,search:'_alarmType'},
            {name:'monitor.alarmModule.alarmReason',value:true,disable:false,search:'reason'},
            {name:'monitor.alarmModule.alarmTime',value:true,disable:false,search:'createtime'},
            {name:'monitor.alarmModule.severity',value:true,disable:false,search:'severity'},
            {name:'monitor.alarmModule.handleStatus',value:true,disable:false,search:'status'},
            {name:'monitor.alarmModule.handleTime',value:true,disable:false,search:'updateTime'},
            {name:'monitor.alarmModule.handleDescription',value:true,disable:false,search:'proDescription'}
        ];
     }

    // 状态查询
    self.statusList = [
        {name:"全部",status:"all"},
        {name:"阈值",status:"threshold"},
        {name:"健康检查",status:"healthcheck"},
        {name:"高可用",status:"computeha"},
        {name:"计划任务",status:"planwork"},
        {name:"硬件故障",status:"hardware"},
        {name:"ceph健康检查",status:"cephCheck"},
        // {name:"灵雀云告警",status:"AlaudaAlarm"},
        // {name:"云镜告警",status:"SecurityAlarm"},
        // {name:"分布式数据库告警",status:"TDSqlAlarm"},
        // {name:"时序数据库告警",status:"TSDBAlarm"},
    ]
    var paasList=JSON.parse(localStorage.supportPaas);
    var regionBusiAuth=JSON.parse(localStorage.regionBusiAuth);
    //默认部门和默认项目才可以添加pass告警,此时才能看到paas告警
    if(paasList&&angular.isObject(paasList)){
       if(paasList.CTSDB&&paasList.CTSDB.isLinked&&(regionBusiAuth.indexOf("11")>-1)){
          self.statusList.push({name:$translate.instant("aws.monitor.alarmModule.TSDBAlarm"),status:"TSDBAlarm"});
       }
       //云镜
       if(paasList.CloudSecurity&&paasList.CloudSecurity.isLinked&&(regionBusiAuth.indexOf("13")>-1)){
          self.statusList.push({name:$translate.instant("aws.monitor.alarmModule.SecurityAlarm"),status:"SecurityAlarm"});
       }
       //分布式数据库
       if(paasList.TDSQL&&paasList.TDSQL.isLinked&&(regionBusiAuth.indexOf("10")>-1)){
          self.statusList.push({name:$translate.instant("aws.monitor.alarmModule.TDSqlAlarm"),status:"TDSqlAlarm"});
       }
       //灵雀云
       if(paasList.Alauda&&paasList.Alauda.isLinked&&(regionBusiAuth.indexOf("16")>-1)){
          self.statusList.push({name:$translate.instant("aws.monitor.alarmModule.AlaudaAlarm"),status:"AlaudaAlarm"});
       }
       //织云
       if(paasList.COC&&paasList.COC.isLinked&&(regionBusiAuth.indexOf("15")>-1)){
          self.statusList.push({name:$translate.instant("aws.monitor.alarmModule.COCAlarm"),status:"COCAlarm"});
       }
    }

    self.statusFrom={
        name:""
    }

    self.oldStatusFrom={
        name:""
    }

    self.choiceStatus = function(item){
        let newAlarms_data_check = []
        if(item.status=="all"){
            newAlarms_data_check = newAlarms_data
            self.tableParams_new = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: newAlarms_data_check });  
        }
        newAlarms_data.forEach(function(val){
            if(val.alarmType == item.status){
                newAlarms_data_check.push(val)
            }
            self.tableParams_new = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: newAlarms_data_check });  
        })
    }

    self.choiceStatusOld=function(item){
        let oldAlarms_data_check = []
        if(item.status=="all"){
            oldAlarms_data_check = oldAlarms_data
            self.tableParams_new = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: oldAlarms_data_check });  
        }
        oldAlarms_data.forEach(function(val){
            if(val.alarmType == item.status){
                oldAlarms_data_check.push(val)
            }
            self.tableParams_old = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: oldAlarms_data_check });  
        })
    }

    self.newAlarmTab = function(){
        self.globalSearchTerm.item="";
        self.refreshNewAlarm();
    }
    self.oldAlarmTab = function(){
        self.globalSearchTerm.item="";
        self.refreshOldAlarm();
    }
    function formateTableData(item){
        if(item.alarmType == "threshold"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.threshold");
        }else if(item.alarmType == "healthcheck"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.healthcheck");
        }else if(item.alarmType == "computeha"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.computeha");
        }else if(item.alarmType == "planwork"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.planwork");
        }else if(item.alarmType == "hardware"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.hardware");
        }else if(item.alarmType == "TSDBAlarm"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.TSDBAlarm");
        }else if(item.alarmType == "TDSqlAlarm"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.TDSqlAlarm");
        }else if(item.alarmType == "SecurityAlarm"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.SecurityAlarm");
        }else if(item.alarmType == "AlaudaAlarm"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.AlaudaAlarm");
        }else if(item.alarmType == "COCAlarm"){
            item._alarmType = $translate.instant("aws.monitor.alarmModule.COCAlarm");
        }
        
        if(item.status == "unprocessed"){
            item.status = $translate.instant("aws.monitor.alarmModule.unprocessed");
        }else if(item.status == "processed"){
            item.status = $translate.instant("aws.monitor.alarmModule.processed");
        }else{
            item.status = $translate.instant("aws.monitor.alarmModule.ignore");
        }
        if(item.severity == "critical"){
            item.severity_status="critical";
            item.severity = $translate.instant("aws.monitor.alarmModule.critical");
        }else if(item.severity == "moderate"){
            item.severity_status="moderate";
            item.severity = $translate.instant("aws.monitor.alarmModule.moderate");
        }else if(item.severity == "low"){
            item.severity_status="low";
            item.severity = $translate.instant("aws.monitor.alarmModule.low");
        }
        item.updateTime=$filter("date")(item.updateTime, "yyyy-MM-dd HH:mm:ss");
        item.createtime=$filter("date")(item.createtime, "yyyy-MM-dd HH:mm:ss");
        item.reason =item.reason.substring(0,1) == "{"? angular.fromJson(item.reason):{"subject":"告警规则","detail":item.reason};
    }

    function double(num){
        if (num<10){
            return "0"+num;   //如果时分秒少于10，则在前面加字符串0
        }
        else{
        return ""+num;        //否则，直接返回原有数字
        }
    }

    function getTimeStyle(date){
        var oDate = new Date(date),  
        oTime = oDate.getFullYear() +'-'+ double(oDate.getMonth() + 1) +'-'+ double(oDate.getDate()) +' '+ double(oDate.getHours()) +':'+ double(oDate.getMinutes()) +':'+double(oDate.getSeconds());//最后拼接时间  
        return oTime;  
    }

    function alarmEventSearchTerm(obj){
        var tableData = obj.tableData;
        var titleData = obj.titleData;
        tableData.map(function(item){
           item.searchTerm="";
           titleData.forEach(function(showTitle){
                 if(showTitle.value&&item[showTitle.search]){
                    if(showTitle.search=='reason'){
                        item.searchTerm+=(item.reason.subject || item.reason)+"\b";
                    }else{
                        item.searchTerm+=item[showTitle.search]+"\b";
                    }
                 }
           });
        });
    }
    self.alarmEventSearchTerm=alarmEventSearchTerm;
    
    function initNewAlarmTable(){
        alarmEventSrv.getNewAlarm({status:"new"}).then(function(result){
            result?self.loadNewAlarmData = true:"";
            if(result && result.data){
                newAlarms_data = _.map(result.data, function(item) {
                    formateTableData(item);
                    return item;
                });
                self.tableData=newAlarms_data;
                alarmEventSearchTerm({tableData:self.tableData,titleData:self.titleData});
                self.tableParams_new = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: newAlarms_data });  
                checkedSrv.checkDo(self, "", "id", "tableParams_new");
            }
        });
    }
    initNewAlarmTable();

    function initOldAlarmTable(){
        alarmEventSrv.getOldAlarm({status:"old"}).then(function(result){
            result?self.loadOldAlarmData = true:"";
            if(result && result.data){
                oldAlarms_data = _.map(result.data,function(item){
                    formateTableData(item);
                    return item;
                }); 
                self.tableOldData=oldAlarms_data;
                alarmEventSearchTerm({tableData:self.tableOldData,titleData:self.oldTitleData});
                self.tableParams_old = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: oldAlarms_data });
            }
        });
    }
    initOldAlarmTable();

    self.globalSearchTerm = {item:""}
    self.applyGlobalSearch = function (item) {
        var term = self.globalSearchTerm.item;
        if(item=='new'){
            self.tableParams_new.filter({
                searchTerm: term
            });
        }else if(item=='old'){
            self.tableParams_old.filter({ 
                searchTerm: term
            });   
        }
    };

    self.$watch(function(){
        return self.checkedItems;
    },function(value){
        if(!value){
            self.isDisabled = true;
            self.delisDisabled = true;
        }
    });

    self.refreshNewAlarm = function(){
        self.globalSearchTerm.item="";
        self.statusFrom.name = "";
        initNewAlarmTable();
    };

    self.refreshOldAlarm = function(){
        self.globalSearchTerm.item="";
        self.oldStatusFrom.name = "";
        initOldAlarmTable();
    };

    self.handleAlarm = function(selectedItems,type){
        var scope = self.$new();
        var handleAlarmModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"handleAlarm.html",
            scope:scope
        });
        scope.handleAlarmForm = {
            description:""
        };
        scope.alarmDesConfirm = function(formField){
            if(formField.$valid){
                var handleAlarmAPIFunc = function(item){
                    var params =  {
                        id:item.id,
                        data:{
                            "status":"processed",
                            "proDescription":scope.handleAlarmForm.description
                        }
                    };
                    alarmEventSrv.alarmHandelDes(params).success(function(){
                        initNewAlarmTable();
                        initOldAlarmTable();
                    });
                };
                if(type == "more"){
                    _.each(selectedItems,function(item){
                        handleAlarmAPIFunc(item);
                    })
                }else if(type == "one"){
                    handleAlarmAPIFunc(selectedItems);
                }
                handleAlarmModal.close();
            }
        };
    };

    self.ignoreAlarm = function(selectedItems,type){
        var content = {
            target:"ignoreAlarm",
            msg:type == "one"?"<span>"+$translate.instant("aws.monitor.alarmModule.ignoreAlarm")+"</sapn>":"<span>"+$translate.instant("aws.monitor.alarmModule.ignoreAlarms")+"</sapn>",
            data:selectedItems
        };
        self.$emit("delete",content);
    };
    
    self.$on("ignoreAlarm",function(e,data){
        var ignoreAlarmFunc = function(item){
             var params = {
                id:item.id,
                data:{
                    "status":"ignored",
                    "proDescription":"忽略"
                }
            };
            alarmEventSrv.ignoreAlarm(params).success(function(){
                initNewAlarmTable();
                initOldAlarmTable();
            });
        };
        if(data.length >=1){
            _.each(data,function(item){
                ignoreAlarmFunc(item);
            })
        }else{
            ignoreAlarmFunc(data);
        }
       
    });

}]);