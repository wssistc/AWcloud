import "./strategySrv";

var strategyModule = angular.module("strategyModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ngSanitize", "strategySrv"]);
strategyModule.controller("strategyCtrl", function($scope, $rootScope, NgTableParams, $translate, strategySrv, $uibModal, checkedSrv) {

    var self = $scope;
    self.isDisabled = true;
    self.delisDisabled = true;

    function getStrategy() {
        strategySrv.getMonitor().then(function(data) {
            var strategy_data = _.map(data.data, function(item) {
                //处理返回的数据
                item.dataValue = angular.fromJson(item.dataValue);
                return item;
            });
            successFunc(strategy_data);
        });
    }
    getStrategy();

    function successFunc(data) {
        self.tableParams = new NgTableParams({ count: 10 }, { counts: [], dataset: data });
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
    }

    // 新建策略弹出层model
    self.openStrategyModel = function(type, editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "strategyModel.html",
            controller: "strategyModelCtrl",
            resolve: {
                type: function() {
                    return type;
                },
                refreshStrategyTable: function() {
                    return getStrategy;
                },
                editData: function() {
                    return editData;
                }
            }
        });
    };

    // 编辑策略弹出层model
    self.editStrategyModel = function(type, editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "strategyUpdateModel.html",
            controller: "strategyModelCtrl",
            resolve: {
                type: function() {
                    return type;
                },
                refreshStrategyTable: function() {
                    return getStrategy;
                },
                editData: function() {
                    return editData;
                }
            }
        });
    };

    self.del = function(checkedItems) {
        var content = {
            target: "delStrategy",
            msg: "<span>" + "是否删除选中策略" + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };

    // self.$on("delStrategy", function(e, data) {
    //     var delGroup = [];
    //     var postData = { ids: delGroup };
    //     _.forEach(data, function(group) {
    //         delGroup.push(group.dataName);
    //     });
    //     console.log(delGroup)
    //     strategySrv.delStrategy(postData).then(function(results) {
    //         getStrategy();
    //     });
    // });
    self.$on("delStrategy", function(e, data) {
        _.forEach(data, function(group) {
            strategySrv.delStrategy(group.dataName);
            getStrategy();
        });
        getStrategy();
    });
});

//新建以及编辑策略controller
strategyModule.controller("strategyModelCtrl", function($scope, editData, type, strategySrv, refreshStrategyTable, $uibModalInstance, $translate, $rootScope) {
    var self = $scope;
    var init_createData = function() {
        return {
            "dataName": "",
            "dataValue": ""
        };
    };

    self.strategyForm = init_createData();

    strategySrv.getAllMonitor().then(function(res) {
        self.strategyLists = {
            options: res.data,
            selected: res.data[0]
        };
        self.strategyForm.selectStrategyList = self.strategyLists.selected;
    });

    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };

    switch (type) {
    case "new":
        self.strategyForm = init_createData();
        break;
    case "edit":
        self.strategyForm = editData;
        break;
    }

    $scope.strategyConfirm = function() {
        if (self.createStrategyForm.$valid) {

            // var postStrategyParams = {
            //     "dataName": self.strategyForm.selectStrategyList.dataName,
            //     "dataValue": {
            //         "watchedItem": self.strategyForm.selectStrategyList.dataValue,
            //         "cycle": self.strategyForm.cycle
            //     }
            // };

            var postValue = angular.toJson({
                "watchedItem": self.strategyForm.selectStrategyList.dataValue,
                "cycle": self.strategyForm.cycle
            });
            var postStrategyParams = {
                "dataName": self.strategyForm.selectStrategyList.dataName,
                "dataValue": postValue
            };
            var newStrategy = strategySrv.createMonitor(postStrategyParams).then(function(res) {
                return res;
            }).then(function() {
                refreshStrategyTable();
            });
            if (type == "new") {
                strategySrv.getMonitor().then(function(data) {
                    _.forEach(data.data, function(group) {
                        if (self.strategyForm.selectStrategyList.dataName === group.dataName) {
                            $rootScope.$broadcast("alert-error", "03017101");
                            self.addStrategy = true;
                        }
                    });
                    if (!self.addStrategy) {
                        newStrategy;
                    }
                });
            } else {
                // console.log(editData.dataValue.cycle);
                // postStrategyParams.dataName = editData.dataName;
                // postStrategyParams.dataValue = editData.dataValue.cycle;
                var editValue = angular.toJson({
                    "watchedItem": editData.dataValue.watchedItem,
                    "cycle": editData.dataValue.cycle

                });
                var editStrategyParams = {
                    "id": editData.id,
                    "dataValue": editValue,
                    "enterpriseUid": localStorage.enterpriseUid
                };
                strategySrv.updataMonitor(editData.dataName, editStrategyParams).then(function() {
                    refreshStrategyTable();
                });

            }
            $uibModalInstance.close();
        } else {
            self.submitted = true;
        }
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };
});
