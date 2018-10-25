/**
 * Created by Weike on 2017/06/29.
 */
import "./dockerNodesSrv";

angular.module("dockerNodesModule", ["ngTable", 'ngAnimate', 'ui.bootstrap', "ui.select", "dockerNodesSrvModule"])
    .controller("dockerNodesCtrl", function ($scope, $translate, $rootScope, $uibModal, $interval, NgTableParams, dockerNodesSrv,$filter,newCheckedSrv,$location) {
        var self = $scope;
        self.context = self;
        $scope.getNodeIPByType = dockerNodesSrv.getNodeIPByType;
        $scope.getStatusOfType = dockerNodesSrv.getStatusOfType;

        self.titleName="dockerNodes";
        if(sessionStorage["dockerNodes"]){
            self.tableCols=JSON.parse(sessionStorage["dockerNodes"]);
         }else{
            self.tableCols = [
                 { field: "name", title: "节点名称",sortable: "name",show: true,disable:true},
                 { field: "InternalIP", title: "节点IP",sortable: "InternalIP",show: true,disable:false},
                 { field: "operatingSystem", title: "操作系统",sortable: "operatingSystem",show: true,disable:false },
                 { field: "kernelVersion", title: "内核版本",sortable: "kernelVersion",show: true,disable:false },
                 { field: "containerRuntimeVersion", title: "Docker版本",sortable: "containerRuntimeVersion",show: true,disable:false },
                 { field: "kubeletVersion", title: "Kubernete版本",sortable: "kubeletVersion",show: true,disable:false },
                 { field: "KubeletReady", title: "Kubernete状态",sortable: "KubeletReady",show: true,disable:false },
                 { field: "podSchedulable", title: "可调动POD",sortable: "podSchedulable",show: true,disable:true },
                 { field: "creationTimestamp", title: "节点创建时间",sortable: "creationTimestamp",show: true,disable:true },
            ];
         }
     
        self.configSearch = function(tableData){
             var tableData = tableData || self.tabledata;
             tableData.map(item => {
                 editSearch(item)
             })
             return tableData;
         }
         function editSearch(item){
            var searchTerm = []
            self.tableCols.map(search => {
                if(search.title && search.show){
                    searchTerm.push(item[search.field])
                }
            })
            item.searchTerm =searchTerm.join("\b") ;
            return item;
        }
        $scope.initData = function () {
            if(!self.services.k8s) return;
            dockerNodesSrv.getDockerNodes().then(function (result) {
                if (result) {
                    dockerNodesSrv.dockerNodesData = [];
                    _.map(result.data, function (k8sNode) {
                        dockerNodesSrv.dockerNodesData.push({
                            name: k8sNode["metadata"]["name"],
                            data: k8sNode
                        });
                    });
                    successFunc(dockerNodesSrv.dockerNodesData)
                }
            });
        };
        $scope.initData();

        function successFunc(data){
            data.map(item => {
                item.InternalIP = $scope.getNodeIPByType(item, "InternalIP");
                item.operatingSystem = item.data.status.nodeInfo.operatingSystem;
                item.kernelVersion = item.data.status.nodeInfo.kernelVersion;
                item.containerRuntimeVersion = item.data.status.nodeInfo.containerRuntimeVersion;
                item.kubeletVersion = item.data.status.nodeInfo.kubeletVersion;
                item.KubeletReady = $scope.getStatusOfType(item, "Ready") ? "Ready" : "NotReady";
                item.podSchedulable = item.data.metadata.annotations['volumes.kubernetes.io/controller-managed-attach-detach']=== 'true' ? '是': '否';
                item.creationTimestamp = $filter("date")(item.data.metadata.creationTimestamp, "yyyy-MM-dd HH:mm:ss");
            })
            self.tabledata = self.configSearch(data);
            $scope.tableParams = new NgTableParams({
                count: 10, sorting: {name: "asc"}
            }, {counts: [], dataset: self.tabledata});
        }

        self.detailFunc = function(node){
            if($location.url() == "/k8s/nodes"){
                $location.url("/k8s/nodes?id="+node.name);
                self.isK8sPage = true;
                dockerNodeDetailsCtrl($scope, $translate, $rootScope, $uibModal, NgTableParams, dockerNodesSrv,newCheckedSrv);
            }else{
                self.isK8sPage = false;
                $scope.$emit('detailMove');
            }
            var nodeName = node.name
            $scope.initNodeData(nodeName);    
        }
    })

