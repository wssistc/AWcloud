 import "../services/cephViewSrv"

 cephViewTableCtrl.$inject = ["$rootScope", "$scope", "NgTableParams","$uibModal","newCheckedSrv","cephViewSrv",
 "$translate","$filter","alertSrv"];
 addDiskCtrl.$inject = ["$rootScope", "$scope","cephViewSrv","initTable","$uibModalInstance"];
 weightSetCtrl.$inject = ["$rootScope", "$scope","cephViewSrv"];
 function cephViewTableCtrl($rootScope, $scope,NgTableParams,$uibModal,newCheckedSrv,cephViewSrv,$translate,$filter,alert){
    var self = $scope;
    var key;
    var sData=[];
    var allData;
    self.context = self;
    self.titleName="cephView";
    self.table = {};
    self.table.searchList = [
        {name:self.translate.all,key:""},
        {name:self.translate.up,value:"up",key:"osdStatus"},
        {name:self.translate.down,value:"down",key:"osdStatus"},
        {name:self.translate.out,value:"out",key:"osdStatus"},
    ]
    if(sessionStorage["cephView"]){
       self.tableCols=JSON.parse(sessionStorage["cephView"]);
    }else{
        self.tableCols = [
            { field: "check", title: "",headerTemplateURL:"headerCheckboxCephViewTable.html",show: true },
            { field: "osdName", title: self.translate.osdName,sortable: "osdName",show: true,disable:true},
            { field: "name", title: self.translate.name,sortable: "name",show: true,disable:false},
            { field: "osdStatusCopy", title: self.translate.osdStatusCopy,sortable: "osdStatus",show: true,disable:true },
            { field: "typeCopy", title: self.translate.typeCopy,sortable: "type",show: true,disable:false },
            { field: "total", title: self.translate.total,sortable: "total",show: true,disable:false },
            { field: "nodeName", title: self.translate.nodeName,sortable: "nodeName",show: true,disable:false },
            { field: "percent", title: self.translate.percent,sortable: "percent",show: true,disable:false },
            { field: "reweight", title: self.translate.reweight,sortable: "reweight",show: true,disable:false},
            { field: "checkTime", title: self.translate.checkTime,sortable: "checkTime",show: true,disable:false },
        ];
    }

    self.configSearch = function(tableData){
        var tableData = tableData || self.cephViewtabledata;
        tableData.map(item => {
            item.osdStatusCopy = $translate.instant("aws.cephView.chart.status." + item.osdStatus);
            item.typeCopy = $translate.instant("aws.cephView.chart.diskType." + item.type );
            item.checkTime = $filter("date")(item.checkTime, "yyyy-MM-dd HH:mm:ss")
            editSearch(item)
        })
        return tableData;
    }

    self.refreshTable = function(){
        self.view.getCephList(initTable)
    }

    self.view.getCephList(initTable)

    function editSearch(item){
        var searchTerm = []
        self.tableCols.map(search => {
            if(search.title && search.show){
                searchTerm.push(item[search.field])
            }
        })
        item.searchTerm =searchTerm.join("\b") ;
		return item;
    }
    
    function initTable(res){
		if(res && angular.isArray(res)){
            var tableData = [];
            res.map(item =>{
                item.diskInfos.map(val => {
                    val.nodeName = item.nodeName;
                    val.checkTime = item.checkTime;
                    val.adress = item.adress;                    
                })
                tableData.push(...item.diskInfos)
            }) 
            self.cephViewtabledata = self.configSearch(tableData);
            self.originTabledata = angular.copy(self.cephViewtabledata)
			self.cephViewTable = new NgTableParams({ count: 10 }, { counts: [], dataset: self.cephViewtabledata });
			newCheckedSrv.checkDo(self,"","byId","cephViewTable");
		}
    };
    
    self.$watch(function(){
        return self.checkedItemscephViewTable;
    },function(values){
        self.view.osd_btn = true;
        if(values && values.length){
            if(values.length == 1){
                if(values[0].osdStatus == "down" || values[0].osdStatus == "out"){
                    self.view.osd_btn = false;
                }
            }
        }
        
    })
    $scope.$on('osdSrvCallback', function(e,data){
        self.cephViewTable.data.map(item => {
            if(data.byId == item.byId){
                item.osdStatus = "rebooting"
                return item;
            }
        })
        self.checkboxescephViewTable.items = {};
    });

    self.$on("restartOSDSuccess",function(e,data){
        alert.set("", $translate.instant("aws.cephView.rebootSuccess"), "success", 5000);
        self.view.getCephList(initTable);
    })
    self.$on("restartOSDFalied",function(e,data){
        alert.set("", $translate.instant("aws.cephView.rebootFail"), "error", 5000);
    })
    self.$on("startTasking",function(e,data){
        alert.set("", $translate.instant("aws.cephView.task.jobStatus.EXECUTING"), "success", 5000);
    })
    self.$on("startTaskSuccess",function(e,data){
        alert.set("",  $translate.instant("aws.cephView.task.jobStatus.FINISHED"), "success", 5000);
        self.view.getCephList(initTable);
    })

    self.$on("startTaskFailed",function(e,data){
        alert.set("",  $translate.instant("aws.cephView.task.jobStatus.FAILED"), "error", 5000);
        self.view.getCephList(initTable);
    })

    //添加硬盘
    self.addDisk = function(){
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/system/cephView/tmpl/addDisk.html",
            controller: "addDiskCtrl",
            resolve: {
                initTable: function() {
                    return self.getTable;
                }
            },
        });
        return uibModalInstance.result.then(function(post){
            
        });
    }

    //设置权重
    self.weightSet = function(){
        var uibModalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/system/cephView/tmpl/weightSet.html",
            controller: "weightSetCtrl",
            resolve: {
                initTable: function() {
                    return self.getTable;
                }
            },
        });
        return uibModalInstance.result.then(function(post){
            
        });
    }

    self.delDisk = function(data){
        // if(self.del_btn){
        //     return;
        // }
        var content = {
            target: "delDisk",
            msg: $translate.instant('aws.cephView.tips.tip16'),
            data:data
        };
        self.$emit("delete", content);
    }

    self.$on("delDisk", function(e,data) {
        var postData = chkSome(data);
        backupsSrv.delBackups(postData).then(function() {
        });
    });

   
 }

 function addDiskCtrl($rootScope, $scope,cephViewSrv,initTable,$uibModalInstance){
    var self = $scope;
    self.add = {
        types:["SSD","HDD"],
        type:"SSD",
        servers:[],
        pools:[],
        diskRole:"cache"
    };
    self.addDiskConfirm = function(){
        $uibModalInstance.close()
    }
 }

 function weightSetCtrl($rootScope, $scope,cephViewSrv){
    var self = $scope;
    
 }
 export {cephViewTableCtrl,addDiskCtrl,weightSetCtrl}