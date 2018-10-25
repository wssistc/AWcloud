import "./bandwidthSrv";

var bandwidthModule = angular.module("bandwidthModule", ["ngSanitize", "ngTable", "ngAnimate", "ui.bootstrap", "bandwidthSrvModule", "ui.select"]);

bandwidthModule.controller("bandwidthCtrl", function($scope, NgTableParams, bandwidthSrv, checkedSrv, $uibModal, $translate,GLOBAL_CONFIG) {
    var self = $scope;
    self.headers = {
        "portId": $translate.instant("aws.bandwidths.portId"),
        "projectName": $translate.instant("aws.bandwidths.projectName"),
        "tenantName": $translate.instant("aws.bandwidths.projectName"),
        "ipAddr": $translate.instant("aws.bandwidths.ipAddr"),
        "bandwidth": $translate.instant("aws.bandwidths.bandwidth"),
        "phyNetWork": $translate.instant("aws.bandwidths.phyNetWork"),
        "device": $translate.instant("aws.bandwidths.device")
    };
    //带宽数据列表初始化
    var initBandwidthTable = function() {
        bandwidthSrv.getBandwidthTableData().then(function(result) {
            result?self.loadData = true:"";
            if(result&& result.data){
                bandwidthSrv.bandwidthTableAllData = result.data;
                self.init_data();
            }
            
        });
    };
    initBandwidthTable();

    self.init_data = function() {
        self.$watch(function() {
            return bandwidthSrv.bandwidthTableAllData;
        }, function(value) {
            var bandwidth_data = _.map(value, function(item) {
                //处理返回的数据
                return item;
            });
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: bandwidth_data });
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableParams.filter({ $: term });
            };
            var tableId = "portId";
            checkedSrv.checkDo(self, bandwidth_data, tableId);
        }, true);
    };
    //修改带宽
    self.openEditBandwidthModel = function(editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "editBandwidthModal.html",
            controller: "editBandwidthModalCtrl",
            resolve: {
                editData: function() {
                    return editData;
                },
                refreshBandwidthTable: function() {
                    return initBandwidthTable;
                }
            }
        });
    };
    //刷新带宽列表
    self.refreshBandwidth = function() {
        initBandwidthTable();
    };
});

//修改带宽modal业务逻辑
bandwidthModule.controller("editBandwidthModalCtrl", function($scope, bandwidthSrv, editData, refreshBandwidthTable, $uibModalInstance) {
    var self = $scope;
    self.bandwidthForm = {
        bandwidth: editData.bandWidth
    };

    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };

    self.invalid_num = false;
    self.$watch(function() {
        return self.bandwidthForm.bandwidth;
    }, function(value) {
        if (value > 1000) {
            self.invalid_num = true;
        } else {
            self.invalid_num = false;
        }
    });

    self.bandwidthConfirm = function() {
        if (self.editBandwidthForm.$valid) {
            var params = {
                id:editData.id,
                data:{
                    limit: self.bandwidthForm.bandwidth,
                    policy_id: editData. policy_id
                }
            };
            bandwidthSrv.editbandwidthAction(params).then(function(res) {
                return res;
            }).then(function() {
                refreshBandwidthTable();
            });
            $uibModalInstance.close();
        } else {
            self.submitted = true;
        }
    };
});
