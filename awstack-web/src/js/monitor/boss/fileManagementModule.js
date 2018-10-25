import "./fileManagementSrv";

var fileManagementModule = angular.module("fileManagementModule", ["ngTable", "ngAnimate", "ui.bootstrap", "overviewSrvModule", "ngSanitize","operatelogSrv", "fileManagementSrv"]);
fileManagementModule.controller("fileManagementCtrl", function($scope, $rootScope, NgTableParams, overviewSrv, $translate,operatelogSrv,$uibModal,checkedSrv, fileManagementSrv) {

    self=$scope;
    self.datas = [];
    var initMonitor = function(){
        fileManagementSrv.getMonitor().then(function(result){
			//var aaa = {};
            angular.forEach(result.data, function(v){
                v.enabled = "";
                v.dataValue = JSON.parse(v.dataValue);
                self.datas.push(v);
            });
        });
    };
    initMonitor();

});
