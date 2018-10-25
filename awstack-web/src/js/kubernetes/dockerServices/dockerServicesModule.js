/**
 * Created by Weike on 2016/11/25.
 */
import "./dockerServicesSrv";
import "../dockerClusters/dockerClustersSrv"

angular.module("dockerServicesModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "dockerServicesSrvModule", "dockerClustersSrvModule"])
    .service("servicechkSrv", function ($rootScope, NgTableParams) {
        this.doCheck = function (self, dataset) {
            self.tableParams = new NgTableParams({
                count: 10, sorting: {name: "asc"}
            }, {counts: [], dataset: dataset});

            self.dockerClusters_search = {
                globalSearchTerm : ''
            }

            self.applyGlobalSearch = function() {
                self.tableParams.filter({
                    searchTerm: self.dockerClusters_search.globalSearchTerm
                });
            };

            self.checkboxes = {
                checked: false,
                items: {}
            };

            self.$watch(function () {
                return self.tableParams.page();
            }, function (data) {
                self.checkboxes.checked = false;
                self.checkboxes.items = {};
            });

            self.$watch(function () {
                return self.checkboxes.checked;
            }, function (data) {
                angular.forEach(self.tableParams.data, function (item) {
                    self.checkboxes.items[item.name] = data;
                });
            });

            self.$watch(function () {
                return self.checkboxes.items;
            }, function (values) {
                self.selectedItemsData = [];
                let checkedItems = [];
                let checked = 0,
                    unchecked = 0,
                    total = self.tableParams.data.length;

                angular.forEach(self.tableParams.data, function (item) {
                    checked += (self.checkboxes.items[item.name]) || 0;
                    unchecked += (!self.checkboxes.items[item.name]) || 0;
                    if (self.checkboxes.items[item.name]) {
                        checkedItems.push(item.name);
                        self.selectedItemsData.push(item);
                        self.currentItemData = item;
                        self.editData = angular.copy(item);
                    }
                });
                self.selectedItems = checkedItems;
                if ((unchecked == 0) || (checked == 0)) {
                    if (total > 0) {
                        self.checkboxes.checked = (checked == total);
                    }
                }
                if (checked === 0) {
                    self.canDelete = false;
                    self.canScale = false;
                } else if (checked === 1) {
                    self.canDelete = true;
                    self.canScale = true;
                } else {
                    self.canDelete = true;
                    self.canScale = false;
                }
                angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        }
    })
    .controller("dockerServicesCtrl", function ($scope, $translate, $rootScope, $uibModal, $interval, servicechkSrv, dockerServicesSrv, dockerClustersSrv,$location,$filter) {
        var self = $scope;
        if(localStorage.installK8s==1){
            self.pluginSwitch=1;
        }else{
            self.pluginSwitch=2;
            return;
        }
        $scope.initData = function () {
            dockerServicesSrv.getDockerServices().then(function (result) {
                if (!result || result.status !== 0 || result.msg !== "OK") {
                    $scope.dockerClustersData = [];
                    return;
                }
                dockerServicesSrv.dockerServicesData = result.data;
                // console.log("dockerServicesData:\n", result.data);
                _.map(dockerServicesSrv.dockerServicesData, function (dockerService) {
                    dockerService.name = dockerService.metadata.name;
                    dockerService.ports = $scope.getServicePorts(dockerService.spec.ports);
                    dockerService.metadata.creation_time = $filter('localDate')(dockerService.metadata.creationTimestamp);
                    dockerService.searchTerm = [dockerService.name,dockerService.spec.type,dockerService.spec.sessionAffinity === "ClientIP" ? "是" : "否",
                    dockerService.status.podIP,dockerService.ports,$scope.getLabels(dockerService.metadata.labels),
                    dockerService.metadata.creation_time].join("\b")
                });
                // console.log( dockerServicesSrv.dockerServicesData)
            });
        };

        $scope.serverTitle = $location.search().id
        $scope.showDetails = function(item){
            $location.search('&id='+encodeURIComponent(item));
            $scope.serverTitle = item
        }


        $scope.initData();
        $scope.refresh = function () {
            $scope.dockerClusters_search.globalSearchTerm = ''
            $scope.applyGlobalSearch()
            $scope.initData();
        };

        $scope.$watch(function () {
            return dockerServicesSrv.dockerServicesData;
        }, function (data) {
            if (data != null) {
                servicechkSrv.doCheck($scope, data);
            }
        }, true);

        $scope.getServicePorts = function (ports) {
            let portsArr = [];
            _.map(ports, function (port) {
                portsArr.push(port.port.toString() + "/" + port.protocol);
            });
            return portsArr.join(", ");
        };

        $scope.getLabels = function (labels) {
            let labelsArr = [];
            for (let key in labels) {
                labelsArr.push(key + "=" + labels[key]);
            }
            return labelsArr.join(", ");
        };


        //设置项的初始化
        $scope.titleName="dockerServices";
        if(sessionStorage["dockerServices"]){
            $scope.titleData=JSON.parse(sessionStorage["dockerServices"]);
        }else{
            $scope.titleData=[
                {name:'k8s.dockerServices.name',value:true,disable:true,search:''},
                {name:'k8s.dockerServices.type',value:true,disable:false,search:''},
                {name:'k8s.dockerServices.sessionAffinity',value:true,disable:false,search:''},
                {name:'k8s.dockerServices.serverClusterIP',value:true,disable:false,search:''},
                {name:'k8s.dockerServices.ports',value:true,disable:false,search:''},
                {name:'k8s.dockerServices.labels',value:true,disable:false,search:''},
                {name:'k8s.dockerServices.creationTimestamp',value:true,disable:false,search:''},
            ];
        }


        $scope.createService = function () {
            let scope = $rootScope.$new();
            scope.showNodePort = false;
            scope.serviceNameRepeated = false;
            scope.nodePortsRepeated = false;
            scope.clustersData = [];
            scope.types = ["ClusterIP", "NodePort"];
            scope.sessionAffinities = ["None", "ClientIP"];
            scope.containerPorts = [];
            scope.availableNodePorts = [];

            scope.createServiceData = {
                name: "",
                type: scope.types[0],
                sessionAffinity: scope.sessionAffinities[0],
                selectedCluster: null,
                ports: []
            };

            scope.initClusterData = function () {
                dockerClustersSrv.getDockerClusters().then(function (result) {
                    if (result.status != 0 || result.msg != "OK") {
                        $scope.dockerClustersData = [];
                        return;
                    }
                    scope.clustersData = result.data;
                });
            };
            scope.initClusterData();
            // console.log("dockerServicesData:\n", dockerServicesSrv.dockerServicesData);

            let createServiceModel = $uibModal.open({
                animation: true,
                templateUrl: "createService.html",
                scope: scope
            });

            scope.repeatPortName = function(port,num){
                scope.repeatPortNameMsg = false
                if(scope.createServiceData.ports.length>1){
                    for (let i = 0; i < scope.createServiceData.ports.length; i++) {
                        if(port.name&&scope.createServiceData.ports[i].name == port.name&&num!=i){
                            scope.createServiceData.ports[i].errorPortNameMsg = ""
                            scope.repeatPortNameMsg = true
                            port.errorPortNameMsg = "服务的端口名称不能重名"
                        }
                    }
                }
            }

            scope.repeatPort = function(port,num){
                scope.repeatportMsg = false
                if(scope.createServiceData.ports.length>1){
                    for (let i = 0; i < scope.createServiceData.ports.length; i++) {
                        if(port.port&&scope.createServiceData.ports[i].port == port.port&&num!=i){
                            scope.createServiceData.ports[i].errorPortMsg = ""
                            scope.repeatportMsg = true
                            port.errorPortMsg = "服务的端口不能重名"
                        }
                    }
                }
            }

            scope.getAvailableNodePorts = function (number) {
                if (number === 0) {
                    scope.availableNodePorts = [];
                    return;
                }
                dockerServicesSrv.getAvailableNodePorts(number).then(function (result) {
                    if (result.status === 0 && result.msg === "OK") {
                        scope.availableNodePorts = result.data;
                        for (let i = 0; i < scope.createServiceData.ports.length; i++) {
                            scope.createServiceData.ports[i].errorPortNameMsg = ""
                            scope.createServiceData.ports[i].errorPortMsg = ""
                            scope.createServiceData.ports[i].nodePort =
                                scope.availableNodePorts[i];
                        }
                    }
                });
            };

            scope.$watch(function () {
                return scope.createServiceData.name;
            }, function (serviceName) {
                let dockerServicesData = dockerServicesSrv.dockerServicesData;
                for (let i = 0; i < dockerServicesData.length; i++) {
                    if (dockerServicesData[i].metadata.name === serviceName) {
                        scope.serviceNameRepeated = true;
                        return;
                    }
                }
                scope.serviceNameRepeated = false;
            }, true);

            scope.$watch(function () {
                return scope.createServiceData.ports;
            }, function (ports) {
                let usedNodePorts = [];
                _.map(ports, function (port) {
                    if (port.nodePort !== "") {
                        usedNodePorts.push(port.nodePort);
                    }
                });
                if (usedNodePorts.length > 1) {
                    usedNodePorts.sort();
                    for (let i = 0; i < usedNodePorts.length - 1; i++) {
                        if (usedNodePorts[i] === usedNodePorts[i + 1]) {
                            scope.nodePortsRepeated = true;
                            return;
                        }
                    }
                    scope.nodePortsRepeated = false;
                }
            }, true);

            scope.$watch(function () {
                return scope.createServiceData.selectedCluster;
            }, function (selectedCluster) {
                if (selectedCluster != null && selectedCluster != undefined) {
                    scope.containerPorts = [];
                    scope.createServiceData.ports = [];
                    let containers = selectedCluster.spec.template.spec.containers;
                    for (let i = 0; i < containers.length; i++) {
                        let ports = containers[i].ports;
                        for (let j = 0; j < ports.length; j++) {
                            scope.containerPorts.push(ports[j]);
                            scope.createServiceData.ports.push({
                                name: ports[j].name,
                                protocol: ports[j].protocol,
                                targetPort: ports[j].hostPort || ports[j].containerPort,
                                port: ports[j].containerPort,
                                nodePort: "",
                                errorPortNameMsg :"",
                                errorPortMsg :""
                            });
                        }
                    }
                    if (scope.createServiceData.type === "NodePort") {
                        scope.showNodePort = true;
                        scope.getAvailableNodePorts(scope.containerPorts.length);
                    } else {
                        scope.availableNodePorts = [];
                    }
                }
            });

            scope.$watch(function () {
                return scope.createServiceData.type;
            }, function (type) {
                _.map(scope.createServiceData.ports, function (port) {
                    port.nodePort = "";
                });
                if (type === "ClusterIP") {
                    scope.showNodePort = false;
                    return;
                }
                scope.showNodePort = true;
                scope.getAvailableNodePorts(scope.containerPorts.length);
            }, true);

            return createServiceModel.result.then(function (createServiceData) {
                let labels = createServiceData.selectedCluster.metadata.labels;
                createServiceData.labels = [];
                for (let key in labels) {
                    createServiceData.labels.push({key: key, value: labels[key]})
                }
                delete createServiceData.selectedCluster;

                _.map(createServiceData.ports, function (port) {
                    port.port = port.port || port.targetPort;
                    // backend nedd port to be an integer.
                    port.port = parseInt(port.port);
                });
                console.log("createServiceData:\n", createServiceData);
                dockerServicesSrv.createDockerService(createServiceData).then(function (result) {
                    $scope.refresh();
                });
            });
        };

        $scope.deleteDockerServices = function () {
            $scope.$emit("delete", {
                target: "deleteDockerServices",
                msg: "<span>" + $translate.instant("aws.k8s.dockerServices.confirmDeleteDockerServices") + "</span>"
            });
        };

        $scope.$on("deleteDockerServices", function () {
            let deleteParams = {deletedServices: $scope.selectedItems};
            console.info("deletedServices:\n", deleteParams);
            dockerServicesSrv.deleteDockerServices(deleteParams).then(function (result) {
                $scope.refresh();
            });
        });
    })
    .controller("dockerServiceDetailsCtrl", function ($scope, $translate, $routeParams, $uibModal, $interval, servicechkSrv, dockerServicesSrv,$location) {
        // $scope.serviceName = $location.search().id 

        // $scope.serviceName = $routeParams.serviceName;

        $scope.$watch(function () {
            return $location.search().id ;
        }, function (serviceName) {
            if(serviceName){
                $scope.serviceName = serviceName
                $scope.initData()
            }
        });

        $scope.serviceData = null;
        $scope.k8sNodes = "";

        $scope.initData = function () {
            let dockerServicesData = dockerServicesSrv.dockerServicesData;
            if (dockerServicesData != null) {
                for (let i = 0; i < dockerServicesData.length; i++) {
                    let dockerService = dockerServicesData[i];
                    if (dockerService.name === $scope.serviceName) {
                        $scope.serviceData = dockerService;
                        break;
                    }
                }
                // console.log("serviceData:\n", $scope.serviceData);
            } else {
                // if refreshing this page, $scope.dockerServicesData will be null.
                // because this page's data is passed from last page `dockerServices`.
                // so, we need to send requests to get data in this situation.
                // console.info("You have refreshed this page!");
                dockerServicesSrv.getDockerServiceByName($scope.serviceName).then(function (result) {
                    if (!result || result.status !== 0 || result.msg !== "OK") {
                        $scope.serviceData = null;
                        return;
                    }
                    if(result.data){
                        $scope.serviceData = result.data;
                        $scope.serviceData.name = $scope.serviceData.metadata.name;
                        // console.log("serviceData:\n", $scope.serviceData);
                    }
                });
            }
        };

        let getRandomArrayElements = function (arr, count) {
            let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
            while (i-- > min) {
                index = Math.floor((i + 1) * Math.random());
                temp = shuffled[index];
                shuffled[index] = shuffled[i];
                shuffled[i] = temp;
            }
            return shuffled.slice(min);
        };

        $scope.$watch(function () {
            return $scope.serviceData;
        }, function (serviceData) {
            if (serviceData != null && serviceData.spec.ports.length > 0 &&
                serviceData.spec.ports[0].nodePort) {
                dockerServicesSrv.getK8SNodes().then(function (result) {
                    if (result.status != 0 || result.msg != "OK") {
                        $scope.serviceData = null;
                        return;
                    }
                    // if there are too many k8s nodes, just pick up random 5 of
                    // them to show in the frontend pages.
                    $scope.k8sNodes = "(" + (result.data.length > 5 ?
                                getRandomArrayElements(result.data, 5) : result.data
                        ).join("|") + ")";
                });
            }
        }, true);

        $scope.refresh = function () {
            $scope.initData();
        };

        $scope.getLabels = function (labels) {
            let labelsArr = [];
            for (let key in labels) {
                labelsArr.push(key + "=" + labels[key]);
            }
            return labelsArr.join(", ");
        };

        $scope.showPorts = function (ports, type) {
            let portsArr = [];
            for (let i = 0; i < ports.length; i++) {
                portsArr.push(ports[i][type] + "/" + ports[i]["protocol"]);
            }
            return portsArr.join("; ");
        };

        $scope.getAllPorts = function (ports, type) {
            if (!ports) {
                return "";
            }
            let nodePortsArr = [];
            for (let i = 0; i < ports.length; i++) {
                nodePortsArr.push(ports[i][type]);
            }
            return nodePortsArr.join("|");
        }
    });
