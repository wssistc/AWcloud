/**
 * Created by Weike on 2016/6/16.
 */
import "./hypervisorsSrv";

angular.module("hypervisorsModule", ["ngSanitize", "ngTable", "ngAnimate", "ngMessages", "ui.bootstrap", "ui.select", "hypervisorsSrvModule"])
    .controller("HypervisorsCtrl", function ($scope, $rootScope, $uibModal, NgTableParams, checkedSrv, hypervisorsSrv,GLOBAL_CONFIG) {

        var initHypervisorsTable = function () {
            hypervisorsSrv.getHypervisors()
                .then(function (result) {
                result?$scope.loadData = true:"";
                if(result && result.data){
                    var hypervisorsData = _.map(result.data, function (item) {
                        item.hypervisorHostname = item.hypervisorHostname.split(".")[0];
                        return item;
                    });
                    $scope.tableParams = new NgTableParams(
                        {count: GLOBAL_CONFIG.PAGESIZE}, {counts: [], dataset: hypervisorsData}
                    );
                    
                    checkedSrv.checkDo($scope, hypervisorsData, "id");
                }
                
            });
        };
        initHypervisorsTable();

        $scope.refreshHypervisors = function () {
            initHypervisorsTable();
        };

        $scope.applyGlobalSearch = function() {
            var term = $scope.globalSearchTerm;
            $scope.tableParams.filter({ $: term });
        };
    });
