import "./orgDataSrv";

angular.module("orgModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "orgsrv"])
    .controller("OrgCtrl", function($scope, $rootScope, NgTableParams, $uibModal, orgDataSrv, alertSrv, $translate) {
        var addShow=function(obj){
            _.forEach(obj,function(item){
                item.show=false;
                if(item.children&&item.children.length>0){
                    addShow(item.children);
                }
            });
        };
        function getOrgList(){
            orgDataSrv.getOrgData().then(function(result) {
                $scope.list = result.data;
                addShow($scope.list);

            });
        }
        getOrgList();
        /*$rootScope.$on("getDragList", function(event, data) {
            $scope.list = data;
        });*/
        $scope.options = {
            accept: function() {
                return false;
            },
            beforeDrop: function(e) {
                if (e.dest.nodesScope.$parent.$modelValue && e.source.nodeScope.$modelValue.parentId != e.dest.nodesScope.$parent.$modelValue.id) {
                    var scope = $rootScope.$new();
                    scope.fromDepart = e.source.nodeScope.$modelValue.name;
                    scope.toDepart = e.dest.nodesScope.$parent.$modelValue.name;
                    var modalInstance;
                    modalInstance = $uibModal.open({
                        templateUrl: "drop-modal.html",
                        windowClass: "update-modal",
                        scope: scope
                    });
                    return modalInstance.result.then(function() {
                        var postData = {
                            id: e.source.nodeScope.$modelValue.id,
                            parentId: e.dest.nodesScope.$parent.$modelValue.id,
                            enterpriseUid: e.source.nodeScope.$modelValue.enterpriseUid
                        };
                        orgDataSrv.editOrg(postData).then(function() {
                            orgDataSrv.getOrgData().then(function(result) {
                                $rootScope.$broadcast("getOrgList", result.data);
                            });
                        });
                    });
                }
            }
        };
        //如果该节点的子节点显示，那么该节点也显示
        $scope.isShow=function(obj){
            var isShow=false;
            if(obj.children && obj.children.length>0){
                for(var i=0;i<obj.children.length;i++){
                    var tempShow=$scope.visible(obj.children[i]);
                    if(tempShow==true){
                        isShow=true;
                        return isShow;              
                    }else{
                        if($scope.isShow(obj.children[i])==true){
                            return true;
                        }
                    }   
                }
            }else{
                return false;
            }
        };
        var updateShow=function(obj){
            _.forEach(obj,function(item){
                item.show=true;
                if(item.children&&item.children.length>0){
                    updateShow(item.children);
                }
            });
        };
        $scope.visible = function(item) {
            //如果该节点显示，该节点的所有子节点都要显示
            if(item.children&&item.children.length>0){
                if($scope.query&&item.name.indexOf($scope.query) != -1){
                    updateShow(item.children);  
                }
            }
            return !($scope.query && $scope.query.length > 0 && item && item.name.indexOf($scope.query) == -1);
        };
        $scope.findNodes = function() {

        };
        $scope.updateDepart = function(scope, type) {
            var rootDepart_Or_not = {};
            if (scope) {
                rootDepart_Or_not = scope.$modelValue;
                rootDepart_Or_not.type = type;
                rootDepart_Or_not.deptLevel = Number(scope.$modelValue.deptLevel);
                rootDepart_Or_not.title = $translate.instant("aws.org.upOrg.direct_child_org");
            } else {
                rootDepart_Or_not = {
                    "title": $translate.instant("aws.org.new_org"),
                    "type": type,
                    "id": 0
                };
            }
            var modalAddOrg = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "updateOrg.html",
                windowClass: "update-modal",
                controller: "orgUpdateCtrl",
                resolve: {
                    items: function() {
                        return rootDepart_Or_not;
                    },
                    getOrgList:function(){
                        return getOrgList;
                    }
                }
            });
            modalAddOrg.result.then(function() {
                getOrgList();
                //list ? list.push(items.rootDepart) : "";
            });

        };

        $scope.removeDepart = function(scope) {
            var content = {
                target: "delDep",
                msg: "<span>" + $translate.instant("aws.org.upOrg.del_org") + "</span>",
                data:scope
            };
            if(scope.$modelValue.children.length){
                content.msg = $translate.instant("aws.org.upOrg.not_del_org");
                content.notDel = true;
            }
            $scope.$emit("delete", content);                
        };
        $scope.$on("delDep", function(e,data) {
            var postData = data.$modelValue.id;
            orgDataSrv.delOrg(postData).then(function() {
                getOrgList();
                //scope.remove();
            });
        });
    })
    .controller("orgUpdateCtrl", function($scope, orgDataSrv, $uibModalInstance, items, $translate,getOrgList) {
        /*$scope.$watch("departDes",function(){
            if($scope.departDes.length>100){
                console.log($scope.departDes.length);
                $scope.cheackText = true;
            }else{
                $scope.cheackText = false;
                console.log($scope.departDes.length);
            }
        });
        $scope.$watch("departName",function(){
                if($scope.departName.length>32){
                    console.log($scope.departName.length);
                    $scope.cheackName = true;
                }else{
                    $scope.cheackName = false;
                    console.log($scope.departName.length);
                }
        });*/
        switch (items.type) {
        case "new":
            $scope.headTitle = items.title;
            $scope.directDepart = items.name;
            $scope.ok = function() {
                var postData = {
                    name: $scope.departName,
                    parentId: items.id,
                    description: $scope.departDes
                };
                if(items.deptLevel>=0){
                    postData.deptLevel = Number(items.deptLevel)+1;
                }else{
                    postData.deptLevel = 0;
                }
                if($scope.orgForm.$valid){
                    $uibModalInstance.close();
                    orgDataSrv.createOrg(postData).then(function() {
                        /*var pushData = {
                            name: result.data.name,
                            id: result.data.id,
                            enterpriseUid: result.data.enterpriseUid,
                            description: result.data.description,
                            parentId:result.data.parentId,
                            children: [],
                            type:0
                        };*/
                        /*if (result.data.parentId != 0) {
                            nodeData.children.push(pushData);
                        } else {
                            items.rootDepart = pushData;
                        }*/
                        getOrgList();
                    });

                }else{
                    $scope.submitValid = true;
                }
                
            };
            break;
        case "edit":
            $scope.headTitle = $translate.instant("aws.org.upOrg.edit_org");
            $scope.departName = items.name;
            $scope.departDes = items.description;
            $scope.ok = function() {
               /* items.name = $scope.departName;
                items.description = $scope.departDes;*/
                var postData = {
                    name: $scope.departName,
                    id: items.id,
                    description: $scope.departDes
                };
                if($scope.orgForm.$valid){
                    $uibModalInstance.close();
                    orgDataSrv.editOrg(postData).then(function() {
                        getOrgList();
                    });
                }else{
                    $scope.submitValid = true;
                }
                
            };
            break;
        }

        $scope.cancel = function() {
            $uibModalInstance.dismiss();
        };
    })
    .controller("moveDepartCtrl", function($scope, orgDataSrv, $uibModalInstance, items) {
        $scope.fromDepart = items.source.nodeScope.$modelValue.name;
        $scope.toDepart = items.dest.nodesScope.$parent.$modelValue.name;

        var postData = {
            id: items.source.nodeScope.$modelValue.id,
            parentId: items.dest.nodesScope.$parent.$modelValue.id,
            enterpriseUid: items.source.nodeScope.$modelValue.enterpriseUid
        };
        orgDataSrv.editOrg(postData).then(function() {});
        $scope.cancel = function() {
            $uibModalInstance.close(items);
        };
    });
    