dockerNodeDetailsCtrl.$inject=["$scope", "$translate", "$rootScope", "$uibModal","NgTableParams", "dockerNodesSrv","newCheckedSrv"];
export function dockerNodeDetailsCtrl($scope, $translate, $rootScope, $uibModal, NgTableParams, dockerNodesSrv,newCheckedSrv){
    $scope.context = $scope;
    $scope.search={};
    $scope.initNodeData = function (nodeName) {
        $scope.nodeName = nodeName;
        $scope.getNodeIPByType = dockerNodesSrv.getNodeIPByType;
        $scope.getStatusOfType = dockerNodesSrv.getStatusOfType;
        dockerNodesSrv.getDockerNodes().then(function (result) {
            if (result) {
                _.map(result.data, function (k8sNode) {
                    let nodeData = {
                        name: k8sNode["metadata"]["name"],
                        data: k8sNode
                    };
                    dockerNodesSrv.dockerNodesData.push(nodeData);
                    if (nodeData["name"] === $scope.nodeName) {
                        dockerNodesSrv.selectedNode = nodeData;
                        $scope.selectedNode = dockerNodesSrv.selectedNode;
                    }
                });
            }
        });
    };
    //$scope.initNodeData();
    
    $scope.labelGlobalSearch=function(labelSearchTerm){
        var term=labelSearchTerm;
        $scope.labeltableParams.filter({
            searchTerm: labelSearchTerm
        });
    };

    function initLabelTable(){
        $scope.labeltableParams = new NgTableParams({
            count: 10, sorting: {key: "asc"}
        }, {counts: [], dataset: $scope.nodeLabels});
        newCheckedSrv.checkDo($scope,$scope.nodeLabels,"key","labeltableParams");
    }

    $scope.initLabels = function () {
        $scope.nodeLabels = [];
        for (let key in $scope.selectedNode.data.metadata.labels) {
            if (key.indexOf("kubernetes.io") !== -1) {
                continue;
            }
            $scope.nodeLabels.push({
                key: key,
                value: $scope.selectedNode.data.metadata.labels[key],
                searchTerm:[key,$scope.selectedNode.data.metadata.labels[key]].join("\b")
            });
        }
        initLabelTable()
    };

    $scope.refreshLabels = function () {
        $scope.search.labelSearchTerm="";
        dockerNodesSrv.getDockerNodes().then(function (result) {
            if (result) {
                _.map(result.data, function (k8sNode) {
                    let nodeData = {
                        name: k8sNode["metadata"]["name"],
                        data: k8sNode
                    };
                    dockerNodesSrv.dockerNodesData.push(nodeData);
                    if (nodeData["name"] === $scope.nodeName) {
                        dockerNodesSrv.selectedNode = nodeData;
                        $scope.selectedNode = dockerNodesSrv.selectedNode;
                        $scope.initLabels();
                    }
                });
            }
        });
    };
    

    $scope.$watch(function(){
        return $scope.checkedItemslabeltableParams;
    },function(values){
        $scope.modifyLabel_btn = true;
        $scope.delLabel_btn = true;
        if(values && values.length){
            if(values.length == 1){
                $scope.modifyLabel_btn = false;
                $scope.delLabel_btn = false;
            }else{
                $scope.delLabel_btn = false;
            }
        }
    })

    $scope.addNodeLabels = function () {
        // Remove item from array by value.
        Array.prototype.remove = function () {
            let what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };

        let scope = $rootScope.$new();

        scope.addNewNodeLabel = function () {
            scope.nodeLabelsData.push({
                key: "",
                value: ""
            });
        };
        scope.nodeLabelsData = [];
        scope.addNewNodeLabel();

        scope.deleteNodeLabel = function (nodeLabel) {
            scope.nodeLabelsData.remove(nodeLabel);
        };

        let addNodeLabelsModel = $uibModal.open({
            animation: true,
            templateUrl: "addNodeLabels.html",
            scope: scope
        });

        return addNodeLabelsModel.result.then(function (nodeLabelsData) {
            dockerNodesSrv.addNodeLabels($scope.nodeName, nodeLabelsData).then(function (result) {
                $scope.refreshLabels();
            });
        });
    };

    $scope.modifyNodeLabel = function () {
        let scope = $rootScope.$new();
        scope.currentNodeLabel = $scope.editData;

        let modifyNodeLabelModel = $uibModal.open({
            animation: true,
            templateUrl: "modifyNodeLabel.html",
            scope: scope
        });

        return modifyNodeLabelModel.result.then(function (nodeLabel) {
            dockerNodesSrv.modifyNodeLabel($scope.nodeName, nodeLabel).then(function (result) {
                $scope.refreshLabels();
            });
        });
    };

    $scope.deleteNodeLabels = function () {
        $scope.selectedItems = [];
        $scope.checkedItemslabeltableParams.map(item => {
            $scope.selectedItems.push(item.key)
        })
        $scope.$emit("delete", {
            target: "deleteNodeLabels",
            msg: "<span>" + $translate.instant("aws.k8s.dockerNodes.confirmDeleteNodeLabels") + "</span>"
        });
    };

    $scope.$on("deleteNodeLabels", function () {
        let deleteParams = {deletedLabelKeys: $scope.selectedItems};
        dockerNodesSrv.deleteNodeLabels($scope.nodeName, deleteParams).then(function (result) {
            $scope.refreshLabels();
        });
    });
}
 