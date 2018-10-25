import "./menuSrv";
var menuModule = angular.module("menuModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ngAnimate", "ngSanitize", "menuSv"]);
menuModule.controller("menuCtrl", function($scope, $rootScope, NgTableParams, $translate, $uibModal, menuSrv) {
    $scope.deleteMenu = function(scope) {
        var alertMsg = "";
        var nodeData = scope.$modelValue;
        if (nodeData.child && nodeData.child.length > 0) {
            alertMsg = "<span>" + nodeData.name + "下有子菜单，你确定要删除吗?" + "</span>";
        } else {
            alertMsg = "<span>" + "你确定要删除" + nodeData.name + "菜单吗？" + "</span>";
        }
        var content = {
            target: "delMenu",
            //msg: "<span>" + $translate.instant("aws.volumes.dv.confirmDelete") + "</span>",
            msg: alertMsg,
            data: nodeData
        };
        $scope.$emit("delete", content);
    };
    $scope.$on("delMenu", function(e, data) {
        var ids = [];
        var isHaveChild = function(obj) {
            if (obj.child && obj.child.length > 0) {
                _.forEach(obj.child, function(item) {
                    ids.push(item.id);
                    isHaveChild(item);
                });
            }
        };
        if (data.child && data.child.length > 0) {
            ids.push(data.id);
            isHaveChild(data);
            menuSrv.deleteMenuIds({ "ids": ids }).then(function() {
                getAllMenus();
            });
        } else {
            menuSrv.deleteMenu(data.id).then(function() {
                getAllMenus();
            });
        }
    });
    $scope.toggle = function(scope) {
        scope.toggle();
    };
    $scope.showDetail = function(scope) {
        $scope.detailData = scope.$modelValue;
        $scope.detailData.newRole = "";
        var selectedRole = $scope.detailData.permitRole.split(",");
        for (var i = 0; i < selectedRole.length; i++) {
            if (i < selectedRole.length - 1) {
                if (selectedRole[i] == "2") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "超级管理员、";
                } else if (selectedRole[i] == "3") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "部门管理员、";
                } else if (selectedRole[i] == "4") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "项目管理员、";
                } else if (selectedRole[i] == "5") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "普通用户、";
                }
            } else if (i == selectedRole.length - 1) {
                if (selectedRole[i] == "2") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "超级管理员";
                } else if (selectedRole[i] == "3") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "部门管理员";
                } else if (selectedRole[i] == "4") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "项目管理员";
                } else if (selectedRole[i] == "5") {
                    $scope.detailData.newRole = $scope.detailData.newRole + "普通用户";
                }
            }
        }
    };



    $scope.newSubItem = function(scope, type) {
        if (scope) {
            var nodeData = scope.$modelValue;
        }

        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "addMenu.html",
            controller: "addMenuCtrl",
            resolve: {
                getAllMenus: function() {
                    return getAllMenus;
                },
                nodeData: function() {
                    return nodeData;
                },
                type: function() {
                    return type;
                },
                allMenuLength: function() {
                    return self.allMenuLength;
                }
            }
        });
    };
    $scope.collapseAll = function() {
        $scope.$broadcast("angular-ui-tree:collapse-all");
    };
    $scope.expandAll = function() {
        $scope.$broadcast("angular-ui-tree:expand-all");
    };

    function getAllMenus() {
        menuSrv.getAllMenus().then(function(result) {
            if (result) {
                $scope.data = result.data;
                self.allMenuLength = result.data.length;
            }
        });
    }
    getAllMenus();
});
menuModule.controller("addMenuCtrl", function($scope, $uibModalInstance, getAllMenus, menuSrv, nodeData, type, allMenuLength) {
    var self = $scope;
    self.enabledDatas = [{ name: "是", value: "true" }, { name: "否", value: "false" }];
    self.isEnabled = self.enabledDatas[0];
    self.changeEnabled = function(data) {
        self.menuData.enabled = data.value;
    };
    if (type == "newRootMenu") {
        self.menuTitle = "新建根菜单";
        self.menuData = { name: "", parentId: "", url: "", order: allMenuLength + 1, type: 1, icon: "", description: "", enabled: self.isEnabled.value, permitRole: "" };
    } else if (type == "new") {
        self.menuTitle = "新建菜单";
        var menuOrder;
        if (nodeData.child != null) {
            menuOrder = nodeData.child.length + 1;
        } else {
            menuOrder = 1;
        }
        self.menuData = { name: "", parentId: nodeData.id, url: "", order: menuOrder, type: nodeData.type + 1, icon: "", description: "", enabled: self.isEnabled.value, permitRole: "" };
    } else if (type == "edit") {
        self.menuTitle = "编辑菜单";
        self.menuData = nodeData;
        if (nodeData.enabled == true) {
            self.isEnabled = { name: "是", value: "true" };
        } else if (nodeData.enabled == false) {
            self.isEnabled = { name: "否", value: "false" };
        }

        self.menuRole_admin = false;
        self.menuRole_domainadmin = false;
        self.menuRole_proadmin = false;
        self.menuRole_member = false;
        var selectedRole = self.menuData.permitRole.split(",");
        _.forEach(selectedRole, function(item) {
            if (item == 2) {
                self.menuRole_admin = true;
            } else if (item == 3) {
                self.menuRole_domainadmin = true;
            } else if (item == 4) {
                self.menuRole_proadmin = true;
            } else if (item == 5) {
                self.menuRole_member = true;
            }
        });
    }



    self.confirmAddMenu = function(form) {
        self.submitInValid = false;
        if(!form.$valid){
            self.submitInValid = true;
            return;
        }
        var checkboxes = document.getElementsByName("menuRole");
        var str = "";
        var j = 0;
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                j++;
            }
        }

        for (var ii = 0; ii < j; ii++) {
            if (ii < j - 1) {
                str = str + checkboxes[ii].value + ",";
            } else {
                str = str + checkboxes[ii].value;
            }
        }
        self.menuData.permitRole = str;

        if (type == "edit") {
            menuSrv.updateMenu(self.menuData).then(function() {
                getAllMenus();
            });
        } else {
            menuSrv.addMenu(self.menuData).then(function() {
                getAllMenus();
            });
        }

        $uibModalInstance.dismiss("cancel");
    };
});
/*menuModule.controller("editMenuOrderCtrl",function($scope, $uibModalInstance,getAllMenus,menuSrv){
    var self=$scope;


    

    
});*/
