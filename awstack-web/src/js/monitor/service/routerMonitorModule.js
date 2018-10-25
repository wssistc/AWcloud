import "./routerMonitorSrv";

var routerMonitorModule = angular.module("routerMonitorModule", ["ngTable","ngAnimate", "ui.bootstrap","ngSanitize","routerMonitorSrv"]);
routerMonitorModule.controller("routerMonitorCtrl",["$scope", "$rootScope","NgTableParams","$translate","routerMonitorSrv" ,
    function($scope, $rootScope,NgTableParams,$translate,routerMonitorSrv) {
    var self = $scope;
    routerMonitorSrv.getDatas().then(function(res){
        if(res && res.data){
            
        }
    })

}]);
