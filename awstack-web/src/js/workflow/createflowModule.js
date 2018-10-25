angular.module("createflowModule", [])
    .controller("createflowCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal","alertSrv","$translate","$routeParams","$location","$sce",function(scope, rootScope, NgTableParams, $uibModal, alertSrv, $translate,$routeParams,$location,$sce) {
        var self = scope;
        if($routeParams.modelId){
            var createFlow = "/flow?modelId="+$routeParams.modelId;
            self.createFlow = $sce.trustAsResourceUrl(createFlow);
        }else{
            $location.path("/workflow/flowtask").replace();
        }
    }]);

