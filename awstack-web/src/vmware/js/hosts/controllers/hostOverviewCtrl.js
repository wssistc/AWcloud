import * as hostSrv from "../services/"

export function hostOverviewCtrl($scope,$rootScope,$location,hostSrv){
    var self = $scope;

	console.log("------>主机详情概况页controller")
	
}

hostOverviewCtrl.$inject = ["$scope","$rootScope","$location","hostSrv"];