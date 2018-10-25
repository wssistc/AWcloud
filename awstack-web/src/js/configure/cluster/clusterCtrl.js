import "./clusterSrv";
var clusterModule = angular.module("clusterModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "clusterSrv"]);
clusterModule.controller("clusterCtrl", function($scope, $rootScope, NgTableParams, $location, $uibModal, $translate, clusterSrv, checkedSrv, GLOBAL_CONFIG) {
    var self = $scope;
    self.headers = {
        "name": $translate.instant("aws.cluster.name"),
        "regionKey": $translate.instant("aws.cluster.regionKey"),
        "description": $translate.instant("aws.cluster.description"),
        "config": $translate.instant("aws.cluster.config"),
        "lastTime": $translate.instant("aws.cluster.lastTime"),
        "status":$translate.instant("aws.volumes.status")
    };
    self.canDel = false;
    self.canDeploy = false;
    var isCanDel = function(checkedItems) {
        if (checkedItems.length === 1) {
            self.canDel = true;
        } else {
            self.canDel = false;
        }
    };
    function successFunc(data) {
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({ $: term });
        };
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
            isCanDel(self.checkedItems);
            if(value.length==1){
                self.canDeploy = true;
            }else{
                self.canDeploy = false;
            }
        });
    }

    function initRegionTable() {
        clusterSrv.getClusterTableData().then(function(result) {
            if (result && result.data) {
                successFunc(result.data);
            }
        });
    }
    initRegionTable();
    $rootScope.$on("getDetail", function(event, value) {
        clusterSrv.getClusterTableData().then(function(result) {
            if (result && result.data) {
                _.forEach(result.data, function(item) {
                    if (item.id == value) {
                        $scope.detailData = item.regionConfigScriptMap;
                    }
                });
            }

            if ($scope.detailData != null) {
                $scope.isShow = true;
                var length = $scope.detailData.registered_hosts.length;
                var new_registered_hosts = "";
                for (var i = 0; i < length; i++) {
                    if (i != length - 1) {
                        new_registered_hosts = new_registered_hosts + $scope.detailData.registered_hosts[i] + ",";
                    }
                    if (i == length - 1) {
                        new_registered_hosts = new_registered_hosts + $scope.detailData.registered_hosts[i];
                    }
                }
                $scope.detailData.new_registered_hosts = new_registered_hosts;
                $scope.detailData.new_tenant_vlan_range = $scope.detailData.tenant_vlan_range.start + "~" + $scope.detailData.tenant_vlan_range.end;
                $scope.user_list = $scope.detailData.user_list;
            } else {
                $scope.isShow = false;
            }

        });
    });

    self.createRegion = function() {
        var scope = self.$new();
        var regionModal = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "createRegion.html",
            scope: scope
        });
        scope.postParams = {};
        scope.submitted = false;
        scope.interacted = function(field) {
            scope.field_form = field;
            return scope.submitted || field.name.$dirty || field.description.$dirty;
        };
        scope.confirm = function() {
            if (scope.field_form.$valid) {
                clusterSrv.createRegion(scope.postParams).then(function() {
                    initRegionTable();
                    regionModal.close();
                });
            } else {
                scope.submitted = true;
                scope.createRegion.$dirty = true;
            }
        };
    };

    self.del = function(checkedItems) {
        clusterSrv.getNode(checkedItems[0].regionUid).then(function(result) {
            if (result && result.data && result.data.length) {
                self.nodes = result.data;
                self.errorMessage = $translate.instant("aws.cluster.confirmDelNode");
            } else {
                self.errorMessage = $translate.instant("aws.cluster.confirmDel");
            }
            var content = {
                target: "delCluster",
                msg: "<span>" + self.errorMessage + "</span>",
                data: checkedItems
            };
            self.$emit("delete", content);
        });
    };
    self.$on("delCluster", function(e, data) {
        clusterSrv.delRegion(data[0].regionUid).then(function() {
            initRegionTable();
        });
    });
    self.deployRegion = function(editData){
        sessionStorage.setItem('curRegionEnterpriseUid',editData.enterpriseUid);
        sessionStorage.setItem('curRegionKey',editData.regionKey);
        sessionStorage.setItem('curRegionStatus',editData.status);
        sessionStorage.setItem('curRegionName',editData.regionName);
        sessionStorage.setItem('curRegionUid',editData.regionUid);
        localStorage.curRegionHOSTNAMELIST = '';
        localStorage.componentEnableCeph = editData.regionConfigScriptMap?editData.regionConfigScriptMap.enable_ceph:"";
        $location.url("/configure/cluster/stepone");

    }
});
