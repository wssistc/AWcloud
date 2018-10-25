/**
 * Created by Weike on 2017/06/29.
 */
angular.module("dockerNodesSrvModule", [])
    .service("dockerNodesSrv", function ($rootScope, $http,$location) {
        var staticUrl = "awstack-user/v1/k8s/nodes";

        // get list of all dockerNodes for current tenant.
        return {
            getDockerNodes: function (regionKey) {
                return $http({
                    method: "GET",
                    url: staticUrl
                })
            },

            getNodesByLabel: function (selectorsData) {
                return $http({
                    method: "POST",
                    url: staticUrl + "/labels",
                    data: selectorsData
                });
            },

            addNodeLabels: function (nodeName, nodeLabelsData) {
                return $http({
                    method: "POST",
                    url: staticUrl + "/" + nodeName + "/labels",
                    data: nodeLabelsData
                });
            },

            modifyNodeLabel: function (nodeName, nodeLabel) {
                return $http({
                    method: "PUT",
                    url: staticUrl + "/" + nodeName + "/labels",
                    data: nodeLabel  
                });
            },

            deleteNodeLabels: function (nodeName, deleteParams) {
                return $http({
                    method: "DELETE",
                    url: staticUrl + "/" + nodeName + "/labels",
                    params: deleteParams
                });
            },

            getNodeIPByType: function (k8sNode, type) {
                for (var i = 0; i < k8sNode.data.status.addresses.length; i++) {
                    var address = k8sNode.data.status.addresses[i];
                    if (address.type === type) {
                        return address.address;
                    }
                }
            },

            getStatusOfType: function (k8sNode, type) {
                for (var i = 0; i < k8sNode.data.status.conditions.length; i++) {
                    var condition = k8sNode.data.status.conditions[i];
                    if (condition.type === type) {
                        return condition.status === "True";
                    }
                }
            },

            selectedItemsData: null,
            dockerNodesData: [],
            selectedNode: null
        }
    });
