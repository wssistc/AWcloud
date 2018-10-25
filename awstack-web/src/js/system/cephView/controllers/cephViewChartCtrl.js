 import "../services/cephViewSrv"
 cephViewChartCtrl.$inject = ["$rootScope", "$scope", "NgTableParams","$uibModal","checkedSrv",
 "cephViewSrv","$filter","alertSrv","$translate"];
 function cephViewChartCtrl($rootScope, $scope,NgTableParams,$uibModal,checkedSrv,cephViewSrv,$filter,alert,$translate){
    var self = $scope;
    self.view.osd_btn = true;
    self.chart = {};
    self.translate = {
        "all":$translate.instant("aws.common.all"),
        "up": $translate.instant("aws.cephView.chart.status.up"),
        "down": $translate.instant("aws.cephView.chart.status.down"),
        "out":$translate.instant("aws.cephView.chart.status.out"),
        "miss":$translate.instant("aws.cephView.chart.status.miss"),
    }



    self.chart.searchList = [
        {name:self.translate.all,key:""},
        {name:"HDD",value:"1",key:"type"},
        {name:"SSD",value:"0",key:"type"},
        {name:self.translate.up,value:"up",key:"osdStatus"},
        {name:self.translate.down,value:"down",key:"osdStatus"},
        {name:self.translate.out,value:"out",key:"osdStatus"},
        {name:self.translate.miss,value:"miss",key:"osdStatus"}
    ]
    self.view.getCephList();
    self.chartGlobalSearch = function(){
        var globalSearchTerm = self.globalSearchTerm;
        var searchItem = self.chart.searchItem;
        var data = angular.copy(self.view.originCephlist);
       
        if(globalSearchTerm){
            data = data.filter(item => {
                return (item.nodeName+"\b"+item.adress).indexOf(globalSearchTerm)>-1
            })
        }
        if(searchItem && searchItem.key){
            data.map(node => {
                var  stayData = node.diskInfos.filter(item => item[searchItem.key] == searchItem.value); 
                stayData = $filter("orderBy")(stayData, "type",false);
                node.diskInfos = [...stayData];
                return node;
            })
        }
        self.view.cephlist = data;

    }
    self.rebootBtn = function(item){
        (item.osdStatus == "down" || item.osdStatus == "out")?self.view.osd_btn = false:self.view.osd_btn = true;
        self.chart.osdData = item;
    }
    self.rebootOsdFunc = function(){
        self.rebootOSD(self.chart.osdData )
    }
    $scope.$on('osdSrvCallback', function(e,data){
        self.view.cephlist.map(node => {
            if(node.nodeName == data.nodeName){
                node.diskInfos.map(item => {
                    if(data.byId == item.byId){
                        item.osdStatus = "rebooting"
                        return item;
                    }
                })
            }
        })
        self.view.osd_btn = true;
    });
    self.$on("restartOSDSuccess",function(e,data){
        alert.set("", $translate.instant("aws.cephView.rebootSuccess"), "success", 5000);
        self.view.getCephList();
    })
    self.$on("restartOSDFalied",function(e,data){
        alert.set("", $translate.instant("aws.cephView.rebootFail"), "error", 5000);
    })
    self.$on("startTasking",function(e,data){
        alert.set("", $translate.instant("aws.cephView.task.jobStatus.EXECUTING"), "success", 5000);
    })
    self.$on("startTaskSuccess",function(e,data){
        alert.set("",  $translate.instant("aws.cephView.task.jobStatus.FINISHED"), "success", 5000);
        self.view.getCephList();
    })

    self.$on("startTaskFailed",function(e,data){
        alert.set("",  $translate.instant("aws.cephView.task.jobStatus.FAILED"), "error", 5000);
        self.view.getCephList();
    })

 }

 export {cephViewChartCtrl}