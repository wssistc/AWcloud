/**
 * Created by Weike on 2016/10/13.
 */
import "./dockerClustersSrv";
import "../dockerImages/dockerImagesSrv";
import "../dockerNodes/dockerNodesSrv";

angular.module("dockerClustersModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "ng-echarts", "dockerClustersSrvModule", "dockerImagesSrvModule", "dockerNodesSrvModule"])
    .service("clusterchkSrv", function (NgTableParams) {
        this.doCheck = function (self, dataset) {
            self.tableParams = new NgTableParams({
                count: 10,
                sorting: {name: "asc"}
            }, {counts: [], dataset: dataset});

            self.dockerClusters_search = {
                globalSearchTerm: ''
            }

            self.applyGlobalSearch = function () {
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
                    self.canRollingUpdate = false;
                } else if (checked === 1) {
                    self.canDelete = true;
                    self.canScale = true;
                    self.canRollingUpdate = true;
                } else {
                    self.canDelete = true;
                    self.canScale = false;
                    self.canRollingUpdate = false;
                }
                // console.info("checkboxes:\n", self.checkboxes);
                angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
            }, true);
        }
    })
    .controller("dockerClustersCtrl", function ($scope, $rootScope, $translate, $uibModal, $interval, clusterchkSrv, dockerClustersSrv, dockerImagesSrv, dockerNodesSrv ,$location,detailFactory,$filter) {
        $scope.dockerClustersData = [];
        var self = $scope;
        if(localStorage.installK8s==1){
            self.pluginSwitch=1;
        }else{
            self.pluginSwitch=2;
            return;
        }
        $scope.initData = function () {
            dockerClustersSrv.getDockerClusters().then(function (result) {
                if (!result || result.status !== 0 || result.msg !== "OK") {
                    $scope.dockerClustersData = [];
                    return;
                }
                $scope.dockerClustersData = result.data;
                angular.forEach($scope.dockerClustersData, function (dockerCluster) {
                    dockerCluster.name = dockerCluster.metadata.name;
                    dockerClustersSrv.getDockerClustersDetail(dockerCluster.name).then(function (result) {
                        let currentRunning = 0;
                        _.map(result.data, function (clusterReplicaData) {
                            if (clusterReplicaData.status.phase === "Running") {
                                currentRunning++;
                            }
                        });
                        dockerCluster.status.currentTotal = result.total;
                        dockerCluster.status.currentRunning = currentRunning;
                        dockerCluster.metadata.creation_time = $filter('localDate')(dockerCluster.metadata.creationTimestamp);
                        dockerCluster.searchTerm = [dockerCluster.name,dockerCluster.status.readyReplicas,dockerCluster.status.currentTotal,
                            dockerCluster.status.currentRunning,'name=' + dockerCluster.name,
                            dockerCluster.metadata.creation_time].join('\b')
                    });
                });
                // console.log("dockerClustersData:\n", $scope.dockerClustersData);
                // item.searchTerm = [item.name].join("\b")
            });
        };

        $scope.initData();
        $scope.refresh = function () {
            $scope.initData();
        };

        $scope.showDetail = function (item) {
            detailFactory.moveTo = false;
            $location.search('&id=' + encodeURIComponent(item.name));
            detailFactory.pageTitle.clustersTitle = item.name
        }

        $scope.$watch(function () {
            return detailFactory.moveTo
        }, function (value) {
            $scope.moveTo = value
        }, true)


        $scope.$watch(function () {
            return detailFactory.showIt
        }, function (value) {
            $scope.showReplica = value.showReplica
            $scope.showContainer = value.showContainer
        }, true)

        $scope.$watch(function () {
            return detailFactory.moveToLeft
        }, function (value) {
            $scope.moveToLeft = value
        }, true)

        $scope.$watch(function () {
            return detailFactory.pageTitle
        }, function (value) {
            $scope.clustersTitle = $location.search().id
            $scope.ReplicaTitle = value.ReplicaTitle
            $scope.containerTitle = value.containerTitle
        }, true)

        $scope.handleDetail = function () {
            $location.url('/k8s/clusters')
        }

        $scope.toRight = function(){
            $scope.moveTo=false;
            $scope.moveToLeft=false;
            detailFactory.moveTo = false;
            detailFactory.moveToLeft = false;

            detailFactory.showIt.showContainer = false;
            detailFactory.showIt.showReplica = false;
            dockerClustersSrv.startMonitor = false;
        }

        $scope.toRightOnce = function(){
            $scope.moveTo=false;
            detailFactory.moveTo = false;
            detailFactory.moveToLeft = false;

            detailFactory.showIt.showContainer = false;
            detailFactory.showIt.showReplica = false;
            dockerClustersSrv.startMonitor = false;
        }

        $scope.toRightAgain = function(){
            $scope.moveToLeft=false;
            detailFactory.moveToLeft = false;

            detailFactory.showIt.showContainer = false;
            dockerClustersSrv.startMonitor = false;
        }

        //设置项的初始化
        $scope.titleName = "dockerClusters";
        if (sessionStorage["dockerClusters"]) {
            $scope.titleData = JSON.parse(sessionStorage["dockerClusters"]);
        } else {
            $scope.titleData = [
                {name: 'k8s.dockerClusters.name', value: true, disable: true, search: ''},
                {name: 'k8s.dockerClusters.replicas', value: true, disable: false, search: ''},
                {name: 'k8s.dockerClusters.currentTotal', value: true, disable: false, search: ''},
                {name: 'k8s.dockerClusters.currentRunning', value: true, disable: false, search: ''},
                {name: 'k8s.dockerClusters.labels', value: true, disable: false, search: ''},
                {name: 'k8s.dockerClusters.creationTimestamp', value: true, disable: false, search: ''},
            ];
        }

        $scope.$watch(function () {
            return $scope.dockerClustersData;
        }, function (data) {
            clusterchkSrv.doCheck($scope, data);
        }, true);

        $scope.getLabels = function (labels) {
            let labelsArr = [];
            for (let key in labels) {
                labelsArr.push(key + "=" + labels[key]);
            }
            return labelsArr.join(", ");
        };

        $scope.createDockerCluster = function () {

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

            scope.selectorTypes = ["=="];

            scope.existedClusters = [];
            scope.portProtocols = ["TCP", "UDP"];
            scope.dnsPolicys = ["ClusterFirst", "Default"];
            scope.restartPolicys = ["Always", "OnFailure", "Never"];
            scope.readWriteModes = ["RW", "RO"];
            scope.projectTypes = [{
                "type": "private",
                "name": "私有仓库"
            }, {
                "type": "public",
                "name": "公有仓库"
            }];
            scope.projects = {private: [], public: []};
            // scope.repos.data = {{projectName1: [repo1, repo2, ...]}, ...}
            scope.repos = {
                harbor: "",
                data: {}
            };
            // scope.tags.data = {repoName1: [], ...}
            scope.tags = {
                harbor: "",
                data: {}
            };

            scope.newDockerClusterData = {
                clusterName: "",
                dnsPolicy: scope.dnsPolicys[0],
                restartPolicy: scope.restartPolicys[0],
                clusterReplicas: 1,
                containers: [],
                volumes: []
            };

            scope.$watch(function () {
                return $scope.dockerClustersData;
            }, function (dockerClustersData) {
                if (!dockerClustersData) {
                    return;
                }
                scope.existedClusters = [];
                _.forEach(dockerClustersData, function (dockerCluster) {
                    scope.existedClusters.push(dockerCluster["name"]);
                });
            }, true);

            scope.clusterNameRepeated = function (clusterName) {
                if (!scope.existedClusters) {
                    return false;
                }
                for (let i = 0; i < scope.existedClusters.length; i++) {
                    if (scope.existedClusters[i] == clusterName) {
                        return true;
                    }
                }
                return false;
            };

            // scope.$watch(function () {
            //     return scope.newDockerClusterData.clusterReplicas;
            // }, function (clusterReplicas) {
            //     console.log(clusterReplicas)
                // if (isNaN(Number(clusterReplicas))) {
                //     scope.newDockerClusterData.clusterReplicas = 1;
                // } else {
                //     if (clusterReplicas <= 0) {
                //         scope.newDockerClusterData.clusterReplicas = 1;
                //     } else if (clusterReplicas > 1 &&
                //         scope.newDockerClusterData.volumes.length > 0) {
                //         scope.newDockerClusterData.clusterReplicas = 1;
                //     }
                // }
            // });

            scope.initSelectors = function () {
                scope.newDockerClusterData.nodeSelectors = [];
            };
            scope.initSelectors();

            scope.nodeLabelKeys = [];
            scope.nodeLabelItems = {};
            scope.initNodeLabels = function () {
                dockerNodesSrv.getDockerNodes().then(function (result) {
                    _.map(result.data, function (k8sNode) {
                        for (let key in k8sNode.metadata.labels) {
                            if (key.indexOf("kubernetes.io") !== -1) {
                                continue;
                            }
                            if (scope.nodeLabelKeys.indexOf(key) === -1) {
                                scope.nodeLabelKeys.push(key);
                                scope.nodeLabelItems[key] = [k8sNode.metadata.labels[key],];
                            } else {
                                if (scope.nodeLabelItems[key].indexOf(k8sNode.metadata.labels[key]) === -1) {
                                    scope.nodeLabelItems[key].push(k8sNode.metadata.labels[key]);
                                }
                            }
                        }
                    });
                    // console.info("scope.nodeLabelKeys:\n", scope.nodeLabelKeys);
                    // console.info("scope.nodeLabelItems:\n", scope.nodeLabelItems);
                });
            };
            scope.initNodeLabels();
            scope.selectShowNode = true
            scope.selectShowLabel = true
            scope.selectShowVolumes = true
            scope.selectShowContainerCmd = true
            scope.selectShowEvn = true
            scope.selectShowPort = true
            scope.selectShowVolumeMounts = true

            scope.showVolume = function(){
                scope.selectShowVolumes = true
            }
            scope.hideVolume = function(){
                scope.selectShowVolumes = false
            }
            scope.showVolumeMounts = function(){
                scope.selectShowVolumeMounts = true
            }

            scope.hideVolumeMounts  = function(){
                scope.selectShowVolumeMounts = false
            }

            scope.addSelector = function () {
                if (!scope.selectorsAreVisible) {
                    scope.changeSelectorsVisibility();
                }
                scope.newDockerClusterData.nodeSelectors.push({
                    createAt: Date.now(),
                    key: null,
                    value: null,
                    type: "=="
                });
            };

            scope.selectZeroNode = false;
            scope.$watch(function () {
                return scope.newDockerClusterData.nodeSelectors;
            }, function (newNodeSelectors, oldNodeSelectors, _scope) {
                // console.log("newNodeSelectors:\n", newNodeSelectors);
                // console.log("oldNodeSelectors:\n", oldNodeSelectors);
                _.map(newNodeSelectors, function (newNodeSelector) {
                    for (let i = 0; i < oldNodeSelectors.length; i++) {
                        if (oldNodeSelectors[i].createAt === newNodeSelector.createAt &&
                            oldNodeSelectors[i].key !== newNodeSelector.key) {
                            newNodeSelector.value = scope.nodeLabelItems[newNodeSelector.key][0];
                            break;
                        }
                    }
                });
                let selectorsData = {equals: [], inequals: []};
                for (let i = 0; i < newNodeSelectors.length; i++) {
                    let nodeSelector = newNodeSelectors[i];
                    if (nodeSelector.key == null || nodeSelector.value == null) {
                        return;
                    }
                    if (nodeSelector.type === "==") {
                        selectorsData.equals.push({
                            key: nodeSelector.key,
                            value: nodeSelector.value
                        });
                    } else {
                        selectorsData.inequals.push({
                            key: nodeSelector.key,
                            value: nodeSelector.value
                        });
                    }
                }
                dockerNodesSrv.getNodesByLabel(selectorsData).then(function (result) {
                    // console.log("matched nodes:\n", result.data);
                    if (result && result.status === 0 && result.data.length > 0) {
                        scope.selectZeroNode = false;
                    } else {
                        scope.selectZeroNode = true;
                    }
                });
            }, true);

            scope.deleteSelector = function (selector) {
                scope.newDockerClusterData.nodeSelectors.remove(selector);
            };

            scope.selectorsAreVisible = true;
            scope.changeSelectorsVisibility = function () {
                scope.selectorsAreVisible = !scope.selectorsAreVisible;
            };

            scope.initLabels = function () {
                scope.newDockerClusterData.labels = [];
            };
            scope.initLabels();

            scope.addLabel = function () {
                if (!scope.labelsAreVisible) {
                    scope.changeLabelsVisibility();
                }
                scope.newDockerClusterData.labels.push({key: null, value: null});
            };

            scope.deleteLabel = function (label) {
                scope.newDockerClusterData.labels.remove(label);
            };

            scope.labelsAreVisible = true;
            scope.changeLabelsVisibility = function () {
                scope.labelsAreVisible = !scope.labelsAreVisible;
            };

            scope.initVolumes = function () {
                scope.newDockerClusterData.volumes = [];
            };
            scope.initVolumes();

            scope.addVolume = function () {
                if (!scope.volumesAreVisible) {
                    scope.changeVolumesVisibility();
                }
                scope.newDockerClusterData.volumes.push({name: null, size: 1});
                scope.newDockerClusterData.clusterReplicas = 1;
            };

            scope.volumeNameRepeated = function (specifiedVolume, index) {
                for (let i = 0; i < scope.newDockerClusterData.volumes.length; i++) {
                    let volume = scope.newDockerClusterData.volumes[i];
                    if (volume.name === specifiedVolume.name && volume.name !== null && index != i) {
                        return true;
                    }
                }
                return false;
            };

            scope.deleteVolume = function (volume) {
                scope.newDockerClusterData.volumes.remove(volume);
            };

            scope.volumesAreVisible = true;
            scope.changeVolumesVisibility = function () {
                scope.volumesAreVisible = !scope.volumesAreVisible;
            };

            scope.initContainers = function () {
                scope.newDockerClusterData.containers = [{
                    createAt: Date.now(),
                    name: "",
                    image: {
                        projectType: "private",
                        project: {
                            name: "",
                            id: ""
                        },
                        repoName: "",
                        tagName: ""
                    },
                    imageName: "",
                    workingDir: "",
                    commands: [],
                    volumeMounts: [],
                    ports: [{ 
                        name: "",
                        containerPort: null,
                        hostPort: null,
                        protocol: scope.portProtocols[0],
                        createAt: Date.now()
                    }],
                    envs: [],
                    resources: {
                        requests: {cpu: "250m", memory: "128Mi"},
                        limits: {cpu: "500m", memory: "256Mi"}
                    },
                    cmdsVisibility: true,
                    envsVisibility: true,
                    portsVisibility: true,
                    volumeMountsVisibility: true,
                    resourcesVisibility: true
                }];
            };
            scope.initContainers();

            scope.generateCompleteImageName = function (container) {
                let completeImageName = "";
                if (!scope.repos.harbor) {
                    return completeImageName;
                }
                completeImageName += (scope.repos.harbor + "/");
                if (!container.image.project.name) {
                    return completeImageName;
                }
                completeImageName += (container.image.project.name + "/");
                if (!container.image.repoName) {
                    return completeImageName;
                }
                completeImageName += (container.image.repoName + ":");
                if (!container.image.tagName) {
                    return completeImageName;
                }
                completeImageName += container.image.tagName;
                // set the complete image name.
                container.imageName = completeImageName;

                return completeImageName.length >= 58 ?
                    completeImageName.slice(0, 57) + " ..." : completeImageName;
            };

            let getRepoObjs = function (project) {
                if (scope.repos.data.hasOwnProperty(project["name"])) {
                    return;
                }
                dockerImagesSrv.getRepositories(project.id).then(function (result) {
                    if (result.status === 0) {
                        scope.repos.harbor = result.data.harbor;
                        scope.repos.data[project.name] = [];
                        _.forEach(result.data.repos, function (repo) {
                            scope.repos.data[project.name].push(repo.split("/")[1]);
                        });
                        // console.log("scope.repos:\n", scope.repos);
                    }
                });
            };

            let getTagObjs = function (project, repoName) {
                if (scope.tags.data.hasOwnProperty(repoName)) {
                    return;
                }
                let encodedRepoName = encodeURIComponent(
                    encodeURIComponent(project.name + "/" + repoName)
                );
                // console.info("project.id: ", project.id);
                // console.info("encodedRepoName: ", encodedRepoName);
                dockerImagesSrv.getRepositoryTags(project.id, encodedRepoName).then(function (result) {
                    if (result.status === 0) {
                        scope.tags.harbor = result.data.harbor;
                        scope.tags.data[repoName] = result.data.tags;
                        // console.log("scope.tags:\n", scope.tags);
                    }
                });
            };

            scope.$watch(function () {
                return scope.newDockerClusterData.containers;
            }, function (newContainers, oldContainers, _scope) {
                for (let i = 0; i < newContainers.length; i++) {
                    let newContainer = newContainers[i];
                    let oldContainer = null;
                    for (let j = 0; j < oldContainers.length; j++) {
                        let container = oldContainers[j];
                        if (container.createAt == newContainer.createAt) {
                            oldContainer = container;
                            break;
                        }
                    }
                    // console.info("newContainer:\n", newContainer);
                    // console.info("oldContainer:\n", oldContainer);
                    if (oldContainer) {
                        if (newContainer.image.projectType !==
                            oldContainer.image.projectType) {
                            // console.log("projectType changed!");
                            if (scope.projects[newContainer.image.projectType].length > 0) {
                                newContainer.image.project =
                                    scope.projects[newContainer.image.projectType][0];
                                getRepoObjs(newContainer.image.project);
                                newContainer.image.repoName = "";
                                newContainer.image.tagName = "";
                            }
                        }
                        if (newContainer.image.project.name !==
                            oldContainer.image.project.name) {
                            // console.log("projectName changed!");
                            getRepoObjs(newContainer.image.project);
                            newContainer.image.repoName = "";
                            newContainer.image.tagName = "";
                        }
                        if (newContainer.image.repoName !==
                            oldContainer.image.repoName) {
                            // console.log("repoName changed!");
                            if (newContainer.image.project && newContainer.image.repoName) {
                                getTagObjs(newContainer.image.project,
                                    newContainer.image.repoName);
                            }
                            newContainer.image.tagName = "";
                        }
                    }
                }
            }, true);

            scope.initHarborProjects = function () {
                // get harbor private projects.
                dockerImagesSrv.getHarborProjects(0).then(function (result) {
                    _.forEach(result.data, function (project) {
                        scope.projects.private.push({
                            name: project["name"],
                            id: project["project_id"]
                        });
                    });
                });

                // get harbor public projects.
                dockerImagesSrv.getHarborProjects(1).then(function (result) {
                    _.forEach(result.data, function (project) {
                        scope.projects.public.push({
                            name: project["name"],
                            id: project["project_id"]
                        });
                    });
                });
            };
            scope.initHarborProjects();

            scope.addContainer = function () {
                scope.newDockerClusterData.containers.push({
                    createAt: Date.now(),
                    name: "",
                    image: {
                        projectType: "private",
                        project: {
                            name: "",
                            id: ""
                        },
                        repoName: "",
                        tagName: ""
                    },
                    imageName: "",
                    workingDir: "",
                    commands: [],
                    volumeMounts: [],
                    ports: [{ 
                        name: "",
                        containerPort: null,
                        hostPort: null,
                        protocol: scope.portProtocols[0],
                        createAt: Date.now()
                    }],
                    envs: [],
                    resources: {
                        requests: {cpu: "250m", memory: "128Mi"},
                        limits: {cpu: "500m", memory: "256Mi"}
                    },
                    cmdsVisibility: true,
                    envsVisibility: true,
                    portsVisibility: true,
                    volumeMountsVisibility: true,
                    resourcesVisibility: true
                });
            };

            scope.deleteContainer = function (container) {
                scope.newDockerClusterData.containers.remove(container);
            };

            scope.addContainerCmd = function (container) {
                if (!container.cmdsVisibility) {
                    scope.changeCmdsVisibility(container);
                }
                container.commands.push({name: "", createAt: Date.now()});
            };

            scope.changeCmdsVisibility = function (container) {
                container.cmdsVisibility = !container.cmdsVisibility;
            };

            scope.deleteContainerCmd = function (container, cmd) {
                container.commands.remove(cmd);
            };

            scope.addContainerEnv = function (container) {
                if (!container.envsVisibility) {
                    scope.changeEnvsVisibility(container);
                }
                container.envs.push({name: "", value: "", createAt: Date.now()});
            };

            scope.changeEnvsVisibility = function (container) {
                container.envsVisibility = !container.envsVisibility;
            };

            scope.deleteContainerEnv = function (container, env) {
                container.envs.remove(env);
            };

            scope.addContainerPort = function (container) {
                if (!container.portsVisibility) {
                    scope.changePortsVisibility(container);
                }
                container.ports.push({
                    name: "",
                    containerPort: null,
                    hostPort: null,
                    protocol: scope.portProtocols[0],
                    createAt: Date.now()
                });
            };

            scope.changePortsVisibility = function (container) {
                container.portsVisibility = !container.portsVisibility;
            };

            scope.deleteContainerPort = function (container, port) {
                container.ports.remove(port);
            };

            scope.addContainerVolumeMounts = function (container) {
                if (!container.volumeMountsVisibility) {
                    scope.changeVolumeMountsVisibility(container);
                }
                container.volumeMounts.push({
                    name: "",
                    rwMode: scope.readWriteModes[0],
                    readOnly: true,
                    mountPath: "",
                    createAt: Date.now()
                });
            };

            scope.changeVolumeMountsVisibility = function (container) {
                container.volumeMountsVisibility = !container.volumeMountsVisibility;
            };

            scope.deleteContainerVolumeMount = function (container, volumeMount) {
                container.volumeMounts.remove(volumeMount);
            };

            scope.changeResourcesVisibility = function (container) {
                container.resourcesVisibility = !container.resourcesVisibility;
            };

            scope.showAdvanced = false;
            scope.submintValid = false
            scope.goToNext = function (form) {
                if(form.$valid){
                    scope.showAdvanced = true;
                    scope.submintValid = false;
                }else{
                    scope.submintValid = true;
                }
            };
            scope.goToLast = function () {
                scope.showAdvanced = false;
            };

            dockerClustersSrv.getContentList().then(function(res){
                if(res&&res.data&&res.data.length>0&&res.data[0].meta){
                    // JSON.parse(res.data[0].meta).environment.useCeph = "true"
                    if(JSON.parse(res.data[0].meta).environment.useCeph == "false"){
                        scope.checkVolumes = false
                    }else if(JSON.parse(res.data[0].meta).environment.useCeph == "true"){
                        scope.checkVolumes = true
                    }
                }
               
            })

            let createDockerClusterModel = $uibModal.open({
                animation: true,
                templateUrl: "createDockerCluster.html",
                scope: scope
            });

            return createDockerClusterModel.result.then(function (newDockerClusterData) {
                _.map(newDockerClusterData.containers, function (container) {
                    delete container.createAt;
                    delete container.cmdsVisibility;
                    delete container.envsVisibility;
                    delete container.portsVisibility;
                    delete container.resourcesVisibility;
                    delete container.volumeMountsVisibility;
                    _.map(container.volumeMounts, function (volumeMount) {
                        volumeMount.readOnly = volumeMount.rwMode === "RO";
                        delete volumeMount.rwMode;
                        volumeMount.name = volumeMount.name.name;
                    });
                });
                // delete the volumes for pod if it is NOT used by any container.
                let date = new Date();
                let currentDate = date.toJSON().replace(/[T:-]/g, '').slice(0, 14);
                for (let i = 0; i < newDockerClusterData.volumes.length; i++) {
                    let volume = newDockerClusterData.volumes[i];
                    volume.used = false;
                    for (let j = 0; j < newDockerClusterData.containers.length; j++) {
                        let container = newDockerClusterData.containers[j];
                        for (let k = 0; k < container.volumeMounts.length; k++) {
                            let volumeMount = container.volumeMounts[k];
                            if (volumeMount.name === volume.name) {
                                volume.used = true;
                                volume.name += ("-" + currentDate);
                                volumeMount.name += ("-" + currentDate);
                            }
                        }
                    }
                }
                if (newDockerClusterData.labels.length === 0) {
                    newDockerClusterData.labels.push({
                        key: "name",
                        value: newDockerClusterData.clusterName
                    });
                }
                newDockerClusterData.volumes = newDockerClusterData.volumes.filter(volume => volume.used);

                // console.info("newDockerClusterData:\n", newDockerClusterData);
                dockerClustersSrv.createDockerCluster(newDockerClusterData).then(function (result) {
                        let clusterName = newDockerClusterData.clusterName;
                        let replicas = newDockerClusterData.clusterReplicas*1

                        let currentCluster = null;
                        dockerClustersSrv.getDockerClustersDetail(clusterName).then(function(result){
                            console.log(result)
                            for (let i = 0; i < result.data.length; i++) {
                                let dockerCluster = result.data[i].metadata;
                                if (dockerCluster.name === clusterName) {
                                    currentCluster = dockerCluster;
                                    // update this dockerCluster's replicas.
                                    currentCluster.status.replicas = replicas;
                                    break;
                                }
                            }
                        })
                        
                        let intervalPromise = $interval(function () {
                            $scope.waitLoading = true
                            dockerClustersSrv.getDockerClustersDetail(clusterName).then(function (result) {
                                let currentRunning = 0;
                                _.map(result.data, function (clusterReplicaData) {
                                    if (clusterReplicaData.status.phase === "Running") {
                                        currentRunning++;
                                    }
                                });
                                // update this dockerCluster's status currentTotal & currentRunning.
                                if (currentCluster != null) {
                                    currentCluster.status.currentTotal = result.total;
                                    currentCluster.status.currentRunning = currentRunning;
                                }
                                if (currentRunning === replicas) {
                                    // console.log(result)   
                                    $scope.waitLoading = false
                                    $scope.initData();                 
                                    $interval.cancel(intervalPromise);
                                }
                            });
                        },500);

                        $scope.refresh();
                });
            });
        };

        $scope.deleteDockerClusters = function () {
            $scope.$emit("delete", {
                target: "deleteDockerClusters",
                msg: "<span>" + $translate.instant("aws.k8s.dockerClusters.confirmDeleteDockerClusters") + "</span>"
            });
        };

        $scope.$on("deleteDockerClusters", function () {
            let deleteParams = {deletedClusters: $scope.selectedItems};
            // console.info("deletedClusters:\n", deleteParams);
            dockerClustersSrv.deleteDockerClusters(deleteParams).then(function (result) {
                $scope.refresh();
            });
        });

        $scope.$watch(function () {
            return $scope.selectedItemsData;
        }, function (selectedItemsData) {
            dockerClustersSrv.selectedClustersData = selectedItemsData;
        }, true);

        $scope.waitLoading = false

        $scope.intervalScaleCluster = function (clusterName, replicas) {
            let currentCluster = null;
            for (let i = 0; i < $scope.dockerClustersData.length; i++) {
                let dockerCluster = $scope.dockerClustersData[i];
                if (dockerCluster.name === clusterName) {
                    currentCluster = dockerCluster;
                    // update this dockerCluster's replicas.
                    currentCluster.status.replicas = replicas;
                    break;
                }
            }
            let intervalPromise = $interval(function () {
                $scope.waitLoading = true
                dockerClustersSrv.getDockerClustersDetail(clusterName).then(function (result) {
                    let currentRunning = 0;
                    _.map(result.data, function (clusterReplicaData) {
                        if (clusterReplicaData.status.phase === "Running") {
                            currentRunning++;
                        }
                    });
                    // update this dockerCluster's status currentTotal & currentRunning.
                    if (currentCluster != null) {
                        currentCluster.status.currentTotal = result.total;
                        currentCluster.status.currentRunning = currentRunning;
                    }
                    if (currentRunning === replicas) {
                        result.message = $translate.instant("aws.k8s.scaleCluster.scaleDockerClusterSuccess");
                        $rootScope.$broadcast("alert-success", result.message);
                        // console.log(result)   
                        $scope.waitLoading = false
                        $scope.initData();                 
                        $interval.cancel(intervalPromise);
                    }
                });
            },500);
        };

        $scope.scaleDockerCluster = function () {
            let selectedItems = dockerClustersSrv.selectedClustersData[0];
            let scope = $rootScope.$new();
            
            scope.scaleDockerClusterData = {
                clusterName: selectedItems.name,
                replicas: selectedItems.spec.replicas
            };
            scope.volumes = selectedItems.spec.template.spec.volumes;
            scope.useRBD = false;
            scope.currentReplicas = selectedItems.spec.replicas;
            // can't scale the RC if its pod use rbd as Persistent Storage.
            for (let i = 0; i < scope.volumes.length; i++) {
                if ("rbd" in scope.volumes[i]) {
                    scope.useRBD = true;
                    break;
                }
            }

            // can scale the RC only when the three value are the same.
            scope.ready = selectedItems.status.replicas === selectedItems.status.currentTotal &&
                selectedItems.status.replicas === selectedItems.status.currentRunning;

            let scaleDockerClusterModel = $uibModal.open({
                animation: true,
                templateUrl: "scaleDockerCluster.html",
                scope: scope
            });

            return scaleDockerClusterModel.result.then(function (scaleDockerClusterData) {
                // console.log("scaleDockerClusterData:\n", scaleDockerClusterData);
                dockerClustersSrv.scaleDockerCluster(scaleDockerClusterData).then(function (result) {
                    $scope.intervalScaleCluster(
                        scaleDockerClusterData.clusterName, scaleDockerClusterData.replicas
                    );
                });
            });
        };

        $scope.rollingUpdateCluster = function () {
            let selectedItems = dockerClustersSrv.selectedClustersData[0];
            let scope = $rootScope.$new();

            scope.projectTypes = [{
                "type": "private",
                "name": "私有仓库"
            }, {
                "type": "public",
                "name": "公有仓库"
            }];

            scope.projects = {private: [], public: []};
            // scope.repos.data = {{projectName1: [repo1, repo2, ...]}, ...}
            scope.repos = {
                harbor: "",
                data: {}
            };
            // scope.tags.data = {repoName1: [], ...}
            scope.tags = {
                harbor: "",
                data: {}
            };

            scope.containers = [];
            _.map(selectedItems.spec.template.spec.containers, function (container) {
                scope.containers.push({
                    containerName: container.name,
                    oldImageName: container.image,
                    newImageName: null
                });
            });
            // console.log("scope.containers:\n", scope.containers);

            scope.rollingUpdateClusterData = {
                oldClusterName: selectedItems.name,
                newClusterName: null,
                container: scope.containers[0],
                newImage: {
                    projectType: "private",
                    project: {
                        name: "",
                        id: ""
                    },
                    repoName: "",
                    tagName: ""
                },
                pollInterval: "3s",
                updatePeriod: "1m0s",
                timeout: "5m0s",
            };

            scope.$watch(function () {
                return $scope.dockerClustersData;
            }, function (dockerClustersData) {
                if (!dockerClustersData) {
                    return;
                }
                scope.existedClusters = [];
                _.forEach(dockerClustersData, function (dockerCluster) {
                    scope.existedClusters.push(dockerCluster["name"]);
                });
            }, true);

            scope.newClusterNameRepeated = function (newClusterName) {
                if (!scope.existedClusters || !newClusterName) {
                    return false;
                }
                for (let i = 0; i < scope.existedClusters.length; i++) {
                    if (scope.existedClusters[i] === newClusterName) {
                        return true;
                    }
                }
                return false;
            };

            scope.generateCompleteImageName = function (container, image) {
                let completeImageName = "";
                if (!scope.repos.harbor) {
                    return completeImageName;
                }
                completeImageName += (scope.repos.harbor + "/");
                if (!image.project.name) {
                    return completeImageName;
                }
                completeImageName += (image.project.name + "/");
                if (!image.repoName) {
                    return completeImageName;
                }
                completeImageName += (image.repoName + ":");
                if (!image.tagName) {
                    return completeImageName;
                }
                completeImageName += image.tagName;
                // set the complete image name.
                container.newImageName = completeImageName;

                return completeImageName.length >= 58 ?
                    completeImageName.slice(0, 57) + " ..." : completeImageName;
            };

            scope.initHarborProjects = function () {
                // get harbor private projects.
                dockerImagesSrv.getHarborProjects(0).then(function (result) {
                    _.forEach(result.data, function (project) {
                        scope.projects.private.push({
                            name: project["name"],
                            id: project["project_id"]
                        });
                    });
                });

                // get harbor public projects.
                dockerImagesSrv.getHarborProjects(1).then(function (result) {
                    _.forEach(result.data, function (project) {
                        scope.projects.public.push({
                            name: project["name"],
                            id: project["project_id"]
                        });
                    });
                });
            };
            scope.initHarborProjects();

            let getRepoObjs = function (project) {
                if (scope.repos.data.hasOwnProperty(project["name"])) {
                    return;
                }
                dockerImagesSrv.getRepositories(project.id).then(function (result) {
                    if (result.status === 0) {
                        scope.repos.harbor = result.data.harbor;
                        scope.repos.data[project.name] = [];
                        _.forEach(result.data.repos, function (repo) {
                            scope.repos.data[project.name].push(repo.split("/")[1]);
                        });
                        // console.log("scope.repos:\n", scope.repos);
                    }
                });
            };

            let getTagObjs = function (project, repoName) {
                if (scope.tags.data.hasOwnProperty(repoName)) {
                    return;
                }
                let encodedRepoName = encodeURIComponent(
                    encodeURIComponent(project.name + "/" + repoName)
                );
                // console.info("project.id: ", project.id);
                // console.info("encodedRepoName: ", encodedRepoName);
                dockerImagesSrv.getRepositoryTags(project.id, encodedRepoName).then(function (result) {
                    if (result.status === 0) {
                        scope.tags.harbor = result.data.harbor;
                        scope.tags.data[repoName] = result.data.tags;
                    }
                });
            };

            scope.$watch(function () {
                return scope.rollingUpdateClusterData.newImage;
            }, function (newImage, _newImage, _scope) {
                // console.log("newImage:\n", newImage);
                // console.log("_newImage:\n", _newImage);
                if (newImage.projectType !== _newImage.projectType) {
                    newImage.project = scope.projects[newImage.projectType][0];
                    getRepoObjs(newImage.project);
                    newImage.repoName = "";
                    newImage.tagName = "";
                }
                if (newImage.project.id !== _newImage.project.id) {
                    getRepoObjs(newImage.project);
                    newImage.repoName = "";
                    newImage.tagName = "";
                }
                if (newImage.repoName !== _newImage.repoName) {
                    if (newImage.project && newImage.repoName) {
                        getTagObjs(newImage.project, newImage.repoName);
                    }
                    newImage.tagName = "";
                }
            }, true);


            let rollingUpdateClusterModel = $uibModal.open({
                animation: true,
                templateUrl: "rollingUpdateCluster.html",
                scope: scope
            });

            return rollingUpdateClusterModel.result.then(function (rollingUpdateClusterData) {
                // console.log("rollingUpdateClusterData:\n", rollingUpdateClusterData);
                // dockerClustersSrv.scaleDockerCluster(rollingUpdateClusterData).then(function (result) {
                //     $scope.intervalScaleCluster(
                //         scaleDockerClusterData.clusterName, scaleDockerClusterData.replicas
                //     );
                // });
            });
        };
    })
    .controller("dockerClusterDetailCtrl", function ($scope, $rootScope, $routeParams, $translate, $uibModal, $interval, $location, clusterchkSrv, dockerClustersSrv,detailFactory,$filter) { 

        $scope.clusterDetailsData = [];
        $scope.$watch(function () {
            return $location.search().id
            // return $routeParams.clusterName;
        }, function (clusterName) {
            if (!clusterName) return
            $scope.clusterName = $location.search().id
            $scope.initData();
            // $scope.animation = clusterName ? "animateIn" : "animateOut";
        });

        $scope.dockerClusters_search_details = {
            globalSearchTerm: ""
        }

        $scope.applyGlobalSearchDetails = function () {
            $scope.tableParams.filter({
                searchTerm: $scope.dockerClusters_search_details.globalSearchTerm
            });
        };

        $scope.initData = function () {
            dockerClustersSrv.getDockerClustersDetail($scope.clusterName).then(function (result) {
                if (!result || result.status !== 0 || result.msg !== "OK") {
                    $scope.clusterDetailsData = [];
                    return;
                }
                $scope.clusterDetailsData = result.data;
                angular.forEach($scope.clusterDetailsData, function (clusterDetail) {
                    console.log(clusterDetail)
                    clusterDetail.name = clusterDetail.metadata.name;
                    clusterDetail.status.start_time = $filter('localDate')(clusterDetail.status.startTime);
                    clusterDetail.searchTerm = [clusterDetail.name,clusterDetail.status.podIP,clusterDetail.status.hostIP,
                        clusterDetail.status.start_time,clusterDetail.status.phase].join('\b')

                });
                // console.log("docker cluster details:\n", $scope.clusterDetailsData);
            });
        };

        // $scope.initData();
        $scope.refresh = function () {
            $scope.dockerClusters_search_details.globalSearchTerm = ""
            $scope.applyGlobalSearchDetails()
            $scope.initData();
        };

        $scope.$watch(function () {
            return $scope.clusterDetailsData;
        }, function (data) {
            clusterchkSrv.doCheck($scope, data);
        }, true);

        $scope.modifyClusterReplicaData = function (ReplicaName,status) {
            if(status == "Running"){
                // console.log("ReplicaName: ", ReplicaName);
                detailFactory.showIt.showReplica = true
                detailFactory.moveTo = true;
                detailFactory.pageTitle.ReplicaTitle = ReplicaName
                detailFactory.ReplicaData = {
                    clusterName: $scope.clusterName,
                    replicaName: ReplicaName
                };
                angular.forEach($scope.clusterDetailsData, function (clusterReplica) {
                    if (clusterReplica.name === ReplicaName) {
                        dockerClustersSrv.selectedClusterReplicaData = clusterReplica;
                    }
                });
            }
        };

        $scope.deleteClusterReplicas = function () {
            $scope.$emit("delete", {
                target: "deleteClusterReplicas",
                msg: "<span>" + $translate.instant("aws.k8s.dockerClusters.confirmDeleteClusterReplica") + "</span>"
            });
        };

        $scope.$on("deleteClusterReplicas", function () {
            let deleteParams = {clusterReplicas: $scope.selectedItems};
            dockerClustersSrv.deleteDockerClusterReplicas(deleteParams).then(function (result) {
                $scope.intervalDeleteReplicas(deleteParams.clusterReplicas);
            });
        });

        $scope.intervalDeleteReplicas = function (deletedClusterReplicas) {
            let intervalPromise = $interval(function () {
                dockerClustersSrv.getDockerClustersDetail($scope.clusterName).then(function (result) {
                    let remained = 0;
                    angular.forEach(result.data, function (clusterDetail) {
                        // the deleted cluster replica
                        if (deletedClusterReplicas.indexOf(clusterDetail.metadata.name) > -1) {
                            remained += 1;
                        }
                    });
                    if (remained === 0) {
                        result.message = $translate.instant("aws.k8s.dockerClusters.deleteClusterReplicaSuccess");
                        $rootScope.$broadcast("alert-success", result);
                        $interval.cancel(intervalPromise);
                    }
                    $scope.refresh();
                })
            }, 1000);
        };
    })
    .controller("dockerClusterReplicaDetailCtrl", function ($scope, $location, $routeParams, $translate, $uibModal, dockerClustersSrv, clusterchkSrv,detailFactory,$filter) {

        $scope.replicaName = detailFactory.ReplicaData.replicaName
        $scope.clusterName = detailFactory.ReplicaData.clusterName
        $scope.clusterName = $scope.replicaName.substr(0, $scope.replicaName.length - 6);
        $scope.clusterReplicaData = null;
        $scope.containers = [];
        $scope.volumes = [];

        // $scope.$watch(function(){
        //     detailFactory.ReplicaData
        // },function(value){
        //     console.log(value)
        //     if(!value) return
        //     $scope.replicaName = value.replicaName
        //     $scope.clusterName = value.clusterName
        //     $scope.clusterName = $scope.replicaName.substr(0, $scope.replicaName.length - 6);
        //     $scope.clusterReplicaData = null;
        //     $scope.containers = [];
        //     $scope.volumes = [];
        // },true)
        // $scope.clusterName = $routeParams.clusterName;
        // $scope.replicaName = $routeParams.replicaName;

        // $scope.$watch(function () {
        //     return $routeParams.replicaName;
        // }, function (replicaName) {
        //     $scope.animation = replicaName ? "animateIn" : "animateOut";
        // });

        $scope.dockerClusters_search_replica = {
            globalSearchTerm:""
        }

        // $scope.dockerClusters_search_volumes = {
        //     globalSearchTerm:""            
        // }

        $scope.applyGlobalSearchReplica = function() {

            $scope.tableParams.filter({
                searchTerm: $scope.dockerClusters_search_replica.globalSearchTerm
            });
        };

        // $scope.applyGlobalSearchVolumes = function() {
        //     $scope.tableParamsVolumes.filter({
        //         searchTerm: $scope.dockerClusters_search_volumes.globalSearchTerm
        //     });
        // };
        // k8s generate `replicaName` using  `clusterName` append '-' & 5 random chars.

        $scope.$watch(function () {
            return dockerClustersSrv.selectedClusterReplicaData;
        }, function (clusterReplicaData) {
            // if refreshing this page, $scope.clusterReplicaData will be null.
            // because this page's data is passed from last page `dockerClusterDetail`.
            // so, we need to send requests to get data in this situation.
            if (!clusterReplicaData) {
                // console.info("You have refreshed this page!");
                dockerClustersSrv.getDockerClustersDetail($scope.clusterName).then(function (result) {
                    if (result.status === 0 && result.msg === "OK") {
                        angular.forEach(result.data, function (clusterReplica) {
                            clusterReplica.name = clusterReplica.metadata.name;
                            if (clusterReplica.name === $scope.replicaName) {
                                dockerClustersSrv.selectedClusterReplicaData = clusterReplica;
                                $scope.initData(clusterReplica);
                            }
                        });
                    }
                });
            } else {
                $scope.initData(clusterReplicaData);
            }
        }, true);

        $scope.initData = function (clusterReplicaData) {
            $scope.clusterDetailsData = clusterReplicaData;
            $scope.initContainersData(clusterReplicaData);
            $scope.initVolumesData(clusterReplicaData);
        };

        $scope.initContainersData = function (clusterData) {
            $scope.containers = [];
            angular.forEach(clusterData.spec.containers, function (containerData) {
                angular.forEach(clusterData.status.containerStatuses, function (containerStaus) {
                    if (containerStaus.name === containerData.name) {
                        containerData.status = containerStaus;
                        containerData.hostIP = clusterData.status.hostIP;
                        containerData.podID = clusterData.metadata.uid;
                    }
                });
                containerData.status.state.running.started_at = $filter('localDate')(containerData.status.state.running.startedAt);
                containerData.searchTerm = [containerData.name,containerData.image,containerData.status.restartCount,containerData.status.state.running.started_at].join('\b')

                $scope.containers.push(containerData);
            });
            // console.log("containersData:\n", $scope.containers);

            clusterchkSrv.doCheck($scope, $scope.containers);
        };

        $scope.initVolumesData = function (clusterData) {
            $scope.volumes = [];
            angular.forEach(clusterData.spec.volumes, function (volume) {
                // keep the volumes using rbd only.
                if (Object.keys(volume).indexOf("rbd") !== -1) {
                    volume.searchTerm = [volume.name,volume.rbd.image,volume.rbd.fsType,volume.rbd.pool,volume.rbd.user].join('\b')
                    $scope.volumes.push(volume);
                }
            });
            // console.log("volumesData:\n", $scope.volumes);
        };

        $scope.modifyContainerData = function (containerName) {

            detailFactory.moveToLeft = true;
            detailFactory.containerData = {
                replicaName: $scope.replicaName,
                clusterName: $scope.clusterName,
                containerName: containerName
            }
            detailFactory.showIt.showContainer = true
            detailFactory.pageTitle.containerTitle = containerName
            angular.forEach($scope.containers, function (container) {
                if (container.name === containerName) {
                    dockerClustersSrv.selectedContainerData = container;
                }
            });
        }
        $scope.refresh = function(){
            $scope.dockerClusters_search_replica.globalSearchTerm = ""

            $scope.applyGlobalSearchReplica()
            // $scope.dockerClusters_search_volumes.globalSearchTerm = ""
            // $scope.initContainersData(clusterReplicaData);
            dockerClustersSrv.getDockerClustersDetail($scope.clusterName).then(function (result) {
                if (result.status === 0 && result.msg === "OK") {
                    angular.forEach(result.data, function (clusterReplica) {
                        clusterReplica.name = clusterReplica.metadata.name;
                        if (clusterReplica.name === $scope.replicaName) {
                            dockerClustersSrv.selectedClusterReplicaData = clusterReplica;
                            $scope.initData(clusterReplica);
                        }
                    });
                }
            });
        }
    })
    .controller("dockerContainerDetailCtrl", function ($scope, $routeParams, $location, dockerClustersSrv, detailFactory) {
        $scope.$watch(function () {
            return detailFactory.containerData
        }, function (value) {
            if (!value) return;
            $scope.clusterName = value.clusterName;
            $scope.replicaName = value.replicaName;
            $scope.containerName = value.containerName;
            $scope.envs = [];
            $scope.ports = [];
            $scope.volumes = [];
            // console.log($scope.clusterName,$scope.replicaName,$scope.containerName)
            $scope.getLogs();
        }, true);

        $scope.$watch(function () {
            return dockerClustersSrv.selectedContainerData;
        }, function (containerData) {
            if (!containerData) {
                // console.info("You have refreshed this page!");
                dockerClustersSrv.getDockerClustersDetail($scope.clusterName).then(function (result) {
                    angular.forEach(result.data, function (clusterReplica) {
                        // console.log("clusterReplica:\n", clusterReplica);
                        clusterReplica.name = clusterReplica.metadata.name;
                        if (clusterReplica.name === $scope.replicaName) {
                            angular.forEach(clusterReplica.spec.containers, function (container) {
                                if (container.name === $scope.containerName) {
                                    angular.forEach(clusterReplica.status.containerStatuses, function (containerStatus) {
                                        if (containerStatus.name === $scope.containerName) {
                                            container.status = containerStatus;
                                            container.hostIP = clusterReplica.status.hostIP;
                                            container.podID = clusterReplica.metadata.uid;
                                        }
                                    });
                                    dockerClustersSrv.selectedContainerData = container;
                                }
                            });
                        }
                    });
                });
            } else {
                // console.log("selectedContainerData: \n", dockerClustersSrv.selectedContainerData);
                let container = dockerClustersSrv.selectedContainerData;
                $scope.envs = container.env;
                $scope.ports = container.ports;
                $scope.volumes = container.volumeMounts;
                angular.forEach($scope.volumes, function (volume) {
                    if (volume.name.indexOf("default-token-") !== -1 ||
                        volume.name.indexOf("localtime") !== -1) {
                        // hide the default `serviceAccount` columeMounts in the frontend page.
                        $scope.volumes.splice($scope.volumes.indexOf(volume), 1);
                    }
                });
            }
        }, true);

        $scope.ready = false;
        $scope.$watch(function () {
            return dockerClustersSrv.selectedContainerData;
        }, function (containerData) {
            if (containerData != null) {
                $scope.ready = containerData.status.ready;
            }
        }, true);

        $scope.getLogs = function () {
            if ($scope.replicaName && $scope.containerName) {
                dockerClustersSrv.getDockerContainerLogs($scope.replicaName, $scope.containerName)
                    .then(function (result) {
                        if (result && result.data) {
                            $scope.containerLogs = result.data.reverse().join("\n");
                            // console.log("containerLogs:\n", $scope.containerLogs);
                        }
                    });
            }
        };

        $scope.refreshLogs = function () {
            $scope.getLogs();
        };

        $scope.setMonitorFlag = function (startMonitor) {
            $scope.startMonitor = startMonitor;
            dockerClustersSrv.startMonitor = startMonitor;
        };

    })
    .controller("containerMonitorCtrl", function ($scope, $interval, $timeout, dockerClustersSrv, detailFactory) {
        $scope.cpuStats = {
            timestamp: [],
            usage: []
        };

        $scope.memoryStats = {
            timestamp: [],
            usage: {
                total: [],
                swap: [],
                cache: []
            }
        };

        let stopMonitoring = function (promise) {
            if (promise) {
                console.info("stop monitoring...");
                $interval.cancel(promise);
            }
        };

        $scope.$watch(function () {
            return dockerClustersSrv.startMonitor;
        }, function (startMonitor) {
            $scope.startMonitor = startMonitor;
            if (startMonitor) {

                $scope.intervalPromise = null;
                $scope.hostIP = dockerClustersSrv.selectedContainerData.hostIP;
                $scope.podID = dockerClustersSrv.selectedContainerData.podID;
                $scope.containerID = dockerClustersSrv.selectedContainerData.status.containerID.slice(9);
                // init monitoring data.
                getMonitorStats();

                $scope.intervalPromise = $interval(function () {

                    if (!dockerClustersSrv.startMonitor) {
                        stopMonitoring($scope.intervalPromise);
                    }
                    $scope.cpuConfig.dataLoaded = false;
                    $scope.memoryConfig.dataLoaded = false;
                    $timeout(function () {
                        getMonitorStats();
                        $scope.cpuOption.series[0].data = $scope.cpuStats.usage;
                        $scope.cpuOption.title.text = "CPU Usage(cores)";
                        $scope.cpuConfig.dataLoaded = true;

                        $scope.memoryOption.series[0].data = $scope.memoryStats.usage.total;
                        $scope.memoryOption.series[1].data = $scope.memoryStats.usage.cache;
                        $scope.memoryOption.series[2].data = $scope.memoryStats.usage.swap;
                        $scope.memoryOption.title.text = "Memory Usage(MB)";
                        $scope.memoryConfig.dataLoaded = true;
                    }, 1000);
                }, 20000);
            } else {
                stopMonitoring($scope.intervalPromise);
            }
        });

        let strToTimestamp = function (timestampStr) {
            return {
                seconds: Math.floor(Date.parse(timestampStr) / 1000),
                nanoseconds: parseInt(timestampStr.match(/.*\.(\d+)\+.*/)[1])
            }
        };

        let getDiffNanoseconds = function (startTimeStr, endTimeStr) {
            let startTimestamp = strToTimestamp(startTimeStr);
            let endTimestamp = strToTimestamp(endTimeStr);

            let diffNanoseconds = endTimestamp.nanoseconds - startTimestamp.nanoseconds;
            let diffSeconds = endTimestamp.seconds - startTimestamp.seconds;
            return diffSeconds * Math.pow(10, 9) + diffNanoseconds;
        };

        let showMemoryForHuman = function (bytes, si) {
            let thresh = si ? 1000 : 1024;
            if (Math.abs(bytes) < thresh) {
                return bytes + " B";
            }
            let units = si
                ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
                : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
            let u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while (Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(1) + " " + units[u];
        };

        let getMonitorStats = function () {
            dockerClustersSrv.getDockerContainerStats($scope.hostIP, $scope.podID, $scope.containerID).then(function (result) {
                $scope.cpuStats.timestamp = [];
                $scope.cpuStats.usage = [];
                $scope.memoryStats.timestamp = [];
                $scope.memoryStats.usage = {
                    total: [],
                    swap: [],
                    cache: []
                };
                if (!result || result.status !== 0) {
                    return;
                }

                // How to calculate CPU usage in percentage?
                // see: https://github.com/google/cadvisor/issues/832
                let totalCores = result.data[0].cpu.usage.per_cpu_usage.length;
                let size = result.data.length;
                for (let i = 1; i < size; i++) {
                    let startCPUUsage = result.data[i - 1].cpu.usage;
                    let endCPUUsage = result.data[i].cpu.usage;
                    let diffNanoseconds = getDiffNanoseconds(
                        result.data[i - 1].timestamp,
                        result.data[i].timestamp
                    );

                    let currentTimestamp = result.data[i].timestamp.match(/.*T(.*)\..*/)[1];
                    $scope.cpuStats.timestamp.push(currentTimestamp);
                    $scope.cpuStats.usage.push(
                        (endCPUUsage.total - startCPUUsage.total) / diffNanoseconds / totalCores * 10
                    );

                    // memory monitor
                    let currentMemoryStat = result.data[i].memory;
                    $scope.memoryStats.timestamp.push(currentTimestamp);
                    $scope.memoryStats.usage.total.push(currentMemoryStat.usage / Math.pow(2, 20));
                    $scope.memoryStats.usage.cache.push(currentMemoryStat.cache / Math.pow(2, 20));
                    $scope.memoryStats.usage.swap.push(currentMemoryStat.swap / Math.pow(2, 20));
                }
                // console.log("$scope.cpuStats:\n", $scope.cpuStats);
                // console.log("$scope.memoryStats:\n", $scope.memoryStats);
            });
        };

        $scope.cpuConfig = {
            theme: "default",
            dataLoaded: true
        };

        $scope.$watch(function () {
            return $scope.cpuStats;
        }, function (cpuStats) {
            $scope.cpuOption = {
                title: {
                    text: "CPU Usage(cores)",
                },
                tooltip: {
                    trigger: "axis"
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        magicType: {show: true, type: ["line", "bar"]},
                        saveAsImage: {show: true}
                    }
                },
                calculable: true,
                xAxis: [
                    {
                        type: "category",
                        data: cpuStats.timestamp,
                        boundaryGap: true
                    }
                ],
                yAxis: [
                    {
                        type: "value",
                        axisLabel: {
                            formatter: "{value}"
                        }
                    }
                ],
                series: [
                    {
                        name: "total",
                        type: "line",
                        smooth: true,
                        data: cpuStats.usage,
                    }
                ]
            };
        }, true);

        $scope.memoryConfig = {
            theme: "default",
            dataLoaded: true
        };

        $scope.$watch(function () {
            return $scope.memoryStats;
        }, function (memoryStats) {
            $scope.memoryOption = {
                title: {
                    text: "Memory Usage(MB)",
                },
                tooltip: {
                    trigger: "axis"
                },
                toolbox: {
                    show: true,
                    feature: {
                        mark: {show: true},
                        magicType: {show: true, type: ["line", "bar"]},
                        saveAsImage: {show: true}
                    }
                },
                calculable: true,
                xAxis: [
                    {
                        type: "category",
                        data: memoryStats.timestamp,
                        boundaryGap: true
                    }
                ],
                yAxis: [
                    {
                        type: "value",
                        axisLabel: {
                            formatter: "{value}"
                        }
                    }
                ],
                series: [
                    {
                        name: "total",
                        type: "line",
                        smooth: true,
                        data: memoryStats.usage.total,
                    }, {
                        name: "cache",
                        type: "line",
                        smooth: true,
                        data: memoryStats.usage.cache,
                    }, {
                        name: "swap",
                        type: "line",
                        smooth: true,
                        data: memoryStats.usage.swap,
                    }
                ]
            };
        }, true);
    })
    .factory('detailFactory', function () {
        var DetailData = {
            ReplicaData: {},
            containerData: {},
            showIt: {
                showReplica: false,
                showContainer: false
            },
            moveTo: false,
            moveToLeft: false,
            pageTitle: {
                clustersTitle: "",
                ReplicaTitle: "",
                containerTitle: ""
            }
        }
        return DetailData
    });
