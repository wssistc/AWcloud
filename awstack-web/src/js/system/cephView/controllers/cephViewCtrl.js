 import "../services/cephViewSrv"

 cephViewCtrl.$inject = ["$rootScope", "$scope", "NgTableParams","$uibModal","checkedSrv","cephViewSrv","$filter","$routeParams","$translate"];
 cephTaskCtrl.$inject = ["$rootScope", "$scope","$filter","$translate","NgTableParams","cephViewSrv","newCheckedSrv","$uibModal","alertSrv"];
 balanceDataCtrl.$inject = ["$rootScope", "$scope","cephViewSrv","$uibModalInstance"];
 let istable = false;
 function cephViewCtrl($rootScope, $scope,NgTableParams,$uibModal,checkedSrv,cephViewSrv,$filter,$routeParams,$translate){
    var self = $scope;
    self.translate = {
        "all":$translate.instant("aws.common.all"),
        "up": $translate.instant("aws.cephView.chart.status.up"),
        "down": $translate.instant("aws.cephView.chart.status.down"),
        "out":$translate.instant("aws.cephView.chart.status.out"),
        "miss":$translate.instant("aws.cephView.chart.status.miss"),
        "osdName":$translate.instant("aws.cephView.osdName"),
        "name":$translate.instant("aws.cephView.name"),
        "osdStatusCopy":$translate.instant("aws.cephView.osdStatusCopy"),
        "typeCopy":$translate.instant("aws.cephView.typeCopy"),
        "total":$translate.instant("aws.cephView.total"),
        "nodeName":$translate.instant("aws.cephView.nodeName"),
        "percent":$translate.instant("aws.cephView.percent"),
        "reweight":$translate.instant("aws.cephView.reweight"),
        "checkTime":$translate.instant("aws.cephView.checkTime"),
    }
    if(!self.services.ceph) self.disabled_btn = true ;
    self.cephViewTemp = "js/system/cephView/tmpl/cephViewTable.html";
    self.menuGuide = [$translate.instant('aws.menu.System'),$translate.instant('aws.menu.System_Operation'),$translate.instant('aws.menu.System_Storage')];
    self.view = {};
    self.view.isView = true,
    self.view.isViewInfo = false;
    $scope.$watch(function() {
        return $routeParams.nodeName;
    },function(value){
        if(value){
            self.view.isView = false,
            self.view.isViewInfo = true;
        }
    })
    self.view.getCephList = function(callbackFunc){
        if(!self.services.ceph) return ;
        self.view.osd_btn = true;
        cephViewSrv.getCephList().then(function(result){
            if(result && result.data){
                result.data.map(node => {
                    var  unUsedData = node.diskInfos.filter(item => item.attribute =="available"); //chart列表不显示未使用的盘
                    var usedData = node.diskInfos.filter(item => item.attribute!="available")
                    //unUsedData = $filter("orderBy")(unUsedData, "type",false);
                    usedData = $filter("orderBy")(usedData, "type",false);
                    node.diskInfos = [...usedData]
                    node.diskInfos.map(item =>{
                        item.nodeName = node.nodeName;
                        item.byId = item.byId + node.nodeName;
                        item.total=parseInt(item.size/(1024*1024*1024));
                        item.inUsed = parseInt(item.used/(1024*1024*1024));
                        item.percent = ((item.used/item.size)*100).toFixed(2)+"%"
                    })
                })
                self.view.cephlist =result.data; 
                self.view.originCephlist=angular.copy(result.data);
                callbackFunc?callbackFunc(result.data):""
            }
        })
    }
    self.view.getCephViewTable = function(){
        self.view.istable = true;
        istable = true;
        self.view.cephViewTemp = "js/system/cephView/tmpl/cephViewTable.html";
    }
    self.view.getCephViewChart = function(){
        self.view.istable = false;
        istable = false;
        self.view.cephViewTemp = "js/system/cephView/tmpl/cephViewChart.html";
    }
    //重启OSD
    self.rebootOSD = function(data){
        if(self.view.osd_btn){
            return;
        }
        var content = {
            target: "rebootOSD",
            msg: $translate.instant("aws.cephView.tips.tip15"),
            data:data
        };
        self.$emit("delete", content);
    }

    self.$on("rebootOSD", function(e,data) {
        cephViewSrv.rebootOSD(data).then(function() {
            $scope.$broadcast('osdSrvCallback', data);
        });
    });
    self.cephTask = function(){
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/system/cephView/tmpl/cephTask.html",
            controller: "cephTaskCtrl",
        });
        return uibModalInstance.result.then(function(post){
            
        });
    }
    //平衡数据
    self.balanceData = function(){
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/system/cephView/tmpl/balanceData.html",
            controller: "balanceDataCtrl",
        });
        return uibModalInstance.result.then(function(post){
            
        });
    }
    istable?self.view.getCephViewTable():self.view.getCephViewChart()

 }

 function cephTaskCtrl($rootScope, $scope,$filter,$translate,NgTableParams,cephViewSrv,newCheckedSrv,$uibModal,alert){
    var self = $scope;
    self.table = {};
    self.translate = {
        jobTypes : $translate.instant("aws.cephView.task.jobTypes"),
        jobStatuss: $translate.instant("aws.cephView.task.jobStatuss"),
        diskName : $translate.instant("aws.cephView.volumeName"),
        nodeName: $translate.instant("aws.cephView.task.nodeName"),
        nodeIp: $translate.instant("aws.cephView.task.nodeIp"),
        startTime: $translate.instant("aws.cephView.task.startTime"),
        createTime:$translate.instant("aws.cephView.task.createTime"),
        all:$translate.instant("aws.cephView.task.jobStatus.all"),
        NORMAL:$translate.instant("aws.cephView.task.jobStatus.NORMAL"),
        EXECUTING:$translate.instant("aws.cephView.task.jobStatus.EXECUTING"),
        FINISHED:$translate.instant("aws.cephView.task.jobStatus.FINISHED"),
        FAILED:$translate.instant("aws.cephView.task.jobStatus.FAILED"),
    };
    self.tableCols = [
        { field: "check", title: "",headerTemplateURL:"headerCheckboxCephTaskTable.html",show: true },
        { field: "jobTypeCopy", title: self.translate.jobTypes,sortable: "jobType",show: true,disable:true},
        { field: "jobStatusCopy", title: self.translate.jobStatuss,sortable: "jobStatus",show: true,disable:true},
        { field: "diskName", title: self.translate.diskName,sortable: "diskName",show: true,disable:false},
        { field: "nodeName", title: self.translate.nodeName,sortable: "nodeName",show: true,disable:false },
        { field: "nodeIp", title: self.translate.nodeIp,sortable: "nodeIp",show: true,disable:false },
        { field: "startTime", title: self.translate.startTime,sortable: "startTime",show: true,disable:false },
        { field: "createTime", title: self.translate.createTime,sortable: "createTime",show: true,disable:false },
    ];
    self.table.searchList = [
        {name:self.translate.all,key:""},
        {name:self.translate.NORMAL,value:"NORMAL",key:"jobStatus"},
        {name:self.translate.EXECUTING,value:"EXECUTING",key:"jobStatus"},
        {name:self.translate.FINISHED,value:"FINISHED",key:"jobStatus"},
        {name:self.translate.FAILED,value:"FAILED",key:"jobStatus"},
    ]

    self.tableGlobalSearch = function(){
        var searchItem = self.table.searchItem;
        self.cephTaskTable.filter({[searchItem.key] :searchItem.value})
    }

    self.getCephTasks = function(){
        cephViewSrv.getCephTasks().then(function(result){
            if (result && result.data){
                TaskCallbackFunc(result.data)
            }
        })
        
    }

    self.delTask = function(data){
        if(self.del_btn){
            return;
        }
        var scope = $rootScope.$new();
        var modal_os_delete= $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "os-delete.html",
            scope: scope
        });
        scope.doubleClick = false;
        scope.confirmDel = function(){
            var postData ={
                ids:[]
            };
            data.map(item => {
                postData.ids.push(item.id)
            })
            cephViewSrv.delTasks(postData).then(function() {
                modal_os_delete.close();
                self.getCephTasks();
            });
            scope.doubleClick = true;
        }
    }

    self.$on("startTasking",function(e,data){
        alert.set("", self.translate.EXECUTING, "success", 5000);
        self.getCephTasks();
    })
    self.$on("startTaskSuccess",function(e,data){
        alert.set("", self.translate.FINISHED, "success", 5000);
        self.getCephTasks();
    })

    self.$on("startTaskFailed",function(e,data){
        alert.set("", self.translate.FAILED, "error", 5000);
        self.getCephTasks()
    })

    self.$watch(function(){
        return self.checkedItemscephTaskTable;
    },function(values){
        self.del_btn = true;
        var FAILEDChk=0,FINISHEDChk=0,NORMALChk=0;
        if(values && values.length){
            values.map(item => {
                FAILEDChk += (item.jobStatus === "FAILED" || item.jobStatus === "ABNORMAL") || 0;
                FINISHEDChk += (item.jobStatus === "FINISHED") || 0;
                NORMALChk += (item.jobStatus === "NORMAL") || 0;
            })
            if(FAILEDChk + FINISHEDChk + NORMALChk == values.length){
                self.del_btn = false;
            }
            
        }
        
    })

    function TaskCallbackFunc(data){
        data.map(item => {
            item.jobTypeCopy = $translate.instant("aws.cephView.task.jobType." + item.jobType );
            item.jobStatusCopy = $translate.instant("aws.cephView.task.jobStatus." + item.jobStatus );
            item.startTime = $filter("date")(item.startTime, "yyyy-MM-dd HH:mm:ss")
            item.createTime = $filter("date")(item.createTime, "yyyy-MM-dd HH:mm:ss");
            return item;
        })
        self.cephTaskTable = new NgTableParams({
            count: 10
        }, {
            counts: [],
            dataset: data
        });
        newCheckedSrv.checkDo(self,"","id","cephTaskTable");
    }
    self.getCephTasks()
    
 }

 function balanceDataCtrl($rootScope, $scope,cephViewSrv,$uibModalInstance){
    var self = $scope;
    self.balance = {
        execute:"timing",
        maxBackfills:2
    }
    self.submitInValid = false;
    self.doubleClick = false;
    self.hasTask = false;
    self.getTask = false;
    cephViewSrv.getCephTasks().then(function(result){
        if (result && result.data){
            self.getTask = true;
            result.data.map(item=>{
                if(item.jobStatus == "EXECUTING" || item.jobStatus=="NORMAL" ){
                    self.hasTask = true;
                }
            })
        }
    })
    self.balanceConfirm = function(field){
        if(field.$valid){
            var post ={
                "jobType": 0,
                "regionKey": localStorage.regionKey,
                "maxBackfills": Number(self.balance.maxBackfills),
            }
            self.showClusterStatusTip = false;
            self.balance.execute == "timing"?post.startTime = self.balance.startTime:"";
            switch(self.balance.execute){
                case "timing":
                    self.doubleClick = true;
                    $uibModalInstance.close();
                    cephViewSrv.balanceData(post).then(function(){})
                    break;
                case "immediately":
                    cephViewSrv.getPGstatus().then(function(res){
                        if(res && res.data){
                            self.doubleClick = true;
                            $uibModalInstance.close();
                            cephViewSrv.balanceData(post).then(function(){})
                        }else{
                            self.showClusterStatusTip = true;
                        }
                    })
                break;
            }
            
        }else{
            self.submitInValid = true;;
        }

    }

 }

 export {cephViewCtrl,cephTaskCtrl,balanceDataCtrl}