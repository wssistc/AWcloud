import './affinitySrv';
angular.module("affinityModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "ui.select", "affinitySrv", "affinitySrv"])
    .controller("affinityCtrl", ["$routeParams", "$scope", "$rootScope", "NgTableParams", "$uibModal", "$translate", "checkedSrv", "GLOBAL_CONFIG", "$filter", "$window", "affinitySrv",
        function ($routeParams, $scope, $rootScope, NgTableParams, $uibModal, $translate, checkedSrv, GLOBAL_CONFIG, $filter, $window, affinitySrv) {
            var self = $scope;
            initAffinityTable();
            self.createAffinity = function () {
                var $modalAffinity = $uibModal.open({
                    animation: self.animationsEnabled,
                    backdrop: 'static',
                    templateUrl: "newAffinity.html",
                    controller:  "createAffinityCtrl",
                    resolve: {
                        initAffinityTable: function() {
                            return initAffinityTable;
                        },
                        checkName:function(){
                            return checkName;
                        },
                        closeModal:function(){
                            return function(){
             
                                $modalAffinity.close()
                            }
                        }
                    }
                });
               

            }
            self.refreshTable = function () {
                initAffinityTable();
            }
            self.deleteAffinity = function () {

                var contents = {
                    target: "deleteAffinityGroups",
                    msg: "<span>是否删除选中内容</span>",
                };
                self.$emit("delete", contents);

            }
            self.$on("deleteAffinityGroups", function () {
               var ids = [];
               var names = [] ;
               self.checkedItems.map(function(item){
                    ids.push(item.id);
                    names.push(item.name)
               })
               affinitySrv.delAffinityGroups(ids,names).then(function (data) {
                    initAffinityTable();
                })
            });
            //检查是否同名
            function checkName(name) {
                var flag = false;
                if (self.tableData) {
                    self.tableData.map(function (item) {
                        if (name === item.name) {
                            flag = true;
                        }
                    })
                } else {
                    flag = false;
                }
                return flag;
            }
            function initAffinityTable() {
                self.globalSearchTerm ="";
                affinitySrv.getAffinityGroupList().then(function (data) {
                        data ? self.loadData = true : "";
                    if (data && data.data) {
                        var tableData = data.data;
                        self.tableData = tableData;
                        tableData.map(function (item) {
                            item.beAffinity = item.policies[0];
                            item.searchTerm = [item.name, $translate.instant("aws.instances." + item.beAffinity)].join("\b");
                        })
                        self.tableParams = new NgTableParams({
                            count: GLOBAL_CONFIG.PAGESIZE
                        }, {
                            counts: [],
                            dataset: tableData
                        });
                        self.applyGlobalSearch = function () {
                            var term = self.globalSearchTerm;
                            self.tableParams.filter({
                                searchTerm: term
                            });
                        };
                        var tableId = "uid";
                        checkedSrv.checkDo(self, tableData, "id");
                    }
                });
            }
            function getMemberList(){
                var id = self.groupId
                affinitySrv.getAffinityGroupMembers(id).then(function(data){
                    data ? self.loadData_ = true : "";
                    if(data && data.data && data.data.instances){
                        
                        var memberData = data.data.instances;
                        memberData.map(function(item){
                             item.status = item.status.toLowerCase();
                             item.searchTerm = [item.name,item.imageName,$translate.instant("aws.instances.table.status." + item.status),item.fixedIps,item.floatingIps].join("\b");
                        })
                        self.memeberTable = new NgTableParams({
                            count: GLOBAL_CONFIG.PAGESIZE
                        }, {
                            counts: [],
                            dataset: memberData
                        });
                        self.applyGlobalSearch = function (globalSearchTerm_) {
                            var term = globalSearchTerm_;
                            self.memeberTable.filter({
                                searchTerm: term
                            });
                        };
                        
                    }
                })
            }
            self.$on("getDetail", function (event, id) {
                self.groupId = id;
                self.loadData_ = false
                getMemberList()
                self.refreshMemberTable = function(){
                     self.loadData_ = false
                    getMemberList()
                }
            })

        }
    ])
.controller("createAffinityCtrl", ["$routeParams", "$scope", "$rootScope", "NgTableParams", "$uibModal", "$translate", "checkedSrv", "GLOBAL_CONFIG", "$filter", "$window", "affinitySrv","initAffinityTable","checkName","closeModal",
        function ($routeParams, $scope, $rootScope, NgTableParams, $uibModal, $translate, checkedSrv, GLOBAL_CONFIG, $filter, $window, affinitySrv,initAffinityTable,checkName,closeModal) {
             $scope.submitInValid = false;
                $scope.createData = {
                    name: "",
                    beAffinity: "1",
                }
                $scope.repeatName = false;
                $scope.canSubmit = false ;
                $scope.confirm = function (createForm) {
                   
                    if (createForm.$valid && !$scope.canSubmit) {
                        $scope.canSubmit = true;
                       $scope.repeatName = checkName($scope.createData.name);
                        if ($scope.repeatName) {
                            $scope.canSubmit = false;
                        } else {
                            var policie = $scope.createData.beAffinity === "1" ? "affinity" : "anti-affinity";
                            var postData = {
                                name: $scope.createData.name,
                                policies: [policie]
                            }
                            affinitySrv.creatAffinityGroup(postData).then(function () {
                                initAffinityTable();
                                closeModal();
                                setTimeout(function(){
                                    $scope.canSubmit = false;
                                },1000)
                                
                            })
                        }

                    } else {
                        $scope.submitInValid = false;
                        return;
                    }

                }
                        
        }])